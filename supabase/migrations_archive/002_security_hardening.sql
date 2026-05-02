-- Migration 002: Security Hardening
-- Phase 1 of beep-get full refactoring
-- Adds: UNIQUE/CHECK constraints, friend-based RLS, RPC functions

-- ============================================================
-- 1. Cleanup duplicate status_broadcasts (before UNIQUE constraint)
-- ============================================================
DELETE FROM status_broadcasts a
USING status_broadcasts b
WHERE a.id < b.id AND a.user_id = b.user_id;

-- ============================================================
-- 2. Schema Constraints
-- ============================================================

-- status_broadcasts: one row per user
ALTER TABLE status_broadcasts
  ADD CONSTRAINT status_broadcasts_user_id_unique UNIQUE(user_id);

-- users.beep_id: must be 8 digits starting with 1-9
ALTER TABLE users
  ADD CONSTRAINT chk_beep_id_format CHECK (beep_id ~ '^[1-9]\d{7}$');

-- messages.number_code: 1-20 digit string
ALTER TABLE messages
  ADD CONSTRAINT chk_number_code_format CHECK (number_code ~ '^\d{1,20}$');

-- ============================================================
-- 3. Missing RLS Policies
-- ============================================================

-- user_icons: INSERT was missing
CREATE POLICY "user_icons_insert" ON user_icons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Friend-based users SELECT (see friends' profiles)
CREATE POLICY "users_select_by_friend" ON users
  FOR SELECT USING (
    id = auth.uid()
    OR id IN (SELECT friend_id FROM friendships WHERE user_id = auth.uid())
  );

-- Friend-based status_broadcasts SELECT
CREATE POLICY "status_select_friends" ON status_broadcasts
  FOR SELECT USING (
    auth.uid() = user_id
    OR user_id IN (SELECT friend_id FROM friendships WHERE user_id = auth.uid())
  );

-- ============================================================
-- 4. RPC Functions
-- ============================================================

-- beep_id lookup: SECURITY DEFINER bypasses RLS for search
CREATE OR REPLACE FUNCTION find_user_by_beep_id(target_beep_id VARCHAR)
RETURNS TABLE(id UUID, beep_id VARCHAR, nickname VARCHAR)
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT id, beep_id, nickname
  FROM users
  WHERE beep_id = target_beep_id
  LIMIT 1;
$$;

-- Atomic profile provisioning: creates user + grants default skin in one transaction
CREATE OR REPLACE FUNCTION create_user_profile(p_nickname VARCHAR, p_beep_id VARCHAR)
RETURNS VARCHAR
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_free_skin_id UUID;
BEGIN
  INSERT INTO users (id, beep_id, nickname)
  VALUES (v_user_id, p_beep_id, p_nickname);

  SELECT id INTO v_free_skin_id
  FROM skins
  WHERE is_free = true
  LIMIT 1;

  IF v_free_skin_id IS NOT NULL THEN
    INSERT INTO user_skins (user_id, skin_id, acquired_type)
    VALUES (v_user_id, v_free_skin_id, 'default');

    UPDATE users SET active_skin_id = v_free_skin_id
    WHERE id = v_user_id;
  END IF;

  RETURN p_beep_id;
END;
$$;

-- NOTE: using(true) policies (users_select_by_beep_id, status_select) are KEPT
-- for backward compatibility. They will be removed in Migration 003 after
-- EAS Update adoption reaches 90%+.

-- Inbound friend ("Added You") seen-tracking.
--
-- Friendship is one-directional: relationships.owner_id is the adder, friend_id
-- is the person who was added. The owner sees their added friends via getFriends
-- (owner_id = me), but the people who added me (friend_id = me) were previously
-- invisible in the app. The Friends tab now surfaces those inbound relationships
-- and the tab bar shows a red dot for unseen ones.
--
-- An inbound friend counts as "unseen" when relationships.created_at is newer
-- than profiles.inbound_seen_at (null inbound_seen_at => everything is unseen).
-- Entering the Friends tab calls mark_inbound_friends_seen() to clear the badge.
--
-- Constraints:
--  * No RLS change needed: relationships_select_participant already allows
--    SELECT where friend_id = auth.uid(), and profiles_select_own_or_related
--    allows joining the inbound owner's profile.
--  * inbound_seen_at is exposed automatically through get_own_profile() (which
--    returns profiles.*), so no RPC change is required for reads.
--  * Direct client UPDATE on profiles is restricted to avatar_url only
--    (20260529113000_tighten_profile_update_surface), so the seen timestamp must
--    be written through this SECURITY DEFINER RPC instead of a table update.

alter table public.profiles
  add column if not exists inbound_seen_at timestamptz;

comment on column public.profiles.inbound_seen_at is
  'Last time the user viewed their inbound friends ("Added You"). Inbound relationships with created_at newer than this are considered unseen. Updated via mark_inbound_friends_seen().';

create or replace function public.mark_inbound_friends_seen()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set inbound_seen_at = now(),
      updated_at = now()
  where id = (select auth.uid());
end;
$$;

comment on function public.mark_inbound_friends_seen() is
  'Marks the caller''s inbound friends as seen by stamping profiles.inbound_seen_at = now(). SECURITY DEFINER because direct profiles UPDATE is limited to avatar_url for authenticated users.';

revoke execute on function public.mark_inbound_friends_seen() from public;
revoke execute on function public.mark_inbound_friends_seen() from anon;
grant execute on function public.mark_inbound_friends_seen() to authenticated;

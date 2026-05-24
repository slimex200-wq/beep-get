-- B2 (security P1): dedupe send-signal-push so a single signal can't be
-- re-invoked to push the receiver repeatedly. An authenticated client
-- (or attacker who got hold of a valid Bearer) could otherwise call the
-- Edge Function N times with the same signalId and flood the receiver +
-- burn Expo push quota.
--
-- Strategy: partial unique index over (signal_id, expo_push_token) for
-- rows already in queued/sent state. 'failed'/'skipped' rows are allowed
-- to repeat (retries, no-token cases). Multi-device users still receive
-- one push per device, but the same (signal, token) pair can't fire twice.
-- The Edge Function will rely on this index to short-circuit on conflict.

create unique index if not exists notification_deliveries_signal_token_active_idx
  on public.notification_deliveries(signal_id, expo_push_token)
  where status in ('queued', 'sent');

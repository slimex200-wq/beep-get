-- Allow concise emoji/status-word signal tokens such as "집중중 🔕".
-- Keep the existing trim, length, one-line, and no-link safety checks.

alter table public.code_presets
drop constraint if exists code_presets_code_format;

alter table public.code_presets
add constraint code_presets_code_format
check (
  char_length(btrim(code)) between 1 and 20
  and code = btrim(code)
  and code !~ '[[:cntrl:]]'
  and code !~* '(https?://|www\.|://)'
);

alter table public.signals
drop constraint if exists signals_code_format;

alter table public.signals
add constraint signals_code_format
check (
  char_length(btrim(code)) between 1 and 20
  and code = btrim(code)
  and code !~ '[[:cntrl:]]'
  and code !~* '(https?://|www\.|://)'
);

-- Allow short text Beep tokens such as "배고픔" or "집중중".
-- The product still stores the token in the existing `code` columns so older
-- signal adapters and widget payloads do not need a shape migration.

alter table public.code_presets
drop constraint if exists code_presets_code_format;

alter table public.code_presets
add constraint code_presets_code_format
check (
  char_length(btrim(code)) between 1 and 20
  and code = btrim(code)
  and code !~ '[\r\n]'
  and code !~* '(https?://|www\.|://)'
  and code ~ '^[0-9A-Za-z가-힣!?+_. -]+$'
);

alter table public.signals
drop constraint if exists signals_code_format;

alter table public.signals
add constraint signals_code_format
check (
  char_length(btrim(code)) between 1 and 20
  and code = btrim(code)
  and code !~ '[\r\n]'
  and code !~* '(https?://|www\.|://)'
  and code ~ '^[0-9A-Za-z가-힣!?+_. -]+$'
);

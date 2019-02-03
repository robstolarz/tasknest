
-- +migrate Up
CREATE ROLE web_anon NOLOGIN;

-- +migrate Down
DROP ROLE web_anon;

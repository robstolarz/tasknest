-- assumes:
-- `CREATE DATABASE tasknest;`
-- `CREATE ROLE ${MY_ROLE} NOINHERIT LOGIN PASSWORD 'some-password';`
GRANT web_anon TO ${MY_ROLE};

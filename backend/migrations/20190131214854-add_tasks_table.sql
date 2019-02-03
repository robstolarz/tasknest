-- +migrate Up
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  parent INTEGER REFERENCES tasks(id)
);
GRANT ALL ON tasks TO web_anon;
GRANT ALL ON tasks_id_seq TO web_anon;

-- +migrate Down
DROP TABLE tasks;


-- +migrate Up
ALTER TABLE tasks DROP CONSTRAINT tasks_parent_fkey;
ALTER TABLE tasks ADD CONSTRAINT tasks_parent_fkey FOREIGN KEY (parent) REFERENCES tasks(id) ON DELETE CASCADE;

-- +migrate Down
ALTER TABLE tasks DROP CONSTRAINT tasks_parent_fkey;
ALTER TABLE tasks ADD CONSTRAINT tasks_parent_fkey FOREIGN KEY (parent) REFERENCES tasks(id);

INSERT INTO tasks (id, title, parent) VALUES
  (1, 'Keep tasks in bulleted list view', NULL),
  (2, 'Display tasks', 1),
  (3, 'Display a nested list of tasks', 2),
  (4, 'Retrieve the nested list of tasks from the backend', 2);
ALTER SEQUENCE tasks_id_seq RESTART WITH 5;

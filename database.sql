--Script para la creacion de base de datos (borrando todo lo anterior)

DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_name TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role_id INTEGER NOT NULL,
  CHECK (email LIKE '%@%' AND email LIKE '%.%' AND LENGTH(email) > 5),
  CHECK (role_id > 0 AND role_id < 4)
);
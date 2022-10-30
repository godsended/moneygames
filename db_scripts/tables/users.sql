CREATE SEQUENCE users_id_seq;

CREATE TABLE IF NOT EXISTS users (
    id integer NOT NULL DEFAULT nextval('users_id_seq') PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL UNIQUE,
    password text NOT NULL,
    action_token text
);

ALTER SEQUENCE users_id_seq
OWNED BY users.id;
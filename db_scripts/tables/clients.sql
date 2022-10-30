CREATE SEQUENCE clients_id_seq;

CREATE TABLE IF NOT EXISTS clients (
    id integer NOT NULL DEFAULT nextval('clients_id_seq') PRIMARY KEY,
    device_id text NOT NULL UNIQUE,
    user_id integer,
    CONSTRAINT fk_user
      FOREIGN KEY(user_id) 
	  REFERENCES users(id)
);

ALTER SEQUENCE clients_id_seq
OWNED BY clients.id;
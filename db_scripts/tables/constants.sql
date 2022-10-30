CREATE SEQUENCE constants_id_seq;

CREATE TABLE IF NOT EXISTS constants (
    id integer NOT NULL DEFAULT nextval('constants_id_seq') PRIMARY KEY,
    name text NOT NULL,
    value text
);

ALTER SEQUENCE constants_id_seq
OWNED BY constants.id;
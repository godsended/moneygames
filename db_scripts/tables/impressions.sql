CREATE SEQUENCE impressions_id_seq;
CREATE TABLE IF NOT EXISTS impressions (
    id integer NOT NULL DEFAULT nextval('impressions_id_seq') PRIMARY KEY,
    client_id integer NOT NULL,
    ads_type text NOT NULL,
    CONSTRAINT fk_client FOREIGN KEY(client_id) REFERENCES clients(id)
);
ALTER SEQUENCE impressions_id_seq OWNED BY impressions.id;
DROP TABLE IF EXISTS users;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    first VARCHAR(255) NOT NULL,
    last VARCHAR(255) NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    secret_code VARCHAR NOT NULL,
    status VARCHAR,
    is_online BOOLEAN,
    image VARCHAR,
    id_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
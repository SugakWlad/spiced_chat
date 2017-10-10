DROP TABLE IF EXISTS messages;

CREATE TABLE messages(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    room VARCHAR NOT NULL,
    subroom VARCHAR,
    message VARCHAR NOT NULL,
    message_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


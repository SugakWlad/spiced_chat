DROP TABLE IF EXISTS private_messages;

CREATE TABLE private_messages(
    id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL,
    recipient_id INT NOT NULL,
    message VARCHAR NOT NULL,
    message_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS events(
    id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
    data JSON,
    CHECK (JSON_VALID(data))
);

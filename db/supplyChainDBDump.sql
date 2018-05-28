CREATE TABLE supply(
    RFID VARCHAR(15) NOT NULL PRIMARY KEY,
    SKU VARCHAR(20) NOT NULL,
    size INT,
    crrntHolder VARCHAR(50),
    timeStampe VARCHAR(35)
);
-- Datenbank erstellen
CREATE DATABASE IF NOT EXISTS TestDB;

DROP TABLE IF EXISTS TestDB.Things;

-- Tabellen erstellen
CREATE TABLE TestDB.Things
(
  id          INTEGER NOT NULL,
  name        VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);


INSERT INTO TestDB.Things VALUES (1, "First Thing");
INSERT INTO TestDB.Things VALUES (2, "Seconds Thing");
INSERT INTO TestDB.Things VALUES (3, "Third Thing");
INSERT INTO TestDB.Things VALUES (4, "Fourth Thing");
INSERT INTO TestDB.Things VALUES (5, "Fifth Thing");

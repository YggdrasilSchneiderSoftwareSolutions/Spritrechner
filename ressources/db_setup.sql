-- Datenbank erstellen
CREATE DATABASE IF NOT EXISTS Spritrechner;

DROP TABLE IF EXISTS Spritrechner.Fahrer;
DROP TABLE IF EXISTS Spritrechner.Fahrzeuge;
DROP TABLE IF EXISTS Spritrechner.Fahrten;

-- Tabellen erstellen
CREATE TABLE Spritrechner.Fahrer
(
  id          VARCHAR(255) NOT NULL UNIQUE,
  email       VARCHAR(255) NOT NULL UNIQUE,
  passwort    VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE Spritrechner.Fahrzeuge
(
  id              INTEGER NOT NULL AUTO_INCREMENT,
  fahrer_id       VARCHAR(255) NOT NULL,
  fahrzeug_name   VARCHAR(255) NOT NULL,
  start_km        DECIMAL(8, 2) NOT NULL,
  end_km          DECIMAL(8, 2) NOT NULL,
  aktiv           CHAR(1),
  PRIMARY KEY (id),
  FOREIGN KEY (fahrer_id) REFERENCES Spritrechner.Fahrer (id)
);

CREATE TABLE Spritrechner.Fahrten
(
  id             INTEGER NOT NULL AUTO_INCREMENT,
  fahrer_id      VARCHAR(255) NOT NULL,
  fahrzeug_name	 VARCHAR(255) NOT NULL,
  start_km       DECIMAL(8, 2) NOT NULL,
  end_km         DECIMAL(8, 2) NOT NULL,
  liter          DECIMAL(5, 2) NOT NULL,
  zeit           TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (fahrer_id) REFERENCES Spritrechner.Fahrer (id)
);

ALTER TABLE Spritrechner.Fahrzeuge
ADD bike CHAR(1);

UPDATE Spritrechner.Fahrzeuge
SET bike = 'N';
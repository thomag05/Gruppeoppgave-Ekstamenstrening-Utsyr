const db = require("better-sqlite3")("")


db.exec(`-- Creator:       MySQL Workbench 8.0.27/ExportSQLite Plugin 0.1.0
-- Author:        simie
-- Caption:       New Model
-- Project:       Name of the project
-- Changed:       2023-04-11 08:35
-- Created:       2023-04-11 08:35
PRAGMA foreign_keys = OFF;

-- Schema: Gruppeoppgave-eksamenstreningDB
ATTACH "Gruppeoppgave-eksamenstreningDB.sdb" AS "Gruppeoppgave-eksamenstreningDB";
BEGIN;
CREATE TABLE "Gruppeoppgave-eksamenstreningDB"."user"(
  "id" INTEGER PRIMARY KEY NOT NULL,
  "name" VARCHAR(45) NOT NULL,
  "PasswordHash" VARCHAR(45) NOT NULL,
  "Level" INTEGER
);
CREATE TABLE "Gruppeoppgave-eksamenstreningDB"."deviceType"(
  "id" INTEGER PRIMARY KEY NOT NULL,
  "name" VARCHAR(45) NOT NULL,
  "imgPath" VARCHAR(45) NOT NULL,
  "beskrivelse" VARCHAR(45) NOT NULL
);
CREATE TABLE "Gruppeoppgave-eksamenstreningDB"."device"(
  "id" INTEGER PRIMARY KEY NOT NULL,
  "Name" VARCHAR(45) NOT NULL,
  "deviceType_id" INTEGER NOT NULL,
  CONSTRAINT "fk_device_deviceType1"
    FOREIGN KEY("deviceType_id")
    REFERENCES "deviceType"("id")
);
CREATE INDEX "Gruppeoppgave-eksamenstreningDB"."device.fk_device_deviceType1_idx" ON "device" ("deviceType_id");
CREATE TABLE "Gruppeoppgave-eksamenstreningDB"."reservastion"(
  "user_id" INTEGER NOT NULL,
  "device_id" INTEGER NOT NULL,
  "accepted" INTEGER NOT NULL,
  "startTime" DATETIME NOT NULL,
  "endTime" DATETIME NOT NULL,
  PRIMARY KEY("user_id","device_id"),
  CONSTRAINT "fk_user_has_device_user"
    FOREIGN KEY("user_id")
    REFERENCES "user"("id"),
  CONSTRAINT "fk_user_has_device_device1"
    FOREIGN KEY("device_id")
    REFERENCES "device"("id")
);
CREATE INDEX "Gruppeoppgave-eksamenstreningDB"."reservastion.fk_user_has_device_device1_idx" ON "reservastion" ("device_id");
CREATE INDEX "Gruppeoppgave-eksamenstreningDB"."reservastion.fk_user_has_device_user_idx" ON "reservastion" ("user_id");
COMMIT;
`)
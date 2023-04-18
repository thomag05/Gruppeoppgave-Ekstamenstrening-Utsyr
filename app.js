const express = require("express");
const session = require("express-session");
const path = require("path");
const hbs = require("hbs");
const db = require("better-sqlite3")("Gruppeoppgave-eksamenstreningDB.sdb");

const app = express();
app.use(express.urlencoded({extended: true}));
const rootpath = path.join(__dirname, "public")
const hbspath = path.join(__dirname, "views/pages")
app.use(express.static(rootpath));
app.set("view engine", hbs);
app.set("views", hbspath)

require('./routes')(app);
require('dotenv').config();

app.use(session({
     secret: process.env.secret,
    resave: false,
    saveUninitialized: false
}))

app.listen("3000", () => {
    console.log("Server listening at http://localhost:3000")
})

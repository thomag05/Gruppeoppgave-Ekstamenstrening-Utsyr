const express = require("express");
const session = require("express-session");
const path = require("path");
const hbs = require("hbs");
const db = require("better-sqlite3")("Gruppeoppgave-eksamenstreningDB.db");

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

const config = {
    user: process.env.DB_user, // better stored in an app setting such as process.env.DB_USER
    password: process.env.DB_PASSWORD, // better stored in an app setting such as process.env.DB_PASSWORD
    server: process.env.DB_server, // better stored in an app setting such as process.env.DB_SERVER
    port: process.env.DB_PORT, // optional, defaults to 1433, better stored in an app setting such as process.env.DB_PORT
    database: process.env.DB_NAME, // better stored in an app setting such as process.env.DB_NAME
    authentication: {
        type: 'default'
    },
    options: {
        encrypt: true
    }
}


app.listen("3000", () => {
    console.log("Server listening at http://localhost:3000")
})

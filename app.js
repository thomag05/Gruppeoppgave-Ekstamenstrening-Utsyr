const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const path = require("path");
const hbs = require("hbs");

const app = express();
const rootpath = path.join(__dirname, "public")
const hbspath = path.join(__dirname, "views")

require('./routes')(app);

app.listen("3000", () => {
    console.log("Server listening at http://localhost:3000")
})

module.exports = function(app){

const db = require("better-sqlite3")("Gruppeoppgave-eksamenstreningDB.sdb");
const bcrypt = require("bcrypt");

app.get("/", (req, res) => {
    res.render("index.html")
})

app.get("/login", (req, res) => {
    res.render("login.hbs")
})

app.get("/registrer", (req ,res) => {
    res.render("registrerBruker.hbs")
})
    
app.post("/login", async (req, res) => {
    try {
      let login = req.body;
      let userData = db.prepare("SELECT * FROM brukere WHERE email = ?").get(login.email);
      if(await bcrypt.compare(login.password, userData.PasswordHash)) {
        req.session.loggedin = true
        req.session.brukerid = userData.id
        if(userData.admin === 1 ) {req.session.isAdmin = true}
        res.redirect("/")
      } else {
        res.redirect("back")
      }
    } catch (err) {
        res.send('<html><body><script>alert("Du har tastet inn feil brukernavn eller passord");window.location.href="/";</script></body></html>');
    }
  });
app.post("/addUser", async (req, res) => {
    let svar = req.body;
    console.log(req.body)
    // let hash = await bcrypt.hash(svar.password, 10)
    // db.prepare("INSERT INTO user (name, email, PasswordHash, admin) VALUES (?,?,?,?)").run(svar.name, svar.email, hash, 0)
    // res.redirect("/login")
    
})

app.post("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("back")
})

}

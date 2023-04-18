module.exports = function(app){


    // app.get("/", (req, res) => {
    //     res.render("index.html")
    // })

    
app.post("/login", async (req, res) => {
    try {
      let login = req.body;
      let userData = db.prepare("SELECT * FROM brukere WHERE email = ?").get(login.email);
      if(await bcrypt.compare(login.password, userData.hash)) {
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

}

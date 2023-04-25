module.exports = function(app){

const db = require("better-sqlite3")("Gruppeoppgave-eksamenstreningDB.db", {verbose: console.log});

const bcrypt = require("bcrypt");

app.get("/", (req, res) => {
    res.redirect("./html/index.html")
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
      let userData = db.prepare("SELECT * FROM user WHERE email = ?").get(login.email);
      if(await bcrypt.compare(login.password, userData.PasswordHash)) {
        req.session.loggedin = true
        req.session.brukerid = userData.id
        if(userData.admin === 1 ) {req.session.isAdmin = true}
        res.redirect("/admin")
      } else {
        res.redirect("/") // legg til elevside her
      }
    } catch (err) {
        console.log(err)
        res.send('<html><body><script>alert("Du har tastet inn feil brukernavn eller passord");window.location.href="/login";</script></body></html>');
   
    }
  });
app.post("/addUser", async (req, res) => {
    let svar = req.body;
    console.log(req.body)
    let hash = await bcrypt.hash(svar.password, 10)
    db.prepare("INSERT INTO user (name, email, PasswordHash, admin) VALUES (?,?,?,?)").run(svar.name, svar.email, hash, 0)
    res.redirect("/login")
    
})

app.post("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("back")
})

app.get("/admin", (req,res)=>{
    //if(req.session.loggedin && req.session.isAdmin){
        users = db.prepare("SELECT * from user").all();
        device = db.prepare(`SELECT device.*, (SELECT count(*) FROM reservastion where reservastion.device_id = device.id and reservastion.accepted=false) as unaprovedreservations, deviceType.*
        FROM device inner join deviceType on device.deviceType_id = deviceType.id;`).all();
        utstyrType = db.prepare("select * from deviceType").all();
        res.render("adminside.hbs", {
            user: users,
            device: device,
            utstyrType: utstyrType
        });
    //}else{
      //res.redirect("back")
    //}

});

app.post("/registrerUtstyr", (req,res)=>{
  svar=req.body
  db.prepare(`INSERT INTO device (Name,deviceType_id)
  VALUES (?,?);`).run(svar.utstyrNavn, svar.utstyrType)
  res.redirect("/admin")
})
app.post("/registrerUtstyrType", (req,res)=>{
  svar=req.body
  db.prepare(`INSERT INTO deviceType (name,imgPath,beskrivelse)
  VALUES (?,?,?);`).run(svar.TypeNavn, svar.BildePath, svar.beskrivelse)
  res.redirect("/admin")
});

}

module.exports = function(app){

const db = require("better-sqlite3")("Gruppeoppgave-eksamenstreningDB.sdb");

app.get("/", (req, res) => {
    res.render("index.html")
})

app.get("/login", (req, res) => {
    res.render("login.hbs")
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

app.post("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("back")
})

app.get("/admin", (req,res)=>{
    //if(req.session.loggedin && req.session.isAdmin){
        users = db.prepare("select * from user").all();
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

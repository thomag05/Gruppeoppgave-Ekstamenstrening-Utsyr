const { response } = require("express");

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

app.get("/brukerside", (req, res) => {
  if (req.session.loggedin === true) {
  res.render("brukerside.hbs")}
  else {
    res.redirect("/login")
  }
})

app.get("/minside", (req, res) => {
  if (req.session.loggedin === true) {
  let userdata = db.prepare("SELECT * FROM user WHERE id = ?").get(req.session.brukerid)
  let device = db.prepare("SELECT * FROM device").get()
  let objekt = {userdata: userdata, device: device}
  console.log(objekt)
  res.render("minside.hbs", objekt)}
  else {
    res.redirect("login")
  }
})
    
app.post("/login", async (req, res) => {
    try {
      let login = req.body;
      let userData = db.prepare("SELECT * FROM user WHERE email = ?").get(login.email);
      if(await bcrypt.compare(login.password, userData.PasswordHash)) {
        req.session.loggedin = true
        req.session.brukerid = userData.id
        console.log(userData.id)
            if(userData.admin === 1 ) {req.session.isAdmin = true
            res.redirect("/admin")}
            
           else {
            res.redirect("/minside")}
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
app.post("/removeUser", (req, res) => {
      db.prepare("DELETE FROM user WHERE id = ?").run(req.session.brukerid)
      req.session.destroy();
      res.send('<html><body><script>alert("Brukeren din har blitt slettet!");window.location.href="/";</script></body></html>');
})

app.post("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("back")
})

app.post("/reservation", (req, res) => {
  let svar = req.body;
  db.prepare("INSERT INTO resvastion (user_id, device_id, startTime, endTime) VALUES (?,?,?,?)").run(req.session.brukerid, svar.id, svar.startdato, svar.sluttdato)
  res.send('<html><body><script>alert("Din forspørsel har blitt sendt til godkjenning");window.location.href="/minside";</script></body></html>');
})


app.get("/admin", (req,res)=>{
    if(req.session.loggedin && req.session.isAdmin){
        users = db.prepare("SELECT * from user").all();
        device = db.prepare(`SELECT device.*, (SELECT count(*) FROM resvastion where resvastion.device_id = device.id and resvastion.accepted=false) as unaprovedreservations, deviceType.*
        FROM device inner join deviceType on device.deviceType_id = deviceType.id;`).all();
        utstyrType = db.prepare("select * from deviceType").all();

        if(users.Level==1){
          users.elevsel=true 
        }else if(users.Level==2){
          users.lerersel=true
        }else if(users.Level==3){
          users.adminsel=true
        }
        res.render("adminside.hbs", {
            user: users,
            device: device,
            utstyrType: utstyrType
        });
    }else{
      res.redirect("back")
    }

});

app.get("/adminDevice", (req,res)=>{
   //if(req.session.loggedin && req.session.isAdmin){
      deviceID = req.query.id
      let Device = db.prepare(`select * from device where id = ?`).get(deviceID);
      let Type = db.prepare(`select * from deviceType where id = ?`).get(deviceID);
      let resvastion =  db.prepare(`select resvastion.*, user.name from resvastion 
      inner join user on resvastion.user_id = user.id
      where device_id = ? and accepted = ?`).all(deviceID, 1);
      let resrvastionReq = db.prepare(`select resvastion.*, user.name from resvastion 
      inner join user on resvastion.user_id = user.id
      where device_id = ? and accepted = ?`).all(deviceID, 0);

      res.render("adminDevice.hbs", {
        Device: Device,
        Type: Type,
        resvastion: resvastion,
        resrvastionReq: resrvastionReq
      })
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

app.post("/opdBrukerRettigheter", (req,res)=>{
  svar =req.body;
  let admin=0
  if(svar.adgang==3){
    admin=1
  }
  db.prepare(`UPDATE user SET admin = ?, Level = ? WHERE id = ?`).run(admin, svar.adgang, svar.id)
  res.redirect("/admin")
});

}

const sql = require("mssql");
const dotenv = require("dotenv").config();
const { response } = require("express");

module.exports = function (app) {
  const config = {
    user: process.env.DB_user, // better stored in an app setting such as process.env.DB_USER
    password: process.env.DB_PASSWORD, // better stored in an app setting such as process.env.DB_PASSWORD
    server: process.env.DB_server, // better stored in an app setting such as process.env.DB_SERVER
    port: 1433, // optional, defaults to 1433, better stored in an app setting such as process.env.DB_PORT
    database: process.env.DB_NAME, // better stored in an app setting such as process.env.DB_NAME
    authentication: {
      type: "default",
    },
    options: {
      encrypt: true,
    },
  };

  const db = require("better-sqlite3")("Gruppeoppgave-eksamenstreningDB.db", {
    verbose: console.log,
  });

  const bcrypt = require("bcrypt");

  app.get("/", (req, res) => {
    res.redirect("./html/index.html");
  });

  app.get("/login", (req, res) => {
    res.render("login.hbs");
  });

  app.get("/registrer", (req, res) => {
    res.render("registrerBruker.hbs");
  });

  app.post("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("back");
  });


  app.get("/adminDevice", (req, res) => {
    //if(req.session.loggedin && req.session.isAdmin){
    deviceID = req.query.id;
    let Device = db.prepare(`select * from device where id = ?`).get(deviceID);
    let Type = db
      .prepare(`select * from deviceType where id = ?`)
      .get(deviceID);
    let resvastion = db
      .prepare(
        `select reservastion.*, user.name from reservastion 
      inner join user on reservastion.user_id = user.id
      where device_id = ? and accepted = ?`
      )
      .all(deviceID, 1);
    let resrvastionReq = db
      .prepare(
        `select reservastion.*, user.name from reservastion 
      inner join user on reservastion.user_id = user.id
      where device_id = ? and accepted = ?`
      )
      .all(deviceID, 0);

    res.render("adminDevice.hbs", {
      Device: Device,
      Type: Type,
      resvastion: resvastion,
      resrvastionReq: resrvastionReq,
    });
    //}else{
    //res.redirect("back")
    //}
  });

  app.post("/registrerUtstyr", (req, res) => {
    svar = req.body;
    db.prepare(
      `INSERT INTO device (Name,deviceType_id)
  VALUES (?,?);`
    ).run(svar.utstyrNavn, svar.utstyrType);
    res.redirect("/admin");
  });
  app.post("/registrerUtstyrType", (req, res) => {
    svar = req.body;
    db.prepare(
      `INSERT INTO deviceType (name,imgPath,beskrivelse)
  VALUES (?,?,?);`
    ).run(svar.TypeNavn, svar.BildePath, svar.beskrivelse);
    res.redirect("/admin");
  });

  app.post("/opdBrukerRettigheter", (req, res) => {
    svar = req.body;
    let admin = 0;
    if (svar.adgang == 3) {
      admin = 1;
    }
    db.prepare(`UPDATE user SET admin = ?, Level = ? WHERE id = ?`).run(
      admin,
      svar.adgang,
      svar.id
    );
    res.redirect("/admin");
  });

  /* - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - */
  // NY DATA FUNKSJONER

  async function connectAndQueryLogin(email) {
    try {
      var poolConnection = await sql.connect(config);

      console.log("Reading rows from the Table...");
      var resultSet = await poolConnection
        .request()
        .query(`SELECT * FROM [user] WHERE email = '` + email + `'`);

      console.log(`${resultSet.recordset.length} rows returned.`);
      poolConnection.close();
      return resultSet.recordset;
    } catch (err) {
      console.error(err.message);
    }
  }
  app.post("/loginNyDB", async (req, res) => {
    try {
      let login = req.body;
      console.log(login);
      let serverInfo = await connectAndQueryLogin(login.email);

      console.log(serverInfo);
      console.log(serverInfo[0].name);

      if (await bcrypt.compare(login.password, serverInfo[0].PasswordHash)) {
        req.session.loggedin = true;
        req.session.brukerid = serverInfo.id;
        if (serverInfo[0].admin === 1) {
          req.session.isAdmin = true;
          res.redirect("/admin");
        } else {
          res.redirect("/");
        }
      }
    } catch (err) {
      console.log(err);
      res.send(
        '<html><body><script>alert("Du har tastet inn feil brukernavn eller passord");window.location.href="/login";</script></body></html>'
      );
    }
  });

  async function connectAndCheckEmail(email) {
    try {
      var poolConnection = await sql.connect(config);

      console.log("Reading rows from the Table...");
      console.log(email);
      var resultSet = await poolConnection
        .request()
        .query(`SELECT * FROM [user] WHERE [email] = '` + email + `' `);

      let ifEmailExist = resultSet.recordset[0].email;

      poolConnection.close();
      return ifEmailExist;
    } catch (err) {
      console.error(err.message);
    }
  }
  async function connectAndRegistertUser(name, email, hash) {
    try {
      var poolConnection = await sql.connect(config);

      console.log("Reading rows from the Table...");
      console.log(name, email, hash);
      var resultSet = await poolConnection.request().query(
        `INSERT INTO [user] 
    ( [name]
    , [email]
    , [PasswordHash]
    , [admin]
    )
    VALUES 
    ( '` +
          name +
          `'
    , '` +
          email +
          `'
    , '` +
          hash +
          `'
    , 0);`
      );
      console.log(resultSet);

      poolConnection.close();
    } catch (err) {
      console.error(err.message);
    }
  }
  app.post("/addUserNyDB", async (req, res) => {
    let svar = req.body;
    console.log(req.body);
    let hashPassword = await bcrypt.hash(svar.password, 10);
    let hashPasswordString = hashPassword.toString();
    console.log(hashPassword);
    console.log(svar.name, svar.email);
    let ifEmailExists = await connectAndCheckEmail(svar.email);
    if (svar.email === ifEmailExists) {
      console.log("Could not register new email since it is already in use");
      res.send(
        '<html><body><script>alert("Denne eposten er allerede i bruk");window.location.href="/registrer";</script></body></html>'
      );
    } else {
      connectAndRegistertUser(svar.name, svar.email, hashPasswordString);
      res.redirect("/login");
    }
  });
  
  app.get("/admin", (req, res) => {
    //if(req.session.loggedin && req.session.isAdmin){
    users = db.prepare("SELECT * from user").all();
    device = db
      .prepare(
        `SELECT device.*, (SELECT count(*) FROM reservastion where reservastion.device_id = device.id and reservastion.accepted=false) as unaprovedreservations, deviceType.*
      FROM device inner join deviceType on device.deviceType_id = deviceType.id;`
      )
      .all();
    utstyrType = db.prepare("select * from deviceType").all();

    if (users.Level == 1) {
      users.elevsel = true;
    } else if (users.Level == 2) {
      users.lerersel = true;
    } else if (users.Level == 3) {
      users.adminsel = true;
    }
    res.render("adminside.hbs", {
      user: users,
      device: device,
      utstyrType: utstyrType,
    });
    //}else{
    //res.redirect("back")
    //}
  });

  async function connectAndGetDevices() {
    try {
      var poolConnection = await sql.connect(config);
      console.log("Reading rows from the Table...");
      var resultSet = await poolConnection
        .request()
        .query(`SELECT * FROM [device]`)
      console.log(resultSet.recordset)

    } catch (err) {
      console.error(err.message);
    }
  }

  app.get("/nyAdmin", async (req, res)  => {

  })



  app.get("/getDevices", async (req,res) => {
    console.log(connectAndGetDevices())
    res.redirect("/")
  })

  async function connectAndGetUser() {
    try {
      var poolConnection = await sql.connect(config);
      console.log("Reading rows from the Table...");
    } catch (err) {
      console.error(err.message);
    }
  }
  async function connectAndGetDeviceType() {
    try {
      var poolConnection = await sql.connect(config);
      console.log("Reading rows from the Table...");
    } catch (err) {
      console.error(err.message);
    }
  }
};

/* - - - - - - - - - - - - - - - - - - - - - - - - -  - - - - - - - - - */
// GAMLE DATA SOM VI IKKE TRENGER

// app.post("/addUser", async (req, res) => {
//   let svar = req.body;
//   console.log(req.body);
//   let hash = await bcrypt.hash(svar.password, 10);
//   db.prepare(
//     "INSERT INTO user (name, email, PasswordHash, admin) VALUES (?,?,?,?)"
//   ).run(svar.name, svar.email, hash, 0);
//   res.redirect("/login");
// });

// app.post("/login", async (req, res) => {
//   try {
//     let login = req.body;
//     //  let serverInfo = connectAndQueryLogin(login.email)
//     let userData = db
//       .prepare("SELECT * FROM user WHERE email = ?")
//       .get(login.email);
//     if (await bcrypt.compare(login.password, userData.PasswordHash)) {
//       req.session.loggedin = true;
//       req.session.brukerid = userData.id;
//       if (userData.admin === 1) {
//         req.session.isAdmin = true;
//         res.redirect("/admin");
//       } else {
//         res.redirect("/"); // legg til elevside her
//       }
//     }
//   } catch (err) {
//     console.log(err);
//     res.send(
//       '<html><body><script>alert("Du har tastet inn feil brukernavn eller passord");window.location.href="/login";</script></body></html>'
//     );
//   }
//   // console.log(serverInfo)
// });

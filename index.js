const { faker } = require('@faker-js/faker'); // faker is an package that is used to generate fake data 
const mysql = require('mysql2');   //  This is the package name for connecting our nodejs to mysql workbench
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const port = 8010;

app.use(express.urlencoded({extended:true}));  // Middleware
app.use(express.json());                       // Middleware for json objects
app.use(express.static(path.join(__dirname,"public")));  // for accessing static files like css
app.use(methodOverride('_method'));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// This connection is used to connect to our databse , we need to give the host name,user,name of the databse that we want to access and the password of our mysql
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'delta_app',
  password: 'atharva2004'
});


let createRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(), // before version 9.1.0, use userName()
    faker.internet.email(),
    faker.internet.password(),
  ];
}

// Here we have inserted a bulk of fake data onto our table user
// let data = [];
// for (let i = 0; i < 100; i++) {
//   data.push(createRandomUser());
// }

app.get("/", (req, res) => {
  let sql = `SELECT COUNT(*) from user`;
  try {
    connection.query(sql, (err, result) => {
      if (err) throw err;
      let count = result[0][`COUNT(*)`];
      res.render("home.ejs",{count});
    });
  } catch (err) {
    console.log(err);
    res.send("Failure");
  }
})

app.get("/users",(req,res)=>{
  let sql = `SELECT * from user`;
  try{
  connection.query(sql,(err,users)=>{
    // console.log(result);
    res.render("user.ejs",{users});
  });
} catch(err){
  console.log(err);
  res.send("something is wrong");
}
})

app.get("/user/:id/edit",(req,res)=>{
  let {id} = req.params;
  let sql = `SELECT * from user WHERE id='${id}'`;
  try{
    connection.query(sql,(err,result)=>{
      // console.log(result);
      let user = result[0];
      res.render("edit.ejs",{user});
    });
  } catch(err){
    console.log(err);
    res.send("something is wrong");
  }
})

// This is for updating the username of the specified ID

app.patch("/user/:id",(req,res)=>{
  let {id} = req.params;// url se id extract hori hai yaha
  let sql = `SELECT * from user WHERE id='${id}'`; //Jiska is ka username change krna hai usko select kiya yaha se
  let { password:formpass,username:name} = req.body; //form mese password and username extract kr rahe yaha
  try{
    connection.query(sql,(err,result)=>{
      // console.log(result);
      let user = result[0]; //sirf lst term i.e id extract kr rhe
      if(formpass != user.password){  // if entered pasword sahi password hai user ka then he wo edit krega
        res.send("wrong password");
      } 
      else {
        let sql1 = `UPDATE user SET username='${name}' WHERE id='${id}'`; //agar sahi user hai so ab update krege ussername;
        connection.query(sql1,(err,result)=>{
          if(err) throw err;
          res.redirect("/users");
        })
      }
    });
  } catch(err){
    console.log(err);
    res.send("something is wrong");
  }
})

app.get("/users/new",(req,res)=>{
  res.render("new.ejs");
})

app.post("/users/new",(req,res)=>{
  let sql = `INSERT into user(id,username,email,password) values (?,?,?,?)`;
  let {id,username,email,password} = req.body;
  console.log(req.body);
  try{
    connection.query(sql,[id,username,email,password],(err,result)=>{
      if(err) throw err;
      res.redirect("/users");
      console.log(result);
    }) 
  }catch(err){
     console.log(err);
  }
})

app.get("/user/:id/delete",(req,res)=>{
  let {id} = req.params;
  let sql = `SELECT * from user WHERE id='${id}'`;
  try{
    connection.query(sql,(err,result)=>{
      // console.log(result);x`x
      let user = result[0];
      res.render("delete.ejs",{user});
      // res.send("success delete");
    });
  } catch(err){
    console.log(err);
    res.send("something is wrong");
  }
})

app.delete("/user/:id",(req,res)=>{
  let {id} = req.params;
  let sql = `SELECT * from user WHERE id='${id}'`;
   let {username:formname,password:formpass} = req.body;
  //  console.log(req.body);
   try{
    connection.query(sql,(err,result)=>{
       let user = result[0];
       if((formname != user.username) && (password != user.password)){
           res.send("wrong user");
       } 
       else{
        let sql1 = `DELETE from user WHERE email='${user.email}'`;
        connection.query(sql1,(err,result)=>{
          if(err) throw err;
          res.redirect("/users");
        })
       }
    })
   } catch(err){
       console.log(err);
   }
})

app.listen(port, (req, res) => {
  console.log(`listening on port:${port}`);
})


// Inserting Data onto the table , we are writing sql command and passing data as an array

// let sql = "INSERT INTO user (id,username,email,password) VALUES ?";
// let users = [["12b","12b_user","12b@gmail.com","12bpass"],
// ["12c","12c_user","12c@gmail.com","12cpass"]];

//   console.log(createRandomUser());
//  connection.query is used to perform the operaton that we want to perform like in this case I have wanted to show the table created in my delta_app named databse

// try {
  //   connection.query(sql, (err, result) => {
    //     if (err) throw err;
    //     let count = result[0];
    //   });
    // } catch (err) {x
    //   console.log(err);
    // }
   
    // connection.end(); // after running node index.js our connection is established and it runs forever so to end it we need to write this line
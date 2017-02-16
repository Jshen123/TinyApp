const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = [{
  randomString :{
           user_id: 1,
           email: "first@email.com",
           password: "1"
         }
}];

// let id = 1;
// function nextId() {
//   id += 1;
//   return id;
// }


// app.get("/u/:shortURL", (req, res) => {
//   let longURL = ;
//   res.redirect(longURL);
// });

app.get("/register", (req,res) => {
  res.render(`urls_register`, users);
});

app.post("/register", (req,res) => {
  for (user of users) {
    if (req.body.email === user.email) {
      res.end("400");
    }
  }
  if (!req.body.email || !req.body.password) {
    res.end("400");
  }

  let randomString = generateRandomString();
  res.cookie("user_id", randomString)
  users[randomString] = {
    user_id: randomString,
    email: req.body.email,
    password: req.body.password
  };
  users.push(users[randomString]);
  res.redirect(`/`);
});

// app.get("/cookies", (req, res) => {
//   let locals = {
//     users: users,
//     cookies : req.cookies["user_id"]
//   };
//   let test = users[locals.cookies].email;
//   res.send(test)
// });

app.post("/login_redirect", (req,res) => {
  res.redirect(`/login`)
});

app.post("/register_redirect", (req,res) => {
  res.redirect(`/register`)
});

app.get("/login", (req,res) => {
  let locals = {
    users: users,
    cookies : req.cookies["user_id"]
  };
  res.render(`urls_login`, locals);
});

app.post("/login", (req,res) => {
  // res.cookie("user_id", req.body.username);
  let locals = {
    users: users,
    cookies : req.cookies["user_id"]
  };

  for (user of users){
    if (!(req.body.email === user.email) || !(req.body.password === user.password)) {
      res.end("400");
    } else {
    // if (!req.body.password === user.password) {
    //   res.status(403);
    // } 
    res.cookie("user_id", user);
    res.redirect(`/`);
    }
  }
});

app.post("/logout", (req,res) => {
  res.clearCookie("user_id");
  res.redirect(`/urls`);
});

app.get("/urls", (req, res) => {
  let locals = { 
    urls: urlDatabase,
    users: users,
    cookies : req.cookies["user_id"]  
  };
  res.render("urls_index", locals);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL; 
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL = urlDatabase[shortURL];
  let urlCombo = {shortURL, longURL}
  res.render("urls_show", urlCombo);
});

app.post("/urls/:id", (req,res) => {
  let shortURL = req.params.id;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/update", (req,res) => {
  let shortURL = req.params.id;
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls`);
});

app.post("/urls/:id/delete", (req,res) => {
  let shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

app.get("/", (req, res) => {
  res.end("Hello!");
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.end("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let randomString = "";
	const randomChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (var i = 0; i < 6; i++) {
		randomString += randomChar.charAt(Math.floor(Math.random() * randomChar.length));
	}  
	return randomString;
};

// function generateId() {
//   id += 1;
//   return id;
// }

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')

const bcrypt = require('bcrypt');


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['session1', 'session2']
}))

app.set("view engine", "ejs");

const urlDatabase = {
  // "b2xVn2":{ 
  //          id: 1,
  //          longURL: "http://www.lighthouselabs.ca"
  // },
};

const users = {
  // "user" :{
  //          user_id: "user_id",
  //          email: "first@email.com",
  //          password: "1"
  // }
};

const filteredDB = {};

app.get("/register", (req,res) => {
  if(req.session.user_id) {
    res.redirect(`/`);
  } else {
    res.status("400");
    res.render(`urls_register`, users);
  }
});

app.post("/register", (req,res) => {
  for (let user in users) {
    if (req.body.email === users[user].email) {
      res.status("400").send("Email already exists. <a href='/register'> back to registration page </a>" );
    }
  }
  if (!req.body.email || !req.body.password) {
    res.status("400").send("Email or password was incorrect.<a href='/register'> back to registration page </a>");
  }
  let randomString = generateRandomString();
  req.session.user_id = randomString
  
  let hashed = bcrypt.hashSync(req.body.password, 10);
  users[randomString] = {
    user_id: randomString,
    email: req.body.email,
    password: hashed
  };
  filteredDB[req.session.user_id] = {};
  res.redirect(`/`);
});

app.get("/login", (req,res) => {
  let locals = {
    users: users,
    cookies : req.session.user_id
  };
  if (!req.session.user_id){
    res.status("200");
    res.render(`urls_login`, locals);
  } else {
    res.redirect(`/`)
  }
});

app.post("/login", (req,res) => {
  function authenticate () {
    for (user in users) {
      if (req.body.email === users[user].email && bcrypt.compareSync(req.body.password, users[user].password)) {
        return true;
      } 
    }
  }; 
  if (authenticate()){
      req.session.user_id = user;
      res.redirect(`/`);
  } else {
    res.status("401").send("Unauthorized");
  }
});

app.post("/logout", (req,res) => {
  req.session = null;
  res.redirect(`/`);
});

app.get("/urls", (req, res) => {
  if (req.session.user_id){ 
    let locals = { 
      urls: filteredDB[req.session.user_id],
      users: users,
      cookies : req.session.user_id  
    };
    res.status(`200`);
    res.render(`user_index`, locals); 
  } else {
    res.status("401").send("Unauthorized Error");
  }
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    id: req.session.user_id,
    longURL: convertPath(req.body.longURL)
  };
  filteredDB[req.session.user_id][shortURL] = {
    id: req.session.user_id,
    longURL: convertPath(req.body.longURL)
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  let locals = { 
    users: users,
    cookies : req.session.user_id  
  };
  if (!req.session.user_id) {
    res.status("401").send("Unauthorized <a href='/login'> Login Here </a>");
  } else {
    res.render("urls_new", locals)
  };
});

app.get("/u/:id", (req, res) => {
  let shortURL = req.params.id;
  if (urlDatabase[shortURL]) {
    let longURL = urlDatabase[shortURL].longURL;
    longURL = convertPath(longURL);
    res.redirect(longURL)
  } else {
    res.status("404").send("Not Found");
  }
});

app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    res.status("401").send("Unauthorized Error");
  } 
  
  let shortURL = req.params.id;

  if (req.session.user_id && urlDatabase[shortURL] && !filteredDB[req.session.user_id][shortURL]) {
    res.status("403").send("Forbidden Error");
  } 

  if (!urlDatabase[shortURL]) {
    res.status("404").send("Not Found");
  } else {

  let longURL = urlDatabase[shortURL].longURL;

  let locals = { 
    users: users,
    cookies : req.session.user_id,
    shortURL: shortURL,
    longURL: longURL  
  };
  
  res.status("200");
  res.render("urls_show", locals);
  }
  
});

app.post("/urls/:id", (req,res) => {
  let shortURL = req.params.id;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/update", (req,res) => {
  let shortURL = req.params.id;
  let longURL = convertPath(req.body.longURL);
  urlDatabase[shortURL].longURL = longURL;
  filteredDB[req.session.user_id][shortURL].longURL = longURL;
  console.log(urlDatabase[shortURL].longURL)
  res.redirect(`/urls`);
})

app.post("/urls/:id/delete", (req,res) => {
  let shortURL = req.params.id;
  delete urlDatabase[shortURL];
  delete filteredDB[req.session.user_id][shortURL];
  res.redirect(`/urls`);
});


app.get("/", (req, res) => {
  if (req.session.user_id){
    res.redirect(`/urls`);
  } else {
    res.redirect(`/login`);
  }
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

// functions 
function generateRandomString() {
  let randomString = "";
	const randomChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (var i = 0; i < 6; i++) {
		randomString += randomChar.charAt(Math.floor(Math.random() * randomChar.length));
	}  
	return randomString;
}

function convertPath(input) {
  let re = /([^https?:\/\/].*\.(?:[a-z]{0,4}$))/i;
  let result = re.exec(input);
  let path = result ? 'https://' + result[0]: 'invalid path';
  return path;
}

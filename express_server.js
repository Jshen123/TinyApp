const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')

const bcrypt = require('bcrypt');

//

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");
app.use(cookieParser());

// const urlDatabase = [{
//   user_id:{ 
//           "b2xVn2": "http://www.lighthouselabs.ca",
//           "9sm5xK": "http://www.google.com"
//   }
// }];

const urlDatabase = {
  // "b2xVn2":{ 
  //          id: 1,
  //          longURL: "http://www.lighthouselabs.ca"
  // },
};

const users = [{
  "user" :{
           user_id: "user_id",
           email: "first@email.com",
           password: "1"
  }
}];

const filteredDB = {};


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
  
  let hashed = bcrypt.hashSync(req.body.password, 10);
  users[randomString] = {
    user_id: randomString,
    email: req.body.email,
    password: hashed
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

  function authenticate () {
    for (user of users) {
      if (req.body.email === user.email && bcrypt.compareSync(req.body.password, user.password)) {
        return true;
      } 
    }
  };
  
  if (authenticate()){
      res.clearCookie("user_id")
      res.cookie("user_id", user);
      res.redirect(`/`);
  } else {
    res.end("400");
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

app.post("/urls", (req, res) => {
  let locals = { 
    urls: urlDatabase,
    users: users,
    cookies : req.cookies["user_id"]  
  };

  // let longURL = req.body.longURL; 
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    id: req.cookies["user_id"],
    longURL: req.body.longURL
  }

  // urlDatabase[shortURL].id = req.cookies["user_id"];
  // urlDatabase[shortURL].longURL = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  let locals = { 
    urls: urlDatabase,
    users: users,
    cookies : req.cookies["user_id"]  
  };

  res.render("urls_new", locals);
});

app.get("/user", (req, res) => {
  if (req.cookies["user_id"]){
    filteredDB[req.cookies["user_id"]];
    for (let url in urlDatabase) {
      if (urlDatabase[url].id === req.cookies["user_id"] ){
        filteredDB[req.cookies["user_id"]] = {
          [url]: {            
            id: req.cookies["user_id"],
            longURL: urlDatabase[url].longURL
          }
        }
      }
    }  
    let locals = { 
      urls: filteredDB[req.cookies["user_id"]],
      users: users,
      cookies : req.cookies["user_id"]  
    };
    res.render(`user_index`, locals); 
  } else {
    res.end("403");
  }
});

app.post("/user/:id/update", (req,res) => {
  let locals = { 
    urls: filteredDB[req.cookies["user_id"]],
    users: users,
    cookies : req.cookies["user_id"]  
  };

  let shortURL = req.params.id;
  let longURL = req.body.longURL;
  filteredDB[shortURL].longURL = longURL;
  res.redirect(`/urls`);
});

app.get("/user/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL = urlDatabase[shortURL].longURL;
  // let urlCombo = {shortURL, longURL}

  let locals = { 
    urls: urlDatabase,
    users: users,
    cookies : req.cookies["user_id"],
    shortURL: shortURL,
    longURL: longURL  
  };

  res.render("urls_show", locals);
});

app.post("/user/:id", (req,res) => {
  let shortURL = req.params.id;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL = urlDatabase[shortURL].longURL;
  // let urlCombo = {shortURL, longURL}

  let locals = { 
    urls: urlDatabase,
    users: users,
    cookies : req.cookies["user_id"],
    shortURL: shortURL,
    longURL: longURL  
  };

  res.render("urls_show", locals);
});

app.post("/urls/:id", (req,res) => {
  let shortURL = req.params.id;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/update", (req,res) => {
  let locals = { 
    urls: urlDatabase,
    users: users,
    cookies : req.cookies["user_id"]  
  };

  let shortURL = req.params.id;
  let longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect(`/user`);
});

app.post("/urls/:id/delete", (req,res) => {
  let locals = { 
    urls: urlDatabase,
    users: users,
    cookies : req.cookies["user_id"]  
  };


  let shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

app.post("/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL = urlDatabase[shortURL].longURL
  res.redirect()
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
  console.log(`TinyApp listening on port ${PORT}!`);
});

function generateRandomString() {
  let randomString = "";
	const randomChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (var i = 0; i < 6; i++) {
		randomString += randomChar.charAt(Math.floor(Math.random() * randomChar.length));
	}  
	return randomString;
};

// app.get("/user", (res, req) => {
//   if (req.cookies["user_id"]){
//     var filteredDB = [];
//     for (let url in urlDatabase) {
//       if (urlDatabase[url].id === req.cookies["user_id"]){
//         filteredDB.push(urlDatabase[url])
//       }
//     }  
//     let locals = { 
//       urls: filteredDB,
//       users: users,
//       cookies : req.cookies["user_id"]  
//     };
//     res.render(`user_index`, locals); 
//   } else {
//     // res.end("403");
//   }
// });

// function generateId() {
//   id += 1;
//   return id;
// }

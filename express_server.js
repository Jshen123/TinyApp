const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')

const bcrypt = require('bcrypt');

//

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
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
    res.end("400").send("Email or password was incorrect.<a href='/register'> back to registration page </a>");
  }

  let randomString = generateRandomString();
  req.session.user_id = randomString
  
  let hashed = bcrypt.hashSync(req.body.password, 10);
  users[randomString] = {
    user_id: randomString,
    email: req.body.email,
    password: hashed
  };
  // users.push(users[randomString]);
  filteredDB[req.session.user_id] = {};
  console.log("empty ", filteredDB);
  res.redirect(`/`);
});

// app.get("/cookies", (req, res) => {
//   let locals = {
//     users: users,
//     cookies : req.session.user_id
//   };
//   let test = users[locals.cookies].email;
//   res.send(test)
// });

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
  // res.cookie("user_id", req.body.username);
  let locals = {
    users: users,
    cookies : req.session.user_id
  };
  function authenticate () {
    for (user in users) {
      if (req.body.email === users[user].email && bcrypt.compareSync(req.body.password, users[user].password)) {
        return true;
      } 
    }
  }; 
  if (authenticate()){
      // req.session.destroy();
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

// app.get("/urls", (req, res) => {
//   let locals = { 
//     urls: urlDatabase,
//     users: users,
//     cookies : req.session.user_id  
//   };
//   if (req.session.user_id) {
//     res.render("urls_index", locals);
//     res.status("200");
//   } else {
//     res.status("401").send("Unauthorized Error");
//   }
// });

app.get("/urls", (req, res) => {
  if (req.session.user_id){
    filteredDB[req.session.user_id];
    for (let url in urlDatabase) {
      if (urlDatabase[url].id === req.session.user_id ){
        filteredDB[req.session.user_id][url] = {
            id: req.session.user_id,
            longURL: urlDatabase[url].longURL
        }
      }
    }  
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
  let locals = { 
    urls: urlDatabase,
    users: users,
    cookies : req.session.user_id  
  };

  // let longURL = req.body.longURL; 
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    id: req.session.user_id,
    longURL: req.body.longURL
  };

  filteredDB[req.session.user_id][shortURL] = {
    id: req.session.user_id,
    longURL: req.body.longURL
  };
  console.log("db ", urlDatabase);
  console.log("filtered ",filteredDB);

  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  let locals = { 
    urls: urlDatabase,
    users: users,
    cookies : req.session.user_id  
  };
  if (!req.session.user_id) {
    res.status("401").send("Unauthorized <a href='/login'> Login Here </a>");
  } else {
    res.render("urls_new", locals)
  };
});

// app.post("/u/:id/update", (req,res) => {
//   let locals = { 
//     urls: filteredDB[req.session.user_id],
//     users: users,
//     cookies : req.session.user_id  
//   };

//   let shortURL = req.params.id;
//   let longURL = req.body.longURL;
//   filteredDB[shortURL].longURL = longURL;
//   res.redirect(`/urls`);
// });

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


// app.post("/u/:id", (req,res) => {
//   let shortURL = req.params.id;
//   res.redirect(`/urls/${shortURL}`);
// });


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
  }

  let longURL = urlDatabase[shortURL].longURL;

  let locals = { 
    urls: urlDatabase,
    users: users,
    cookies : req.session.user_id,
    shortURL: shortURL,
    longURL: longURL  
  };
  
  res.status("200");
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
    cookies : req.session.user_id 
  };
  let shortURL = req.params.id;
  let longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect(`/urls`);
})

app.post("/urls/:id/delete", (req,res) => {
  let locals = { 
    urls: urlDatabase,
    users: users,
    cookies : req.session.user_id 
  };

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
}

function convertPath(path) {
  if (path[0,7] !== "https://") {
    path = "https://" + path;
    return path;
  } else {
    return path
  }
}
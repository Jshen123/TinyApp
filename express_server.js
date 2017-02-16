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

// app.get("/u/:shortURL", (req, res) => {
//   let longURL = ;
//   res.redirect(longURL);
// });


app.post("/login", (req,res) => {
  res.cookie("username", req.body.username);
  res.redirect(`/`);
});

app.post("/logout", (req,res) => {
  res.clearCookie("username");
  res.redirect(`/urls_index`);
});

app.get("/urls", (req, res) => {
  let locals = { 
    urls: urlDatabase,
    username: req.cookies.username  
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

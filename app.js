const express = require("express");
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");

const app = express();

///Map global promise - get rid of the warning
mongoose.Promise = global.Promise;
//connect to mongoose
mongoose
  .connect(
    "mongodb://localhost/vidjot-dev",
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB connected ...."))
  .catch(err => console.log(err));

// Load Idea Model
require("./models/Idea");
const Idea = mongoose.model("ideas");

// Handlebars Middleware
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Method override middleware
app.use(methodOverride("_method"));

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);

app.use(flash());
//global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// Index Route
app.get("/", (req, res) => {
  console.log("GET --> " + req.url);
  const title = "Welcome";
  res.render("index", {
    title: title
  });
});

// About Route
app.get("/about", (req, res) => {
  console.log("GET --> " + req.url);

  res.render("about");
});

// Idea Index Page
app.get("/ideas", (req, res) => {
  console.log("GET --> " + req.url);

  Idea.find({})
    .sort({ date: "desc" })
    .then(ideas => {
      res.render("ideas/index", {
        ideas: ideas
      });
    });
});

// Add Idea Form
app.get("/ideas/add", (req, res) => {
  console.log("GET --> " + req.url);

  res.render("ideas/add");
});

// Edit Idea Form
app.get("/ideas/edit/:id", (req, res) => {
  console.log("GET --> " + req.url);

  Idea.findOne({
    _id: req.params.id
  }).then(idea => {
    res.render("ideas/edit", {
      idea: idea
    });
  });
});

// Process Form
app.post("/ideas", (req, res) => {
  console.log("POST --> " + req.url);

  let errors = [];

  if (!req.body.title) {
    errors.push({ text: "Please add a title" });
  }
  if (!req.body.details) {
    errors.push({ text: "Please add some details" });
  }

  if (errors.length > 0) {
    res.render("ideas/add", {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    });
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details
    };
    new Idea(newUser).save().then(idea => {
      req.flash("success_msg", "Your idea has been successfully Added");
      res.redirect("/ideas");
    });
  }
});

// Edit Form process
app.put("/ideas/:id", (req, res) => {
  console.log("PUT --> " + req.url);

  Idea.findOne({
    _id: req.params.id
  }).then(idea => {
    // new values
    idea.title = req.body.title;
    idea.details = req.body.details;

    idea.save().then(idea => {
      req.flash("success_msg", "Your idea has been successfully Edited");
      res.redirect("/ideas");
    });
  });
});

//Delete idea
app.delete("/ideas/:id", (req, res) => {
  console.log("DELETE --> " + req.url);

  Idea.deleteOne({
    _id: req.params.id
  }).then(() => {
    req.flash("success_msg", "Your idea has been successfully Deleted");
    res.redirect("/ideas");
  });
});
const port = 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

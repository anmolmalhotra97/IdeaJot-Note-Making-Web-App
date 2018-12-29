const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

//Map global promise - get rid of the warning
mongoose.Promise = global.Promise;
//connect to mongoose
mongoose
  .connect(
    "mongodb://localhost/vidjot-dev",
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB connected ...."))
  .catch(err => console.log(err));

//load idea model
require("./models/Idea");
const Idea = mongoose.model("ideas");

//handlebars middle-ware
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//body parser middle ware
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//index route
app.get("/", (req, res) => {
  console.log("GET --> " + req.url);
  const title = "Welcome to VidJot";
  res.render("index", { title: title });
});
app.get("/about", (req, res) => {
  console.log("GET --> " + req.url);
  res.render("about");
});
//idea index page
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
//Add idea form
app.get("/ideas/add", (req, res) => {
  console.log("GET --> " + req.url);
  res.render("ideas/add");
});

//edit idea form
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

//Process form i.e post request
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
      res.redirect("/ideas");
    });
  }
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

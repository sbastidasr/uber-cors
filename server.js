var path = require("path");
var express = require("express");
var cors = require("cors");
var axios = require("axios");
const yelp = require("yelp-fusion");
const fetch = require("node-fetch");
const { URL } = require("url");
const uberURL = "https://api.uber.com/v1.2/estimates/price";
var app = express();
app.use(cors());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// http://localhost:3000/asd?latitude=40.712775&longitude=-74.005973
app.get("/asd", function(req, res) {
  console.log(req.query);
  //  console.log(req.params);

  const headers = {
    "Content-Type": "text/xml",
    Authorization: "Token KeQZeCbDywxkCjWZ43R1fwfWYcOFZPOGKLdvJiN7"
  };

  const options = {
    method: "GET",
    //  body: form,
    headers: headers
  };

  var url = new URL(uberURL);
  Object.keys(req.query).forEach(key =>
    url.searchParams.append(key, req.query[key])
  );

  fetch(url, options)
    .then(response => response.json())
    .then(response => {
      console.log(response);
      res.send(response);
    })
    .catch(e => {
      console.log(e);
    });
});

var staticPath = path.join(__dirname, "/public");
app.use(express.static(staticPath));

app.listen(3000, function() {
  console.log("listening");
});

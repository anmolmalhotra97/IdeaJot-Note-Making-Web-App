if (process.env.NODE_ENV === "production") {
  module.exports = {
    mongoURI: "mongodb://anmol:priya123@ds145574.mlab.com:45574/vidjot-prod"
  };
} else {
  module.exports = {
    mongoURI: "mongodb://localhost/vidjot-dev"
  };
}

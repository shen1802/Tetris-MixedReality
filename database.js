const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  database: "testing",
  user: "root",
  password: "",
  connectTimeout: 2400000
});

connection.connect(function (error) {
  if (error) {
    throw error;
  } else {
    console.log("MySQL Database is connected Successfully");
  }
});

module.exports = connection;

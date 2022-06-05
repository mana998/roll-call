const mysql = require('mysql2');
require('dotenv').config({path: `.env.${process.env.NODE_ENV}`});
const test = process.env.ENV;
const config = {
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: 3306,
  connectionLimit: 10,
  multipleStatements: test === 'test',
};

console.log(config);

const pool = mysql.createPool(config);

module.exports = {
  pool
};

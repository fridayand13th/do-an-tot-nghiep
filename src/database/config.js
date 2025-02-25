const dotenv = require("dotenv");

dotenv.config();

const host = process.env.POSTGRES_HOST || "localhost";
const port = process.env.POSTGRES_PORT || 5432;
const username = process.env.POSTGRES_USERNAME || "postgres";
const password = process.env.POSTGRES_PASSWORD || "postgres";
const database = process.env.DATABASE;
module.exports = {
  development: {
    dialect: "postgres",
    host,
    port,
    username,
    password,
    database,
  },
};

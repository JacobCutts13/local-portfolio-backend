import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

export const pool = new Pool({
  user: "postgres",
  password: process.env.password,
  host: "localhost",
  port: 5432,
  database: "portfolio",
});

import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const myPort: number = process.env.port? parseInt(process.env.port): 5432

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});



// user: process.env.user,
// password: process.env.password,
// host: process.env.host,
// port: myPort,
// database: process.env.dbname,
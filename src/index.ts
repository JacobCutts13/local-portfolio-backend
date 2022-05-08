import express from "express";
import { Client } from "pg";
import cors from "cors";
import { config } from "dotenv";

config();

const herokuSSLSetting = { rejectUnauthorized: false };
const sslSetting = process.env.LOCAL ? false : herokuSSLSetting;
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: sslSetting,
};

const app = express();

//middleware
app.use(cors());
app.use(express.json());

const client = new Client(dbConfig);
client.connect();

const projectKeys = [
  "title",
  "language",
  "summary",
  "description",
  "image",
  "create_date",
  "difficulty",
];

//routes

//create project
app.post("/projects", async (req, res) => {
  console.log(req.body);
  try {
    if (Object.keys(req.body).every((key, i) => key === projectKeys[i])) {
      //check keys are correct and in order
      const queryString =
        "INSERT INTO projects(title, language, summary, description, image, create_date, difficulty) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *";
      const newProject = await client.query(
        queryString,
        Object.values(req.body)
      );
      res.json(newProject.rows[0]);
    } else {
      res.send("invalid project");
    }
  } catch (err) {
    console.error(err);
    res.send("Cannot connect");
  }
});

//get all projects
app.get("/projects", async (req, res) => {
  try {
    const allProjects = await client.query(
      " SELECT * FROM projects JOIN (SELECT project_id, SUM(value) as likes FROM likes GROUP BY project_id) AS project_likes ON id = project_id "
    );
    res.json(allProjects.rows);
  } catch (err) {
    console.error(err);
    res.send("Cannot connect");
  }
});

//get a background sketch
app.get("/projects/background", async (req, res) => {
  try {
    const project = await client.query(
      " SELECT * FROM projects JOIN (SELECT project_id, SUM(value) as likes FROM likes GROUP BY project_id) AS project_likes ON id = project_id WHERE is_background = true ORDER BY RANDOM() LIMIT 1"
    );
    res.json(project.rows);
  } catch (err) {
    console.error(err);
    res.send("Cannot connect");
  }
});

//get a project
app.get<{ project_id: number }, {}, {}>(
  "/projects/:project_id",
  async (req, res) => {
    try {
      const project = await client.query("SELECT * FROM projects WHERE id=$1", [
        req.params.project_id,
      ]);
      res.json(project.rows);
    } catch (err) {
      console.error(err);
      res.send("Cannot connect");
    }
  }
);

//update a project CANT RESOLVE COLUMN CANT BE A VAR
app.put("/projects/:project_id", async (req, res) => {
  console.log(req.body);
  try {
    const [key, value] = Object.entries(req.body)[0];
    if (projectKeys.includes(key)) {
      const projectCurrent = await client.query(
        "SELECT * FROM projects WHERE id=$1",
        [req.params.project_id]
      );
      projectCurrent.rows[0][key] = value; //update the specific key value
      const queryString =
        "UPDATE projects SET title=$2, language=$3, summary=$4, description=$5, image=$6, create_date=$7, difficulty=$8 WHERE id=$1";
      const projectUpdate = await client.query(
        queryString,
        Object.values(projectCurrent.rows[0])
      ); //don't update id column
      res.json(projectUpdate.rows);
    } else {
      res.send("invalid key");
    }
  } catch (err) {
    console.error(err);
    res.send("Cannot connect");
  }
});

//delete a project
app.delete<{ project_id: number }, {}, {}>(
  "/projects/:project_id",
  async (req, res) => {
    try {
      const project = await client.query("DELETE FROM projects WHERE id=$1", [
        req.params.project_id,
      ]);
      res.json(project.rows);
    } catch (err) {
      console.error(err);
      res.send("Cannot connect");
    }
  }
);

//post a like or unlike
app.post<{ project_id: number }, {}, { value: string; user_email?: string }>(
  "/projects/:project_id/likes",
  async (req, res) => {
    try {
      console.log(req.body);
      const userEmail = req.body.user_email ? req.body.user_email : "";
      const queryString =
        "INSERT INTO likes(project_id, value, user_email) VALUES($1,$2,$3) RETURNING *";
      const queryValues = [req.params.project_id, req.body.value, userEmail];
      const newProject = await client.query(queryString, queryValues);
      res.json(newProject.rows[0]);
    } catch (err) {
      console.error(err);
      res.send("Cannot connect");
    }
  }
);

//get a project likes
app.get<{ project_id: number }, {}, {}>(
  "/projects/:project_id/likes",
  async (req, res) => {
    try {
      const project = await client.query(
        "SELECT SUM(value) FROM likes WHERE project_id = $1 GROUP BY project_id",
        [req.params.project_id]
      );
      res.json(project.rows);
    } catch (err) {
      console.error(err);
      res.send("Cannot connect");
    }
  }
);

const PORT_NUMBER = process.env.PORT ?? 5000;

app.listen(PORT_NUMBER, () => {
  console.log("server is listening on port " + PORT_NUMBER);
});

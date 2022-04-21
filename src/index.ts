import express from "express";
import cors from "cors";
import { pool } from "./db";

const app = express();

//middleware
app.use(cors());
app.use(express.json());

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
  try {
    console.log(req.body);
    if (Object.keys(req.body).every((key, i) => key === projectKeys[i])) {
      //check keys are correct and in order
      const queryString =
        "INSERT INTO projects(title, language, summary, description, image, create_date, difficulty) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *";
      const newProject = await pool.query(queryString, Object.values(req.body));
      res.json(newProject.rows[0]);
    } else {
      res.send("invalid project");
    }
  } catch (err) {
    console.error(err);
    res.send("invalid project");
  }
});

//get all projects
app.get("/projects", async (req, res) => {
  try {
    const allProjects = await pool.query("SELECT * FROM projects");
    res.json(allProjects.rows);
  } catch (err) {
    console.error(err);
    res.send("Cannot connect")
  }
});

//get a project
app.get("/projects/:project_id", async (req, res) => {
  try {
    const project = await pool.query("SELECT * FROM projects WHERE id=$1", [
      req.params.project_id,
    ]);
    res.json(project.rows);
  } catch (err) {
    console.error(err);
    res.send("Cannot connect")
  }
});

//update a project CANT RESOLVE COLUMN CANT BE A VAR
app.put("/projects/:project_id", async (req, res) => {
  try {
    const [key, value] = Object.entries(req.body)[0];
    if (projectKeys.includes(key)) {
      const projectCurrent = await pool.query(
        "SELECT * FROM projects WHERE id=$1",
        [req.params.project_id]
      );
      projectCurrent.rows[0][key] = value; //update the specific key value
      const queryString =
        "UPDATE projects SET title=$2, language=$3, summary=$4, description=$5, image=$6, create_date=$7, difficulty=$8 WHERE id=$1";
      const projectUpdate = await pool.query(
        queryString,
        Object.values(projectCurrent.rows[0])
      ); //don't update id column
      res.json(projectUpdate.rows);
    } else {
      res.send("invalid key");
    }
  } catch (err) {
    console.error(err);
    res.send("Cannot connect")
  }
});

//delete a project
app.delete("/projects/:project_id", async (req, res) => {
  try {
    const project = await pool.query("DELETE FROM projects WHERE id=$1", [
      req.params.project_id,
    ]);
    res.json(project.rows);
  } catch (err) {
    console.error(err);
    res.send("Cannot connect")
  }
});

const PORT_NUMBER = process.env.PORT ?? 5000;

app.listen(PORT_NUMBER, () => {
  console.log("server is listening on port " + PORT_NUMBER);
});

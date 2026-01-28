const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));


let tasks = [];
let completedTasks = [];

// Home
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Add task
app.post("/add-task", (req, res) => {
  tasks.push(req.body.task);
  res.redirect("/");
});

// Complete task
app.get("/complete/:index", (req, res) => {
  const index = req.params.index;
  completedTasks.push(tasks[index]);
  tasks.splice(index, 1);
  res.redirect("/");
});

// Summary page
app.get("/summary", (req, res) => {
  const list = completedTasks
    .map((task, i) => `<li>${task}</li>`)
    .join("");

  res.send(`
    <h2>Completed Task Summary</h2>
    <ul>${list || "<p>No tasks completed yet</p>"}</ul>
    <a href="/">Back</a>
  `);
});

// Show tasks
app.get("/tasks", (req, res) => {
  const list = tasks
    .map(
      (task, i) =>
        `<li>${task} 
          <a href="/complete/${i}">✔ Complete</a>
        </li>`
    )
    .join("");

  res.send(`
    <h2>Pending Tasks</h2>
    <ul>${list || "<p>No pending tasks</p>"}</ul>
    <a href="/">Back</a>
  `);
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

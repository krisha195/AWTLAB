const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

let tasks = [];
let completedTasks = [];

const wrap = (title, body) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Task Manager</title>
  <link rel="stylesheet" href="/style.css">
  <style>
    body { max-width: 500px; margin: 3rem auto; padding: 0 1rem; }
  </style>
</head>
<body>
  <h2>${title}</h2>
  ${body}
  <a href="/">← Back</a>
</body>
</html>`;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/add-task", (req, res) => {
  tasks.push(req.body.task);
  res.redirect("/");
});

app.get("/complete/:index", (req, res) => {
  const index = req.params.index;
  completedTasks.push(tasks[index]);
  tasks.splice(index, 1);
  res.redirect("/tasks");
});

app.get("/summary", (req, res) => {
  const list = completedTasks
    .map((task) => `<li>${task}</li>`)
    .join("");

  res.send(wrap("Completed Tasks", `
    <ul>${list || "<p>No tasks completed yet.</p>"}</ul>
  `));
});

app.get("/tasks", (req, res) => {
  const list = tasks
    .map(
      (task, i) =>
        `<li>${task}<a href="/complete/${i}">✔ Complete</a></li>`
    )
    .join("");

  res.send(wrap("Pending Tasks", `
    <ul>${list || "<p>No pending tasks.</p>"}</ul>
  `));
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

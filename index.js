var express = require('express');
var bodyParser = require("body-parser");
var app = express();
const PORT = process.env.PORT || 5050
var startPage = "index.html";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// API routes BEFORE static files
const { viewTasks } = require('./utils/ViewTasksUtil')
app.get('/view-tasks', viewTasks)

const { createTask } = require('./utils/XavierLeeUtil')
app.post('/create-task', createTask)

// Static files AFTER API routes
app.use(express.static("./public"));

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/" + startPage);
})
    
const server = app.listen(PORT, function () {
    console.log(`Project at: http://localhost:${PORT}`);
});
module.exports = { app, server };

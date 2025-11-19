var express = require('express');
var bodyParser = require("body-parser");
var app = express();
const PORT = process.env.PORT || 5050
var startPage = "index.html";

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use(express.static("./public"));

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/" + startPage);
})

const { viewTasks } = require('./utils/ViewTasksUtil')
const { deleteTask } = require('./utils/DeleteTaskUtil')

app.get('/view-tasks', viewTasks)
app.delete('/tasks/:id', deleteTask)
    
server = app.listen(PORT, function () {
    const address = server.address();
    const baseUrl = `http://${address.address == "::" ? 'localhost' :
        address.address}:${address.port}`;
    console.log(`Project at: ${baseUrl}`);
});
module.exports = { app, server };

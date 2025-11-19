const fs = require('fs').promises;
const path = require('path');
const TASKS_FILE = path.join(__dirname, 'tasks.json');

async function deleteTask(req, res) {
    try {
        const taskId = req.params.id;
        
        // Read current tasks
        const data = await fs.readFile(TASKS_FILE, 'utf8');
        let allTasks = JSON.parse(data);
        
        // Find task index
        const taskIndex = allTasks.findIndex(task => task.id === taskId);
        
        // Check if task exists
        if (taskIndex === -1) {
            return res.status(404).json({ error: "Task not found" });
        }
        
        // Remove task from array
        allTasks.splice(taskIndex, 1);
        
        // Write updated tasks back to file
        await fs.writeFile(TASKS_FILE, JSON.stringify(allTasks, null, 2), 'utf8');
        
        return res.status(200).json({ message: "Task deleted successfully" });
        
    } catch (error) {
        // Handle case where file does not exist yet
        if (error.code === 'ENOENT') {
            return res.status(404).json({ error: "Task not found" });
        }
        return res.status(500).json({ error: "Failed to delete task" });
    }
}

module.exports = { deleteTask };
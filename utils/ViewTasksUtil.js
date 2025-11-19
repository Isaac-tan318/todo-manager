const fs = require('fs').promises;
const path = require('path');
const TASKS_FILE = path.join(__dirname, 'tasks.json');
async function viewTasks(req, res) {
    try {
        const data = await fs.readFile(TASKS_FILE, 'utf8');
        const allTasks = JSON.parse(data);
        return res.status(200).json(allTasks);
    } catch (error) {
        // Handle case where file does not exist yet
        if (error.code === 'ENOENT') {
            return res.status(200).json([]); // return empty list if no file
        }
        return res.status(500).json({ message: error.message });
    }
}
module.exports = { viewTasks };
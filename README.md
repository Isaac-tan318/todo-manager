# Task Manager

A full-stack web application for managing tasks with CRUD operations, built with Node.js, Express, and vanilla JavaScript.

## Features

- ✅ **Create Tasks** - Add new tasks with title, description, status, priority, due date, and optional image
- 👁️ **View Tasks** - Display all tasks in a clean, organized card layout
- ✏️ **Update Tasks** - Edit existing task details through an intuitive modal interface
- 🗑️ **Delete Tasks** - Remove tasks with confirmation dialog and comprehensive error handling
- 📷 **Image Upload** - Attach images to tasks for better visual context
- 🎨 **Responsive UI** - Modern, user-friendly interface with modal dialogs

## Tech Stack

**Backend:**
- Node.js
- Express.js v5.1.0
- Multer v2.0.2 (file uploads)
- JSON file-based data persistence

**Frontend:**
- HTML5
- CSS3
- Vanilla JavaScript (XMLHttpRequest)

## Project Structure

```
todo-manager/
├── index.js                 # Main server file with route definitions
├── package.json             # Project dependencies and scripts
├── models/
│   └── Task.js             # Task data model
├── utils/
│   ├── ViewTasksUtil.js    # GET /view-tasks handler
│   ├── XavierLeeUtil.js    # POST /create-task handler
│   ├── IsaacTanUtil.js     # PUT /update-task/:id handler
│   ├── AaronSim.js         # DELETE /delete-task/:id handler
│   ├── tasks.json          # JSON database file
│   └── tasks.template.json # Template for initializing tasks
├── public/
│   ├── index.html          # Main HTML page
│   ├── css/
│   │   └── styles.css      # Application styles
│   └── js/
│       ├── view-task.js    # View tasks frontend logic
│       ├── xavier-lee.js   # Create task frontend logic
│       ├── isaac-tan.js    # Update task frontend logic
│       └── aaron-sim.js    # Delete task frontend logic
└── uploads/                # Directory for uploaded images
```

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Isaac-tan318/todo-manager.git
   cd todo-manager
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## Usage

1. **Start the server:**
   ```bash
   node index.js
   ```
   
   Or with a custom port:
   ```bash
   PORT=3000 node index.js
   ```

2. **Access the application:**
   Open your browser and navigate to:
   ```
   http://localhost:5050
   ```
   (or your custom PORT if specified)

## API Endpoints

### View Tasks
- **GET** `/view-tasks`
- Returns array of all tasks
- Response: `200 OK` with tasks array

### Create Task
- **POST** `/create-task`
- Content-Type: `multipart/form-data`
- Body: `title`, `description`, `status`, `priority`, `dueDate`, `image` (optional)
- Response: `201 Created` with updated tasks array

### Update Task
- **PUT** `/update-task/:id`
- Content-Type: `application/json`
- Body: Task fields to update
- Response: `200 OK` with updated task object
- Error: `404 Not Found` if task doesn't exist

### Delete Task
- **DELETE** `/delete-task/:id`
- Response: `200 OK` with deleted task details
- Error Scenarios:
  - `400 Bad Request` - Missing or invalid task ID
  - `404 Not Found` - Task doesn't exist
  - `500 Internal Server Error` - Database errors

## Error Handling

The application implements comprehensive error handling:

- **Frontend Validation** - Validates required fields before submission
- **Backend Error Responses** - Detailed error messages with appropriate HTTP status codes
- **Network Error Handling** - Graceful handling of connection issues
- **File System Errors** - Handles database file access and permission issues
- **User Feedback** - Clear alert messages for all error scenarios

## Data Persistence

Tasks are stored in `utils/tasks.json` as a JSON array. Each task has the following structure:

```json
{
  "id": "1732352885729898",
  "title": "Sample Task",
  "description": "Task description",
  "status": "To Do",
  "priority": "Medium",
  "dueDate": "2025-11-30",
  "imageUrl": "/uploads/image.jpg"
}
```

## Development Team

This project follows a modular architecture where each team member implements their own feature:
- **View Tasks** - Read functionality
- **Create Tasks** - Create functionality (Xavier Lee)
- **Update Tasks** - Update functionality (Isaac Tan)
- **Delete Tasks** - Delete functionality (Aaron Sim)


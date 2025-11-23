/**
 * DELETE Task Frontend Implementation
 * Handles task deletion with confirmation dialog and error handling
 */

// Attach event listener to tasksList for delete button clicks (event delegation)
document.addEventListener("DOMContentLoaded", function () {
  const tasksList = document.getElementById("tasksList");

  if (tasksList) {
    tasksList.addEventListener("click", function (e) {
      // Check if the clicked element is a delete button
      if (
        e.target.classList.contains("btn-delete") ||
        e.target.closest(".btn-delete")
      ) {
        const deleteBtn = e.target.classList.contains("btn-delete")
          ? e.target
          : e.target.closest(".btn-delete");
        const taskId = deleteBtn.getAttribute("data-id");

        if (taskId) {
          handleDeleteTask(taskId);
        }
      }
    });
  }
});

/**
 * Handle task deletion with confirmation
 * @param {string} taskId - The ID of the task to delete
 */
function handleDeleteTask(taskId) {
  // Get task details for confirmation message
  var request = new XMLHttpRequest();
  request.open("GET", "/view-tasks", true);
  request.setRequestHeader("Content-Type", "application/json");

  request.onload = function () {
    if (request.status >= 200 && request.status < 300) {
      let tasks = [];
      try {
        tasks = JSON.parse(request.responseText || "[]");
      } catch (e) {
        console.error("Failed to parse tasks:", e);
        alert("Error loading task details. Please try again.");
        return;
      }

      const task = tasks.find((t) => t.id === taskId);

      if (task) {
        // Show confirmation dialog with task title
        const confirmed = confirm(
          `Are you sure you want to delete the task:\n\n"${task.title}"?\n\nThis action cannot be undone.`
        );

        if (confirmed) {
          deleteTask(taskId);
        }
      } else {
        alert(`Task not found. It may have already been deleted.`);
        viewTasks(); // Refresh the task list
      }
    } else {
      console.error(`Failed to load task details. Status: ${request.status}`);
      alert("Error loading task details. Please try again.");
    }
  };

  request.onerror = function () {
    console.error("Network error while loading task details.");
    alert("Network error. Please check your connection.");
  };

  request.send();
}

/**
 * Delete task by making DELETE request to backend
 * @param {string} taskId - The ID of the task to delete
 */
function deleteTask(taskId) {
  // Input validation
  if (!taskId || taskId.trim() === "") {
    alert("Invalid task ID. Cannot delete task.");
    return;
  }

  // Validate task ID format (must be numeric)
  if (!/^\d+$/.test(taskId)) {
    alert("Invalid task ID format. Please refresh and try again.");
    return;
  }

  var request = new XMLHttpRequest();
  request.open("DELETE", `/delete-task/${taskId}`, true);
  request.setRequestHeader("Content-Type", "application/json");

  request.onload = function () {
    let responseData = null;

    try {
      responseData = JSON.parse(request.responseText || "{}");
    } catch (e) {
      console.error("Failed to parse response:", e);
    }

    if (request.status === 200) {
      // Success - task deleted
      const taskTitle = responseData.deletedTask
        ? responseData.deletedTask.title
        : "Task";
      alert(`${taskTitle} has been deleted successfully!`);
      viewTasks(); // Refresh the task list
    } else if (request.status === 400) {
      // Bad request - invalid task ID
      const errorMsg =
        responseData.message || "Invalid request. Please try again.";
      alert(`Error: ${errorMsg}`);
      console.error("Bad Request (400):", responseData);
    } else if (request.status === 404) {
      // Not found - task doesn't exist
      const errorMsg = responseData.message || "Task not found.";
      alert(`Error: ${errorMsg}`);
      console.error("Not Found (404):", responseData);
      viewTasks(); // Refresh to show current tasks
    } else if (request.status >= 500) {
      // Server error
      const errorMsg =
        responseData.message || "Server error occurred while deleting task.";
      alert(`Server Error: ${errorMsg}\n\nPlease try again later.`);
      console.error("Server Error (500+):", responseData);
    } else {
      // Other errors
      alert(`Failed to delete task. Server returned status: ${request.status}`);
      console.error(`Unexpected status ${request.status}:`, responseData);
    }
  };

  request.onerror = function () {
    alert(
      "Network error. Unable to connect to the server.\n\nPlease check your connection and try again."
    );
    console.error("Network error while attempting to delete task.");
  };

  request.ontimeout = function () {
    alert(
      "Request timeout. The server took too long to respond.\n\nPlease try again."
    );
    console.error("Timeout while attempting to delete task.");
  };

  // Set a timeout for the request (10 seconds)
  request.timeout = 10000;

  request.send();
}

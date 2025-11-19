function viewTasks() {
    var response = '';
    var request = new XMLHttpRequest();
    request.open('GET', '/view-tasks', true);
    request.setRequestHeader('Content-Type', 'application/json');

    request.onload = function () {
        try {
            response = JSON.parse(request.responseText || "[]");
        } catch (e) {
            console.error("Failed to parse tasks JSON:", e);
            response = [];
        }

        var html = '';
        // Loop through each task 
        for (var i = 0; i < response.length; i++) {
            var task = response[i];
            html += `
    <div class="task-card">
      <div class="task-header">
        <p class="task-title">${task.title}</p>
        <div class="task-actions">
          <button class="btn-edit" data-id="${task.id}">✏️</button>
          <button class="btn-delete" data-id="${task.id}">🗑️</button>
        </div>
      </div>

      <p class="task-desc">${task.description}</p>

      <div class="task-meta">
        <div class="task-status badge ${task.status.replace(/\s+/g, '-').toLowerCase()}">
          ${task.status}
        </div>
        <div class="task-priority badge ${task.priority.toLowerCase()}">
          ${task.priority}
        </div>
        <div class="task-date">
          <i class="calendar-icon">📅</i>
          <span class="date-text">${task.dueDate}</span>
        </div>
      </div>
    </div>
  `;
        }

        var tableContent = document.getElementById('taskList');
        tableContent.innerHTML = html;
        
        // Add event listeners to delete buttons
        var deleteButtons = document.getElementsByClassName('btn-delete');
        for (var i = 0; i < deleteButtons.length; i++) {
            deleteButtons[i].addEventListener('click', function() {
                var taskId = this.getAttribute('data-id');
                deleteTask(taskId);
            });
        }
    };

    request.onerror = function() {
        console.error("Error fetching tasks.");
        var tableContent = document.getElementById('tableContent');
        if (tableContent) {
            tableContent.innerHTML = '<tr><td colspan="7">Failed to load tasks. Please check the server connection.</td></tr>';
        }
    };

    request.send();
}

function deleteTask(taskId) {
    // Show confirmation dialog
    if (confirm('Are you sure you want to delete this task?')) {
        var request = new XMLHttpRequest();
        request.open('DELETE', '/tasks/' + taskId, true);
        request.setRequestHeader('Content-Type', 'application/json');

        request.onload = function() {
            if (request.status === 200) {
                // Task deleted successfully, refresh the task list
                viewTasks();
                alert('Task deleted successfully!');
            } else {
                // Handle error
                try {
                    var errorResponse = JSON.parse(request.responseText);
                    alert('Error: ' + (errorResponse.error || 'Failed to delete task'));
                } catch (e) {
                    alert('Error: Failed to delete task');
                }
            }
        };

        request.onerror = function() {
            alert('Error: Failed to connect to server');
        };

        request.send();
    }
}

// Get modal elements
const modal = document.getElementById('createTaskModal');
const createTaskBtn = document.getElementById('createTaskBtn');
const closeModalBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const createTaskForm = document.getElementById('createTaskForm');

// Open modal when "Create New Task" button is clicked
createTaskBtn.addEventListener('click', function() {
    modal.classList.add('show');
});

// Close modal when X button is clicked
closeModalBtn.addEventListener('click', function() {
    closeModal();
});

// Close modal when Cancel button is clicked
cancelBtn.addEventListener('click', function() {
    closeModal();
});

// Close modal when clicking outside the modal content
window.addEventListener('click', function(event) {
    if (event.target === modal) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.classList.contains('show')) {
        closeModal();
    }
});

// Function to close modal and reset form
function closeModal() {
    modal.classList.remove('show');
    createTaskForm.reset();
}

// Handle form submission
createTaskForm.addEventListener('submit', function(event) {
    event.preventDefault();
    createTask();
});

function createTask() {
    var response = "";
    // Create an object to hold form data
    var jsonData = new Object();
    jsonData.title = document.getElementById("taskTitle").value;
    jsonData.description = document.getElementById("taskDescription").value;
    jsonData.status = document.getElementById("taskStatus").value;
    jsonData.priority = document.getElementById("taskPriority").value;
    jsonData.dueDate = document.getElementById("taskDueDate").value;
    
    // Validate required fields
    if (jsonData.title == "" || jsonData.dueDate == "") {
        alert('Title and Due Date are required!');
        return; // Stop execution if validation fails
    }
    
    // Format the date to "MMM DD, YYYY" format
    jsonData.dueDate = formatDate(jsonData.dueDate);
    
    // Configure the request to POST data to /create-task
    var request = new XMLHttpRequest();
    request.open("POST", "/create-task", true);
    request.setRequestHeader('Content-Type', 'application/json');
    
    // Define what happens when the server responds
    request.onload = function () {
        response = JSON.parse(request.responseText); // Parse JSON response
        console.log(response)
        // If no error message is returned → success
        if (response.message == undefined) {
            alert('Added Task: ' + jsonData.title + '!');
            // Clear form fields after success
            document.getElementById("taskTitle").value = "";
            document.getElementById("taskDescription").value = "";
            document.getElementById("taskStatus").value = "To Do";
            document.getElementById("taskPriority").value = "Medium";
            document.getElementById("taskDueDate").value = "";
            // Close modal
            closeModal();
            // Reload task list
            viewTasks();
        } else {
            // Show error if task could not be added
            alert('Unable to add task!');
        }
    };
    
    // Send the request with JSON-formatted data
    request.send(JSON.stringify(jsonData));
}

// Helper function to format date to "MMM DD, YYYY" format
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

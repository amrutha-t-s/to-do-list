const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const clearBtn = document.getElementById("clearBtn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Initialize app
document.addEventListener("DOMContentLoaded", function () {
  displayTasks();
  updateTaskCount();

  // Add task on Enter key
  taskInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      addTask();
    }
  });

  addBtn.addEventListener("click", addTask);
  clearBtn.addEventListener("click", clearAllTasks);
});

// Add new task
function addTask() {
  const taskText = taskInput.value.trim();

  if (taskText === "") {
    alert("Please enter a task!");
    return;
  }

  const task = {
    id: Date.now(),
    text: taskText,
    completed: false,
  };

  tasks.unshift(task); // Add to beginning
  taskInput.value = "";
  displayTasks();
  updateTaskCount();
  saveTasks();
}

// Display all tasks
function displayTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : ""}`;
    li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""} onchange="toggleTask(${task.id})">
            <span class="task-text">${escapeHtml(task.text)}</span>
            <button class="delete-btn" onclick="deleteTask(${task.id})">×</button>
        `;
    taskList.appendChild(li);
  });
}

// Toggle task completion
function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    displayTasks();
    updateTaskCount();
    saveTasks();
  }
}

// Delete single task
function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  displayTasks();
  updateTaskCount();
  saveTasks();
}

// Clear all tasks
function clearAllTasks() {
  if (tasks.length === 0) return;

  if (confirm("Are you sure you want to delete all tasks?")) {
    tasks = [];
    displayTasks();
    updateTaskCount();
    saveTasks();
  }
}

// Update task counter
function updateTaskCount() {
  const pending = tasks.filter((t) => !t.completed).length;
  taskCount.textContent = `${pending} pending tasks`;
}

// Save to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

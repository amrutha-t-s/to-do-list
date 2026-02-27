const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const clearBtn = document.getElementById("clearBtn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

document.addEventListener("DOMContentLoaded", function () {
  displayTasks();
  updateTaskCount();

  taskInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") addTask();
  });

  addBtn.addEventListener("click", addTask);
  clearBtn.addEventListener("click", clearAllTasks);

  // 🔥 DARK MODE
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    themeToggle.textContent = savedTheme === "dark" ? "☀️" : "🌙";

    themeToggle.addEventListener("click", function () {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      themeToggle.textContent = newTheme === "light" ? "🌙" : "☀️";
    });
  }

  taskInput.focus();

  // 🔥 DRAG & DROP SETUP
  setupDragAndDrop();
});

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

  tasks.unshift(task);
  taskInput.value = "";
  displayTasks();
  updateTaskCount();
  saveTasks();
}

// 🔥 NEW: Drag & Drop Functions
function setupDragAndDrop() {
  taskList.addEventListener("dragstart", handleDragStart);
  taskList.addEventListener("dragend", handleDragEnd);
  taskList.addEventListener("dragover", handleDragOver);
  taskList.addEventListener("drop", handleDrop);
}

function handleDragStart(e) {
  if (!e.target.closest(".task-item")) return;

  e.target.closest(".task-item").classList.add("dragging");
}

function handleDragEnd(e) {
  const item = e.target.closest(".task-item");
  if (item) {
    item.classList.remove("dragging");
  }
}

function handleDragOver(e) {
  e.preventDefault();
  const dragging = document.querySelector(".dragging");
  const afterElement = getDragAfterElement(taskList, e.clientY);

  if (afterElement == null) {
    taskList.appendChild(dragging);
  } else {
    taskList.insertBefore(dragging, afterElement);
  }
}

function handleDrop(e) {
  e.preventDefault();
  updateTaskOrder();
}

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".task-item:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY },
  ).element;
}

function updateTaskOrder() {
  const taskElements = Array.from(taskList.querySelectorAll(".task-item"));
  const newOrder = taskElements.map((el) => {
    const id = parseInt(
      el
        .querySelector("input")
        .getAttribute("onchange")
        .match(/toggleTask\((\d+)\)/)[1],
    );
    return tasks.find((t) => t.id === id);
  });

  tasks = newOrder;
  saveTasks();
}

function displayTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : ""}`;
    li.draggable = true; // 🔥 ENABLE DRAG
    li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""} onchange="toggleTask(${task.id})">
            <span class="task-text">${escapeHtml(task.text)}</span>
            <button class="delete-btn" onclick="deleteTask(${task.id})">×</button>
        `;
    taskList.appendChild(li);
  });
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    displayTasks();
    updateTaskCount();
    saveTasks();
  }
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  displayTasks();
  updateTaskCount();
  saveTasks();
}

function clearAllTasks() {
  if (tasks.length === 0) return;
  if (confirm("Are you sure you want to delete all tasks?")) {
    tasks = [];
    displayTasks();
    updateTaskCount();
    saveTasks();
  }
}

function updateTaskCount() {
  const pending = tasks.filter((t) => !t.completed).length;
  taskCount.textContent = `${pending} pending tasks`;
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

const user = JSON.parse(localStorage.getItem("taskflow-user"));
const tabs = document.querySelectorAll(".tab");
const taskList = document.getElementById("taskList");
const todoCount = document.getElementById("todo-count");
const completedCount = document.getElementById("completed-count");
const archivedCount = document.getElementById("archived-count");
const taskInputWrapper = document.getElementById("taskInputWrapper");
const taskInput = document.getElementById("taskInput");

let activeTab = "todo";
let tasks = JSON.parse(localStorage.getItem("taskflow-tasks")) || [];

if (!user) window.location.href = "login.html";

document.getElementById("username").innerText = user.name;
document.getElementById("avatar").src = `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${user.name}`;
document.getElementById("signOut").onclick = () => {
  localStorage.removeItem("taskflow-user");
  window.location.href = "login.html";
};

document.getElementById("addTask").onclick = () => {
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.push({ id: Date.now(), text, status: "todo", updated: new Date().toLocaleString() });
  localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
  taskInput.value = "";
  renderTasks();
};

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    activeTab = tab.dataset.tab;
    tabs.forEach(t => t.classList.remove("bg-white", "text-black"));
    tab.classList.add("bg-white", "text-black");
    taskInputWrapper.style.display = activeTab === "todo" ? "flex" : "none";
    renderTasks();
  });
});

function renderTasks() {
  const filtered = tasks.filter(task => task.status === activeTab);
  taskList.innerHTML = "";
  todoCount.textContent = tasks.filter(t => t.status === "todo").length;
  completedCount.textContent = tasks.filter(t => t.status === "completed").length;
  archivedCount.textContent = tasks.filter(t => t.status === "archived").length;

  if (filtered.length === 0) {
    taskList.innerHTML = `<p class="text-gray-400 text-center">No tasks in this category.</p>`;
    return;
  }

  filtered.forEach(task => {
    const card = document.createElement("div");
    card.className = "bg-[#1e223f] p-4 rounded-md shadow flex justify-between items-start";

    const left = document.createElement("div");
    left.innerHTML = `<p class="font-medium">${task.text}</p><p class="text-sm text-gray-400 mt-2">Last modified: ${task.updated}</p>`;

    const right = document.createElement("div");
    right.className = "flex gap-2 mt-1 flex-wrap";

    if (task.status === "todo") {
      right.innerHTML = `
        <button class="bg-green-600 text-white px-2 py-1 rounded" onclick="updateStatus(${task.id}, 'completed')">Mark as completed</button>
        <button class="bg-white text-black px-2 py-1 rounded" onclick="updateStatus(${task.id}, 'archived')">Archive</button>
      `;
    } else if (task.status === "completed") {
      right.innerHTML = `
        <button class="bg-blue-600 text-white px-2 py-1 rounded" onclick="updateStatus(${task.id}, 'todo')">Move to Todo</button>
        <button class="bg-white text-black px-2 py-1 rounded" onclick="updateStatus(${task.id}, 'archived')">Archive</button>
      `;
    } else if (task.status === "archived") {
      right.innerHTML = `
        <button class="bg-blue-600 text-white px-2 py-1 rounded" onclick="updateStatus(${task.id}, 'todo')">Move to Todo</button>
        <button class="bg-green-600 text-white px-2 py-1 rounded" onclick="updateStatus(${task.id}, 'completed')">Move to Completed</button>
      `;
    }

    card.appendChild(left);
    card.appendChild(right);
    taskList.appendChild(card);
  });
}

function updateStatus(id, newStatus) {
  tasks = tasks.map(task => task.id === id ? { ...task, status: newStatus, updated: new Date().toLocaleString() } : task);
  localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
  renderTasks();
}

renderTasks(); // initial render

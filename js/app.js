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

if (!user) window.location.href = "index.html";

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("hidden");
  });



tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('bg-white', 'text-black', 'rounded'));
      tab.classList.add('bg-white', 'text-black', 'rounded');
    });
  });

document.getElementById("username").innerText = user.name;
document.getElementById("avatar").src = `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(user.name)}`;
document.getElementById("signOut").onclick = () => {
  localStorage.removeItem("taskflow-user");
  window.location.href = "index.html";
};

// document.getElementById("addTask").onclick = () => {
//   const text = taskInput.value.trim();
//   if (!text) return;

//   tasks.push({ id: Date.now(), text, status: "todo", updated: new Date().toLocaleString() });
//   localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
//   taskInput.value = "";
//   renderTasks();
// };

document.getElementById("addTask").onclick = () => {
  const text = taskInput.value.trim();
  const priority = document.getElementById("prioritySelect").value;

  if (!text) return;

  tasks.push({
    id: Date.now(),
    text,
    status: "todo",
    priority, // 👈 new
    updated: new Date().toLocaleString()
  });

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

async function loadInitialTasksIfNeeded() {
  const priorityLevels = ["low", "medium", "high"];
  if (tasks.length === 0) {
    try {
      const res = await fetch("https://dummyjson.com/todos");
      const data = await res.json();

      const dummyTodos = data.todos.slice(0, 10).map(todo => ({
        id: Date.now() + Math.random(),
        text: todo.todo,
        status: todo.completed ? "completed" : "todo",
        priority: priorityLevels[Math.floor(Math.random() * priorityLevels.length)],

        updated: new Date().toLocaleString()
      }));

      tasks = dummyTodos;
      localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
    } catch (err) {
      console.error("Failed to fetch dummy todos:", err);
    }
  }

  document.getElementById("loadingSpinner").style.display = "none";

  renderTasks();
}

function renderTasks() {
  const searchQuery = document.getElementById("searchInput").value.toLowerCase();
const selectedPriority = document.getElementById("priorityFilter").value;
  tasks = JSON.parse(localStorage.getItem("taskflow-tasks")) || [];

  // const filtered = tasks.filter(task => task.status === activeTab);
  const filtered = tasks.filter(task =>
  task.status === activeTab &&
  task.text.toLowerCase().includes(searchQuery) &&
  (selectedPriority === "all" || task.priority === selectedPriority)
);
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
    
    card.className = "bg-[#1e223f] p-4 rounded-md shadow flex flex-col sm:flex-row justify-between items-start gap-4";


    const left = document.createElement("div");
    left.className = "w-full break-words";

   
let priorityIcon = "";
if (task.priority === "high") priorityIcon = '🔴';
else if (task.priority === "medium") priorityIcon = "🟡";
else if (task.priority === "low") priorityIcon = "🟢";

left.innerHTML = `
  <p class="font-medium flex items-center gap-2">
    <span>${priorityIcon}</span>${task.text}
  </p>
  <p class="text-sm text-gray-400 mt-2">Last modified: ${task.updated}</p>
`;

    const right = document.createElement("div");
    // right.className = "flex gap-2 mt-1 flex-wrap";
    right.className = "flex gap-2 mt-1 flex-wrap justify-start sm:justify-end w-full sm:w-auto";


    if (task.status === "todo") {
      right.innerHTML = `
        <button class="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700" onclick="updateStatus(${task.id}, 'completed')">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15L15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0Z"/>
          </svg>
          Complete
        </button>
        <button class="flex items-center gap-2 bg-slate-100 hover:bg-slate-300  text-black px-3 py-1 rounded" onclick="updateStatus(${task.id}, 'archived')">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 7.5h16.5M10 11.25h4m6.25-3.75-.625 10.63a2.25 2.25 0 01-2.25 2.12H6.63a2.25 2.25 0 01-2.25-2.12L3.75 7.5Z"/>
          </svg>
          Archive
        </button>
      `;
    } else if (task.status === "completed") {
      right.innerHTML = `
        <button class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded" onclick="updateStatus(${task.id}, 'todo')">
          <svg class="w-4 h-4" fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M2,11H8a1,1,0,0,0,1-1V4A1,1,0,0,0,8,3H2A1,1,0,0,0,1,4v6A1,1,0,0,0,2,11ZM3,5H7V9H3ZM23,7a1,1,0,0,1-1,1H12a1,1,0,0,1,0-2H22A1,1,0,0,1,23,7Zm0,10a1,1,0,0,1-1,1H12a1,1,0,0,1,0-2H22A1,1,0,0,1,23,17ZM3.235,19.7,1.281,17.673a1,1,0,0,1,1.438-1.391l1.252,1.3L7.3,14.289A1,1,0,1,1,8.7,15.711l-4.046,4a1,1,0,0,1-.7.289H3.942A1,1,0,0,1,3.235,19.7Z"/>
          </svg>
          Move to Todo
        </button>
        <button class="flex items-center gap-2 bg-slate-100 hover:bg-slate-300 text-black px-3 py-1 rounded" onclick="updateStatus(${task.id}, 'archived')">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 7.5h16.5M10 11.25h4m6.25-3.75-.625 10.63a2.25 2.25 0 01-2.25 2.12H6.63a2.25 2.25 0 01-2.25-2.12L3.75 7.5Z"/>
          </svg>
          Archive
        </button>
      `;
    } else if (task.status === "archived") {
      right.innerHTML = `
        <button class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded" onclick="updateStatus(${task.id}, 'todo')">
          <svg class="w-4 h-4" fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M2,11H8a1,1,0,0,0,1-1V4A1,1,0,0,0,8,3H2A1,1,0,0,0,1,4v6A1,1,0,0,0,2,11ZM3,5H7V9H3ZM23,7a1,1,0,0,1-1,1H12a1,1,0,0,1,0-2H22A1,1,0,0,1,23,7Zm0,10a1,1,0,0,1-1,1H12a1,1,0,0,1,0-2H22A1,1,0,0,1,23,17ZM3.235,19.7,1.281,17.673a1,1,0,0,1,1.438-1.391l1.252,1.3L7.3,14.289A1,1,0,1,1,8.7,15.711l-4.046,4a1,1,0,0,1-.7.289H3.942A1,1,0,0,1,3.235,19.7Z"/>
          </svg>
          Move to Todo
        </button>
        <button class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded" onclick="updateStatus(${task.id}, 'completed')">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
          Move to Completed
        </button>
      `;
    }

    card.appendChild(left);
    card.appendChild(right);
    taskList.appendChild(card);
  });
}

function updateStatus(id, newStatus) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, status: newStatus, updated: new Date().toLocaleString() } : task
  );
  localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
  renderTasks();
}


document.getElementById("exportBtn").addEventListener("click", () => {
  const data = localStorage.getItem("taskflow-tasks");
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "taskflow-tasks.json";
  a.click();

  URL.revokeObjectURL(url);
});

const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");

importBtn.addEventListener("click", () => {
  importFile.click(); 
});

importFile.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const importedTasks = JSON.parse(text);

    if (!Array.isArray(importedTasks)) {
      alert("❌ Invalid file format.");
      return;
    }

    const existingTasks = JSON.parse(localStorage.getItem("taskflow-tasks")) || [];

  
    const mergedTasks = [...existingTasks];

    importedTasks.forEach(task => {
      const exists = existingTasks.some(t => t.id === task.id);
      if (!exists) {
        mergedTasks.push(task);
      }
    });

    localStorage.setItem("taskflow-tasks", JSON.stringify(mergedTasks));
    alert("✅ Tasks merged successfully!");
    location.reload();
  } catch (err) {
    alert("❌ Failed to import file.");
    console.error(err);
  }
});

document.getElementById("searchInput").addEventListener("input", renderTasks);
document.getElementById("priorityFilter").addEventListener("change", renderTasks);



loadInitialTasksIfNeeded();

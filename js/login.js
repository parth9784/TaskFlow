const existingUser = localStorage.getItem("taskflow-user");
if (existingUser) {
  window.location.href = "app.html";
}

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const dob = new Date(document.getElementById("dob").value);
  const error = document.getElementById("error");
  const age = new Date().getFullYear() - dob.getFullYear();

  if (!name || !dob) {
    error.textContent = "All fields are required.";
    return;
  }

  if (age <= 10) {
    error.textContent = "You must be over 10 years old.";
    return;
  }

  localStorage.setItem("taskflow-user", JSON.stringify({ name, dob: dob.toISOString() }));
  window.location.href = "app.html";
});

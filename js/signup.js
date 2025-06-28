document.getElementById("signupForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const dob = new Date(document.getElementById("dob").value);
  const password = document.getElementById("password").value;
  const error = document.getElementById("error");

  const age = new Date().getFullYear() - dob.getFullYear();

  if (!name || !dob || !password) {
    error.textContent = "All fields are required.";
    return;
  }

  if (age <= 10) {
    error.textContent = "You must be over 10 years old.";
    return;
  }

  const user = { name, dob: dob.toISOString(), password };
  localStorage.setItem("taskflow-user", JSON.stringify(user));
  window.location.href = "login.html";
});

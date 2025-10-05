document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const { token } = await res.json();
        localStorage.setItem("token", token);
        window.location.href = "dashboard.html";
      } else {
        alert("Login failed");
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const role = document.getElementById("role").value;
      const rollno = document.getElementById("rollno").value;

      const body = { username, password, role };
      if (role === "student") {
        body.rollno = rollno;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        alert("Registration successful");
        window.location.href = "login.html";
      } else {
        const errorText = await res.text();
        alert(`Registration failed: ${errorText}`);
      }
    });
  }
});

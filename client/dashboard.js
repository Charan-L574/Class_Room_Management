document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const payload = JSON.parse(atob(token.split(".")[1]));
  const role = payload.role;
  const username = payload.username;
  const dashboardContent = document.getElementById("dashboard-content");
  const userInfo = document.getElementById("user-info");

  userInfo.textContent = `Welcome, ${username} (${role})`;

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  if (role === "teacher") {
    const template = document
      .getElementById("teacher-dashboard")
      .content.cloneNode(true);
    dashboardContent.appendChild(template);
    loadAssignments();

    const announcementForm = document.getElementById("announcement-form");
    announcementForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = document.getElementById("announcement-text").value;
      await fetch("/api/announcements", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      document.getElementById("announcement-text").value = "";
    });

    const assignmentForm = document.getElementById("assignment-form");
    assignmentForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("assignment-title").value;
      const description = document.getElementById(
        "assignment-description"
      ).value;
      await fetch("/api/assignments", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      loadAssignments();
      assignmentForm.reset();
    });
  } else if (role === "student") {
    const template = document
      .getElementById("student-dashboard")
      .content.cloneNode(true);
    dashboardContent.appendChild(template);
    loadAnnouncements();
    loadAssignments();
    loadMyGrades();
  } else if (role === "admin") {
    const template = document
      .getElementById("admin-dashboard")
      .content.cloneNode(true);
    dashboardContent.appendChild(template);
    loadUsers();
  }

  // Setup chat for all roles
  setupChat();

  function setupChat() {
    const socket = io();
    const chatInput = document.getElementById("chat-input");
    const sendButton = document.getElementById("send-chat-btn");
    const chatMessages = document.getElementById("chat-messages");
    const room = "class-chat";

    socket.emit("joinRoom", { room });

    sendButton.addEventListener("click", () => {
      const msg = chatInput.value;
      socket.emit("chatMessage", { room, msg: `${username}: ${msg}` });
      chatInput.value = "";
    });

    socket.on("message", (msg) => {
      const div = document.createElement("div");
      div.textContent = msg;
      chatMessages.appendChild(div);
    });
  }

  async function loadUsers() {
    const res = await fetch("/api/admin/users", { headers });
    const users = await res.json();
    const userList = document.getElementById("user-list");
    userList.innerHTML = "";
    users.forEach((user) => {
      const div = document.createElement("div");
      div.innerHTML = `
            <span>${user.username} (${user.role})</span>
            <select id="role-${user._id}">
                <option value="student" ${
                  user.role === "student" ? "selected" : ""
                }>Student</option>
                <option value="teacher" ${
                  user.role === "teacher" ? "selected" : ""
                }>Teacher</option>
                <option value="admin" ${
                  user.role === "admin" ? "selected" : ""
                }>Admin</option>
            </select>
            <button onclick="updateRole('${user._id}')">Update Role</button>
        `;
      userList.appendChild(div);
    });
  }

  window.updateRole = async (userId) => {
    const role = document.getElementById(`role-${userId}`).value;
    await fetch(`/api/admin/users/${userId}/role`, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    loadUsers();
  };

  async function loadMyGrades() {
    const res = await fetch("/api/academics/my-records", { headers });
    const records = await res.json();
    const gradeList = document.getElementById("grade-list");
    if (gradeList) {
      gradeList.innerHTML = "";
      records.grades.forEach((g) => {
        const div = document.createElement("div");
        div.innerHTML = `<p><strong>${g.assignment.title}:</strong> ${g.grade}</p>`;
        gradeList.appendChild(div);
      });
    }
  }

  async function loadAssignments() {
    const res = await fetch("/api/assignments", { headers });
    const assignments = await res.json();
    const assignmentList = document.getElementById("assignment-list");
    assignmentList.innerHTML = "";
    assignments.forEach((assignment) => {
      const div = document.createElement("div");
      div.innerHTML = `<h4>${assignment.title}</h4><p>${assignment.description}</p>`;
      if (role === "student") {
        const form = document.createElement("form");
        form.innerHTML = `
                    <input type="file" name="solution" required>
                    <button type="submit">Submit</button>
                `;
        form.addEventListener("submit", async (e) => {
          e.preventDefault();
          const formData = new FormData(form);
          await fetch(`/api/assignments/${assignment._id}/submit`, {
            method: "POST",
            headers,
            body: formData,
          });
          alert("Submitted!");
        });
        div.appendChild(form);
      } else if (role === "teacher") {
        const submissions = assignment.submissions
          .map((sub) => {
            if (!sub.student)
              return "<div>Submission from a deleted user.</div>"; // Graceful handling
            const filePath = sub.file.replace(/\\/g, "/"); // Normalize path for URL
            return `
                    <div>
                        Student: ${
                          sub.student.username
                        } | <a href="/${filePath}" target="_blank">View Submission</a>
                        <input type="text" id="grade-${
                          sub._id
                        }" placeholder="Grade" value="${sub.grade || ""}">
                        <button onclick="gradeSubmission('${
                          assignment._id
                        }', '${sub._id}')">Grade</button>
                    </div>
                `;
          })
          .join("");
        div.innerHTML += `<h5>Submissions:</h5>${
          submissions || "No submissions yet."
        }`;
      }
      assignmentList.appendChild(div);
    });
  }

  window.gradeSubmission = async (assignmentId, submissionId) => {
    const grade = document.getElementById(`grade-${submissionId}`).value;
    await fetch(`/api/assignments/${assignmentId}/grade`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId, grade }),
    });
    loadAssignments();
  };

  async function loadAnnouncements() {
    const res = await fetch("/api/announcements", { headers });
    const announcements = await res.json();
    const announcementList = document.getElementById("announcement-list");
    announcementList.innerHTML = "";
    announcements.forEach((ann) => {
      const div = document.createElement("div");
      div.innerHTML = `<p><strong>${ann.teacher.username}:</strong> ${ann.text}</p>`;
      announcementList.appendChild(div);
    });
  }
});

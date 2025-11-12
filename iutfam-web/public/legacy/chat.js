const socket = io("http://localhost:4000", { withCredentials: true });
const CHAT_ID = "GENERAL_SINGLETON";
const inputEl = document.getElementById("messageInput");
const typingEl = document.createElement("div");
typingEl.id = "typingIndicator";
typingEl.style.display = "none";
typingEl.classList.add("typing-indicator");
document.querySelector(".chat-container").appendChild(typingEl);

// écoute des updates de frappe
socket.on("typing:update", ({ user, typing }) => {
  const name = user?.displayName || user?.username || user?.id || "Anonyme";
  if (typing) {
    typingEl.textContent = `💬 ${name} est en train d’écrire…`;
    typingEl.style.display = "block";
  } else {
    typingEl.style.display = "none";
    typingEl.textContent = "";
  }
});

// quand on tape dans le champ
inputEl.addEventListener("input", (e) => {
  if ((e.target.value || "").trim().length > 0) {
    socket.emit("typing:start", { chatId: CHAT_ID });
  } else {
    socket.emit("typing:stop", { chatId: CHAT_ID });
  }
});

// ton code existant pour l’envoi des messages reste en dessous
sendBtn.addEventListener("click", () => {
  const content = inputEl.value.trim();
  if (content) {
    socket.emit("message:send", { chatId: CHAT_ID, content });
    inputEl.value = "";
    socket.emit("typing:stop", { chatId: CHAT_ID });
  }
});

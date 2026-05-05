const players = {
  rustzin: {
    name: "Rustzin",
    role: "Player Competitivo",
    status: "✅ Pago",
    statusType: "paid",
    value: "R$150,00",
    due: "10/06/2026",
    contract: "Ativo",
    message: "Pagamento confirmado. Continue representando a OLYMPO competitivamente.",
    history: [
      { month: "Maio 2026", status: "✅ Pago" },
      { month: "Abril 2026", status: "✅ Pago" }
    ]
  },

  panettone: {
    name: "Panettone",
    role: "Player Competitivo",
    status: "🟡 Pendente",
    statusType: "pending",
    value: "R$150,00",
    due: "10/05/2026",
    contract: "Ativo",
    message: "Pagamento em análise pela staff. Aguarde atualização.",
    history: [
      { month: "Maio 2026", status: "🟡 Pendente" },
      { month: "Abril 2026", status: "✅ Pago" }
    ]
  }
};

function login() {
  const nick = document.getElementById("playerNick").value.toLowerCase().trim();

  if (players[nick]) {
    localStorage.setItem("olympo_player", nick);
    window.location.href = "dashboard.html";
  } else {
    alert("Player não autorizado.");
  }
}

function logout() {
  localStorage.removeItem("olympo_player");
  window.location.href = "index.html";
}

const currentPage = window.location.pathname;

if (currentPage.includes("dashboard.html")) {
  const nick = localStorage.getItem("olympo_player");

  if (!nick || !players[nick]) {
    window.location.href = "index.html";
  }

  const player = players[nick];

  document.getElementById("playerName").innerText = player.name;
  document.getElementById("paymentStatus").innerText = player.status;
  document.getElementById("paymentText").innerText = player.role;
  document.getElementById("paymentValue").innerText = player.value;
  document.getElementById("paymentDue").innerText = player.due;
  document.getElementById("contractStatus").innerText = player.contract;
  document.getElementById("staffMessage").innerText = player.message;

  const badge = document.getElementById("statusBadge");
  badge.innerText = player.status;
  badge.classList.add(player.statusType);

  document.getElementById("history").innerHTML = player.history.map(item => `
    <div class="history-item">
      <span>${item.month}</span>
      <strong>${item.status}</strong>
    </div>
  `).join("");
}
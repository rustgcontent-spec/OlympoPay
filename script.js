const players = {
  rustzin: {
    password: "091212",
    access: "admin",
    name: "Rustzin",
    role: "Co-Owner / Player",
    status: "🟡 Em andamento",
    statusType: "pending",
    value: "A definir",
    due: "Primeiro mês em andamento",
    contract: "Ativo",
    organization: "OLYMPO",
    message: "O primeiro mês da OLYMPO ainda está em andamento. Nenhum pagamento foi finalizado até o momento.",
    history: [
      { month: "Maio 2026", status: "🟡 Em andamento" }
    ]
  },

  panettone: {
    password: "567885",
    access: "player",
    name: "Panettone",
    role: "Player Competitivo",
    status: "🟡 Em andamento",
    statusType: "pending",
    value: "A definir",
    due: "Primeiro mês em andamento",
    contract: "Ativo",
    organization: "OLYMPO",
    message: "O pagamento ainda não foi realizado porque o primeiro mês do time ainda não foi fechado.",
    history: [
      { month: "Maio 2026", status: "🟡 Em andamento" }
    ]
  },

  mtk: {
    password: "admin123",
    access: "admin",
    name: "Mtk",
    role: "Owner",
    status: "⚪ Staff",
    statusType: "staff",
    value: "Não aplicável",
    due: "Não aplicável",
    contract: "Owner",
    organization: "OLYMPO",
    message: "Conta administrativa do owner da OLYMPO.",
    history: [
      { month: "Maio 2026", status: "⚪ Staff" }
    ]
  }
};

function login() {
  const nick = document.getElementById("playerNick").value.toLowerCase().trim();
  const password = document.getElementById("password").value;

  if (players[nick] && players[nick].password === password) {
    localStorage.setItem("olympo_player", nick);
    window.location.href = "dashboard.html";
  } else {
    alert("Nick ou senha incorretos.");
  }
}

function logout() {
  localStorage.removeItem("olympo_player");
  window.location.href = "index.html";
}

function setActive(section) {
  document.querySelectorAll(".sidebar a").forEach(a => {
    a.classList.remove("active");
  });

  const links = document.querySelectorAll(".sidebar a");

  if (section === "dashboard") links[0].classList.add("active");
  if (section === "pagamentos") links[1].classList.add("active");
  if (section === "contrato") links[2].classList.add("active");
  if (section === "avisos") links[3].classList.add("active");
  if (section === "admin" && links[4]) links[4].classList.add("active");
}

function showSection(section) {
  const nick = localStorage.getItem("olympo_player");
  const player = players[nick];
  const box = document.getElementById("dynamicContent");

  setActive(section);

  if (section === "dashboard") {
    box.innerHTML = `
      <h3>Resumo do player</h3>
      <p class="message">
        Aqui você acompanha seu contrato, status de pagamento e avisos da staff da OLYMPO.
      </p>
      <div class="info-line"><strong>Nick:</strong> ${player.name}</div>
      <div class="info-line"><strong>Cargo:</strong> ${player.role}</div>
      <div class="info-line"><strong>Organização:</strong> ${player.organization}</div>
      <div class="info-line"><strong>Nível de acesso:</strong> ${player.access === "admin" ? "Admin" : "Player"}</div>
    `;
  }

  if (section === "pagamentos") {
    box.innerHTML = `
      <h3>Pagamentos</h3>
      <div class="info-line"><strong>Status atual:</strong> ${player.status}</div>
      <div class="info-line"><strong>Valor:</strong> ${player.value}</div>
      <div class="info-line"><strong>Vencimento:</strong> ${player.due}</div>
      <p class="message">
        Como o primeiro mês ainda está em andamento, nenhum pagamento foi marcado como pago.
      </p>
    `;
  }

  if (section === "contrato") {
    box.innerHTML = `
      <h3>Contrato</h3>
      <div class="info-line"><strong>Status do contrato:</strong> ${player.contract}</div>
      <div class="info-line"><strong>Cargo:</strong> ${player.role}</div>
      <div class="info-line"><strong>Organização:</strong> ${player.organization}</div>
      <p class="message">
        Este portal serve apenas para consulta interna. O contrato oficial deve ser enviado separadamente pela staff.
      </p>
    `;
  }

  if (section === "avisos") {
    box.innerHTML = `
      <h3>Avisos da staff</h3>
      <p class="message">${player.message}</p>
    `;
  }

  if (section === "admin") {
    if (player.access !== "admin") {
      box.innerHTML = `
        <h3>Acesso negado</h3>
        <p class="message">Você não tem permissão para acessar o painel admin.</p>
      `;
      return;
    }

    box.innerHTML = `
      <h3>Painel Admin</h3>
      <p class="message">
        Área administrativa da OLYMPO. Aqui o owner/co-owner consegue visualizar os players cadastrados.
      </p>

      ${Object.keys(players).map(key => {
        const p = players[key];

        return `
          <div class="admin-player">
            <h4>${p.name}</h4>
            <div class="info-line"><strong>Cargo:</strong> ${p.role}</div>
            <div class="info-line"><strong>Acesso:</strong> ${p.access === "admin" ? "Admin" : "Player"}</div>
            <div class="info-line"><strong>Status:</strong> ${p.status}</div>
            <div class="info-line"><strong>Valor:</strong> ${p.value}</div>
            <div class="info-line"><strong>Vencimento:</strong> ${p.due}</div>
          </div>
        `;
      }).join("")}

      <p class="message">
        Para editar players nessa versão, altere os dados no arquivo script.js.
      </p>
    `;
  }
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

  if (player.access === "admin") {
    document.getElementById("adminBtn").style.display = "block";
  }

  showSection("dashboard");
}
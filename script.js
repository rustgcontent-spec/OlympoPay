import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://reyhyamqikflphizqnap.supabase.co",
  "sb_publishable_MQ3Lf1a8vpoQYqB45_N2GQ_3nh20eDU"
);

let currentPlayer = null;
let allPlayers = [];

window.login = async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert("Email ou senha incorretos.");
    return;
  }

  window.location.href = "dashboard.html";
};

window.logout = async function () {
  await supabase.auth.signOut();
  window.location.href = "index.html";
};

async function loadDashboard() {
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    window.location.href = "index.html";
    return;
  }

  const userId = sessionData.session.user.id;

  const { data: player, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !player) {
    alert("Player não encontrado no banco.");
    await supabase.auth.signOut();
    window.location.href = "index.html";
    return;
  }

  currentPlayer = player;

  document.getElementById("playerName").innerText = player.nick;
  document.getElementById("paymentStatus").innerText = player.payment_status;
  document.getElementById("paymentText").innerText = player.role;
  document.getElementById("paymentValue").innerText = player.payment_value;
  document.getElementById("paymentDue").innerText = player.due_date;
  document.getElementById("contractStatus").innerText = player.contract_status;

  const badge = document.getElementById("statusBadge");
  badge.innerText = player.payment_status;

  if (player.access === "admin") {
    document.getElementById("adminBtn").style.display = "block";
    await loadAllPlayers();
  }

  showSection("dashboard");
}

async function loadAllPlayers() {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("nick");

  if (!error) {
    allPlayers = data;
  }
}

window.showSection = function (section) {
  document.querySelectorAll(".sidebar a").forEach(a => a.classList.remove("active"));

  if (section === "dashboard") document.querySelectorAll(".sidebar a")[0].classList.add("active");
  if (section === "pagamentos") document.querySelectorAll(".sidebar a")[1].classList.add("active");
  if (section === "contrato") document.querySelectorAll(".sidebar a")[2].classList.add("active");
  if (section === "avisos") document.querySelectorAll(".sidebar a")[3].classList.add("active");
  if (section === "admin") document.querySelectorAll(".sidebar a")[4].classList.add("active");

  const box = document.getElementById("dynamicContent");

  if (section === "dashboard") {
    box.innerHTML = `
      <h3>Resumo</h3>
      <div class="info-line"><strong>Nick:</strong> ${currentPlayer.nick}</div>
      <div class="info-line"><strong>Cargo:</strong> ${currentPlayer.role}</div>
      <div class="info-line"><strong>Acesso:</strong> ${currentPlayer.access}</div>
    `;
  }

  if (section === "pagamentos") {
    box.innerHTML = `
      <h3>Pagamentos</h3>
      <div class="info-line"><strong>Status:</strong> ${currentPlayer.payment_status}</div>
      <div class="info-line"><strong>Valor:</strong> ${currentPlayer.payment_value}</div>
      <div class="info-line"><strong>Vencimento:</strong> ${currentPlayer.due_date}</div>
    `;
  }

  if (section === "contrato") {
    box.innerHTML = `
      <h3>Contrato</h3>
      <div class="info-line"><strong>Status:</strong> ${currentPlayer.contract_status}</div>
      <div class="info-line"><strong>Cargo:</strong> ${currentPlayer.role}</div>
    `;
  }

  if (section === "avisos") {
    box.innerHTML = `
      <h3>Avisos da staff</h3>
      <p class="message">${currentPlayer.message}</p>
    `;
  }

  if (section === "admin") {
    if (currentPlayer.access !== "admin") {
      box.innerHTML = `<h3>Acesso negado</h3>`;
      return;
    }

    box.innerHTML = `
      <h3>Painel Admin</h3>
      <p class="message">Edite os pagamentos dos players abaixo.</p>

      ${allPlayers.map(player => `
        <div class="admin-player">
          <h4>${player.nick}</h4>

          <label>Status</label>
          <input id="status-${player.id}" value="${player.payment_status}">

          <label>Valor</label>
          <input id="value-${player.id}" value="${player.payment_value}">

          <label>Vencimento</label>
          <input id="due-${player.id}" value="${player.due_date}">

          <label>Contrato</label>
          <input id="contract-${player.id}" value="${player.contract_status}">

          <label>Aviso</label>
          <input id="message-${player.id}" value="${player.message}">

          <button onclick="savePlayer('${player.id}')">Salvar</button>
        </div>
      `).join("")}
    `;
  }
};

window.savePlayer = async function (id) {
  const updates = {
    payment_status: document.getElementById(`status-${id}`).value,
    payment_value: document.getElementById(`value-${id}`).value,
    due_date: document.getElementById(`due-${id}`).value,
    contract_status: document.getElementById(`contract-${id}`).value,
    message: document.getElementById(`message-${id}`).value
  };

  const { error } = await supabase
    .from("players")
    .update(updates)
    .eq("id", id);

  if (error) {
    alert("Erro ao salvar.");
    console.error(error);
    return;
  }

  alert("Alterações salvas para todos os players.");
  await loadAllPlayers();
  location.reload();
};

if (window.location.pathname.includes("dashboard.html")) {
  loadDashboard();
}
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://reyhyamqikflphizqnap.supabase.co",
  "sb_publishable_MQ3Lf1a8vpoQYqB45_N2GQ_3nh20eDU"
);

let currentPlayer = null;
let allPlayers = [];
let playerGoals = [];
let allGoals = [];

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
    console.error(error);
    await supabase.auth.signOut();
    window.location.href = "index.html";
    return;
  }

  currentPlayer = player;

  await loadGoals(userId);

  if (player.access === "admin") {
    document.getElementById("adminBtn").style.display = "block";
    await loadAllPlayers();
    await loadAllGoals();
  }

  renderTop();
  showSection("dashboard");
}

function getMessage(player) {
  return player.message || player.staff_message || "Nenhum aviso da staff no momento.";
}

function renderTop() {
  document.getElementById("playerName").innerText = currentPlayer.nick || "---";
  document.getElementById("playerRole").innerText = `${currentPlayer.role || "Cargo indefinido"} • OLYMPO`;

  document.getElementById("paymentStatus").innerText = currentPlayer.payment_status || "---";
  document.getElementById("paymentValue").innerText = currentPlayer.payment_value || "---";
  document.getElementById("paymentDue").innerText = currentPlayer.due_date || "---";
  document.getElementById("contractStatus").innerText = currentPlayer.contract_status || "---";
  document.getElementById("staffMessage").innerText = getMessage(currentPlayer);

  document.getElementById("statusBadge").innerText = currentPlayer.payment_status || "---";
}

async function loadGoals(playerId) {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("player_id", playerId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erro ao carregar metas:", error);
    playerGoals = [];
    return;
  }

  playerGoals = data || [];
}

async function loadAllPlayers() {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("nick", { ascending: true });

  if (error) {
    console.error("Erro ao carregar players:", error);
    allPlayers = [];
    return;
  }

  allPlayers = data || [];
}

async function loadAllGoals() {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erro ao carregar todas as metas:", error);
    allGoals = [];
    return;
  }

  allGoals = data || [];
}

function setActive(section) {
  document.querySelectorAll(".sidebar a").forEach(a => a.classList.remove("active"));

  const nav = document.getElementById(`nav-${section}`);
  const admin = document.getElementById("adminBtn");

  if (nav) nav.classList.add("active");
  if (section === "admin" && admin) admin.classList.add("active");
}

window.showSection = function (section) {
  if (!currentPlayer) return;

  setActive(section);

  const box = document.getElementById("dynamicContent");

  if (section === "dashboard") {
    box.innerHTML = `
      <h3>Resumo competitivo</h3>
      <div class="info-line"><strong>Nick:</strong> ${currentPlayer.nick || "---"}</div>
      <div class="info-line"><strong>Cargo:</strong> ${currentPlayer.role || "Cargo indefinido"}</div>
      <div class="info-line"><strong>Acesso:</strong> ${currentPlayer.access || "player"}</div>
      <div class="info-line"><strong>Organização:</strong> OLYMPO</div>
      <div class="info-line"><strong>Status competitivo:</strong> Ativo</div>
    `;
  }

  if (section === "pagamentos") {
    box.innerHTML = `
      <h3>Pagamentos</h3>
      <div class="info-line"><strong>Status atual:</strong> ${currentPlayer.payment_status || "---"}</div>
      <div class="info-line"><strong>Valor:</strong> ${currentPlayer.payment_value || "---"}</div>
      <div class="info-line"><strong>Vencimento:</strong> ${currentPlayer.due_date || "---"}</div>
      <div class="info-line"><strong>Observação:</strong> pagamentos definidos após fechamento do mês competitivo.</div>
    `;
  }

  if (section === "contrato") {
    box.innerHTML = `
      <h3>Contrato</h3>
      <div class="info-line"><strong>Status:</strong> ${currentPlayer.contract_status || "---"}</div>
      <div class="info-line"><strong>Cargo:</strong> ${currentPlayer.role || "Cargo indefinido"}</div>
      <div class="info-line"><strong>Time:</strong> OLYMPO</div>
      <div class="info-line"><strong>Tipo:</strong> Representação competitiva</div>
    `;
  }

  if (section === "avisos") {
    box.innerHTML = `
      <h3>Avisos da staff</h3>
      <p class="message">${getMessage(currentPlayer)}</p>
    `;
  }

  if (section === "metas") {
    let total = 0;
    let earned = 0;

    playerGoals.forEach(goal => {
      const value = Number(String(goal.reward || "0").replace("R$", "").replace(",", ".").trim()) || 0;
      total += value;

      if (String(goal.status || "").includes("✅")) {
        earned += value;
      }
    });

    box.innerHTML = `
      <h3>Metas do mês</h3>
      <p class="message">Complete as metas mensais para liberar o bônus adicional.</p>

      <div class="goal-summary">
        <div>
          <p class="label">Bônus liberado</p>
          <h2>R$${earned} / R$${total}</h2>
        </div>
        <div>
          <p class="label">Metas</p>
          <h2>${playerGoals.filter(g => String(g.status || "").includes("✅")).length} / ${playerGoals.length}</h2>
        </div>
      </div>

      ${
        playerGoals.length === 0
          ? `<p class="message">Nenhuma meta cadastrada para este player.</p>`
          : playerGoals.map(goal => `
            <div class="goal-card">
              <h4>${goal.title || "Meta sem título"}</h4>
              <p class="goal-status">${goal.status || "🟡 Em andamento"}</p>
              <p class="goal-money">${goal.reward || "R$0"}</p>
              <p class="muted">${goal.month || "Mês atual"}</p>
            </div>
          `).join("")
      }
    `;
  }

  if (section === "admin") {
    if (currentPlayer.access !== "admin") {
      box.innerHTML = `<h3>Acesso negado</h3>`;
      return;
    }

    box.innerHTML = `
      <h3>Painel Admin</h3>
      <p class="message">Edite pagamentos, cargos, avisos e metas dos players.</p>

      ${allPlayers.map(player => `
        <div class="admin-player">
          <h4>${player.nick || "---"}</h4>

          <label>Status do pagamento</label>
          <input id="status-${player.id}" value="${player.payment_status || ""}">

          <label>Valor</label>
          <input id="value-${player.id}" value="${player.payment_value || ""}">

          <label>Vencimento</label>
          <input id="due-${player.id}" value="${player.due_date || ""}">

          <label>Contrato</label>
          <input id="contract-${player.id}" value="${player.contract_status || ""}">

          <label>Cargo</label>
          <input id="role-${player.id}" value="${player.role || ""}">

          <label>Aviso da staff</label>
          <input id="message-${player.id}" value="${getMessage(player)}">

          <button onclick="savePlayer('${player.id}')">Salvar player</button>

          <h4 style="margin-top:22px;">Metas</h4>

          ${
            allGoals.filter(goal => goal.player_id === player.id).length === 0
              ? `<p class="message">Nenhuma meta cadastrada.</p>`
              : allGoals.filter(goal => goal.player_id === player.id).map(goal => `
                <div class="goal-card">
                  <h4>${goal.title}</h4>

                  <label>Status</label>
                  <select id="goal-status-${goal.id}">
                    <option ${goal.status === "🟡 Em andamento" ? "selected" : ""}>🟡 Em andamento</option>
                    <option ${goal.status === "✅ Concluído" ? "selected" : ""}>✅ Concluído</option>
                    <option ${goal.status === "❌ Não concluído" ? "selected" : ""}>❌ Não concluído</option>
                  </select>

                  <label>Recompensa</label>
                  <input id="goal-reward-${goal.id}" value="${goal.reward || ""}">

                  <button onclick="saveGoal('${goal.id}')">Salvar meta</button>
                </div>
              `).join("")
          }
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
    role: document.getElementById(`role-${id}`).value,
    message: document.getElementById(`message-${id}`).value
  };

  const { error } = await supabase
    .from("players")
    .update(updates)
    .eq("id", id);

  if (error) {
    alert("Erro ao salvar player.");
    console.error(error);
    return;
  }

  alert("Player salvo.");
  location.reload();
};

window.saveGoal = async function (id) {
  const updates = {
    status: document.getElementById(`goal-status-${id}`).value,
    reward: document.getElementById(`goal-reward-${id}`).value
  };

  const { error } = await supabase
    .from("goals")
    .update(updates)
    .eq("id", id);

  if (error) {
    alert("Erro ao salvar meta.");
    console.error(error);
    return;
  }

  alert("Meta salva.");
  location.reload();
};

if (window.location.pathname.includes("dashboard.html")) {
  loadDashboard();
}
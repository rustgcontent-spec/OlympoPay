import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://reyhyamqikflphizqnap.supabase.co",
  "sb_publishable_MQ3Lf1a8vpoQYqB45_N2GQ_3nh20eDU"
);

let currentPlayer = null;
let goals = [];

window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert("Erro no login");
    return;
  }

  window.location.href = "dashboard.html";
};

window.logout = async function () {
  await supabase.auth.signOut();
  window.location.href = "index.html";
};

async function loadDashboard() {
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    window.location.href = "index.html";
    return;
  }

  const userId = data.session.user.id;

  const { data: player } = await supabase
    .from("players")
    .select("*")
    .eq("id", userId)
    .single();

  currentPlayer = player;

  document.getElementById("playerName").innerText = player.nick;

  if (player.access === "admin") {
    document.getElementById("adminBtn").style.display = "block";
  }

  await loadGoals(userId);

  showSection("dashboard");
}

async function loadGoals(id) {
  const { data } = await supabase
    .from("goals")
    .select("*")
    .eq("player_id", id);

  goals = data;
}

window.showSection = function (section) {
  const box = document.getElementById("content");

  if (section === "dashboard") {
    box.innerHTML = `
      <h2>Status: ${currentPlayer.payment_status}</h2>
      <p>Valor: ${currentPlayer.payment_value}</p>
      <p>Contrato: ${currentPlayer.contract_status}</p>
    `;
  }

  if (section === "metas") {
    let total = 0;
    let earned = 0;

    goals.forEach(g => {
      const v = Number(g.reward.replace("R$", ""));
      total += v;
      if (g.status.includes("✅")) earned += v;
    });

    box.innerHTML = `
      <h2>Metas</h2>
      <p>Bônus: R$${earned} / R$${total}</p>

      ${goals.map(g => `
        <div class="goal">
          <strong>${g.title}</strong>
          <p>${g.status}</p>
          <p>${g.reward}</p>
        </div>
      `).join("")}
    `;
  }

  if (section === "admin") {
    if (currentPlayer.access !== "admin") return;

    box.innerHTML = `
      <h2>Admin</h2>

      ${goals.map(g => `
        <div class="goal">
          <strong>${g.title}</strong>

          <select id="status-${g.id}">
            <option>🟡 Em andamento</option>
            <option>✅ Concluído</option>
            <option>❌ Não concluído</option>
          </select>

          <button onclick="updateGoal('${g.id}')">Salvar</button>
        </div>
      `).join("")}
    `;
  }
};

window.updateGoal = async function (id) {
  const status = document.getElementById(`status-${id}`).value;

  await supabase
    .from("goals")
    .update({ status })
    .eq("id", id);

  alert("Meta atualizada");

  location.reload();
};

if (window.location.pathname.includes("dashboard.html")) {
  loadDashboard();
}
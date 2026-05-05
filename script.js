function login() {
  let user = document.getElementById("user").value;

  if(user === "rustzin"){
    localStorage.setItem("player", "rustzin");
    window.location.href = "dashboard.html";
  } else if(user === "panettone"){
    localStorage.setItem("player", "panettone");
    window.location.href = "dashboard.html";
  } else {
    alert("Acesso negado");
  }
}
const STORAGE_KEY = "tasquesKanban";


let tasques = [];

function carregarTasques() {
  const dades = localStorage.getItem(STORAGE_KEY);
  return dades ? JSON.parse(dades) : [];
}

function guardarTasques(tasques) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasques));
}

function initApp() {
  tasques = carregarTasques();

  if (tasques.length === 0) {
    tasques = [
      {
        id: crypto.randomUUID(),
        titol: "Tasca de prova",
        descripcio: "Això és una tasca d'exemple",
        prioritat: "mitjana",
        dataVenciment: "",
        estat: "perFer",
        creatEl: new Date().toISOString()
      }
    ];
    guardarTasques(tasques);
  }

  console.log("Tasques carregades:", tasques);
}

document.addEventListener("DOMContentLoaded", initApp);

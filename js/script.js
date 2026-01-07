const STORAGE_KEY = "tasquesKanban";

// Selección de elementos del DOM
const form = document.querySelector("#taskForm");
const titolInput = document.querySelector("#titol");
const descripcioInput = document.querySelector("#descripcio");
const prioritatSelect = document.querySelector("#prioritat");
const dataVencimentInput = document.querySelector("#dataVenciment");

// Divs internos donde se van a poner las tarjetas
const kanbanColPerFer = document.querySelector('.columna[data-estat="perFer"] .tasques');
const kanbanColEnCurs = document.querySelector('.columna[data-estat="enCurs"] .tasques');
const kanbanColFet = document.querySelector('.columna[data-estat="fet"] .tasques');

let tasques = [];
let editTascaId = null;

// ---------- Persistencia ----------
function carregarTasques() {
  const dades = localStorage.getItem(STORAGE_KEY);
  return dades ? JSON.parse(dades) : [];
}

function guardarTasques() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasques));
}

// ---------- Render Kanban ----------
function renderTasques() {
  // Vaciar columnas
  kanbanColPerFer.innerHTML = "";
  kanbanColEnCurs.innerHTML = "";
  kanbanColFet.innerHTML = "";

  const tasquesAMostrar = getTasquesFiltrades();

  tasquesAMostrar.forEach(tasca => {
    const div = document.createElement("div");
    div.classList.add("tasca");
    div.dataset.id = tasca.id;

    let colorPrioritat = "";
    if (tasca.prioritat === "baixa") colorPrioritat = "green";
    else if (tasca.prioritat === "mitjana") colorPrioritat = "orange";
    else if (tasca.prioritat === "alta") colorPrioritat = "red";

    div.innerHTML = `
      <strong>${tasca.titol}</strong>
      <p>${tasca.descripcio}</p>
      <span style="background:${colorPrioritat};color:white;padding:0.2rem 0.5rem;border-radius:4px;font-size:0.8rem;">${tasca.prioritat}</span>
      <span>${tasca.dataVenciment || ""}</span>
      <select class="estat">
        <option value="perFer" ${tasca.estat === "perFer"? "selected":""}>Per fer</option>
        <option value="enCurs" ${tasca.estat === "enCurs"? "selected":""}>En curs</option>
        <option value="fet" ${tasca.estat === "fet"? "selected":""}>Fet</option>
      </select>
      <button class="editar">Editar</button>
      <button class="eliminar">Eliminar</button>
    `;

    if (tasca.estat === "perFer") kanbanColPerFer.appendChild(div);
    else if (tasca.estat === "enCurs") kanbanColEnCurs.appendChild(div);
    else kanbanColFet.appendChild(div);
  });

  actualitzarEstadistiques();
}


// ---------- Crear / Editar ----------
form.addEventListener("submit", e => {
  e.preventDefault();

  if (editTascaId) {
    // Guardar edición
    const tasca = tasques.find(t => t.id === editTascaId);
    tasca.titol = titolInput.value;
    tasca.descripcio = descripcioInput.value;
    tasca.prioritat = prioritatSelect.value;
    tasca.dataVenciment = dataVencimentInput.value;
    editTascaId = null;
    form.querySelector("button").textContent = "Desar tasca";
  } else {
    // Crear nueva
    const novaTasca = {
      id: crypto.randomUUID(),
      titol: titolInput.value,
      descripcio: descripcioInput.value,
      prioritat: prioritatSelect.value,
      dataVenciment: dataVencimentInput.value,
      estat: "perFer",
      creatEl: new Date().toISOString()
    };
    tasques.push(novaTasca);
  }

  guardarTasques();
  renderTasques();
  form.reset();
});

// ---------- Delegación de eventos para editar, eliminar y cambiar estado ----------
document.querySelector(".kanban").addEventListener("click", e => {
  const divTasca = e.target.closest(".tasca");
  if (!divTasca) return;

  const id = divTasca.dataset.id;
  const tasca = tasques.find(t => t.id === id);

  if (e.target.classList.contains("eliminar")) {
    if (confirm("Segur que vols eliminar aquesta tasca?")) {
      tasques = tasques.filter(t => t.id !== id);
      guardarTasques();
      renderTasques();
    }
  }

  if (e.target.classList.contains("editar")) {
    titolInput.value = tasca.titol;
    descripcioInput.value = tasca.descripcio;
    prioritatSelect.value = tasca.prioritat;
    dataVencimentInput.value = tasca.dataVenciment;
    editTascaId = id;
    form.querySelector("button").textContent = "Guardar canvis";
  }
});

document.querySelector(".kanban").addEventListener("change", e => {
  if (e.target.classList.contains("estat")) {
    const id = e.target.closest(".tasca").dataset.id;
    const tasca = tasques.find(t => t.id === id);
    tasca.estat = e.target.value;
    guardarTasques();
    renderTasques();
  }
});

// ---------- Inicialización ----------
document.addEventListener("DOMContentLoaded", () => {
  tasques = carregarTasques();
  renderTasques();
});

// Selección de elementos del DOM de los nuevos elementos de filter
const filterEstat = document.querySelector("#filterEstat");
const filterPrioritat = document.querySelector("#filterPrioritat");
const searchText = document.querySelector("#searchText");

const totalTasquesSpan = document.querySelector("#totalTasques");
const totalPerFerSpan = document.querySelector("#totalPerFer");
const totalEnCursSpan = document.querySelector("#totalEnCurs");
const totalFetSpan = document.querySelector("#totalFet");
const percentCompletadesSpan = document.querySelector("#percentCompletades");

function getTasquesFiltrades() {
  let filtrades = [...tasques];

  // Filtrar por estat
  if (filterEstat.value) {
    filtrades = filtrades.filter(t => t.estat === filterEstat.value);
  }

  // Filtrar por prioritat
  if (filterPrioritat.value) {
    filtrades = filtrades.filter(t => t.prioritat === filterPrioritat.value);
  }

  // Buscar por texto
  if (searchText.value.trim() !== "") {
    const text = searchText.value.toLowerCase();
    filtrades = filtrades.filter(t => 
      t.titol.toLowerCase().includes(text) || 
      t.descripcio.toLowerCase().includes(text)
    );
  }

  return filtrades;
}

function actualitzarEstadistiques() {
  const total = tasques.length;
  const perFer = tasques.filter(t => t.estat === "perFer").length;
  const enCurs = tasques.filter(t => t.estat === "enCurs").length;
  const fet = tasques.filter(t => t.estat === "fet").length;
  const percent = total === 0 ? 0 : Math.round((fet / total) * 100);

  totalTasquesSpan.textContent = total;
  totalPerFerSpan.textContent = perFer;
  totalEnCursSpan.textContent = enCurs;
  totalFetSpan.textContent = fet;
  percentCompletadesSpan.textContent = percent;
}

filterEstat.addEventListener("change", renderTasques);
filterPrioritat.addEventListener("change", renderTasques);
searchText.addEventListener("input", renderTasques);

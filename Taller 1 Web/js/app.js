import { getPokemons, getPokemonDetail } from "./pokemones.js";
import { getCategories } from "./recetas.js";

const STATE = {
  pokemon: { all: [], filtered: [], search: "", sort: "id" },
  recetas: { all: [], filtered: [], search: "", sort: "name" }
};

// Pokémon
function pokemonCard(p) {
  return `
    <div class="card p-4 bg-white rounded-lg shadow-md text-center">
      <h3 class="capitalize font-bold">${p.name}</h3>
      <img src="${p.sprites.front_default || ''}" alt="${p.name}" class="mx-auto mb-2">
      <p>ID: ${p.id}</p>
      <p>Peso: ${p.weight}</p>
      <p>Altura: ${p.height}</p>
    </div>
  `;
}

function renderPokemons() {
  const container = document.getElementById("pokemon-info");
  if (!container) return;

  const search = STATE.pokemon.search.toLowerCase();
  const sort = STATE.pokemon.sort;

  let filtered = STATE.pokemon.all.filter(p =>
    p.name.toLowerCase().includes(search)
  );

  filtered.sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "weight") return a.weight - b.weight;
    return a.id - b.id;
  });

  STATE.pokemon.filtered = filtered;

  if (!filtered.length) {
    container.innerHTML = `<div class="p-6 text-center text-slate-500">No se encontraron Pokémon que coincidan con "${search}"</div>`;
    return;
  }

  container.innerHTML = filtered.map(pokemonCard).join("");
}

// Recetas
function recetaCard(cat) {
  return `
    <div class="card p-4 bg-white rounded-lg shadow-md text-center">
      <h3 class="font-bold">${cat.strCategory}</h3>
      <img src="${cat.strCategoryThumb}" alt="${cat.strCategory}" class="mx-auto mb-2">
      <p>${cat.strCategoryDescription.substring(0, 100)}...</p>
    </div>
  `;
}

function renderRecetas() {
  const container = document.getElementById("recetas-info");
  if (!container) return;

  const search = STATE.recetas.search.toLowerCase();
  const sort = STATE.recetas.sort;

  let filtered = STATE.recetas.all.filter(cat =>
    cat.strCategory.toLowerCase().includes(search)
  );

  filtered.sort((a, b) => a.strCategory.localeCompare(b.strCategory));

  STATE.recetas.filtered = filtered;

  if (!filtered.length) {
    container.innerHTML = `<div class="p-6 text-center text-slate-500">No se encontraron categorías que coincidan con "${search}"</div>`;
    return;
  }

  container.innerHTML = filtered.map(recetaCard).join("");
}

// Cargar datos
export async function loadPokemons() {
  const container = document.getElementById("pokemon-info");
  if (!container) return;
  container.innerHTML = `<div class="p-6 text-center animate-pulse">Cargando Pokémon...</div>`;

  try {
    const data = await getPokemons();
    const detalles = await Promise.all(data.results.map(p => getPokemonDetail(p.url)));
    STATE.pokemon.all = detalles;
    renderPokemons();
  } catch (e) {
    console.error(e);
    container.innerHTML = `<div class="p-6 text-center text-red-600">Error al cargar Pokémon</div>`;
  }
}

export async function loadRecetas() {
  const container = document.getElementById("recetas-info");
  if (!container) return;
  container.innerHTML = `<div class="p-6 text-center animate-pulse">Cargando categorías...</div>`;

  try {
    const data = await getCategories();
    STATE.recetas.all = data;
    renderRecetas();
  } catch (e) {
    console.error(e);
    container.innerHTML = `<div class="p-6 text-center text-red-600">Error al cargar categorías</div>`;
  }
}

// UI
function initPokemonsUI() {
  const searchInput = document.getElementById("pokemon-search");
  const sortSelect = document.getElementById("pokemon-sort");
  const reloadBtn = document.getElementById("pokemon-reload");

  searchInput?.addEventListener("input", () => {
    clearTimeout(searchInput.timeout);
    searchInput.timeout = setTimeout(() => {
      STATE.pokemon.search = searchInput.value;
      renderPokemons();
    }, 300);
  });

  sortSelect?.addEventListener("change", () => {
    STATE.pokemon.sort = sortSelect.value;
    renderPokemons();
  });

  reloadBtn?.addEventListener("click", () => {
    STATE.pokemon.search = "";
    STATE.pokemon.sort = "id";
    if (searchInput) searchInput.value = "";
    if (sortSelect) sortSelect.value = "id";
    loadPokemons();
  });
}

function initRecetasUI() {
  const searchInput = document.getElementById("recetas-search");
  const sortSelect = document.getElementById("recetas-sort");
  const reloadBtn = document.getElementById("recetas-reload");

  searchInput?.addEventListener("input", () => {
    clearTimeout(searchInput.timeout);
    searchInput.timeout = setTimeout(() => {
      STATE.recetas.search = searchInput.value;
      renderRecetas();
    }, 300);
  });

  sortSelect?.addEventListener("change", () => {
    STATE.recetas.sort = sortSelect.value;
    renderRecetas();
  });

  reloadBtn?.addEventListener("click", () => {
    STATE.recetas.search = "";
    STATE.recetas.sort = "name";
    if (searchInput) searchInput.value = "";
    if (sortSelect) sortSelect.value = "name";
    loadRecetas();
  });
}

// AUTO INIT
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("pokemon-info")) {
    initPokemonsUI();
    loadPokemons();
  }
  if (document.getElementById("recetas-info")) {
    initRecetasUI();
    loadRecetas();
  }
});

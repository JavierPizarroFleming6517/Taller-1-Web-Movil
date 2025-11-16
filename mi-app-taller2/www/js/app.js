// js/app.js

// === 1. IMPORTACIONES ===
// Importa las funciones de los 4 archivos de API
import { getPokemons, getPokemonDetail } from "./pokemones.js"; // <-- 💡 CORRECCIÓN 1: "pokemones.js"
import { getCategories } from "./recetas.js";
import { getAnimeNews } from "./anime.js";
import { getCripto } from "./cripto.js";

// === 2. ESTADO GLOBAL ===
// Un solo objeto STATE para toda la aplicación
const STATE = {
  pokemon: { all: [], filtered: [], search: "", sort: "id" },
  recetas: { all: [], filtered: [], search: "", sort: "name" },
  anime:   { all: [], filtered: [], page: 1, perPage: 24, sort: 'score' },
  cripto:  { all: [], filtered: [], page: 1, perPage: 24, sort: 'market_cap' }
};

// === 3. FUNCIONES DE AYUDA (Helpers) ===
function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return isNaN(date) ? "-" : date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatCurrency(n) {
  return n?.toLocaleString(undefined, { style: "currency", currency: "USD" }) ?? "-";
}

function porcentaje(n) {
  if (n === null || n === undefined) return "-";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

// === 4. LÓGICA DE POKÉMON ===
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
  
  container.innerHTML = filtered.length
    ? filtered.map(pokemonCard).join("")
    : `<div class="p-6 text-center text-slate-500 col-span-full">No se encontraron Pokémon...</div>`;
}

async function loadPokemons() {
  const container = document.getElementById("pokemon-info");
  if (!container) return;
  container.innerHTML = `<div class="p-6 text-center animate-pulse col-span-full">Cargando Pokémon...</div>`;

  try {
    // === 💡 CORRECCIÓN 2: Pide 151 en lugar de 1000 ===
    const data = await getPokemons(151); 
    const detalles = await Promise.all(data.results.map(p => getPokemonDetail(p.url)));
    STATE.pokemon.all = detalles;
    renderPokemons();
  } catch (e) {
    console.error(e);
    container.innerHTML = `<div class="p-6 text-center text-red-600 col-span-full">Error al cargar Pokémon</div>`;
  }
}

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
    loadPokemons(); // Esto volverá a cargar solo 151
  });
}

// === 5. LÓGICA DE RECETAS ===
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

  let filtered = STATE.recetas.all.filter(cat =>
    cat.strCategory.toLowerCase().includes(search)
  );

  filtered.sort((a, b) => a.strCategory.localeCompare(b.strCategory));

  STATE.recetas.filtered = filtered;
  container.innerHTML = filtered.length
    ? filtered.map(recetaCard).join("")
    : `<div class="p-6 text-center text-slate-500 col-span-full">No se encontraron categorías...</div>`;
}

async function loadRecetas() {
  const container = document.getElementById("recetas-info");
  if (!container) return;
  container.innerHTML = `<div class="p-6 text-center animate-pulse col-span-full">Cargando categorías...</div>`;

  try {
    const data = await getCategories();
    STATE.recetas.all = data;
    renderRecetas();
  } catch (e) {
    console.error(e);
    container.innerHTML = `<div class="p-6 text-center text-red-600 col-span-full">Error al cargar categorías</div>`;
  }
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
    renderRecetas();
  });

  reloadBtn?.addEventListener("click", () => {
    STATE.recetas.search = "";
    if (searchInput) searchInput.value = "";
    loadRecetas();
  });
}

// === 6. LÓGICA DE ANIME ===
function animeCard(a) {
  let synopsis = '';
  if (a.synopsis) {
    const cleanSynopsis = a.synopsis.replace(/(No spoilers|Spoiler).*?\./gi, '').trim();
    if (cleanSynopsis.length > 30) synopsis = cleanSynopsis;
  }
  return `
    <li class="flex flex-col items-start border rounded-xl bg-white shadow-sm p-4 gap-2 h-full">
      <img src="${a.images?.jpg?.image_url || ''}" alt="${a.title}" class="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg mx-auto mb-2" loading="lazy">
      <div class="w-full">
        <div class="font-semibold text-base sm:text-lg text-center mb-1">${a.title}</div>
        <div class="text-xs sm:text-sm text-slate-500 text-center mb-2">
          ${formatDate(a.aired?.from)}${a.type ? ` · ${a.type}` : ''}${a.episodes ? ` · ${a.episodes} ep.` : ''} 
        </div>
        ${synopsis ? `<div class='text-xs sm:text-sm text-slate-600 mt-2 break-words leading-snug line-clamp-6'>${synopsis}</div>` : ''}
      </div>
      <div class="flex items-center gap-2 mt-3 self-center">
        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">⭐ ${a.score || 'N/A'}</span>
        <a href="${a.url}" target="_blank" class="text-blue-600 text-xs sm:text-sm underline ml-2">Ver</a>
      </div>
    </li>
  `;
}

function renderAnimeList() {
  const list = document.getElementById("anime-list");
  if(!list) return;
  
  const search = document.getElementById("anime-search")?.value?.toLowerCase() ?? "";
  const sort = document.getElementById("anime-sort")?.value ?? STATE.anime.sort;

  let filtered = STATE.anime.all.filter(a =>
    [a.title, a.title_english, a.title_japanese].filter(Boolean).some(t => t.toLowerCase().includes(search))
  );

  if (sort === 'title') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    let key;
    if (sort === 'year') {
      key = a => a.aired?.from ? new Date(a.aired.from).getFullYear() : 0;
    } else if (sort === 'episodes') {
      key = a => a.episodes || 0;
    } else {
      key = a => a.score || 0;
    }
    filtered.sort((a, b) => key(b) - key(a));
  }

  STATE.anime.filtered = filtered;

  list.innerHTML = filtered.length
    ? `<ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${filtered.map(animeCard).join("")}</ul>`
    : `<div class="p-6 text-center text-slate-500">No se encontraron animes...</div>`;
}

async function loadAnime() {
  const list = document.getElementById("anime-list");
  if (!list) return;
  list.innerHTML = `<div class="animate-pulse py-6 text-center">Cargando animes...</div>`;
  
  try {
    const data = await getAnimeNews({ page: STATE.anime.page, perPage: STATE.anime.perPage });
    STATE.anime.all = data;
    renderAnimeList();
  } catch (e) {
    console.error(e);
    list.innerHTML = `<div class="text-red-600 p-6 text-center">Error al cargar datos.</div>`;
  }
}

function initAnimeUI() {
  const search = document.getElementById("anime-search");
  const sort = document.getElementById("anime-sort");
  const reloadBtn = document.getElementById("recetas-reload"); // ID "recetas-reload" en anime.html

  if (search) {
    search.addEventListener("input", () => {
      clearTimeout(search.timeout);
      search.timeout = setTimeout(renderAnimeList, 300);
    });
  }

  sort?.addEventListener("change", renderAnimeList);

  if (reloadBtn) {
    reloadBtn.addEventListener("click", () => {
      loadAnime();
      if (search) search.value = '';
      if (sort) sort.value = STATE.anime.sort;
    });
  }
}

// === 7. LÓGICA DE CRIPTO ===
function coinCard(c) {
  const change = c.price_change_percentage_24h;
  const color = change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-slate-600";
  return `
    <article class="rounded-2xl border p-4 bg-white shadow-sm flex items-center gap-4">
      <img src="${c.image}" alt="${c.name}" class="w-10 h-10 rounded-full" loading="lazy">
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold truncate">${c.name} <span class="opacity-60 text-sm">(${c.symbol.toUpperCase()})</span></h3>
        <p class="text-sm opacity-70">Mcap: ${formatCurrency(c.market_cap)}</p>
      </div>
      <div class="text-right">
        <p class="font-bold">${formatCurrency(c.current_price)}</p>
        <p class="${color} text-sm">${porcentaje(change)}</p>
      </div>
    </article>
  `;
}

function renderCriptoList() {
  const list = document.getElementById("crypto-list");
  if(!list) return;

  const search = document.getElementById("crypto-search")?.value?.toLowerCase() ?? "";
  const sort = document.getElementById("crypto-sort")?.value ?? STATE.cripto.sort;

  const filtered = STATE.cripto.all.filter(c =>
    c.name.toLowerCase().includes(search) || c.symbol.toLowerCase().includes(search)
  );

  const sorted = filtered.sort((a, b) => {
    switch (sort) {
      case "price": return b.current_price - a.current_price;
      case "change": return (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0);
      case "market_cap":
      default: return (b.market_cap ?? 0) - (a.market_cap ?? 0);
    }
  });

  STATE.cripto.filtered = sorted;

  list.innerHTML = sorted.length
    ? `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">${sorted.map(coinCard).join("")}</div>`
    : `<div class="p-6 text-center text-slate-500">Sin resultados</div>`;
}

async function loadCripto() {
  const list = document.getElementById("crypto-list");
  if (!list) return;
  list.innerHTML = `<div class="animate-pulse py-6 text-center">Cargando criptomonedas…</div>`;

  try {
    const data = await getCripto({ page: STATE.cripto.page, perPage: STATE.cripto.perPage });
    STATE.cripto.all = data;
    renderCriptoList();
  } catch (e) {
    console.error(e);
    list.innerHTML = `<div class="text-red-600">Error al cargar datos.</div>`;
  }
}

function initCriptoUI() {
  const search = document.getElementById("crypto-search");
  const sort = document.getElementById("crypto-sort");
  const reload = document.getElementById("crypto-reload");

  search?.addEventListener("input", renderCriptoList);
  sort?.addEventListener("change", renderCriptoList);
  reload?.addEventListener("click", loadCripto);
}

// === 8. INICIO DE LA APP ===
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("pokemon-info")) {
    initPokemonsUI();
    loadPokemons();
  }
  
  if (document.getElementById("recetas-info")) {
    initRecetasUI();
    loadRecetas();
  }
  
  if (document.getElementById("anime-root")) {
    initAnimeUI();
    loadAnime();
  }
  
  if (document.getElementById("crypto-root")) {
    initCriptoUI();
    loadCripto();
  }
});
// js/app.js

// === 1. IMPORTACIONES ===
import { getPokemons } from "./pokemones.js";
import { getRecetas } from "./recetas.js"; // <-- 💡 CAMBIO: Ya no es getCategories
import { getAnimeNews } from "./anime.js";
import { getCripto } from "./cripto.js";

// === 2. ESTADO GLOBAL ===
const STATE = {
  pokemon: { all: [], filtered: [], search: "", sort: "id" },
  recetas: { all: [], filtered: [], search: "", sort: "name" }, // 'name' es válido para 'nombre'
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
// (Esta sección no cambia, ya funciona con tu backend de FastAPI)
function pokemonCard(p) {
  return `
    <div class="card p-4 bg-white rounded-lg shadow-md text-center">
      <h3 class="capitalize font-bold">${p.name}</h3>
      <p>ID: ${p.id}</p>
      <p class="capitalize">Tipo: ${p.type}</p>
      <p>Nivel: ${p.level}</p>
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
    if (sort === "level") return a.level - b.level;
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
    const data = await getPokemons();
    STATE.pokemon.all = data;
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
    loadPokemons();
  });
}

// === 5. LÓGICA DE RECETAS (ACTUALIZADA) ===

// 💡 CAMBIO: Esta tarjeta ahora muestra una Receta de tu API
function recetaCard(receta) {
  return `
    <div class="card p-4 bg-white rounded-lg shadow-md text-left w-full">
      <h3 class="font-bold text-lg mb-2">${receta.nombre}</h3>
      <p class="font-semibold text-sm mb-1 capitalize">${receta.categoria}</p>
      <p class="text-sm text-slate-600">${(receta.instrucciones || '').substring(0, 100)}...</p>
    </div>
  `;
}

// 💡 CAMBIO: El filtro ahora busca por 'nombre' de receta
function renderRecetas() {
  const container = document.getElementById("recetas-info");
  if (!container) return;

  const search = STATE.recetas.search.toLowerCase();

  let filtered = STATE.recetas.all.filter(receta =>
    (receta.nombre || '').toLowerCase().includes(search)
  );

  // El sort por 'name' (nombre) sigue siendo válido
  filtered.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));

  STATE.recetas.filtered = filtered;
  container.innerHTML = filtered.length
    ? filtered.map(recetaCard).join("")
    : `<div class="p-6 text-center text-slate-500 col-span-full">No se encontraron recetas...</div>`;
}

// 💡 CAMBIO: Ahora llama a getRecetas() de tu nuevo js/recetas.js
async function loadRecetas() {
  const container = document.getElementById("recetas-info");
  if (!container) return;
  container.innerHTML = `<div class="p-6 text-center animate-pulse col-span-full">Cargando recetas...</div>`;

  try {
    const data = await getRecetas(); // <-- Llama a tu nueva función
    STATE.recetas.all = data;
    renderRecetas();
  } catch (e) {
    console.error(e);
    container.innerHTML = `<div class="p-6 text-center text-red-600 col-span-full">Error al cargar recetas</div>`;
  }
}

// (Esta función no cambia, sigue funcionando)
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
// (Esta sección no cambia, ya funciona con tu backend de NestJS)
function animeCard(a) {
  let synopsis = '';
  if (a.synopsis) {
    const cleanSynopsis = a.synopsis.replace(/(No spoilers|Spoiler).*?\./gi, '').trim();
    if (cleanSynopsis.length > 30) synopsis = cleanSynopsis;
  }
  return `
    <li class="flex flex-col items-start border rounded-xl bg-white shadow-sm p-4 gap-2 h-full">
      <img src="${a.image_url || ''}" alt="${a.title}" class="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg mx-auto mb-2" loading="lazy">
      <div class="w-full">
        <div class="font-semibold text-base sm:text-lg text-center mb-1">${a.title}</div>
        <div class="text-xs sm:text-sm text-slate-500 text-center mb-2">
          ${a.year || 'N/A'}${a.type ? ` · ${a.type}` : ''}${a.episodes ? ` · ${a.episodes} ep.` : ''} 
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
      key = a => a.year || 0;
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
  const reloadBtn = document.getElementById("recetas-reload");
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
// (Esta sección no cambia)
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
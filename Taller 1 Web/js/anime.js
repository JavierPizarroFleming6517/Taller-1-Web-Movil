// Formatea fecha simple - CORREGIDO
function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return isNaN(date) ? "-" : date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// --- Llamar a la API CORREGIDA ---
// Llamar a la API de anime
export async function getAnimeNews({ page = 1, perPage = 20 } = {}) {
    const url = 'https://api.jikan.moe/v4/top/anime';
    const qs = new URLSearchParams({ limit: perPage, page });
    
    try {
        const response = await fetch(`${url}?${qs}`);
        if (!response.ok) throw new Error("Error al obtener los animes");
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error fetching anime:", error);
        throw error;
    }
}

// --- Render de tarjetas MEJORADO ---
function animeCard(a) {
  let synopsis = '';
  if (a.synopsis) {
    const cleanSynopsis = a.synopsis.replace(/(No spoilers|Spoiler).*?\./gi, '').trim();
    if (cleanSynopsis.length > 30) synopsis = cleanSynopsis;
  }
  return `
    <li class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 border-b py-4 px-2 sm:px-4">
      <img src="${a.images?.jpg?.image_url || ''}" alt="${a.title}" class="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0 mb-2 sm:mb-0" loading="lazy">
      <div class="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:gap-4">
        <div class="min-w-0">
          <div class="font-semibold text-base sm:text-lg truncate">${a.title}</div>
          <div class="text-xs sm:text-sm text-slate-500 mt-1">${formatDate(a.aired?.from)}${a.type ? ` · ${a.type}` : ''}${a.episodes ? ` · ${a.episodes} ep.` : ''}</div>
        </div>
        ${synopsis ? `<div class='text-xs sm:text-sm text-slate-600 mt-2 sm:mt-0 sm:ml-4 max-h-24 sm:max-h-20 overflow-hidden break-words leading-snug sm:leading-tight flex-1' style='display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;'>${synopsis}</div>` : ''}
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">⭐ ${a.score || 'N/A'}</span>
        <a href="${a.url}" target="_blank" class="text-blue-600 text-xs sm:text-sm underline ml-2 mt-2 sm:mt-0">Ver</a>
      </div>
    </li>
  `;
}

// --- Estado global simple ---
const STATE = {
  all: [],
  filtered: [],
  page: 1,
  perPage: 24,
  sort: 'score'
};

// --- Render listado (aplica filtro + orden) MEJORADO ---
function renderList() {
  const list = document.getElementById("anime-list");
  const search = document.getElementById("anime-search")?.value?.toLowerCase() ?? "";
  const sort = document.getElementById("anime-sort")?.value ?? STATE.sort;

  let filtered = STATE.all.filter(a =>
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

  STATE.filtered = filtered;

  if (!list) return;
  if (!filtered.length) {
    list.innerHTML = `<div class="p-6 text-center text-slate-500">No se encontraron animes que coincidan con "${search}"</div>`;
    return;
  }

  list.innerHTML = `
    <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      ${filtered.map(animeCard).join("")}
    </ul>
  `;
}

// --- Cargar datos y preparar eventos MEJORADO ---
export async function renderAnime() {
    const container = document.getElementById("anime-root");
    if (!container) return;
    const list = document.getElementById("anime-list");
    list.innerHTML = `<div class="animate-pulse py-6 text-center">Cargando animes...</div>`;
    try {
        const data = await getAnimeNews({ page: STATE.page, perPage: STATE.perPage });
        STATE.all = data;
        renderList();
    } catch (e) {
        console.error(e);
        list.innerHTML = `
          <div class="text-red-600 p-6 text-center">
            <p>Error al cargar datos. Intenta más tarde.</p>
            <button id="retry-button" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">Reintentar</button>
          </div>
        `;
        document.getElementById('retry-button')?.addEventListener('click', renderAnime);
    }
}

function initAnimeUI() {
  const search = document.getElementById("anime-search");
  const sort = document.getElementById("anime-sort");
  if (search) {
    search.addEventListener("input", () => {
      clearTimeout(search.timeout);
      search.timeout = setTimeout(renderList, 300);
    });
  }
  sort?.addEventListener("change", renderList);
}

// Auto-init si estamos en la página de anime
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById("anime-root")) {
        initAnimeUI();
        renderAnime();
    }
});
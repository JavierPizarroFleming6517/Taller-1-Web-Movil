const API_BASE_URL = "http://localhost:3000";

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return isNaN(date) ? "-" : date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function mapApiAnimeToFrontend(a) {
  return {
    // títulos
    title: a.title,
    title_english: a.title_english ?? "",
    title_japanese: a.title_japanese ?? "",

    // sinopsis
    synopsis: a.synopsis,

    // imagen (imitamos estructura de Jikan)
    images: {
      jpg: {
        image_url: a.imageUrl || a.image_url || "",
      },
    },

    // datos extra
    score: a.score ?? null,
    type: a.type ?? "",
    episodes: a.episodes ?? 0,

    // fechas
    aired: {
      from:
        a.airedFrom ||
        a.aired_from ||
        a.startDate ||
        a.start_date ||
        null,
    },

    // link externo si tienes algo guardado
    url: a.url || "#",
  };
}

export async function getAnimeNews({ page = 1, perPage = 20 } = {}) {
    const qs = new URLSearchParams({ limit: perPage, page });
    
    try {
        const response = await fetch(`${API_BASE_URL}/anime?${qs}`);
        if (!response.ok) throw new Error("Error al obtener los animes");
        const data = await response.json();
        const list = Array.isArray(data)
          ? data
          : data.data || data.items || [];

        return list.map(mapApiAnimeToFrontend);
    } catch (error) {
        console.error("Error fetching anime:", error);
        throw error;
    }
}

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

const STATE = {
  all: [],
  filtered: [],
  page: 1,
  perPage: 24,
  sort: 'score'
};

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
    <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${filtered.map(animeCard).join("")}
    </ul>
  `;
}

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
  const reloadBtn = document.getElementById("recetas-reload");

  if (search) {
    search.addEventListener("input", () => {
      clearTimeout(search.timeout);
      search.timeout = setTimeout(renderList, 300);
    });
  }

  sort?.addEventListener("change", renderList);

  if (reloadBtn) {
    reloadBtn.addEventListener("click", () => {
      renderAnime();
      if (search) search.value = '';
      if (sort) sort.value = STATE.sort;
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById("anime-root")) {
        initAnimeUI();
        renderAnime();
    }
});

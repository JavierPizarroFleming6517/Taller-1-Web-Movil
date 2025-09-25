
// --- API ---
export async function getCategories() {
  const url = "https://www.themealdb.com/api/json/v1/1/categories.php";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Error al obtener categorías de recetas");
  return await response.json();
}

// --- Card visual tipo anime.js pero con datos de recetas ---
function recetaCard(cat) {
  return `
    <li class="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 border-b py-4 px-2 sm:px-4">
      <img src="${cat.strCategoryThumb || ''}" alt="${cat.strCategory}" class="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0 mb-2 sm:mb-0 bg-white" loading="lazy">
      <div class="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:gap-4">
        <div class="min-w-0">
          <div class="font-semibold text-base sm:text-lg truncate">${cat.strCategory}</div>
          <div class="text-xs sm:text-sm text-slate-500 mt-1">${cat.strCategoryDescription?.slice(0, 60) || ''}</div>
        </div>
      </div>
    </li>
  `;
}

// --- Estado global ---
const STATE = {
  all: [],
  filtered: [],
  page: 1,
  perPage: 12,
  sort: 'name',
  search: ''
};

// --- Render listado ---
function renderList() {
  const list = document.getElementById("recetas-list");
  const search = document.getElementById("recetas-search")?.value?.toLowerCase() ?? "";
  const sort = document.getElementById("recetas-sort")?.value ?? STATE.sort;

  let filtered = STATE.all.filter(cat => cat.strCategory.toLowerCase().includes(search));
  filtered.sort((a, b) => a.strCategory.localeCompare(b.strCategory));
  STATE.filtered = filtered;

  if (!list) return;
  if (!filtered.length) {
    list.innerHTML = `<div class="p-6 text-center text-slate-500">No se encontraron categorías</div>`;
    document.getElementById("recetas-count")?.remove();
    document.getElementById("recetas-pagination")?.remove();
    return;
  }
  // Calcular paginación
  const total = filtered.length;
  const start = (STATE.page - 1) * STATE.perPage + 1;
  const end = Math.min(start + STATE.perPage - 1, total);
  // Mostrar cantidad
  let countDiv = document.getElementById("recetas-count");
  if (!countDiv) {
    countDiv = document.createElement("div");
    countDiv.id = "recetas-count";
    list.parentElement.insertBefore(countDiv, list);
  }
  countDiv.className = "text-sm text-gray-600 mb-2";
  countDiv.innerText = `Mostrando ${start} a ${end} de ${total}`;
  // Render listado y paginación
  list.innerHTML = `
    <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      ${filtered.slice(start-1, end).map(recetaCard).join("")}
    </ul>
    <div id="recetas-pagination" class="flex gap-4 justify-center mt-6">
      <button id="recetas-prev" class="px-4 py-2 bg-gray-400 text-white rounded-lg disabled:opacity-50">Anterior</button>
      <button id="recetas-next" class="px-4 py-2 bg-green-500 text-white rounded-lg disabled:opacity-50">Siguiente</button>
    </div>
  `;
  // Botones
  const prevBtn = document.getElementById("recetas-prev");
  const nextBtn = document.getElementById("recetas-next");
  prevBtn.onclick = () => {
    if (STATE.page > 1) {
      STATE.page--;
      renderList();
    }
  };
  nextBtn.onclick = () => {
    if (end < total) {
      STATE.page++;
      renderList();
    }
  };
  prevBtn.disabled = STATE.page === 1;
  nextBtn.disabled = end >= total;
}

// --- Cargar datos y preparar eventos ---
export async function renderRecetas() {
  const container = document.getElementById("recetas-root");
  if (!container) return;
  const list = document.getElementById("recetas-list");
  list.innerHTML = `<div class=\"animate-pulse py-6 text-center\">Cargando categorías...</div>`;
  try {
    const data = await getCategories();
    STATE.all = data.categories;
    renderList();
  } catch (e) {
    console.error(e);
    list.innerHTML = `<div class=\"text-red-600 p-6 text-center\">Error al cargar datos. Intenta más tarde.</div>`;
  }
}

function initRecetasUI() {
  const search = document.getElementById("recetas-search");
  const sort = document.getElementById("recetas-sort");
  search?.addEventListener("input", () => {
    clearTimeout(search.timeout);
    search.timeout = setTimeout(renderList, 300);
  });
  sort?.addEventListener("change", renderList);
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById("recetas-root")) {
    initRecetasUI();
    renderRecetas();
  }
});
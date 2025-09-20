//Estilo para los USD y porcentajes
function formatCurrency(n){
    return n?.toLocaleString(undefined, {style: "currency", currency: "USD"}) ?? "-";
}

function porcentaje(n){
    if(n===null || n===undefined) return "-";
    const sign = n > 0 ? "+" : "";
    return `${sign}${n.toFixed(2)}%`;
}

//Llamar a la API
export async function getCripto({page =1, perPage=20, vs="usd"} = {}){
    const url = "https://api.coingecko.com/api/v3/coins/markets";
    const qs = new URLSearchParams({
        vs_currency: vs, //Moneda (usd)
        order: "market_cap_desc", //Orden por mercado
        per_page: perPage, //Cuantas monedas traer de la api
        page,
        sparkline: "false", //sin sparkline
        price_change_percentage: "24h" //varia cada 24h
    });
    const response = await fetch(url);
    if(!response.ok) throw new Error("Error al obtener las criptomonedas");
    return await response.json();

}

// --- Render de tarjetas ---
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
        <p class="${color} text-sm">${pct(change)}</p>
      </div>
    </article>
  `;
}

// --- Estado global simple ---
let STATE = {
  all: [],          // datos crudos del fetch
  filtered: [],     // datos tras filtro/búsqueda
  page: 1,
  perPage: 24
};

// --- Render listado (aplica filtro + orden) ---
function renderList() {
  const list = document.getElementById("crypto-list");
  const search = document.getElementById("crypto-search")?.value?.toLowerCase() ?? "";
  const sort = document.getElementById("crypto-sort")?.value ?? "market_cap";

  // Filtro por nombre o símbolo
  const filtered = STATE.all.filter(c =>
    c.name.toLowerCase().includes(search) || c.symbol.toLowerCase().includes(search)
  );

  // Ordenamiento simple
  const sorted = filtered.sort((a, b) => {
    switch (sort) {
      case "price": return b.current_price - a.current_price;
      case "change": return (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0);
      case "market_cap":
      default: return (b.market_cap ?? 0) - (a.market_cap ?? 0);
    }
  });

  STATE.filtered = sorted;

  // Pintar
  if (!list) return;
  if (!sorted.length) {
    list.innerHTML = `<div class="p-6 text-center text-slate-500">Sin resultados</div>`;
    return;
  }
  list.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      ${sorted.map(coinCard).join("")}
    </div>
  `;
}

// --- Cargar datos y preparar eventos ---
export async function renderCrypto() {
  const container = document.getElementById("crypto-root");
  if (!container) return;

  const list = document.getElementById("crypto-list");
  list.innerHTML = `<div class="animate-pulse py-6 text-center">Cargando criptomonedas…</div>`;

  try {
    const data = await fetchTopCoins({ page: STATE.page, perPage: STATE.perPage });
    STATE.all = data;
    renderList();
  } catch (e) {
    console.error(e);
    list.innerHTML = `<div class="text-red-600">Error al cargar datos. Intenta más tarde.</div>`;
  }
}

function initCryptoUI() {
  const search = document.getElementById("crypto-search");
  const sort = document.getElementById("crypto-sort");
  const reload = document.getElementById("crypto-reload");

  search?.addEventListener("input", renderList);  // filtra live
  sort?.addEventListener("change", renderList);   // re-ordena
  reload?.addEventListener("click", renderCrypto);// recarga desde API
}

// Auto-init si estamos en la página de crypto
if (document.getElementById("crypto-root")) {
  initCryptoUI();
  renderCrypto();
}
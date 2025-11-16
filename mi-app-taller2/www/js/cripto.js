export async function getCripto({ page = 1, perPage = 20, vs = "usd" } = {}) {
  const url = "https://api.coingecko.com/api/v3/coins/markets";
  const qs = new URLSearchParams({
    vs_currency: vs,
    order: "market_cap_desc",
    per_page: perPage,
    page,
    sparkline: "false",
    price_change_percentage: "24h"
  });
  const response = await fetch(`${url}?${qs}`);
  if (!response.ok) throw new Error("Error al obtener las criptomonedas");
  return await response.json();
}
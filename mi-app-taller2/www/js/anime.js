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
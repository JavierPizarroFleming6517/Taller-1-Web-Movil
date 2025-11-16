// js/anime.js

// Esta es la URL de TU backend de NestJS
const API_URL = "http://localhost:3000/anime";

/**
 * Obtiene los animes desde tu propio backend de NestJS.
 * Corresponde a: @Get() en AnimeController
 */
export async function getAnimeNews({ page = 1, perPage = 20 } = {}) {
  // Tu backend de NestJS espera "limit", no "perPage"
  const qs = new URLSearchParams({
    page: page.toString(),
    limit: perPage.toString(),
  });

  try {
    const response = await fetch(`${API_URL}?${qs}`);
    if (!response.ok) {
      throw new Error("Error al obtener los animes desde el backend de NestJS");
    }
    
    // Tu servicio de NestJS ya devuelve el array de animes transformado
    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Error fetching anime:", error);
    throw error;
  }
}
// js/pokemones.js
// Esta es la URL de TU backend de FastAPI
const API_URL = "http://127.0.0.1:8000/pokemons";

/**
 * Obtiene TODOS los Pokémon de tu base de datos.
 * Corresponde a: @router.get("/") en pokemon_router.py
 */
export async function getPokemons() {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error("Error al obtener la lista de Pokémon de tu backend");
  }
  return await response.json();
}

/**
 * Obtiene UN solo Pokémon por su ID.
 * Corresponde a: @router.get("/{pokemon_id}") en pokemon_router.py
 */
export async function getPokemonDetail(pokemonId) {
  // Nota: Esta función ya no se usa en loadPokemons, 
  // pero es útil tenerla si quieres una vista de detalle.
  const response = await fetch(`${API_URL}/${pokemonId}`);
  if (!response.ok) {
    throw new Error("Error al obtener el detalle del Pokémon de tu backend");
  }
  return await response.json();
}

/**
 * Crea un nuevo Pokémon.
 * Corresponde a: @router.post("/") en pokemon_router.py
 */
export async function createPokemon(pokemonData) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pokemonData), // ej: { name: "Pikachu", type: "Electric", level: 10 }
  });
  if (!response.ok) {
    throw new Error("Error al crear el Pokémon");
  }
  return await response.json();
}

/**
 * Actualiza un Pokémon existente.
 * Corresponde a: @router.put("/{pokemon_id}") en pokemon_router.py
 */
export async function updatePokemon(pokemonId, pokemonData) {
  const response = await fetch(`${API_URL}/${pokemonId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pokemonData), // ej: { level: 11 }
  });
  if (!response.ok) {
    throw new Error("Error al actualizar el Pokémon");
  }
  return await response.json();
}

/**
 * Elimina un Pokémon.
 * Corresponde a: @router.delete("/{pokemon_id}") en pokemon_router.py
 */
export async function deletePokemon(pokemonId) {
  const response = await fetch(`${API_URL}/${pokemonId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Error al eliminar el Pokémon");
  }
  return await response.json(); // Devuelve { "message": "Pokemon deleted successfully" }
}
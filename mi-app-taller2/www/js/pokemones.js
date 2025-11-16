// js/pokemon.js

export async function getPokemons(limit = 1000, offset = 0) {
  const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Error al obtener lista de Pokémon");
  return await response.json();
}

export async function getPokemonDetail(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Error al obtener detalle del Pokémon");
  return await response.json();
}
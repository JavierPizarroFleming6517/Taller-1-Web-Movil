// js/recetas.js

// Esta es la URL de TU backend de Express
// (Puerto 4000 y prefijo /api/recetas según tu README)
const API_URL = "http://localhost:4000/api/recetas";

/**
 * Obtiene TODAS las recetas de tu base de datos MongoDB.
 * Corresponde a: getRecetas (backend)
 */
export async function getRecetas() {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error("Error al obtener la lista de recetas");
  }
  return await response.json();
}

/**
 * Obtiene UNA sola receta por su ID.
 * Corresponde a: getReceta (backend)
 */
export async function getReceta(id) {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) {
    throw new Error("Error al obtener el detalle de la receta");
  }
  return await response.json();
}

/**
 * Crea una nueva receta.
 * Corresponde a: createReceta (backend)
 */
export async function createReceta(recetaData) {
  // El backend espera: nombre, categoria, ingredientes, instrucciones
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(recetaData),
  });
  if (!response.ok) {
    throw new Error("Error al crear la receta");
  }
  return await response.json();
}

/**
 * Actualiza una receta existente.
 * Corresponde a: updateReceta (backend)
 */
export async function updateReceta(id, recetaData) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(recetaData),
  });
  if (!response.ok) {
    throw new Error("Error al actualizar la receta");
  }
  return await response.json();
}

/**
 * Elimina una receta.
 * Corresponde a: deleteReceta (backend)
 */
export async function deleteReceta(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Error al eliminar la receta");
  }
  return await response.json(); // Devuelve { msg: "Receta eliminada" }
}
// js/recetas.js

// Tu API Express corre en el puerto 5000
const API_BASE_URL = "http://localhost:5000";

// Adaptador: de documento Receta de Mongo -> objeto que usa el front
function mapRecetaToCategory(r) {
  return {
    // dejamos TODOS los campos originales…
    ...r,

    // …y además agregamos los "alias" que usaba antes el front
    idCategory: r.idCategory || r._id || r.id || null,
    strCategory: r.strCategory || r.categoria || r.nombre || "Sin nombre",
    strCategoryThumb:
      r.strCategoryThumb || r.imagen || r.imageUrl || r.image || "",
    strCategoryDescription:
      r.strCategoryDescription || r.instrucciones || ""
  };
}

// Esta función consume tu API: GET http://localhost:5000/api/recetas
export async function getCategories() {
  const url = `${API_BASE_URL}/api/recetas`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        "Respuesta no OK al pedir recetas:",
        response.status,
        response.statusText
      );
      throw new Error("Error al obtener categorías de recetas desde la API propia");
    }

    const data = await response.json();
    console.log("Respuesta cruda de /api/recetas:", data);

    const list = Array.isArray(data)
      ? data
      : data.recetas || data.data || [];

    return list.map(mapRecetaToCategory);
  } catch (error) {
    console.error("Error fetching categorías (recetas) desde Express:", error);
    throw error;
  }
}
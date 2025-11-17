export async function getCategories() {
  const url = "https://www.themealdb.com/api/json/v1/1/categories.php";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Error al obtener categorías de recetas");
  const data = await response.json();
  return data.categories;
}
import { getPokemons, getPokemonDetail } from "./pokemones.js";
import { getCategories } from "./recetas.js";

let offset = 0;
const limit = 20;

//pokemones
async function mostrarPokemons() {
  const container = document.getElementById("pokemon-info");
  if (!container) return; // <- si no estamo en pokemones.html, no hacer nada

  container.innerHTML = "Cargando...";

  try {
    const data = await getPokemons(limit, offset);

    document.getElementById("info-count").innerText =
      `Mostrando ${offset + 1} a ${Math.min(offset + limit, data.count)} de ${data.count}`;

    const detalles = await Promise.all(data.results.map(p => getPokemonDetail(p.url)));

    container.innerHTML = detalles.map(d => `
      <div class="card p-4 bg-white rounded-lg shadow-md text-center">
        <h3 class="capitalize font-bold">${d.name}</h3>
        <img src="${d.sprites.front_default || ''}" alt="${d.name}" class="mx-auto">
        <p>Peso: ${d.weight}</p>
      </div>
    `).join('');

    document.getElementById("next").disabled = !data.next;
    document.getElementById("prev").disabled = !data.previous;

  } catch (error) {
    console.error(error);
    container.innerText = "Error al cargar Pokémon";
  }
}

//estas weas solo se muestran si estamos en el dom de pokemones.html
if (document.getElementById("next") && document.getElementById("prev")) {
  document.getElementById("next").onclick = () => { offset += limit; mostrarPokemons(); };
  document.getElementById("prev").onclick = () => { if(offset >= limit){ offset -= limit; mostrarPokemons(); } };
  mostrarPokemons();
}



//recetas
async function mostrarCategorias() {
  const container = document.getElementById("recetas-info");
  if (!container) return; // <- si no estamo en recetas.html, no hacer nada

  container.innerHTML = "Cargando...";

  try {
    const data = await getCategories();

    container.innerHTML = data.categories.map(cat => `
      <div class="card p-4 bg-white rounded-lg shadow-md text-center">
        <h3 class="font-bold">${cat.strCategory}</h3>
        <img src="${cat.strCategoryThumb}" alt="${cat.strCategory}" class="mx-auto">
        <p>${cat.strCategoryDescription.substring(0, 100)}...</p>
      </div>
    `).join('');

  } catch (error) {
    console.error(error);
    container.innerText = "Error al cargar categorías";
  }
}

if (document.getElementById("recetas-info")) {
  mostrarCategorias();
}

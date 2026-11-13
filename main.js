const form = document.getElementById('form-juego');
const grid = document.getElementById('grid-juegos');
const mensaje = document.getElementById('mensaje');
const boton = form.querySelector('button[type="submit"]');

const IMG_RESPALDO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260">' +
    '<rect width="100%" height="100%" fill="#e9eaf0"/>' +
    '<text x="50%" y="50%" fill="#6b6e80" font-family="Arial" font-size="20" ' +
    'text-anchor="middle" dominant-baseline="middle">Sin portada</text></svg>'
  );

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = 'mensaje ' + tipo; 
}

function mostrarEstadoCatalogo(texto) {
  grid.innerHTML = '';
  const p = document.createElement('p');
  p.className = 'empty-message';
  p.textContent = texto;
  grid.appendChild(p);
}

function crearTarjeta(juego) {
  const card = document.createElement('article');
  card.className = 'card-juego';

  const img = document.createElement('img');
  img.src = juego.portada;
  img.alt = 'Portada de ' + juego.titulo;
  img.loading = 'lazy';
  img.onerror = () => { img.onerror = null; img.src = IMG_RESPALDO; };

  const cuerpo = document.createElement('div');
  cuerpo.className = 'card-body';

  const titulo = document.createElement('h3');
  titulo.textContent = juego.titulo;

  const meta = document.createElement('div');
  meta.className = 'card-meta';

  const genero = document.createElement('span');
  genero.className = 'badge';
  genero.textContent = juego.genero;

  const puntos = document.createElement('span');
  puntos.className = 'puntos';
  puntos.textContent = '⭐ ' + juego.puntuacion + '/10';

  meta.append(genero, puntos);

  const resena = document.createElement('p');
  resena.className = 'resena';
  resena.textContent = juego.resena;

  cuerpo.append(titulo, meta, resena);
  card.append(img, cuerpo);
  return card;
}
async function cargarJuegos() {
  const { data, error } = await supabase
    .from('juegos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error al cargar el catálogo:', error);
    mostrarEstadoCatalogo('No se pudo cargar el catálogo: ' + error.message);
    return;
  }

  if (!data || data.length === 0) {
    mostrarEstadoCatalogo('Todavía no hay recomendaciones. ¡Sé el primero en publicar una!');
    return;
  }

  grid.innerHTML = '';
  data.forEach((juego) => grid.appendChild(crearTarjeta(juego)));
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nuevoJuego = {
    titulo: document.getElementById('titulo').value.trim(),
    genero: document.getElementById('genero').value,
    puntuacion: Number(document.getElementById('puntuacion').value),
    resena: document.getElementById('resena').value.trim(),
    portada: document.getElementById('portada').value.trim(),
    porque: document.getElementById('porque').value.trim()
  };

  boton.disabled = true;
  boton.textContent = 'Guardando...';
  mostrarMensaje('Guardando tu recomendación...', 'info');

  try {
    const { error } = await supabase.from('juegos').insert([nuevoJuego]);
    if (error) throw error;

    mostrarMensaje('¡Recomendación publicada con éxito!', 'exito');
    form.reset();
    await cargarJuegos(); 
  } catch (err) {
    console.error('Error al guardar:', err);
    mostrarMensaje('No se pudo guardar la recomendación: ' + err.message, 'error');
  } finally {
    boton.disabled = false;
    boton.textContent = 'Publicar recomendación';
  }
});

cargarJuegos();

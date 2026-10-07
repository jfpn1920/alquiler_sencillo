// ===== REFERENCIAS A LOS ELEMENTOS DEL HTML =====
const formulario = document.getElementById('formulario');
const inputCliente = document.getElementById('cliente');
const selectObjeto = document.getElementById('objeto');
const inputDias = document.getElementById('dias');
const precioDia = document.getElementById('precioDia');
const precioTotal = document.getElementById('precioTotal');
const mensaje = document.getElementById('mensaje');
const lista = document.getElementById('lista');
const textoVacio = document.getElementById('vacio');
const totalGeneral = document.getElementById('totalGeneral');
// ===== OBJETOS DISPONIBLES PARA ALQUILAR (precio por día en pesos) =====
const objetos = [
    { id: 'bicicleta', nombre: 'Bicicleta', precio: 25000 },
    { id: 'carpa', nombre: 'Carpa para 4 personas', precio: 40000 },
    { id: 'taladro', nombre: 'Taladro eléctrico', precio: 30000 },
    { id: 'proyector', nombre: 'Proyector', precio: 60000 },
    { id: 'parlante', nombre: 'Parlante grande', precio: 45000 }
];
// ===== CLAVES DE LOCALSTORAGE =====
const CLAVE_ALQUILERES = 'alquiler_lista';      // alquileres registrados
const CLAVE_BORRADOR = 'alquiler_borrador';     // lo escrito en el formulario
// ===== FORMATO DE MONEDA (pesos colombianos, sin decimales) =====
const formatoMoneda = new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0
});
// ===== LEER DATOS GUARDADOS =====
// Devuelve el valor guardado (convertido de texto a objeto) o uno por defecto
function leerStorage(clave, porDefecto) {
    try {
        const guardado = localStorage.getItem(clave);
        return guardado ? JSON.parse(guardado) : porDefecto;
    } catch (error) {
        return porDefecto;
    }
}
// Al cargar la página recuperamos los alquileres guardados
let alquileres = leerStorage(CLAVE_ALQUILERES, []);
// ===== LLENAR LA LISTA DESPLEGABLE CON LOS OBJETOS =====
function llenarSelect() {
    objetos.forEach(objeto => {
        const opcion = document.createElement('option');
        opcion.value = objeto.id;
        opcion.textContent = objeto.nombre;
        selectObjeto.appendChild(opcion);
    });
}
// ===== MOSTRAR EL PRECIO DEL OBJETO ELEGIDO =====
function actualizarPrecio() {
    const objeto = objetos.find(o => o.id === selectObjeto.value);  // busca el objeto elegido
    const dias = parseInt(inputDias.value, 10);
    // Sin objeto elegido mostramos una raya; con objeto, su precio por día
    precioDia.textContent = objeto ? formatoMoneda.format(objeto.precio) : '—';
    // El total solo se calcula si hay objeto y los días son válidos
    precioTotal.textContent = objeto && dias >= 1
        ? formatoMoneda.format(objeto.precio * dias) : '—';
}
// ===== GUARDAR Y RECUPERAR LO ESCRITO EN EL FORMULARIO =====
function guardarBorrador() {
    localStorage.setItem(CLAVE_BORRADOR, JSON.stringify({
        cliente: inputCliente.value, objeto: selectObjeto.value, dias: inputDias.value
    }));
}
function cargarBorrador() {
    const borrador = leerStorage(CLAVE_BORRADOR, null);
    if (!borrador) return;
    inputCliente.value = borrador.cliente;
    selectObjeto.value = borrador.objeto;
    inputDias.value = borrador.dias;
}
// ===== REGISTRAR UN ALQUILER =====
function registrarAlquiler(evento) {
    evento.preventDefault();  // evita que la página se recargue
    const cliente = inputCliente.value.trim();
    const objeto = objetos.find(o => o.id === selectObjeto.value);
    const dias = parseInt(inputDias.value, 10);
    // Validaciones: si algo está mal, mostramos el error y salimos
    if (cliente === '') return (mensaje.textContent = 'Escribe el nombre de quien alquila.');
    if (!objeto) return (mensaje.textContent = 'Selecciona un objeto.');
    if (isNaN(dias) || dias < 1 || dias > 30) return (mensaje.textContent = 'Los días deben estar entre 1 y 30.');
    alquileres.push({ id: Date.now(), cliente, objeto: objeto.nombre, dias, total: objeto.precio * dias });
    localStorage.setItem(CLAVE_ALQUILERES, JSON.stringify(alquileres));
    formulario.reset();                        // limpia el formulario
    localStorage.removeItem(CLAVE_BORRADOR);   // el borrador ya no hace falta
    mensaje.textContent = '';
    actualizarPrecio();
    dibujarLista();
}
// ===== ELIMINAR UN ALQUILER =====
function eliminarAlquiler(id) {
    alquileres = alquileres.filter(a => a.id !== id);  // conserva todos menos ese id
    localStorage.setItem(CLAVE_ALQUILERES, JSON.stringify(alquileres));
    dibujarLista();
}
// ===== DIBUJAR LA LISTA DE ALQUILERES =====
function dibujarLista() {
    lista.innerHTML = '';
    let suma = 0;
    alquileres.forEach(alquiler => {
        suma += alquiler.total;
        const item = document.createElement('li');
        item.className = 'item';
        // Texto: cliente y detalle del alquiler
        const info = document.createElement('div');
        info.innerHTML = '<div class="item-nombre"></div><div class="item-detalle"></div>';
        info.querySelector('.item-nombre').textContent = alquiler.cliente;
        info.querySelector('.item-detalle').textContent =
            `${alquiler.objeto} · ${alquiler.dias} ${alquiler.dias === 1 ? 'día' : 'días'}`;
        // Total de este alquiler
        const total = document.createElement('div');
        total.className = 'item-total';
        total.textContent = formatoMoneda.format(alquiler.total);
        // Botón para eliminar solo este alquiler
        const boton = document.createElement('button');
        boton.className = 'btn-eliminar';
        boton.textContent = 'Eliminar';
        boton.addEventListener('click', () => eliminarAlquiler(alquiler.id));
        item.append(info, total, boton);
        lista.appendChild(item);
    });
    textoVacio.hidden = alquileres.length > 0;        // oculta el texto si hay alquileres
    totalGeneral.textContent = formatoMoneda.format(suma);
}
// ===== EVENTOS =====
formulario.addEventListener('submit', registrarAlquiler);
// Cada vez que se cambia algo: se actualiza el precio y se guarda el borrador
formulario.addEventListener('input', () => {
    actualizarPrecio();
    guardarBorrador();
});
// ===== INICIO: se ejecuta al cargar o refrescar la página =====
llenarSelect();     // agrega los objetos a la lista desplegable
cargarBorrador();   // recupera lo que estaba escrito en el formulario
actualizarPrecio(); // muestra el precio del objeto que estaba elegido
dibujarLista();     // dibuja los alquileres guardados
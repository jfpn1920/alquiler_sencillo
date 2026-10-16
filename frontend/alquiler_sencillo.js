//-------------------------------------//
//--|funcionalidad_alquiler_sencillo|--//
//-------------------------------------//
const formulario = document.querySelector("#formulario");
const cliente = document.querySelector("#cliente");
const objetoSelect = document.querySelector("#objeto");
const dias = document.querySelector("#dias");
const precioDia = document.querySelector("#precioDia");
const precioTotal = document.querySelector("#precioTotal");
const mensaje = document.querySelector("#mensaje");
const lista = document.querySelector("#lista");
const vacio = document.querySelector("#vacio");
const totalGeneral = document.querySelector("#totalGeneral");
const objetos = [
    { id: "bicicleta", nombre: "Bicicleta", precio: 25000 },
    { id: "carpa", nombre: "Carpa para 4 personas", precio: 40000 },
    { id: "taladro", nombre: "Taladro eléctrico", precio: 30000 },
    { id: "proyector", nombre: "Proyector", precio: 60000 },
    { id: "parlante", nombre: "Parlante grande", precio: 45000 }
];
const CLAVE_LISTA = "alquiler_lista";
const CLAVE_BORRADOR = "alquiler_borrador";
const formatoMoneda = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
});
//-----------------------------------//
//--|leer_datos_del_almacenamiento|--//
//-----------------------------------//
function leerStorage(clave, porDefecto) {
    try {
        const datos = localStorage.getItem(clave);
        return datos ? JSON.parse(datos) : porDefecto;
    } catch (error) {
        return porDefecto;
    }
}
let alquileres = leerStorage(CLAVE_LISTA, []);
//-----------------------------//
//--|llenar_lista_de_objetos|--//
//-----------------------------//
function llenarSelect() {
    objetos.forEach(function(objeto) {
        const opcion = document.createElement("option");
        opcion.value = objeto.id;
        opcion.textContent = objeto.nombre;
        objetoSelect.appendChild(opcion);
    });
}
//------------------------------------//
//--|actualizar_precio_del_alquiler|--//
//------------------------------------//
function actualizarPrecio() {
    const objeto = objetos.find(function(elemento) {
        return elemento.id === objetoSelect.value;
    });
    const cantidadDias = Number.parseInt(dias.value, 10);
    if (!objeto || !Number.isInteger(cantidadDias) || cantidadDias < 1 || cantidadDias > 30) {
        precioDia.textContent = formatoMoneda.format(0);
        precioTotal.textContent = formatoMoneda.format(0);
        return;
    }
    precioDia.textContent = formatoMoneda.format(objeto.precio);
    precioTotal.textContent = formatoMoneda.format(objeto.precio * cantidadDias);
}
//-------------------------------------//
//--|guardar_borrador_del_formulario|--//
//-------------------------------------//
function guardarBorrador() {
    const borrador = {
        cliente: cliente.value,
        objeto: objetoSelect.value,
        dias: dias.value
    };
    localStorage.setItem(CLAVE_BORRADOR, JSON.stringify(borrador));
}
//---------------------------------------//
//--|recuperar_borrador_del_formulario|--//
//---------------------------------------//
function cargarBorrador() {
    const borrador = leerStorage(CLAVE_BORRADOR, null);
    if (!borrador) {
        return;
    }
    cliente.value = borrador.cliente || "";
    objetoSelect.value = borrador.objeto || "";
    dias.value = borrador.dias || "1";
}
//---------------------------------//
//--|registrar_un_nuevo_alquiler|--//
//---------------------------------//
function registrarAlquiler(evento) {
    evento.preventDefault();
    const nombreCliente = cliente.value.trim();
    const objeto = objetos.find(function(elemento) {
        return elemento.id === objetoSelect.value;
    });
    const cantidadDias = Number(dias.value);
    if (!nombreCliente) {
        mensaje.textContent = "Escribe el nombre del cliente.";
        cliente.focus();
        return;
    }
    if (!objeto) {
        mensaje.textContent = "Selecciona un objeto para alquilar.";
        objetoSelect.focus();
        return;
    }
    if (!Number.isInteger(cantidadDias) || cantidadDias < 1 || cantidadDias > 30) {
        mensaje.textContent = "Los días deben estar entre 1 y 30.";
        dias.focus();
        return;
    }
    alquileres.push({
        id: Date.now(),
        cliente: nombreCliente,
        objeto: objeto.nombre,
        dias: cantidadDias,
        total: objeto.precio * cantidadDias
    });
    localStorage.setItem(CLAVE_LISTA, JSON.stringify(alquileres));
    formulario.reset();
    localStorage.removeItem(CLAVE_BORRADOR);
    mensaje.textContent = "";
    actualizarPrecio();
    dibujarLista();
}
//--------------------------//
//--|eliminar_un_alquiler|--//
//--------------------------//
function eliminarAlquiler(id) {
    alquileres = alquileres.filter(function(alquiler) {
        return alquiler.id !== id;
    });
    localStorage.setItem(CLAVE_LISTA, JSON.stringify(alquileres));
    dibujarLista();
}
//------------------------------------//
//--|mostrar_alquileres_registrados|--//
//------------------------------------//
function dibujarLista() {
    lista.innerHTML = "";
    let suma = 0;
    alquileres.forEach(function(alquiler) {
        suma += alquiler.total;
        const elemento = document.createElement("li");
        elemento.className = "item";
        const nombre = document.createElement("div");
        nombre.className = "item-nombre";
        nombre.textContent = alquiler.cliente;
        const detalle = document.createElement("div");
        detalle.className = "item-detalle";
        detalle.textContent = alquiler.objeto + " · " + alquiler.dias + " día(s)";
        const total = document.createElement("div");
        total.className = "item-total";
        total.textContent = formatoMoneda.format(alquiler.total);
        const botonEliminar = document.createElement("button");
        botonEliminar.type = "button";
        botonEliminar.className = "btn-eliminar";
        botonEliminar.textContent = "Eliminar";
        botonEliminar.addEventListener("click", function() {
            eliminarAlquiler(alquiler.id);
        });
        elemento.appendChild(nombre);
        elemento.appendChild(detalle);
        elemento.appendChild(total);
        elemento.appendChild(botonEliminar);
        lista.appendChild(elemento);
    });
    vacio.hidden = alquileres.length > 0;
    totalGeneral.textContent = formatoMoneda.format(suma);
}
//----------------------------//
//--|eventos_del_formulario|--//
//----------------------------//
formulario.addEventListener("submit", registrarAlquiler);
formulario.addEventListener("input", function() {
    actualizarPrecio();
    guardarBorrador();
});
formulario.addEventListener("change", function() {
    actualizarPrecio();
    guardarBorrador();
});
//------------------------//
//--|iniciar_aplicacion|--//
//------------------------//
llenarSelect();
cargarBorrador();
actualizarPrecio();
dibujarLista();
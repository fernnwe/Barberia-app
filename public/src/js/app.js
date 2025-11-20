const SUPABASE_URL = "https://dcbwwcdsmbwlphrlsnyf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjYnd3Y2RzbWJ3bHBocmxzbnlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MDkyODksImV4cCI6MjA3OTE4NTI4OX0.KwKgpL1JsVpTlPqmGhtlHaH7uIg6nsP2dtilqEJrKUo";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Elementos de Registro
const tipoCorte = document.getElementById("tipoCorte");
const precio = document.getElementById("precio");
const btnRegistrar = document.getElementById("btnRegistrar");
const lista = document.getElementById("listaRegistros");
const totalDiarioSpan = document.getElementById("totalDiario");

// Elementos de Informes
const totalSemanalSpan = document.getElementById("totalSemanal");
const totalQuincenalSpan = document.getElementById("totalQuincenal");
const totalMensualSpan = document.getElementById("totalMensual");
const fechaFiltro = document.getElementById("fecha-filtro");
const btnFiltrar = document.getElementById("btnFiltrar");
const btnExportar = document.getElementById("btnExportar");
const listaInformes = document.getElementById("listaInformes");
const totalPeriodoSpan = document.getElementById("totalPeriodo");

// Elementos de Navegación
const navButtons = document.querySelectorAll(".nav-button");
const registroView = document.getElementById("registro-view");
const informesView = document.getElementById("informes-view");

// Variable para almacenar los datos del filtro de informes para la exportación
let lastLoadedData = []; 

const PRECIOS_CORTES = {
    "Corte normal": 120,
    "Fade": 150,
    "Barba": 100
};

// --- FUNCIONES DE UTILIDAD DE FECHAS ---

/** Obtiene una fecha hace N días en formato YYYY-MM-DD */
function getFechaHaceNDias(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split("T")[0];
}

// --- LÓGICA DE NAVEGACIÓN ---

navButtons.forEach(button => {
    button.addEventListener("click", () => {
        const view = button.getAttribute("data-view");
        
        // 1. Alternar Clases de Botones
        navButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        // 2. Ocultar/Mostrar Vistas
        registroView.classList.add("hidden");
        informesView.classList.add("hidden");
        
        if (view === "registro") {
            registroView.classList.remove("hidden");
            cargarRegistros();
        } else if (view === "informes") {
            informesView.classList.remove("hidden");
            cargarTotalesMultiples(); // Cargar totales al cambiar a esta vista
            // Inicialización de la vista de informes
            listaInformes.innerHTML = '<div style="text-align:center; padding: 20px; color:#888;">Selecciona una fecha para ver el historial.</div>';
            totalPeriodoSpan.textContent = "0.00";
        }
    });
});

// --- LÓGICA DE REGISTRO DIARIO ---

tipoCorte.addEventListener("change", () => {
    const selectedCorte = tipoCorte.value;
    precio.value = PRECIOS_CORTES[selectedCorte] || 0;
});

btnRegistrar.addEventListener("click", async () => {
    if (tipoCorte.value === "" || !Number(precio.value) || Number(precio.value) <= 0) {
        alert("Selecciona un servicio y verifica el precio.");
        return;
    }

    await db.from("cortes").insert({
        tipo: tipoCorte.value,
        precio: Number(precio.value),
        fecha: new Date().toISOString().split("T")[0]
    });

    tipoCorte.value = "";
    precio.value = "";
    cargarRegistros();
});

// --- FUNCIONES DE BASE DE DATOS Y RENDERIZADO ---

async function eliminarRegistro(id) {
    if (confirm("¿Estás seguro de que quieres eliminar este registro?")) {
        await db.from("cortes").delete().eq("id", id);
        // Recargar la vista actual (Registro o Informes)
        if (!registroView.classList.contains("hidden")) {
            cargarRegistros();
        } else {
            // Si estamos en informes, intentamos recargar el filtro
            if(fechaFiltro.value) {
                btnFiltrar.click(); 
            } else {
                cargarTotalesMultiples();
            }
        }
    }
}

lista.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-eliminar")) {
        const id = e.target.getAttribute("data-id");
        eliminarRegistro(id);
    }
});

listaInformes.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-eliminar")) {
        const id = e.target.getAttribute("data-id");
        eliminarRegistro(id);
    }
});

/**
 * Función genérica para obtener ingresos dentro de un rango de fechas.
 * @param {string} fechaInicio - Formato YYYY-MM-DD
 * @param {string} fechaFin - Formato YYYY-MM-DD (usualmente hoy)
 * @returns {Promise<number>} El total de ingresos.
 */
async function getTotalIngresos(fechaInicio, fechaFin) {
    const { data, error } = await db
        .from("cortes")
        .select("precio")
        .gte("fecha", fechaInicio)
        .lte("fecha", fechaFin);

    if (error) {
        console.error("Error al obtener ingresos:", error);
        return 0;
    }

    return data.reduce((sum, reg) => sum + reg.precio, 0);
}

/** Carga y calcula los totales Semanal, Quincenal y Mensual */
async function cargarTotalesMultiples() {
    const hoy = new Date().toISOString().split("T")[0];
    
    // Rango Semanal (Últimos 7 días)
    const inicioSemana = getFechaHaceNDias(7); 
    const totalSemana = await getTotalIngresos(inicioSemana, hoy);
    totalSemanalSpan.textContent = `${totalSemana.toFixed(2)} C$`;

    // Rango Quincenal (Últimos 15 días)
    const inicioQuincena = getFechaHaceNDias(15);
    const totalQuincena = await getTotalIngresos(inicioQuincena, hoy);
    totalQuincenalSpan.textContent = `${totalQuincena.toFixed(2)} C$`;

    // Rango Mensual (Últimos 30 días)
    const inicioMes = getFechaHaceNDias(30);
    const totalMes = await getTotalIngresos(inicioMes, hoy);
    totalMensualSpan.textContent = `${totalMes.toFixed(2)} C$`;
}

/** Carga y muestra los registros del día actual */
async function cargarRegistros() {
    lista.innerHTML = "";
    const hoy = new Date().toISOString().split("T")[0];
    
    // --- CORRECCIÓN DE ZONA HORARIA PARA EL REGISTRO DIARIO ---
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const fechaFinLimite = manana.toISOString().split("T")[0]; // Mañana (YYYY-MM-DD)
    // ------------------------------------------

    await renderRegistros(hoy, fechaFinLimite, lista, totalDiarioSpan, true); 
}

// --- LÓGICA DE FILTRO POR FECHA ("Ver Ingresos") ---

/** Función para filtrar y mostrar registros históricos */
btnFiltrar.addEventListener("click", async () => {
    const fecha = fechaFiltro.value;

    if (!fecha) {
        alert("Por favor, selecciona una fecha para consultar el historial.");
        return;
    }

    // --- CORRECCIÓN DE ZONA HORARIA ---
    const fechaInicio = fecha; 
    const selectedDate = new Date(fecha);
    // Avanzar un día para establecer el límite superior del filtro (el inicio del día siguiente)
    selectedDate.setDate(selectedDate.getDate() + 1);
    const fechaFinLimite = selectedDate.toISOString().split("T")[0]; // Día siguiente

    // Ejecutar el filtro con el rango corregido: [fechaInicio, fechaFinLimite)
    lastLoadedData = await renderRegistros(fechaInicio, fechaFinLimite, listaInformes, totalPeriodoSpan, false);

    // Formatear la fecha original para el título
    const dateFormatted = new Date(fecha).toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Actualizar el título del periodo
    document.querySelector('#informes-view .section-header h3').innerHTML = 
        `Ingresos del ${dateFormatted}: <span id="totalPeriodo">${totalPeriodoSpan.textContent}</span> C$`;
});


/** * Función de renderizado reutilizable para ambas vistas 
 * @param {string} fechaInicio - inicio del periodo (YYYY-MM-DD)
 * @param {string} fechaFin - fin del periodo (YYYY-MM-DD). Usamos < (lt) en la consulta
 */
async function renderRegistros(fechaInicio, fechaFin, contenedorLista, contenedorTotal, isToday = false) {
    contenedorLista.innerHTML = "";
    let total = 0;

    const { data, error } = await db
        .from("cortes")
        .select("*")
        .gte("fecha", fechaInicio) // Mayor o igual al inicio del día seleccionado
        .lt("fecha", fechaFin)     // ¡CORRECCIÓN! Menor estricto al inicio del día siguiente
        .order("id", { ascending: false });

    if (error) {
        console.error("Error al cargar registros:", error);
        return [];
    }
    
    if (data.length === 0) {
        const mensaje = isToday ? 'Aún no hay ingresos registrados hoy.' : 'No se encontraron ingresos para esta fecha.';
        contenedorLista.innerHTML = `<div style="text-align:center; padding: 20px; color:#888;">${mensaje}</div>`;
    }

    data.forEach(reg => {
        const div = document.createElement("div");
        div.className = "registro";
        
        div.innerHTML = `
            <span class="tipo-corte">${reg.tipo}</span>
            <div style="display:flex; align-items:center;">
                <span class="precio-corte">${reg.precio.toFixed(2)} C$</span>
                <button class="btn-eliminar" data-id="${reg.id}" data-fecha="${reg.fecha}">&times;</button>
            </div>
        `;
        contenedorLista.appendChild(div);

        total += reg.precio;
    });

    contenedorTotal.textContent = total.toFixed(2);
    
    // Retorna los datos originales de Supabase para la función de exportación
    return data;
}

// --- LÓGICA DE EXPORTACIÓN A EXCEL (CSV) ---

/** Exporta los datos que fueron consultados por última vez en Informes. */
function exportarAExcel() {
    if (lastLoadedData.length === 0) {
        alert("No hay registros en la lista de informes para exportar. Consulta una fecha primero.");
        return;
    }

    // 1. Cabecera del CSV
    let csvContent = "data:text/csv;charset=utf-8,Tipo de Servicio,Precio (C$),Fecha\n";

    // 2. Extracción de datos de la variable almacenada
    lastLoadedData.forEach(reg => {
        // Formato CSV: "valor1,valor2,valor3"
        csvContent += `${reg.tipo},${reg.precio.toFixed(2)},${reg.fecha}\n`;
    });

    // 3. Crear el enlace de descarga y simular el click
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    
    const fechaDescarga = fechaFiltro.value || new Date().toISOString().split("T")[0];
    link.setAttribute("download", `Ingresos_Barberia_${fechaDescarga}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// --- NUEVO LISTENER para el botón Exportar ---
btnExportar.addEventListener("click", exportarAExcel);


// Inicializar la aplicación: cargar registros y establecer la vista por defecto
cargarRegistros();
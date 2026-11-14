/*
  REGISTRO DE USO DE IA
  Herramienta usada: Gemini
  Partes hechas con ayuda de la IA: ABM de cursos, muro de publicaciones, entregas, corrección y exportación/importación JSON.
  Partes que escribí o modifiqué yo: Nombres de variables, adaptaciones de diseño responsive para BioClick.
  Alumno/a: Ana María Chocobar
  Curso: 6.°
  Fecha: 31/10/2026
*/

// --- 1. MODELO DE DATOS Y LOCALSTORAGE ---
let datosApp = JSON.parse(localStorage.getItem("aula-datos")) || {
    cursos: [],
    materiales: [],
    tareas: [],
    entregas: []
};

let modoActual = localStorage.getItem("aula-modo") || "docente";
let cursoAbiertoId = null; 
let tareaAbiertaId = null; 

// --- 2. REFERENCIAS A ELEMENTOS DEL DOM ---
const selectRol = document.getElementById("select-rol");
const vistaCursos = document.getElementById("vista-cursos");
const vistaMuro = document.getElementById("vista-muro");
const vistaTarea = document.getElementById("vista-tarea");

const formCurso = document.getElementById("form-curso");
const grillaCursos = document.getElementById("grilla-cursos");
const muroTituloCurso = document.getElementById("muro-titulo-curso");
const btnVolverCursos = document.getElementById("btn-volver-cursos");

const formPublicar = document.getElementById("form-publicar");
const muroPublicaciones = document.getElementById("muro-publicaciones");
const pubTipo = document.getElementById("pub-tipo");
const pubFechaLimite = document.getElementById("pub-fechalimite");
const pubPuntaje = document.getElementById("pub-puntaje");

const btnVolverMuro = document.getElementById("btn-volver-muro");
const detalleTarea = document.getElementById("detalle-tarea");
const formEntrega = document.getElementById("form-entrega");
const panelEntregaAlumno = document.getElementById("panel-entrega-alumno");
const panelCorreccionDocente = document.getElementById("panel-correccion-docente");
const listaEntregas = document.getElementById("lista-entregas");

const btnExportar = document.getElementById("btn-exportar");
const inputImportar = document.getElementById("input-importar");

// --- 3. PERSISTENCIA ---
function guardarDatos() {
    localStorage.setItem("aula-datos", JSON.stringify(datosApp));
}

// --- 4. GESTIÓN DE VISTAS ---
function mostrarVista(nombreVista) {
    vistaCursos.style.display = "none";
    vistaMuro.style.display = "none";
    vistaTarea.style.display = "none";

    if (nombreVista === "cursos") vistaCursos.style.display = "block";
    if (nombreVista === "muro") vistaMuro.style.display = "block";
    if (nombreVista === "tarea") vistaTarea.style.display = "block";
}

// --- 5. LÓGICA DE CURSOS ---
formCurso.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("curso-nombre").value.trim();
    const docente = document.getElementById("curso-docente").value.trim();
    const color = document.getElementById("curso-color").value;
    const codigo = document.getElementById("curso-codigo").value.trim().toUpperCase();

    const codigoExiste = datosApp.cursos.some(c => c.codigo === codigo);
    if (codigoExiste) {
        alert("Ya existe un curso con ese código único.");
        return;
    }

    const nuevoCurso = {
        id: "cv_" + Date.now(),
        nombre,
        docente,
        color,
        codigo
    };

    datosApp.cursos.push(nuevoCurso);
    guardarDatos();
    formCurso.reset();
    mostrarCursos();
});

function mostrarCursos() {
    grillaCursos.innerHTML = "";

    if (datosApp.cursos.length === 0) {
        grillaCursos.innerHTML = "<p>No hay cursos creados todavía.</p>";
        return;
    }

    datosApp.cursos.forEach(curso => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-curso";
        tarjeta.style.borderTop = `6px solid ${curso.color}`;
        tarjeta.innerHTML = `
            <h3>${curso.nombre}</h3>
            <p>👨‍🏫 Prof: ${curso.docente}</p>
            <p>🔑 Código: <strong>${curso.codigo}</strong></p>
            <div class="acciones-curso">
                <button onclick="abrirMuro('${curso.id}')">📚 Abrir Muro</button>
                <button class="btn-eliminar solo-docente" onclick="eliminarCurso('${curso.id}')">🗑️ Borrar</button>
            </div>
        `;
        grillaCursos.appendChild(tarjeta);
    });

    aplicarModoRol();
}

function abrirMuro(cursoId) {
    cursoAbiertoId = cursoId;
    const curso = datosApp.cursos.find(c => c.id === cursoId);
    if (curso) {
        muroTituloCurso.textContent = `${curso.nombre} - Muro`;
        mostrarPublicaciones();
        mostrarVista("muro");
    }
}

function eliminarCurso(cursoId) {
    if (confirm("¿Estás segura de borrar este curso? Se borrarán sus materiales y tareas asociadas.")) {
        datosApp.cursos = datosApp.cursos.filter(c => c.id !== cursoId);
        datosApp.materiales = datosApp.materiales.filter(m => m.cursold !== cursoId);
        datosApp.tareas = datosApp.tareas.filter(t => t.cursold !== cursoId);
        guardarDatos();
        mostrarCursos();
    }
}

btnVolverCursos.addEventListener("click", () => {
    cursoAbiertoId = null;
    mostrarVista("cursos");
});

// --- 6. LÓGICA DE PUBLICACIONES (MATERIALES Y TAREAS) ---
pubTipo.addEventListener("change", (e) => {
    const tipo = e.target.value;
    if (tipo === "tarea") {
        pubFechaLimite.style.display = "block";
        pubPuntaje.style.display = "block";
    } else {
        pubFechaLimite.style.display = "none";
        pubPuntaje.style.display = "none";
    }
});

formPublicar.addEventListener("submit", (e) => {
    e.preventDefault();

    const titulo = document.getElementById("pub-titulo").value.trim();
    const tipo = pubTipo.value;
    const contenido = document.getElementById("pub-contenido").value.trim();
    const fechaActual = new Date().toLocaleDateString();

    if (!titulo) {
        alert("El título es obligatorio.");
        return;
    }

    if (tipo === "enlace" && contenido && !contenido.startsWith("https://")) {
        alert("Los enlaces deben comenzar con https://");
        return;
    }

    if (tipo === "tarea") {
        const fechaLim = pubFechaLimite.value;
        const puntajeMax = parseInt(pubPuntaje.value) || 10;

        if (!fechaLim) {
            alert("Las tareas requieren una fecha límite.");
            return;
        }

        const nuevaTarea = {
            id: "t_" + Date.now(),
            cursold: cursoAbiertoId,
            titulo,
            consigna: contenido,
            fechaLimite: fechaLim,
            puntajeMaximo: puntajeMax,
            fechaPublicacion: fechaActual
        };

        datosApp.tareas.push(nuevaTarea);
    } else {
        const nuevoMaterial = {
            id: "m_" + Date.now(),
            cursold: cursoAbiertoId,
            titulo,
            tipo,
            contenido,
            fechaPublicacion: fechaActual
        };

        datosApp.materiales.push(nuevoMaterial);
    }

    guardarDatos();
    formPublicar.reset();
    pubFechaLimite.style.display = "none";
    pubPuntaje.style.display = "none";
    mostrarPublicaciones();
});

function mostrarPublicaciones() {
    muroPublicaciones.innerHTML = "";

    const materialesCurso = datosApp.materiales.filter(m => m.cursold === cursoAbiertoId);
    const tareasCurso = datosApp.tareas.filter(t => t.cursold === cursoAbiertoId);

    const publicaciones = [
        ...materialesCurso.map(m => ({ ...m, esTarea: false })),
        ...tareasCurso.map(t => ({ ...t, esTarea: true }))
    ];

    if (publicaciones.length === 0) {
        muroPublicaciones.innerHTML = "<p>No hay publicaciones en este muro todavía.</p>";
        return;
    }

    const publicacionesOrdenadas = publicaciones.sort((a, b) => b.id.localeCompare(a.id));

    publicacionesOrdenadas.forEach(pub => {
        const tarjetaPub = document.createElement("div");
        tarjetaPub.className = "tarjeta-publicacion";

        let icono = "📄";
        if (pub.tipo === "enlace") icono = "🔗";
        if (pub.esTarea) icono = "📝";

        let detalleHTML = "";
        let btnAccionHTML = "";

        if (pub.esTarea) {
            const entregasDeEstaTarea = datosApp.entregas.filter(en => en.tareald === pub.id);
            const sinCorregir = entregasDeEstaTarea.filter(en => en.estado !== "corregida").length;

            detalleHTML = `
                <p><strong>Consigna:</strong> ${pub.consigna}</p>
                <p>⏰ Vence el: ${pub.fechaLimite} | Puntuación máx: ${pub.puntajeMaximo} pts</p>
                <p class="info-entregas">📥 ${entregasDeEstaTarea.length} entregas (${sinCorregir} sin corregir)</p>
            `;
            btnAccionHTML = `<button onclick="abrirTarea('${pub.id}')">Ver Tarea y Entregas</button>`;
        } else if (pub.tipo === "enlace") {
            detalleHTML = `<p><a href="${pub.contenido}" target="_blank" rel="noopener">Abrir enlace ↗</a></p>`;
        } else {
            detalleHTML = `<p>${pub.contenido}</p>`;
        }

        tarjetaPub.innerHTML = `
            <div class="pub-header">
                <h4>${icono} ${pub.titulo}</h4>
                <span class="pub-fecha">Publicado el ${pub.fechaPublicacion}</span>
            </div>
            ${detalleHTML}
            <div class="acciones-pub">
                ${btnAccionHTML}
                <button class="btn-eliminar solo-docente" onclick="eliminarPublicacion('${pub.id}', ${pub.esTarea})">🗑️ Borrar</button>
            </div>
        `;
        muroPublicaciones.appendChild(tarjetaPub);
    });

    aplicarModoRol();
}

function eliminarPublicacion(id, esTarea) {
    if (confirm("¿Estás segura de eliminar esta publicación?")) {
        if (esTarea) {
            datosApp.tareas = datosApp.tareas.filter(t => t.id !== id);
            datosApp.entregas = datosApp.entregas.filter(en => en.tareald !== id);
        } else {
            datosApp.materiales = datosApp.materiales.filter(m => m.id !== id);
        }
        guardarDatos();
        mostrarPublicaciones();
    }
}

// --- 7. LÓGICA DE TAREAS Y ENTREGAS ---
function abrirTarea(tareaId) {
    tareaAbiertaId = tareaId;
    const tarea = datosApp.tareas.find(t => t.id === tareaId);
    if (!tarea) return;

    detalleTarea.innerHTML = `
        <h3>📝 ${tarea.titulo}</h3>
        <p><strong>Consigna:</strong> ${tarea.consigna}</p>
        <p>⏰ Fecha límite: ${tarea.fechaLimite} | Puntaje máximo: ${tarea.puntajeMaximo} pts</p>
    `;

    mostrarEntregas();
    mostrarVista("tarea");
}

btnVolverMuro.addEventListener("click", () => {
    tareaAbiertaId = null;
    mostrarVista("muro");
});

formEntrega.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombreAlumno = document.getElementById("entrega-alumno").value.trim();
    const linkTrabajo = document.getElementById("entrega-link").value.trim();

    if (!linkTrabajo.startsWith("https://")) {
        alert("El enlace del trabajo debe comenzar con https://");
        return;
    }

    const tarea = datosApp.tareas.find(t => t.id === tareaAbiertaId);
    const fechaHoraActual = new Date();
    const fechaLimiteObj = new Date(tarea.fechaLimite);

    const estadoEntrega = fechaHoraActual <= fechaLimiteObj ? "a tiempo" : "tarde";

    const entregaExistente = datosApp.entregas.find(en => en.tareald === tareaAbiertaId && en.alumno.toLowerCase() === nombreAlumno.toLowerCase());

    if (entregaExistente) {
        if (entregaExistente.estado === "corregida") {
            alert("Tu tarea ya fue corregida, no se puede modificar.");
            return;
        }
        entregaExistente.link = linkTrabajo;
        entregaExistente.estado = estadoEntrega;
        entregaExistente.fecha = fechaHoraActual.toLocaleString();
    } else {
        const nuevaEntrega = {
            id: "en_" + Date.now(),
            tareald: tareaAbiertaId,
            alumno: nombreAlumno,
            link: linkTrabajo,
            fecha: fechaHoraActual.toLocaleString(),
            estado: estadoEntrega,
            nota: "",
            devolucion: ""
        };
        datosApp.entregas.push(nuevaEntrega);
    }

    guardarDatos();
    formEntrega.reset();
    alert("¡Tarea enviada con éxito!");
    mostrarEntregas();
});

function mostrarEntregas() {
    listaEntregas.innerHTML = "";
    const entregasDeTarea = datosApp.entregas.filter(en => en.tareald === tareaAbiertaId);

    if (entregasDeTarea.length === 0) {
        listaEntregas.innerHTML = "<p>No hay entregas registradas para esta tarea.</p>";
        return;
    }

    entregasDeTarea.forEach(entrega => {
        const divEntrega = document.createElement("div");
        divEntrega.className = "tarjeta-entrega";

        let claseEstado = entrega.estado === "tarde" ? "estado-tarde" : "estado-tiempo";

        divEntrega.innerHTML = `
            <p><strong>Alumno/a:</strong> ${entrega.alumno}</p>
            <p>🔗 <a href="${entrega.link}" target="_blank" rel="noopener">Ver trabajo entregado</a></p>
            <p>📅 Fecha: ${entrega.fecha} - <span class="${claseEstado}">${entrega.estado.toUpperCase()}</span></p>
            <div class="seccion-correccion solo-docente">
                <hr>
                <label>Nota (1 al 10):</label>
                <input type="number" id="nota_${entrega.id}" value="${entrega.nota}" min="1" max="10">
                <label>Devolución:</label>
                <textarea id="dev_${entrega.id}" placeholder="Comentarios para el alumno...">${entrega.devolucion}</textarea>
                <button onclick="guardarCorreccion('${entrega.id}')">💾 Guardar corrección</button>
            </div>
            ${modoActual === "alumno" ? `<p><strong>Nota:</strong> ${entrega.nota ? entrega.nota : "Pendiente"} | <strong>Devolución:</strong> ${entrega.devolucion ? entrega.devolucion : "Sin devoluciones aún"}</p>` : ""}
        `;
        listaEntregas.appendChild(divEntrega);
    });

    aplicarModoRol();
}

function guardarCorreccion(entregaId) {
    const notaInput = document.getElementById(`nota_${entregaId}`).value;
    const devInput = document.getElementById(`dev_${entregaId}`).value.trim();

    const notaNum = parseInt(notaInput);
    if (!notaNum || notaNum < 1 || notaNum > 10) {
        alert("Por favor ingresa una nota válida entre 1 y 10.");
        return;
    }

    const entrega = datosApp.entregas.find(en => en.id === entregaId);
    if (entrega) {
        entrega.nota = notaNum;
        entrega.devolucion = devInput;
        entrega.estado = "corregida";
        guardarDatos();
        alert("¡Corrección guardada con éxito!");
        mostrarEntregas();
    }
}

// --- 8. EXPORTAR E IMPORTAR JSON ---
btnExportar.addEventListener("click", () => {
    const datosString = JSON.stringify(datosApp, null, 2);
    const blob = new Blob([datosString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const enlaceTemp = document.createElement("a");
    enlaceTemp.href = url;
    enlaceTemp.download = "bioclick.json";
    enlaceTemp.click();
    URL.revokeObjectURL(url);
});

inputImportar.addEventListener("change", (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = function(evento) {
        try {
            const datosImportados = JSON.parse(evento.target.result);
            
            if (datosImportados && Array.isArray(datosImportados.cursos) && Array.isArray(datosImportados.materiales) && Array.isArray(datosImportados.tareas) && Array.isArray(datosImportados.entregas)) {
                if (confirm("¿Estás segura de reemplazar los datos actuales con los del archivo importado?")) {
                    datosApp = datosImportados;
                    guardarDatos();
                    mostrarCursos();
                    mostrarVista("cursos");
                    alert("¡Datos importados con éxito!");
                }
            } else {
                alert("El archivo JSON no tiene la estructura correcta para BioClick.");
            }
        } catch (error) {
            alert("El archivo seleccionado no es un JSON válido.");
        }
    };
    lector.readAsText(archivo);
});

// --- 9. INICIALIZACIÓN Y ROLES ---
function aplicarModoRol() {
    const elementosSoloDocente = document.querySelectorAll(".solo-docente");
    elementosSoloDocente.forEach(el => {
        el.style.display = (modoActual === "docente") ? "block" : "none";
    });

    if (panelEntregaAlumno) {
        panelEntregaAlumno.style.display = (modoActual === "alumno") ? "block" : "none";
    }
}

selectRol.addEventListener("change", (e) => {
    modoActual = e.target.value;
    localStorage.setItem("aula-modo", modoActual);
    aplicarModoRol();
});

// Arrancar la app
document.addEventListener("DOMContentLoaded", () => {
    selectRol.value = modoActual;
    mostrarCursos();
    mostrarVista("cursos");
});
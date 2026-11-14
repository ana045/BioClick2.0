// --- ESTADO INICIAL Y CARGA DE DATOS ---
let cursos = JSON.parse(localStorage.getItem("bioclick_cursos")) || [];
let publicaciones = JSON.parse(localStorage.getItem("bioclick_publicaciones")) || [];
let entregas = JSON.parse(localStorage.getItem("bioclick_entregas")) || [];

let rolActual = "docente"; // "docente" o "alumno"
let cursoActualId = null;
let tareaActualId = null;

// --- SELECTOR DE ROL ---
const selectRol = document.getElementById("select-rol");
if (selectRol) {
    selectRol.addEventListener("change", (e) => {
        rolActual = e.target.value;
        actualizarInterfazRol();
        renderizarCursos();
        if (cursoActualId) renderizarMuro(cursoActualId);
    });
}

function actualizarInterfazRol() {
    const elementosDocente = document.querySelectorAll(".solo-docente");
    elementosDocente.forEach(el => {
        el.style.display = (rolActual === "docente") ? "block" : "none";
    });
}

// --- NAVEGACIÓN ENTRE VISTAS ---
const vistaCursos = document.getElementById("vista-cursos");
const vistaMuro = document.getElementById("vista-muro");
const vistaTarea = document.getElementById("vista-tarea");

function mostrarVista(vista) {
    vistaCursos.style.display = "none";
    vistaMuro.style.display = "none";
    vistaTarea.style.display = "none";
    vista.style.display = "block";
}

// --- GESTIÓN DE CURSOS ---
const formCurso = document.getElementById("form-curso");
if (formCurso) {
    formCurso.addEventListener("submit", (e) => {
        e.preventDefault();
        const nuevoCurso = {
            id: Date.now().toString(),
            nombre: document.getElementById("curso-nombre").value,
            docente: document.getElementById("curso-docente").value,
            color: document.getElementById("curso-color").value,
            codigo: document.getElementById("curso-codigo").value
        };
        cursos.push(nuevoCurso);
        guardarYRenderizarCursos();
        formCurso.reset();
    });
}

function guardarYRenderizarCursos() {
    localStorage.setItem("bioclick_cursos", JSON.stringify(cursos));
    renderizarCursos();
}

function renderizarCursos() {
    const grilla = document.getElementById("grilla-cursos");
    if (!grilla) return;
    grilla.innerHTML = "";
    
    if (cursos.length === 0) {
        grilla.innerHTML = "<p>No hay cursos creados todavía.</p>";
        return;
    }
    
    cursos.forEach(curso => {
        const card = document.createElement("div");
        card.className = "tarjeta-curso";
        card.style.borderLeft = `6px solid ${curso.color}`;
        card.innerHTML = `
            <h3>${curso.nombre}</h3>
            <p><strong>Prof:</strong> ${curso.docente}</p>
            <p><small>Código: ${curso.codigo}</small></p>
            <button class="btn-ingresar" data-id="${curso.id}">Ingresar al curso</button>
            ${rolActual === 'docente' ? `<button class="btn-eliminar-curso" data-id="${curso.id}" style="background:#e74c3c; color:white; border:none; padding:4px 8px; margin-top:5px; border-radius:4px; cursor:pointer;">Eliminar</button>` : ''}
        `;
        grilla.appendChild(card);
    });
    
    document.querySelectorAll(".btn-ingresar").forEach(btn => {
        btn.addEventListener("click", (e) => {
            cursoActualId = e.target.getAttribute("data-id");
            abrirMuro(cursoActualId);
        });
    });
    
    document.querySelectorAll(".btn-eliminar-curso").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-id");
            cursos = cursos.filter(c => c.id !== id);
            guardarYRenderizarCursos();
        });
    });
}

// --- GESTIÓN DEL MURO ---
function abrirMuro(idCurso) {
    const curso = cursos.find(c => c.id === idCurso);
    if (!curso) return;
    
    document.getElementById("muro-titulo-curso").textContent = curso.nombre;
    mostrarVista(vistaMuro);
    renderizarMuro(idCurso);
}

const btnVolverCursos = document.getElementById("btn-volver-cursos");
if (btnVolverCursos) {
    btnVolverCursos.addEventListener("click", () => {
        mostrarVista(vistaCursos);
    });
}

const pubTipo = document.getElementById("pub-tipo");
if (pubTipo) {
    pubTipo.addEventListener("change", (e) => {
        const esTarea = e.target.value === "tarea";
        document.getElementById("pub-fechalimite").style.display = esTarea ? "block" : "none";
        document.getElementById("pub-puntaje").style.display = esTarea ? "block" : "none";
    });
}

const formPublicar = document.getElementById("form-publicar");
if (formPublicar) {
    formPublicar.addEventListener("submit", (e) => {
        e.preventDefault();
        const nuevaPub = {
            id: Date.now().toString(),
            cursoId: cursoActualId,
            titulo: document.getElementById("pub-titulo").value,
            tipo: document.getElementById("pub-tipo").value,
            contenido: document.getElementById("pub-contenido").value,
            fechaLimite: document.getElementById("pub-fechalimite").value,
            puntaje: document.getElementById("pub-puntaje").value,
            fechaCreacion: new Date().toLocaleDateString()
        };
        publicaciones.push(nuevaPub);
        localStorage.setItem("bioclick_publicaciones", JSON.stringify(publicaciones));
        formPublicar.reset();
        document.getElementById("pub-fechalimite").style.display = "none";
        document.getElementById("pub-puntaje").style.display = "none";
        renderizarMuro(cursoActualId);
    });
}

function renderizarMuro(idCurso) {
    const contenedor = document.getElementById("muro-publicaciones");
    if (!contenedor) return;
    contenedor.innerHTML = "";
    
    const pubsCurso = publicaciones.filter(p => p.cursoId === idCurso);
    
    if (pubsCurso.length === 0) {
        contenedor.innerHTML = "<p>No hay publicaciones en este curso todavía.</p>";
        return;
    }
    
    pubsCurso.forEach(pub => {
        const div = document.createElement("div");
        div.className = "publicacion-card";
        div.innerHTML = `
            <span class="badge-tipo">${pub.tipo.toUpperCase()}</span>
            <h4>${pub.titulo}</h4>
            <p>${pub.contenido}</p>
            ${pub.fechaLimite ? `<p><strong>Fecha límite:</strong> ${new Date(pub.fechaLimite).toLocaleString()}</p>` : ''}
            ${pub.tipo === 'tarea' ? `<button class="btn-ver-tarea" data-id="${pub.id}">Ver Tarea / Entregar</button>` : ''}
            <button class="btn-eliminar-pub" data-id="${pub.id}" style="background:#e74c3c; color:white; border:none; padding:4px 8px; margin-top:5px; border-radius:4px; cursor:pointer; font-size:0.8rem;">Eliminar</button>
        `;
        contenedor.appendChild(div);
    });
    
    document.querySelectorAll(".btn-ver-tarea").forEach(btn => {
        btn.addEventListener("click", (e) => {
            tareaActualId = e.target.getAttribute("data-id");
            abrirDetalleTarea(tareaActualId);
        });
    });
    
    document.querySelectorAll(".btn-eliminar-pub").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-id");
            publicaciones = publicaciones.filter(p => p.id !== id);
            localStorage.setItem("bioclick_publicaciones", JSON.stringify(publicaciones));
            renderizarMuro(cursoActualId);
        });
    });
}

// --- GESTIÓN DE TAREAS Y ENTREGAS ---
const btnVolverMuro = document.getElementById("btn-volver-muro");
if (btnVolverMuro) {
    btnVolverMuro.addEventListener("click", () => {
        mostrarVista(vistaMuro);
    });
}

function abrirDetalleTarea(idTarea) {
    const tarea = publicaciones.find(p => p.id === idTarea);
    if (!tarea) return;
    
    const contenedorDetalle = document.getElementById("detalle-tarea");
    contenedorDetalle.innerHTML = `
        <h2>${tarea.titulo}</h2>
        <p>${tarea.contenido}</p>
        <p><strong>Fecha límite:</strong> ${tarea.fechaLimite ? new Date(tarea.fechaLimite).toLocaleString() : 'Sin límite'}</p>
        <p><strong>Puntaje máximo:</strong> ${tarea.puntaje || 'No especificado'}</p>
    `;
    
    const panelAlumno = document.getElementById("panel-entrega-alumno");
    const panelDocente = document.getElementById("panel-correccion-docente");
    
    if (rolActual === "alumno") {
        panelAlumno.style.display = "block";
        panelDocente.style.display = "none";
    } else {
        panelAlumno.style.display = "none";
        panelDocente.style.display = "block";
        renderizarEntregasDocente(idTarea);
    }
    
    mostrarVista(vistaTarea);
}

const formEntrega = document.getElementById("form-entrega");
if (formEntrega) {
    formEntrega.addEventListener("submit", (e) => {
        e.preventDefault();
        const tarea = publicaciones.find(p => p.id === tareaActualId);
        const ahora = new Date();
        const fechaLim = tarea.fechaLimite ? new Date(tarea.fechaLimite) : null;
        
        let estadoEntrega = "A tiempo";
        if (fechaLim && ahora > fechaLim) {
            estadoEntrega = "Tarde";
        }
        
        const nuevaEntrega = {
            id: Date.now().toString(),
            tareaId: tareaActualId,
            alumno: document.getElementById("entrega-alumno").value,
            link: document.getElementById("entrega-link").value,
            estado: estadoEntrega,
            nota: "",
            devolucion: ""
        };
        
        entregas.push(nuevaEntrega);
        localStorage.setItem("bioclick_entregas", JSON.stringify(entregas));
        formEntrega.reset();
        alert("¡Tarea entregada con éxito! Estado: " + estadoEntrega);
    });
}

function renderizarEntregasDocente(idTarea) {
    const listaEntregas = document.getElementById("lista-entregas");
    if (!listaEntregas) return;
    listaEntregas.innerHTML = "";
    
    const entregasTarea = entregas.filter(e => e.tareaId === idTarea);
    if (entregasTarea.length === 0) {
        listaEntregas.innerHTML = "<p>No hay entregas de alumnos todavía.</p>";
        return;
    }
    
    entregasTarea.forEach(ent => {
        const div = document.createElement("div");
        div.className = "entrega-card";
        div.innerHTML = `
            <p><strong>Alumno:</strong> ${ent.alumno}</p>
            <p><strong>Trabajo:</strong> <a href="${ent.link}" target="_blank">Ver enlace</a></p>
            <p><strong>Estado:</strong> <span class="${ent.estado === 'A tiempo' ? 'badge-tiempo' : 'badge-tarde'}">${ent.estado}</span></p>
            <div class="form-correccion">
                <input type="number" class="input-nota" data-id="${ent.id}" placeholder="Nota (1-10)" min="1" max="10" value="${ent.nota || ''}">
                <input type="text" class="input-devolucion" data-id="${ent.id}" placeholder="Devolución docente" value="${ent.devolucion || ''}">
                <button class="btn-guardar-correccion" data-id="${ent.id}">Guardar</button>
            </div>
        `;
        listaEntregas.appendChild(div);
    });
    
    document.querySelectorAll(".btn-guardar-correccion").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-id");
            const card = e.target.closest(".entrega-card");
            const nota = card.querySelector(".input-nota").value;
            const devolucion = card.querySelector(".input-devolucion").value;
            
            const entregaObj = entregas.find(en => en.id === id);
            if (entregaObj) {
                entregaObj.nota = nota;
                entregaObj.devolucion = devolucion;
                localStorage.setItem("bioclick_entregas", JSON.stringify(entregas));
                alert("Corrección guardada correctamente.");
            }
        });
    });
}

// --- EXPORTAR E IMPORTAR JSON (CON SOPORTE PARA navigator.share) ---
const btnExportar = document.getElementById("btn-exportar");
if (btnExportar) {
    btnExportar.addEventListener("click", async () => {
        const datosExportar = {
            cursos: JSON.parse(localStorage.getItem("bioclick_cursos") || "[]"),
            publicaciones: JSON.parse(localStorage.getItem("bioclick_publicaciones") || "[]"),
            entregas: JSON.parse(localStorage.getItem("bioclick_entregas") || "[]")
        };

        const jsonString = JSON.stringify(datosExportar, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const archivo = new File([blob], "bioclick.json", { type: "application/json" });

        if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
            try {
                await navigator.share({
                    title: "Respaldo de BioClick",
                    text: "Aquí están los datos y cursos respaldados de BioClick.",
                    files: [archivo]
                });
                return;
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.log("Error al compartir, usando descarga alternativa...", error);
                } else {
                    return;
                }
            }
        }

        const url = URL.createObjectURL(blob);
        const enlace = document.createElement("a");
        enlace.href = url;
        enlace.download = "bioclick.json";
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);
        URL.revokeObjectURL(url);
    });
}

const inputImportar = document.getElementById("input-importar");
if (inputImportar) {
    inputImportar.addEventListener("change", (e) => {
        const archivo = e.target.files[0];
        if (!archivo) return;
        
        const lector = new FileReader();
        lector.onload = function(evento) {
            try {
                const datos = JSON.parse(evento.target.result);
                if (datos.cursos) {
                    localStorage.setItem("bioclick_cursos", JSON.stringify(datos.cursos));
                    cursos = datos.cursos;
                }
                if (datos.publicaciones) {
                    localStorage.setItem("bioclick_publicaciones", JSON.stringify(datos.publicaciones));
                    publicaciones = datos.publicaciones;
                }
                if (datos.entregas) {
                    localStorage.setItem("bioclick_entregas", JSON.stringify(datos.entregas));
                    entregas = datos.entregas;
                }
                alert("¡Datos importados con éxito!");
                renderizarCursos();
            } catch (err) {
                alert("Error al leer el archivo JSON.");
            }
        };
        lector.readAsText(archivo);
    });
}

// --- AVISO DE ESTADO DE CONEXIÓN (ONLINE / OFFLINE) ---
function crearAvisoConexion() {
    if (document.getElementById("aviso-conexion")) return;

    const aviso = document.createElement("div");
    aviso.id = "aviso-conexion";
    aviso.textContent = "⚠️ Sin conexión: tus datos se siguen guardando en este celular";
    
    document.body.insertBefore(aviso, document.body.firstChild);

    function actualizarEstadoConexion() {
        if (navigator.onLine) {
            aviso.style.display = "none";
        } else {
            aviso.style.display = "block";
        }
    }

    window.addEventListener("online", actualizarEstadoConexion);
    window.addEventListener("offline", actualizarEstadoConexion);

    actualizarEstadoConexion();
}

document.addEventListener("DOMContentLoaded", () => {
    crearAvisoConexion();
    actualizarInterfazRol();
    renderizarCursos();
});

// --- REGISTRO DEL SERVICE WORKER PARA PWA ---
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js")
            .then(() => console.log("Service Worker registrado con éxito."))
            .catch((error) => console.log("Error al registrar el Service Worker:", error));
    });
}
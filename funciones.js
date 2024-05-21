// async function showLoadingOverlay(correo, password) {
//   document.getElementById('loading-overlay').style.display = 'flex';
//   document.getElementById('spinner').style.display = 'flex';
//   try {
//     await getToken(correo, password);
//     document.getElementById('loading-overlay').style.display = 'none';
//   } catch (error) {
//     console.error('Error haciendo fetching:', error);
//   }
// }

// function getRequestOptions(type = "GET", raw = null, isToken = false) {
//   try {
//     const myHeaders = new Headers();
//     if (isToken == false) {
//       var token = sessionStorage.getItem("token");
//       if (!token) {
//         window.location.href = "login.html?cerrada=true";
//       }
//       myHeaders.append("Authorization", "Bearer " + token);
//     }
//     let requestOptions;
//     if (type === "POST" || type === "PUT") {
//       myHeaders.append("Content-Type", "application/json");
//       requestOptions = {
//         method: type,
//         headers: myHeaders,
//         body: raw,
//         redirect: "follow"
//       };
//     } else {
//       requestOptions = {
//         method: type,
//         headers: myHeaders,
//         redirect: "follow"
//       };
//     }
//     return requestOptions;
//   } catch (error) {
//     console.error("Error al obtener el token:", error);
//     window.location.href = "login.html?cerrada=true"
//   }
// }

// async function showForm(whichModal = 1, id_dada, nombre, url = "", id_categoria = "") {

//   hideLoadingSpinner(); //A veces no se llega a esconder despues de haber aparecido antes
//   var elemento = event.currentTarget;
//   var clases = elemento.classList;
//   let dialog;
//   let out;
//   let titulo;

//   if (whichModal == 2) {
//     out = document.getElementById("second-modal-body");
//     titulo = document.getElementById("second-modal-title");
//     footer = document.getElementById("second-modal-footer");
//     dialog = document.getElementById("second-modal-dialog");
//   } else {
//     let contenedor = document.getElementById("contenedor-modal1");
//     out = document.getElementById("modal-body");
//     titulo = document.getElementById("modal-title");
//     footer = document.getElementById("modal-footer");
//     dialog = document.getElementById("modal-dialog");
//     contenedor.style.width = "100%";

//   }
//   limpieza("", whichModal);
//   //Por problemas con el tamaño del modal, se les da este tamaño por defecto. 
//   //Se cambia si son de buscar algo, debido a la funcion de historial
//   dialog.className = "modal-dialog modal-sm modal-md modal-lg";
//   titulo.textContent = elemento.textContent;

//   let formulario = document.createElement("form");
//   formulario.classList.add("form-group", "m-auto");

//   formulario.addEventListener("submit", function (event) {
//     event.preventDefault();
//     switch (true) {
//       case clases.contains("buscarCategoria"):
//         dialog.className = "modal-dialog modal-md modal-lg modal-xl";
//         var id = document.getElementById('id').value;
//         buscar("categorias", id);
//         break;
//       case clases.contains("eliminarCategoria"):
//         if (id_dada) { var id = id_dada } else {
//           var id = document.getElementById('id').value;
//         }
//         eliminar("categorias", id);
//         break;
//       case clases.contains('crearCategoria'):
//         var nombre = document.getElementById('Nombre').value;
//         crear("categorias", nombre);
//         break;
//       case clases.contains("modificarCategoria"):
//         if (id_dada) { var id = id_dada } else {
//           var id = document.getElementById('id').value;
//         }
//         var nombre = document.getElementById('Nombre').value;
//         modificar("categorias", id, nombre);
//         break;

//       case clases.contains("buscarVideo"):
//         dialog.className = "modal-dialog modal-md modal-lg modal-xl";
//         var id = document.getElementById('id').value;
//         buscar("videos", id);
//         break;
//       case clases.contains("eliminarVideo"):
//         if (id_dada) {
//           var id = id_dada;
//         } else {
//           var id = document.getElementById('id').value;
//         }
//         eliminar("videos", id);
//         break;
//       case clases.contains("crearVideo"):
//         var nombre = document.getElementById('Nombre').value;
//         var url = document.getElementById("url").value;
//         var categoria = document.getElementById("id_categoria").value
//         crear("videos", nombre, "", "", url, categoria);
//         break;
//       case clases.contains("modificarVideo"):
//         var nombre = document.getElementById('Nombre').value;
//         var url = document.getElementById("url").value;
//         var categoria = document.getElementById("id_categoria").value
//         if (id_dada) {
//           var id = id_dada;
//         } else {
//           var id = document.getElementById('id').value;
//         }
//         modificar("videos", id, nombre, "", categoria, url);
//         break;
//       case clases.contains("buscarUsuario"):
//         dialog.className = "modal-dialog modal-md modal-lg modal-xl";
//         var uid = document.getElementById('uid').value;
//         buscar("usuarios", uid);
//         break;
//       case clases.contains("eliminarUsuario"):
//         if (id_dada) { var uid = id_dada } else {
//           var uid = document.getElementById('uid').value;
//         }
//         eliminar("usuarios", uid);
//         break;
//       case clases.contains("crearUsuario"):
//         var nombre = document.getElementById('Nombre').value;
//         var correo = document.getElementById('Correo').value;
//         var password = document.getElementById('Contraseña').value;
//         if (password.length < 8) {
//           alert("La contraseña debe tener al menos 8 caracteres");
//         } else {
//           crear("usuarios", nombre, correo, password);
//         }
//         break;
//       case clases.contains("modificarUsuario"):
//         if (id_dada) { var uid = id_dada } else {
//           var uid = document.getElementById('uid').value;
//         }
//         var nombre = document.getElementById('Nombre').value;
//         var password = document.getElementById('Contraseña').value;
//         if (password.length < 8) {
//           alert("La contraseña debe tener al menos 8 caracteres");
//         } else {
//           modificar("usuarios", uid, nombre, password);
//         }
//         break;
//     }
//   })

//   if (!id_dada) { //Elimina de los formularios el input de la id de eliminar y modificar si el formulario es de los botones de una card
//     if (clases.contains("buscarUsuario") || clases.contains("eliminarUsuario") || clases.contains("modificarUsuario")) {
//       formulario.append(crearInput("uid", "text", true));
//     }
//     if (clases.contains("buscarVideo") || clases.contains("eliminarVideo") || clases.contains("modificarVideo") || clases.contains("buscarCategoria") || clases.contains("eliminarCategoria") || clases.contains("modificarCategoria")) {
//       formulario.append(crearInput("id", "text", true));
//     }
//   }
//   if (id_dada) {
//     if (clases.contains("eliminarVideo") || clases.contains("eliminarUsuario") || clases.contains("eliminarCategoria")) {
//       formulario.append("Vas a eliminar a este objeto. Si estas seguro de ello, pulsa confirmar");
//     }
//   }
//   if (clases.contains("crearUsuario") || clases.contains("modificarUsuario") || clases.contains("crearVideo") || clases.contains("modificarVideo") || clases.contains("crearCategoria") || clases.contains("modificarCategoria")) {
//     formulario.append(crearInput("Nombre", "text", true, nombre));
//   }
//   if (clases.contains("crearUsuario")) {
//     formulario.append(crearInput("Correo", "email", true));
//   }
//   if (clases.contains("crearVideo") || clases.contains("modificarVideo")) {
//     formulario.append(crearInput("url", "url", true, url));
//     formulario.append(await crearDesplegable("id_categoria", true, id_categoria));
//   }

//   if (clases.contains("crearUsuario") || clases.contains("modificarUsuario")) {
//     formulario.append(crearInput("Contraseña", "password", true));
//   }
//   var botonEnviar = crearBoton("Confirmar", "", "", "btn-primary w-100 py-2 my-3");
//   botonEnviar.type = 'submit';
//   formulario.appendChild(botonEnviar);
//   out.append(formulario);
// }

function showLoadingSpinner() {
  var spinner = document.getElementById("spinner");
  spinner.style.display = "block";
}

function hideLoadingSpinner() {
  var spinner = document.getElementById("spinner");
  spinner.style.display = "none";
}

// function crearCard(objeto, tipo, whichModal) {
//   let card;
//   let columna = crearDiv("", "col mb-2");
//   let cardbody = crearDiv("", "card-body");
//   let nombre = crearTitulo(objeto.nombre, "h4", "card-title");
//   let botones = crearDiv("", "", " display: flex;align-items: center;justify-content: center");

//   if (tipo === "usuarios") {
//     card = crearDiv("", "card h-100 md-2 my-2 mx-2 shadow", "width: auto;height:auto;overflow:hidden;");
//     card.id = tipo + objeto.uid;
//     let correo = crearTitulo(objeto.correo, "h5", "card-card-subtitle mb-2 text-muted");
//     let uid = crearTitulo("UID: " + objeto.uid, "h6", "card-text");
//     let estado = crearTitulo("Rol: " + objeto.rol, "h6", "card-text");
//     let modificar = crearBoton("Modificar usuario", function () { showForm(whichModal, objeto.uid, objeto.nombre); }, "#" + whichModal + "ContenedorModal", "btn-outline-warning m-2", "modificarUsuario");
//     let eliminar = crearBoton("Eliminar usuario", function () { showForm(whichModal, objeto.uid) }, "#" + whichModal + "ContenedorModal", "btn-outline-danger m-2", "eliminarUsuario");
//     if (objeto.estado == false) {
//       eliminar.disabled = true;
//       modificar.disabled = true;
//     }
//     botones.append(modificar, eliminar);
//     cardbody.append(nombre, correo, uid, estado, botones);
//     card.append(cardbody);
//   } else if (tipo === "videos") {
//     card = crearDiv("", "card h-100 md-2 mb-2 mt-2 mx-2 shadow", "width: auto;height:auto;overflow:hidden;");
//     let id = crearTitulo("ID: " + objeto._id, "h6");
//     let vid = crearIframe(objeto);
//     card.id = tipo + objeto._id;
//     cardbody.append(nombre);
//     if (sessionStorage.getItem("rol") == "ADMIN_ROLE") {
//       let categoria = crearTitulo(objeto.categoria.nombre, "h5", "card-card-subtitle mb-2 text-muted");
//       let ctg_id = crearTitulo("ID de la categoría: " + objeto.categoria._id, "h6", "card-text");
//       let modificar = crearBoton("Modificar video", function () { showForm(whichModal, objeto._id, objeto.nombre, objeto.url, objeto.categoria._id) }, "#" + whichModal + "ContenedorModal", "btn-outline-warning m-2", "modificarVideo");
//       let eliminar = crearBoton("Eliminar video", function () { showForm(whichModal, objeto._id) }, "#" + whichModal + "ContenedorModal", "btn-outline-danger m-2", "eliminarVideo");
//       botones.append(modificar, eliminar);
//       botones.style = "  display: flex;align-items: center;justify-content: center";
//       cardbody.append(categoria, id, ctg_id, botones);
//     }
//     card.append(vid, cardbody);
//   } else {
//     card = crearDiv("", "card md-2 mb-2 mt-2 mx-2 shadow", "width: auto;height:auto;overflow:hidden;");
//     let id = crearTitulo("ID: " + objeto._id, "h6", "card-card-subtitle mb-2 text-muted");
//     card.id = tipo + objeto._id;
//     let modificar = crearBoton("Modificar categoría", function () { showForm(whichModal, objeto._id, objeto.nombre) }, "#" + whichModal + "ContenedorModal", "btn-outline-warning m-2", "modificarCategoria");
//     let eliminar = crearBoton("Eliminar categoría", function () { showForm(whichModal, objeto._id) }, "#" + whichModal + "ContenedorModal", "btn-outline-danger m-2", "eliminarCategoria");
//     botones.append(modificar, eliminar);
//     cardbody.append(nombre, id, botones);
//     card.append(cardbody);
//   }
//   columna.append(card);
//   return columna;
// }

function crearIframe(video) {
  let vid = document.createElement("iframe");
  vid.src = video.url;
  vid.height = "100%";
  vid.width = "100%";
  vid.title = video.nombre;
  vid.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  vid.allowFullscreen = true;
  return vid;
}

function crearDiv(id, clase, style) {
  let div = document.createElement("div");
  if (id) { div.id = id; }
  if (clase) { div.classList = clase; }
  if (style) { div.style = style; }
  return div;
}

function crearTitulo(texto, forma = "h3", clase) {
  const label = document.createElement(forma);
  label.textContent = texto;
  if (clase) { label.className = clase; }
  return label;
}

function crearBoton(texto, listener, target, clases, accion = "") {
  const boton = document.createElement("button");
  boton.textContent = texto;
  boton.classList = "btn shadow " + clases + " " + accion;
  if (listener) { boton.addEventListener("click", listener); }
  if (target) {
    boton.setAttribute("data-bs-toggle", "modal");
    boton.setAttribute("data-bs-target", target);
  }

  return boton;
}

// function crearPaginacion(totalPaginas, numeroPagina, tipo, id_categoria) {
//   //En funcion de si la paginacion es para dentro un modal o en funcion de las categorias de getCategorias, hace una cosa u otra
//   let paginationHTML = '';
//   for (let numero = 1; numero <= totalPaginas; numero++) {
//     if (tipo) {
//       paginationHTML += `<li class="page-item ${numero === numeroPagina ? 'active' : ''}"><a class="page-link" href="#" onclick="cambiarPagina(${numero}, '${tipo}')">${numero}</a></li>`;
//       document.getElementById('pagination').innerHTML = paginationHTML;
//     } else if (id_categoria) {
//       paginationHTML += `<li class="page-item ${numero === numeroPagina ? 'active' : ''}"><a class="page-link" href="#" onclick="cambiarPagina(${numero},'', '${id_categoria}')">${numero}</a></li>`;
//       document.getElementById("paginacion" + id_categoria).innerHTML = paginationHTML;
//     }
//   }
// }

// async function cambiarPagina(pageNumber, tipo, id_categoria) {
//   let element = document.getElementById(id_categoria);
//   if (tipo) {
//     await getLista(tipo, pageNumber)
//   }
//   else {
//     await getVideos(id_categoria, pageNumber);
//     element.scrollIntoView(true);
//   }
// }

function limpieza(id, modal) {
  //Dependiendo de si el formulario se muestra en un modal u otro, limpiara solo su contenido. 
  //Así, en caso de usar el modal 2 se puede volver al 1 sin problemas 
  if (modal == 2) {
    let out = document.getElementById("second-modal-body");
    out.innerHTML = "";
    let titulo = document.getElementById("second-modal-title");
    titulo.innerHTML = "";
  } else if (modal == 1) {
    let modalBody = document.getElementById("modal-body");
    modalBody.innerHTML = "";
    let historialBusqueda = document.getElementById("historialBusqueda");
    historialBusqueda.innerHTML = "";
    let titulo = document.getElementById("modal-title");
    titulo.innerHTML = "";
    let paginador = document.getElementById("pagination");
    paginador.innerHTML = "";
  } else if (id) {
    let paginacion = document.getElementById("paginacion" + id);
    paginacion.innerHTML = "";
    let contenido = document.getElementById("contenido" + id);
    contenido.innerHTML = "";
  }

}


function crearInput(nombre, type, required = false, value) {
  var container = crearDiv("container" + nombre, "form-floating")
  var input = document.createElement('input');
  input.type = type;
  input.name = nombre;
  input.placeholder = nombre;
  input.classList.add("form-control");
  input.id = nombre;
  if (value) { input.value = value; }
  if (required === true) { input.required = true; }
  var label = document.createElement('label');
  label.textContent = nombre;
  label.setAttribute('for', nombre);
  container.append(input, label);
  return container;
}

function comprobar(result, errores) {
  let mensaje;
  if (!result) {
    mensaje = "No se ha recibido respuesta del servidor" + "\n" + errores;
  } else {
    if (result.producto || result.total || result.categoria || result.usuario || result[0] || result.nombre) {
      mensaje = "Operación exitosa";
    }
    else if (result.errors && result.errors.length > 0) {
      mensaje = result.errors[0].msg;
    } else if (errores) {
      mensaje = errores;
    } else {
      mensaje = "Ha ocurrido algún error";
    }
  }

  return mensaje;
}


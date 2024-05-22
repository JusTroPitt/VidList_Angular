'use strict';

angular.module('VidList', [])
    .factory('VidListService', ($http, ServiciosSecundarios) => {
        var VidListAPI = {};
        var token = null;

        VidListAPI.login = function (username, passwd) {
            return $http({
                method: "POST",
                url: '/login', //Es hacia donde se envia la petición dentro del servidor
                data: {
                    user: username,
                    password: passwd
                }
            }).then(function (response) {
                if (response.data.token) {
                    token = response.data.token;
                    $http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    sessionStorage.setItem("token", response.data.token);
                    sessionStorage.setItem("rol", response.data.usuario.rol);
                    sessionStorage.setItem("nombre", response.data.usuario.nombre);
                }
                return response;
            });
        };

        VidListAPI.eliminar = function (tipo, id) {

            return $http.delete("/" + tipo + "/" + id, { params: { id: id } })
                .then(function (response) {
                    console.log('Objeto eliminado:', response.data);
                    if (response.data.errormsg) {
                        alert("Error: " + response.data.errormsg);
                    } else if (response.data.msg) {
                        alert(response.data.msg);
                    }
                })
                .catch(function (error) {
                    console.log('Error al eliminar objeto:', error);
                });
        }

        VidListAPI.crear = function (tipo, nombre, correo, rol, password, url, categoria) {

            let datos = {};
            if (nombre) { datos.nombre = nombre; };
            if (correo) { datos.correo = correo; };
            if (rol) { datos.rol = rol; };
            if (password) { datos.password = password; };
            if (url) { datos.url = url; };
            if (categoria) { datos.categoria = categoria; }

            return $http({
                method: "POST",
                url: '/' + tipo, //Es hacia donde se envia la petición dentro del servidor
                data: datos
            }).then(function (response) {
                console.log(response);
                if (response.data.errormsg) {
                    alert("Error: " + response.data.errormsg);
                } else if (response.data.msg) {
                    alert(response.data.msg);
                }
                return response;
            });
        };

        VidListAPI.modificar = function (tipo, id, nombre, correo, rol, password, url, categoria) {

            let datos = {};
            datos.id = id;
            if (nombre) { datos.nombre = nombre; };
            if (correo) { datos.correo = correo; };
            if (rol) { datos.rol = rol; };
            if (password) { datos.password = password; };
            if (url) { datos.url = url; };
            if (categoria) { datos.categoria = categoria; }

            return $http({
                method: "PUT",
                url: '/' + tipo, //Es hacia donde se envia la petición dentro del servidor
                data: datos
            }).then(function (response) {
                console.log(response.data);
                if (response.data.errormsg) {
                    alert("Error: " + response.data.errormsg);
                } else if (response.data.msg) {
                    alert(response.data.msg);
                }
                return response;

            })
                .catch(function (error) {
                    console.log('Error al modificar objeto:', error);
                });
        };
        VidListAPI.videosencategoria = function (categoria_id, desde = 0, limite = 4) {
            $http.defaults.headers.common['Authorization'] = 'Bearer ' + sessionStorage.getItem("token");
            return $http.get('/videosencategoria', {
                params: {
                    _id: categoria_id,
                    desde: desde,
                    limite: limite,
                }
            }).then(function (response) {
                if (response.data.errormsg) {
                    alert("Error: " + response.data.errormsg);
                } else if (response.data.msg) {
                    alert(response.data.msg);
                }
                return response;
            });
        }
        VidListAPI.busqueda = function (tipo, desde = 0, limite = 100) {
            $http.defaults.headers.common['Authorization'] = 'Bearer ' + sessionStorage.getItem("token");
            return $http.get('/' + tipo, {
                params: {
                    desde: desde,
                    limite: limite,
                }
            }).then(function (response) {
                if (response.data.errormsg) {
                    alert("Error: " + response.data.errormsg);
                } else if (response.data.msg) {
                    alert(response.data.msg);
                }
                return response;
            });
        }
        VidListAPI.busquedaEspecifica = function (tipo, id) {

            $http.defaults.headers.common['Authorization'] = 'Bearer ' + sessionStorage.getItem("token");
            return $http.get("/" + tipo + "/" + id)
                .then(function (response) {

                    let out = document.getElementById("historialBusqueda");

                    let objeto = ServiciosSecundarios.crearCard(response.data, tipo, 2);
                    out.prepend(objeto);

                    if (response.data.errormsg) {
                        alert("Error: " + response.data.errormsg);
                    } else if (response.data.msg) {
                        alert(response.data.msg);
                    }
                    return response;

                })
        }
        return VidListAPI;
    })
    .factory('ServiciosSecundarios', ($compile) => {
        var ServSecAPI = {};

        ServSecAPI.contenidoDinamico = function (scope, contenido, salida) {

            var compiledElement = $compile(contenido)(scope);
            for (let numero = 0; numero < compiledElement.length; numero++) {
                salida.appendChild(compiledElement[numero]);
            }
        }
        ServSecAPI.limpieza = function (id, modal) {
            var elementosALimpiar = {
                1: ["modal-body", "historialBusqueda", "modal-title", "pagination"],
                2: ["second-modal-body", "second-modal-title"],
            };

            if (modal === 1 || modal === 2) {
                elementosALimpiar[modal].forEach(function (elementId) {
                    var element = document.getElementById(elementId);
                    if (element) {
                        element.innerHTML = "";
                    }
                });
            } else if (id) {
                var paginacion = document.getElementById("paginacion" + id);
                if (paginacion) {
                    paginacion.innerHTML = "";
                }
                var contenido = document.getElementById("contenido" + id);
                if (contenido) {
                    contenido.innerHTML = "";
                }
            }
        };
        ServSecAPI.crearDiv = function (id, clase, style) {
            let div = document.createElement("div");
            if (id) { div.id = id; }
            if (clase) { div.classList = clase; }
            if (style) { div.style = style; }
            return div;
        }

        ServSecAPI.crearInput = function (nombre, type, required = false, value) {
            var container = ServSecAPI.crearDiv("container" + nombre, "form-floating")
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

        ServSecAPI.crearTitulo = function (texto, forma = "h3", clase) {
            const label = document.createElement(forma);
            label.textContent = texto;
            if (clase) { label.className = clase; }
            return label;
        }
        ServSecAPI.crearIframe = function (video) {
            let vid = document.createElement("iframe");
            vid.src = video.url;
            vid.height = "100%";
            vid.width = "100%";
            vid.title = video.nombre;
            vid.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
            vid.allowFullscreen = true;
            return vid;
        }
        ServSecAPI.crearCard = function (objeto, tipo, whichModal) {
            let card;
            let columna = ServSecAPI.crearDiv("", "col mb-2");
            let cardbody = ServSecAPI.crearDiv("", "card-body");
            let nombre = ServSecAPI.crearTitulo(objeto.nombre, "h4", "card-title");
            let botones = ServSecAPI.crearDiv("", "", " display: flex;align-items: center;justify-content: center");

            if (tipo === "usuarios") {
                card = ServSecAPI.crearDiv("", "card h-100 md-2 my-2 mx-2 shadow", "width: auto;height:auto;overflow:hidden;");
                card.id = tipo + objeto.uid;
                let correo = ServSecAPI.crearTitulo(objeto.correo, "h5", "card-card-subtitle mb-2 text-muted");
                let uid = ServSecAPI.crearTitulo("UID: " + objeto.uid, "h6", "card-text");
                let rol = ServSecAPI.crearTitulo("Rol: " + objeto.rol, "h6", "card-text");
                let modificar = ServSecAPI.crearBoton("Modificar usuario", "showForm(" + whichModal + "," + objeto.uid + ", '" + objeto.nombre + "')", "#" + whichModal + "ContenedorModal", "btn-outline-warning m-2", "modificarUsuario");
                let eliminar = ServSecAPI.crearBoton("Eliminar usuario", "showForm(" + whichModal + "," + objeto.uid + ")", "#" + whichModal + "ContenedorModal", "btn-outline-danger m-2", "eliminarUsuario");

                botones.append(modificar, eliminar);
                cardbody.append(nombre, correo, uid, rol, botones);
                card.append(cardbody);
            } else if (tipo === "videos") {
                card = ServSecAPI.crearDiv("", "card h-100 md-2 mb-2 mt-2 mx-2 shadow", "width: auto;height:auto;overflow:hidden;");
                let id = ServSecAPI.crearTitulo("ID: " + objeto._id, "h6");
                let vid = ServSecAPI.crearIframe(objeto);
                card.id = tipo + objeto._id;
                cardbody.append(nombre);
                if (sessionStorage.getItem("rol") == "ADMIN_ROLE") {
                    let categoria = ServSecAPI.crearTitulo(objeto.categoria.nombre, "h5", "card-card-subtitle mb-2 text-muted");
                    let ctg_id = ServSecAPI.crearTitulo("ID de la categoría: " + objeto.categoria._id, "h6", "card-text");
                    let modificar = ServSecAPI.crearBoton("Modificar video", "showForm(" + whichModal + "," + objeto._id + ",'" + objeto.nombre + "','" + objeto.url + "'," + objeto.categoria._id + ")", "#" + whichModal + "ContenedorModal", "btn-outline-warning m-2", "modificarVideo");
                    let eliminar = ServSecAPI.crearBoton("Eliminar video", "showForm(" + whichModal + "," + objeto._id + ")", "#" + whichModal + "ContenedorModal", "btn-outline-danger m-2", "eliminarVideo");
                    botones.append(modificar, eliminar);
                    botones.style = "  display: flex;align-items: center;justify-content: center";
                    cardbody.append(categoria, id, ctg_id, botones);
                }
                card.append(vid, cardbody);
            } else {
                card = ServSecAPI.crearDiv("", "card md-2 mb-2 mt-2 mx-2 shadow", "width: auto;height:auto;overflow:hidden;");
                let id = ServSecAPI.crearTitulo("ID: " + objeto._id, "h6", "card-card-subtitle mb-2 text-muted");
                card.id = tipo + objeto._id;
                let modificar = ServSecAPI.crearBoton("Modificar categoría", "showForm(" + whichModal + "," + objeto._id + ",'" + objeto.nombre + "')", "#" + whichModal + "ContenedorModal", "btn-outline-warning m-2", "modificarCategoria");
                let eliminar = ServSecAPI.crearBoton("Eliminar categoría", "showForm(" + whichModal + "," + objeto._id + ")", "#" + whichModal + "ContenedorModal", "btn-outline-danger m-2", "eliminarCategoria");
                botones.append(modificar, eliminar);
                cardbody.append(nombre, id, botones);
                card.append(cardbody);
            }
            columna.append(card);
            return columna;
        }
        ServSecAPI.crearBoton = function (texto, listener, target, clases, accion = "") {

            const boton = document.createElement("button");
            boton.textContent = texto;
            boton.classList = "btn shadow " + clases + " " + accion;
            // if (listener) { boton.addEventListener("click", listener); }
            if (listener) { boton.setAttribute('ng-click', listener); }
            if (target) {
                boton.setAttribute("data-bs-toggle", "modal");
                boton.setAttribute("data-bs-target", target);
            }
            return (boton);


        };
        return ServSecAPI;
    })
    .controller('LoginController', function ($scope, VidListService) {
        $scope.registered = false;
        $scope.user = "";
        $scope.password = "";
        $scope.divAlerta = false;
        $scope.register = () => {
            VidListService.login($scope.user, $scope.password)
                .then(function (response) {
                    if (response.data.errormsg) {
                        $scope.alerta = response.data.errormsg;
                        $scope.divAlerta = true;
                    } else {
                        $scope.divAlerta = false;
                        $scope.registered = response.data.usuario != undefined;
                        if ($scope.registered) {
                            $scope.userdata = response.data.usuario;
                            window.location.href = "principal.html"
                        }
                    }
                });
        };
    })
    .controller('PrincipalController', function ($scope, $timeout, VidListService, ServiciosSecundarios) {
        $scope.categorias = [];
        $scope.nombreUsuario = sessionStorage.getItem("nombre");
        $scope.userRole = sessionStorage.getItem("rol");

        function init() {
            VidListService.busqueda("categorias")
                .then(function (response) {
                    $scope.categorias = response.data.productos;
                    $scope.spinner = false;
                    $scope.whichUserRole();
                });
        }
        $scope.whichUserRole = function () {
            try {
                if ($scope.userRole === "ADMIN_ROLE") {
                    $scope.getPanel();
                }
            } catch (error) {
                console.error(error);
            }
        };

        $scope.getPanel = function () {
            let todo = ServiciosSecundarios.crearDiv("panelCompleto");
            let paneles = ServiciosSecundarios.crearTitulo("PANELES", "h2", "my-2 mx-1")
            let usuarios = ServiciosSecundarios.crearDiv("", " shadow-lg rounded p-3 m-3 bg-body-tertiary");
            let categorias = ServiciosSecundarios.crearDiv("", "shadow-lg rounded p-3 m-3 bg-body-tertiary ");
            let videos = ServiciosSecundarios.crearDiv("", "shadow-lg rounded p-3 m-3 bg-body-tertiary");

            let out = document.getElementById("principal");

            usuarios.append(
                ServiciosSecundarios.crearTitulo("PANEL DE USUARIOS", "h3"),
                ServiciosSecundarios.crearBoton("Lista de Usuarios", "getLista('usuarios')", "#1ContenedorModal", "btn-outline-primary m-2", "listaUsuarios"),
                ServiciosSecundarios.crearBoton("Crear usuario", "showForm()", "#1ContenedorModal", "btn-outline-success m-2", "crearUsuario"),
                ServiciosSecundarios.crearBoton("Modificar usuario", "showForm()", "#1ContenedorModal", "btn-outline-warning m-2", "modificarUsuario"),
                ServiciosSecundarios.crearBoton("Eliminar usuario", "showForm()", "#1ContenedorModal", "btn-outline-danger m-2", "eliminarUsuario"),
                ServiciosSecundarios.crearBoton("Buscar usuario por id", "showForm()", "#1ContenedorModal", "btn-outline-info m-2", "buscarUsuario")
            );

            categorias.append(
                ServiciosSecundarios.crearTitulo("PANEL DE CATEGORÍAS", "h3"),
                ServiciosSecundarios.crearBoton("Lista de categorías", 'getLista("categorias")', "#1ContenedorModal", "btn-outline-primary m-2 ", "listaCategorias"),
                ServiciosSecundarios.crearBoton("Crear categoría", "showForm()", "#1ContenedorModal", "btn-outline-success m-2", "crearCategoria"),
                ServiciosSecundarios.crearBoton("Modificar categoría", "showForm()", "#1ContenedorModal", "btn-outline-warning m-2", "modificarCategoria"),
                ServiciosSecundarios.crearBoton("Eliminar categoría", "showForm()", "#1ContenedorModal", "btn-outline-danger m-2", "eliminarCategoria"),
                ServiciosSecundarios.crearBoton("Buscar categoría por id", "showForm()", "#1ContenedorModal", "btn-outline-info m-2", "buscarCategoria")
            );
            videos.append(
                ServiciosSecundarios.crearTitulo("PANEL DE VIDEOS", "h3"),
                ServiciosSecundarios.crearBoton("Lista de videos", "getLista('videos')", "#1ContenedorModal", "btn-outline-primary m-2", "listaVideos"),
                ServiciosSecundarios.crearBoton("Añadir video", "showForm()", "#1ContenedorModal", "btn-outline-success m-2", "crearVideo"),
                ServiciosSecundarios.crearBoton("Modificar video", "showForm()", "#1ContenedorModal", "btn-outline-warning m-2", "modificarVideo"),
                ServiciosSecundarios.crearBoton("Eliminar video", "showForm()", "#1ContenedorModal", "btn-outline-danger m-2", "eliminarVideo"),
                ServiciosSecundarios.crearBoton("Buscar video por id", "showForm()", "#1ContenedorModal", "btn-outline-info m-2", "buscarVideo")
            );

            todo.append(paneles, usuarios, categorias, videos);

            ServiciosSecundarios.contenidoDinamico($scope, todo, out);

        }
        $scope.loadVideos = function (categoriaId) { //Función necesaria para no crear un loop infinito con getVideos
            $timeout(function () {
                $scope.getVideos(categoriaId);
            });
        };
        $scope.getVideos = function (id_categoria, numeroPagina = 1) {

            let limite = 4;
            let desde = -limite + limite * numeroPagina;

            VidListService.videosencategoria(id_categoria, desde, limite).then(function (response) {
                $scope.videos = response.data.videos || [];
                console.log(response.data);
                let totalVideos = response.data.total;

                let contenido = document.getElementById("contenido" + id_categoria);
                ServiciosSecundarios.limpieza(id_categoria);
                if (totalVideos !== 0) {
                    let totalPaginas = Math.ceil(totalVideos / limite);
                    let lista = ServiciosSecundarios.crearDiv("", "row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-3  row-cols-xl-4 row-cols-xxl-4 g-3")
                    for (const video of $scope.videos) {

                        let card = ServiciosSecundarios.crearCard(video, "videos", 1);
                        lista.append(card);
                        console.log(totalVideos);
                    }
                    $scope.crearPaginacion(totalPaginas, numeroPagina, "", id_categoria);


                    ServiciosSecundarios.contenidoDinamico($scope, lista, contenido);
                }
                else {
                    let categoria = document.getElementById("categoria" + id_categoria)
                    categoria.style = "display:none";
                }
            });
        };

        $scope.getLista = function (tipo, numeroPagina = 1) {

            $scope.spinner = true;

            let limite = 9;
            let desde = -limite + limite * numeroPagina;
            let dialog = document.getElementById("modal-dialog")
            let contenedor = document.getElementById("contenedor-modal1");
            contenedor.style.width = "auto";
            let out = document.getElementById("modal-body");
            let titulo = document.getElementById("modal-title");
            dialog.className = "modal-dialog modal-md modal-lg modal-xl";
            ServiciosSecundarios.limpieza("", 1);
            titulo.textContent = "Lista de " + tipo;

            let lista = ServiciosSecundarios.crearDiv("", "album row row-cols-1 row-cols-sm-1 row-cols-md-1 row-cols-lg-2 row-cols-xl-3 g-3");

            VidListService.busqueda(tipo, desde, limite).then(function (response) {
                $scope.TotalObjetos = response.data.productos || [];
                console.log(response.data);
                $scope.totalObjetos = response.data.total || 0;

                for (const obj of $scope.TotalObjetos) {
                    let objeto = ServiciosSecundarios.crearCard(obj, tipo, 2)
                    lista.append(objeto);

                }
                let totalPaginas = Math.ceil($scope.totalObjetos / limite);
                $scope.crearPaginacion(totalPaginas, numeroPagina, tipo);

                ServiciosSecundarios.contenidoDinamico($scope, lista, out)
                $scope.spinner = false;
            });
        }
        $scope.showForm = function (whichModal = 1, id_dada, nombre, url = "", id_categoria = "") {

            $scope.spinner = false; //A veces no se llega a esconder despues de haber aparecido antes
            var elemento = event.currentTarget;
            var clases = elemento.classList;
            let dialog, out, titulo;

            if (whichModal == 2) {
                out = document.getElementById("second-modal-body");
                titulo = document.getElementById("second-modal-title");
                dialog = document.getElementById("second-modal-dialog");
            } else {
                let contenedor = document.getElementById("contenedor-modal1");
                out = document.getElementById("modal-body");
                titulo = document.getElementById("modal-title");
                dialog = document.getElementById("modal-dialog");
                contenedor.style.width = "100%";

            }
            ServiciosSecundarios.limpieza("", whichModal);
            //Por problemas con el tamaño del modal, se les da este tamaño por defecto. 
            //Se cambia si son de buscar algo, debido a la funcion de historial
            dialog.className = "modal-dialog modal-sm modal-md modal-lg";
            titulo.textContent = elemento.textContent;

            let formulario = document.createElement("form");
            formulario.classList.add("form-group", "m-auto");

            formulario.addEventListener("submit", function (event) {
                event.preventDefault();
                let id, nombre, url, categoria, uid, password, correo;
                switch (true) {
                    case clases.contains("buscarCategoria"):
                        dialog.className = "modal-dialog modal-md modal-lg modal-xl";
                        id = document.getElementById('id').value;
                        VidListService.busquedaEspecifica("categorias", id);
                        break;
                    case clases.contains("eliminarCategoria"):
                        id = id_dada ? id_dada : document.getElementById('id').value;
                        VidListService.eliminar("categorias", id);
                        break;
                    case clases.contains('crearCategoria'):
                        nombre = document.getElementById('Nombre').value;
                        VidListService.crear("categorias", nombre);
                        break;
                    case clases.contains("modificarCategoria"):
                        id = id_dada ? id_dada : document.getElementById('id').value;
                        nombre = document.getElementById('Nombre').value;
                        VidListService.modificar("categorias", id, nombre);
                        break;

                    case clases.contains("buscarVideo"):
                        dialog.className = "modal-dialog modal-md modal-lg modal-xl";
                        id = document.getElementById('id').value;
                        VidListService.busquedaEspecifica("videos", id);
                        break;
                    case clases.contains("eliminarVideo"):
                        id = id_dada ? id_dada : document.getElementById('id').value;
                        VidListService.eliminar("videos", id);
                        break;
                    case clases.contains("crearVideo"):
                        nombre = document.getElementById('Nombre').value;
                        url = document.getElementById("url").value;
                        //  var categoria = document.getElementById("id_categoria").value
                        categoria = $scope.id_categoria;
                        VidListService.crear("videos", nombre, "", "", "", url, categoria);
                        break;
                    case clases.contains("modificarVideo"):
                        nombre = document.getElementById('Nombre').value;
                        url = document.getElementById("url").value;
                        //  var categoria = document.getElementById("id_categoria").value
                        categoria = $scope.id_categoria;
                        id = id_dada ? id_dada : document.getElementById('id').value;
                        VidListService.modificar("videos", id, nombre, "", "", "", url, categoria);
                        break;
                    case clases.contains("buscarUsuario"):
                        dialog.className = "modal-dialog modal-md modal-lg modal-xl";
                        uid = document.getElementById('uid').value;
                        VidListService.busquedaEspecifica("usuarios", uid);
                        break;
                    case clases.contains("eliminarUsuario"):
                        uid = id_dada ? id_dada : document.getElementById('uid').value;
                        VidListService.eliminar("usuarios", uid);
                        break;
                    case clases.contains("crearUsuario"):
                        nombre = document.getElementById('Nombre').value;
                        correo = document.getElementById('Correo').value;
                        password = document.getElementById('Contraseña').value;
                        if (password.length < 8) {
                            alert("La contraseña debe tener al menos 8 caracteres");
                        } else {
                            VidListService.crear("usuarios", nombre, correo, "USER_ROLE", password);
                        }
                        break;
                    case clases.contains("modificarUsuario"):
                        uid = id_dada ? id_dada : document.getElementById('uid').value;
                        nombre = document.getElementById('Nombre').value;
                        correo = document.getElementById('Correo').value;
                        password = document.getElementById('Contraseña').value;
                        if (password.length < 8) {
                            alert("La contraseña debe tener al menos 8 caracteres");
                        } else {
                            VidListService.modificar("usuarios", uid, nombre, correo, "USER_ROLE", password);
                        }
                        break;
                }
            })

            if (!id_dada) { //Elimina de los formularios el input de la id de eliminar y modificar si el formulario es de los botones de una card
                if (clases.contains("buscarUsuario") || clases.contains("eliminarUsuario") || clases.contains("modificarUsuario")) {
                    formulario.append(ServiciosSecundarios.crearInput("uid", "text", true));
                }
                if (clases.contains("buscarVideo") || clases.contains("eliminarVideo") || clases.contains("modificarVideo") || clases.contains("buscarCategoria") || clases.contains("eliminarCategoria") || clases.contains("modificarCategoria")) {
                    formulario.append(ServiciosSecundarios.crearInput("id", "text", true));
                }
            }
            if (id_dada) {
                if (clases.contains("eliminarVideo") || clases.contains("eliminarUsuario") || clases.contains("eliminarCategoria")) {
                    formulario.append("Vas a eliminar a este objeto. Si estas seguro de ello, pulsa confirmar");
                }
            }
            if (clases.contains("crearUsuario") || clases.contains("modificarUsuario") || clases.contains("crearVideo") || clases.contains("modificarVideo") || clases.contains("crearCategoria") || clases.contains("modificarCategoria")) {
                formulario.append(ServiciosSecundarios.crearInput("Nombre", "text", true, nombre));
            }
            if (clases.contains("crearUsuario") || clases.contains("modificarUsuario")) {
                formulario.append(ServiciosSecundarios.crearInput("Correo", "email", true));
            }
            if (clases.contains("crearVideo") || clases.contains("modificarVideo")) {
                formulario.append(ServiciosSecundarios.crearInput("url", "url", true, url));
                formulario.append($scope.crearDesplegable("id_categoria", true, id_categoria));

            }

            if (clases.contains("crearUsuario") || clases.contains("modificarUsuario")) {
                formulario.append(ServiciosSecundarios.crearInput("Contraseña", "password", true));
            }
            var botonEnviar = ServiciosSecundarios.crearBoton("Confirmar", "", "", "btn-primary w-100 py-2 my-3");
            botonEnviar.type = 'submit';
            formulario.appendChild(botonEnviar);

            ServiciosSecundarios.contenidoDinamico($scope, formulario, out);
            if (id_categoria) { $scope.asignarValorCategoria(id_categoria) };
        }

        $scope.crearDesplegable = function (nombre, required = true) {

            var container = ServiciosSecundarios.crearDiv("container" + nombre, "form-floating");
            let opciones = document.createElement("select");
            if (required === true) { opciones.required = true; }
            opciones.classList = "form-select form-control my-0";

            opciones.setAttribute("ng-model", nombre);
            opciones.setAttribute("ng-options", "categoria._id as categoria.nombre for categoria in categorias");

            var label = document.createElement('label');
            label.textContent = "Categoría";
            label.setAttribute('for', "opciones");
            label.classList = "my-0";

            const preseleccion = document.createElement('option');
            preseleccion.classList = "dropdown-item";
            preseleccion.text = "Seleccione una categoría";
            preseleccion.value = "";

            opciones.appendChild(preseleccion);
            container.append(opciones, label);
            return container;
        }
        $scope.asignarValorCategoria = function (value) {
            $scope.id_categoria = value;
        }

        $scope.cambiarPagina = function (pageNumber, tipo, id_categoria) {
            if (tipo) {
                $scope.getLista(tipo, pageNumber)
            }
            else {
                $scope.getVideos(id_categoria, pageNumber);
            }
        }
        $scope.crearPaginacion = function (totalPaginas, numeroPagina, tipo, id_categoria) {

            let paginationHTML = '';

            for (let numero = 1; numero <= totalPaginas; numero++) {
                if (tipo) {
                    paginationHTML += `<li class="page-item ${numero === numeroPagina ? 'active' : ''}"><a class="page-link" ng-click="cambiarPagina(${numero}, '${tipo}')">${numero}</a></li>`;
                } else if (id_categoria) {
                    paginationHTML += `<li class="page-item ${numero === numeroPagina ? 'active' : ''}"><a class="page-link" ng-click="cambiarPagina(${numero},'', '${id_categoria}')">${numero}</a></li>`;
                }
            }

            if (tipo) {

                ServiciosSecundarios.contenidoDinamico($scope, paginationHTML, document.getElementById('pagination'));

            } else if (id_categoria) {

                ServiciosSecundarios.contenidoDinamico($scope, paginationHTML, document.getElementById('paginacion' + id_categoria));
            }

        };

        init();
    })

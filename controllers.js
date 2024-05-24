'use strict';

angular.module('VidList', ['ngSanitize'])
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
                    console.log(response);
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
                salida.append(compiledElement[numero]);
            }
        }
        ServSecAPI.limpieza = function (id, modal) {
            var elementosALimpiar = {
                1: ["historialBusqueda", "modal-title", "pagination"],
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

            if (tipo == "usuarios") {
                card = ServSecAPI.crearDiv("", "card h-100 md-2 my-2 mx-2 shadow", "width: auto;height:auto;overflow:hidden;");
                card.id = tipo + objeto.uid;
                let correo = ServSecAPI.crearTitulo(objeto.correo, "h5", "card-card-subtitle mb-2 text-muted");
                let uid = ServSecAPI.crearTitulo("UID: " + objeto.uid, "h6", "card-text");
                let rol = ServSecAPI.crearTitulo("Rol: " + objeto.rol, "h6", "card-text");
                let modificar = ServSecAPI.crearBoton("Modificar usuario", "showForm(" + whichModal + "," + objeto.uid + ", '" + objeto.nombre + "')", "#" + whichModal + "ContenedorModal", "btn-outline-warning m-2", "modificarUsuarios");
                let eliminar = ServSecAPI.crearBoton("Eliminar usuario", "showForm(" + whichModal + "," + objeto.uid + ")", "#" + whichModal + "ContenedorModal", "btn-outline-danger m-2", "eliminarUsuarios");

                botones.append(modificar, eliminar);
                cardbody.append(nombre, correo, uid, rol, botones);
                card.append(cardbody);
            } else if (tipo == "videos") {
                card = ServSecAPI.crearDiv("", "card h-100 md-2 mb-2 mt-2 mx-2 shadow", "width: auto;height:auto;overflow:hidden;");
                let id = ServSecAPI.crearTitulo("ID: " + objeto._id, "h6");
                let vid = ServSecAPI.crearIframe(objeto);
                card.id = tipo + objeto._id;
                cardbody.append(nombre);
                if (sessionStorage.getItem("rol") == "ADMIN_ROLE") {
                    let categoria = ServSecAPI.crearTitulo(objeto.categoria.nombre, "h5", "card-card-subtitle mb-2 text-muted");
                    let ctg_id = ServSecAPI.crearTitulo("ID de la categoría: " + objeto.categoria._id, "h6", "card-text");
                    let modificar = ServSecAPI.crearBoton("Modificar video", "showForm(" + whichModal + "," + objeto._id + ",'" + objeto.nombre + "','" + objeto.url + "'," + objeto.categoria._id + ")", "#" + whichModal + "ContenedorModal", "btn-outline-warning m-2", "modificarVideos");
                    let eliminar = ServSecAPI.crearBoton("Eliminar video", "showForm(" + whichModal + "," + objeto._id + ")", "#" + whichModal + "ContenedorModal", "btn-outline-danger m-2", "eliminarVideos");
                    botones.append(modificar, eliminar);
                    botones.style = "  display: flex;align-items: center;justify-content: center";
                    cardbody.append(categoria, id, ctg_id, botones);
                }
                card.append(vid, cardbody);
            } else {
                card = ServSecAPI.crearDiv("", "card md-2 mb-2 mt-2 mx-2 shadow", "width: auto;height:auto;overflow:hidden;");
                let id = ServSecAPI.crearTitulo("ID: " + objeto._id, "h6", "card-card-subtitle mb-2 text-muted");
                card.id = tipo + objeto._id;
                let modificar = ServSecAPI.crearBoton("Modificar categoría", "showForm(" + whichModal + "," + objeto._id + ",'" + objeto.nombre + "')", "#" + whichModal + "ContenedorModal", "btn-outline-warning m-2", "modificarCategorias");
                let eliminar = ServSecAPI.crearBoton("Eliminar categoría", "showForm(" + whichModal + "," + objeto._id + ")", "#" + whichModal + "ContenedorModal", "btn-outline-danger m-2", "eliminarCategorias");
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

    .directive('compileHtml', ['$compile', function ($compile) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                scope.$watch(
                    function () {
                        return scope.$eval(attrs.compileHtml);
                    },
                    function (value) {
                        element.html(value);
                        $compile(element.contents())(scope);
                    }
                );
            }
        };
    }])
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
    .controller('PrincipalController', function ($scope, $sce, $timeout, VidListService, ServiciosSecundarios) {
        $scope.categorias = {};
        $scope.nombreUsuario = sessionStorage.getItem("nombre");
        $scope.userRole = sessionStorage.getItem("rol");
        $scope.form = {};
        $scope.id_dada = "";
        $scope.seccionesPanel = ["usuarios", "categorias", "videos"];
        $scope.tituloModal = "";
        $scope.productos = [
            { name: 'Producto 1', email: 'producto1@gmail.com', uid: 1, rol: 'ADMIN_ROLE' },
            { name: 'Producto 2', email: 'producto2@gmail.com', uid: 2, rol: 'USER_ROLE' }
        ];
        function init() {
            VidListService.busqueda("categorias")
                .then(function (response) {
                    $scope.categorias = response.data.productos;
                    $scope.spinner = false;
                });
        }

        $scope.crearCard = function (objeto, tipo, whichModal) {
            return ServiciosSecundarios.crearCard(objeto, tipo, whichModal).outerHTML;
        };
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

                        let card = ServiciosSecundarios.crearCard(video, "videos", 2);
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
            // let dialog = document.getElementById("modal-dialog")
            let contenedor = document.getElementById("contenedor-modal1");
            //  contenedor.style.width = "auto";
            let out = document.getElementById("modal-body");
            let titulo = document.getElementById("modal-title");
            //dialog.className = "modal-dialog modal-md modal-lg modal-xl";
            titulo.textContent = "Lista de " + tipo;
            $scope.tipoModal = tipo;
            let lista = ServiciosSecundarios.crearDiv("", "album row row-cols-1 row-cols-sm-1 row-cols-md-1 row-cols-lg-2 row-cols-xl-3 g-3");

            VidListService.busqueda(tipo, desde, limite).then(function (response) {
                $scope.productos = response.data.productos || [];
                console.log(response.data);
                $scope.totalObjetos = response.data.total || 0;

                //  for (const obj of $scope.productos) {
                //      let objeto = ServiciosSecundarios.crearCard(obj, tipo, 2)
                //      lista.append(objeto);

                //  }
                let totalPaginas = Math.ceil($scope.totalObjetos / limite);
                $scope.crearPaginacion(totalPaginas, numeroPagina, tipo);

                // ServiciosSecundarios.contenidoDinamico($scope, lista, out)
                $scope.spinner = false;
            });
        }
        $scope.showForm = function (whichModal = 1, id_dada, nombre = "", url = "", id_categoria = "") {


            $scope.spinner = false; //A veces no se llega a esconder despues de haber aparecido antes
            var elemento = event.currentTarget;
            var clases = elemento.classList;
            let dialog, out, titulo;


            $scope.isFormulario = whichModal == 2 ? true : false;
            // console.log($scope.isFormulario)
            $scope.isBuscarCategorias = clases.contains("buscarCategorias");
            $scope.isEliminarCategorias = clases.contains("eliminarCategorias");
            $scope.isCrearCategorias = clases.contains('crearCategorias');
            $scope.isModificarCategorias = clases.contains("modificarCategorias");

            $scope.isBuscarVideos = clases.contains("buscarVideos");
            $scope.isEliminarVideos = clases.contains("eliminarVideos");
            $scope.isCrearVideos = clases.contains("crearVideos");
            $scope.isModificarVideos = clases.contains("modificarVideos");

            $scope.isBuscarUsuarios = clases.contains("buscarUsuarios");
            $scope.isEliminarUsuarios = clases.contains("eliminarUsuarios");
            $scope.isCrearUsuarios = clases.contains("crearUsuarios");
            $scope.isModificarUsuarios = clases.contains("modificarUsuarios");

            console.log($scope.form)
            $scope.form.url = url ? url : "";
            $scope.form.Nombre = nombre ? nombre : "";
            // $scope.form.url = url ? url : "";
            $scope.form.id_categoria = id_categoria ? id_categoria : "";

            $scope.id_dada = id_dada ? id_dada : "";
            $scope.form.id = id_dada ? id_dada : "";
            $scope.form.uid = id_dada ? id_dada : "";

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
                ServiciosSecundarios.limpieza("", whichModal);
            }
            //Por problemas con el tamaño del modal, se les da este tamaño por defecto. 
            //Se cambia si son de buscar algo, debido a la funcion de historial
            dialog.className = "modal-dialog modal-sm modal-md modal-lg";
            $scope.tituloModal = elemento.textContent;
            // $scope.form.titulo = elemento.textContent;
        }
        $scope.submit = function (formulario) {
            let dialog = document.getElementById("second-modal-dialog");
            let id, nombre, url, categoria, uid, password, correo;
            switch (true) {
                case $scope.isBuscarCategorias:
                    dialog.className = "modal-dialog modal-md modal-lg modal-xl";
                    id = $scope.form.id;
                    VidListService.busquedaEspecifica("categorias", id);
                    break;
                case $scope.isEliminarCategorias:
                    id = $scope.id_dada ? $scope.id_dada : $scope.form.id;
                    VidListService.eliminar("categorias", id);
                    break;
                case $scope.isCrearCategorias:
                    nombre = $scope.form.Nombre;
                    VidListService.crear("categorias", nombre);
                    break;
                case $scope.isModificarCategorias:
                    id = $scope.id_dada ? $scope.id_dada : $scope.form.id;
                    nombre = $scope.form.Nombre;
                    VidListService.modificar("categorias", id, nombre);
                    break;

                case $scope.isBuscarVideos:
                    dialog.className = "modal-dialog modal-md modal-lg modal-xl";
                    id = $scope.form.id;
                    VidListService.busquedaEspecifica("videos", id);
                    break;
                case $scope.isEliminarVideos:
                    id = $scope.id_dada ? $scope.id_dada : $scope.form.id;
                    VidListService.eliminar("videos", id);
                    break;
                case $scope.isCrearVideos:
                    nombre = $scope.form.Nombre;
                    url = $scope.form.url;
                    categoria = $scope.form.id_categoria;
                    VidListService.crear("videos", nombre, "", "", "", url, categoria);
                    break;
                case $scope.isModificarVideos:
                    nombre = $scope.form.Nombre;
                    url = $scope.form.url;
                    categoria = $scope.form.id_categoria;
                    id = $scope.id_dada ? $scope.id_dada : $scope.form.id;
                    VidListService.modificar("videos", id, nombre, "", "", "", url, categoria);
                    break;
                case $scope.isBuscarUsuarios:
                    dialog.className = "modal-dialog modal-md modal-lg modal-xl";
                    uid = $scope.form.uid;
                    VidListService.busquedaEspecifica("usuarios", uid);
                    break;
                case $scope.isEliminarUsuarios:
                    uid = $scope.id_dada ? $scope.id_dada : $scope.form.uid;
                    VidListService.eliminar("usuarios", uid);
                    break;
                case $scope.isCrearUsuarios:
                    nombre = $scope.form.Nombre;
                    correo = $scope.form.Correo;
                    password = $scope.form.Password;
                    if (password.length < 8) {
                        alert("La contraseña debe tener al menos 8 caracteres");
                    } else {
                        VidListService.crear("usuarios", nombre, correo, "USER_ROLE", password);
                    }
                    break;
                case $scope.isModificarUsuarios:
                    uid = $scope.id_dada ? $scope.id_dada : $scope.form.uid;
                    nombre = $scope.form.Nombre;
                    correo = $scope.form.Correo;
                    password = $scope.form.Password;
                    if (password.length < 8) {
                        alert("La contraseña debe tener al menos 8 caracteres");
                    } else {
                        VidListService.modificar("usuarios", uid, nombre, correo, "USER_ROLE", password);
                    }
                    break;
            }
            $scope.form = {};
            formulario.$setPristine();
            formulario.$setUntouched();
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
                ServiciosSecundarios.limpieza("", 1);
                ServiciosSecundarios.contenidoDinamico($scope, paginationHTML, document.getElementById('pagination'));
            } else if (id_categoria) {
                ServiciosSecundarios.contenidoDinamico($scope, paginationHTML, document.getElementById('paginacion' + id_categoria));
            }

        };

        init();
    })

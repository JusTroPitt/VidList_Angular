'use strict';

angular.module('VidList', ['ngSanitize', 'ngRoute'])
    .factory('VidListService', ($http, $location) => {
        var VidListAPI = {};
        var token = null;

        VidListAPI.login = function (username, passwd) {
            return $http({
                method: "POST",
                url: '/login',
                data: {
                    user: username,
                    password: passwd
                }
            }).then(function (response) {
                if (response.data.token) {
                    token = response.data.token;
                    sessionStorage.setItem("token", response.data.token);
                    sessionStorage.setItem("rol", response.data.usuario.rol);
                    sessionStorage.setItem("nombre", response.data.usuario.nombre);
                    sessionStorage.setItem("id", response.data.usuario.uid)
                }
                return response;
            });
        };
        VidListAPI.setHeader = function () {
            $http.defaults.headers.common['Authorization'] = 'Bearer ' + sessionStorage.getItem("token");
        }
        VidListAPI.logout = function () {
            console.log(sessionStorage.getItem("id") + " " + sessionStorage.getItem("token"))
            return $http.delete("/logout/" + sessionStorage.getItem("id") + "/" + sessionStorage.getItem("token"))
                .then(function (response) {
                    sessionStorage.clear();
                    return VidListAPI.comprobar(response);
                })
                .catch(function (error) {
                    alert('Error al eliminar sesión:' + error);
                });
        }
        VidListAPI.eliminar = function (tipo, id) {
            return $http.delete("/" + tipo + "/" + id)
                .then(function (response) {
                    return VidListAPI.comprobar(response);
                })
                .catch(function (error) {
                    alert('Error al eliminar objeto:' + error);
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
                url: '/' + tipo,
                data: datos
            }).then(function (response) {
                return VidListAPI.comprobar(response);
            }).catch(function (error) {
                alert('Error: ' + error);
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
                url: '/' + tipo,
                data: datos
            }).then(function (response) {
                return VidListAPI.comprobar(response);
            }).catch(function (error) {
                alert('Error: ' + error);
            });
        };
        VidListAPI.videosencategoria = function (categoria_id, desde = 0, limite = 4) {
            return $http.get('/videosencategoria', {
                params: {
                    _id: categoria_id,
                    desde: desde,
                    limite: limite,
                }
            }).then(function (response) {
                return VidListAPI.comprobar(response);
            }).catch(function (error) {
                alert('Error: ' + error);
            });
        }
        VidListAPI.busqueda = function (tipo, desde = 0, limite = 100) {
            return $http.get('/' + tipo, {
                params: {
                    desde: desde,
                    limite: limite,
                }
            }).then(function (response) {
                return VidListAPI.comprobar(response);
            }).catch(function (error) {
                alert('Error: ' + error);
            });
        }
        VidListAPI.busquedaEspecifica = function (tipo, id) {
            return $http.get("/" + tipo + "/" + id)
                .then(function (response) {
                    return VidListAPI.comprobar(response);
                }).catch(function (error) {
                    alert('Error: ' + error);
                });
        }
        VidListAPI.comprobar = function (response) {
            if (response.data.errormsg) {
                alert("Error: " + response.data.errormsg);
            } else if (response.data.tokenerrormsg) {
                alert("Error: " + response.data.tokenerrormsg);
                $location.path('/');
            } else if (response.data.msg) {
                alert(response.data.msg);
            }
            console.log(response);
            return response;
        }
        return VidListAPI;
    })
    .config(function ($routeProvider) {
        $routeProvider.when('/', {
            controller: 'LoginController',
            templateUrl: 'login.html'
        }).when('/principal', {
            controller: 'PrincipalController',
            templateUrl: 'principal.html'
        }).otherwise({
            redirectTo: '/'
        })
    })
    .factory('ServiciosSecundarios', () => {
        var ServSecAPI = {};

        ServSecAPI.crearDiv = function (id, clase, style) {
            let div = document.createElement("div");
            if (id) { div.id = id; }
            if (clase) { div.classList = clase; }
            if (style) { div.style = style; }
            return div;
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
        ServSecAPI.crearCard = function (objeto, tipo, historial = false) {
            let card;
            let target = historial ? "" : "#2ContenedorModal";
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
                let modificar = ServSecAPI.crearBoton("Modificar usuario", "showForm('" + tipo + "'," + objeto.uid + ", '" + objeto.nombre + "','','','" + objeto.correo + "','" + objeto.rol + "')", target, "btn-outline-warning m-2", "modificarUsuarios");
                let eliminar = ServSecAPI.crearBoton("Eliminar usuario", "showForm('" + tipo + "'," + objeto.uid + ")", target, "btn-outline-danger m-2", "eliminarUsuarios");

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
                    let categoria = objeto.categoria.nombre ? ServSecAPI.crearTitulo(objeto.categoria.nombre, "h5", "card-card-subtitle mb-2 text-muted") : ServSecAPI.crearTitulo("Sin categoría asociada", "h5", "card-card-subtitle mb-2 text-muted");
                    let ctg_id = objeto.categoria._id ? ServSecAPI.crearTitulo("ID de la categoría: " + objeto.categoria._id, "h6", "card-text") : "";
                    let modificar = ServSecAPI.crearBoton("Modificar video", "showForm('" + tipo + "'," + objeto._id + ",'" + objeto.nombre + "','" + objeto.url + "'," + objeto.categoria._id + ")", target, "btn-outline-warning m-2", "modificarVideos");
                    let eliminar = ServSecAPI.crearBoton("Eliminar video", "showForm('" + tipo + "'," + objeto._id + ")", target, "btn-outline-danger m-2", "eliminarVideos");
                    botones.append(modificar, eliminar);
                    botones.style = "  display: flex;align-items: center;justify-content: center";
                    cardbody.append(categoria, id, ctg_id, botones);
                }
                card.append(vid, cardbody);
            } else {
                card = ServSecAPI.crearDiv("", "card md-2 mb-2 mt-2 mx-2 shadow", "width: auto;height:auto;overflow:hidden;");
                let id = ServSecAPI.crearTitulo("ID: " + objeto._id, "h6", "card-card-subtitle mb-2 text-muted");
                card.id = tipo + objeto._id;
                let modificar = ServSecAPI.crearBoton("Modificar categoría", "showForm('" + tipo + "'," + objeto._id + ",'" + objeto.nombre + "')", target, "btn-outline-warning m-2", "modificarCategorias");
                let eliminar = ServSecAPI.crearBoton("Eliminar categoría", "showForm('" + tipo + "'," + objeto._id + ")", target, "btn-outline-danger m-2", "eliminarCategorias");
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
            restrict: 'A', //Se utiliza como atributo de un elemento exclusivamente
            link: function (scope, element, attrs) { //Se ejecutará cuando sea enlazada a un elemento
                scope.$watch(
                    function () {
                        return scope.$eval(attrs.compileHtml); //Cambios dinámicos en los elementos
                    },
                    function (value) {
                        element.html(value);
                        $compile(element.contents())(scope);
                    }
                );
            }
        };
    }])
    .controller('LoginController', function ($scope, $location, VidListService) {
        $scope.theme = localStorage.getItem("theme") ? localStorage.getItem("theme") : "dark";
        localStorage.setItem("theme", $scope.theme);
        $scope.bodyClass = 'login';
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
                            $location.path('/principal');
                        }
                    }
                });
        };
        $scope.changeTheme = function (theme) {
            $scope.theme = theme;
            localStorage.setItem("theme", $scope.theme);
        };
    })
    .controller('PrincipalController', function ($scope, $location, VidListService, ServiciosSecundarios) {

        $scope.theme = localStorage.getItem("theme") ? localStorage.getItem("theme") : "dark";
        localStorage.setItem("theme", $scope.theme);
        $scope.secondDialogClass = "modal-dialog modal-sm modal-md";
        $scope.categorias = []; //Contiene las categorias de la ddbb
        $scope.nombreUsuario = sessionStorage.getItem("nombre");
        $scope.userRole = sessionStorage.getItem("rol");
        $scope.form = {}; // Contiene los datos del formulario
        $scope.id_dada = "";
        $scope.seccionesPanel = ["usuarios", "categorias", "videos"]; //Para facilitar la creacion de botones y cambiar el nombre de algun objeto si fuera necesario
        $scope.tituloModal = {}; //Contiene los titulos en uso de los modales
        $scope.tipoModal = {}; // Puede ser videos,categorias o usuarios. Para distinguir los datos a cargar
        $scope.spinner = false; //Decide si se muestra o no el div del spinner
        $scope.videosAMostrar = {}; //Contiene los videos que se muestran en el inicio,el nº de paginas,etc
        $scope.limitePrincipal = 4; //Limite en la vista principal
        $scope.limiteModal = 9; // Limite en el modal que muestra
        $scope.destinoModal = "#"; //Si se abre el 2º modal a través del 1º, se cambia este valor para que al cerrar el 2º el 1º siga abierto
        $scope.historial = { //Mantiene un seguimiento de los elementos buscados en 'buscar por id'
            usuarios: [],
            categorias: [],
            videos: []
        };

        function init() {
            VidListService.setHeader();
            VidListService.busqueda($scope.seccionesPanel[1])
                .then(function (response) {
                    $scope.categorias = response.data.productos;
                    const promises = [];
                    for (const categoria of $scope.categorias) {
                        promises.push(VidListService.videosencategoria(categoria._id, 0, $scope.limitePrincipal).then(function (response) {
                            return { categoriaId: categoria._id, videos: response.data.videos, total: response.data.total, paginas: Math.ceil(response.data.total / $scope.limitePrincipal) };
                        }));
                    }
                    return Promise.all(promises);
                })
                .then(function (videosPorCategoria) {
                    for (const item of videosPorCategoria) {
                        $scope.videosAMostrar[item.categoriaId] = { total: item.total, videos: item.videos, paginas: item.paginas }
                    }
                })
                .catch(function (error) {
                    console.error("Error:", error);
                    alert('Error:' + error);
                });
        }
        $scope.changeTheme = function (theme) {
            $scope.theme = theme;
            localStorage.setItem("theme", $scope.theme);
        }
        $scope.crearCard = function (objeto, tipo, historial = false) {
            return ServiciosSecundarios.crearCard(objeto, tipo, historial).outerHTML;
        }
        $scope.logout = function () {
            VidListService.logout();
            $location.path('/index.html');
        }
        $scope.busquedaEspecifica = function (tipo, id) {
            VidListService.busquedaEspecifica(tipo, id).then(function (response) {
                if (!response.data.errormsg) {
                    $scope.historial[tipo].unshift(response.data);
                }
            });
        }
        $scope.getVideos = function (id_categoria, numeroPagina = 1) {
            //Modifica videosAMostrar para que almacene los videos de la pagina que toque
            let desde = -$scope.limitePrincipal + $scope.limitePrincipal * numeroPagina;
            VidListService.videosencategoria(id_categoria, desde, $scope.limitePrincipal).then(function (response) {
                $scope.videosAMostrar[id_categoria].videos = response.data.videos;
                $scope.videosAMostrar[id_categoria].total = response.data.total;
                $scope.videosAMostrar[id_categoria].paginas = Math.ceil(response.data.total / $scope.limitePrincipal);
            })
        }
        $scope.cambiarDestino = function () {
            $scope.destinoModal = "#";
        }
        $scope.getLista = function (tipo, numeroPagina = 1) {

            $scope.destinoModal = "#1ContenedorModal";
            $scope.spinner = true;
            let desde = -$scope.limiteModal + $scope.limiteModal * numeroPagina;
            $scope.tipoModal.primerModal = tipo;

            var elemento = event.currentTarget;
            if (event.target.classList.contains("listaUsuarios") || event.target.classList.contains("listaCategorias") || event.target.classList.contains("listaVideos")) {
                $scope.tituloModal.primerModal = elemento.textContent;
            }

            VidListService.busqueda(tipo, desde, $scope.limiteModal).then(function (response) {
                $scope.productos = response.data.productos || [];
                $scope.totalObjetos = response.data.total || 0;
                $scope.paginasModal = Math.ceil($scope.totalObjetos / $scope.limiteModal);
                $scope.spinner = false;
            });
        }
        $scope.showForm = function (tipo, id_dada, nombre = "", url = "", id_categoria = "", correo = "", rol = "") {

            if (tipo) $scope.tipoModal.segundoModal = tipo;
            $scope.spinner = false;
            var elemento = event.currentTarget;
            var clases = elemento.classList;

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
            //Con esto cogen valores los inputs del formulario en caso de modificación de un objeto
            $scope.secondDialogClass = $scope.isBuscarCategorias || $scope.isBuscarUsuarios || $scope.isBuscarVideos ? "modal-dialog modal-md modal-lg modal-xl" : "modal-dialog modal-sm modal-md";
            $scope.form.url = url ? url : "";
            $scope.form.Correo = correo ? correo : "";
            $scope.form.rol = rol ? rol : "";
            $scope.form.Nombre = nombre ? nombre : "";
            $scope.form.id_categoria = id_categoria ? id_categoria : "";

            $scope.id_dada = id_dada ? id_dada : "";
            $scope.tituloModal.segundoModal = elemento.textContent;
        }
        $scope.updateCategorias = function () {
            VidListService.busqueda($scope.seccionesPanel[1])
                .then(function (response) {
                    $scope.categorias = response.data.productos;
                })
        };
        $scope.submit = function (formulario) {
            let id, rol, nombre, url, categoria, uid, password, correo;
            switch (true) {
                case $scope.isBuscarCategorias:
                    id = $scope.form.id;
                    $scope.busquedaEspecifica($scope.seccionesPanel[1], id);
                    break;
                case $scope.isEliminarCategorias:
                    id = $scope.id_dada ? $scope.id_dada : $scope.form.id;
                    VidListService.eliminar($scope.seccionesPanel[1], id).then(() => {
                        $scope.updateCategorias();
                    });

                    break;
                case $scope.isCrearCategorias:
                    nombre = $scope.form.Nombre;
                    VidListService.crear($scope.seccionesPanel[1], nombre).then(() => {
                        $scope.updateCategorias();
                    })
                    break;
                case $scope.isModificarCategorias:
                    id = $scope.id_dada ? $scope.id_dada : $scope.form.id;
                    nombre = $scope.form.Nombre;
                    VidListService.modificar($scope.seccionesPanel[1], id, nombre).then(() => {
                        VidListService.busqueda($scope.seccionesPanel[1])
                        $scope.updateCategorias();
                    })
                    break;
                case $scope.isBuscarVideos:
                    id = $scope.form.id;
                    $scope.busquedaEspecifica($scope.seccionesPanel[2], id);
                    break;
                case $scope.isEliminarVideos:
                    id = $scope.id_dada ? $scope.id_dada : $scope.form.id;
                    VidListService.eliminar($scope.seccionesPanel[2], id);
                    break;
                case $scope.isCrearVideos:
                    nombre = $scope.form.Nombre;
                    url = $scope.form.url;
                    categoria = $scope.form.id_categoria;
                    VidListService.crear($scope.seccionesPanel[2], nombre, "", "", "", url, categoria);
                    break;
                case $scope.isModificarVideos:
                    nombre = $scope.form.Nombre;
                    url = $scope.form.url;
                    categoria = $scope.form.id_categoria;
                    id = $scope.id_dada ? $scope.id_dada : $scope.form.id;
                    VidListService.modificar($scope.seccionesPanel[2], id, nombre, "", "", "", url, categoria);
                    break;
                case $scope.isBuscarUsuarios:
                    uid = $scope.form.uid;
                    $scope.busquedaEspecifica($scope.seccionesPanel[0], uid);
                    break;
                case $scope.isEliminarUsuarios:
                    uid = $scope.id_dada ? $scope.id_dada : $scope.form.uid;
                    VidListService.eliminar($scope.seccionesPanel[0], uid);
                    break;
                case $scope.isCrearUsuarios:
                    nombre = $scope.form.Nombre;
                    correo = $scope.form.Correo;
                    rol = $scope.form.rol;
                    password = $scope.form.Password;
                    VidListService.crear($scope.seccionesPanel[0], nombre, correo, rol, password);
                    break;
                case $scope.isModificarUsuarios:
                    uid = $scope.id_dada ? $scope.id_dada : $scope.form.uid;
                    nombre = $scope.form.Nombre;
                    correo = $scope.form.Correo;
                    rol = $scope.form.rol;
                    password = $scope.form.Password;
                    VidListService.modificar($scope.seccionesPanel[0], uid, nombre, correo, rol, password);
                    break;
            }
            $scope.form = {};
            formulario.$setPristine();
            formulario.$setUntouched();
        }
        $scope.cambiarPagina = function (pageNumber, tipo, id_categoria) {
            if (tipo) {
                let idPaginacion = "pagination";
                $scope.getLista(tipo, pageNumber)
                $scope.marcarPaginaSeleccionada(idPaginacion, pageNumber);
            }
            else {
                let idPaginacion = "paginacion" + id_categoria;
                $scope.getVideos(id_categoria, pageNumber);
                $scope.marcarPaginaSeleccionada(idPaginacion, pageNumber);
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
            return paginationHTML;
        };
        $scope.marcarPaginaSeleccionada = function (idPaginacion, numeroPagina = 1) {
            let children = document.getElementById(idPaginacion).children;
            for (var i = 0; i < children.length; i++) {
                if (numeroPagina == i + 1) { children[i].classList.add("active") }
                else if (children[i].classList.contains("active")) { children[i].classList.remove("active") }
            }
        }

        init();
    })

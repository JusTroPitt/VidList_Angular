'use strict';

angular.module('VidList', [])
    .factory('VidListService', ($http) => {
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
                    window.location.href = "principal.html"
                } else { window.location.href = "index.html?fallo=true"; }
                return response;
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
            });
        }
        VidListAPI.busqueda = function (tipo,desde = 0, limite= 9){
            $http.defaults.headers.common['Authorization'] = 'Bearer ' + sessionStorage.getItem("token");
            return $http.get('/' + tipo, {
                params: {
                    desde: desde,
                    limite: limite,
                }
            });
        }
        VidListAPI.videos = function (desde = 0, limite = 9) {
            $http.defaults.headers.common['Authorization'] = 'Bearer ' + sessionStorage.getItem("token");
            return $http.get('/videos', {
                params: {
                    desde: desde,
                    limite: limite,
                }
            });
        }
        VidListAPI.usuarios = function (desde = 0, limite = 9) {
            $http.defaults.headers.common['Authorization'] = 'Bearer ' + sessionStorage.getItem("token");
            return $http.get('/usuarios', {
                params: {
                    desde: desde,
                    limite: limite,
                }
            });
        }
        return VidListAPI;
    })
    .factory('ServiciosSecundarios', () => {
        var ServSecAPI = {};
        var token = null;

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
    .controller('LoginController', function ($scope, $location, VidListService) {
        $scope.registered = false;
        $scope.user = "";
        $scope.password = "";

        $scope.register = () => {
            VidListService.login($scope.user, $scope.password)
                .then(function (response) {
                    $scope.registered = response.data.usuario != undefined;
                    if ($scope.registered) {
                        $scope.userdata = response.data.usuario;
                        window.location.href = "principal.html"
                    }
                });
        };
    })
    .controller('PrincipalController', function ($scope, VidListService, ServiciosSecundarios, $compile) {
        $scope.categorias = [];

        // Función para inicializar el controlador
        function init() {
            // Obtener las categorías del servicio
            $scope.nombreUsuario = sessionStorage.getItem("nombre");
            VidListService.busqueda("categorias").then(function (response) {
                $scope.categorias = response.data.productos;
                $scope.whichUserRole();
            });            
        }
        $scope.whichUserRole = function () {

            try {
                var userRole = sessionStorage.getItem("rol");
                if (userRole === "ADMIN_ROLE") {
                    $scope.getPanel();
                    $scope.getCategorias();
                } else {
                    $scope.getCategorias();
                }
            } catch (error) {
                console.error(error);
            }
        };

        $scope.getPanel = function () {
            let todo = crearDiv("panelCompleto");
            let paneles = crearTitulo("PANELES", "h2", "my-2 mx-1")
            let usuarios = crearDiv("", " shadow-lg rounded p-3 m-3 bg-body-tertiary");
            let categorias = crearDiv("", "shadow-lg rounded p-3 m-3 bg-body-tertiary ");
            let videos = crearDiv("", "shadow-lg rounded p-3 m-3 bg-body-tertiary");

            let out = document.getElementById("principal");

            usuarios.append(
                crearTitulo("PANEL DE USUARIOS", "h3"),
                ServiciosSecundarios.crearBoton("Lista de Usuarios", "getLista('usuarios')", "#1ContenedorModal", "btn-outline-primary m-2", "listaUsuarios"),
                crearBoton("Crear usuario", showForm, "#1ContenedorModal", "btn-outline-success m-2", "crearUsuario"),
                crearBoton("Modificar usuario", showForm, "#1ContenedorModal", "btn-outline-warning m-2", "modificarUsuario"),
                crearBoton("Eliminar usuario", showForm, "#1ContenedorModal", "btn-outline-danger m-2", "eliminarUsuario"),
                crearBoton("Buscar usuario por id", showForm, "#1ContenedorModal", "btn-outline-info m-2", "buscarUsuario")
            );

            categorias.append(
                crearTitulo("PANEL DE CATEGORÍAS", "h3"),
                ServiciosSecundarios.crearBoton("Lista de categorías",'getLista("categorias")', "#1ContenedorModal", "btn-outline-primary m-2 ", "listaCategorias"),
                crearBoton("Crear categoría", showForm, "#1ContenedorModal", "btn-outline-success m-2", "crearCategoria"),
                crearBoton("Modificar categoría", showForm, "#1ContenedorModal", "btn-outline-warning m-2", "modificarCategoria"),
                crearBoton("Eliminar categoría", showForm, "#1ContenedorModal", "btn-outline-danger m-2", "eliminarCategoria"),
                crearBoton("Buscar categoría por id", showForm, "#1ContenedorModal", "btn-outline-info m-2", "buscarCategoria")
            );
            videos.append(
                crearTitulo("PANEL DE VIDEOS", "h3"),
                ServiciosSecundarios.crearBoton("Lista de videos", "getLista('videos')", "#1ContenedorModal", "btn-outline-primary m-2", "listaVideos"),
                crearBoton("Añadir video", showForm, "#1ContenedorModal", "btn-outline-success m-2", "crearVideo"),
                crearBoton("Modificar video", showForm, "#1ContenedorModal", "btn-outline-warning m-2", "modificarVideo"),
                crearBoton("Eliminar video", showForm, "#1ContenedorModal", "btn-outline-danger m-2", "eliminarVideo"),
                crearBoton("Buscar video por id", showForm, "#1ContenedorModal", "btn-outline-info m-2", "buscarVideo")
            );

            todo.append(paneles, usuarios, categorias, videos);

            var compiledElement = $compile(todo)($scope);
            for (let numero = 0; numero < compiledElement.length; numero++) {
                out.appendChild(compiledElement[numero]);
            }
        }
        // Función para crear y mostrar las categorías en el DOM
        $scope.getCategorias = function () {
            let out = document.getElementById("categorias");
            for (const cat of $scope.categorias) {
                let categoria = crearDiv(cat._id, "mx-0 my-2 p-2 rounded bg-body-tertiary shadow-lg");
                let contenido = crearDiv("contenido" + cat._id);
                let data = crearTitulo(cat.nombre, "h3", "m-3 pb-1");
                let paginacion = document.createElement("ul");
                paginacion.id = "paginacion" + cat._id;
                paginacion.className = "pagination col-md-12 justify-content-end d-flex mt-3 mb-0";

                categoria.append(data, contenido, paginacion);
                out.appendChild(categoria);

                $scope.getVideos(cat._id);
            }
        };
        $scope.getVideos = function (id_categoria, numeroPagina = 1) {

            let limite = 4;
            let desde = -limite + limite * numeroPagina;

            VidListService.videosencategoria(id_categoria, desde, limite).then(function (response) {
                $scope.videos = response.data.videos || [];
                console.log(response.data);
                $scope.totalVideos = response.data.total || 0;

                let contenido = document.getElementById("contenido" + id_categoria);
                limpieza(id_categoria);
                let totalVideos = $scope.totalVideos;
                if (totalVideos !== 0) {
                    let totalPaginas = Math.ceil(totalVideos / limite);
                    let lista = crearDiv("", "row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-3  row-cols-xl-4 row-cols-xxl-4 g-3")
                    for (const video of $scope.videos) {
                        console.log(video.nombre)
                        let card = crearCard(video, "videos", 1);
                        lista.append(card);
                    }
                    $scope.crearPaginacion(totalPaginas, numeroPagina, "", id_categoria);
                    contenido.append(lista);
                }
                else {
                    let categoria = document.getElementById(id_categoria)
                    categoria.style = "display:none";
                }
            });
        };

        $scope.getLista = function (tipo, numeroPagina = 1) {
           
            showLoadingSpinner();

            let limite = 9;
            let desde = -limite + limite * numeroPagina;
            let dialog = document.getElementById("modal-dialog")
            let contenedor = document.getElementById("contenedor-modal1");
            contenedor.style.width = "auto";
            let out = document.getElementById("modal-body");
            let titulo = document.getElementById("modal-title");
            dialog.className = "modal-dialog modal-md modal-lg modal-xl";
            limpieza("", 1);
            titulo.textContent = "Lista de " + tipo;

            let lista = crearDiv("", "album row row-cols-1 row-cols-sm-1 row-cols-md-1 row-cols-lg-2 row-cols-xl-3 g-3");

                VidListService.busqueda(tipo,desde, limite).then(function (response) {
                    $scope.TotalObjetos = response.data.productos || [];
                    console.log(response.data);
                    $scope.totalObjetos = response.data.total || 0;

                    for (const obj of $scope.TotalObjetos) {
                        let objeto = crearCard(obj, tipo, 2)
                        lista.append(objeto);
                    
                    }
                    let totalPaginas = Math.ceil($scope.totalObjetos / limite);
                    $scope.crearPaginacion(totalPaginas, numeroPagina, tipo);
                    out.append(lista);

                    hideLoadingSpinner();
                });
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
                var compiledElement = $compile(paginationHTML)($scope);
                console.log(paginationHTML);

                for (let numero = 0; numero < compiledElement.length; numero++) {
                    document.getElementById('pagination').appendChild(compiledElement[numero]);
                }
            } else if (id_categoria) {
                var compiledElement = $compile(paginationHTML)($scope);
                console.log(paginationHTML);

                for (let numero = 0; numero < compiledElement.length; numero++) {
                    document.getElementById('paginacion' + id_categoria).appendChild(compiledElement[numero]);
                }
            }

        };

        init();
    })

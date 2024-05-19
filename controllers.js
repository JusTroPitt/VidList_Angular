'use strict';

angular.module('myWatchList', [])
    .factory('myWatchListService', ($http) => {
        var myWatchListAPI = {};
        var token = null;

        myWatchListAPI.login = function (username, passwd) {
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

        myWatchListAPI.logout = function () {
            token = null;
            $http.defaults.headers.common['Authorization'] = null;
            return $http.get('/logout');
        };

        myWatchListAPI.categorias = function () {
            $http.defaults.headers.common['Authorization'] = 'Bearer ' + sessionStorage.getItem("token");
            return $http.get('/categorias');
        };

        myWatchListAPI.videos = function (categoria_id, desde = 0, limite = 4) {
            $http.defaults.headers.common['Authorization'] = 'Bearer ' + sessionStorage.getItem("token");
            return $http.get('/videos', {
                params: {
                    _id: categoria_id,
                    desde: desde,
                    limite: limite,
                }
            });
        }
        myWatchListAPI.email = function (uid) {
            $http.defaults.headers.common['Authorization'] = 'Bearer ' + sessionStorage.getItem("token");
            return $http.get('/email/' + uid);
        };

        return myWatchListAPI;
    })
    // .config(function ($routeProvider, $httpProvider) {
    //     $routeProvider.when('/', {
    //         controller: 'LoginController',
    //          templateUrl: 'index.html'
    //     }).when('/detail/:id', {
    //         controller: 'DetailController',
    //         templateUrl: 'detail.html'
    //     }).otherwise({
    //         redirectTo: '/'
    //     });

    //     // Agregar interceptor de autenticación
    //     $httpProvider.interceptors.push('authInterceptor');
    // })
    // .factory('authInterceptor', function ($q, $location) {
    //     return {
    //         responseError: function (response) {
    //             if (response.status === 403 || response.status === 401) {
    //                 $location.path('/');
    //             }
    //             return $q.reject(response);
    //         }
    //     };
    // })
    .controller('LoginController', function ($scope, $location, myWatchListService) {
        $scope.registered = false;
        $scope.user = "";
        $scope.password = "";

        $scope.register = () => {
            myWatchListService.login($scope.user, $scope.password)
                .then(function (response) {
                    $scope.registered = response.data.usuario != undefined;
                    if ($scope.registered) {
                        $scope.userdata = response.data.usuario;
                        window.location.href = "principal.html"
                    }
                });
        };
    })
    .controller('PrincipalController', function ($scope, myWatchListService, $compile) {
        $scope.categorias = [];

        // Función para inicializar el controlador
        function init() {
            // Obtener las categorías del servicio
            myWatchListService.categorias().then(function (response) {
                $scope.categorias = response.data.categorias;
                $scope.getCategorias(); // Llamar getCategorias después de cargar las categorías
            });
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

            myWatchListService.videos(id_categoria, desde, limite).then(function (response) {
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

        $scope.cambiarPagina = function (pageNumber, tipo, id_categoria) {
            if (tipo) {
                //       await getLista(tipo, pageNumber)
            }
            else {
                $scope.getVideos(id_categoria, pageNumber);
                // element.scrollIntoView(true);
            }
        }
        $scope.crearPaginacion = function (totalPaginas, numeroPagina, tipo, id_categoria) {

            let paginationHTML = '';

            for (let numero = 1; numero <= totalPaginas; numero++) {
                if (tipo) {
                    paginationHTML += `<li class="page-item ${numero === numeroPagina ? 'active' : ''}"><a class="page-link" href="#" ng-click="cambiarPagina(${numero}, '${tipo}')">${numero}</a></li>`;
                } else if (id_categoria) {
                    paginationHTML += `<li class="page-item ${numero === numeroPagina ? 'active' : ''}"><a class="page-link" ng-click="cambiarPagina(${numero},'', '${id_categoria}')">${numero}</a></li>`;
                }
            }
            var compiledElement = $compile(paginationHTML)($scope);
            console.log(paginationHTML);

            for (let numero = 0; numero < compiledElement.length; numero++) {
                document.getElementById('paginacion' + id_categoria).appendChild(compiledElement[numero]);
            }


        };

        // Inicializar el controlador
        init();
    })

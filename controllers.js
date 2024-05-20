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

        VidListAPI.categorias = function () {
            $http.defaults.headers.common['Authorization'] = 'Bearer ' + sessionStorage.getItem("token");
            return $http.get('/categorias');
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
    .controller('PrincipalController', function ($scope, VidListService, $compile) {
        $scope.categorias = [];

        // Función para inicializar el controlador
        function init() {
            // Obtener las categorías del servicio
            VidListService.categorias().then(function (response) {
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
            //async function getLista(tipo, numeroPagina = 1) {
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

            //     const response = await fetch("https://labingsoft.onrender.com/api/" + tipo + "?limite=" + limite + "&desde=" + desde, requestOptions);
            if (tipo === "videos") {

                VidListService.videos(desde, limite).then(function (response) {
                    $scope.videosTotal = response.data.videos || [];
                    console.log(response.data);
                    $scope.totalObjetos = response.data.total || 0;

                    for (const vid of $scope.videosTotal) {
                        let video = crearCard(vid, tipo, 2)
                        lista.append(video);
                    }

                    // let totalObjetos = result.total;
                    let totalPaginas = Math.ceil($scope.totalObjetos / limite);
                    $scope.crearPaginacion(totalPaginas, numeroPagina, tipo);
                    out.append(lista);

                    hideLoadingSpinner();
                });
            };
            //       for (const vid of result.productos) {
            //         let video = crearCard(vid, tipo, 2)
            //         lista.append(video);
            //       }

            //     } else if (tipo === "usuarios") {
            //       for (const usr of result.usuarios) {
            //         let usuario = crearCard(usr, tipo, 2);
            //         lista.append(usuario);
            //       }
            //     } else {
            //       for (const ctg of result.categorias) {
            //         let categoria = crearCard(ctg, tipo, 2);
            //         lista.append(categoria);
            //       }
            //     }
            //     let totalObjetos = result.total;
            //     let totalPaginas = Math.ceil(totalObjetos / limite);
            //     crearPaginacion(totalPaginas, numeroPagina, tipo);
            //     out.append(lista);
            //   } catch (error) {
            //     console.error(error);
            //     out.append("Ha ocurrido un error imprevisto");
            //   } finally {
            //     hideLoadingSpinner();
            //   }

        }

        $scope.cambiarPagina = function (pageNumber, tipo, id_categoria) {
            if (tipo) {
                $scope.getLista(tipo, pageNumber)
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
            } else if(id_categoria){
                var compiledElement = $compile(paginationHTML)($scope);
            console.log(paginationHTML);

            for (let numero = 0; numero < compiledElement.length; numero++) {
                document.getElementById('paginacion' + id_categoria).appendChild(compiledElement[numero]);
            }
            }


        };

        init();
    })

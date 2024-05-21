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

        VidListAPI.eliminar = function (tipo, id) {

            return $http.delete("/" + tipo, { params: { id: id } })
                .then(function (response) {
                    console.log('Objeto eliminado:', response.data);
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
                return response;
            });
        };

        VidListAPI.modificar = function (tipo,id, nombre, correo, rol, password, url, categoria) {

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
                return response;
            })
            .catch(function (error) {
                     console.log('Error al modificar objeto:', error);
                 });
        };

        // .then(function (response) {
        //     console.log('Objeto eliminado:', response.data);
        // })
        // .catch(function (error) {
        //     console.log('Error al eliminar objeto:', error);
        // });
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
        VidListAPI.busqueda = function (tipo, desde = 0, limite = 100) {
            $http.defaults.headers.common['Authorization'] = 'Bearer ' + sessionStorage.getItem("token");
            return $http.get('/' + tipo, {
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

        function init() {
            $scope.nombreUsuario = sessionStorage.getItem("nombre");
            VidListService.busqueda("categorias").then(function (response) {
                $scope.categorias = response.data.productos;
                console.log($scope.categorias)
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
                ServiciosSecundarios.crearBoton("Crear usuario", "showForm()", "#1ContenedorModal", "btn-outline-success m-2", "crearUsuario"),
                ServiciosSecundarios.crearBoton("Modificar usuario", "showForm()", "#1ContenedorModal", "btn-outline-warning m-2", "modificarUsuario"),
                ServiciosSecundarios.crearBoton("Eliminar usuario", "showForm()", "#1ContenedorModal", "btn-outline-danger m-2", "eliminarUsuario"),
                ServiciosSecundarios.crearBoton("Buscar usuario por id", "showForm()", "#1ContenedorModal", "btn-outline-info m-2", "buscarUsuario")
            );

            categorias.append(
                crearTitulo("PANEL DE CATEGORÍAS", "h3"),
                ServiciosSecundarios.crearBoton("Lista de categorías", 'getLista("categorias")', "#1ContenedorModal", "btn-outline-primary m-2 ", "listaCategorias"),
                ServiciosSecundarios.crearBoton("Crear categoría", "showForm()", "#1ContenedorModal", "btn-outline-success m-2", "crearCategoria"),
                ServiciosSecundarios.crearBoton("Modificar categoría", "showForm()", "#1ContenedorModal", "btn-outline-warning m-2", "modificarCategoria"),
                ServiciosSecundarios.crearBoton("Eliminar categoría", "showForm()", "#1ContenedorModal", "btn-outline-danger m-2", "eliminarCategoria"),
                ServiciosSecundarios.crearBoton("Buscar categoría por id", "showForm()", "#1ContenedorModal", "btn-outline-info m-2", "buscarCategoria")
            );
            videos.append(
                crearTitulo("PANEL DE VIDEOS", "h3"),
                ServiciosSecundarios.crearBoton("Lista de videos", "getLista('videos')", "#1ContenedorModal", "btn-outline-primary m-2", "listaVideos"),
                ServiciosSecundarios.crearBoton("Añadir video", "showForm()", "#1ContenedorModal", "btn-outline-success m-2", "crearVideo"),
                ServiciosSecundarios.crearBoton("Modificar video", "showForm()", "#1ContenedorModal", "btn-outline-warning m-2", "modificarVideo"),
                ServiciosSecundarios.crearBoton("Eliminar video", "showForm()", "#1ContenedorModal", "btn-outline-danger m-2", "eliminarVideo"),
                ServiciosSecundarios.crearBoton("Buscar video por id", "showForm()", "#1ContenedorModal", "btn-outline-info m-2", "buscarVideo")
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
                let categoria = crearDiv("categoria" + cat._id, "mx-0 my-2 p-2 rounded bg-body-tertiary shadow-lg");
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
                let totalVideos = response.data.total;

                let contenido = document.getElementById("contenido" + id_categoria);
                limpieza(id_categoria);
                if (totalVideos !== 0) {
                    let totalPaginas = Math.ceil(totalVideos / limite);
                    let lista = crearDiv("", "row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-3  row-cols-xl-4 row-cols-xxl-4 g-3")
                    for (const video of $scope.videos) {

                        let card = crearCard(video, "videos", 1);
                        lista.append(card);
                        console.log(totalVideos);
                    }
                    $scope.crearPaginacion(totalPaginas, numeroPagina, "", id_categoria);
                    contenido.append(lista);
                }
                else {
                    let categoria = document.getElementById("categoria" + id_categoria)
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

            VidListService.busqueda(tipo, desde, limite).then(function (response) {
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
        $scope.showForm = function (whichModal = 1, id_dada, nombre, url = "", id_categoria = "") {

            hideLoadingSpinner(); //A veces no se llega a esconder despues de haber aparecido antes
            var elemento = event.currentTarget;
            var clases = elemento.classList;
            let dialog;
            let out;
            let titulo;

            if (whichModal == 2) {
                out = document.getElementById("second-modal-body");
                titulo = document.getElementById("second-modal-title");
                // footer = document.getElementById("second-modal-footer");
                dialog = document.getElementById("second-modal-dialog");
            } else {
                let contenedor = document.getElementById("contenedor-modal1");
                out = document.getElementById("modal-body");
                titulo = document.getElementById("modal-title");
                // footer = document.getElementById("modal-footer");
                dialog = document.getElementById("modal-dialog");
                contenedor.style.width = "100%";

            }
            limpieza("", whichModal);
            //Por problemas con el tamaño del modal, se les da este tamaño por defecto. 
            //Se cambia si son de buscar algo, debido a la funcion de historial
            dialog.className = "modal-dialog modal-sm modal-md modal-lg";
            titulo.textContent = elemento.textContent;

            let formulario = document.createElement("form");
            formulario.classList.add("form-group", "m-auto");

            formulario.addEventListener("submit", function (event) {
                event.preventDefault();
                switch (true) {
                    case clases.contains("buscarCategoria"):
                        dialog.className = "modal-dialog modal-md modal-lg modal-xl";
                        var id = document.getElementById('id').value;
                        buscar("categorias", id);
                        break;
                    case clases.contains("eliminarCategoria"):
                        if (id_dada) { var id = id_dada } else {
                            var id = document.getElementById('id').value;
                        }
                        VidListService.eliminar("categorias", id);
                        break;
                    case clases.contains('crearCategoria'):
                        var nombre = document.getElementById('Nombre').value;
                        VidListService.crear("categorias", nombre);
                        break;
                    case clases.contains("modificarCategoria"):
                        if (id_dada) { var id = id_dada } else {
                            var id = document.getElementById('id').value;
                        }
                        var nombre = document.getElementById('Nombre').value;
                        VidListService.modificar("categorias", id, nombre);
                        break;

                    case clases.contains("buscarVideo"):
                        dialog.className = "modal-dialog modal-md modal-lg modal-xl";
                        var id = document.getElementById('id').value;
                        buscar("videos", id);
                        break;
                    case clases.contains("eliminarVideo"):
                        if (id_dada) {
                            var id = id_dada;
                        } else {
                            var id = document.getElementById('id').value;
                        }
                        VidListService.eliminar("videos", id);
                        break;
                    case clases.contains("crearVideo"):
                        var nombre = document.getElementById('Nombre').value;
                        var url = document.getElementById("url").value;
                      //  var categoria = document.getElementById("id_categoria").value
                      var categoria = $scope.id_categoria;
                        VidListService.crear("videos", nombre, "", "", "", url, categoria);
                        break;
                    case clases.contains("modificarVideo"):
                        var nombre = document.getElementById('Nombre').value;
                        var url = document.getElementById("url").value;
                      //  var categoria = document.getElementById("id_categoria").value
                      var categoria = $scope.id_categoria;
                        if (id_dada) {
                            var id = id_dada;
                        } else {
                            var id = document.getElementById('id').value;
                        }
                        VidListService.modificar("videos", id, nombre, "","","", url, categoria);
                        break;
                    case clases.contains("buscarUsuario"):
                        dialog.className = "modal-dialog modal-md modal-lg modal-xl";
                        var uid = document.getElementById('uid').value;
                        buscar("usuarios", uid);
                        break;
                    case clases.contains("eliminarUsuario"):
                        if (id_dada) { var uid = id_dada } else {
                            var uid = document.getElementById('uid').value;
                        }
                        VidListService.eliminar("usuarios", uid);
                        break;
                    case clases.contains("crearUsuario"):
                        var nombre = document.getElementById('Nombre').value;
                        var correo = document.getElementById('Correo').value;
                        var password = document.getElementById('Contraseña').value;
                        if (password.length < 8) {
                            alert("La contraseña debe tener al menos 8 caracteres");
                        } else {
                            VidListService.crear("usuarios", nombre, correo, "USER_ROLE", password);
                        }
                        break;
                    case clases.contains("modificarUsuario"):
                        if (id_dada) { var uid = id_dada } else {
                            var uid = document.getElementById('uid').value;
                        }
                        var nombre = document.getElementById('Nombre').value;
                        var correo = document.getElementById('Correo').value;
                        var password = document.getElementById('Contraseña').value;
                        if (password.length < 8) {
                            alert("La contraseña debe tener al menos 8 caracteres");
                        } else {
                            VidListService.modificar("usuarios", uid, nombre,correo,"USER_ROLE", password);
                        }
                        break;
                }
            })

            if (!id_dada) { //Elimina de los formularios el input de la id de eliminar y modificar si el formulario es de los botones de una card
                if (clases.contains("buscarUsuario") || clases.contains("eliminarUsuario") || clases.contains("modificarUsuario")) {
                    formulario.append(crearInput("uid", "text", true));
                }
                if (clases.contains("buscarVideo") || clases.contains("eliminarVideo") || clases.contains("modificarVideo") || clases.contains("buscarCategoria") || clases.contains("eliminarCategoria") || clases.contains("modificarCategoria")) {
                    formulario.append(crearInput("id", "text", true));
                }
            }
            if (id_dada) {
                if (clases.contains("eliminarVideo") || clases.contains("eliminarUsuario") || clases.contains("eliminarCategoria")) {
                    formulario.append("Vas a eliminar a este objeto. Si estas seguro de ello, pulsa confirmar");
                }
            }
            if (clases.contains("crearUsuario") || clases.contains("modificarUsuario") || clases.contains("crearVideo") || clases.contains("modificarVideo") || clases.contains("crearCategoria") || clases.contains("modificarCategoria")) {
                formulario.append(crearInput("Nombre", "text", true, nombre));
            }
            if (clases.contains("crearUsuario") || clases.contains("modificarUsuario")) {
                formulario.append(crearInput("Correo", "email", true));
            }
            if (clases.contains("crearVideo") || clases.contains("modificarVideo")) {
                formulario.append(crearInput("url", "url", true, url));
                formulario.append($scope.crearDesplegable("id_categoria", true, id_categoria));

            }

            if (clases.contains("crearUsuario") || clases.contains("modificarUsuario")) {
                formulario.append(crearInput("Contraseña", "password", true));
            }
            var botonEnviar = crearBoton("Confirmar", "", "", "btn-primary w-100 py-2 my-3");
            botonEnviar.type = 'submit';
            formulario.appendChild(botonEnviar);

            var compiledElement = $compile(formulario)($scope);
            for (let numero = 0; numero < compiledElement.length; numero++) {
                out.appendChild(compiledElement[numero]);
            }
            out.append(formulario);
        }

        $scope.crearDesplegable = function (nombre, required = true, value = 0) {

            var container = crearDiv("container" + nombre, "form-floating");
            let opciones = document.createElement("select");
            //opciones.id = "id_categoria";
            if (required === true) { opciones.required = true; }
            opciones.classList = "form-select form-control my-0";
            opciones.setAttribute("ng-model",nombre);
            opciones.setAttribute("ng-options","categoria._id as categoria.nombre for categoria in categorias" )
            var label = document.createElement('label');
            label.textContent = "Categoría";
            label.setAttribute('for', "opciones");
            label.classList = "my-0";

            const preseleccion = document.createElement('option');
           // preseleccion.classList = "dropdown-item";
            preseleccion.text = "Seleccione una categoría";
            preseleccion.value = "";
            opciones.appendChild(preseleccion);

              //  $scope.categoria_id = value;
               // $scope.categoria_id.selected = true;
                container.append(opciones, label);
                return container;
                //     }
                //     catch (error) {
                //       console.error('Hubo un problema con la petición fetch:', error);
                //     }

          //  });
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

'use strict';

const express = require('express'); // Cargamos el modulo de Express

const session = require('express-session'); // Cargamos el modulo para la gestion de sesiones

const bodyParser = require('body-parser'); // Obtener la referencia al módulo 'body-parser'

const sqlite3 = require('sqlite3').verbose(); // Cargar el módulo para bases de datos SQLite

const server = express(); // Configuración del servidor y puerto
const port = 8080;

const { v4: uuidv4 } = require('uuid');

const sesscfg = { // Configuración de sesiones
    secret: 'practicas-lsi-2024',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 8 * 60 * 60 * 1000 } // 8 working hours
};
server.use(session(sesscfg));

server.use(bodyParser.urlencoded({ extended: false })); // Configuración de body-parser
server.use(bodyParser.json());

const router = express.Router(); // Configurar el enrutador

var db = new sqlite3.Database('miDDBB.db', (err) => { // Abrir la base de datos
    if (err) console.log(err);
});

function processCorreo(req, res, db) { // Función para procesar el login y generar el token
    var correo = req.body.user;
    var password = req.body.password;

    db.get('SELECT * FROM users WHERE correo=?', correo, (err, row) => {
        if (row == undefined) {
            return res.json({ errormsg: 'El usuario no existe' });
        } else if (err) {
            return res.json({ errormsg: 'Error: ' + err });
        }
        else if (row.password === password) {
            req.session.userID = row.uid;
            console.log("el rol: " + row.rol);
            const token = (row.rol == "ADMIN_ROLE") ? "A" + uuidv4() : "U" + uuidv4();

            db.run('INSERT INTO sessionToken (sessionID, user_uid) VALUES (?, ?)', [token, row.uid], function (err) {
                if (err) {
                    return console.log(err.message);
                }
                console.log('A session with ID ${token} has been created');
            });
            var data = {
                usuario: {
                    uid: row.uid,
                    correo: row.correo,
                    nombre: row.nombre,
                    rol: row.rol
                },
                token: token
            };
            return res.json(data);
        } else {
            return res.json({ errormsg: 'Fallo de autenticación' });
        }
    });
}

function processCrearUsuario(req, res, db) {
    var nombre = req.body.nombre;
    var correo = req.body.correo;
    var rol = req.body.rol;
    var password = req.body.password;

    db.run('INSERT INTO users (nombre, correo,rol,password) VALUES (?, ?,?,?)', [nombre, correo, rol, password], function (err) {
        if (err) {
            console.log("Error al insertar usuario:", err);
            return res.json({ errormsg: err });
        } else {
            return res.json({ msg: "Usuario insertado correctamente" });
        }
    });
}

function processModificarVideo(req, res, db) {
    var nombre = req.body.nombre;
    var url = req.body.url;
    var categoria = req.body.categoria;
    var id = req.body.id;

    db.run('UPDATE videos SET nombre = ?, url = ?, categoria_id = ? WHERE _id = ?', [nombre, url, categoria, id], function (err) {
        if (err) {
            console.log("Error al modificar video:", err);
            return res.json({ errormsg: err })
        } else {
            console.log("Video modificado correctamente");
            return res.json({ msg: "Video modificado correctamente" })
        }
    });
}

function processModificarUsuario(req, res, db) {
    var nombre = req.body.nombre;
    var correo = req.body.correo;
    var rol = req.body.rol;
    var password = req.body.password;
    var id = req.body.id;

    db.run('UPDATE users SET nombre = ?, correo = ?, rol = ?, password= ? WHERE uid = ?', [nombre, correo, rol, password, id], function (err) {
        if (err) {
            console.log("Error al modificar usuario:", err);
            return res.json({ errormsg: err })
        } else {
            console.log("Usuario modificado correctamente");
            return res.json({ msg: "Usuario modificado correctamente" })
        }
    });
}
function processModificarCategorias(req, res, db) {
    var nombre = req.body.nombre;
    var id = req.body.id;

    db.run('UPDATE categorias SET nombre = ? WHERE _id = ?', [nombre, id], function (err) {
        if (err) {
            return res.json({ errormsg: "Error al modificar categoria:" + err })
        } else {
            return res.json({ msg: "Categoria modificada correctamente" })
        }
    });
}
function logout(req, res, db) {

    var id = req.params.id;
    var token = req.params.token;
    console.log(id + "" + token);
    db.run("DELETE FROM sessionToken WHERE sessionID = ? AND user_uid = ?", [token, id], function (err) {
        if (err) {
            return res.json({ errormsg: "Error al eliminar sesión:" + err })
        } else {
            return res.json({ msg: "Sesión eliminada correctamente" })
        }
    });
}

function processEliminarUsuario(req, res, db) {

    var id = req.params.id;

    db.run("DELETE FROM users WHERE uid = ?", id, function (err) {
        if (err) {
            return res.json({ errormsg: "Error al eliminar usuario:" + err })
        } else {
            return res.json({ msg: "Usuario eliminado correctamente" })
        }
    });
}

function processEliminarVideo(req, res, db) {

    var id = req.params.id;

    db.run("DELETE FROM videos WHERE _id = ?", id, function (err) {
        if (err) {
            return res.json({ errormsg: "Error al eliminar video:" + err })
        } else {
            return res.json({ msg: "Video eliminado correctamente" })
        }
    });
}

function processEliminarCategoria(req, res, db) {

    var id = req.params.id;

    db.run("DELETE FROM categorias WHERE _id = ?", id, function (err) {
        if (err) {
            return res.json({ errormsg: "Error al eliminar categoria:" + err })
        } else {
            return res.json({ msg: "Categoria eliminada correctamente" })
        }
    });
}

function processCrearVideo(req, res, db) {
    var nombre = req.body.nombre;
    var url = req.body.url;
    var categoria = req.body.categoria;

    db.run('INSERT INTO videos (nombre,url,categoria_id) VALUES (?,?,?)', [nombre, url, categoria], function (err) {
        if (err) {
            return res.json({ errormsg: err });
        } else {
            return res.json({ msg: "Video insertado correctamente" });
        }
    });
}

function processCrearCategoria(req, res, db) {
    var nombre = req.body.nombre;

    db.run('INSERT INTO categorias (nombre) VALUES (?)', nombre, function (err) {
        if (err) {
            return res.json({ errormsg: err });
        } else {
            return res.json({ msg: "Categoria insertada correctamente" });
        }
    });
}

// Verificar el token
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.json({ errormsg: 'Sin cabezera con token' });
    }
    const token = authHeader.split(' ')[1];

    var fechaActual = new Date();
    var año = fechaActual.getUTCFullYear();
    var mes = String(fechaActual.getUTCMonth() + 1).padStart(2, '0'); // Meses de 0-11, se suma 1
    var dia = String(fechaActual.getUTCDate()).padStart(2, '0'); // Día del mes con dos dígitos
    var horas = String(fechaActual.getUTCHours()).padStart(2, '0'); // Horas con dos dígitos
    var minutos = String(fechaActual.getUTCMinutes()).padStart(2, '0'); // Minutos con dos dígitos
    var segundos = String(fechaActual.getUTCSeconds()).padStart(2, '0'); // Segundos con dos dígitos
    var fecha = año + '-' + mes + '-' + dia + ' ' + horas + ':' + minutos + ':' + segundos;

    db.serialize(() => {
        db.run('UPDATE sessionToken SET last_request = ? WHERE sessionID = ?', [fecha, token], function (err) {
            if (err) {
                return res.json({ errormsg: "Error al introducir fecha:" + err })
            } else { }
        });
        db.get('SELECT * FROM sessionToken WHERE sessionId = ?', [token], (err, row) => {
            if (err) {
                return res.json({ tokenerrormsg: 'Failed to authenticate token' });
            }
            if (row) {
                console.log(row);
                console.log(fecha);
                next();
            } else {
                console.log('No session found with that ID');
                return res.json({ tokenerrormsg: 'Failed to authenticate token' });
            }
        });
    });
}

function isAdmin(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];

    if (token[0] == "A") next();
    else return res.json({ errormsg: "Proceso no autorizado" });
}

function processListarCategorias(req, res, db) {

    var desde = parseInt(req.query.desde, 10);
    var limite = parseInt(req.query.limite, 10);
    var totalCount = 0;
    db.serialize(() => {
        db.get('SELECT COUNT(*) AS totalCount FROM categorias', (err, row) => {
            if (err) {
                console.error(err.message);
                return res.json({ errormsg: 'Error en la consulta de la base de datos' + err });
            } else {
                totalCount = row.totalCount;
            }
        })
        db.all('SELECT _id, nombre FROM categorias LIMIT ? OFFSET ?', [limite, desde], (err, rows) => {
            if (err) {
                return res.json({ errormsg: 'Database query error' + err });
            } else {
                var categorias = [];
                for (var i = 0; i < rows.length; i++) {
                    categorias.push({
                        _id: rows[i]._id,
                        nombre: rows[i].nombre
                    });
                }
                var data = {
                    productos: categorias,
                    total: totalCount
                };
                return res.json(data);
            }
        });
    });
}
function processCategoria(req, res, db) {

    var id = req.params.id;

    db.get('SELECT _id, nombre FROM categorias WHERE _id= ?', id, (err, rows) => {
        if (err) {
            return res.json({ errormsg: err });
        } else if (rows) {
            var data = {
                _id: rows._id,
                nombre: rows.nombre
            };
            return res.json(data);
        } else {
            return res.json({ errormsg: 'Categoría no encontrada' });
        }
    });
}

function processUsuario(req, res, db) {
    var id = req.params.id;
    db.get('SELECT uid, nombre,correo,rol FROM users WHERE uid= ?', id, (err, rows) => {
        if (err) {
            return res.json({ errormsg: err });
        } else if (rows) {
            var data = {
                uid: rows.uid,
                nombre: rows.nombre,
                correo: rows.correo,
                rol: rows.rol
            };
            return res.json(data);
        } else {
            return res.json({ errormsg: 'Usuario no encontrado' });
        }
    });
}
function processVideos(req, res, db) {

    var id = req.params.id;

    db.get('SELECT videos._id,videos.nombre AS nombreVideo,videos.url, categorias._id AS categoria_id,categorias.nombre AS nombreCategoria FROM videos LEFT JOIN categorias ON videos.categoria_id = categorias._id WHERE videos._id= ?', id, (err, rows) => {
        if (err) {
            return res.json({ errormsg: err });
        }
        else if (rows) {
            var data = {
                _id: rows._id,
                nombre: rows.nombreVideo,
                url: rows.url,
                categoria: {
                    _id: rows.categoria_id,
                    nombre: rows.nombreCategoria
                }
            }
            return res.json(data);
        } else {
            return res.json({ errormsg: 'Video no encontrado' });

        }
    });
}

function processListarVideosEnCategoria(req, res, db) {
    var categoria_id = parseInt(req.query._id, 10);
    var desde = parseInt(req.query.desde, 10);
    var limite = parseInt(req.query.limite, 10);
    var totalCount = 0;
    db.serialize(() => {
        db.get(
            'SELECT COUNT(*) AS totalCount FROM videos WHERE categoria_id = ?',
            [categoria_id],
            (err, row) => {
                if (err) {
                    return res.json({ errormsg: err });
                } else {
                    totalCount = row.totalCount;
                }
            })
        db.all('SELECT videos._id,videos.nombre AS nombreVideo,videos.url,categorias._id AS categoria_id,categorias.nombre AS nombreCategoria FROM videos LEFT JOIN categorias ON videos.categoria_id = categorias._id WHERE videos.categoria_id = ? LIMIT ? OFFSET ?', [categoria_id, limite, desde], (err, rows) => {
            if (err) {
                return res.json({ errormsg: err });
            } else {
                var videos = [];
                for (var i = 0; i < rows.length; i++) {
                    videos.push({
                        _id: rows[i]._id,
                        nombre: rows[i].nombreVideo,
                        url: rows[i].url,
                        categoria: {
                            _id: rows[i].categoria_id,
                            nombre: rows[i].nombreCategoria
                        }
                    });
                }
                var data = {
                    videos: videos,
                    total: totalCount
                };
                return res.json(data);
            }
        });
    });
}
function processListarVideos(req, res, db) {
    var desde = parseInt(req.query.desde, 10);
    var limite = parseInt(req.query.limite, 10);
    var totalCount = 0;
    db.serialize(() => {
        db.get(
            'SELECT COUNT(*) AS totalCount FROM videos',
            (err, row) => {
                if (err) {
                    console.error(err.message);
                    return res.json({ errormsg: err });
                } else {
                    totalCount = row.totalCount;
                }
            })
        db.all('SELECT videos._id,videos.nombre AS nombreVideo,videos.url,categorias._id AS categoria_id,categorias.nombre AS nombreCategoria FROM videos LEFT JOIN categorias ON videos.categoria_id = categorias._id LIMIT ? OFFSET ?', [limite, desde], (err, rows) => {
            if (err) {
                return res.json({ errormsg: err });
            } else {
                var videos = [];
                for (var i = 0; i < rows.length; i++) {
                    videos.push({
                        _id: rows[i]._id,
                        nombre: rows[i].nombreVideo,
                        url: rows[i].url,
                        categoria: {
                            _id: rows[i].categoria_id,
                            nombre: rows[i].nombreCategoria
                        }
                    });
                }
                var data = {
                    productos: videos,
                    total: totalCount
                };
                return res.json(data);
            }
        });
    });
}
function processListarUsuarios(req, res, db) {
    var desde = parseInt(req.query.desde, 10);
    var limite = parseInt(req.query.limite, 10);
    var totalCount = 0;
    db.serialize(() => {
        db.get(
            'SELECT COUNT(*) AS totalCount FROM users',
            (err, row) => {
                if (err) {
                    return res.json({ errormsg: 'Error en la consulta de la base de datos' });
                } else {
                    totalCount = row.totalCount;
                }
            })
        db.all('SELECT uid,nombre,correo,rol FROM users LIMIT ? OFFSET ?', [limite, desde], (err, rows) => {
            if (err) {
                return res.json({ errormsg: 'Database query error' });
            } else {
                var usuarios = [];
                for (var i = 0; i < rows.length; i++) {
                    usuarios.push({
                        uid: rows[i].uid,
                        nombre: rows[i].nombre,
                        correo: rows[i].correo,
                        rol: rows[i].rol,
                    });
                }
                var data = {
                    productos: usuarios,
                    total: totalCount
                };
                return res.json(data);
            }
        });
    });
}

router.post('/login', (req, res) => {
    if (!req.body.user || !req.body.password) {
        return res.json({ errormsg: 'Peticion mal formada' });
    } else {
        processCorreo(req, res, db);
    }
});

router.post('/usuarios', verifyToken, isAdmin, (req, res) => {
    if (!req.body.nombre || !req.body.correo || !req.body.password || !req.body.rol) {
        return res.json({ errormsg: 'Peticion mal formada' });
    } else {
        processCrearUsuario(req, res, db);
    }
});

router.post('/videos', verifyToken, isAdmin, (req, res) => {
    if (!req.body.nombre || !req.body.url || !req.body.categoria) {
        return res.json({ errormsg: 'Peticion mal formada' });
    } else {
        processCrearVideo(req, res, db);
    }
});

router.post('/categorias', verifyToken, isAdmin, (req, res) => {
    if (!req.body.nombre) {
        return res.json({ errormsg: 'Peticion mal formada' });
    } else {
        processCrearCategoria(req, res, db);
    }
});

router.put('/usuarios', verifyToken, isAdmin, (req, res) => {
    if (!req.body.id) {
        return res.json({ errormsg: 'Peticion mal formada' });
    } else {
        processModificarUsuario(req, res, db);
    }
});

router.put('/categorias', verifyToken, isAdmin, (req, res) => {
    if (!req.body.id) {
        return res.json({ errormsg: 'Peticion mal formada' });
    } else {
        processModificarCategorias(req, res, db);
    }
});

router.put('/videos', verifyToken, isAdmin, (req, res) => {
    if (!req.body.id) {
        return res.json({ errormsg: 'Peticion mal formada' });
    } else {
        processModificarVideo(req, res, db);
    }
});


router.delete('/usuarios/:id', verifyToken, isAdmin, (req, res) => {
    if (!req.params.id) {
        return res.json({ errormsg: 'Peticion mal formada' });
    }
    else {
        processEliminarUsuario(req, res, db);
    }
});

router.delete('/videos/:id', verifyToken, isAdmin, (req, res) => {
    if (!req.params.id) {
        return res.json({ errormsg: 'Peticion mal formada' });
    }
    else {
        processEliminarVideo(req, res, db);
    }
});

router.delete('/categorias/:id', verifyToken, isAdmin, (req, res) => {
    if (!req.params.id) {
        return res.json({ errormsg: 'Peticion mal formada' });
    }
    else {
        processEliminarCategoria(req, res, db);
    }
});

router.get('/categorias/:id', verifyToken, isAdmin, (req, res) => {
    if (!req.params.id) {
        return res.json({ errormsg: 'Peticion mal formada' });
    }
    else {
        processCategoria(req, res, db);
    }
});

router.get('/usuarios/:id', verifyToken, isAdmin, (req, res) => {
    if (!req.params.id) {
        return res.json({ errormsg: 'Peticion mal formada' });
    }
    else {
        processUsuario(req, res, db);
    }
});

router.get('/videos/:id', verifyToken, isAdmin, (req, res) => {
    if (!req.params.id) {
        return res.json({ errormsg: 'Peticion mal formada' });
    }
    else {
        processVideos(req, res, db);
    }
});

router.get('/categorias', verifyToken, (req, res) => {
    if (!req.query.desde || !req.query.limite) {
        return res.json({ errormsg: 'Peticion mal formada' });
    } else {
        processListarCategorias(req, res, db);
    }
});
router.get('/videos', verifyToken, (req, res) => {
    if (!req.query.desde || !req.query.limite) {
        return res.json({ errormsg: 'Peticion mal formada' });
    } else {
        processListarVideos(req, res, db);
    }
});
router.get('/usuarios', verifyToken, (req, res) => {
    if (!req.query.desde || !req.query.limite) {
        return res.json({ errormsg: 'Peticion mal formada' });
    } else {
        processListarUsuarios(req, res, db);
    }
});
router.get('/videosencategoria', verifyToken, (req, res) => {
    if (!req.query._id || !req.query.desde || !req.query.limite) {
        return res.json({ errormsg: 'Peticion mal formada' });
    } else {
        processListarVideosEnCategoria(req, res, db);
    }
});
router.delete('/logout/:id/:token', (req, res) => {
    if (!req.params.id || !req.params.token) {
        return res.json({ errormsg: 'Peticion mal formada' });
    }
    else {
        console.log(req.params.id + " " + req.params.token)
        logout(req, res, db);
    }
});

server.use('/', router); // Añadir las rutas al servidor

server.use(express.static('.')); // Añadir las rutas estáticas al servidor.

server.listen(port, () => { // Poner en marcha el servidor
    console.log(`Servidor corriendo en el puerto ${port}`);
});

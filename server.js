'use strict';

// Cargamos el modulo de Express
const express = require('express');

// Cargamos el modulo para la gestion de sesiones
const session = require('express-session');

// Obtener la referencia al módulo 'body-parser'
const bodyParser = require('body-parser');

// Cargar el módulo para bases de datos SQLite
const sqlite3 = require('sqlite3').verbose();

// Cargamos el modulo jsonwebtoken
const jwt = require('jsonwebtoken');

// Configuración del servidor y puerto
const server = express();
const port = 8080;

// Configuración del secreto y duración del token JWT
const jwtSecret = 'practicas-lsi-2023';
const tokenExpiry = '1h'; // Los tokens expirarán en 1 hora

// Configuración de sesiones
const sesscfg = {
    secret: 'practicas-lsi-2023',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 8 * 60 * 60 * 1000 } // 8 working hours
};
server.use(session(sesscfg));

// Configuración de body-parser
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

// Configurar el enrutador
const router = express.Router();

// Abrir la base de datos
var db = new sqlite3.Database('miDDBB.db', (err) => {
    if (err) console.log(err);
});

// Función para procesar el login y generar el token JWT
function processCorreo(req, res, db) {
    var correo = req.body.user;
    var password = req.body.password;

    db.get('SELECT * FROM users WHERE correo=?', correo, (err, row) => {
        if (row == undefined) {
            res.json({ errormsg: 'El usuario no existe' });
        } else if (row.password === password) {
            req.session.userID = row.uid;

            // Generar el token JWT
            const token = jwt.sign({ uid: row.uid }, jwtSecret, { expiresIn: tokenExpiry });

            var data = {
                usuario: {
                    uid: row.uid,
                    correo: row.correo,
                    nombre: row.nombre,
                    rol: row.rol
                },
                token: token
            };
            res.json(data);
        } else {
            res.json({ errormsg: 'Fallo de autenticación' });
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
        } else {
            console.log("Usuario insertado correctamente");
        }
    });
}

function processModificarVideo(req, res, db) {
    var nombre = req.body.nombre;
    var url = req.body.url;
    var categoria = req.body.categoria;
    var id = req.body.id;

    db.run('UPDATE videos SET nombre = ?, url = ?, categoria_id = ? WHERE _id = ?', [nombre, url, categoria,id], function (err) {
        if (err) {
            console.log("Error al modificar video:", err);
            return res.json({ errormsg: "Error al modificar video:" + err } )
        } else {
            console.log("Video modificado correctamente");
            return res.json({ msg: "Video modificado correctamente" } )
        }
    });
}

function processModificarUsuario(req, res, db) {
    var nombre = req.body.nombre;
    var correo = req.body.correo;
    var rol = req.body.rol;
    var password = req.body.password;
    var id = req.body.id;

    db.run('UPDATE users SET nombre = ?, correo = ?, rol = ?, password= ? WHERE uid = ?', [nombre, correo, rol, password,id], function (err) {
        if (err) {
            console.log("Error al modificar usuario:", err);
            return res.json({ errormsg: "Error al modificar usuario:" + err } )
        } else {
            console.log("Usuario modificado correctamente");
            return res.json({ msg: "Usuario modificado correctamente" } )
        }
    });
}
function processModificarCategorias(req, res, db) {
    var nombre = req.body.nombre;
    var id = req.body.id;

    db.run('UPDATE categorias SET nombre = ? WHERE _id = ?', [nombre,id], function (err) {
        if (err) {
            console.log("Error al modificar categoria:", err);
            return res.json({ errormsg: "Error al modificar categoria:" + err } )
        } else {
            console.log("Categoria modificada correctamente");
            return res.json({ msg: "Categoria modificada correctamente" } )
        }
    });
}

function processEliminarUsuario(req, res, db){
   
        var id = req.query.id;
    
        db.run("DELETE FROM users WHERE uid = ?", id, function (err) {
            if (err) {
                console.log("Error al eliminar usuario:", err);
                return res.json({ errormsg: "Error al eliminar usuario:" + err } )
            } else {
                console.log("Usuario eliminado correctamente");
                return res.json({ msg: "Usuario eliminado correctamente"} )
            }
        });
}

function processEliminarVideo(req, res, db){
   
    var id = req.query.id;

    db.run("DELETE FROM videos WHERE _id = ?", id, function (err) {
        if (err) {
            console.log("Error al eliminar video:", err);
            return res.json({ errormsg: "Error al eliminar video:" + err } )
        } else {
            console.log("Video eliminado correctamente");
            return res.json({ msg: "Video eliminado correctamente"} )
        }
    });
}

function processEliminarCategoria(req, res, db){
   
    var id = req.query.id;

    db.run("DELETE FROM categorias WHERE _id = ?", id, function (err) {
        if (err) {
            console.log("Error al eliminar categoria:", err);
            return res.json({ errormsg: "Error al eliminar categoria:" + err } )
        } else {
            console.log("Categoria eliminada correctamente");
            return res.json({ msg: "Categoria eliminada correctamente"} )
        }
    });
}

function processCrearVideo(req, res, db) {
    var nombre = req.body.nombre;
    var url = req.body.url;
    var categoria = req.body.categoria;

    db.run('INSERT INTO videos (nombre,url,categoria_id) VALUES (?,?,?)', [nombre, url, categoria], function (err) {
        if (err) {
            console.log("Error al insertar video:", err);
        } else {
            console.log("Video insertado correctamente");
        }
    });
}

function processCrearCategoria(req, res, db) {
    var nombre = req.body.nombre;

    db.run('INSERT INTO categorias (nombre) VALUES (?)', nombre, function (err) {
        if (err) {
            console.log("Error al insertar categoria:", err);
        } else {
            console.log("Categoria insertada correctamente");
        }
    });
}

// Verificar el token JWT
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ errormsg: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            return res.status(500).json({ errormsg: 'Failed to authenticate token' });
        }
        req.userId = decoded.uid;
        next();
    });
}

function processListarCategorias(req, res, db) {

    var desde = parseInt(req.query.desde, 10);
    var limite = parseInt(req.query.limite, 10);
    var totalCount = 0;
    db.get(
        'SELECT COUNT(*) AS totalCount FROM categorias',
        (err, row) => {
            if (err) {
                console.error(err.message);
                return res.status(500).send('Error en la consulta de la base de datos');
            }
            totalCount = row.totalCount;
        })
    db.all('SELECT _id, nombre FROM categorias LIMIT ? OFFSET ?', [limite, desde], (err, rows) => {
        if (err) {
            return res.status(500).json({ errormsg: 'Database query error' });
        }
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
        console.log(data);
        console.log(desde + " " + limite);
        res.json(data);
    });
}

function processListarVideosEnCategoria(req, res, db) {
    var categoria_id = parseInt(req.query._id, 10);
    var desde = parseInt(req.query.desde, 10);
    var limite = parseInt(req.query.limite, 10);
    var totalCount = 0;

    db.get(
        'SELECT COUNT(*) AS totalCount FROM videos WHERE categoria_id = ?',
        [categoria_id],
        (err, row) => {
            if (err) {
                console.error(err.message);
                return res.status(500).send('Error en la consulta de la base de datos');
            }
            totalCount = row.totalCount;
        })
    db.all('SELECT videos._id,videos.nombre AS nombreVideo,videos.url,videos.categoria_id,categorias.nombre AS nombreCategoria FROM videos INNER JOIN categorias ON videos.categoria_id = categorias._id WHERE videos.categoria_id = ? LIMIT ? OFFSET ?', [categoria_id, limite, desde], (err, rows) => {
        if (err) {
            return res.status(500).json({ errormsg: 'Database query error' });
        }
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
        console.log(data);

        res.json(data);
    });
}
function processListarVideos(req, res, db) {
    var desde = parseInt(req.query.desde, 10);
    var limite = parseInt(req.query.limite, 10);
    var totalCount = 0;
    db.get(
        'SELECT COUNT(*) AS totalCount FROM videos',
        (err, row) => {
            if (err) {
                console.error(err.message);
                return res.status(500).send('Error en la consulta de la base de datos');
            }
            totalCount = row.totalCount;
        })
    db.all('SELECT videos._id,videos.nombre AS nombreVideo,videos.url,videos.categoria_id,categorias.nombre AS nombreCategoria FROM videos INNER JOIN categorias ON videos.categoria_id = categorias._id LIMIT ? OFFSET ?', [limite, desde], (err, rows) => {
        if (err) {
            return res.status(500).json({ errormsg: 'Database query error' });
        }
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
        console.log(data);
        console.log(desde + " " + limite);
        res.json(data);
    });
}
function processListarUsuarios(req, res, db) {
    var desde = parseInt(req.query.desde, 10);
    var limite = parseInt(req.query.limite, 10);
    var totalCount = 0;
    db.get(
        'SELECT COUNT(*) AS totalCount FROM users',
        (err, row) => {
            if (err) {
                console.error(err.message);
                return res.status(500).send('Error en la consulta de la base de datos');
            }
            totalCount = row.totalCount;
        })
    db.all('SELECT uid,nombre,correo,rol FROM users LIMIT ? OFFSET ?', [limite, desde], (err, rows) => {
        if (err) {
            return res.status(500).json({ errormsg: 'Database query error' });
        }
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
        console.log(data);
        console.log(desde + " " + limite);
        res.json(data);
    });
}
// Configurar la acción asociada al login
router.post('/login', (req, res) => {
    if (!req.body.user || !req.body.password) {
        res.json({ errormsg: 'Peticion mal formada' });
    } else {
        processCorreo(req, res, db);
    }
});

router.post('/usuarios', (req, res) => {
    if (!req.body.nombre || !req.body.correo || !req.body.password || !req.body.rol) {
        res.json({ errormsg: 'Peticion mal formada' });
    } else {
        processCrearUsuario(req, res, db);
    }
});

router.post('/videos', (req, res) => {
    if (!req.body.nombre || !req.body.url || !req.body.categoria) {
        res.json({ errormsg: 'Peticion mal formada' });
    } else {
        processCrearVideo(req, res, db);
    }
});

router.post('/categorias', (req, res) => {
    if (!req.body.nombre) {
        res.json({ errormsg: 'Peticion mal formada' });
    } else {
        processCrearCategoria(req, res, db);
    }
});

router.put('/usuarios', (req, res) => {
    if (!req.body.id) {
        res.json({ errormsg: 'Peticion mal formada' });
    } else {
        processModificarUsuario(req,res,db);
    }
});

router.put('/categorias', (req, res) => {
    if (!req.body.id) {
        res.json({ errormsg: 'Peticion mal formada' });
    } else {
        processModificarCategorias(req,res,db);
    }
});

router.put('/videos', (req, res) => {
    if (!req.body.id) {
        res.json({ errormsg: 'Peticion mal formada' });
    } else {
        processModificarVideo(req,res,db);
    }
});


router.delete('/usuarios', (req, res) => {
    if (!req.query.id) {
        res.json({ errormsg: 'Peticion mal formada' });
    }
    else {
        processEliminarUsuario(req, res, db);
    }
});

router.delete('/videos', (req, res) => {
    if (!req.query.id) {
        res.json({ errormsg: 'Peticion mal formada' });
    }
    else {
        processEliminarVideo(req, res, db);
    }
});

router.delete('/categorias', (req, res) => {
    if (!req.query.id) {
        res.json({ errormsg: 'Peticion mal formada' });
    }
    else {
        processEliminarCategoria(req, res, db);
    }
});

router.get('/categorias', verifyToken, (req, res) => {
    processListarCategorias(req, res, db);
});
router.get('/videos', verifyToken, (req, res) => {
    processListarVideos(req, res, db);
});
router.get('/usuarios', verifyToken, (req, res) => {
    processListarUsuarios(req, res, db);
});
router.get('/videosencategoria', verifyToken, (req, res) => {
    processListarVideosEnCategoria(req, res, db);
});



// Añadir las rutas al servidor
server.use('/', router);

// Añadir las rutas estáticas al servidor.
server.use(express.static('.'));


// Poner en marcha el servidor
server.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});

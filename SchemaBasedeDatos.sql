create table users (
 uid integer not null primary key autoincrement,
 nombre text not null,
 correo text not null,
 rol text not null,
 password text not null
);

insert into users values (1, 'Admin', 'admin@gmail.com','ADMIN_ROLE', 'admin');

create table categorias (
 _id integer not null primary key autoincrement,
nombre text not null
);

create table videos (
 _id integer not null primary key autoincrement,
nombre text not null,
url text not null,
categoria_id integer not null,
foreign key(categoria_id) references categorias(_id)

);

create table sessionToken (
sessionID TEXT PRIMARY KEY,
user_uid integer not null,
fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
last_request DATETIME,
foreign key(user_uid) references users(uid)
);

CREATE TRIGGER verifySession
BEFORE  UPDATE 
ON sessionToken
FOR EACH ROW
BEGIN
    DELETE FROM sessionToken WHERE fecha_creacion <= datetime('now','-1 hour');
END


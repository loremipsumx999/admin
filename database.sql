create database people default character set utf8 collate utf8_hungarian_ci;

use people;

create table users(
    id int auto_increment primary key,
    username varchar(255) not null,
    password varchar(255) not null,
    email varchar(255) not null,
    rights tinyint(0) default 1
);

insert into users (id, username, password, email, rights) values (1, "admin", "admin", "admin@gmail.com", 1);
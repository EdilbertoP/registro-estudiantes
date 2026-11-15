-- =============================================================
-- Script de base de datos (Supabase / PostgreSQL)
-- Ejecutar en: Supabase > SQL Editor > New query > Run
-- =============================================================

create table if not exists public.estudiantes (
  id               bigint generated always as identity primary key,
  carne            varchar(20)  not null unique
                   check (carne ~ '^[A-Za-z0-9]{8,}$'),
  nombres          varchar(60)  not null,
  apellidos        varchar(60)  not null,
  correo           varchar(100) not null unique,
  carrera          varchar(50)  not null
                   check (carrera in ('Ingeniería en Sistemas','Ingeniería Industrial',
                                      'Administración de Empresas','Contaduría Pública',
                                      'Psicología','Ingeniería Civil')),
  telefono         varchar(9)   not null
                   check (telefono ~ '^[0-9]{4}-[0-9]{4}$'),
  fecha_nacimiento date         not null
                   check (fecha_nacimiento <= (current_date - interval '16 years')),
  genero           varchar(10)  not null
                   check (genero in ('Masculino','Femenino','Otro')),
  fecha_registro   timestamptz  not null default now()
);

-- Seguridad: se activa RLS y NO se crean políticas públicas.
-- Así nadie puede leer/escribir directo desde el navegador;
-- solo el Web Service (que usa la llave secreta) tiene acceso.
alter table public.estudiantes enable row level security;

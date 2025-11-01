# Prueba técnica: Miniliga Express

Miniliga Express es una app para gestionar ligas deportivas pequeñas. Permite registrar equipos, partidos y resultados, también muestra una tabla de clasificación en tiempo real.

Este repositorio contiene: backend API REST con Laravel, como también el frontend web Aplicación Angular y App Móvil con IONIC. 

## Estructura del Proyecto
- backend/: Aplicación Laravel (API REST).
- web/: Aplicación Angular (Frontend Web).

## Requisitos

- **Backend:**
  - PHP 8.1+
  - Composer
  - SQLite
- **Frontend:**
  - Node.js
  - npm
 
  ## Instalación

  ### 1. Clonar el repositorio

```bash
git clone https://github.com/rube-git/mini-liga-express.git
cd mini-liga-express
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```
```bash
cd ../web
npm install
npm start
```

```bash
cd mobile
npm install
npm start o ionic serve
```

# WhatsApp Clone - ReactJS + Cordova

Este proyecto es un clon básico de WhatsApp, desarrollado con ReactJS y preparado para exportar a Android usando Cordova.

## Características
- Mobile first
- Listado de contactos (mock)
- Pantalla de chat con respuesta mockeada y delay

## Instalación y ejecución
1. Instala dependencias:
   ```bash
   npm install
   ```
2. Ejecuta en modo desarrollo:
   ```bash
   npm run dev
   ```

## Exportar a Android con Cordova
1. Instala Cordova globalmente si no lo tienes:
   ```bash
   npm install -g cordova
   ```
2. Inicializa Cordova en el proyecto:
   ```bash
   cordova create cordova
   cd cordova
   cordova platform add android
   ```
3. Copia la build de React (`dist`) a `cordova/www` y ejecuta:
   ```bash
   cordova build android
   ```

## Personalización
- Modifica los contactos y la lógica de chat en los componentes de React según tus necesidades.

# Base DM Puntos

Página instalable (PWA) que aparece en el menú **Compartir** del teléfono. Al compartirle un lugar desde Google Maps, lo manda a un Google Apps Script que anota nombre y coordenadas en la pestaña `Puntos` del Google Sheets de Base DM. Base DM los toma desde Alertas › lugares con "📥 Traer puntos compartidos".

- `index.html`, `manifest.json`, `sw.js`, `icono.svg`: la página (GitHub Pages).
- `apps-script.gs`: el script que va en el Google Sheets (Extensiones → Apps Script → Implementar como aplicación web).

/* Base DM Puntos · Google Apps Script (va dentro del Google Sheets de GastosB: Extensiones → Apps Script).
   Recibe lo que comparte Google Maps, resuelve el enlace corto (maps.app.goo.gl) y anota una fila en la pestaña "Puntos":
   A fecha/hora · B nombre · C lat · D lon · E enlace · F texto recibido
   Implementar → Nueva implementación → Aplicación web · Ejecutar como: yo · Acceso: cualquier persona → copiar la URL /exec. */
var HOJA = 'Puntos';

function doPost(e){
  var r;
  try { r = anotar(JSON.parse(e.postData.contents || '{}')); }
  catch(err){ r = { ok: false, error: String(err && err.message || err) }; }
  return ContentService.createTextOutput(JSON.stringify(r)).setMimeType(ContentService.MimeType.JSON);
}
function doGet(){ return ContentService.createTextOutput(JSON.stringify({ ok: true, info: 'Base DM Puntos' })).setMimeType(ContentService.MimeType.JSON); }

function anotar(d){
  var texto = [d.title, d.text, d.url].filter(String).join('\n');
  var m = texto.match(/https?:\/\/[^\s]+/);
  var enlace = m ? m[0] : '';
  var final = enlace ? resolver(enlace) : '';
  var c = coords(texto) || coords(final) || coords(decodeURIComponent(final));
  var nombre = nombreDe(d, final);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(HOJA);
  if (!sh){ sh = ss.insertSheet(HOJA); sh.appendRow(['Fecha', 'Nombre', 'Lat', 'Lon', 'Enlace', 'Texto']); }
  sh.appendRow([new Date(), nombre, c ? c.lat : '', c ? c.lon : '', final || enlace, texto]);
  return { ok: true, nombre: nombre, lat: c ? c.lat : null, lon: c ? c.lon : null, enlace: final || enlace };
}

/* sigue las redirecciones del enlace corto hasta la URL larga de Google Maps */
function resolver(url){
  var u = url;
  for (var i = 0; i < 6; i++){
    var resp = UrlFetchApp.fetch(u, { followRedirects: false, muteHttpExceptions: true });
    var code = resp.getResponseCode(), hd = resp.getHeaders(), loc = hd['Location'] || hd['location'];
    if (code >= 300 && code < 400 && loc){ u = loc.indexOf('http') === 0 ? loc : (u.replace(/^(https?:\/\/[^\/]+).*/, '$1') + loc); continue; }
    break;
  }
  return u;
}

/* coordenadas en un texto o URL: "8.98, -79.52" · !3d8.98!4d-79.52 · @8.98,-79.52 · q=8.98,-79.52 · ll=… · search/8.98,-79.52 */
function coords(s){
  if (!s) return null;
  var pats = [/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, /[?&](?:q|ll|query|destination|center)=(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/, /\/(?:search|place|dir)\/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/, /@(-?\d+\.\d+),(-?\d+\.\d+)/, /(-?\d{1,2}\.\d{3,})\s*,\s*(-?\d{1,3}\.\d{3,})/];
  for (var i = 0; i < pats.length; i++){
    var m = s.match(pats[i]);
    if (m){ var la = +m[1], lo = +m[2]; if (Math.abs(la) <= 90 && Math.abs(lo) <= 180) return { lat: +la.toFixed(6), lon: +lo.toFixed(6) }; }
  }
  return null;
}

function nombreDe(d, final){
  var t = (d.title || '').trim();
  if (t && !/^https?:/.test(t)) return t;
  var primera = (d.text || '').split('\n').map(function(x){ return x.trim(); }).filter(function(x){ return x && !/^https?:/.test(x) && !/^-?\d+\.\d+\s*,/.test(x); })[0];
  if (primera) return primera;
  var m = (final || '').match(/\/maps\/place\/([^\/@?]+)/);
  if (m) return decodeURIComponent(m[1].replace(/\+/g, ' '));
  return 'Punto compartido';
}

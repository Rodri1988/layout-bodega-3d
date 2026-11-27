// Lee el Excel y relaciona códigos con el 3D (modo prueba)

// =====================================================================
// INVENTARIO · MODO PRUEBA
// Lee un Excel en el navegador (no se envía ni se guarda dentro del HTML).
// Muestra qué productos hay en cada posición, SIN cantidades.
// =====================================================================
const inv = { loaded: false, byKey: new Map(), objects: new Map(), unmapped: [], rows: [], hasStatus: false, overlay: null, marker: null };
const INV_COLORS = { stock: 0x2563eb, pend: 0x64748b, proc: 0xfacc15, ok: 0x22c55e, dif: 0xef4444 };
const $ = id => document.getElementById(id);

// Bodega-Pasillo-Hilera-Nivel-Estante  ->  elemento del layout
function invKey(code) {
  const p = code.split('-');
  if (p.length !== 5 || p[0] !== '6') return null;
  const pas = Number(p[1]), hil = Number(p[2]);
  if (pas === 70) return `70-${hil}-${Number(p[4].slice(1))}`;
  if (pas === 29) return 'Z-29';
  if ([30, 32, 33].includes(pas) && hil === 1) return `Z-${pas}`;
  return `${pas}-${hil}`;
}

function indexLayoutObjects() {
  inv.objects.clear();
  interactiveObjects.forEach(o => {
    const d = o.userData, t = d.title || '';
    let key = null, m;
    if (d.type === 'Módulo de Rack') {
      const aisle = (d.meta[0].value.match(/Pasillo (\d+)/) || [])[1];
      key = `${aisle}-${t.replace(/\D/g, '')}`;
    } else if ((m = t.match(/^Ubicación 6-70-(\d+)-1-A(\d+)/))) key = `70-${+m[1]}-${+m[2]}`;
    else if (t.startsWith('Bodega 29')) key = 'Z-29';
    else if ((m = t.match(/^Andén \/ Carril (30|32|33)$/))) key = `Z-${m[1]}`;
    if (key) { inv.objects.set(key, o); d.invKey = key; }
  });
}

function parseWorkbook(wb) {
  const name = wb.Sheets['Stock_Sistema'] ? 'Stock_Sistema' : wb.Sheets['Productos'] ? 'Productos' : null;
  if (!name) throw new Error('No encontré la hoja "Productos" ni "Stock_Sistema".');
  const data = XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: '', raw: false });
  if (!data.length || !('sku' in data[0]) || !('Ubicaciones' in data[0])) throw new Error('Faltan las columnas "sku" y "Ubicaciones".');
  const rows = [];
  data.forEach(r => String(r.Ubicaciones).split('\n').forEach(line => {
    if (!line.trim()) return;
    const [code, rest = ''] = line.split('|');
    const qty = (rest.match(/Cant:\s*(-?\d+)/) || [])[1];
    // La cantidad solo se usa para marcar posiciones en cero; no se guarda ni se muestra
    rows.push({ code: code.trim(), sku: String(r.sku).trim(), name: String(r.nombre), zero: qty === '0', status: null });
  }));
  // Estados de conteo (solo si el archivo es la plantilla y ya hay conteos)
  let hasStatus = false;
  if (wb.Sheets['Diferencias']) {
    const st = new Map();
    XLSX.utils.sheet_to_json(wb.Sheets['Diferencias'], { header: 1, defval: '' }).slice(1).forEach(r => {
      if (r[0] || r[1]) st.set(`${String(r[1]).trim()}|${String(r[0]).trim().toUpperCase()}`, String(r[10]));
    });
    rows.forEach(r => {
      r.status = st.get(`${r.sku}|${r.code.toUpperCase()}`) || 'Pendiente';
      if (r.status !== 'Pendiente') hasStatus = true;
    });
  }
  return { rows, hasStatus };
}

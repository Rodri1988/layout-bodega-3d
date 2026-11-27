// Espacios libres para ubicar pallets nuevos, según el Excel cargado (modo prueba)
// Cada hilera tiene 2 posiciones por nivel: A01 y A02.

const SLOT_BASE = ['A01', 'A02'];
const SLOT_STYLE = {
  libre:   { color: 0x22c55e, opacity: 0.75, text: 'LIBRE' },
  cero:    { color: 0xfacc15, opacity: 0.75, text: 'en cero en sistema (revisar)' },
  revisar: { color: 0xa855f7, opacity: 0.75, text: 'sin registro, el nivel usa A03/A04 (revisar)' },
  ocupada: { color: 0x64748b, opacity: 0.9,  text: 'ocupada' }
};
const freeView = { group: null, slots: [], highlight: null, previousMode: null };

const levelOfLine = r => r.code.split('-')[3];
const slotOfLine = r => (r.code.split('-')[4] || '').toUpperCase();

function slotState(lines, level, slot) {
  const inLevel = lines.filter(r => levelOfLine(r) === String(level));
  const here = inLevel.filter(r => slotOfLine(r) === slot);
  if (here.length) return here.every(r => r.zero) ? 'cero' : 'ocupada';
  // Si el nivel tiene posiciones A03 o A04 no se puede asegurar que haya espacio
  return inLevel.some(r => Number(slotOfLine(r).slice(1)) > 2) ? 'revisar' : 'libre';
}

// Recorre todas las posiciones de los racks numerados
function computeSlots() {
  const slots = [];
  inv.objects.forEach((obj, key) => {
    const rack = obj.userData.rack;
    if (!rack) return;
    const [aisle, hilera] = key.split('-');
    const lines = inv.byKey.get(key) || [];
    for (let level = 1; level <= rack.levels; level++) {
      SLOT_BASE.forEach(slot => slots.push({
        key, obj, aisle, hilera, level, slot,
        code: `6-${aisle}-${hilera}-${level}-${slot}`,
        state: slotState(lines, level, slot)
      }));
    }
  });
  return slots.sort((a, b) => a.code.localeCompare(b.code, 'es', { numeric: true }));
}

function slotPosition(s) {
  const r = s.obj.userData.rack, p = s.obj.getWorldPosition(new THREE.Vector3());
  // Supuesto: A01 es el pallet del lado sur de la hilera y A02 el del lado norte
  p.z += (s.slot === 'A01' ? 1 : -1) * r.depth * 0.24;
  p.y = (s.level - 1) * r.levelStep + 0.8;
  return p;
}

function clearGroup(group) {
  if (!group) return;
  group.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  scene.remove(group);
}

function selectedSlots() {
  const level = $('inv-free-level').value, aisle = $('inv-free-aisle').value;
  return freeView.slots.filter(s => (level === 'all' || s.level === Number(level)) && (aisle === 'all' || s.aisle === aisle));
}

function paintFreeView() {
  clearGroup(freeView.group); freeView.group = null;
  clearGroup(freeView.highlight); freeView.highlight = null;
  const on = inv.loaded && $('inv-free').checked;
  // Las cajas decorativas se ocultan mientras se muestra la ocupación del archivo
  inv.objects.forEach(o => { if (o.userData.rack) o.userData.rack.cargo.forEach(m => { m.visible = !on; }); });
  $('inv-free-tools').classList.toggle('inv-hidden', !on);
  if (!on) return;
  freeView.group = new THREE.Group();
  scene.add(freeView.group);
  const chosen = new Set(selectedSlots().map(s => s.code));
  freeView.slots.forEach(s => {
    const isChosen = chosen.has(s.code);
    if (!isChosen && s.state !== 'ocupada' && s.state !== 'cero') return;
    const r = s.obj.userData.rack;
    const geo = new THREE.BoxGeometry(r.width * 0.84, 1.05, r.depth * 0.4);
    // Fuera del filtro, lo ocupado queda tenue para que resalten los espacios libres
    const style = isChosen ? SLOT_STYLE[s.state] : { color: 0x64748b, opacity: 0.18 };
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: style.color, transparent: true, opacity: style.opacity, depthWrite: false }));
    mesh.position.copy(slotPosition(s));
    if (isChosen) mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color: s.state === 'ocupada' ? 0x334155 : 0xffffff })));
    freeView.group.add(mesh);
  });
  renderFreeList();
}

function renderFreeList() {
  const list = selectedSlots(), box = $('inv-free-list');
  const count = state => list.filter(s => s.state === state).length;
  $('inv-free-title').textContent = `${count('libre')} libres · ${count('cero')} en cero · ${count('revisar')} por revisar`;
  box.textContent = '';
  const icon = { libre: '🟩', cero: '🟨', revisar: '🟪' };
  ['libre', 'cero', 'revisar'].forEach(state => list.filter(s => s.state === state).forEach(s =>
    addLine(box, `${icon[state]} ${s.code}\nPasillo ${s.aisle} · Hilera ${s.hilera} · Nivel ${s.level} · ${SLOT_STYLE[state].text}`,
      'inv-item', () => goToSlot(s))));
  if (!box.childElementCount) addLine(box, 'No hay espacios libres con este filtro.', 'inv-item');
}

function goToSlot(s) {
  goToResult({ key: s.key });
  inv.marker.visible = false;
  clearGroup(freeView.highlight);
  const r = s.obj.userData.rack;
  const size = new THREE.BoxGeometry(r.width * 1.05, 1.3, r.depth * 0.48);
  const frame = new THREE.LineSegments(new THREE.EdgesGeometry(size),
    new THREE.LineBasicMaterial({ color: 0xec4899, depthTest: false }));
  size.dispose();
  frame.position.copy(slotPosition(s));
  frame.renderOrder = 30;
  const pin = makeArrow(0xec4899, s.code);
  pin.position.set(0, 7.9 - frame.position.y, 0);
  frame.add(pin);
  freeView.highlight = frame;
  scene.add(frame);
}

function updateFreeView() {
  freeView.slots = computeSlots();
  const select = $('inv-free-aisle'), current = select.value;
  const aisles = [...new Set(freeView.slots.map(s => s.aisle))].sort((a, b) => a - b);
  select.textContent = '';
  [['all', 'Todos los pasillos'], ...aisles.map(a => [a, `Pasillo ${a}`])].forEach(([value, text]) => select.add(new Option(text, value)));
  select.value = aisles.includes(current) ? current : 'all';
  paintFreeView();
}

function setupFreeView() {
  $('inv-free').addEventListener('change', e => {
    // El color general de los racks taparía las posiciones: se apaga mientras tanto
    if (e.target.checked) { freeView.previousMode = $('inv-mode').value; $('inv-mode').value = 'none'; }
    else if (freeView.previousMode) $('inv-mode').value = freeView.previousMode;
    paintOverlay();
    paintFreeView();
  });
  $('inv-free-level').addEventListener('change', paintFreeView);
  $('inv-free-aisle').addEventListener('change', paintFreeView);
}

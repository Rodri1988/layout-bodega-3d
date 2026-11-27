// Placas visibles al caminar

// ---------- Señalética a la altura de los ojos ----------
const plateCache = {};
function plateMaterial(text, opts) {
  const key = text + JSON.stringify(opts);
  if (!plateCache[key]) {
    const { texture, aspect } = createTextTexture(text, opts);
    plateCache[key] = { mat: new THREE.MeshBasicMaterial({ map: texture, transparent: true }), aspect };
  }
  return plateCache[key];
}
// dir: hacia dónde mira la placa -> rotación en Y
function addPlate(text, x, y, z, h, rotY, opts, maxW = 99) {
  const { mat, aspect } = plateMaterial(text, opts);
  const height = Math.min(h, maxW / aspect);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(height * aspect, height), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.y = rotY;
  walkOnly.add(mesh);
}
function addRackPlates(num, x, z, width) {
  const opts = { bgColor: '#ffffff', textColor: '#0f172a', borderColor: '#1d4ed8', fontSize: 56 };
  if (width > 5) { // Módulo 1 de Pasillo 31: se lee desde el norte
    addPlate(String(num), x, 1.9, z - 2.29, 0.8, Math.PI, opts);
    return;
  }
  addPlate(String(num), x - width / 2 - 0.03, 1.9, z, 0.75, -Math.PI / 2, opts);
  addPlate(String(num), x + width / 2 + 0.03, 1.9, z, 0.75, Math.PI / 2, opts);
}
function addBayPlates(pos, prefix, cx, cz, w, d, isVertical) {
  const opts = { bgColor: '#fef9c3', textColor: '#0f172a', borderColor: '#0284c7', fontSize: 40, paddingX: 12, paddingY: 8 };
  const text = `${prefix}\n${pos}`;
  if (isVertical) {
    addPlate(text, cx - w / 2 - 0.03, 1.55, cz, 0.55, -Math.PI / 2, opts, d * 0.9);
    addPlate(text, cx + w / 2 + 0.03, 1.55, cz, 0.55, Math.PI / 2, opts, d * 0.9);
  } else {
    addPlate(text, cx, 1.55, cz + d / 2 + 0.03, 0.55, 0, opts, w * 0.9);
    addPlate(text, cx, 1.55, cz - d / 2 - 0.03, 0.55, Math.PI, opts, w * 0.9);
  }
}
function buildAisleSigns() {
  const opts = { bgColor: '#14532d', textColor: '#ffffff', borderColor: '#4ade80', fontSize: 52 };
  const signs = [
    ['Pasillo 21', -57.0, 12], ['Pasillo 21', -57.0, -20],
    ['Pasillo 22', -48.0, 18], ['Pasillo 22', -48.0, -20],
    ['Pasillo 23', -39.5, 18], ['Pasillo 23', -39.6, -20],
    ['Pasillo 24', -29.2, 18],
    ['Pasillo 25', -11.5, 12], ['Pasillo 26', -2.3, 12], ['Pasillo 27', 7.4, 12], ['Pasillo 28', 16.8, 12],
    ['Pasillo 25', -11.5, -27], ['Pasillo 26', -2.3, -27], ['Pasillo 27', 7.4, -27], ['Pasillo 28', 16.8, -27]
  ];
  signs.forEach(([name, x, z]) => {
    // Letrero colgante de doble cara
    addPlate(name, x, 4.1, z + 0.02, 0.8, 0, opts);
    addPlate(name, x, 4.1, z - 0.02, 0.8, Math.PI, opts);
  });
}

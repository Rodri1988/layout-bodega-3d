// Extintores, textos y etiquetas

/**
 * Construye un Extintor 3D (individual o carro doble) en cualquier elevación Y
 */
function createExtinguisher(x, z, isDouble = false, locationNote = '', baseY = 0, targetGroup = layers.fire) {
  const group = new THREE.Group();
  group.position.set(x, baseY, z);

  const buildSingleCylinder = (offsetX = 0, scale = 1) => {
    const cylGroup = new THREE.Group();
    cylGroup.position.x = offsetX;
    cylGroup.scale.setScalar(scale);

    // Cuerpo rojo
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 1.05, 16),
      materials.extRed
    );
    body.position.y = 0.55;
    body.castShadow = true;
    cylGroup.add(body);

    // Cúpula superior
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      materials.extRed
    );
    dome.position.y = 1.07;
    cylGroup.add(dome);

    // Válvula y manija
    const valve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 0.18, 10),
      materials.extBrass
    );
    valve.position.y = 1.35;
    cylGroup.add(valve);

    // Manguera/boquilla negra
    const hose = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.04, 0.75, 8),
      materials.extBlack
    );
    hose.position.set(0.26, 0.85, 0);
    hose.rotation.z = -0.15;
    cylGroup.add(hose);

    return cylGroup;
  };

  if (isDouble) {
    // Carro / Estación doble de extinción
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.12, 0.65),
      materials.extBlack
    );
    base.position.y = 0.16;
    group.add(base);

    // Ruedas
    const wheelGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.1, 14);
    wheelGeo.rotateZ(Math.PI / 2);
    const w1 = new THREE.Mesh(wheelGeo, materials.extBlack);
    w1.position.set(-0.58, 0.18, 0);
    const w2 = new THREE.Mesh(wheelGeo, materials.extBlack);
    w2.position.set(0.58, 0.18, 0);
    group.add(w1, w2);

    group.add(buildSingleCylinder(-0.27, 1.15));
    group.add(buildSingleCylinder(0.27, 1.15));
  } else {
    // Pedestal y cilindro individual
    const stand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.36, 0.08, 16),
      materials.extBlack
    );
    stand.position.y = 0.04;
    group.add(stand);

    group.add(buildSingleCylinder(0, 1.05));
  }

  // Baliza roja flotante / anillo en el suelo para alta visibilidad
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.55, 0.75, 24),
    new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.03;
  group.add(ring);

  // Hitbox para interacción
  const hit = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 2.2, 1.4),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hit.position.y = 1.1;
  hit.userData = {
    type: isDouble ? 'Estación Doble / Carro Extintor' : 'Extintor Portátil PQS / CO2',
    badgeColor: 'bg-red-500/20 text-red-300',
    title: isDouble ? 'Carro Extintor Rodante / Doble' : 'Extintor Contra Incendios',
    desc: `Equipo de respuesta primaria contra incendios ubicado en: ${locationNote}. Señalizado según normativa de seguridad industrial.`,
    meta: [
      { label: 'Nivel', value: baseY > 0 ? '2° Piso (Mezzanine)' : '1° Piso' },
      { label: 'Ubicación', value: locationNote },
      { label: 'Tipo', value: isDouble ? 'Doble / Alta Capacidad' : 'Portátil 10 kg' },
      { label: 'Inspección', value: 'Vigente' }
    ]
  };
  group.add(hit);
  interactiveObjects.push(hit);

  targetGroup.add(group);
  addCollider(x, z, isDouble ? 1.4 : 0.7, 0.7, baseY, baseY + 1.5, targetGroup);
}

/**
 * Genera una textura Canvas nítida para etiquetas de módulos, pasillos y cotas
 */
function createTextTexture(text, options = {}) {
  const {
    bgColor = 'rgba(255, 255, 255, 0.94)',
    textColor = '#0f172a',
    borderColor = null,
    fontSize = 44,
    fontWeight = '700',
    paddingX = 24,
    paddingY = 14
  } = options;

  const lines = String(text).split('\n');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  ctx.font = `${fontWeight} ${fontSize}px Inter, Arial, sans-serif`;
  let maxWidth = 0;
  lines.forEach(line => {
    const w = ctx.measureText(line).width;
    if (w > maxWidth) maxWidth = w;
  });

  const lineHeight = fontSize * 1.22;
  canvas.width = Math.max(64, Math.ceil(maxWidth + paddingX * 2));
  canvas.height = Math.max(48, Math.ceil(lines.length * lineHeight + paddingY * 2));

  // Fondo redondeado
  const r = 14;
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(canvas.width - r, 0);
  ctx.quadraticCurveTo(canvas.width, 0, canvas.width, r);
  ctx.lineTo(canvas.width, canvas.height - r);
  ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - r, canvas.height);
  ctx.lineTo(r, canvas.height);
  ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

  if (borderColor) {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  ctx.font = `${fontWeight} ${fontSize}px Inter, Arial, sans-serif`;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const totalTextHeight = lines.length * lineHeight;
  const startY = (canvas.height - totalTextHeight) / 2 + lineHeight / 2;

  lines.forEach((line, idx) => {
    ctx.fillText(line, canvas.width / 2, startY + idx * lineHeight);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return { texture, aspect: canvas.width / canvas.height };
}

/**
 * Crea un cartel plano en el suelo o flotante horizontal (legible desde arriba e isométrica)
 */
function addFloorLabel(text, x, z, scaleHeight = 2.2, opts = {}, targetGroup = layers.aisles, rotY = 0, yPos = 0.08) {
  const { texture, aspect } = createTextTexture(text, opts);
  const geo = new THREE.PlaneGeometry(scaleHeight * aspect, scaleHeight);
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.rotation.z = rotY;
  mesh.position.set(x, yPos, z);
  targetGroup.add(mesh);
  return mesh;
}

/**
 * Crea un Sprite vertical siempre legible hacia la cámara
 */
function addSpriteLabel(text, x, y, z, scaleHeight = 1.8, opts = {}, targetGroup = layers.zones) {
  const { texture, aspect } = createTextTexture(text, opts);
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(scaleHeight * aspect, scaleHeight, 1);
  sprite.position.set(x, y, z);
  targetGroup.add(sprite);
  return sprite;
}

// Cómo se dibuja un módulo de rack

/**
 * Construye un módulo individual de Rack Metálico Industrial con vigas naranjas,
 * pilares azules, pallets, cajas aleatorias y su etiqueta numérica.
 */
function createRackModule(config) {
  const {
    num,
    x,
    z,
    width = 2.8,
    depth = 4.2,
    height = 7.0,
    levels = 4,   // piso + 3 niveles sobre vigas
    aisleName = '',
    columnDesc = ''
  } = config;

  const rackGroup = new THREE.Group();
  rackGroup.position.set(x, 0, z);

  // 4 Pilares
  const postGeo = new THREE.BoxGeometry(0.16, height, 0.16);
  const offsets = [
    [-width / 2 + 0.08, -depth / 2 + 0.08],
    [ width / 2 - 0.08, -depth / 2 + 0.08],
    [-width / 2 + 0.08,  depth / 2 - 0.08],
    [ width / 2 - 0.08,  depth / 2 - 0.08]
  ];
  offsets.forEach(([ox, oz]) => {
    const post = new THREE.Mesh(postGeo, materials.postBlue);
    post.position.set(ox, height / 2, oz);
    post.castShadow = true;
    post.receiveShadow = true;
    rackGroup.add(post);
  });

  // Vigas Naranjas y Niveles de Carga
  const levelStep = height / levels;
  const beamLongGeo = new THREE.BoxGeometry(0.1, 0.16, depth);
  const beamShortGeo = new THREE.BoxGeometry(width, 0.14, 0.1);

  // Caja invisible para raycasting cómodo
  const hitGeo = new THREE.BoxGeometry(width, height, depth);
  const hitMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.0,
    depthWrite: false
  });
  const hitMesh = new THREE.Mesh(hitGeo, hitMat);
  hitMesh.position.y = height / 2;
  hitMesh.userData = {
    type: 'Módulo de Rack',
    badgeColor: 'bg-orange-500/20 text-orange-300',
    title: `Módulo #${num}`,
    desc: `Estantería industrial selectiva ubicada en ${aisleName}. Cuenta con ${levels} niveles de carga paletizada y estructura de acero reforzado.`,
    meta: [
      { label: 'Ubicación', value: aisleName },
      { label: 'Sector', value: columnDesc },
      { label: 'Niveles', value: `${levels} niveles` },
      { label: 'Estado', value: 'Operativo (85%)' }
    ]
  };
  rackGroup.add(hitMesh);
  // Datos para dibujar la ocupación real (ver js/inventario/posiciones-libres.js)
  const cargo = [];
  hitMesh.userData.rack = { width, depth, levels, levelStep, cargo };
  interactiveObjects.push(hitMesh);

  for (let lvl = 0; lvl < levels; lvl++) {
    const yBeam = lvl * levelStep;   // el nivel 1 va en el piso, sin vigas
    if (lvl > 0) {

    // Vigas laterales (a lo largo de Z)
    const bLeft = new THREE.Mesh(beamLongGeo, materials.beamOrange);
    bLeft.position.set(-width / 2 + 0.08, yBeam, 0);
    rackGroup.add(bLeft);

    const bRight = new THREE.Mesh(beamLongGeo, materials.beamOrange);
    bRight.position.set(width / 2 - 0.08, yBeam, 0);
    rackGroup.add(bRight);

    // Travesaños frontales/traseros
    const bFront = new THREE.Mesh(beamShortGeo, materials.beamOrange);
    bFront.position.set(0, yBeam, depth / 2 - 0.08);
    rackGroup.add(bFront);

    const bBack = new THREE.Mesh(beamShortGeo, materials.beamOrange);
    bBack.position.set(0, yBeam, -depth / 2 + 0.08);
    rackGroup.add(bBack);

    }

    // Pallets y cajas (2 pallets por nivel a lo largo de Z)
    for (let p = 0; p < 2; p++) {
      // Simular ocupación realista (~85%)
      if (((num * 7 + lvl * 3 + p) % 9) === 0) continue;

      const pz = (p === 0 ? -depth * 0.24 : depth * 0.24);
      const palletGeo = new THREE.BoxGeometry(width * 0.84, 0.14, depth * 0.42);
      const pallet = new THREE.Mesh(palletGeo, materials.palletWood);
      pallet.position.set(0, yBeam + 0.15, pz);
      pallet.castShadow = true;
      pallet.receiveShadow = true;
      rackGroup.add(pallet);

      // Carga sobre pallet
      const boxH = 0.75 + ((num + lvl + p) % 4) * 0.18;
      const boxGeo = new THREE.BoxGeometry(width * 0.78, boxH, depth * 0.38);
      const boxMat = materials.boxColors[(num + lvl + p) % materials.boxColors.length];
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.position.set(0, yBeam + 0.22 + boxH / 2, pz);
      box.castShadow = true;
      box.receiveShadow = true;
      rackGroup.add(box);
      cargo.push(pallet, box);
    }
  }

  layers.racks.add(rackGroup);
  addCollider(x, z, width, depth, 0, height, layers.racks);
  addRackPlates(num, x, z, width);

  // Etiqueta numérica superior del módulo (en capa independiente de módulos)
  addFloorLabel(
    String(num),
    x,
    z,
    1.55,
    {
      bgColor: 'rgba(255, 255, 255, 0.94)',
      textColor: '#0f172a',
      borderColor: '#1d4ed8',
      fontSize: 48,
      paddingX: 18,
      paddingY: 10
    },
    layers.modules,
    0,
    height + 0.15
  );
}

// Bodega 70 y zonas especiales

/**
 * Construye las zonas especiales: Bodega 70 (1° Piso con sus racks 6-70),
 * BEEXX, Baños, Pasillo 31, Red Húmeda, Patio y Andenes 30-33.
 */
function buildSpecialZones() {
  // 5. ZONA 'BODEGA 70' (1° PISO)
  // Ubicada en parte superior izquierda-centro: X de -38.5 a -13.5 (ancho 25m), Z de -35.2 a -11.2 (profundidad 24m)
  const b70Group = new THREE.Group();
  const b70W = 25;
  const b70D = 24;
  const b70X = -26;
  const b70Z = -23.2;

  // Suelo interior de Bodega 70
  const b70Floor = new THREE.Mesh(
    new THREE.PlaneGeometry(b70W, b70D),
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.72 })
  );
  b70Floor.rotation.x = -Math.PI / 2;
  b70Floor.position.set(b70X, 0.03, b70Z);
  b70Floor.receiveShadow = true;
  b70Group.add(b70Floor);

  // Muros perimetrales de Bodega 70 (altura 4.8m hasta la losa del 2° piso)
  const b70WallH = 4.8;
  const wallMat70 = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    transparent: true,
    opacity: 0.42,
    roughness: 0.4
  });

  const facadeMat = new THREE.MeshStandardMaterial({ color: 0xf1efe8, transparent: true, opacity: 0.72, roughness: 0.8 });
  walkWallMaterial = wallMat70;
  facadeMaterial = facadeMat;

  // Muro sur de Bodega 70 dividido por el acceso inferior central abierto (X entre -26.0 y -23.0)
  // Tramo izquierdo (X: -38.5 a -26.0 -> ancho 12.5, centro -32.25)
  const wSouthLeft = new THREE.Mesh(new THREE.BoxGeometry(12.5, b70WallH, 0.32), facadeMat);
  wSouthLeft.position.set(-32.25, b70WallH / 2, b70Z + b70D / 2);
  b70Group.add(wSouthLeft);
  addMeshCollider(wSouthLeft, layers.bodega70);
  // Tramo derecho (X: -23.0 a -13.5 -> ancho 9.5, centro -18.25)
  const wSouthRight = new THREE.Mesh(new THREE.BoxGeometry(9.5, b70WallH, 0.32), facadeMat);
  wSouthRight.position.set(-18.25, b70WallH / 2, b70Z + b70D / 2);
  b70Group.add(wSouthRight);
  addMeshCollider(wSouthRight, layers.bodega70);

  // Muro oeste de Bodega 70
  const wWest = new THREE.Mesh(new THREE.BoxGeometry(0.32, b70WallH, b70D), wallMat70);
  wWest.position.set(b70X - b70W / 2, b70WallH / 2, b70Z);
  b70Group.add(wWest);
  addMeshCollider(wWest, layers.bodega70);
  // Muro este de Bodega 70
  const wEast = new THREE.Mesh(new THREE.BoxGeometry(0.32, b70WallH, b70D), wallMat70);
  wEast.position.set(b70X + b70W / 2, b70WallH / 2, b70Z);
  b70Group.add(wEast);
  addMeshCollider(wEast, layers.bodega70);

  // Cartel identificador de Bodega 70 en el acceso sur
  addFloorLabel(
    'BODEGA 70 · ACCESO',
    -24.5,
    -10.3,
    1.15,
    {
      bgColor: 'rgba(15, 23, 42, 0.92)',
      textColor: '#38bdf8',
      borderColor: '#0284c7',
      fontSize: 30
    },
    layers.bodega70,
    0,
    0.1
  );

  layers.bodega70.add(b70Group);

  // Columnas estructurales periféricas que sostienen el 2° Piso (Mezzanine) a Y = 4.8m
  const colGeo = new THREE.BoxGeometry(0.42, 4.8, 0.42);
  const colMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.35 });
  [-38.2, -26.0, -13.8].forEach(cx => {
    [-34.9, -23.2, -11.5].forEach(cz => {
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.set(cx, 2.4, cz);
      col.castShadow = true;
      layers.bodega70.add(col);
      addMeshCollider(col, layers.bodega70);
    });
  });

  // =========================================================================
  // INTERIOR DE BODEGA 70 (1° PISO, Y = 0): RACKS DE PICKING 6-70-1-1 AL 6-70-11-1
  // Huella interior: X de -38.1 a -13.9 (ancho 24.2m), Z de -34.8 a -11.6 (prof 23.2m)
  // =========================================================================
  const createBodega70RackRow = (cfg) => {
    const {
      codePrefix,
      rangeText,
      count,
      startX,
      startZ,
      endX,
      endZ,
      thickness,
      isVertical,
      height = 2.75
    } = cfg;

    const rowGroup = new THREE.Group();
    const totalLen = isVertical ? Math.abs(endZ - startZ) : Math.abs(endX - startX);
    const step = totalLen / count;

    const shelfLevels = 4;
    const postMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, metalness: 0.6, roughness: 0.4 });
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.45 });
    const toteColors = [0x38bdf8, 0xfbbf24, 0x94a3b8, 0xe2e8f0, 0x60a5fa];

    for (let i = 0; i < count; i++) {
      const posCode = `A${String(i + 1).padStart(2, '0')}`;
      const fullCode = `${codePrefix}-${posCode}`;

      const cx = isVertical
        ? startX
        : startX + Math.sign(endX - startX) * (step * (i + 0.5));
      const cz = isVertical
        ? startZ + Math.sign(endZ - startZ) * (step * (i + 0.5))
        : startZ;

      const w = isVertical ? thickness : step * 0.96;
      const d = isVertical ? step * 0.96 : thickness;

      // Contenedor interactivo del submódulo A01..A09
      const bayMesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, height, d),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.06,
          depthWrite: false
        })
      );
      bayMesh.position.set(cx, height / 2, cz);

      // Marco metálico por submódulo
      const bayEdges = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(w, height, d)),
        new THREE.LineBasicMaterial({ color: 0x1e3a8a })
      );
      bayEdges.position.copy(bayMesh.position);
      rowGroup.add(bayEdges);

      // Pilares verticales esquineros
      [
        [-w / 2 + 0.05, -d / 2 + 0.05],
        [ w / 2 - 0.05, -d / 2 + 0.05],
        [-w / 2 + 0.05,  d / 2 - 0.05],
        [ w / 2 - 0.05,  d / 2 - 0.05]
      ].forEach(([px, pz]) => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, height, 0.08), postMat);
        post.position.set(cx + px, height / 2, cz + pz);
        rowGroup.add(post);
      });

      // Repisas y cajas de picking
      for (let s = 0; s < shelfLevels; s++) {
        const sy = 0.25 + s * ((height - 0.35) / (shelfLevels - 1));
        const shelf = new THREE.Mesh(
          new THREE.BoxGeometry(w * 0.95, 0.07, d * 0.95),
          shelfMat
        );
        shelf.position.set(cx, sy, cz);
        rowGroup.add(shelf);

        if ((i + s) % 4 !== 0) {
          const box = new THREE.Mesh(
            new THREE.BoxGeometry(w * 0.72, 0.36, d * 0.72),
            new THREE.MeshStandardMaterial({
              color: toteColors[(i + s) % toteColors.length],
              roughness: 0.65
            })
          );
          box.position.set(cx, sy + 0.21, cz);
          box.castShadow = true;
          rowGroup.add(box);
        }
      }

      bayMesh.userData = {
        type: 'Rack Bodega 70 · 1° Piso',
        badgeColor: 'bg-sky-500/20 text-sky-300',
        title: `Ubicación ${fullCode}`,
        desc: `Posición individual (${posCode}) de la estantería ${rangeText} dentro de Bodega 70 en el Primer Nivel (bajo Bodega 29 / Oficina).`,
        meta: [
          { label: 'Código Completo', value: fullCode },
          { label: 'Línea / Pasillo', value: rangeText },
          { label: 'Nivel', value: '1° Piso · Bodega 70' },
          { label: 'Repisas', value: `${shelfLevels} niveles` }
        ]
      };
      rowGroup.add(bayMesh);
      interactiveObjects.push(bayMesh);
      addCollider(cx, cz, w, d, 0, height, layers.bodega70);
      addBayPlates(posCode, codePrefix, cx, cz, w, d, isVertical);
    }

    // Etiqueta superior con el rango exacto del plano
    const midX = (startX + endX) / 2;
    const midZ = (startZ + endZ) / 2;
    addFloorLabel(
      rangeText,
      midX,
      midZ,
      isVertical ? 1.15 : 1.05,
      {
        bgColor: 'rgba(255, 255, 255, 0.96)',
        textColor: '#0f172a',
        borderColor: '#1d4ed8',
        fontSize: 34,
        paddingX: 16,
        paddingY: 8
      },
      layers.bodega70,
      isVertical ? Math.PI / 2 : 0,
      height + 0.1
    );

    layers.bodega70.add(rowGroup);
  };

  // 1) Columna lateral izquierda vertical: '6-70-2-1-A01 al A09' (9 submódulos)
  createBodega70RackRow({
    codePrefix: '6-70-2-1',
    rangeText: '6-70-2-1-A01 al A09',
    count: 9,
    startX: -37.2,
    startZ: -33.1,
    endX: -37.2,
    endZ: -13.3,
    thickness: 1.7,
    isVertical: true
  });

  // 2) Cabecera superior horizontal (Z = -34.0) con 3 tramos:
  // - '6-70-3-1-A01 al A03' (izquierda)
  createBodega70RackRow({
    codePrefix: '6-70-3-1',
    rangeText: '6-70-3-1-A01 al A03',
    count: 3,
    startX: -36.3,
    startZ: -34.0,
    endX: -31.8,
    endZ: -34.0,
    thickness: 1.5,
    isVertical: false
  });

  // - '6-70-6-1-A01 al A03' (centro)
  createBodega70RackRow({
    codePrefix: '6-70-6-1',
    rangeText: '6-70-6-1-A01 al A03',
    count: 3,
    startX: -29.4,
    startZ: -34.0,
    endX: -24.0,
    endZ: -34.0,
    thickness: 1.5,
    isVertical: false
  });

  // - '6-70-9-1-A01 al A04' (derecha)
  createBodega70RackRow({
    codePrefix: '6-70-9-1',
    rangeText: '6-70-9-1-A01 al A04',
    count: 4,
    startX: -21.6,
    startZ: -34.0,
    endX: -15.7,
    endZ: -34.0,
    thickness: 1.5,
    isVertical: false
  });

  // 3) Bloque doble central izquierdo (nace arriba Z=-33.2 y baja ~70% hasta Z=-18.5):
  // - Cara izquierda: '6-70-4-1-A01 al A07'
  createBodega70RackRow({
    codePrefix: '6-70-4-1',
    rangeText: '6-70-4-1-A01 al A07',
    count: 7,
    startX: -31.2,
    startZ: -33.2,
    endX: -31.2,
    endZ: -18.5,
    thickness: 1.15,
    isVertical: true
  });
  // - Cara derecha: '6-70-5-1-A01 al A07'
  createBodega70RackRow({
    codePrefix: '6-70-5-1',
    rangeText: '6-70-5-1-A01 al A07',
    count: 7,
    startX: -30.0,
    startZ: -33.2,
    endX: -30.0,
    endZ: -18.5,
    thickness: 1.15,
    isVertical: true
  });

  // 4) Bloque doble central derecho (nace arriba Z=-33.2 y baja ~70% hasta Z=-18.5):
  // - Cara izquierda: '6-70-7-1-A01 al A07'
  createBodega70RackRow({
    codePrefix: '6-70-7-1',
    rangeText: '6-70-7-1-A01 al A07',
    count: 7,
    startX: -23.4,
    startZ: -33.2,
    endX: -23.4,
    endZ: -18.5,
    thickness: 1.15,
    isVertical: true
  });
  // - Cara derecha: '6-70-8-1-A01 al A07'
  createBodega70RackRow({
    codePrefix: '6-70-8-1',
    rangeText: '6-70-8-1-A01 al A07',
    count: 7,
    startX: -22.2,
    startZ: -33.2,
    endX: -22.2,
    endZ: -18.5,
    thickness: 1.15,
    isVertical: true
  });

  // 5) Columna lateral derecha vertical: '6-70-10-1-A01 al A09' (9 submódulos)
  createBodega70RackRow({
    codePrefix: '6-70-10-1',
    rangeText: '6-70-10-1-A01 al A09',
    count: 9,
    startX: -14.8,
    startZ: -33.1,
    endX: -14.8,
    endZ: -13.3,
    thickness: 1.7,
    isVertical: true
  });

  // 6) Racks inferiores horizontales (Z = -12.4) con acceso central abierto entre ambos:
  // - Izquierda: '6-70-1-1-A01 al A08' (8 submódulos)
  createBodega70RackRow({
    codePrefix: '6-70-1-1',
    rangeText: '6-70-1-1-A01 al A08',
    count: 8,
    startX: -36.3,
    startZ: -12.4,
    endX: -26.2,
    endZ: -12.4,
    thickness: 1.6,
    isVertical: false
  });

  // - Derecha: '6-70-11-1-A01 al' (6 submódulos)
  createBodega70RackRow({
    codePrefix: '6-70-11-1',
    rangeText: '6-70-11-1-A01 al',
    count: 6,
    startX: -22.8,
    startZ: -12.4,
    endX: -15.7,
    endZ: -12.4,
    thickness: 1.6,
    isVertical: false
  });

  // Esquinas de unión estructural en Bodega 70 (Noroeste, Noreste, Suroeste y cabeceras centrales)
  const b70CornerMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 });
  [
    [-37.2, -34.0, 1.7, 1.5],
    [-14.8, -34.0, 1.7, 1.5],
    [-37.2, -12.4, 1.7, 1.6],
    [-30.6, -34.0, 2.3, 1.5],
    [-22.8, -34.0, 2.3, 1.5]
  ].forEach(([cx, cz, cw, cd]) => {
    const cBox = new THREE.Mesh(new THREE.BoxGeometry(cw, 2.75, cd), b70CornerMat);
    cBox.position.set(cx, 1.375, cz);
    layers.bodega70.add(cBox);
    addMeshCollider(cBox, layers.bodega70);
  });

  // 3 Extintores interiores de Bodega 70 (1° Piso) exactamente en sus posiciones del plano:
  // 1) Junto al extremo inferior izquierdo de '6-70-4-1'
  createExtinguisher(-32.3, -21.8, false, 'Bodega 70 (1° Piso) · Junto a extremo inferior izq. de 6-70-4-1', 0, layers.bodega70);
  // 2) Junto al extremo inferior derecho de '6-70-8-1'
  createExtinguisher(-21.1, -20.2, false, 'Bodega 70 (1° Piso) · Junto a extremo inferior der. de 6-70-8-1', 0, layers.bodega70);
  // 3) En la zona abierta inferior derecha antes de '6-70-10-1'
  createExtinguisher(-17.4, -18.2, false, 'Bodega 70 (1° Piso) · Zona abierta inferior der. antes de 6-70-10-1', 0, layers.bodega70);

  // Pilar / estructura rectangular central debajo de Bodega 70 (en el área abierta)
  const pillarGeo = new THREE.BoxGeometry(2.6, 7.5, 4.6);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 });
  const centralPillar = new THREE.Mesh(pillarGeo, pillarMat);
  centralPillar.position.set(-18.5, 3.75, -3.5);
  centralPillar.castShadow = true;
  centralPillar.receiveShadow = true;
  layers.zones.add(centralPillar);
  addMeshCollider(centralPillar, layers.zones);

  // 11. ZONA 'BEEXX' (A la derecha de los módulos impares 7-23)
  // X de 21.1 a 34.1 (ancho 13), Z de -25.5 a +10.5 (profundidad 36)
  const beexxW = 13;
  const beexxD = 36;
  const beexxX = 27.6;
  const beexxZ = -7.5;

  const beexxBlock = new THREE.Mesh(
    new THREE.BoxGeometry(beexxW, 5.5, beexxD),
    new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.25,
      roughness: 0.35
    })
  );
  beexxBlock.position.set(beexxX, 2.75, beexxZ);
  beexxBlock.userData = {
    type: 'Recinto Operativo',
    badgeColor: 'bg-indigo-500/20 text-indigo-300',
    title: 'Zona BEEXX',
    desc: 'Área dedicada de operaciones logísticas BEEXX, colindante con Pasillo 28 y el sector de Red Húmeda.',
    meta: [
      { label: 'Sector', value: 'Ala Este Central' },
      { label: 'Colindancia', value: 'Pasillo 28 / Red Húmeda' },
      { label: 'Dimensiones', value: '13m x 36m' },
      { label: 'Estado', value: 'Operativo' }
    ]
  };
  layers.zones.add(beexxBlock);
  addMeshCollider(beexxBlock, layers.zones);
  interactiveObjects.push(beexxBlock);

  // Borde en el suelo para BEEXX
  const beexxEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(beexxW, 5.5, beexxD)),
    new THREE.LineBasicMaterial({ color: 0x4f46e5 })
  );
  beexxEdges.position.copy(beexxBlock.position);
  layers.zones.add(beexxEdges);

  addFloorLabel(
    'BEEXX',
    beexxX,
    beexxZ,
    2.6,
    {
      bgColor: 'rgba(30, 27, 75, 0.92)',
      textColor: '#ffffff',
      borderColor: '#818cf8',
      fontSize: 48
    },
    layers.zones,
    0,
    5.6
  );

  // Debajo de BEEXX: Bloque de 'Baños', seguido abajo por 'Pasillo 31' y el módulo '1'
  // Baños: X = 25.5, Z = 20.5 (ancho 9, prof 9)
  const banosMesh = new THREE.Mesh(
    new THREE.BoxGeometry(9.0, 3.6, 9.0),
    new THREE.MeshStandardMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.35 })
  );
  banosMesh.position.set(25.5, 1.8, 20.5);
  banosMesh.userData = {
    type: 'Servicios / Infraestructura',
    badgeColor: 'bg-sky-500/20 text-sky-300',
    title: 'Módulo de Baños y Servicios',
    desc: 'Instalaciones sanitarias y vestidores del personal ubicados en el sector sur-este junto a Patio y Pasillo 31.',
    meta: [
      { label: 'Ubicación', value: 'Sur de Zona BEEXX' },
      { label: 'Acceso', value: 'Desde Patio / Pasillo 31' }
    ]
  };
  layers.zones.add(banosMesh);
  addMeshCollider(banosMesh, layers.zones);
  interactiveObjects.push(banosMesh);

  addFloorLabel(
    'Baños',
    25.5,
    20.5,
    2.0,
    {
      bgColor: 'rgba(15, 23, 42, 0.9)',
      textColor: '#38bdf8',
      borderColor: '#0284c7',
      fontSize: 42
    },
    layers.zones,
    0,
    3.7
  );

  // Pasillo 31 (Z = 27.5)
  addFloorLabel(
    'Pasillo 31',
    25.5,
    27.5,
    1.8,
    {
      bgColor: 'rgba(255, 255, 255, 0.92)',
      textColor: '#0f172a',
      borderColor: '#64748b',
      fontSize: 38
    },
    layers.aisles,
    0,
    0.1
  );

  // Módulo '1' bajo Pasillo 31 (Z = 33.0)
  createRackModule({
    num: 1,
    x: 25.5,
    z: 33.0,
    width: 8.6,
    depth: 4.5,
    height: 4.5,
    levels: 2,
    aisleName: 'Pasillo 31',
    columnDesc: 'Módulo Sur BEEXX / Patio'
  });

  // 12. ZONA DERECHA: 'RED - Humeda', 'Patio' y 4 Carriles / Andenes (30, [vacío], 32, 33)
  // Red Húmeda (X = 39.5, Z = -7.5)
  const redHumedaRing = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 2.6, 0.8),
    materials.extRed
  );
  redHumedaRing.position.set(35.2, 1.3, -10.0);
  layers.fire.add(redHumedaRing);
  addMeshCollider(redHumedaRing, layers.fire);

  addFloorLabel(
    'RED - Húmeda\n(las demás alrededor\nde las escaleras)',
    39.5,
    -7.5,
    3.2,
    {
      bgColor: 'rgba(220, 38, 38, 0.92)',
      textColor: '#ffffff',
      borderColor: '#fecaca',
      fontSize: 32
    },
    layers.fire,
    0,
    0.12
  );

  // Área 'Patio' (parte inferior derecha: X = 37.5, Z = 24.5)
  const patioFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 21),
    new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.25 })
  );
  patioFloor.rotation.x = -Math.PI / 2;
  patioFloor.position.set(37.5, 0.02, 24.5);
  layers.zones.add(patioFloor);

  addFloorLabel(
    'Patio',
    37.5,
    24.5,
    2.3,
    {
      bgColor: 'rgba(30, 41, 59, 0.85)',
      textColor: '#e2e8f0',
      borderColor: '#94a3b8',
      fontSize: 44
    },
    layers.zones,
    0,
    0.1
  );

  // 4 Carriles / Andenes largos verticales en extremo derecho: X = 47.0, 51.2, 55.4, 59.6
  const lanes = [
    { header: '30', x: 47.0 },
    { header: '31 (S/N)', x: 51.2 },
    { header: '32', x: 55.4 },
    { header: '33', x: 59.6 }
  ];

  lanes.forEach((lane, idx) => {
    const laneW = 3.9;
    const laneD = 70.5;

    // Carril demarcado en suelo
    const laneFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(laneW, laneD),
      new THREE.MeshStandardMaterial({
        color: idx % 2 === 0 ? 0xe2e8f0 : 0xcbd5e1,
        roughness: 0.75
      })
    );
    laneFloor.rotation.x = -Math.PI / 2;
    laneFloor.position.set(lane.x, 0.03, 0);
    laneFloor.userData = {
      type: 'Carril de Carga / Andén',
      badgeColor: 'bg-emerald-500/20 text-emerald-300',
      title: `Andén / Carril ${lane.header}`,
      desc: `Carril longitudinal de almacenamiento en piso / preparación de despacho (Posición 1) en el ala este de la bodega.`,
      meta: [
        { label: 'Andén', value: lane.header },
        { label: 'Posición', value: 'Módulo 1 (Piso)' },
        { label: 'Longitud', value: '70 metros' },
        { label: 'Uso', value: 'Staging / Despacho' }
      ]
    };
    layers.zones.add(laneFloor);
    interactiveObjects.push(laneFloor);

    // Líneas divisorias de carril
    const lineGeo = new THREE.PlaneGeometry(0.14, laneD);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x334155 });
    const lineLeft = new THREE.Mesh(lineGeo, lineMat);
    lineLeft.rotation.x = -Math.PI / 2;
    lineLeft.position.set(lane.x - laneW / 2, 0.04, 0);
    layers.zones.add(lineLeft);

    // Cabecera superior (Z = -32.5)
    if (lane.header !== '31 (S/N)') {
      addFloorLabel(
        lane.header,
        lane.x,
        -32.5,
        2.1,
        {
          bgColor: 'rgba(15, 23, 42, 0.92)',
          textColor: '#ffffff',
          borderColor: '#f97316',
          fontSize: 46
        },
        layers.zones,
        0,
        0.12
      );
    }

    // Número '1' en el centro del carril (Z = 2.0)
    addFloorLabel(
      '1',
      lane.x,
      2.0,
      2.0,
      {
        bgColor: 'rgba(255, 255, 255, 0.92)',
        textColor: '#0f172a',
        borderColor: '#334155',
        fontSize: 44
      },
      layers.modules,
      0,
      0.12
    );
  });
}

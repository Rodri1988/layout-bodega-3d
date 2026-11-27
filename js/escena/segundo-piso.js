// Segundo piso (Bodega 29 y oficina)

/**
 * Construye el SEGUNDO PISO (MEZZANINE) DIRECTAMENTE ARRIBA DE BODEGA 70
 * Mismas coordenadas X (-38.5 a -13.5, ancho 25m) y Z (-35.2 a -11.2, prof 24m), elevación Y = 4.8m.
 * Contiene exclusivamente la distribución de la segunda imagen:
 * - Área principal superior izquierda (~65% ancho x ~72% prof): Bodega 29 con puerta en su muro inferior.
 * - Pasillo/antesala inferior (~65% ancho x ~28% prof) debajo de Bodega 29 con extintor en esquina sup. der. y puerta hacia Oficina.
 * - Área derecha completa (~35% ancho x 100% prof): Oficina con piso diferenciado y mobiliario ejecutivo sutil.
 */
function buildSecondFloorMezzanine() {
  const floorY = 4.8;
  const slabH = 0.24;
  const b70W = 25.0; // X: -38.5 a -13.5
  const b70D = 24.0; // Z: -35.2 a -11.2
  const b70X = -26.0;
  const b70Z = -23.2;

  // 1. Losa estructural del 2° Piso (con modo transparencia para ver los racks 6-70 de Bodega 70 debajo)
  mezzanineSlabMaterial = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    transparent: true,
    opacity: 0.42,
    roughness: 0.45,
    metalness: 0.2
  });
  const slabMesh = new THREE.Mesh(
    new THREE.BoxGeometry(b70W, slabH, b70D),
    mezzanineSlabMaterial
  );
  slabMesh.position.set(b70X, floorY - slabH / 2, b70Z);
  slabMesh.receiveShadow = true;
  layers.floor2.add(slabMesh);

  // Borde estructural del Mezzanine
  const perimeterEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(b70W, slabH, b70D)),
    new THREE.LineBasicMaterial({ color: 0x0284c7 })
  );
  perimeterEdges.position.copy(slabMesh.position);
  layers.floor2.add(perimeterEdges);

  // Baranda Este
  const railMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4, metalness: 0.5 });
  const railEast = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, b70D), railMat);
  railEast.position.set(-13.55, floorY + 1.05, b70Z);
  layers.floor2.add(railEast);

  // Cartel flotante superior del 2° Piso
  floor2Title = addSpriteLabel(
    '2° PISO · BODEGA 29 Y OFICINA (ARRIBA DE BODEGA 70)',
    b70X,
    floorY + 3.8,
    b70Z - b70D / 2,
    1.45,
    {
      bgColor: 'rgba(8, 145, 178, 0.94)',
      textColor: '#ffffff',
      borderColor: '#67e8f9',
      fontSize: 32
    },
    layers.floor2
  );

  // =========================================================================
  // DISTRIBUCIÓN INTERIOR DEL 2° PISO (SEGUNDA IMAGEN):
  // Huella útil: X de -38.3 a -13.7 (ancho 24.6m), Z de -35.0 a -11.4 (prof 23.6m)
  // - División vertical Bodega 29 / Oficina en X = -22.3 (~65% izq / ~35% der)
  // - División horizontal Bodega 29 / Pasillo inferior en Z = -18.0 (~72% sup / ~28% inf)
  // =========================================================================
  const wallH2 = 2.9;
  const wallT2 = 0.26;
  const partitionMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    transparent: true,
    opacity: 0.82,
    roughness: 0.45
  });

  const addWall2 = (w, d, x, z) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, wallH2, d), partitionMat);
    mesh.position.set(x, floorY + wallH2 / 2, z);
    mesh.castShadow = true;
    layers.floor2.add(mesh);
    addMeshCollider(mesh, layers.floor2);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(w, wallH2, d)),
      new THREE.LineBasicMaterial({ color: 0x334155 })
    );
    edges.position.copy(mesh.position);
    layers.floor2.add(edges);
  };

  // Muro Perimetral Norte (X: -38.3 a -13.7, Z = -35.0)
  addWall2(24.6, wallT2, -26.0, -35.0);
  // Muro Perimetral Sur (X: -38.3 a -13.7, Z = -11.4)
  // (con vano de 1,6 m en el extremo oeste, donde llega la escalera)
  addWall2(22.9, wallT2, -25.15, -11.4);
  // Muro Perimetral Oeste (X = -38.3, Z: -35.0 a -11.4)
  addWall2(wallT2, 23.6, -38.3, -23.2);
  // Muro Perimetral Este (X = -13.7, Z: -35.0 a -11.4)
  addWall2(wallT2, 23.6, -13.7, -23.2);

  // Muro divisorio vertical entre Bodega 29 + Pasillo Inferior (izq) y Oficina (der) en X = -22.3
  // Con vano/puerta de comunicación en el pasillo inferior (Z entre -15.4 y -13.4)
  addWall2(wallT2, 19.6, -22.3, -25.2); // Tramo superior desde Z=-35.0 hasta Z=-15.4
  addWall2(wallT2, 2.0, -22.3, -12.4);  // Tramo inferior desde Z=-13.4 hasta Z=-11.4

  // Muro divisorio horizontal entre Bodega 29 (sup) y Pasillo Inferior (inf) en Z = -18.0 (X: -38.3 a -22.3)
  // Con vano/puerta centrado en su muro inferior (X entre -31.5 y -29.1)
  addWall2(6.8, wallT2, -34.9, -18.0);  // Tramo izquierdo (X: -38.3 a -31.5)
  addWall2(6.8, wallT2, -25.7, -18.0);  // Tramo derecho (X: -29.1 a -22.3)

  // 1) ÁREA PRINCIPAL SUPERIOR IZQUIERDA (~65% ancho x ~72% prof): 'Bodega 29'
  // X: -38.3 a -22.3 (centro -30.3, ancho 16.0m), Z: -35.0 a -18.0 (centro -26.5, prof 17.0m)
  const hitB29 = new THREE.Mesh(
    new THREE.BoxGeometry(15.6, wallH2, 16.6),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.14 })
  );
  hitB29.position.set(-30.3, floorY + wallH2 / 2, -26.5);
  hitB29.userData = {
    type: 'Bodega · 2° Piso',
    badgeColor: 'bg-cyan-500/20 text-cyan-300',
    title: 'Bodega 29 (Segundo Piso)',
    desc: 'Recinto principal de almacenamiento en el segundo nivel, ubicado directamente arriba de Bodega 70. Cuenta con acceso por puerta inferior hacia el pasillo y comunicación con Oficina.',
    meta: [
      { label: 'Nivel', value: '2° Piso (Y = 4.8m)' },
      { label: 'Ubicación', value: 'Arriba de Bodega 70' },
      { label: 'Dimensiones', value: '16.0m x 17.0m' },
      { label: 'Acceso', value: 'Puerta Sur (Pasillo)' }
    ]
  };
  layers.floor2.add(hitB29);
  walkHiddenMaterials.push(hitB29.material);
  interactiveObjects.push(hitB29);

  addFloorLabel(
    'Bodega 29',
    -30.3,
    -26.5,
    2.3,
    {
      bgColor: 'rgba(15, 23, 42, 0.94)',
      textColor: '#38bdf8',
      borderColor: '#0284c7',
      fontSize: 48
    },
    layers.floor2,
    0,
    floorY + 0.18
  );

  // 2) PASILLO / ANTESALA INFERIOR (~65% ancho x ~28% prof) debajo de Bodega 29
  // X: -38.3 a -22.3, Z: -18.0 a -11.4
  // Extintor en la esquina superior derecha de ese pasillo (junto al muro de Bodega 29 y la división con Oficina)
  createExtinguisher(-23.6, -16.8, false, '2° Piso · Esquina superior derecha del pasillo bajo Bodega 29 (junto a Oficina)', floorY, layers.floor2);

  // 3) ÁREA DERECHA COMPLETA (~35% ancho x 100% prof): 'Oficina'
  // X: -22.3 a -13.7 (centro -18.0, ancho 8.6m), Z: -35.0 a -11.4 (centro -23.2, prof 23.6m)
  officeFloorMaterial = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    transparent: true,
    opacity: 0.55,
    roughness: 0.35
  });
  const officeFloor = new THREE.Mesh(
    new THREE.BoxGeometry(8.4, 0.05, 23.3),
    officeFloorMaterial
  );
  officeFloor.position.set(-18.0, floorY + 0.03, -23.2);
  layers.floor2.add(officeFloor);

  // Mobiliario ejecutivo sutil dentro de Oficina (2 estaciones de trabajo y mesa de reuniones)
  const deskMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.55 });
  const chairMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
  const monitorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });

  const addWorkstation = (wx, wz) => {
    const desk = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 1.0), deskMat);
    desk.position.set(wx, floorY + 0.76, wz);
    layers.floor2.add(desk);
    addCollider(wx, wz + 0.17, 2.2, 1.35, floorY, floorY + 1.1, layers.floor2);

    // Patas escritorio
    [-0.95, 0.95].forEach(lx => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.74, 0.85), chairMat);
      leg.position.set(wx + lx, floorY + 0.37, wz);
      layers.floor2.add(leg);
    });

    // Monitor
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.45, 0.06), monitorMat);
    screen.position.set(wx, floorY + 1.05, wz - 0.25);
    layers.floor2.add(screen);

    // Silla ejecutiva
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.55), chairMat);
    seat.position.set(wx, floorY + 0.46, wz + 0.55);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.08), chairMat);
    back.position.set(wx, floorY + 0.78, wz + 0.8);
    layers.floor2.add(seat, back);
  };

  addWorkstation(-17.8, -30.5);
  addWorkstation(-17.8, -26.5);
  addWorkstation(-17.8, -16.2);

  const hitOficina = new THREE.Mesh(
    new THREE.BoxGeometry(8.2, wallH2, 23.2),
    new THREE.MeshStandardMaterial({ color: 0xa855f7, transparent: true, opacity: 0.14 })
  );
  hitOficina.position.set(-18.0, floorY + wallH2 / 2, -23.2);
  hitOficina.userData = {
    type: 'Área Administrativa · 2° Piso',
    badgeColor: 'bg-purple-500/20 text-purple-300',
    title: 'Oficina (Segundo Piso)',
    desc: 'Área administrativa y de control operativo en el ala derecha del segundo piso (arriba de Bodega 70), comunicada mediante puerta con el pasillo de Bodega 29.',
    meta: [
      { label: 'Nivel', value: '2° Piso (Y = 4.8m)' },
      { label: 'Sector', value: 'Ala Derecha (35% ancho)' },
      { label: 'Dimensiones', value: '8.6m x 23.6m' },
      { label: 'Acceso', value: 'Puerta Pasillo Bodega 29' }
    ]
  };
  layers.floor2.add(hitOficina);
  walkHiddenMaterials.push(hitOficina.material);
  interactiveObjects.push(hitOficina);

  addFloorLabel(
    'Oficina',
    -18.0,
    -22.2,
    2.1,
    {
      bgColor: 'rgba(15, 23, 42, 0.94)',
      textColor: '#e9d5ff',
      borderColor: '#a855f7',
      fontSize: 46
    },
    layers.floor2,
    0,
    floorY + 0.18
  );
}

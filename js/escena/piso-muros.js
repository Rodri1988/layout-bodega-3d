// Piso y muros perimetrales

/**
 * Construye el suelo industrial de concreto, muros perimetrales y demarcaciones
 */
function buildFloorAndPerimeter() {
  const W = 124;
  const D = 72;

  // Suelo principal de concreto pulido industrial
  const floorGeo = buildFloorGeometry(W, D);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xaeb4b8,
    roughness: 0.78,
    metalness: 0.08
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Cuadrícula sutil de juntas de dilatación del concreto (sin cruzar el foso)
  scene.add(buildGrid(W, D));

  // Muros perimetrales (Norte/Superior, Oeste/Izquierda, Este/Derecha, Sur/Inferior con Portón Entrada)
  const wallH = 8.5;
  const wallT = 0.6;

  const createWall = (w, h, d, x, y, z, mat = materials.wallConcrete) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    addCollider(x, z, w, d, y - h / 2, y + h / 2, null);
    return mesh;
  };

  // Muro Superior (Z = -36)
  createWall(W, wallH, wallT, 0, wallH / 2, -D / 2);
  // Muro Izquierdo (X = -62)
  createWall(wallT, wallH, D, -W / 2, wallH / 2, 0);
  // Muro Derecho (X = +62)
  createWall(wallT, wallH, D, W / 2, wallH / 2, 0);

  // Muro Inferior (Z = +36) dividido para dejar abierto el Portón Entrada (X entre -27 y -14)
  // Tramo izquierdo (-62 a -27 -> ancho 35, centro -44.5)
  createWall(35, wallH, wallT, -44.5, wallH / 2, D / 2);
  // Tramo derecho (-14 a +62 -> ancho 76, centro +24)
  createWall(76, wallH, wallT, 24, wallH / 2, D / 2);

  // Estructura del Portón Entrada (X = -20.5, Z = 36, ancho 13m)
  const gateFrameMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 });
  const gateDoorMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5, roughness: 0.5 });

  // Dintel superior del portón
  createWall(13.4, 2.2, 0.8, -20.5, wallH - 1.1, D / 2, gateFrameMat);
  // Cortina metálica enrollable semi-abierta
  createWall(12.6, 1.4, 0.3, -20.5, wallH - 2.6, D / 2, gateDoorMat);

  // Límite invisible en el vano del portón (para no salir de la nave caminando)
  addCollider(-20.5, D / 2, 13.2, wallT, 0, 3, null);

  // Etiqueta "Porton Entrada"
  addFloorLabel(
    'Portón Entrada',
    -22.0,
    32.6,
    1.5,
    {
      bgColor: 'rgba(30, 41, 59, 0.92)',
      textColor: '#ffffff',
      borderColor: '#f59e0b',
      fontSize: 40
    },
    layers.zones,
    0,
    -1.1
  );
}

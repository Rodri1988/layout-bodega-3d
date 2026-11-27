// Rótulos de pasillos, medidas y extintores

/**
 * Construye las etiquetas de Pasillos (21 al 28) y las demarcaciones de cotas en el piso
 */
function buildAislesAndMeasurements() {
  const aisles = [
    { name: 'Pasillo 21', x: -57.0, z: -2.0, rot: Math.PI / 2 },
    { name: 'Pasillo 22', x: -48.0, z: -2.0, rot: Math.PI / 2 },
    { name: 'Pasillo 23', x: -39.5, z: -2.0, rot: Math.PI / 2 },
    { name: 'Pasillo 24', x: -29.2, z: 24.0, rot: Math.PI / 2 },
    { name: 'Pasillo 25', x: -11.5, z: -2.0, rot: Math.PI / 2 },
    { name: 'Pasillo 26', x: -2.3,  z: -2.0, rot: Math.PI / 2 },
    { name: 'Pasillo 27', x: 7.4,   z: -2.0, rot: Math.PI / 2 },
    { name: 'Pasillo 28', x: 16.8,  z: -2.0, rot: Math.PI / 2 }
  ];

  aisles.forEach(a => {
    addFloorLabel(
      a.name,
      a.x,
      a.z,
      1.45,
      {
        bgColor: 'rgba(15, 23, 42, 0.88)',
        textColor: '#f8fafc',
        borderColor: '#475569',
        fontSize: 38
      },
      layers.aisles,
      a.rot,
      0.08
    );
  });

  // Cotas métricas demarcadas en el piso según plano (27 mts, 15 mts, 25 mts)
  const measurements = [
    { label: '27 mts', x: -38.2, z: 12.6, width: 10.5 },
    { label: '15 mts', x: -25.8, z: 19.8, width: 7.5 },
    { label: '25 mts', x: -2.3,  z: 12.6, width: 18.0 }
  ];

  measurements.forEach(m => {
    // Línea de cota amarilla en piso
    const lineMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(m.width, 0.25),
      new THREE.MeshBasicMaterial({ color: 0xfacc15 })
    );
    lineMesh.rotation.x = -Math.PI / 2;
    lineMesh.position.set(m.x, 0.04, m.z);
    layers.aisles.add(lineMesh);

    addFloorLabel(
      m.label,
      m.x,
      m.z,
      1.35,
      {
        bgColor: 'rgba(255, 255, 255, 0.95)',
        textColor: '#dc2626',
        borderColor: '#ef4444',
        fontSize: 36
      },
      layers.aisles,
      0,
      0.1
    );
  });
}

/**
 * Coloca todos los Extintores 3D individuales y dobles según el plano de la nave principal
 */
function buildFireExtinguishers() {
  // Extintores Individuales (Nave Principal)
  const singles = [
    { x: -55.5, z: -33.5, note: 'Esquina Superior Izquierda (Norte Pasillo 21)' },
    { x: -20.6, z: -3.5,  note: 'Junto a Pilar Central bajo Bodega 70' },
    { x: -30.5, z: 0.5,   note: 'Área Abierta bajo Bodega 70 / Pasillo 23' },
    { x: -43.5, z: 11.2,  note: 'Frente a Módulo 9 (Pasillo 22)' },
    { x: -2.3,  z: -33.5, note: 'Cabecera Superior Pasillo 26' },
    { x: 7.4,   z: -33.5, note: 'Cabecera Superior Pasillo 27' },
    { x: 17.2,  z: -33.5, note: 'Cabecera Superior Pasillo 28' },
    { x: -7.2,  z: 11.2,  note: 'Frente a Módulo 7 (Pasillo 25)' },
    { x: 12.2,  z: 11.2,  note: 'Frente a Módulo 7 (Pasillo 27)' },
    { x: -10.5, z: 34.2,  note: 'Extremo Inferior Módulo 1 (Pasillo 25)' },
    { x: 9.2,   z: 34.2,  note: 'Extremo Inferior Módulo 1 (Pasillo 27)' }
  ];

  singles.forEach(s => createExtinguisher(s.x, s.z, false, s.note));

  // Extintores Dobles / Carros Extintores
  const doubles = [
    { x: -11.8, z: -33.0, note: 'Cabecera Superior Pasillo 25 (Estación Doble)' },
    { x: -57.5, z: 34.0,  note: 'Extremo Inferior Izquierdo junto a Módulo 2' },
    { x: -47.8, z: 34.0,  note: 'Extremo Inferior Pasillo 22 junto a Módulo 1' },
    { x: -3.0,  z: 34.0,  note: 'Extremo Inferior Pasillo 26 junto a Módulo 2' },
    { x: -0.6,  z: 34.0,  note: 'Extremo Inferior Pasillo 26 junto a Módulo 1' }
  ];

  doubles.forEach(d => createExtinguisher(d.x, d.z, true, d.note));
}

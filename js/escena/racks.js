// Posición de los racks y pasillos

/**
 * Construye todas las columnas de Racks exactamente según el plano 2D
 */
function buildAllRacks() {
  const modDepth = 4.0; // Profundidad Z de cada módulo
  const modWidth = 2.6; // Ancho X de cada columna simple

  // Coordenadas Z para los 9 niveles superiores (de abajo hacia arriba en Z negativo):
  // Módulos: 7-8 (z=8.5), 9-10 (z=4.5), 11-12 (z=0.5), 13-14 (z=-3.5), 15-16 (z=-7.5),
  //          17-18 (z=-11.5), 19-20 (z=-15.5), 21-22 (z=-19.5), 23-24 (z=-23.5)
  const zUpperBase = 8.5;
  const getUpperZ = (idxFrom7) => zUpperBase - idxFrom7 * modDepth;

  // Coordenadas Z para los 4 niveles inferiores (de abajo hacia arriba):
  // Módulos: 1-2 (z=33.0), 3-4 (z=29.0), 5-6 (z=25.0), 7-8 (z=21.0)
  const zLowerBase = 33.0;
  const getLowerZ = (idxFrom1) => zLowerBase - idxFrom1 * modDepth;

  // 1. BORDE IZQUIERDO (X = -60.2, Pasillo 21 a su derecha)
  // Sección superior: pares 8, 10, 12, 14, 16, 18, 20
  [8, 10, 12, 14, 16, 18, 20].forEach((num, idx) => {
    createRackModule({
      num,
      x: -60.2,
      z: getUpperZ(idx),
      width: modWidth,
      depth: modDepth,
      aisleName: 'Pasillo 21',
      columnDesc: 'Columna Perimetral Oeste (Superior)'
    });
  });
  // Sección inferior: pares 2, 4, 6
  [2, 4, 6].forEach((num, idx) => {
    createRackModule({
      num,
      x: -60.2,
      z: getLowerZ(idx),
      width: modWidth,
      depth: modDepth,
      aisleName: 'Pasillo 21',
      columnDesc: 'Columna Perimetral Oeste (Inferior)'
    });
  });

  // 2. SEGUNDA COLUMNA DE RACKS (Entre Pasillo 21 y Pasillo 22, solo sección inferior)
  // Doble columna: izquierda impares (1,3,5,7) en X = -53.8, derecha pares (2,4,6,8) en X = -51.1
  [1, 3, 5, 7].forEach((num, idx) => {
    createRackModule({
      num,
      x: -53.8,
      z: getLowerZ(idx),
      width: modWidth,
      depth: modDepth,
      aisleName: 'Pasillo 21',
      columnDesc: 'Bloque 2 · Cara Oeste'
    });
    createRackModule({
      num: num + 1,
      x: -51.1,
      z: getLowerZ(idx),
      width: modWidth,
      depth: modDepth,
      aisleName: 'Pasillo 22',
      columnDesc: 'Bloque 2 · Cara Este'
    });
  });

  // 3. TERCERA COLUMNA DE RACKS (Entre Pasillo 22 y Pasillo 23)
  // Sección superior: 9-10 hasta 23-24 (idx 1 a 8) -> X = -44.7 (impares) y X = -42.0 (pares)
  [9, 11, 13, 15, 17, 19, 21, 23].forEach((num, idx) => {
    const zPos = getUpperZ(idx + 1);
    createRackModule({
      num,
      x: -44.7,
      z: zPos,
      width: modWidth,
      depth: modDepth,
      aisleName: 'Pasillo 22',
      columnDesc: 'Bloque 3 Superior · Cara Oeste'
    });
    createRackModule({
      num: num + 1,
      x: -42.0,
      z: zPos,
      width: modWidth,
      depth: modDepth,
      aisleName: 'Pasillo 23',
      columnDesc: 'Bloque 3 Superior · Cara Este'
    });
  });
  // Sección inferior: 1-2 hasta 7-8
  [1, 3, 5, 7].forEach((num, idx) => {
    const zPos = getLowerZ(idx);
    createRackModule({
      num,
      x: -44.7,
      z: zPos,
      width: modWidth,
      depth: modDepth,
      aisleName: 'Pasillo 22',
      columnDesc: 'Bloque 3 Inferior · Cara Oeste'
    });
    createRackModule({
      num: num + 1,
      x: -42.0,
      z: zPos,
      width: modWidth,
      depth: modDepth,
      aisleName: 'Pasillo 23',
      columnDesc: 'Bloque 3 Inferior · Cara Este'
    });
  });

  // 4. CUARTA COLUMNA DE RACKS (A la derecha de Pasillo 23, solo sección inferior)
  // Doble columna: 1-2 hasta 7-8 -> X = -35.6 (impares) y X = -32.9 (pares)
  [1, 3, 5, 7].forEach((num, idx) => {
    const zPos = getLowerZ(idx);
    createRackModule({
      num,
      x: -35.6,
      z: zPos,
      width: modWidth,
      depth: modDepth,
      aisleName: 'Pasillo 23',
      columnDesc: 'Bloque 4 Inferior · Cara Oeste'
    });
    createRackModule({
      num: num + 1,
      x: -32.9,
      z: zPos,
      width: modWidth,
      depth: modDepth,
      aisleName: 'Pasillo 24 / Acceso',
      columnDesc: 'Bloque 4 Inferior · Cara Este'
    });
  });

  // Helper para las 3 grandes columnas centrales (Columnas 5, 6 y 7)
  const buildCentralDoubleColumn = (xLeft, xRight, aisleLeft, aisleRight, blockLabel) => {
    // Sección superior: 7-8 hasta 23-24 (9 niveles, idx 0 a 8)
    [7, 9, 11, 13, 15, 17, 19, 21, 23].forEach((num, idx) => {
      const zPos = getUpperZ(idx);
      createRackModule({
        num,
        x: xLeft,
        z: zPos,
        width: modWidth,
        depth: modDepth,
        aisleName: aisleLeft,
        columnDesc: `${blockLabel} Superior · Cara Oeste`
      });
      createRackModule({
        num: num + 1,
        x: xRight,
        z: zPos,
        width: modWidth,
        depth: modDepth,
        aisleName: aisleRight,
        columnDesc: `${blockLabel} Superior · Cara Este`
      });
    });

    // Sección inferior: 1-2, 3-4, 5-6 (3 niveles, idx 0 a 2)
    [1, 3, 5].forEach((num, idx) => {
      const zPos = getLowerZ(idx);
      createRackModule({
        num,
        x: xLeft,
        z: zPos,
        width: modWidth,
        depth: modDepth,
        aisleName: aisleLeft,
        columnDesc: `${blockLabel} Inferior · Cara Oeste`
      });
      createRackModule({
        num: num + 1,
        x: xRight,
        z: zPos,
        width: modWidth,
        depth: modDepth,
        aisleName: aisleRight,
        columnDesc: `${blockLabel} Inferior · Cara Este`
      });
    });
  };

  // 7. QUINTA COLUMNA DE RACKS (Entre Pasillo 25 y Pasillo 26)
  buildCentralDoubleColumn(-8.5, -5.8, 'Pasillo 25', 'Pasillo 26', 'Bloque Central 1');

  // 8. SEXTA COLUMNA DE RACKS (Entre Pasillo 26 y Pasillo 27)
  buildCentralDoubleColumn(1.2, 3.9, 'Pasillo 26', 'Pasillo 27', 'Bloque Central 2');

  // 9. SÉPTIMA COLUMNA DE RACKS (Entre Pasillo 27 y Pasillo 28)
  buildCentralDoubleColumn(10.9, 13.6, 'Pasillo 27', 'Pasillo 28', 'Bloque Central 3');

  // 10. OCTAVA COLUMNA DE RACKS (A la derecha de Pasillo 28, pegada a BEEXX)
  // Columna simple con módulos impares 7, 9, 11, 13, 15, 17, 19, 21, 23
  [7, 9, 11, 13, 15, 17, 19, 21, 23].forEach((num, idx) => {
    createRackModule({
      num,
      x: 19.8,
      z: getUpperZ(idx),
      width: modWidth,
      depth: modDepth,
      aisleName: 'Pasillo 28',
      columnDesc: 'Columna Simple junto a BEEXX'
    });
  });
}

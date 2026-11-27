// Baño, losa superior, pilares y pared del fondo (según fotos; medidas aproximadas)

function buildSectorBano() {
  const L = layers.zones;
  const ORANGE = 0xf5a623, WHITE = 0xf1efe8, GREY = 0x6b7280, DARK = 0x111827;
  // El baño queda al este del Pasillo 27, en la sección del frente. Su puerta mira al cruce (norte).
  const x0 = 12.35, x1 = 21.05, z0 = 23.2, z1 = 29.2;
  const zc = (z0 + z1) / 2, face = z0 + 0.35;

  // Recinto del baño (la parte oeste queda abierta, con los útiles de aseo)
  box(L, 5.6, 3.0, z1 - face - 0.4, 18.0, 1.5, (face + z1 - 0.4) / 2, WHITE);
  box(L, 1.15, 2.35, 0.08, 16.4, 1.18, face - 0.03, 0xe8821e);          // puerta naranja
  box(L, 0.07, 0.07, 0.1, 15.98, 1.15, face - 0.09, 0xd1d5db);          // manilla
  box(L, 0.26, 0.4, 0.04, 16.4, 1.7, face - 0.09, 0xffffff);

  // Casilleros
  box(L, 2.0, 2.0, 0.5, 19.1, 1.05, face - 0.28, 0x6f716c);
  for (let c = 0; c < 5; c++) for (let f = 0; f < 4; f++)
    box(L, 0.34, 0.43, 0.04, 18.34 + c * 0.38, 0.35 + f * 0.47, face - 0.55, 0xc9c8bf);

  // Útiles de aseo: balde amarillo y traperos
  box(L, 0.55, 0.55, 0.45, 14.2, 0.38, face + 0.1, 0xfacc15);
  box(L, 0.3, 0.32, 0.3, 14.8, 0.17, face - 0.2, 0xa3e635);
  [13.5, 13.9, 14.45, 14.9].forEach((x, i) =>
    bar(L, [x, 0.1, face + 0.25], [x + (i - 1.5) * 0.18, 1.8, face + 0.7], 0.05, i % 2 ? GREY : 0x92613a));

  // Losa superior de hormigón
  box(L, x1 - x0, 0.55, z1 - z0, (x0 + x1) / 2, 3.28, zc, 0xdedbd2);
  // Pilar de esquina y pilastras naranjas
  box(L, 0.55, 3.0, 0.55, x0 + 0.35, 1.5, z0 + 0.3, ORANGE);
  [z0 + 0.3, z1 - 0.4].forEach(z => box(L, 0.4, 7.6, 0.55, x1 - 0.22, 3.8, z, ORANGE));
  box(L, 0.42, 0.42, 0.05, x0 + 0.35, 2.6, z0 + 0.01, 0x15803d);        // señal verde del pilar

  // Material sobre la losa: pallets embalados y muebles morados
  const onSlab = (w, h, d, x, z, color) => box(L, w, h, d, x, 3.56 + h / 2, z, color);
  onSlab(2.0, 1.5, 1.2, 19.3, 25.0, 0xb98d5a);
  onSlab(2.1, 0.22, 1.25, 19.3, 25.0, 0xcbd5e1).position.y = 5.18;
  onSlab(1.7, 0.55, 0.9, 17.0, 24.8, 0x8b5cf6);
  onSlab(1.7, 0.75, 0.15, 17.0, 25.3, 0x7c3aed);
  onSlab(1.2, 1.45, 0.9, 15.2, 25.9, 0x8b5cf6);
  onSlab(0.8, 1.9, 0.8, 18.2, 27.6, 0x9ca3af);
  onSlab(1.1, 2.6, 1.0, 13.2, 24.2, 0x6b5844);

  addCollider((x0 + x1) / 2, zc, x1 - x0, z1 - z0, 0, 3.6, L);

  // Franjas peatonales frente al baño
  for (let x = 13.4; x <= 20.6; x += 1.15) box(L, 0.55, 0.02, 1.0, x, 0.03, 22.35, 0xffffff);
  // Pilar naranja con base negra y franjas amarillas, al otro lado del Pasillo 27
  box(L, 0.7, 7.6, 0.7, 4.9, 3.8, 22.1, ORANGE);
  box(L, 0.84, 0.8, 0.84, 4.9, 0.4, 22.1, DARK);
  [0.55, 0.68].forEach(y => box(L, 0.86, 0.05, 0.86, 4.9, y, 22.1, 0xfacc15));
  addCollider(4.9, 22.1, 0.84, 0.84, 0, 7.6, L);

  // Pared sur frente al Pasillo 27: ventana de bloques de vidrio y ventana pequeña
  const zWall = 35.62;
  for (let c = 0; c < 9; c++) for (let f = 0; f < 6; f++)
    box(L, 0.34, 0.34, 0.1, 6.3 + c * 0.38, 5.4 + f * 0.38, zWall, 0xcfe8f3, { emissive: 0x334a55, roughness: 0.2 });
  box(L, 2.4, 1.2, 0.08, 9.4, 2.4, zWall, 0x9ca3af);
  [-0.75, 0, 0.75].forEach(dx => box(L, 0.68, 1.04, 0.1, 9.4 + dx, 2.4, zWall - 0.02, 0xbfe3f5, { emissive: 0x334a55 }));

  addFloorLabel('Baño', 16.4, 21.0, 1.2,
    { bgColor: 'rgba(15, 23, 42, 0.9)', textColor: '#fdba74', borderColor: '#f97316', fontSize: 40 }, layers.zones);
}

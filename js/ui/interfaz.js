// Botones, vistas, selección y ficha del elemento

/**
 * Controla transición suave hacia un preset de cámara
 */
function flyToPreset(presetKey) {
  const preset = cameraPresets[presetKey];
  if (!preset) return;
  if (walk.active) exitWalk(false);

  cameraAnim.active = true;
  cameraAnim.startPos.copy(camera.position);
  cameraAnim.endPos.copy(preset.pos);
  cameraAnim.startTarget.copy(controls.target);
  cameraAnim.endTarget.copy(preset.target);
  cameraAnim.progress = 0;

  // Actualizar estado visual de botones inferiores
  document.querySelectorAll('.view-btn').forEach(btn => {
    if (btn.dataset.view === presetKey) {
      btn.classList.add('bg-orange-500', 'text-white', 'shadow-md', 'font-semibold');
      btn.classList.remove('text-slate-300', 'hover:bg-slate-800', 'font-medium');
    } else {
      btn.classList.remove('bg-orange-500', 'text-white', 'shadow-md', 'font-semibold');
      btn.classList.add('text-slate-300', 'hover:bg-slate-800', 'font-medium');
    }
  });
}

/**
 * Configura interacciones de la interfaz (botones, checkboxes, selector, inspector)
 */
function setupUIEvents() {
  // Botones inferiores de vistas rápidas
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      flyToPreset(btn.dataset.view);
    });
  });

  // Selector desplegable superior
  const selector = document.getElementById('location-selector');
  selector.addEventListener('change', (e) => {
    flyToPreset(e.target.value);
  });

  // Toggle barra lateral
  const sidebar = document.getElementById('control-sidebar');
  const openBtn = document.getElementById('open-sidebar-btn');
  const toggleSidebar = () => {
    const isHidden = sidebar.classList.toggle('hidden');
    openBtn.classList.toggle('hidden', !isHidden);
  };
  ['toggle-sidebar-btn', 'open-sidebar-btn', 'minimize-sidebar-btn'].forEach(id =>
    document.getElementById(id).addEventListener('click', toggleSidebar));

  // Checkboxes de capas
  const bindLayer = (checkboxId, layerKey) => {
    document.getElementById(checkboxId).addEventListener('change', (e) => {
      layers[layerKey].visible = e.target.checked;
    });
  };

  bindLayer('layer-racks', 'racks');
  bindLayer('layer-bodega70', 'bodega70');
  bindLayer('layer-modules', 'modules');
  bindLayer('layer-aisles', 'aisles');
  bindLayer('layer-fire', 'fire');
  bindLayer('layer-zones', 'zones');
  bindLayer('layer-floor2', 'floor2');

  // Alternar transparencia de la losa del 2° Piso para ver los racks 6-70 de Bodega 70 debajo
  document.getElementById('toggle-xray-floor2').addEventListener('click', () => {
    isMezzanineTransparent = !isMezzanineTransparent;
    if (mezzanineSlabMaterial) {
      mezzanineSlabMaterial.opacity = isMezzanineTransparent ? 0.42 : 0.96;
    }
    if (officeFloorMaterial) {
      officeFloorMaterial.opacity = isMezzanineTransparent ? 0.55 : 0.98;
    }
    document.getElementById('xray-status').textContent = isMezzanineTransparent ? 'Activo' : 'Sólido';
  });

  // Cerrar tarjeta de inspección
  document.getElementById('close-inspector').addEventListener('click', () => {
    document.getElementById('inspector-card').classList.add('hidden');
    clearSelectionHighlight();
  });
}

let pointerDownPos = { x: 0, y: 0 };
function onPointerDown(e) {
  pointerDownPos = { x: e.clientX, y: e.clientY };
  // Si el usuario empieza a mover manualmente, cancelar animación automática
  cameraAnim.active = false;
}

function onPointerUp(e) {
  if (walk.active) return; // En recorrido, los clics los maneja el modo caminata
  const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
  if (dist > 5) return; // Fue un arrastre de cámara, no un clic de selección

  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(interactiveObjects, false);

  if (intersects.length > 0) {
    const hit = intersects[0].object;
    if (hit.userData && hit.userData.title) {
      showInspector(hit);
    }
  }
}

function clearSelectionHighlight() {
  if (selectedObject && selectedObject.material) {
    if (selectedObject.userData.type === 'Módulo de Rack') {
      selectedObject.material.opacity = 0.0;
    }
  }
  selectedObject = null;
}

function showInspector(obj) {
  clearSelectionHighlight();
  selectedObject = obj;

  if (obj.userData.type === 'Módulo de Rack') {
    obj.material.color.setHex(0xf97316);
    obj.material.opacity = 0.28;
  }

  const data = obj.userData;
  const card = document.getElementById('inspector-card');
  const badge = document.getElementById('insp-badge');
  const title = document.getElementById('insp-title');
  const desc = document.getElementById('insp-desc');
  const meta = document.getElementById('insp-meta');

  badge.className = `text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${data.badgeColor || 'bg-orange-500/20 text-orange-300'}`;
  badge.textContent = data.type;
  title.textContent = data.title;
  desc.textContent = data.desc;

  meta.innerHTML = (data.meta || []).map(item => `
    <div class="bg-slate-800/70 rounded-lg px-2.5 py-1.5">
      <div class="text-[10px] text-slate-400">${item.label}</div>
      <div class="font-semibold text-slate-100 truncate">${item.value}</div>
    </div>
  `).join('');

  card.classList.remove('hidden');
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

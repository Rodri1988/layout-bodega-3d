// Teclado, joystick y actualización por cuadro

// ---------- Ciclo por cuadro ----------
function updateWalk(dt) {
  const k = walk.keys;
  let fwd = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0) - walk.joy.y;
  let side = (k.KeyD ? 1 : 0) - (k.KeyA ? 1 : 0) + walk.joy.x;
  const turn = (k.ArrowLeft ? 1 : 0) - (k.ArrowRight ? 1 : 0);
  if (walk.tour && (fwd || side || turn)) stopTour();

  if (walk.tour) {
    updateTour(dt);
  } else {
    walk.yaw += turn * 1.9 * dt;
    const len = Math.hypot(fwd, side);
    if (len > 0.01) {
      if (len > 1) { fwd /= len; side /= len; }
      const speed = (k.ShiftLeft || k.ShiftRight ? 9 : 4.2) * dt;
      const sin = Math.sin(walk.yaw), cos = Math.cos(walk.yaw);
      tryMove((-sin * fwd + cos * side) * speed, (-cos * fwd - sin * side) * speed);
    }
  }

  camera.position.set(walk.x, walk.y + EYE, walk.z);
  camera.rotation.set(walk.pitch, walk.yaw, 0);

  walk.hudTimer += dt;
  if (walk.hudTimer > 0.1) {
    walk.hudTimer = 0;
    document.getElementById('walk-place').textContent = placeName();
    document.getElementById('walk-sub').textContent = walk.y > FLOOR2_Y / 2 ? '2° Piso' : '1° Piso';
    camera.updateMatrixWorld();
    const hit = pickAt(0, 0);
    document.getElementById('walk-aim').textContent = hit ? hit.object.userData.title : '';
    drawMap();
  }
}

function setupWalkMode() {
  scene.add(walkOnly);
  buildAisleSigns();

  document.getElementById('walk-btn').addEventListener('click', enterWalk);
  document.getElementById('walk-exit').addEventListener('click', () => exitWalk());
  document.getElementById('walk-tour').addEventListener('click', (e) => {
    walk.tour ? stopTour() : startTour();
    e.currentTarget.blur();
  });
  document.getElementById('walk-map').addEventListener('pointerdown', onMapClick);

  const goto = document.getElementById('walk-goto');
  goto.innerHTML = '<option value="">📍 Ir a...</option>' +
    walkSpots.map((s, i) => `<option value="${i}">${s[0]}</option>`).join('');
  goto.addEventListener('change', () => {
    if (goto.value !== '') {
      const [, x, y, z, yaw] = walkSpots[goto.value];
      teleport(x, y, z, yaw);
    }
    goto.value = '';
    goto.blur(); // para que las flechas vuelvan a mover al caminante
  });

  // Teclado
  const moveKeys = ['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'];
  window.addEventListener('keydown', e => {
    if (!walk.active) return;
    if (e.code === 'Escape') { exitWalk(); return; }
    if (e.code === 'KeyE') { const h = pickAt(0, 0); if (h) showInspector(h.object); return; }
    if (moveKeys.includes(e.code)) { walk.keys[e.code] = true; e.preventDefault(); }
  });
  window.addEventListener('keyup', e => { walk.keys[e.code] = false; });
  window.addEventListener('blur', () => { walk.keys = {}; });

  // Mirar arrastrando (mouse o dedo)
  const el = renderer.domElement;
  let look = null;
  el.addEventListener('pointerdown', e => {
    if (!walk.active || look) return;
    look = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0 };
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove', e => {
    if (!walk.active || !look || e.pointerId !== look.id) return;
    const dx = e.clientX - look.x, dy = e.clientY - look.y;
    look.x = e.clientX; look.y = e.clientY;
    look.moved += Math.abs(dx) + Math.abs(dy);
    walk.yaw += dx * 0.0045;
    walk.pitch = Math.max(-1.2, Math.min(1.2, walk.pitch + dy * 0.0045));
  });
  const endLook = e => {
    if (!look || e.pointerId !== look.id) return;
    if (walk.active && e.type === 'pointerup' && look.moved < 6) {
      const h = pickAt(e.clientX / window.innerWidth * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      if (h) showInspector(h.object);
    }
    look = null;
  };
  el.addEventListener('pointerup', endLook);
  el.addEventListener('pointercancel', endLook);

  // Joystick táctil
  const joy = document.getElementById('walk-joy');
  const knob = document.getElementById('walk-knob');
  let joyId = null;
  const moveJoy = e => {
    const r = joy.getBoundingClientRect();
    let dx = (e.clientX - r.left - r.width / 2) / 45, dy = (e.clientY - r.top - r.height / 2) / 45;
    const len = Math.hypot(dx, dy);
    if (len > 1) { dx /= len; dy /= len; }
    walk.joy = { x: dx, y: dy };
    knob.style.transform = `translate(${dx * 36}px, ${dy * 36}px)`;
  };
  joy.addEventListener('pointerdown', e => { joyId = e.pointerId; joy.setPointerCapture(joyId); moveJoy(e); });
  joy.addEventListener('pointermove', e => { if (e.pointerId === joyId) moveJoy(e); });
  const endJoy = e => {
    if (e.pointerId !== joyId) return;
    joyId = null; walk.joy = { x: 0, y: 0 }; knob.style.transform = '';
  };
  joy.addEventListener('pointerup', endJoy);
  joy.addEventListener('pointercancel', endJoy);
}

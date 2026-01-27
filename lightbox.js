// Lightbox mit Zoom und Navigation
(function() {
  // Modal und Buttons dynamisch einfügen, falls nicht vorhanden
  if (!document.getElementById('lightbox-modal')) {
    const modal = document.createElement('div');
    modal.id = 'lightbox-modal';
    modal.style.display = 'none';
    modal.style.position = 'fixed';
    modal.style.zIndex = '9999';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.85)';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.innerHTML = `
      <button class="lightbox-arrow left" id="lightbox-prev" title="Vorheriges Bild" style="display:none">&#8592;</button>
      <img id="lightbox-img" src="" alt="Großansicht" style="max-width:90vw;max-height:90vh;box-shadow:0 0 32px #000;border-radius:8px;transition:transform 0.2s;cursor:grab;">
      <button class="lightbox-arrow right" id="lightbox-next" title="Nächstes Bild" style="display:none">&#8594;</button>
    `;
    document.body.appendChild(modal);
    const style = document.createElement('style');
    style.textContent = `
      .lightbox-arrow { position: absolute; top: 50%; transform: translateY(-50%); font-size: 2.5rem; color: #fff; background: rgba(0,0,0,0.3); border: none; border-radius: 50%; width: 2.5rem; height: 2.5rem; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10000; user-select: none; }
      .lightbox-arrow.left { left: 2vw; }
      .lightbox-arrow.right { right: 2vw; }
    `;
    document.head.appendChild(style);
  }
  const imgs = Array.from(document.querySelectorAll('.image-left img'));
  let current = 0;
  let scale = 1;
  let startX = 0, startY = 0, lastX = 0, lastY = 0, dragging = false;

  function show(idx) {
    current = idx;
    const img = imgs[current];
    const lightbox = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    scale = 1; lastX = 0; lastY = 0;
    lightboxImg.style.transform = '';
    lightbox.style.display = 'flex';
    document.getElementById('lightbox-prev').style.display = (current > 0) ? '' : 'none';
    document.getElementById('lightbox-next').style.display = (current < imgs.length-1) ? '' : 'none';
  }

  imgs.forEach((img, i) => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', e => {
      show(i);
    });
  });

  document.getElementById('lightbox-modal').addEventListener('click', function(e) {
    if (e.target === this) {
      this.style.display = 'none';
      document.getElementById('lightbox-img').src = '';
    }
  });

  document.getElementById('lightbox-prev').onclick = e => {
    e.stopPropagation();
    if (current > 0) show(current-1);
  };
  document.getElementById('lightbox-next').onclick = e => {
    e.stopPropagation();
    if (current < imgs.length-1) show(current+1);
  };

  // Zoom per Mausrad
  document.getElementById('lightbox-img').addEventListener('wheel', function(e) {
    e.preventDefault();
    let delta = e.deltaY < 0 ? 0.1 : -0.1;
    scale = Math.max(1, Math.min(4, scale + delta));
    this.style.transform = `scale(${scale}) translate(${lastX}px,${lastY}px)`;
  });

  // Drag zum Verschieben bei Zoom
  document.getElementById('lightbox-img').addEventListener('mousedown', function(e) {
    if (scale === 1) return;
    dragging = true;
    startX = e.clientX - lastX;
    startY = e.clientY - lastY;
    this.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', function(e) {
    if (!dragging) return;
    lastX = e.clientX - startX;
    lastY = e.clientY - startY;
    document.getElementById('lightbox-img').style.transform = `scale(${scale}) translate(${lastX}px,${lastY}px)`;
  });
  window.addEventListener('mouseup', function() {
    dragging = false;
    document.getElementById('lightbox-img').style.cursor = 'grab';
  });

  // Touch-Zoom (Pinch) und Drag
  let pinchStartDist = 0, pinchStartScale = 1, pinchStartX = 0, pinchStartY = 0;
  document.getElementById('lightbox-img').addEventListener('touchstart', function(e) {
    if (e.touches.length === 2) {
      pinchStartDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartScale = scale;
    } else if (e.touches.length === 1 && scale > 1) {
      dragging = true;
      startX = e.touches[0].clientX - lastX;
      startY = e.touches[0].clientY - lastY;
    }
  });
  document.getElementById('lightbox-img').addEventListener('touchmove', function(e) {
    if (e.touches.length === 2) {
      let dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      scale = Math.max(1, Math.min(4, pinchStartScale * dist / pinchStartDist));
      this.style.transform = `scale(${scale}) translate(${lastX}px,${lastY}px)`;
    } else if (e.touches.length === 1 && dragging) {
      lastX = e.touches[0].clientX - startX;
      lastY = e.touches[0].clientY - startY;
      this.style.transform = `scale(${scale}) translate(${lastX}px,${lastY}px)`;
    }
  });
  document.getElementById('lightbox-img').addEventListener('touchend', function(e) {
    dragging = false;
  });

  // Keyboard navigation
  window.addEventListener('keydown', function(e) {
    if (document.getElementById('lightbox-modal').style.display !== 'flex') return;
    if (e.key === 'ArrowLeft' && current > 0) show(current-1);
    if (e.key === 'ArrowRight' && current < imgs.length-1) show(current+1);
    if (e.key === 'Escape') {
      document.getElementById('lightbox-modal').style.display = 'none';
      document.getElementById('lightbox-img').src = '';
    }
  });
})();

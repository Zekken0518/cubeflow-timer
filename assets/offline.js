(() => {
  const status = document.getElementById('offline-status');
  const show = (message) => { if (status) status.textContent = message; };
  if (!window.isSecureContext || !('serviceWorker' in navigator) || location.protocol === 'file:') {
    show('Offline setup requires HTTPS or localhost.');
    return;
  }
  window.addEventListener('load', async () => {
    show('Preparing offline access…');
    try {
      const registration = await navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' });
      const ready = () => show(navigator.onLine ? 'Available offline' : 'Offline · Ready to practice');
      const watch = (worker) => {
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'redundant' && !registration.active) {
            show('Offline setup incomplete. Reconnect and reload to retry.');
          }
        });
      };
      watch(registration.installing);
      registration.addEventListener('updatefound', () => watch(registration.installing));
      await navigator.serviceWorker.ready;
      ready();
      window.addEventListener('online', ready);
      window.addEventListener('offline', ready);
    } catch (error) {
      show('Offline setup unavailable. Reconnect and reload to retry.');
      console.warn('CubeFlow offline setup:', error);
    }
  });
})();

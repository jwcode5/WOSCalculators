  const forceUpdateBtn = document.getElementById('forceUpdateBtn');
  if (forceUpdateBtn) {
    forceUpdateBtn.addEventListener('click', async () => {
      forceUpdateBtn.textContent = 'Updating...';
      forceUpdateBtn.disabled = true;
      try {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (let reg of registrations) {
            await reg.unregister();
          }
        }
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          for (let name of cacheNames) {
            await caches.delete(name);
          }
        }
        window.location.href = window.location.pathname + '?v=' + new Date().getTime();
      } catch (e) {
        console.error(e);
        alert('Failed to update: ' + e.message);
        forceUpdateBtn.textContent = 'Update App';
        forceUpdateBtn.disabled = false;
      }
    });
  }

  document.querySelectorAll('.info-icon').forEach(function(el) {

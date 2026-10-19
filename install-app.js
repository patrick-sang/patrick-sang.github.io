(() => {
  const installButton = document.getElementById("installApp");
  const iosHelp = document.getElementById("iosInstallHelp");
  if (!installButton) return;

  let deferredPrompt = null;
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  if (isStandalone) {
    installButton.hidden = true;
    if (iosHelp) iosHelp.hidden = true;
    return;
  }

  // Chromium browsers (including Chrome on Android) support this event.
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    installButton.hidden = false;
    installButton.disabled = false;
  });

  installButton.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installButton.hidden = true;
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    installButton.hidden = true;
    if (iosHelp) iosHelp.hidden = true;
  });

  // iOS Safari does not support beforeinstallprompt; show manual instructions.
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !window.MSStream;
  const isSafari = /safari/i.test(navigator.userAgent) &&
    !/crios|fxios|edgios|opios/i.test(navigator.userAgent);

  if (isIOS && isSafari && iosHelp) {
    iosHelp.hidden = false;
  }
})();

// Register the service worker on supported secure origins.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  });
}

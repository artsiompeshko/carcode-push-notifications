let deferredPrompt;

const buttonInstall = document.getElementById('install-btn');
const detailsContainer = document.querySelector('.js-pwa-details');

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  buttonInstall.disabled = false;
  detailsContainer.textContent = 'Your browser supports PWA! You can install CarCode by click on the button above';
});

window.addEventListener('appinstalled', (evt) => {
  buttonInstall.disabled = true;

  detailsContainer.textContent = "CarCode Successfully Installed!";
});

buttonInstall.addEventListener('click', (e) => {
  // Show the install prompt
  deferredPrompt.prompt();
  // Wait for the user to respond to the prompt
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      detailsContainer.textContent = "Installing...";
      console.log('User accepted the install prompt');
    } else {
      detailsContainer.textContent = "Permissions were not granted...";
      console.log('User dismissed the install prompt');
    }
  })
});

// register sw
window.register();

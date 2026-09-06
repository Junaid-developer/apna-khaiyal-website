const APPLICATION_FORM = '#job-application-modal form';
const APPLICATION_BUTTON = '#submit-job-app-btn';

if (typeof document !== 'undefined') {
  // Capture the form submit itself. This runs synchronously before React's
  // submit handler can start another async request, so rapid clicks can never
  // create multiple application requests.
  document.addEventListener('submit', (event) => {
    const form = event.target as HTMLFormElement | null;
    if (!form?.matches(APPLICATION_FORM)) return;

    if (form.dataset.applicationSubmitLocked === '1') {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    form.dataset.applicationSubmitLocked = '1';

    const button = form.querySelector(APPLICATION_BUTTON) as HTMLButtonElement | null;
    const release = () => {
      if (!form.isConnected) return;
      if (button && !button.disabled) delete form.dataset.applicationSubmitLocked;
    };

    // React sets disabled=true while the async save is running and false when
    // it finishes. Release only then; never use a short timeout.
    const observer = new MutationObserver(release);
    if (button) observer.observe(button, { attributes: true, attributeFilter: ['disabled'] });

    const watcher = window.setInterval(() => {
      if (!form.isConnected) {
        window.clearInterval(watcher);
        observer.disconnect();
        return;
      }
      release();
      if (form.dataset.applicationSubmitLocked !== '1') {
        window.clearInterval(watcher);
        observer.disconnect();
      }
    }, 100);
  }, true);
}

export {};

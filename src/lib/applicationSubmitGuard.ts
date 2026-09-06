const APPLICATION_FORM = '#job-application-modal form';
const APPLICATION_BUTTON = '#submit-job-app-btn';

if (typeof document !== 'undefined') {
  const releaseWhenReady = (form: HTMLFormElement, button: HTMLButtonElement | null) => {
    if (!form.isConnected) return true;
    if (button && !button.disabled) {
      delete form.dataset.applicationSubmitLocked;
      delete button.dataset.applicationSubmitLocked;
      return true;
    }
    return false;
  };

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest(APPLICATION_BUTTON) as HTMLButtonElement | null;
    if (!button) return;

    const form = button.closest(APPLICATION_FORM) as HTMLFormElement | null;
    if (!form || !form.checkValidity()) return;

    if (form.dataset.applicationSubmitLocked === '1') {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    form.dataset.applicationSubmitLocked = '1';
    button.dataset.applicationSubmitLocked = '1';

    const observer = new MutationObserver(() => {
      if (releaseWhenReady(form, button)) observer.disconnect();
    });
    observer.observe(button, { attributes: true, attributeFilter: ['disabled'] });

    const watcher = window.setInterval(() => {
      if (!form.isConnected) {
        window.clearInterval(watcher);
        observer.disconnect();
        return;
      }
      if (releaseWhenReady(form, button)) {
        window.clearInterval(watcher);
        observer.disconnect();
      }
    }, 100);
  }, true);

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
    if (button) button.dataset.applicationSubmitLocked = '1';
  }, true);
}

export {};

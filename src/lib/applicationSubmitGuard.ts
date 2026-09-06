const APPLICATION_SUBMIT_BUTTON = '#submit-job-app-btn';

if (typeof document !== 'undefined') {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest(APPLICATION_SUBMIT_BUTTON) as HTMLButtonElement | null;
    if (!button) return;

    if (button.dataset.applicationSubmitLocked === '1') {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    // Lock synchronously during the first click. React state updates happen after
    // the event, so an isSubmitting state check alone cannot stop rapid clicks.
    button.dataset.applicationSubmitLocked = '1';

    const release = () => {
      if (!button.isConnected) return;
      if (!button.disabled) delete button.dataset.applicationSubmitLocked;
    };

    const observer = new MutationObserver(release);
    observer.observe(button, { attributes: true, attributeFilter: ['disabled'] });

    // Safety release if validation prevents the button from entering submitting state.
    window.setTimeout(() => {
      observer.disconnect();
      release();
    }, 5000);
  }, true);
}

export {};

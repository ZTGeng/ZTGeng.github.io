for (const button of document.querySelectorAll('.name')) {
  let hovered = false;
  let keyboardFocused = false;
  let touchExpanded = false;
  const render = () => {
    button.setAttribute('aria-expanded', String(hovered || keyboardFocused || touchExpanded));
  };

  button.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
      hovered = true;
      render();
    }
  });
  button.addEventListener('pointerleave', () => {
    hovered = false;
    render();
  });
  button.addEventListener('focus', () => {
    keyboardFocused = button.matches(':focus-visible');
    render();
  });
  button.addEventListener('blur', () => {
    keyboardFocused = false;
    touchExpanded = false;
    render();
  });
  button.addEventListener('click', (event) => {
    if (event.pointerType === 'touch') {
      touchExpanded = !touchExpanded;
      render();
    }
  });
}

/* Shared Castle click/tap tooltip. No hover-only or native-title dependency. */
(function(root) {
  function bind(container) {
    container.querySelectorAll('[data-castle-tooltip]').forEach(button => button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') === 'true';
      container.querySelectorAll('[data-castle-tooltip]').forEach(item => { item.setAttribute('aria-expanded', 'false'); const popover = item.querySelector('[role="tooltip"]'); if (popover) popover.classList.add('hidden'); });
      if (!open) { button.setAttribute('aria-expanded', 'true'); button.querySelector('[role="tooltip"]').classList.remove('hidden'); }
    }));
  }
  root.CastleTooltip = { bind };
})(window);

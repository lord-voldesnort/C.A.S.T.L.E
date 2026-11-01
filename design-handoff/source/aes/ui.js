(function(root) {
  let initialized = false;
  function init() {
    if (initialized) return; initialized = true;
    const tabs = document.querySelectorAll('#aes-studio-modal [role="tab"]');
    tabs.forEach((tab, index) => { tab.addEventListener('click', () => selectTab(tab.dataset.tabName)); tab.addEventListener('keydown', event => { let target; if (event.key === 'ArrowRight') target = (index + 1) % tabs.length; if (event.key === 'ArrowLeft') target = (index + tabs.length - 1) % tabs.length; if (target !== undefined) { event.preventDefault(); tabs[target].focus(); selectTab(tabs[target].dataset.tabName); } }); });
    root.CastleAESEncrypt.init(); root.CastleAESDecrypt.init(); root.CastleAESLearn.init();
  }
  function selectTab(name) { document.querySelectorAll('#aes-studio-modal [role="tab"]').forEach(tab => { const active = tab.dataset.tabName === name; tab.setAttribute('aria-selected', active); tab.tabIndex = active ? 0 : -1; tab.className = `flex-1 py-xs md:py-sm px-md text-xs md:text-sm font-headline-sm font-semibold rounded border transition-all uppercase cursor-pointer outline-none focus:ring-1 focus:ring-primary ${active ? 'border-primary bg-primary/20 text-primary' : 'border-border/50 bg-surface-container-lowest text-text-secondary'}`; }); document.querySelectorAll('[data-aes-panel]').forEach(panel => panel.classList.toggle('hidden', panel.dataset.aesPanel !== name)); }
  root.CastleAESUI = { init, selectTab };
})(window);

(() => {
  const nav = document.querySelector('.global-nav');
  const toggle = document.querySelector('[data-drawer-toggle]');
  const drawer = document.querySelector('[data-drawer]');
  const close = document.querySelector('[data-drawer-close]');
  const backdrop = document.querySelector('[data-drawer-backdrop]');

  if (!nav || !toggle || !drawer || !close || !backdrop) return;

  const mobileQuery = window.matchMedia('(max-width: 820px)');
  const drawerParent = drawer.parentNode;
  const backdropParent = backdrop.parentNode;
  const drawerMarker = document.createComment('mom-drawer');
  const backdropMarker = document.createComment('mom-drawer-backdrop');
  drawerParent.insertBefore(drawerMarker, drawer);
  backdropParent.insertBefore(backdropMarker, backdrop);
  const links = [...drawer.querySelectorAll('a')];
  const themeToggle = drawer.querySelector('[data-theme-toggle]');
  let returnFocus = toggle;

  function setMobilePortal(enabled) {
    if (enabled) {
      if (drawer.parentNode !== document.body) document.body.append(drawer, backdrop);
      document.body.classList.add('drawer-portal');
    } else {
      if (drawer.classList.contains('is-open')) setOpen(false, false);
      if (drawer.parentNode === document.body) drawerMarker.after(drawer);
      if (backdrop.parentNode === document.body) backdropMarker.after(backdrop);
      document.body.classList.remove('drawer-portal');
    }
  }

  function setOpen(open, restoreFocus = true) {
    drawer.classList.toggle('is-open', open);
    backdrop.classList.toggle('is-visible', open);
    document.body.classList.toggle('drawer-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
    drawer.setAttribute('aria-hidden', String(!open));
    if (open) {
      returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : toggle;
      close.focus();
    } else if (restoreFocus && returnFocus instanceof HTMLElement) {
      returnFocus.focus();
    }
  }

  function focusables() {
    return [close, ...links, themeToggle].filter((element) => element && !element.hidden && !element.disabled);
  }

  toggle.addEventListener('click', () => {
    if (!mobileQuery.matches) return;
    setOpen(!drawer.classList.contains('is-open'));
  });
  close.addEventListener('click', () => setOpen(false));
  backdrop.addEventListener('click', () => setOpen(false));
  links.forEach((link) => link.addEventListener('click', () => setOpen(false, false)));

  document.addEventListener('keydown', (event) => {
    if (!drawer.classList.contains('is-open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key !== 'Tab' || !mobileQuery.matches) return;
    const items = focusables();
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const handleModeChange = () => {
    setMobilePortal(mobileQuery.matches);
  };
  setMobilePortal(mobileQuery.matches);
  if (typeof mobileQuery.addEventListener === 'function') mobileQuery.addEventListener('change', handleModeChange);
  else mobileQuery.addListener(handleModeChange);
})();

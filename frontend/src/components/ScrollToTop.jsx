import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const scrollElementToTop = (element) => {
  if (!element) return;

  const previousBehavior = element.style.scrollBehavior;
  element.style.scrollBehavior = 'auto';
  element.scrollTop = 0;
  element.scrollLeft = 0;
  element.style.scrollBehavior = previousBehavior;
};

const scrollToTop = () => {
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;

  root.style.scrollBehavior = 'auto';
  window.scrollTo(0, 0);
  scrollElementToTop(root);
  scrollElementToTop(document.body);
  document
    .querySelectorAll('[data-route-scroll-container]')
    .forEach(scrollElementToTop);
  root.style.scrollBehavior = previousBehavior;
};

export const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    scrollToTop();
  }, [pathname, search]);

  useEffect(() => {
    const handleSameRouteLinkClick = (event) => {
      const link = event.target.closest?.('a[href]');
      if (!link || link.target || link.hasAttribute('download')) return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.hash) return;

      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        window.requestAnimationFrame(scrollToTop);
      }
    };

    document.addEventListener('click', handleSameRouteLinkClick);
    return () => document.removeEventListener('click', handleSameRouteLinkClick);
  }, []);

  return null;
};

export default ScrollToTop;

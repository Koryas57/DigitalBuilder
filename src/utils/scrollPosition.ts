export const resetDocumentScroll = () => {
  const root = document.documentElement;
  const body = document.body;
  const previousRootBehavior = root.style.scrollBehavior;
  const previousBodyBehavior = body.style.scrollBehavior;

  root.style.scrollBehavior = "auto";
  body.style.scrollBehavior = "auto";
  root.scrollTop = 0;
  body.scrollTop = 0;
  window.scrollTo(0, 0);
  root.style.scrollBehavior = previousRootBehavior;
  body.style.scrollBehavior = previousBodyBehavior;
};

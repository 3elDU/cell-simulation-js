function q<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

export default {
  main: q("main"),
  canvas: q<HTMLCanvasElement>("canvas"),
  paneContainer: q("panes-container"),
};

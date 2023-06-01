const subscribers = [];
export function subscribe(fn: (force: boolean) => void) {
  subscribers.push(fn);
}


function render(forceRender: boolean) {
  for (let fn of subscribers) {
    try {
      fn(forceRender);
    } catch (e) {
      console.error(e);
    }
  }
}
setInterval(render, 1000 / 20, false);

export function forceRender() {
  render(true);
}

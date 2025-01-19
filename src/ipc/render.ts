type renderCallback = (image: ImageBitmap) => void;

const subscribers: renderCallback[] = [];

export function subscribe(callback: renderCallback) {
  subscribers.push(callback);
}

export function render(image: ImageBitmap) {
  for (let renderFn of subscribers) {
    try {
      renderFn(image);
    } catch (e) {
      console.error(e);
    }
  }
}

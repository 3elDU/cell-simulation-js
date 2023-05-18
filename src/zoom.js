const canvas = document.getElementById("canvas");

let zoom = 8;
function addZoom(amount) {
    zoom += amount;

    if (zoom < 0.5) {
        zoom = 0.5;
    } else if (zoom > 20) {
        zoom = 20;
    }

    const sizePixels = Math.round(64 * zoom);
    canvas.style.width = `${sizePixels}px`
    canvas.style.height = `${sizePixels}px`
}

document.getElementById("canvas-zoom-out")
    .addEventListener("click", () => addZoom(-0.25));

document.getElementById("canvas-zoom-in")
    .addEventListener("click", () => addZoom(0.25));

document.getElementById("container").addEventListener("wheel", (event) => {
    addZoom(event.deltaY / 50);
})

addZoom(0);
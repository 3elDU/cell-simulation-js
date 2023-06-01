
<template>
  <span ref="span" id="icon">
    <svg xmlns="http://www.w3.org/2000/svg" :color="color" viewBox="0 0 24 24">
      <defs>
        <path id="icTwotoneHourglassTop0" fill="currentColor" d="m8 7.5l4 4l4-4V4H8z" opacity=".3" />
      </defs>
      <use href="#icTwotoneHourglassTop0" opacity=".3" />
      <use href="#icTwotoneHourglassTop0" opacity=".3" />
      <path fill="currentColor"
        d="M18 2H6v6l4 4l-3.99 4.01L6 22h12l-.01-5.99L14 12l4-3.99V2zm-2 14.5V20H8v-3.5l4-4l4 4zm0-9l-4 4l-4-4V4h8v3.5z" />
    </svg>
  </span>
</template>

<style scoped>
#icon {
  display: inline-block;

  /* HACK: Without this the text is not vertically centered, relative to other text */
  text-align: center;
  vertical-align: middle;
  position: relative;
  bottom: 0.1em;
}
</style>

<script lang="ts">
async function getSvgIconText(name: string): Promise<string> {
  const { data: response, error: error } = await useFetch(`/icons/${name}.svg`, {
    cache: 'force-cache'
  });

  if (error.value) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <defs>
          <path id="icTwotoneHourglassTop0" fill="currentColor" d="m8 7.5l4 4l4-4V4H8z" opacity=".3" />
        </defs>
        <use href="#icTwotoneHourglassTop0" opacity=".3" />
        <use href="#icTwotoneHourglassTop0" opacity=".3" />
        <path fill="currentColor"
          d="M18 2H6v6l4 4l-3.99 4.01L6 22h12l-.01-5.99L14 12l4-3.99V2zm-2 14.5V20H8v-3.5l4-4l4 4zm0-9l-4 4l-4-4V4h8v3.5z" />
      </svg>`
  } else {
    const string = await (response.value as Blob).text();
    return string;
  }
}
</script>

<script setup lang="ts">
const props = defineProps({
  name: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: false,
    default: "white"
  },

  width: {
    type: String,
    required: false,
    default: "1rem"
  },
  height: {
    type: String,
    required: false,
    default: "1rem"
  }
});

const span: Ref<Element> = ref();

async function load() {
  const response = await getSvgIconText(props.name);

  const parser = new DOMParser();
  // parseFromString returns the whole DOM tree, so
  // extract the actual element we need with `.children[0]`
  const parsedSvg = parser.parseFromString(response, 'image/svg+xml').children[0];

  // Set attributes on SVG
  parsedSvg.setAttribute("width", props.width);
  parsedSvg.setAttribute("height", props.height);
  parsedSvg.setAttribute("style", `color: ${props.color}`);

  return parsedSvg;
}

let parsedSvg = await load();

// Place svg in the DOM
function replaceSVG(parsedSvg: Element) {
  span.value.replaceChildren(parsedSvg);
}

// Watch for props changed, and reload the icon
watch(props, async (newProps, oldProps) => {
  parsedSvg = await load();
  replaceSVG(parsedSvg);
})

// The element hasn't been mounted yet, so we can't access `span` - the reference doesn't exist yet.
// Because of that, wrap the call to replaceSVG() inside onMounted() hook
onMounted(() => {
  replaceSVG(parsedSvg);
})
</script>

export type Color =
  | "black"
  | "white"
  | "body-background"
  | "body-foreground"
  | "background-lowest"
  | "background-low"
  | "background-middle"
  | "background-high"
  | "background-highest"
  | "primary"
  | "primary-active"
  | "on-primary"
  | "negative"
  | "negative-active"
  | "on-negative"
  | "positive"
  | "positive-active"
  | "on-positive"
  | "pane-background"
  | "frosted-pane-background";

export function getColorVariableName(color: Color): string {
  return `--${color}`;
}

const styles = window.getComputedStyle(document.body);
export function getColorValue(color: Color): string {
  return styles.getPropertyValue(getColorVariableName(color));
}

function isButtonNode(node) {
  return node.type === "button";
}
function isInputNode(node) {
  return node.type === "input";
}
function isContainerNode(node) {
  return node.type === "container";
}
function isHeadingNode(node) {
  return node.type === "heading";
}
function isTextNode(node) {
  return node.type === "text";
}
function isIconNode(node) {
  return node.type === "icon";
}
function isNavNode(node) {
  return node.type === "nav";
}
function isGridNode(node) {
  return node.type === "grid";
}
function isFormNode(node) {
  return node.type === "form";
}
const WIREMD_STYLES = [
  "coss",
  "sketch",
  "clean",
  "wireframe",
  "none",
  "tailwind",
  "material",
  "brutal"
];
export {
  WIREMD_STYLES as W,
  isContainerNode as a,
  isFormNode as b,
  isGridNode as c,
  isHeadingNode as d,
  isIconNode as e,
  isInputNode as f,
  isNavNode as g,
  isTextNode as h,
  isButtonNode as i
};

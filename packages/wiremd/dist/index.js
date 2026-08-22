import { S, V, p, s, v } from "./index-DeBR6CIj.js";
import { render, renderToHTML, renderToJSON, renderToReact, renderToTailwind } from "./renderer.js";
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
export {
  S as SYNTAX_VERSION,
  V as VERSION,
  isButtonNode,
  isContainerNode,
  isFormNode,
  isGridNode,
  isHeadingNode,
  isIconNode,
  isInputNode,
  isNavNode,
  isTextNode,
  p as parse,
  render,
  renderToHTML,
  renderToJSON,
  renderToReact,
  renderToTailwind,
  s as spansFromPosition,
  v as validate
};
//# sourceMappingURL=index.js.map

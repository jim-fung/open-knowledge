"use strict";
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
exports.WIREMD_STYLES = WIREMD_STYLES;
exports.isButtonNode = isButtonNode;
exports.isContainerNode = isContainerNode;
exports.isFormNode = isFormNode;
exports.isGridNode = isGridNode;
exports.isHeadingNode = isHeadingNode;
exports.isIconNode = isIconNode;
exports.isInputNode = isInputNode;
exports.isNavNode = isNavNode;
exports.isTextNode = isTextNode;

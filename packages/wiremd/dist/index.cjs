"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const parser = require("./index-DQI4IyyM.cjs");
const renderer = require("./renderer.cjs");
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
exports.SYNTAX_VERSION = parser.SYNTAX_VERSION;
exports.VERSION = parser.VERSION;
exports.parse = parser.parse;
exports.spansFromPosition = parser.spansFromPosition;
exports.validate = parser.validate;
exports.render = renderer.render;
exports.renderToHTML = renderer.renderToHTML;
exports.renderToJSON = renderer.renderToJSON;
exports.renderToReact = renderer.renderToReact;
exports.renderToTailwind = renderer.renderToTailwind;
exports.isButtonNode = isButtonNode;
exports.isContainerNode = isContainerNode;
exports.isFormNode = isFormNode;
exports.isGridNode = isGridNode;
exports.isHeadingNode = isHeadingNode;
exports.isIconNode = isIconNode;
exports.isInputNode = isInputNode;
exports.isNavNode = isNavNode;
exports.isTextNode = isTextNode;
//# sourceMappingURL=index.cjs.map

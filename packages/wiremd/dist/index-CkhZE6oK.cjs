"use strict";
const unified = require("unified");
const remarkParse = require("remark-parse");
const remarkGfm = require("remark-gfm");
function spansFromPosition(position) {
  if (!position || !position.start || !position.end) return {};
  return {
    start: {
      line: position.start.line,
      column: position.start.column,
      ...position.start.offset !== void 0 ? { offset: position.start.offset } : {}
    },
    end: {
      line: position.end.line,
      column: position.end.column,
      ...position.end.offset !== void 0 ? { offset: position.end.offset } : {}
    }
  };
}
const VERSION = "0.1.8";
const SYNTAX_VERSION = "0.1";
let activeDiagnosticSink = null;
function transformToWiremdAST(mdast, options = {}, sink) {
  const previousSink = activeDiagnosticSink;
  activeDiagnosticSink = sink ?? null;
  try {
    const meta = {
      version: SYNTAX_VERSION,
      viewport: "desktop",
      theme: "coss"
    };
    const document = {
      type: "document",
      version: SYNTAX_VERSION,
      meta,
      children: resolveKbdShortcut(processNodeList(mdast.children, options))
    };
    if (options.position && mdast.position && !document.position) {
      document.position = mdast.position;
    }
    return document;
  } finally {
    activeDiagnosticSink = previousSink;
  }
}
function applySourceSpans(node, mdastNode, options) {
  if (!options.position) return node;
  const position = mdastNode == null ? void 0 : mdastNode.position;
  if (!position || !position.start || !position.end) return node;
  const stack = [node];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;
    if (!current.position) {
      current.position = position;
    }
    if (Array.isArray(current.children)) {
      for (const child of current.children) stack.push(child);
    }
    if (Array.isArray(current.options)) {
      for (const option of current.options) stack.push(option);
    }
  }
  return node;
}
function transformNode(node, options, nextNode) {
  const transformed = transformNodeInner(node, options, nextNode);
  if (!transformed) return null;
  return applySourceSpans(transformed, node, options);
}
function reportUnsupportedNode(node) {
  const diagnostic = {
    severity: "warning",
    code: "wmd-unsupported-node",
    message: `Unsupported markdown construct "${node.type}" was omitted from the wiremd output.`,
    source: "parser",
    ...spansFromPosition(node.position)
  };
  const sink = activeDiagnosticSink;
  if (sink) {
    sink(diagnostic);
    return;
  }
  console.warn(`[wiremd] Unsupported node type: ${node.type}`);
}
function transformNodeInner(node, options, nextNode) {
  var _a;
  switch (node.type) {
    case "wiremdBlock":
      return transformContainer(node, options);
    case "wiremdInlineContainer":
      return transformInlineContainer(node);
    case "heading":
      return transformHeading(node);
    case "paragraph":
      return transformParagraph(node, options, nextNode);
    case "text":
      return {
        type: "text",
        content: node.value
      };
    case "list":
      return transformList(node, options);
    case "listItem":
      return transformListItem(node, options);
    case "table":
      return transformTable(node, options);
    case "blockquote":
      return transformBlockquote(node, options);
    case "code":
      return {
        type: "code",
        value: node.value,
        lang: node.lang || void 0,
        inline: false
      };
    case "inlineCode":
      return {
        type: "code",
        value: node.value,
        inline: true
      };
    case "image":
      return {
        type: "image",
        src: node.url || "",
        alt: node.alt || "",
        props: {}
      };
    case "link":
      return {
        type: "link",
        href: node.url || "#",
        title: node.title,
        children: ((_a = node.children) == null ? void 0 : _a.map((child) => transformNode(child, options)).filter(Boolean)) || [],
        props: {}
      };
    case "thematicBreak":
      return {
        type: "separator",
        props: {}
      };
    default:
      reportUnsupportedNode(node);
      return null;
  }
}
function processNodeList(nodeChildren, options) {
  const result = [];
  let i = 0;
  while (i < nodeChildren.length) {
    const node = nodeChildren[i];
    const nextNode = nodeChildren[i + 1];
    const transformed = transformNode(node, options, nextNode);
    if (transformed) {
      result.push(transformed);
      if (transformed.type === "select" && nextNode && nextNode.type === "list") i++;
      if (transformed.type === "container" && nextNode && nextNode.type === "list") {
        const hasSelectWithOptions = (transformed.children || []).some(
          (child) => child.type === "select" && child.options && child.options.length > 0
        );
        if (hasSelectWithOptions) i++;
      }
    }
    i++;
  }
  return result;
}
function collectGridItemsFromContainer(children, options, isCard) {
  const gridItems = [];
  const firstHeading = children.find((n) => n.type === "heading");
  if (!firstHeading) {
    return children.map((child) => ({
      type: "grid-item",
      props: { classes: isCard ? ["card"] : [] },
      children: processNodeList([child], options)
    }));
  }
  const itemDepth = firstHeading.depth;
  let i = 0;
  while (i < children.length) {
    const child = children[i];
    if (child.type === "heading" && child.depth === itemDepth) {
      const rawItemNodes = [child];
      i++;
      while (i < children.length) {
        const next = children[i];
        if (next.type === "heading" && next.depth <= itemDepth) break;
        rawItemNodes.push(next);
        i++;
      }
      const headingContent = extractTextContent(child);
      const colSpanMatch = headingContent.match(/\{[^}]*\.col-span-(\d+)[^}]*\}/);
      const alignMatch = headingContent.match(/\{[^}]*\.(left|center|right)[^}]*\}/);
      const itemProps = { classes: [] };
      if (isCard) itemProps.classes.push("card");
      if (colSpanMatch) itemProps.classes.push(`col-span-${colSpanMatch[1]}`);
      if (alignMatch) itemProps.classes.push(`align-${alignMatch[1]}`);
      gridItems.push({
        type: "grid-item",
        props: itemProps,
        children: processNodeList(rawItemNodes, options)
      });
    } else {
      i++;
    }
  }
  return gridItems;
}
function collectRowItemsFromContainer(children, options) {
  const items = [];
  const hasHeadings = children.some((n) => n.type === "heading");
  if (hasHeadings) {
    const firstHeading = children.find((n) => n.type === "heading");
    const itemDepth = firstHeading.depth;
    let i = 0;
    while (i < children.length) {
      const child = children[i];
      if (child.type === "heading" && child.depth === itemDepth) {
        const headingContent = extractTextContent(child);
        const alignMatch = headingContent.match(/\{[^}]*\.(left|center|right)[^}]*\}/);
        const itemProps = { classes: [] };
        if (alignMatch) itemProps.classes.push(`align-${alignMatch[1]}`);
        i++;
        const bareHeadingText = headingContent.replace(/\{[^}]*\}/g, "").trim();
        const rawItemNodes = bareHeadingText ? [child] : [];
        while (i < children.length) {
          const next = children[i];
          if (next.type === "heading" && next.depth <= itemDepth) break;
          if (next.type === "paragraph") {
            const nodeText = extractTextContent(next);
            const isDropdown = /\[[^\]]+v\](?:\s*\{[^}]+\})?$/.test(nodeText);
            rawItemNodes.push(next);
            i++;
            if (isDropdown && i < children.length && children[i].type === "list") {
              rawItemNodes.push(children[i]);
              i++;
            }
          } else {
            rawItemNodes.push(next);
            i++;
          }
        }
        items.push({
          type: "grid-item",
          props: itemProps,
          children: processNodeList(rawItemNodes, options)
        });
      } else {
        i++;
      }
    }
  } else {
    let i = 0;
    while (i < children.length) {
      const child = children[i];
      const groupNodes = [child];
      i++;
      if (child.type === "paragraph") {
        const nodeText = extractTextContent(child);
        const isDropdown = /\[[^\]]+v\](?:\s*\{[^}]+\})?$/.test(nodeText);
        if (isDropdown && i < children.length && children[i].type === "list") {
          groupNodes.push(children[i]);
          i++;
        }
      }
      items.push({
        type: "grid-item",
        props: { classes: [] },
        children: processNodeList(groupNodes, options)
      });
    }
  }
  return items;
}
function transformContainer(node, options) {
  var _a, _b, _c, _d, _e, _f;
  const props = parseAttributes(node.attributes || "");
  const containerType = (node.containerType || "").trim();
  const gridMatch = containerType.match(/^grid-(\d+)$/);
  if (gridMatch) {
    const columns = parseInt(gridMatch[1], 10);
    const firstChild = node.children[0];
    const hasCard = (firstChild == null ? void 0 : firstChild.type) === "paragraph" && ((_b = (_a = firstChild.children) == null ? void 0 : _a[0]) == null ? void 0 : _b.type) === "text" && ((_c = firstChild.children[0].value) == null ? void 0 : _c.trim()) === "card" || (props.classes || []).includes("card");
    const contentChildren = hasCard ? node.children.slice(1) : node.children;
    return {
      type: "grid",
      columns,
      props: { ...props, card: hasCard, classes: (props.classes || []).filter((c) => c !== "card") },
      children: collectGridItemsFromContainer(contentChildren, options, hasCard)
    };
  }
  if (containerType === "row") {
    return {
      type: "row",
      props,
      children: collectRowItemsFromContainer(node.children || [], options)
    };
  }
  if (containerType === "tabs") {
    const tabs = processNodeList(node.children || [], options).filter(
      (n) => n.type === "tab"
    );
    if (tabs.length > 0 && !tabs.some((t) => t.active)) {
      tabs[0].active = true;
    }
    return { type: "tabs", props, children: tabs };
  }
  if (containerType === "tab") {
    const firstChild = node.children[0];
    let label = "";
    let isActive = false;
    let contentChildren = node.children || [];
    if ((firstChild == null ? void 0 : firstChild.type) === "paragraph" && ((_e = (_d = firstChild.children) == null ? void 0 : _d[0]) == null ? void 0 : _e.type) === "text") {
      const raw = firstChild.children[0].value;
      const m = raw.match(/^(.+?)(?:\s*(\{[^}]+\}))?$/);
      label = ((_f = m == null ? void 0 : m[1]) == null ? void 0 : _f.trim()) || raw.trim();
      isActive = ((m == null ? void 0 : m[2]) || "").includes("active");
      contentChildren = node.children.slice(1);
    }
    return {
      type: "tab",
      label,
      active: isActive,
      props,
      children: processNodeList(contentChildren, options)
    };
  }
  if (containerType === "demo") {
    return {
      type: "demo",
      raw: node.rawContent || "",
      props,
      children: processNodeList(node.children || [], options)
    };
  }
  if (containerType === "toast") {
    const toastType = (props.classes || []).find(
      (c) => c === "success" || c === "info" || c === "warning" || c === "error" || c === "loading"
    );
    return {
      type: "toast",
      props: {
        ...props,
        toastType,
        classes: (props.classes || []).filter((c) => c !== toastType)
      },
      children: processNodeList(node.children || [], options)
    };
  }
  if (containerType === "skeleton") {
    return { type: "skeleton", props };
  }
  if (containerType === "spinner") {
    return { type: "spinner", props };
  }
  if (containerType === "progress" || containerType === "meter") {
    const isProgress = containerType === "progress";
    const classes = props.classes || [];
    const indeterminate = classes.includes("indeterminate");
    const valueAttr = props.value !== void 0 ? Number(props.value) : void 0;
    const minAttr = props.min !== void 0 ? Number(props.min) : 0;
    const maxAttr = props.max !== void 0 ? Number(props.max) : 100;
    const fallbackValue = isProgress ? indeterminate ? 0 : 50 : 60;
    const value = valueAttr !== void 0 && !Number.isNaN(valueAttr) ? valueAttr : fallbackValue;
    const labelAttr = props.label;
    const remaining = { ...props };
    delete remaining.value;
    delete remaining.min;
    delete remaining.max;
    delete remaining.label;
    remaining.classes = classes.filter((c) => c !== "indeterminate");
    return isProgress ? {
      type: "progress",
      value,
      indeterminate,
      props: { ...remaining, label: typeof labelAttr === "string" ? labelAttr : void 0 }
    } : {
      type: "meter",
      value,
      min: minAttr,
      max: maxAttr,
      props: { ...remaining, label: typeof labelAttr === "string" ? labelAttr : void 0 }
    };
  }
  if (containerType === "dialog" || containerType === "alert-dialog" || containerType === "sheet" || containerType === "drawer" || containerType === "popover" || containerType === "tooltip" || containerType === "preview-card") {
    const isSheet = containerType === "sheet";
    const isDrawer = containerType === "drawer";
    const isTooltip = containerType === "tooltip";
    const isPreview = containerType === "preview-card";
    const isDialog = containerType === "dialog";
    const isAlert = containerType === "alert-dialog";
    const isPopover = containerType === "popover";
    const classes = props.classes || [];
    const findSide = () => {
      const s = classes.find((c) => c === "top" || c === "right" || c === "bottom" || c === "left");
      return s || "right";
    };
    const firstChild = (node.children || [])[0];
    let titleFromOpener;
    if (firstChild && firstChild.type === "heading") {
      titleFromOpener = firstChild.content;
    }
    const cleanedClasses = classes.filter((c) => c !== "top" && c !== "right" && c !== "bottom" && c !== "left");
    const baseProps = { ...props, classes: cleanedClasses };
    const childrenToUse = titleFromOpener ? (node.children || []).slice(1) : node.children || [];
    const processedChildren = processNodeList(childrenToUse, options);
    if (isSheet) {
      return { type: "sheet", side: findSide(), props: { ...baseProps, title: titleFromOpener }, children: processedChildren };
    }
    if (isDrawer) {
      return { type: "drawer", side: findSide(), props: { ...baseProps, title: titleFromOpener }, children: processedChildren };
    }
    if (isTooltip) {
      return {
        type: "tooltip",
        props: { ...baseProps, content: titleFromOpener ?? "" },
        children: processedChildren
      };
    }
    if (isPreview) {
      return { type: "preview-card", props: baseProps, children: processedChildren };
    }
    if (isDialog) {
      return { type: "dialog", props: { ...baseProps, title: titleFromOpener }, children: processedChildren };
    }
    if (isAlert) {
      return { type: "alert-dialog", props: { ...baseProps, title: titleFromOpener }, children: processedChildren };
    }
    if (isPopover) {
      return { type: "popover", props: { ...baseProps, title: titleFromOpener }, children: processedChildren };
    }
  }
  if (containerType === "pagination" || containerType === "segmented-control" || containerType === "scroll-area" || containerType === "sidebar" || containerType === "menubar") {
    const firstChild = (node.children || [])[0];
    let titleFromOpener;
    if (firstChild && firstChild.type === "heading") {
      titleFromOpener = firstChild.content;
    }
    const childrenToUse = titleFromOpener ? (node.children || []).slice(1) : node.children || [];
    const processedChildren = processNodeList(childrenToUse, options);
    switch (containerType) {
      case "pagination":
        return { type: "pagination", props, children: processedChildren };
      case "segmented-control":
        return { type: "segmented-control", props, children: processedChildren };
      case "scroll-area":
        return { type: "scroll-area", props, children: processedChildren };
      case "sidebar":
        return { type: "sidebar", props: { ...props, title: titleFromOpener }, children: processedChildren };
      case "menubar":
        return { type: "menubar", props, children: processedChildren };
    }
  }
  if (containerType === "form" || containerType === "field" || containerType === "fieldset" || containerType === "label" || containerType === "input-group" || containerType === "otp-field" || containerType === "number-field" || containerType === "autocomplete" || containerType === "combobox" || containerType === "command" || containerType === "checkbox-group" || containerType === "toggle-group" || containerType === "switch" || containerType === "slider" || containerType === "toggle" || // Phase 3 Task 6: display family
  containerType === "avatar" || containerType === "frame" || containerType === "group" || containerType === "empty" || containerType === "calendar" || containerType === "date-picker") {
    const processedChildren = processNodeList(node.children || [], options);
    const takeHeading = () => {
      const idx = processedChildren.findIndex((c) => c.type === "heading");
      if (idx === -1) return void 0;
      const [h] = processedChildren.splice(idx, 1);
      return String(h.content ?? "").trim() || void 0;
    };
    const extractText = () => {
      const parts = [];
      for (const child of node.children || []) {
        const any = child;
        if (any.type === "text") parts.push(any.value ?? "");
        else if (any.children) {
          const text = (any.children || []).map((c) => c.value ?? "").join("");
          if (text.trim()) parts.push(text.trim());
        }
      }
      return parts.join(" ").trim();
    };
    switch (containerType) {
      case "form":
        return { type: "form", props, children: processedChildren };
      case "field": {
        const label = takeHeading();
        const labelFromProp = typeof props.label === "string" ? props.label : void 0;
        const rest = { ...props };
        delete rest.label;
        delete rest.description;
        delete rest.error;
        return {
          type: "field",
          props: {
            ...rest,
            label: label ?? labelFromProp,
            description: typeof props.description === "string" ? props.description : void 0,
            error: typeof props.error === "string" ? props.error : void 0
          },
          children: processedChildren
        };
      }
      case "fieldset": {
        const legend = takeHeading();
        const rest = { ...props };
        delete rest.legend;
        delete rest.description;
        return {
          type: "fieldset",
          props: {
            ...rest,
            legend,
            description: typeof props.description === "string" ? props.description : void 0
          },
          children: processedChildren
        };
      }
      case "label":
        return { type: "label", content: extractText(), props };
      case "input-group": {
        const rest = { ...props };
        delete rest.addonStart;
        delete rest.addonEnd;
        return {
          type: "input-group",
          props: {
            ...rest,
            addonStart: typeof props.addonStart === "string" ? props.addonStart : void 0,
            addonEnd: typeof props.addonEnd === "string" ? props.addonEnd : void 0
          },
          children: processedChildren
        };
      }
      case "otp-field": {
        const rest = { ...props };
        delete rest.length;
        delete rest.maxLength;
        return {
          type: "otp-field",
          props: {
            ...rest,
            length: props.length !== void 0 ? Number(props.length) : 6,
            maxLength: props.maxLength !== void 0 ? Number(props.maxLength) : 1
          }
        };
      }
      case "number-field": {
        const rest = { ...props };
        const numeric = (v) => v !== void 0 && !Number.isNaN(Number(v)) ? Number(v) : void 0;
        const out = { type: "number-field", props: { ...rest } };
        delete out.props.value;
        delete out.props.min;
        delete out.props.max;
        delete out.props.step;
        out.props.value = numeric(props.value);
        out.props.min = numeric(props.min);
        out.props.max = numeric(props.max);
        out.props.step = numeric(props.step);
        out.props.placeholder = typeof props.placeholder === "string" ? props.placeholder : void 0;
        return out;
      }
      case "autocomplete":
      case "combobox": {
        const rest = { ...props };
        delete rest.placeholder;
        delete rest.options;
        delete rest.suggestions;
        const listChild = processedChildren.find((c) => c.type === "list");
        const opts = listChild ? (listChild.children || []).map((li) => String(li.content ?? "").trim()).filter(Boolean) : [];
        const isAuto = containerType === "autocomplete";
        return {
          type: isAuto ? "autocomplete" : "combobox",
          props: {
            ...rest,
            placeholder: typeof props.placeholder === "string" ? props.placeholder : void 0,
            ...isAuto ? { suggestions: opts } : { options: opts }
          },
          children: processedChildren
        };
      }
      case "command":
        return { type: "command", props, children: processedChildren };
      case "checkbox-group": {
        const label = takeHeading();
        const rest = { ...props };
        delete rest.label;
        delete rest.description;
        return {
          type: "checkbox-group",
          props: {
            ...rest,
            label,
            description: typeof props.description === "string" ? props.description : void 0
          },
          children: processedChildren
        };
      }
      case "toggle-group":
        return { type: "toggle-group", props, children: processedChildren };
      case "switch": {
        const classes = props.classes || [];
        const checked = classes.includes("checked") || props.checked === true;
        const rest = { ...props };
        delete rest.checked;
        delete rest.label;
        delete rest.description;
        delete rest.disabled;
        rest.classes = classes.filter((c) => c !== "checked");
        return {
          type: "switch",
          checked,
          props: {
            ...rest,
            label: typeof props.label === "string" ? props.label : void 0,
            description: typeof props.description === "string" ? props.description : void 0,
            disabled: props.disabled === true
          }
        };
      }
      case "slider": {
        const rest = { ...props };
        const numeric = (v) => v !== void 0 && !Number.isNaN(Number(v)) ? Number(v) : void 0;
        const value = numeric(props.value) ?? 50;
        delete rest.value;
        delete rest.min;
        delete rest.max;
        delete rest.step;
        delete rest.label;
        return {
          type: "slider",
          value,
          props: {
            ...rest,
            min: numeric(props.min) ?? 0,
            max: numeric(props.max) ?? 100,
            step: numeric(props.step) ?? 1,
            label: typeof props.label === "string" ? props.label : void 0
          }
        };
      }
      case "toggle": {
        const classes = props.classes || [];
        const pressed = classes.includes("active") || classes.includes("pressed") || props.pressed === true;
        const rest = { ...props };
        delete rest.pressed;
        rest.classes = classes.filter((c) => c !== "active" && c !== "pressed");
        return {
          type: "toggle",
          pressed,
          props: {
            ...rest,
            label: typeof props.label === "string" ? props.label : void 0
          }
        };
      }
      case "avatar": {
        const rest = { ...props };
        const size = ["sm", "md", "lg", "xl"].includes(rest.size) ? rest.size : "md";
        delete rest.size;
        delete rest.name;
        return {
          type: "avatar",
          props: {
            ...rest,
            size,
            name: typeof props.name === "string" ? props.name : void 0
          }
        };
      }
      case "frame":
        return { type: "frame", props, children: processedChildren };
      case "group": {
        const orientation = props.orientation === "vertical" ? "vertical" : "horizontal";
        return { type: "group", orientation, props, children: processedChildren };
      }
      case "empty":
        return { type: "empty", props, children: processedChildren };
      case "calendar": {
        const rest = { ...props };
        const year = rest.year !== void 0 && !Number.isNaN(Number(rest.year)) ? Number(rest.year) : (/* @__PURE__ */ new Date()).getFullYear();
        const month = typeof rest.month === "string" ? rest.month : void 0;
        delete rest.year;
        delete rest.month;
        return { type: "calendar", props: { ...rest, month, year }, children: processedChildren };
      }
      case "date-picker": {
        const rest = { ...props };
        return {
          type: "date-picker",
          props: {
            ...rest,
            placeholder: typeof rest.placeholder === "string" ? rest.placeholder : void 0,
            value: typeof rest.value === "string" ? rest.value : void 0
          }
        };
      }
    }
  }
  return {
    type: "container",
    containerType,
    props,
    children: processNodeList(node.children || [], options)
  };
}
function resolveKbdShortcut(nodes) {
  var _a;
  const out = [];
  for (const node of nodes) {
    if (node && node.type === "button") {
      const buttonNode = node;
      const classes = ((_a = buttonNode.props) == null ? void 0 : _a.classes) ?? [];
      if (classes.includes("kbd")) {
        out.push({
          type: "kbd",
          content: buttonNode.content ?? "",
          props: {
            ...buttonNode.props,
            classes: classes.filter((c) => c !== "kbd")
          }
        });
        continue;
      }
    }
    if (node && node.children && Array.isArray(node.children)) {
      node.children = resolveKbdShortcut(node.children);
    }
    out.push(node);
  }
  return out;
}
function transformInlineContainer(node, _options) {
  const props = parseAttributes(node.attributes || "");
  const items = node.items || [];
  const children = [];
  if (items.length === 1 && items[0].includes(">")) {
    const crumbs = items[0].split(/\s*>\s*/).map((c) => c.trim()).filter(Boolean);
    return {
      type: "breadcrumbs",
      props,
      children: crumbs.map((crumb, i) => ({
        type: "breadcrumb-item",
        content: crumb,
        current: i === crumbs.length - 1,
        props: {}
      }))
    };
  }
  let brandEmitted = false;
  for (const item of items) {
    let trimmed = item.trim();
    let itemProps = { classes: [] };
    const attrMatch = trimmed.match(/^([\s\S]+?)\s*(\{[^}]+\})$/);
    if (attrMatch) {
      trimmed = attrMatch[1].trim();
      itemProps = parseAttributes(attrMatch[2]);
    }
    const activeMatch = trimmed.match(/^\*\*?([^*]+)\*\*?$/);
    if (activeMatch) {
      children.push({
        type: "nav-item",
        content: activeMatch[1],
        props: { ...itemProps, classes: [...itemProps.classes ?? [], "active"] }
      });
      continue;
    }
    const linkMatch = trimmed.match(/^\[([^\]]+)\]\(([^)]+)\)(\*)?$/);
    if (linkMatch) {
      children.push({
        type: "nav-item",
        content: linkMatch[1],
        href: linkMatch[2],
        props: {
          ...itemProps,
          ...linkMatch[3] ? { variant: "primary" } : {}
        }
      });
      continue;
    }
    const buttonMatch = trimmed.match(/^\[([^\]]+)\](\*)?$/);
    if (buttonMatch) {
      children.push({
        type: "button",
        content: buttonMatch[1],
        props: {
          ...itemProps,
          ...buttonMatch[2] ? { variant: "primary" } : {}
        }
      });
      continue;
    }
    const iconMatch = trimmed.match(/^:([a-z-]+):$/);
    if (iconMatch) {
      children.push({
        type: "icon",
        props: { ...itemProps, name: iconMatch[1] }
      });
      continue;
    }
    const iconTextMatch = trimmed.match(/^:([a-z-]+):\s*(.+)$/);
    if (iconTextMatch) {
      const iconName = iconTextMatch[1];
      const text = iconTextMatch[2];
      const nodeType = iconName === "logo" ? "brand" : "nav-item";
      children.push({
        type: nodeType,
        children: [
          { type: "icon", props: { name: iconName } },
          { type: "text", content: text }
        ],
        props: itemProps
      });
      continue;
    }
    if (!brandEmitted) {
      brandEmitted = true;
      children.push({
        type: "brand",
        children: [{ type: "text", content: trimmed, props: {} }],
        props: itemProps
      });
    } else {
      children.push({
        type: "nav-item",
        content: trimmed,
        props: itemProps
      });
    }
  }
  return {
    type: "nav",
    props,
    children
  };
}
function transformHeading(node, _options) {
  const content = extractTextContent(node);
  const attrMatch = content.match(/^(.*?)(\{[^}]+\})$/);
  let headingText = content;
  let props = { classes: [] };
  if (attrMatch) {
    headingText = attrMatch[1].trim();
    props = parseAttributes(attrMatch[2]);
  }
  if (/:([a-z-]+):/.test(headingText)) {
    const iconPattern = /:([a-z-]+):/g;
    const parts = headingText.split(iconPattern);
    const children = [];
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        if (parts[i].trim()) {
          children.push({
            type: "text",
            content: parts[i],
            props: {}
          });
        }
      } else {
        children.push({
          type: "icon",
          props: { name: parts[i] }
        });
      }
    }
    return {
      type: "heading",
      level: node.depth,
      children,
      props
    };
  }
  return {
    type: "heading",
    level: node.depth,
    content: headingText,
    props
  };
}
function tryParseButtonLinkSequence(children) {
  if (!children || children.length < 3 || children.length % 2 === 0) return null;
  for (let i = 0; i < children.length; i++) {
    if (i % 2 === 0 && children[i].type !== "text") return null;
    if (i % 2 === 1 && children[i].type !== "link") return null;
  }
  if (!/^\s*\[$/.test(children[0].value)) return null;
  const lastText = children[children.length - 1].value;
  if (!/^\](\*)?\s*(\{[^}]*\})?\s*$/.test(lastText)) return null;
  for (let i = 2; i <= children.length - 3; i += 2) {
    if (!/^\](\*)?\s*(\{[^}]*\})?\s*\[$/.test(children[i].value)) return null;
  }
  return children.filter((_, i) => i % 2 === 1).map((linkNode, idx) => {
    const closingText = children[idx * 2 + 2].value;
    const closeMatch = closingText.match(/^\](\*)?\s*(\{[^}]*\})?/);
    const isPrimary = !!(closeMatch && closeMatch[1]);
    const attrStr = closeMatch && closeMatch[2] || "";
    const attrs = attrStr ? parseAttributes(attrStr) : {};
    return {
      type: "button",
      content: extractTextContent(linkNode),
      href: linkNode.url || "#",
      props: { ...attrs, variant: isPrimary ? "primary" : attrs.variant }
    };
  });
}
function serializeMdastChildren(children) {
  return (children || []).map((child) => {
    if (child.type === "link") {
      const text = (child.children || []).map((c) => c.value || "").join("");
      return `[${text}](${child.url})`;
    }
    if (child.type === "strong") return `**${serializeMdastChildren(child.children)}**`;
    if (child.type === "emphasis") return `*${serializeMdastChildren(child.children)}*`;
    return child.value || "";
  }).join("");
}
function transformParagraph(node, _options, nextNode) {
  var _a, _b, _c;
  if ((_a = node.children) == null ? void 0 : _a.length) {
    const serialized = serializeMdastChildren(node.children);
    const inlineMatch = serialized.match(/^\[\[\s*(.+?)\s*\]\](\{[^}]+\})?$/);
    if (inlineMatch) {
      const content2 = inlineMatch[1];
      const attrs = inlineMatch[2] || "";
      const items = content2.split("|").map((item) => item.trim());
      return transformInlineContainer({ items, attributes: attrs.trim() });
    }
  }
  const hasRichContent = node.children && node.children.some(
    (child) => child.type === "strong" || child.type === "emphasis" || child.type === "link" || child.type === "code" || child.type === "inlineCode" || child.type === "image"
  );
  const buttonLinks = tryParseButtonLinkSequence(node.children);
  if (buttonLinks !== null) {
    if (buttonLinks.length === 1) return buttonLinks[0];
    return {
      type: "container",
      containerType: "button-group",
      children: buttonLinks,
      props: {}
    };
  }
  if (hasRichContent) {
    let content2 = extractTextContent(node);
    content2 = content2.replace(/\s*:::\s*$/, "").trim();
    const buttonMatch = content2.match(/^\[([^\]]+)\](\*)?(?:\s*(\{[^}]*\}))?$/);
    if (buttonMatch) {
      const attrs = buttonMatch[3] ? parseAttributes(buttonMatch[3]) : {};
      return {
        type: "button",
        content: buttonMatch[1],
        props: {
          ...attrs,
          variant: buttonMatch[2] ? "primary" : void 0
        }
      };
    }
    const processedChildren = [];
    let currentText = "";
    const flushText = () => {
      if (currentText) {
        processedChildren.push({
          type: "text",
          content: currentText,
          props: {}
        });
        currentText = "";
      }
    };
    for (const child of node.children) {
      if (child.type === "text") {
        const textParts = child.value.split(/(\[[^\]]+\](?:\*)?(?:\s*\{[^}]*\})?|:[a-z-]+:|\|[^|]+\|(?:\s*\{[^}]*\})?)/);
        for (const part of textParts) {
          const buttonMatch2 = part.match(/^\[([^\]]+)\](\*)?(?:\s*(\{[^}]*\}))?$/);
          if (buttonMatch2 && !/^\[[_*]+\]/.test(part)) {
            flushText();
            const attrs = buttonMatch2[3] ? parseAttributes(buttonMatch2[3]) : {};
            processedChildren.push({
              type: "button",
              content: buttonMatch2[1],
              props: {
                ...attrs,
                variant: buttonMatch2[2] ? "primary" : void 0
              }
            });
          } else if (part.match(/^:([a-z-]+):$/)) {
            flushText();
            const iconMatch2 = part.match(/^:([a-z-]+):$/);
            if (iconMatch2) {
              processedChildren.push({
                type: "icon",
                props: { name: iconMatch2[1] }
              });
            }
          } else if (part.match(/^\|([^|]+)\|(?:\s*(\{[^}]*\}))?$/)) {
            flushText();
            const pillMatch = part.match(/^\|([^|]+)\|(?:\s*(\{[^}]*\}))?$/);
            if (pillMatch) {
              const [, text, attrs] = pillMatch;
              const props = parseAttributes(attrs || "");
              const validVariants = ["default", "primary", "success", "warning", "error"];
              const variantClass = (_b = props.classes) == null ? void 0 : _b.find((c) => validVariants.includes(c));
              if (variantClass) {
                props.variant = variantClass;
                props.classes = props.classes.filter((c) => c !== variantClass);
              }
              processedChildren.push({ type: "badge", content: text.trim(), props });
            }
          } else if (part) {
            currentText += part;
          }
        }
      } else if (child.type === "image") {
        flushText();
        processedChildren.push({
          type: "image",
          src: child.url || "",
          alt: child.alt || "",
          props: {}
        });
      } else if (child.type === "strong") {
        currentText += `<strong>${extractTextContent(child)}</strong>`;
      } else if (child.type === "emphasis") {
        currentText += `<em>${extractTextContent(child)}</em>`;
      } else if (child.type === "code" || child.type === "inlineCode") {
        currentText += `<code>${extractTextContent(child)}</code>`;
      } else if (child.type === "link") {
        currentText += `<a href="${child.url}">${extractTextContent(child)}</a>`;
      } else {
        currentText += extractTextContent(child);
      }
    }
    flushText();
    if (processedChildren.length === 1 && processedChildren[0].type === "text") {
      return {
        type: "paragraph",
        content: processedChildren[0].content,
        props: {}
      };
    }
    return {
      type: "container",
      containerType: "form-group",
      children: processedChildren,
      props: {}
    };
  }
  let content = extractTextContent(node);
  content = content.replace(/\s*:::\s*$/, "").trim();
  const checkboxMatch = content.match(/^\[\s*([xX ])\s*\]\s+(.+)$/);
  if (checkboxMatch) {
    const checked = checkboxMatch[1].toLowerCase() === "x";
    let label = checkboxMatch[2];
    const attrMatch = label.match(/^(.+?)(\{[^}]+\})$/);
    let props = {};
    if (attrMatch) {
      label = attrMatch[1].trim();
      props = parseAttributes(attrMatch[2]);
    }
    return {
      type: "checkbox",
      label,
      checked,
      props
    };
  }
  const radioPattern = /\(([*•x ])\)\s+([^(]+?)(?=\s*\(|$)/g;
  const radioMatches = Array.from(content.matchAll(radioPattern));
  if (radioMatches.length >= 2) {
    const radioButtons = [];
    for (const match of radioMatches) {
      const selected = match[1] !== " ";
      let label = match[2].trim();
      const attrMatch = label.match(/^(.+?)(\{[^}]+\})$/);
      let props = {};
      if (attrMatch) {
        label = attrMatch[1].trim();
        props = parseAttributes(attrMatch[2]);
      }
      radioButtons.push({
        type: "radio",
        label,
        selected,
        props
      });
    }
    return {
      type: "radio-group",
      props: { inline: true },
      children: radioButtons
    };
  }
  const inlineContainerMatch = content.match(/^\[\[\s*(.+?)\s*\]\](\{[^}]+\})?/);
  if (inlineContainerMatch) {
    const itemsContent = inlineContainerMatch[1];
    const attrs = inlineContainerMatch[2] || "";
    const items = itemsContent.split("|").map((item) => item.trim());
    const inlineContainerNode = {
      items,
      attributes: attrs.trim()
    };
    const transformed = transformInlineContainer(inlineContainerNode);
    const remainingText = content.substring(inlineContainerMatch[0].length).trim();
    if (remainingText) {
      return {
        type: "container",
        containerType: "section",
        children: [
          transformed,
          {
            type: "paragraph",
            content: remainingText,
            props: {}
          }
        ],
        props: {}
      };
    }
    return transformed;
  }
  const lines = content.split("\n").filter((line) => line.trim());
  if (lines.length > 1) {
    const allWithIcons = lines.every((line) => /:([a-z-]+):/.test(line.trim()));
    if (allWithIcons) {
      const iconLines = [];
      for (const line of lines) {
        const trimmed = line.trim();
        const iconPattern = /:([a-z-]+):/g;
        const parts = trimmed.split(iconPattern);
        const lineChildren = [];
        for (let i = 0; i < parts.length; i++) {
          if (i % 2 === 0) {
            if (parts[i].trim()) {
              lineChildren.push({
                type: "text",
                content: parts[i],
                props: {}
              });
            }
          } else {
            lineChildren.push({
              type: "icon",
              props: { name: parts[i] }
            });
          }
        }
        if (lineChildren.length > 0) {
          iconLines.push({
            type: "paragraph",
            children: lineChildren,
            props: {}
          });
        }
      }
      if (iconLines.length > 0) {
        return {
          type: "container",
          containerType: "section",
          props: {},
          children: iconLines
        };
      }
    }
    const isInputLike = (s) => /\[[^\]]*_{3,}[^\]]*\]/.test(s) || /\[[_*]+\]/.test(s);
    const lineIsAllButtons = (line) => {
      const trimmed = line.trim();
      if (!trimmed || !/\[/.test(trimmed)) return false;
      if (isInputLike(trimmed)) return false;
      const stripped = trimmed.replace(/\[([^\]]+)\](\*)?(?:\s*\{[^}]*\})?/g, "").trim();
      return stripped === "";
    };
    const allButtons = lines.every(lineIsAllButtons);
    if (allButtons) {
      const buttons = [];
      const buttonPattern = /\[([^\]]+)\](\*)?(?:\s*(\{[^}]*\}))?/g;
      for (const line of lines) {
        let match;
        buttonPattern.lastIndex = 0;
        while ((match = buttonPattern.exec(line.trim())) !== null) {
          if (/^\[[_*]+\]/.test(match[0])) continue;
          const [, text, isPrimary, attrs] = match;
          const props = parseAttributes(attrs || "");
          if (isPrimary) props.variant = "primary";
          buttons.push({ type: "button", content: text, props });
        }
      }
      if (buttons.length > 1) {
        return {
          type: "container",
          containerType: "button-group",
          props: {},
          children: buttons
        };
      } else if (buttons.length === 1) {
        return buttons[0];
      }
    }
    const lastLine = lines[lines.length - 1].trim();
    const labelLineArray = lines.slice(0, -1);
    const labelLines = labelLineArray.join("\n");
    const lineIsAllInlineElements = (line) => {
      const trimmed = line.trim();
      if (!trimmed || !/\[/.test(trimmed)) return false;
      const stripped = trimmed.replace(/\[([^\]]+)\](\*)?(?:\s*\{[^}]*\})?/g, "").trim();
      return stripped === "";
    };
    const labelLinesAreButtons = labelLineArray.length > 0 && labelLineArray.every(lineIsAllInlineElements);
    const isInputText = (t) => /^[_*]+$/.test(t) || /_{3,}$/.test(t);
    const parseLabelAsButtons = () => {
      const nodes = [];
      const btnPat = /\[([^\]]+)\](\*)?(?:\s*(\{[^}]*\}))?/g;
      for (const line of labelLineArray) {
        let m;
        btnPat.lastIndex = 0;
        while ((m = btnPat.exec(line.trim())) !== null) {
          const [, text, isPrimary, attrs] = m;
          const p = parseAttributes(attrs || "");
          if (isInputText(text)) {
            const placeholderMatch = text.match(/^([^_*]+)_{3,}$/);
            if (placeholderMatch) p.placeholder = placeholderMatch[1].trim();
            nodes.push({ type: "input", props: p });
          } else {
            if (isPrimary) p.variant = "primary";
            nodes.push({ type: "button", content: text, props: p });
          }
        }
      }
      return nodes;
    };
    const dropdownMatch2 = lastLine.match(/^\[([^\]]+)v\](?:\s*(\{[^}]+\}))?$/);
    if (dropdownMatch2) {
      const [, text, attrs] = dropdownMatch2;
      const props = parseAttributes(attrs || "");
      const options = [];
      if (nextNode && nextNode.type === "list") {
        for (const item of nextNode.children || []) {
          const itemText = extractTextContent(item);
          options.push({
            type: "option",
            value: itemText,
            label: itemText,
            selected: false
          });
        }
      }
      if (labelLinesAreButtons) {
        return {
          type: "container",
          containerType: "button-group",
          props: {},
          children: [...parseLabelAsButtons(), {
            type: "select",
            props: { ...props, placeholder: text.replace(/[_\s]+$/, "").trim() || void 0 },
            options
          }]
        };
      }
      return {
        type: "container",
        containerType: "form-group",
        props: {},
        children: [
          labelLines ? { type: "text", content: labelLines } : null,
          {
            type: "select",
            props: {
              ...props,
              placeholder: text.replace(/[_\s]+$/, "").trim() || void 0
            },
            options
          }
        ].filter(Boolean)
      };
    }
    if (/\[[^\]]*[_*][^\]]*\]/.test(lastLine)) {
      const match = lastLine.match(/^\[([^\]]+)\](?:\s*(\{[^}]+\}))?$/);
      if (match) {
        const [, pattern, attrs] = match;
        const props = parseAttributes(attrs || "");
        let placeholderText = "";
        if (pattern.includes("*") && pattern.replace(/[^*]/g, "").length > 3) {
          props.inputType = "password";
        } else {
          const placeholderMatch = pattern.match(/^([^_*]+)[_*]/);
          if (placeholderMatch) {
            placeholderText = placeholderMatch[1].trim();
            props.placeholder = placeholderText;
          }
        }
        const underscoreCount = pattern.replace(/[^_]/g, "").length;
        const asteriskCount = pattern.replace(/[^*]/g, "").length;
        const widthChars = underscoreCount > 0 ? underscoreCount : asteriskCount;
        if (widthChars > 0) {
          if (placeholderText) {
            props.width = Math.max(placeholderText.length + 6, widthChars);
          } else {
            props.width = widthChars;
          }
        }
        if (labelLinesAreButtons) {
          return {
            type: "container",
            containerType: "button-group",
            props: {},
            children: [...parseLabelAsButtons(), { type: "input", props }]
          };
        }
        return {
          type: "container",
          containerType: "form-group",
          props: {},
          children: [
            labelLines ? { type: "text", content: labelLines } : null,
            {
              type: "input",
              props
            }
          ].filter(Boolean)
        };
      }
    }
    if (/\[([^\]]+)\]/.test(lastLine)) {
      const textareaMatch = lastLine.match(/^\[([^\]]+)\](?:\s*(\{[^}]*rows:[^}]*\}))$/);
      if (textareaMatch) {
        const [, placeholder, attrs] = textareaMatch;
        const props = parseAttributes(attrs || "");
        if (labelLinesAreButtons) {
          return {
            type: "container",
            containerType: "button-group",
            props: {},
            children: [...parseLabelAsButtons(), {
              type: "textarea",
              props: { ...props, placeholder: placeholder.trim() }
            }]
          };
        }
        return {
          type: "container",
          containerType: "form-group",
          props: {},
          children: [
            labelLines ? { type: "text", content: labelLines } : null,
            {
              type: "textarea",
              props: {
                ...props,
                placeholder: placeholder.trim()
              }
            }
          ].filter(Boolean)
        };
      }
      const buttonPattern = /\[([^\]]+)\](\*)?(?:\s*(\{[^}]*\}))?/g;
      const buttons = [];
      let match;
      const isInputTextMulti = (t) => /^[_*]+$/.test(t) || /_{3,}$/.test(t);
      while ((match = buttonPattern.exec(lastLine)) !== null) {
        const [, text, isPrimary, attrs] = match;
        const props = parseAttributes(attrs || "");
        if (isInputTextMulti(text) || "rows" in props) continue;
        if (isPrimary) props.variant = "primary";
        buttons.push({ type: "button", content: text, props });
      }
      if (buttons.length > 0) {
        if (labelLinesAreButtons) {
          return {
            type: "container",
            containerType: "button-group",
            props: {},
            children: [...parseLabelAsButtons(), ...buttons]
          };
        }
        if (labelLines) {
          return {
            type: "container",
            containerType: "form-group",
            props: {},
            children: [
              { type: "text", content: labelLines },
              ...buttons
            ]
          };
        }
        if (buttons.length === 1) {
          return buttons[0];
        }
        return {
          type: "container",
          containerType: "button-group",
          props: {},
          children: buttons
        };
      }
    }
  }
  const dropdownMatch = content.match(/^\[([^\]]+)v\](?:\s*(\{[^}]+\}))?$/);
  if (dropdownMatch) {
    const [, text, attrs] = dropdownMatch;
    const props = parseAttributes(attrs || "");
    const options = [];
    if (nextNode && nextNode.type === "list") {
      for (const item of nextNode.children || []) {
        const itemText = extractTextContent(item);
        options.push({
          type: "option",
          value: itemText,
          label: itemText,
          selected: false
        });
      }
    }
    return {
      type: "select",
      props: {
        ...props,
        placeholder: text.replace(/[_\s]+$/, "").trim() || void 0
      },
      options
    };
  }
  if (/^\[[^\]]*[_*][^\]]*\](?:\s*\{[^}]+\})?$/.test(content)) {
    const match = content.match(/^\[([^\]]+)\](?:\s*(\{[^}]+\}))?$/);
    if (match) {
      const [, pattern, attrs] = match;
      const props = parseAttributes(attrs || "");
      if (pattern.includes("*") && pattern.replace(/[^*]/g, "").length > 3) {
        props.inputType = "password";
      } else {
        const placeholderMatch = pattern.match(/^([^_*]+)[_*]/);
        if (placeholderMatch) {
          props.placeholder = placeholderMatch[1].trim();
        }
      }
      return {
        type: "input",
        props
      };
    }
  }
  const singleTextareaMatch = content.match(/^\[([^\]]+)\](?:\s*(\{[^}]*rows:[^}]*\}))$/);
  if (singleTextareaMatch) {
    const [, placeholder, attrs] = singleTextareaMatch;
    const props = parseAttributes(attrs || "");
    return {
      type: "textarea",
      props: {
        ...props,
        placeholder: placeholder.trim()
      }
    };
  }
  if (/\|([^|]+)\|/.test(content)) {
    const textParts = content.split(/(\|[^|]+\|(?:\s*\{[^}]*\})?)/);
    const children = [];
    const validVariants = ["default", "primary", "success", "warning", "error"];
    for (const part of textParts) {
      const pillMatch = part.match(/^\|([^|]+)\|(?:\s*(\{[^}]*\}))?$/);
      if (pillMatch) {
        const [, text, attrs] = pillMatch;
        const props = parseAttributes(attrs || "");
        const variantClass = (_c = props.classes) == null ? void 0 : _c.find((c) => validVariants.includes(c));
        if (variantClass) {
          props.variant = variantClass;
          props.classes = props.classes.filter((c) => c !== variantClass);
        }
        children.push({ type: "badge", content: text.trim(), props });
      } else if (part.trim()) {
        children.push({ type: "text", content: part, props: {} });
      }
    }
    if (children.length === 1 && children[0].type === "badge") {
      return children[0];
    }
    if (children.length > 0) {
      return {
        type: "paragraph",
        children,
        props: {}
      };
    }
  }
  if (/\[([^\]]+)\]/.test(content)) {
    const buttonPattern = /\[([^\]]+)\](\*)?(?:\s*(\{[^}]*\}))?/g;
    const elements = [];
    let match;
    const isInputText = (t) => /^[_*]+$/.test(t) || /_{3,}$/.test(t);
    const isSelectText = (t) => /_{1,}v$/.test(t);
    while ((match = buttonPattern.exec(content)) !== null) {
      const [, text, isPrimary, attrs] = match;
      const props = parseAttributes(attrs || "");
      if (isSelectText(text)) {
        const placeholder = text.replace(/_{1,}v$/, "").trim() || void 0;
        if (placeholder) props.placeholder = placeholder;
        elements.push({ type: "select", props, options: [] });
        continue;
      }
      if (isInputText(text)) {
        const placeholderMatch = text.match(/^([^_*]+)_{3,}$/);
        if (placeholderMatch) props.placeholder = placeholderMatch[1].trim();
        elements.push({ type: "input", props });
        continue;
      }
      if ("rows" in props) continue;
      if (isPrimary) props.variant = "primary";
      if (/:([a-z-]+):/.test(text)) {
        const iconPattern = /:([a-z-]+):/g;
        const parts = text.split(iconPattern);
        const children = [];
        for (let i = 0; i < parts.length; i++) {
          if (i % 2 === 0) {
            if (parts[i].trim()) {
              children.push({ type: "text", content: parts[i], props: {} });
            }
          } else {
            children.push({ type: "icon", props: { name: parts[i] } });
          }
        }
        elements.push({ type: "button", content: "", children, props });
      } else {
        elements.push({ type: "button", content: text, props });
      }
    }
    const buttons = elements.filter((e) => e.type === "button");
    const hasMixed = elements.some((e) => e.type !== "button");
    if (elements.length === 1 && content.trim() === content.match(/\[([^\]]+)\](\*)?(?:\s*\{[^}]*\})?/)[0]) {
      return elements[0];
    } else if (elements.length > 0) {
      const remainingText = content.replace(/\[([^\]]+)\](\*)?(?:\s*\{[^}]*\})?/g, "").trim();
      if (!remainingText && elements.length > 1) {
        return {
          type: "container",
          containerType: "button-group",
          props: {},
          children: elements
        };
      } else if (!remainingText && buttons.length === 1 && !hasMixed) {
        return buttons[0];
      } else if (!remainingText && elements.length === 1) {
        return elements[0];
      } else if (remainingText) {
        const children = [];
        let lastIndex = 0;
        const buttonMatches = Array.from(content.matchAll(/\[([^\]]+)\](\*)?(?:\s*(\{[^}]*\}))?/g));
        buttonMatches.forEach((match2, idx) => {
          const textBefore = content.substring(lastIndex, match2.index);
          if (textBefore.trim()) {
            children.push({ type: "text", content: textBefore, props: {} });
          }
          children.push(buttons[idx]);
          lastIndex = match2.index + match2[0].length;
        });
        const textAfter = content.substring(lastIndex);
        if (textAfter.trim()) {
          children.push({ type: "text", content: textAfter, props: {} });
        }
        return {
          type: "paragraph",
          children,
          props: {}
        };
      }
    }
  }
  if (/:([a-z-]+):/.test(content)) {
    const iconPattern = /:([a-z-]+):/g;
    const textParts = content.split(iconPattern);
    const children = [];
    for (let i = 0; i < textParts.length; i++) {
      if (i % 2 === 0) {
        if (textParts[i].trim()) {
          children.push({
            type: "text",
            content: textParts[i],
            props: {}
          });
        }
      } else {
        children.push({
          type: "icon",
          props: { name: textParts[i] }
        });
      }
    }
    if (children.length > 0) {
      if (children.length === 1 && children[0].type === "icon") {
        return children[0];
      }
      if (children.length === 1 && children[0].type === "text") {
        return {
          type: "paragraph",
          content: children[0].content,
          props: {}
        };
      }
      const cleanedChildren = [...children];
      if (cleanedChildren.length > 0) {
        const lastChild = cleanedChildren[cleanedChildren.length - 1];
        if (lastChild.type === "text" && lastChild.content) {
          const cleaned = lastChild.content.replace(/\s*:::\s*$/, "").trim();
          if (cleaned) {
            cleanedChildren[cleanedChildren.length - 1] = { ...lastChild, content: cleaned };
          } else {
            cleanedChildren.pop();
          }
        }
      }
      return {
        type: "paragraph",
        children: cleanedChildren,
        props: {}
      };
    }
  }
  const iconMatch = content.match(/^:([a-z-]+):$/);
  if (iconMatch) {
    return {
      type: "icon",
      props: {
        name: iconMatch[1]
      }
    };
  }
  const cleanedContent = content.replace(/\s*:::\s*$/, "").trim();
  return {
    type: "paragraph",
    content: cleanedContent,
    props: {}
  };
}
function transformList(node, options) {
  const children = [];
  for (const item of node.children) {
    const transformed = transformNode(item, options);
    if (transformed) {
      children.push(transformed);
    }
  }
  return {
    type: "list",
    ordered: node.ordered || false,
    props: {},
    children
  };
}
function transformListItem(node, options) {
  let immediateContent = "";
  const nestedChildren = [];
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      if (child.type === "paragraph" && !immediateContent) {
        immediateContent = extractTextContent(child);
      } else if (child.type === "list") {
        const transformed = transformList(child, options);
        if (transformed) {
          nestedChildren.push(transformed);
        }
      }
    }
  }
  const content = immediateContent || extractTextContent(node);
  if (node.checked !== null && node.checked !== void 0) {
    const attrMatch = content.match(/^(.+?)(\{[^}]+\})$/);
    let label = content;
    let props = {};
    if (attrMatch) {
      label = attrMatch[1].trim();
      props = parseAttributes(attrMatch[2]);
    }
    if (/:([a-z-]+):/.test(label)) {
      const iconPattern = /:([a-z-]+):/g;
      const parts = label.split(iconPattern);
      const children = [];
      for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
          if (parts[i].trim()) {
            children.push({
              type: "text",
              content: parts[i],
              props: {}
            });
          }
        } else {
          children.push({
            type: "icon",
            props: { name: parts[i] }
          });
        }
      }
      if (nestedChildren.length > 0) {
        children.push(...nestedChildren);
      }
      return {
        type: "checkbox",
        label: "",
        // Will use children instead
        checked: node.checked === true,
        props: { ...props, hasChildren: true },
        children
      };
    }
    return {
      type: "checkbox",
      label,
      checked: node.checked === true,
      props,
      children: nestedChildren.length > 0 ? nestedChildren : void 0
    };
  }
  const radioMatch = content.match(/^\(([•x* ])\)\s*(.+)$/);
  if (radioMatch) {
    let label = radioMatch[2];
    const attrMatch = label.match(/^(.+?)(\{[^}]+\})$/);
    let props = {};
    if (attrMatch) {
      label = attrMatch[1].trim();
      props = parseAttributes(attrMatch[2]);
    }
    return {
      type: "radio",
      label,
      selected: radioMatch[1] !== " ",
      props,
      children: nestedChildren.length > 0 ? nestedChildren : void 0
    };
  }
  if (/:([a-z-]+):/.test(content)) {
    const iconPattern = /:([a-z-]+):/g;
    const parts = content.split(iconPattern);
    const children = [];
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        if (parts[i].trim()) {
          children.push({
            type: "text",
            content: parts[i],
            props: {}
          });
        }
      } else {
        children.push({
          type: "icon",
          props: { name: parts[i] }
        });
      }
    }
    if (nestedChildren.length > 0) {
      children.push(...nestedChildren);
    }
    return {
      type: "list-item",
      children,
      props: {}
    };
  }
  return {
    type: "list-item",
    content,
    props: {},
    children: nestedChildren.length > 0 ? nestedChildren : void 0
  };
}
function transformTable(node, options) {
  const children = [];
  const align = node.align || [];
  for (let rowIndex = 0; rowIndex < node.children.length; rowIndex++) {
    const row = node.children[rowIndex];
    const isHeader = rowIndex === 0;
    const cells = [];
    for (let cellIndex = 0; cellIndex < row.children.length; cellIndex++) {
      const cell = row.children[cellIndex];
      const cellAlign = align[cellIndex] || "left";
      const cellChildren = [];
      for (const child of cell.children || []) {
        if (child.type === "text") {
          const iconMatch = /^:([a-z-]+):\s*([\s\S]*)$/.exec(child.value);
          if (iconMatch) {
            cellChildren.push({
              type: "icon",
              props: { name: iconMatch[1] }
            });
            const remainder = iconMatch[2].trim();
            if (remainder) {
              cellChildren.push({
                type: "text",
                content: remainder,
                props: {}
              });
            }
          } else {
            cellChildren.push({
              type: "text",
              content: child.value,
              props: {}
            });
          }
        } else if (child.type === "strong") {
          cellChildren.push({
            type: "text",
            content: `<strong>${extractTextContent(child)}</strong>`,
            props: {}
          });
        } else if (child.type === "emphasis") {
          cellChildren.push({
            type: "text",
            content: `<em>${extractTextContent(child)}</em>`,
            props: {}
          });
        } else if (child.type === "code") {
          cellChildren.push({
            type: "text",
            content: `<code>${extractTextContent(child)}</code>`,
            props: {}
          });
        } else {
          const transformed = transformNode(child, options);
          if (transformed) {
            cellChildren.push(transformed);
          }
        }
      }
      cells.push({
        type: "table-cell",
        content: extractTextContent(cell),
        children: cellChildren.length > 0 ? cellChildren : void 0,
        align: cellAlign,
        header: isHeader
      });
    }
    if (isHeader) {
      children.push({
        type: "table-header",
        children: cells
      });
    } else {
      children.push({
        type: "table-row",
        children: cells
      });
    }
  }
  return {
    type: "table",
    props: {},
    children
  };
}
function transformBlockquote(node, options) {
  const children = [];
  for (const child of node.children) {
    const transformed = transformNode(child, options);
    if (transformed) {
      children.push(transformed);
    }
  }
  return {
    type: "blockquote",
    props: {},
    children
  };
}
function extractTextContent(node) {
  if (typeof node === "string") {
    return node;
  }
  if (node.value) {
    return node.value;
  }
  if (node.children && Array.isArray(node.children)) {
    return node.children.map(extractTextContent).join("");
  }
  return "";
}
function parseAttributes(attrString) {
  const props = {
    classes: []
  };
  if (!attrString) {
    return props;
  }
  if (attrString.startsWith("{") && attrString.endsWith("}") && attrString.slice(1, -1).includes("} {")) {
    const merged = { classes: [] };
    for (const group of attrString.match(/\{[^}]+\}/g) || []) {
      const sub = parseAttributes(group);
      for (const cls of sub.classes || []) merged.classes.push(cls);
      for (const [k, v] of Object.entries(sub)) {
        if (k === "classes") continue;
        merged[k] = v;
      }
    }
    return merged;
  }
  const inner = attrString.replace(/^\{|\}$/g, "").trim();
  if (!inner) {
    return props;
  }
  const parts = inner.match(/\S+:"[^"]*"|\S+:'[^']*'|\S+/g) ?? [];
  for (const part of parts) {
    if (part.startsWith(".")) {
      props.classes.push(part.slice(1));
    } else if (part.startsWith(":")) {
      props.state = part.slice(1);
    } else if (part.includes(":")) {
      const [key, value] = part.split(":", 2);
      const unquoted = value.replace(/^["']|["']$/g, "");
      props[key] = unquoted || true;
    } else {
      props[part] = true;
    }
  }
  return props;
}
function parseContainerOpener(node) {
  var _a;
  if (node.type !== "paragraph" || !((_a = node.children) == null ? void 0 : _a.length) || node.children[0].type !== "text")
    return null;
  const firstLine = node.children[0].value.split("\n")[0].trim();
  const match = firstLine.match(/^:::\s*(\S+)((?:\s*\{[^}]+\})*)\s*(.*)$/);
  if (!match) return null;
  const attrs = (match[2] || "").trim();
  const inline = (match[3] || "").trim();
  return {
    containerType: (match[1] || "section").trim(),
    attrs,
    inline
  };
}
function isContainerCloser(node) {
  var _a;
  return node.type === "paragraph" && ((_a = node.children) == null ? void 0 : _a.length) > 0 && node.children[0].type === "text" && node.children[0].value.trim() === ":::";
}
function makeContainerNode(containerType, attrs, children) {
  return {
    // Use a custom mdast type that does not collide with any remark-gfm
    // directive (e.g. `container`, `containerDirective`). Otherwise gfm's
    // directive normalizer walks our node, eats the trailing `{attrs}` chunk
    // as a `children` paragraph, and zeroes our `attributes` field.
    type: "wiremdBlock",
    containerType,
    attributes: attrs,
    children,
    data: {
      hName: "div",
      hProperties: {
        className: ["wiremd-container", `wiremd-${containerType}`]
      }
    }
  };
}
function stripTrailingClosers(value) {
  const match = value.match(/(?:\n:::)+$/) ?? (value.trim() === ":::" ? [value] : null);
  if (!match) return [value, 0];
  const count = (match[0].match(/:::/g) || []).length;
  return [value.slice(0, value.length - match[0].length), count];
}
function finishContainer(containerType, attrs, inline, children, nextIndex, extraClosers = 0) {
  const node = makeContainerNode(containerType, attrs, children);
  if (inline) node.inline = inline;
  if (containerType === "demo") {
    node.rawContent = mdastNodesToText(children);
  }
  return { node, nextIndex, extraClosers };
}
const MAX_CONTAINER_DEPTH = 100;
function collectContainer(nodes, startIdx, depth = 0) {
  var _a;
  const openerNode = nodes[startIdx];
  const opener = parseContainerOpener(openerNode);
  if (openerNode.children.length === 1 && openerNode.children[0].type === "text") {
    const fullText = openerNode.children[0].value;
    const lines = fullText.split("\n");
    let closingIdx = -1;
    let closerCount = 0;
    for (let j = lines.length - 1; j >= 1; j--) {
      if (lines[j].trim() === ":::") {
        closerCount++;
        closingIdx = j;
      } else break;
    }
    if (closingIdx > 0) {
      const contentText = lines.slice(1, closingIdx).join("\n").trim();
      const children = [];
      if (opener.inline) {
        children.push({
          type: "paragraph",
          children: [{ type: "text", value: opener.inline }]
        });
      }
      if (contentText) {
        children.push({
          type: "paragraph",
          children: [{ type: "text", value: contentText }]
        });
      }
      return finishContainer(opener.containerType, opener.attrs, opener.inline, children, startIdx + 1, closerCount - 1);
    }
  }
  const lastChild = openerNode.children[openerNode.children.length - 1];
  if ((lastChild == null ? void 0 : lastChild.type) === "text" && (lastChild.value.trim().endsWith(":::") || /\n:::\s*$/.test(lastChild.value))) {
    const [strippedLast, strippedCount] = stripTrailingClosers(lastChild.value);
    const processedChildren = [];
    let startChildIdx = 0;
    if (openerNode.children[0].type === "text") {
      const firstLines = openerNode.children[0].value.split("\n");
      if (firstLines.length > 1 && firstLines[1].trim()) {
        processedChildren.push({
          type: "text",
          value: firstLines.slice(1).join("\n").trim()
        });
      }
      startChildIdx = 1;
    }
    for (let j = startChildIdx; j < openerNode.children.length; j++) {
      const ch = openerNode.children[j];
      if (j === openerNode.children.length - 1 && ch.type === "text") {
        const value = strippedLast.trim();
        if (value) processedChildren.push({ ...ch, value });
      } else {
        processedChildren.push(ch);
      }
    }
    const contentChildren = processedChildren.length > 0 ? [{ type: "paragraph", children: processedChildren }] : [];
    if (opener.inline) {
      contentChildren.unshift({
        type: "paragraph",
        children: [{ type: "text", value: opener.inline }]
      });
    }
    return finishContainer(opener.containerType, opener.attrs, opener.inline, contentChildren, startIdx + 1, Math.max(0, strippedCount - 1));
  }
  const containerChildren = [];
  if (opener.inline) {
    containerChildren.push({
      type: "paragraph",
      children: [{ type: "text", value: opener.inline }]
    });
  }
  let pendingAfterOpener = null;
  if (openerNode.children.length === 1 && openerNode.children[0].type === "text") {
    const fullText = openerNode.children[0].value;
    const afterOpener = fullText.split("\n").slice(1).join("\n").trim();
    if (afterOpener) {
      const syntheticPara = {
        type: "paragraph",
        children: [{ type: "text", value: afterOpener }]
      };
      if (parseContainerOpener(syntheticPara)) {
        pendingAfterOpener = syntheticPara;
      } else {
        containerChildren.push(syntheticPara);
      }
    }
  }
  let i = startIdx + 1;
  if (pendingAfterOpener) {
    const virtualNodes = [pendingAfterOpener, ...nodes.slice(startIdx + 1)];
    const inner = collectContainer(virtualNodes, 0, depth + 1);
    containerChildren.push(inner.node);
    i = startIdx + inner.nextIndex;
    if (inner.extraClosers > 0) {
      return finishContainer(opener.containerType, opener.attrs, opener.inline, containerChildren, i, inner.extraClosers - 1);
    }
  }
  while (i < nodes.length) {
    const child = nodes[i];
    if (isContainerCloser(child)) {
      i++;
      break;
    }
    if (parseContainerOpener(child)) {
      if (depth >= MAX_CONTAINER_DEPTH) {
        containerChildren.push(child);
        i++;
        continue;
      }
      const inner = collectContainer(nodes, i, depth + 1);
      containerChildren.push(inner.node);
      i = inner.nextIndex;
      if (inner.extraClosers > 0) {
        return finishContainer(opener.containerType, opener.attrs, opener.inline, containerChildren, i, inner.extraClosers - 1);
      }
      continue;
    }
    if (child.type === "paragraph" && ((_a = child.children) == null ? void 0 : _a.length)) {
      const lastInline = child.children[child.children.length - 1];
      if ((lastInline == null ? void 0 : lastInline.type) === "text" && lastInline.value.includes("\n:::")) {
        const [stripped, closerCount] = stripTrailingClosers(lastInline.value);
        const trimmed = stripped.trimEnd();
        if (trimmed || child.children.length > 1) {
          containerChildren.push({
            ...child,
            children: [
              ...child.children.slice(0, -1),
              ...trimmed ? [{ ...lastInline, value: trimmed }] : []
            ]
          });
        }
        return finishContainer(opener.containerType, opener.attrs, opener.inline, containerChildren, i + 1, Math.max(0, closerCount - 1));
      }
    }
    containerChildren.push(child);
    i++;
  }
  return finishContainer(opener.containerType, opener.attrs, opener.inline, containerChildren, i);
}
function mdastInlinesToText(children) {
  return (children || []).map((child) => {
    switch (child.type) {
      case "text":
        return child.value;
      case "strong":
        return "**" + mdastInlinesToText(child.children) + "**";
      case "emphasis":
        return "_" + mdastInlinesToText(child.children) + "_";
      case "inlineCode":
        return "`" + child.value + "`";
      case "link":
        return "[" + mdastInlinesToText(child.children) + "](" + child.url + ")";
      case "image":
        return "![" + (child.alt || "") + "](" + child.url + ")";
      default:
        return "";
    }
  }).join("");
}
function mdastNodesToText(nodes) {
  return nodes.map((node) => {
    var _a, _b, _c;
    switch (node.type) {
      case "heading":
        return "#".repeat(node.depth) + " " + mdastInlinesToText(node.children);
      case "paragraph":
        return mdastInlinesToText(node.children);
      case "list":
        return node.children.map((item) => {
          const prefix = node.ordered ? "1. " : item.checked === true ? "- [x] " : item.checked === false ? "- [ ] " : "- ";
          return prefix + mdastNodesToText(item.children || []).replace(/\n/g, "\n  ");
        }).join("\n");
      case "table": {
        const rows = node.children.map(
          (row) => row.children.map((cell) => mdastInlinesToText(cell.children || []))
        );
        if (!rows.length) return "";
        const colWidths = rows[0].map(
          (_, ci) => Math.max(...rows.map((r) => (r[ci] || "").length), 3)
        );
        const formatRow = (cells) => "| " + cells.map((c, i) => c.padEnd(colWidths[i])).join(" | ") + " |";
        const separator = "| " + colWidths.map((w) => "-".repeat(w)).join(" | ") + " |";
        return [formatRow(rows[0]), separator, ...rows.slice(1).map(formatRow)].join("\n");
      }
      case "code":
        return "```" + (node.lang || "") + "\n" + node.value + "\n```";
      case "blockquote":
        return mdastNodesToText(node.children).split("\n").map((l) => "> " + l).join("\n");
      case "wiremdBlock": {
        const inlineSuffix = node.inline ? " " + node.inline : "";
        const attrs = node.attributes ? " " + node.attributes : "";
        const opener = "::: " + node.containerType + inlineSuffix + attrs;
        let children = node.children || [];
        if (node.inline) {
          const first = children[0];
          if ((first == null ? void 0 : first.type) === "paragraph" && ((_a = first.children) == null ? void 0 : _a.length) === 1 && ((_b = first.children[0]) == null ? void 0 : _b.type) === "text" && ((_c = first.children[0].value) == null ? void 0 : _c.trim()) === node.inline) {
            children = children.slice(1);
          }
        }
        return opener + "\n" + mdastNodesToText(children) + "\n:::";
      }
      default:
        return "";
    }
  }).filter(Boolean).join("\n\n");
}
function explodeFlatContainerParagraph(node) {
  var _a;
  if (node.type !== "paragraph" || ((_a = node.children) == null ? void 0 : _a.length) !== 1 || node.children[0].type !== "text") {
    return null;
  }
  const lines = node.children[0].value.split("\n");
  if (!/^:::\s*\S+/.test(lines[0].trim())) return null;
  const isDirectiveLine = (line) => /^:::(\s|$)/.test(line.trim()) && line.trim().length >= 3;
  if (!lines.slice(1).some(isDirectiveLine)) return null;
  const out = [];
  let buffer = [];
  const flush = () => {
    if (buffer.length) {
      out.push({
        type: "paragraph",
        children: [{ type: "text", value: buffer.join("\n") }]
      });
      buffer = [];
    }
  };
  for (const line of lines) {
    if (isDirectiveLine(line)) {
      flush();
      out.push({
        type: "paragraph",
        children: [{ type: "text", value: line.trim() }]
      });
    } else {
      buffer.push(line);
    }
  }
  flush();
  return out.length > 1 ? out : null;
}
function processNodes(nodes) {
  const result = [];
  let i = 0;
  while (i < nodes.length) {
    const node = nodes[i];
    const exploded = explodeFlatContainerParagraph(node);
    if (exploded) {
      nodes.splice(i, 1, ...exploded);
      continue;
    }
    if (isContainerCloser(node)) {
      i++;
      continue;
    }
    if (parseContainerOpener(node)) {
      const { node: containerNode, nextIndex } = collectContainer(nodes, i);
      result.push(containerNode);
      i = nextIndex;
    } else {
      result.push(node);
      i++;
    }
  }
  return result;
}
const remarkWiremdContainers = () => {
  return (tree) => {
    tree.children = processNodes(tree.children);
  };
};
function serializeChild(c) {
  if (c.type === "link") {
    const text = (c.children || []).map(serializeChild).join("");
    const url = String(c.url ?? "").replace(/\(/g, "%28").replace(/\)/g, "%29");
    return `[${text}](${url})`;
  }
  if (c.type === "image") {
    return `![${c.alt || ""}](${c.url || ""})`;
  }
  if (c.type === "strong") return `**${(c.children || []).map(serializeChild).join("")}**`;
  if (c.type === "emphasis") return `*${(c.children || []).map(serializeChild).join("")}*`;
  if (c.type === "inlineCode") return "`" + (c.value || "") + "`";
  return c.value || "";
}
const remarkWiremdInlineContainers = () => {
  return (tree) => {
    const newChildren = [];
    for (const node of tree.children) {
      if (node.type === "paragraph" && node.children && node.children.length > 0) {
        const text = node.children.map(serializeChild).join("");
        const match = text.match(/^\[\[\s*(.+?)\s*\]\](\{[^}]+\})?$/);
        if (match) {
          const content = match[1];
          const attrs = match[2] || "";
          const items = content.split("|").map((item) => item.trim());
          newChildren.push({
            type: "wiremdInlineContainer",
            content,
            items,
            attributes: attrs.trim(),
            children: node.children,
            data: {
              hName: "nav",
              hProperties: {
                className: ["wiremd-nav"]
              }
            }
          });
          continue;
        }
      }
      newChildren.push(node);
    }
    tree.children = newChildren;
  };
};
function parse(input, options = {}, sink) {
  const processor = unified.unified().use(remarkParse).use(remarkGfm).use(remarkWiremdInlineContainers).use(remarkWiremdContainers);
  const mdast = processor.parse(input);
  const processed = processor.runSync(mdast);
  const wiremdAST = transformToWiremdAST(processed, options, sink);
  return wiremdAST;
}
function validate(ast, options = {}) {
  const errors = [];
  let currentNode;
  const pushError = (error) => {
    if (options.attachNodes && currentNode !== void 0) {
      errors.push({ ...error, node: currentNode });
    } else {
      errors.push(error);
    }
  };
  if (!ast.type || ast.type !== "document") {
    pushError({
      message: 'Root node must be of type "document"',
      code: "INVALID_ROOT_TYPE"
    });
    return errors;
  }
  if (!ast.meta) {
    pushError({
      message: "Document must have metadata",
      code: "MISSING_META"
    });
  }
  if (!Array.isArray(ast.children)) {
    pushError({
      message: "Document children must be an array",
      code: "INVALID_CHILDREN"
    });
    return errors;
  }
  function validateNode(node, path = []) {
    var _a, _b, _c, _d;
    currentNode = node;
    if (!node || typeof node !== "object") {
      pushError({
        message: "Node must be an object",
        path,
        code: "INVALID_NODE"
      });
      return;
    }
    if (!node.type) {
      pushError({
        message: "Node must have a type property",
        path,
        code: "MISSING_NODE_TYPE"
      });
      return;
    }
    const nodeType = node.type;
    const validTypes = [
      "container",
      "nav",
      "nav-item",
      "brand",
      "grid",
      "grid-item",
      "button",
      "input",
      "textarea",
      "select",
      "option",
      "checkbox",
      "radio",
      "radio-group",
      "form",
      "heading",
      "paragraph",
      "text",
      "image",
      "icon",
      "link",
      "list",
      "list-item",
      "table",
      "table-header",
      "table-row",
      "table-cell",
      "blockquote",
      "code",
      "tabs",
      "tab",
      "accordion",
      "accordion-item",
      "breadcrumbs",
      "breadcrumb-item",
      "alert",
      "badge",
      "separator",
      "row",
      "demo",
      "loading-state",
      "empty-state",
      "error-state"
    ];
    if (!validTypes.includes(nodeType)) {
      pushError({
        message: `Unknown component type: "${nodeType}". Must be one of: ${validTypes.join(", ")}`,
        path,
        code: "INVALID_COMPONENT_TYPE"
      });
      return;
    }
    switch (nodeType) {
      case "container":
        if (!node.containerType) {
          pushError({
            message: "Container must have a containerType property",
            path,
            code: "MISSING_CONTAINER_TYPE"
          });
        } else {
          const validContainerTypes = ["hero", "card", "modal", "sidebar", "footer", "alert", "grid", "layout", "section", "form-group", "button-group"];
          if (!validContainerTypes.includes(node.containerType)) {
            pushError({
              message: `Invalid containerType: "${node.containerType}". Must be one of: ${validContainerTypes.join(", ")}`,
              path,
              code: "INVALID_CONTAINER_TYPE"
            });
          }
        }
        if (!node.props || typeof node.props !== "object") {
          pushError({
            message: "Container must have a props object",
            path,
            code: "MISSING_PROPS"
          });
        }
        if (!Array.isArray(node.children)) {
          pushError({
            message: "Container must have a children array",
            path,
            code: "MISSING_CHILDREN"
          });
        }
        break;
      case "heading":
        if (!node.level || ![1, 2, 3, 4, 5, 6].includes(node.level)) {
          pushError({
            message: `Heading must have a level property between 1 and 6, got: ${node.level}`,
            path,
            code: "INVALID_HEADING_LEVEL"
          });
        }
        if (!node.content && !node.children) {
          pushError({
            message: "Heading must have either content or children",
            path,
            code: "MISSING_CONTENT"
          });
        }
        break;
      case "button":
        if (!node.props || typeof node.props !== "object") {
          pushError({
            message: "Button must have a props object",
            path,
            code: "MISSING_PROPS"
          });
        }
        if (!node.content && (!node.children || node.children.length === 0)) {
          pushError({
            message: "Button must have either content or children",
            path,
            code: "MISSING_CONTENT"
          });
        }
        if (((_a = node.props) == null ? void 0 : _a.variant) && !["primary", "secondary", "danger"].includes(node.props.variant)) {
          pushError({
            message: `Invalid button variant: "${node.props.variant}". Must be one of: primary, secondary, danger`,
            path,
            code: "INVALID_BUTTON_VARIANT"
          });
        }
        break;
      case "input":
        if (!node.props || typeof node.props !== "object") {
          pushError({
            message: "Input must have a props object",
            path,
            code: "MISSING_PROPS"
          });
        }
        if ((_b = node.props) == null ? void 0 : _b.inputType) {
          const validInputTypes = ["text", "email", "password", "tel", "url", "number", "date", "time", "datetime-local", "search"];
          if (!validInputTypes.includes(node.props.inputType)) {
            pushError({
              message: `Invalid inputType: "${node.props.inputType}". Must be one of: ${validInputTypes.join(", ")}`,
              path,
              code: "INVALID_INPUT_TYPE"
            });
          }
        }
        if (node.children) {
          pushError({
            message: "Input elements cannot have children",
            path,
            code: "INVALID_CHILDREN"
          });
        }
        break;
      case "textarea":
        if (!node.props || typeof node.props !== "object") {
          pushError({
            message: "Textarea must have a props object",
            path,
            code: "MISSING_PROPS"
          });
        }
        if (node.children) {
          pushError({
            message: "Textarea elements cannot have children",
            path,
            code: "INVALID_CHILDREN"
          });
        }
        break;
      case "select":
        if (!node.props || typeof node.props !== "object") {
          pushError({
            message: "Select must have a props object",
            path,
            code: "MISSING_PROPS"
          });
        }
        if (!Array.isArray(node.options)) {
          pushError({
            message: "Select must have an options array",
            path,
            code: "MISSING_OPTIONS"
          });
        } else {
          node.options.forEach((option, index) => {
            if (option.type !== "option") {
              pushError({
                message: `Select option must have type "option", got: "${option.type}"`,
                path: [...path, `options[${index}]`],
                code: "INVALID_OPTION_TYPE"
              });
            }
            if (!option.value && option.value !== "") {
              pushError({
                message: "Select option must have a value property",
                path: [...path, `options[${index}]`],
                code: "MISSING_OPTION_VALUE"
              });
            }
            if (!option.label && option.label !== "") {
              pushError({
                message: "Select option must have a label property",
                path: [...path, `options[${index}]`],
                code: "MISSING_OPTION_LABEL"
              });
            }
          });
        }
        break;
      case "checkbox":
        if (typeof node.checked !== "boolean") {
          pushError({
            message: "Checkbox must have a boolean checked property",
            path,
            code: "MISSING_CHECKED"
          });
        }
        if (!node.props || typeof node.props !== "object") {
          pushError({
            message: "Checkbox must have a props object",
            path,
            code: "MISSING_PROPS"
          });
        }
        break;
      case "radio":
        if (typeof node.selected !== "boolean") {
          pushError({
            message: "Radio button must have a boolean selected property",
            path,
            code: "MISSING_SELECTED"
          });
        }
        if (!node.label && node.label !== "") {
          pushError({
            message: "Radio button must have a label property",
            path,
            code: "MISSING_LABEL"
          });
        }
        if (!node.props || typeof node.props !== "object") {
          pushError({
            message: "Radio button must have a props object",
            path,
            code: "MISSING_PROPS"
          });
        }
        break;
      case "radio-group":
        if (!Array.isArray(node.children)) {
          pushError({
            message: "Radio group must have a children array",
            path,
            code: "MISSING_CHILDREN"
          });
        } else if (node.children.length === 0) {
          pushError({
            message: "Radio group must contain at least one radio button",
            path,
            code: "EMPTY_RADIO_GROUP"
          });
        }
        break;
      case "icon":
        if (!((_c = node.props) == null ? void 0 : _c.name)) {
          pushError({
            message: "Icon must have a props.name property",
            path,
            code: "MISSING_ICON_NAME"
          });
        }
        if (node.children) {
          pushError({
            message: "Icon elements cannot have children",
            path,
            code: "INVALID_CHILDREN"
          });
        }
        break;
      case "image":
        if (!node.src && node.src !== "") {
          pushError({
            message: "Image must have a src property",
            path,
            code: "MISSING_IMAGE_SRC"
          });
        }
        if (!node.alt && node.alt !== "") {
          pushError({
            message: "Image must have an alt property for accessibility",
            path,
            code: "MISSING_IMAGE_ALT"
          });
        }
        if (!node.props || typeof node.props !== "object") {
          pushError({
            message: "Image must have a props object",
            path,
            code: "MISSING_PROPS"
          });
        }
        if (node.children) {
          pushError({
            message: "Image elements cannot have children",
            path,
            code: "INVALID_CHILDREN"
          });
        }
        break;
      case "link":
        if (!node.href && node.href !== "") {
          pushError({
            message: "Link must have an href property",
            path,
            code: "MISSING_LINK_HREF"
          });
        }
        if (!node.props || typeof node.props !== "object") {
          pushError({
            message: "Link must have a props object",
            path,
            code: "MISSING_PROPS"
          });
        }
        break;
      case "grid":
        if (typeof node.columns !== "number" || node.columns < 1) {
          pushError({
            message: `Grid must have a columns property with a number >= 1, got: ${node.columns}`,
            path,
            code: "INVALID_GRID_COLUMNS"
          });
        }
        if (!Array.isArray(node.children)) {
          pushError({
            message: "Grid must have a children array",
            path,
            code: "MISSING_CHILDREN"
          });
        }
        break;
      case "text":
        if (!node.content && node.content !== "") {
          pushError({
            message: "Text node must have a content property",
            path,
            code: "MISSING_TEXT_CONTENT"
          });
        }
        if (node.children) {
          pushError({
            message: "Text nodes cannot have children",
            path,
            code: "INVALID_CHILDREN"
          });
        }
        break;
      case "code":
        if (!node.value && node.value !== "") {
          pushError({
            message: "Code node must have a value property",
            path,
            code: "MISSING_CODE_VALUE"
          });
        }
        break;
      case "table":
        if (!Array.isArray(node.children)) {
          pushError({
            message: "Table must have a children array",
            path,
            code: "MISSING_CHILDREN"
          });
        } else if (node.children.length === 0) {
          pushError({
            message: "Table must have at least one row",
            path,
            code: "EMPTY_TABLE"
          });
        }
        break;
      case "table-header":
      case "table-row":
        if (!Array.isArray(node.children)) {
          pushError({
            message: `${nodeType} must have a children array`,
            path,
            code: "MISSING_CHILDREN"
          });
        } else if (node.children.length === 0) {
          pushError({
            message: `${nodeType} must have at least one cell`,
            path,
            code: "EMPTY_TABLE_ROW"
          });
        }
        break;
      case "table-cell":
        if (node.align && !["left", "center", "right"].includes(node.align)) {
          pushError({
            message: `Invalid table cell alignment: "${node.align}". Must be one of: left, center, right`,
            path,
            code: "INVALID_CELL_ALIGNMENT"
          });
        }
        break;
      case "nav":
        if (!Array.isArray(node.children)) {
          pushError({
            message: "Nav must have a children array",
            path,
            code: "MISSING_CHILDREN"
          });
        }
        break;
      case "list":
        if (typeof node.ordered !== "boolean") {
          pushError({
            message: "List must have a boolean ordered property",
            path,
            code: "MISSING_ORDERED"
          });
        }
        if (!Array.isArray(node.children)) {
          pushError({
            message: "List must have a children array",
            path,
            code: "MISSING_CHILDREN"
          });
        }
        break;
      case "alert":
        if (!node.alertType) {
          pushError({
            message: "Alert must have an alertType property",
            path,
            code: "MISSING_ALERT_TYPE"
          });
        } else {
          const validAlertTypes = ["success", "info", "warning", "error"];
          if (!validAlertTypes.includes(node.alertType)) {
            pushError({
              message: `Invalid alertType: "${node.alertType}". Must be one of: ${validAlertTypes.join(", ")}`,
              path,
              code: "INVALID_ALERT_TYPE"
            });
          }
        }
        break;
      case "badge":
        if (!node.content && node.content !== "") {
          pushError({
            message: "Badge must have a content property",
            path,
            code: "MISSING_CONTENT"
          });
        }
        if ((_d = node.props) == null ? void 0 : _d.variant) {
          const validVariants = ["default", "primary", "success", "warning", "error"];
          if (!validVariants.includes(node.props.variant)) {
            pushError({
              message: `Invalid badge variant: "${node.props.variant}". Must be one of: ${validVariants.join(", ")}`,
              path,
              code: "INVALID_BADGE_VARIANT"
            });
          }
        }
        break;
      case "tab":
        if (!node.label && node.label !== "") {
          pushError({
            message: "Tab must have a label property",
            path,
            code: "MISSING_LABEL"
          });
        }
        if (typeof node.active !== "boolean") {
          pushError({
            message: "Tab must have a boolean active property",
            path,
            code: "MISSING_ACTIVE"
          });
        }
        break;
      case "accordion-item":
        if (!node.summary && node.summary !== "") {
          pushError({
            message: "Accordion item must have a summary property",
            path,
            code: "MISSING_SUMMARY"
          });
        }
        if (typeof node.expanded !== "boolean") {
          pushError({
            message: "Accordion item must have a boolean expanded property",
            path,
            code: "MISSING_EXPANDED"
          });
        }
        break;
    }
    validateNestedStructure(node, path);
    if (node.children && Array.isArray(node.children)) {
      const parentNode = currentNode;
      node.children.forEach((child, index) => {
        validateNode(child, [...path, `${nodeType}.children[${index}]`]);
      });
      currentNode = parentNode;
    }
  }
  function validateNestedStructure(node, path) {
    const nodeType = node.type;
    if (nodeType === "button" && node.children) {
      const hasNestedButton = node.children.some((child) => child.type === "button");
      if (hasNestedButton) {
        pushError({
          message: "Buttons cannot contain other buttons",
          path,
          code: "INVALID_NESTING"
        });
      }
    }
    if (["input", "textarea", "select"].includes(nodeType) && node.children) {
      pushError({
        message: `${nodeType} elements cannot have children`,
        path,
        code: "INVALID_CHILDREN"
      });
    }
    if (nodeType === "grid" && node.children) {
      const hasNonGridItems = node.children.some((child) => child.type !== "grid-item");
      if (hasNonGridItems) {
        pushError({
          message: "Grid should only contain grid-item children",
          path,
          code: "INVALID_GRID_CHILDREN"
        });
      }
    }
    if (nodeType === "radio-group" && node.children) {
      const hasNonRadio = node.children.some((child) => child.type !== "radio");
      if (hasNonRadio) {
        pushError({
          message: "Radio group should only contain radio button children",
          path,
          code: "INVALID_RADIO_GROUP_CHILDREN"
        });
      }
    }
    if (nodeType === "table" && node.children) {
      const firstChild = node.children[0];
      if (firstChild && firstChild.type !== "table-header") {
        pushError({
          message: "Table should start with a table-header",
          path,
          code: "MISSING_TABLE_HEADER"
        });
      }
      const hasInvalidChildren = node.children.some(
        (child) => !["table-header", "table-row"].includes(child.type)
      );
      if (hasInvalidChildren) {
        pushError({
          message: "Table can only contain table-header and table-row children",
          path,
          code: "INVALID_TABLE_CHILDREN"
        });
      }
    }
    if (["table-header", "table-row"].includes(nodeType) && node.children) {
      const hasInvalidChildren = node.children.some((child) => child.type !== "table-cell");
      if (hasInvalidChildren) {
        pushError({
          message: `${nodeType} can only contain table-cell children`,
          path,
          code: "INVALID_TABLE_ROW_CHILDREN"
        });
      }
    }
    if (nodeType === "nav" && node.children) {
      const validNavChildren = ["nav-item", "brand", "button"];
      const hasInvalidChildren = node.children.some(
        (child) => !validNavChildren.includes(child.type)
      );
      if (hasInvalidChildren) {
        pushError({
          message: "Nav should only contain nav-item, brand, or button children",
          path,
          code: "INVALID_NAV_CHILDREN"
        });
      }
    }
    if (nodeType === "tabs" && node.children) {
      const hasNonTab = node.children.some((child) => child.type !== "tab");
      if (hasNonTab) {
        pushError({
          message: "Tabs should only contain tab children",
          path,
          code: "INVALID_TABS_CHILDREN"
        });
      }
    }
    if (nodeType === "accordion" && node.children) {
      const hasNonAccordionItem = node.children.some((child) => child.type !== "accordion-item");
      if (hasNonAccordionItem) {
        pushError({
          message: "Accordion should only contain accordion-item children",
          path,
          code: "INVALID_ACCORDION_CHILDREN"
        });
      }
    }
    if (nodeType === "breadcrumbs" && node.children) {
      const hasNonBreadcrumbItem = node.children.some((child) => child.type !== "breadcrumb-item");
      if (hasNonBreadcrumbItem) {
        pushError({
          message: "Breadcrumbs should only contain breadcrumb-item children",
          path,
          code: "INVALID_BREADCRUMBS_CHILDREN"
        });
      }
    }
    if (nodeType === "list" && node.children) {
      const validListChildren = ["list-item", "checkbox", "radio"];
      const hasInvalidChildren = node.children.some(
        (child) => !validListChildren.includes(child.type)
      );
      if (hasInvalidChildren) {
        pushError({
          message: "List should only contain list-item, checkbox, or radio children",
          path,
          code: "INVALID_LIST_CHILDREN"
        });
      }
    }
  }
  if (ast.children) {
    ast.children.forEach((child, index) => {
      validateNode(child, [`root.children[${index}]`]);
    });
  }
  return errors;
}
exports.SYNTAX_VERSION = SYNTAX_VERSION;
exports.VERSION = VERSION;
exports.parse = parse;
exports.spansFromPosition = spansFromPosition;
exports.validate = validate;

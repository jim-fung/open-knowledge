"use strict";
const styles = require("./styles-O5hnORUn.cjs");
const ALLOWED_SCHEMES = /* @__PURE__ */ new Set(["http", "https", "mailto", "tel"]);
const SCHEME_RE = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
const NUMERIC_ENTITY_RE = /&#(x?[0-9a-f]+);/gi;
function decodeNumericEntity(match, digits) {
  const isHex = digits.startsWith("x") || digits.startsWith("X");
  const code = parseInt(isHex ? digits.slice(1) : digits, isHex ? 16 : 10);
  return code >= 32 && code <= 126 ? String.fromCharCode(code) : match;
}
function decodeForClassification(url) {
  return url.replace(/&colon;/gi, ":").replace(NUMERIC_ENTITY_RE, decodeNumericEntity);
}
function escapeHtmlText(text2) {
  return text2.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function escapeHtmlAttr(value) {
  return escapeHtmlText(value);
}
function escapeJsxText(text2) {
  return text2.replace(/[&<>{}]/g, (ch) => {
    switch (ch) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "{":
        return "{'{'}";
      default:
        return "{'}'}";
    }
  });
}
function escapeJsxAttr(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function safeUrl(url) {
  const trimmed = url.trim();
  if (trimmed === "") return trimmed;
  const decoded = decodeForClassification(trimmed);
  if (SCHEME_RE.test(decoded)) {
    const scheme = decoded.slice(0, decoded.indexOf(":")).toLowerCase();
    if (ALLOWED_SCHEMES.has(scheme)) return trimmed;
    throw new Error(`Unsafe URL: ${trimmed}`);
  }
  return trimmed;
}
function attrEscaped$3(format, value) {
  return format === "jsx" ? escapeJsxAttr(value) : escapeHtmlAttr(value);
}
function textEscaped$3(format, value) {
  return format === "jsx" ? escapeJsxText(value) : escapeHtmlText(value);
}
function attr$1(format, name, value) {
  if (value === void 0) return "";
  return ` ${name}="${attrEscaped$3(format, value)}"`;
}
function boolAttr$1(_format, name, value) {
  return value === true ? ` ${name}` : "";
}
function classAttr$8(format, classes) {
  return ` ${format === "jsx" ? "className" : "class"}="${attrEscaped$3(format, classes)}"`;
}
const BUTTON_CLASSES = {
  primary: "inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-zinc-950 bg-zinc-950 px-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50",
  secondary: "inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 shadow-sm transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50",
  danger: "inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-red-600 bg-red-600 px-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50"
};
const emitButton = (node, format, recurse) => {
  const variant = node.props.variant ?? "primary";
  const classes = BUTTON_CLASSES[variant];
  const disabled = node.props.state === "disabled";
  const inner = node.children && node.children.length > 0 ? node.children.map((child) => recurse(child, format)).join("") : textEscaped$3(format, node.content ?? "");
  if (node.href !== void 0) {
    const href = safeUrl(node.href);
    return `<a${attr$1(format, "href", href)}${classAttr$8(format, classes)}>${inner}</a>`;
  }
  const type = node.props.type ?? "button";
  return `<button${attr$1(format, "type", type)}${boolAttr$1(format, "disabled", disabled)}${classAttr$8(format, classes)}>${inner}</button>`;
};
const BADGE_VARIANTS = {
  default: "border-zinc-200 bg-white",
  primary: "border-zinc-950 bg-zinc-950",
  success: "border-emerald-200 bg-emerald-50",
  warning: "border-amber-200 bg-amber-50",
  error: "border-red-200 bg-red-50"
};
const BADGE_TEXT = {
  default: "text-zinc-700",
  primary: "text-white",
  success: "text-emerald-700",
  warning: "text-amber-700",
  error: "text-red-700"
};
const emitBadge = (node, format) => {
  const variant = node.props.variant ?? "default";
  const classes = `inline-flex items-center rounded-lg border ${BADGE_VARIANTS[variant]} px-2 py-0.5 text-xs font-medium ${BADGE_TEXT[variant]}`;
  return `<span${classAttr$8(format, classes)}>${textEscaped$3(format, node.content ?? "")}</span>`;
};
const ICON_SIZES = {
  small: "h-4 w-4",
  medium: "h-5 w-5",
  large: "h-6 w-6"
};
const emitIcon = (node, format) => {
  const size = node.props.size ?? "medium";
  const classes = `inline-flex ${ICON_SIZES[size]} shrink-0 items-center justify-center text-zinc-950`;
  const svgAttrs = format === "jsx" ? 'viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"' : 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  return `<span role="img"${attr$1(format, "aria-label", node.props.name)}${classAttr$8(format, classes)}><svg ${svgAttrs}><circle cx="12" cy="12" r="9" /></svg></span>`;
};
const CHECKBOX_INPUT_CLASSES = "h-4 w-4 shrink-0 rounded-lg border-zinc-300 accent-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-1 disabled:opacity-50";
const CHECKBOX_LABEL_CLASSES = "inline-flex items-center gap-2 text-sm text-zinc-950";
function checkboxInput(format, props, checked) {
  return `<input type="checkbox"${boolAttr$1(format, "checked", checked)}${boolAttr$1(format, "required", props.required)}${boolAttr$1(format, "disabled", props.disabled)}${classAttr$8(format, CHECKBOX_INPUT_CLASSES)} />`;
}
const emitCheckbox = (node, format, recurse) => {
  const input = checkboxInput(format, node.props, node.checked);
  const labelText = node.label !== void 0 ? textEscaped$3(format, node.label) : (node.children ?? []).map((child) => recurse(child, format)).join("");
  if (labelText === "") return input;
  return `<label${classAttr$8(format, CHECKBOX_LABEL_CLASSES)}>${input}${labelText}</label>`;
};
function attrEscaped$2(format, value) {
  return format === "jsx" ? escapeJsxAttr(value) : escapeHtmlAttr(value);
}
function textEscaped$2(format, value) {
  return format === "jsx" ? escapeJsxText(value) : escapeHtmlText(value);
}
function attr(format, name, value) {
  if (value === void 0) return "";
  return ` ${name}="${attrEscaped$2(format, String(value))}"`;
}
function boolAttr(_format, name, value) {
  return value === true ? ` ${name}` : "";
}
function classAttr$7(format, classes) {
  return ` ${format === "jsx" ? "className" : "class"}="${attrEscaped$2(format, classes)}"`;
}
const INPUT_CLASSES = "h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-1 disabled:opacity-50";
const TEXTAREA_CLASSES = "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-1 disabled:opacity-50";
const SELECT_CLASSES = "h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-1 disabled:opacity-50";
const emitInput = (node, format) => {
  const { inputType, placeholder, value, required, disabled } = node.props;
  return `<input${attr(format, "type", inputType ?? "text")}${attr(format, "value", value)}${attr(format, "placeholder", placeholder)}${boolAttr(format, "required", required)}${boolAttr(format, "disabled", disabled)}${classAttr$7(format, INPUT_CLASSES)} />`;
};
const emitTextarea = (node, format) => {
  const { rows, placeholder, value, required, disabled } = node.props;
  return `<textarea${attr(format, "rows", rows)}${attr(format, "placeholder", placeholder)}${boolAttr(format, "required", required)}${boolAttr(format, "disabled", disabled)}${classAttr$7(format, TEXTAREA_CLASSES)}>${textEscaped$2(format, value ?? "")}</textarea>`;
};
function optionFragment(format, option) {
  return `<option${attr(format, "value", option.value)}${boolAttr(format, "selected", option.selected)}>${textEscaped$2(format, option.label)}</option>`;
}
const emitSelect = (node, format) => {
  const { placeholder, required, disabled, multiple } = node.props;
  const nodeOptions = node.options ?? [];
  const hasSelected = nodeOptions.some((option) => option.selected === true);
  let options = nodeOptions.map((option) => optionFragment(format, option)).join("");
  if (placeholder !== void 0) {
    const placeholderSelected = boolAttr(format, "selected", !hasSelected);
    options = `<option value=""${boolAttr(format, "disabled", true)}${placeholderSelected}>${textEscaped$2(format, placeholder)}</option>` + options;
  }
  return `<select${boolAttr(format, "required", required)}${boolAttr(format, "disabled", disabled)}${boolAttr(format, "multiple", multiple)}${classAttr$7(format, SELECT_CLASSES)}>${options}</select>`;
};
const RADIO_INPUT_CLASSES = "h-4 w-4 shrink-0 rounded-lg border-zinc-300 accent-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-1 disabled:opacity-50";
const RADIO_LABEL_CLASSES = "inline-flex items-center gap-2 text-sm text-zinc-950";
const RADIO_FALLBACK_NAME = "radio-group";
const emitRadio = (node, format) => {
  const { name, value, required, disabled } = node.props;
  const input = `<input type="radio"${attr(format, "name", name ?? RADIO_FALLBACK_NAME)}${attr(format, "value", value)}${boolAttr(format, "checked", node.selected)}${boolAttr(format, "required", required)}${boolAttr(format, "disabled", disabled)}${classAttr$7(format, RADIO_INPUT_CLASSES)} />`;
  return `<label${classAttr$7(format, RADIO_LABEL_CLASSES)}>${input}${textEscaped$2(
    format,
    node.label ?? ""
  )}</label>`;
};
const emitRadioGroup = (node, format, recurse) => {
  const groupName = node.name ?? RADIO_FALLBACK_NAME;
  const children = (node.children ?? []).map(
    (child) => child.type === "radio" && child.props.name === void 0 ? { ...child, props: { ...child.props, name: groupName } } : child
  ).map((child) => recurse(child, format)).join("");
  const classes = node.props.inline === true ? "flex flex-wrap items-center gap-4" : "grid gap-2";
  return `<div${classAttr$7(format, classes)}>${children}</div>`;
};
function text(format, value) {
  return format === "jsx" ? escapeJsxText(value) : escapeHtmlText(value);
}
function attrValue(format, value) {
  return format === "jsx" ? escapeJsxAttr(value) : escapeHtmlAttr(value);
}
function classAttr$6(format, classes) {
  return ` ${format === "jsx" ? "className" : "class"}="${attrValue(format, classes)}"`;
}
function attrs(format, entries) {
  let out = "";
  for (const [name, value] of entries) {
    if (value === void 0) continue;
    out += ` ${name}="${attrValue(format, String(value))}"`;
  }
  return out;
}
function inlineBody(node, format, recurse) {
  if (node.children !== void 0 && node.children.length > 0) {
    return node.children.filter((child) => child != null).map((child) => recurse(child, format)).join("");
  }
  return text(format, node.content ?? "");
}
function childBody(children, format, recurse) {
  return (children ?? []).filter((child) => child != null).map((child) => recurse(child, format)).join("");
}
const HEADING_SIZE_CLASSES = {
  1: "text-3xl",
  2: "text-2xl",
  3: "text-xl",
  4: "text-lg",
  5: "text-base",
  6: "text-base"
};
const emitHeading = (node, format, recurse) => {
  const tag = `h${node.level}`;
  const classes = `${HEADING_SIZE_CLASSES[node.level] ?? "text-base"} font-semibold text-zinc-950`;
  return `<${tag}${classAttr$6(format, classes)}>${inlineBody(node, format, recurse)}</${tag}>`;
};
const emitParagraph = (node, format, recurse) => {
  return `<p${classAttr$6(format, "text-zinc-700 leading-6")}>${inlineBody(node, format, recurse)}</p>`;
};
const emitText = (node, format) => {
  return text(format, node.content ?? "");
};
const emitImage = (node, format) => {
  const src = safeUrl(node.src ?? "");
  const optional = attrs(format, [
    ["alt", node.alt],
    ["width", node.props.width],
    ["height", node.props.height],
    ["loading", node.props.loading]
  ]);
  return `<img src="${attrValue(format, src)}"${optional}${classAttr$6(format, "rounded-lg")} />`;
};
const emitLink = (node, format, recurse) => {
  const href = safeUrl(node.href ?? "");
  const optional = attrs(format, [["title", node.title]]);
  return `<a href="${attrValue(format, href)}"${optional}${classAttr$6(format, "text-zinc-950 underline underline-offset-2")}>${inlineBody(node, format, recurse)}</a>`;
};
const LIST_BASE_CLASSES = "pl-5 text-zinc-700 space-y-1";
const emitList = (node, format, recurse) => {
  const tag = node.ordered ? "ol" : "ul";
  const marker = node.ordered ? "list-decimal" : "list-disc";
  return `<${tag}${classAttr$6(format, `${marker} ${LIST_BASE_CLASSES}`)}>${childBody(node.children, format, recurse)}</${tag}>`;
};
const emitListItem = (node, format, recurse) => {
  return `<li>${inlineBody(node, format, recurse)}</li>`;
};
const emitTable = (node, format, recurse) => {
  const children = node.children ?? [];
  const head = children.filter((child) => child.type === "table-header").map((child) => recurse(child, format)).join("");
  const rows = children.filter((child) => child.type === "table-row").map((child) => recurse(child, format)).join("");
  const body = rows.length > 0 ? `<tbody>${rows}</tbody>` : "";
  return `<table${classAttr$6(format, "w-full text-sm")}>${head}${body}</table>`;
};
const emitTableHeader = (node, format, recurse) => {
  return `<thead>${childBody(node.children, format, recurse)}</thead>`;
};
const emitTableRow = (node, format, recurse) => {
  return `<tr>${childBody(node.children, format, recurse)}</tr>`;
};
const ALIGN_CLASSES = {
  left: "text-left",
  center: "text-center",
  right: "text-right"
};
const emitTableCell = (node, format, recurse) => {
  const isHeader = node.header === true;
  const align = node.align !== void 0 ? ALIGN_CLASSES[node.align] : void 0;
  const classes = isHeader ? `border-b border-zinc-200 font-medium text-zinc-500 ${align ?? "text-left"}` : `border-b border-zinc-200 text-zinc-700${align !== void 0 ? ` ${align}` : ""}`;
  const tag = isHeader ? "th" : "td";
  return `<${tag}${classAttr$6(format, classes)}>${inlineBody(node, format, recurse)}</${tag}>`;
};
const emitBlockquote = (node, format, recurse) => {
  return `<blockquote${classAttr$6(format, "border-l-2 border-zinc-200 pl-4 italic text-zinc-600")}>${childBody(node.children, format, recurse)}</blockquote>`;
};
const INLINE_CODE_CLASSES = "rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[.8125rem] text-zinc-600";
const BLOCK_CODE_CLASSES = "rounded-lg bg-zinc-900 p-4 font-mono text-sm text-zinc-50 overflow-x-auto";
const emitCode = (node, format) => {
  const value = text(format, node.value ?? "");
  if (node.inline === false) {
    const langClass = node.lang !== void 0 && node.lang !== "" ? classAttr$6(format, `language-${node.lang}`) : "";
    return `<pre${classAttr$6(format, BLOCK_CODE_CLASSES)}><code${langClass}>${value}</code></pre>`;
  }
  return `<code${classAttr$6(format, INLINE_CODE_CLASSES)}>${value}</code>`;
};
const SEPARATOR_CLASSES = "h-px w-full bg-zinc-200";
const emitSeparator = (_node, format) => {
  return format === "jsx" ? `<hr className="${SEPARATOR_CLASSES}" />` : `<hr class="${SEPARATOR_CLASSES}" />`;
};
function classAttr$5(format, classes) {
  return { name: format === "jsx" ? "className" : "class", value: classes };
}
function openTag$3(tag, attrs2, format) {
  const rendered = attrs2.map(
    (attr2) => attr2.value === void 0 ? attr2.name : `${attr2.name}="${format === "jsx" ? escapeJsxAttr(attr2.value) : escapeHtmlAttr(attr2.value)}"`
  );
  return `<${[tag, ...rendered].join(" ")}>`;
}
function element$3(tag, attrs2, children, format) {
  const open = openTag$3(tag, attrs2, format);
  const body = children.filter((fragment) => fragment.length > 0);
  if (body.length === 0) return `${open}</${tag}>`;
  return [open, ...body, `</${tag}>`].join("\n");
}
function inlineElement$2(tag, attrs2, text2, format) {
  return `${openTag$3(tag, attrs2, format)}${text2}</${tag}>`;
}
function escapeText$2(text2, format) {
  return format === "jsx" ? escapeJsxText(text2) : escapeHtmlText(text2);
}
function childFragments$5(children, format, recurse) {
  return (children ?? []).map((child) => recurse(child, format)).filter((fragment) => fragment.length > 0);
}
const NAV_CLASSES = "flex items-center gap-2 border-b border-zinc-200 bg-white px-4 py-3";
const NAV_ITEM_CLASSES = "text-zinc-500 hover:text-zinc-950";
const NAV_ITEM_ACTIVE_CLASSES = "text-zinc-950 font-medium";
const BRAND_CLASSES = "font-semibold text-zinc-950 mr-auto";
const emitNav = (node, format, recurse) => element$3("nav", [classAttr$5(format, NAV_CLASSES)], childFragments$5(node.children, format, recurse), format);
const emitNavItem = (node, format, recurse) => {
  var _a, _b, _c;
  const href = safeUrl(node.href ?? "#");
  const active = ((_a = node.props) == null ? void 0 : _a.state) === "active" || ((_c = (_b = node.props) == null ? void 0 : _b.classes) == null ? void 0 : _c.includes("active")) === true;
  const attrs2 = [{ name: "href", value: href }];
  if (active) attrs2.push({ name: "aria-current", value: "page" });
  attrs2.push(classAttr$5(format, active ? NAV_ITEM_ACTIVE_CLASSES : NAV_ITEM_CLASSES));
  if (node.children !== void 0 && node.children.length > 0) {
    return element$3("a", attrs2, childFragments$5(node.children, format, recurse), format);
  }
  return inlineElement$2("a", attrs2, escapeText$2(node.content ?? "", format), format);
};
const emitBrand = (node, format, recurse) => element$3("div", [classAttr$5(format, BRAND_CLASSES)], childFragments$5(node.children, format, recurse), format);
const TAB_LIST_CLASSES = "border-b border-zinc-200 flex gap-1";
const TAB_TRIGGER_ACTIVE_CLASSES = "border-b-2 border-zinc-950 px-3 py-2 text-sm font-medium text-zinc-950";
const TAB_TRIGGER_INACTIVE_CLASSES = "border-b-2 border-transparent px-3 py-2 text-sm text-zinc-500 hover:text-zinc-950";
const TAB_PANEL_CLASSES = "pt-4";
function tabTrigger(node, format) {
  const active = node.active === true;
  const attrs2 = [
    { name: "type", value: "button" },
    { name: "role", value: "tab" },
    { name: "aria-selected", value: active ? "true" : "false" },
    { name: "data-active", value: active ? "true" : "false" },
    classAttr$5(format, active ? TAB_TRIGGER_ACTIVE_CLASSES : TAB_TRIGGER_INACTIVE_CLASSES)
  ];
  return inlineElement$2("button", attrs2, escapeText$2(node.label ?? "", format), format);
}
const emitTabs = (node, format, recurse) => {
  const tabs = (node.children ?? []).filter((child) => child.type === "tab");
  const list = element$3(
    "div",
    [{ name: "role", value: "tablist" }, classAttr$5(format, TAB_LIST_CLASSES)],
    tabs.map((tab) => tabTrigger(tab, format)),
    format
  );
  const panels = tabs.map((tab) => recurse(tab, format)).filter((fragment) => fragment.length > 0);
  return element$3("div", [], [list, ...panels], format);
};
const emitTab = (node, format, recurse) => {
  const attrs2 = [classAttr$5(format, TAB_PANEL_CLASSES)];
  if (node.active !== true) attrs2.push({ name: "hidden" });
  return element$3("div", attrs2, childFragments$5(node.children, format, recurse), format);
};
const BREADCRUMB_LIST_CLASSES = "flex items-center gap-1.5 text-sm text-zinc-500";
const BREADCRUMB_LINK_CLASSES = "hover:text-zinc-950";
const BREADCRUMB_SEPARATOR_CLASSES = "text-zinc-300";
const BREADCRUMB_CURRENT_CLASSES = "text-zinc-950";
const emitBreadcrumbs = (node, format) => {
  var _a;
  const items = (node.children ?? []).filter(
    (child) => child.type === "breadcrumb-item"
  );
  const separator = ((_a = node.props) == null ? void 0 : _a.separator) === "chevron" ? "›" : "/";
  const lines = [];
  items.forEach((item, index) => {
    const isCurrent = item.current === true || index === items.length - 1;
    const label = escapeText$2(item.content ?? "", format);
    if (isCurrent) {
      const current = inlineElement$2(
        "span",
        [{ name: "aria-current", value: "page" }, classAttr$5(format, BREADCRUMB_CURRENT_CLASSES)],
        label,
        format
      );
      lines.push(inlineElement$2("li", [], current, format));
      return;
    }
    const link = inlineElement$2(
      "a",
      [{ name: "href", value: safeUrl(item.href ?? "#") }, classAttr$5(format, BREADCRUMB_LINK_CLASSES)],
      label,
      format
    );
    lines.push(inlineElement$2("li", [], link, format));
    lines.push(
      inlineElement$2(
        "li",
        [{ name: "aria-hidden", value: "true" }, classAttr$5(format, BREADCRUMB_SEPARATOR_CLASSES)],
        escapeText$2(separator, format),
        format
      )
    );
  });
  const list = element$3("ol", [classAttr$5(format, BREADCRUMB_LIST_CLASSES)], lines, format);
  return element$3("nav", [{ name: "aria-label", value: "breadcrumb" }], [list], format);
};
function flattenBracketItems(children) {
  const out = [];
  for (const child of children ?? []) {
    const anyChild = child;
    if (anyChild.type === "container" && anyChild.containerType === "button-group") {
      out.push(...anyChild.children ?? []);
    } else {
      out.push(child);
    }
  }
  return out;
}
function bracketItemActive(node) {
  var _a, _b;
  const classes = ((_a = node.props) == null ? void 0 : _a.classes) ?? [];
  return classes.includes("active") || ((_b = node.props) == null ? void 0 : _b.variant) === "primary";
}
const PAGINATION_LINK_CLASSES = "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium text-zinc-950 hover:bg-zinc-100";
const PAGINATION_LINK_ACTIVE_CLASSES = "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-sm font-medium text-zinc-950 shadow-sm";
const emitPagination = (node, format) => {
  var _a;
  const label = typeof ((_a = node.props) == null ? void 0 : _a.label) === "string" ? node.props.label : "pagination";
  const items = flattenBracketItems(node.children).filter(
    (i) => i.type === "button" || i.type === "nav-item"
  );
  const listItems = items.map((item) => {
    const active = bracketItemActive(item);
    const linkClasses = active ? PAGINATION_LINK_ACTIVE_CLASSES : PAGINATION_LINK_CLASSES;
    const attrs2 = [
      { name: "href", value: "#" },
      classAttr$5(format, linkClasses)
    ];
    if (active) attrs2.push({ name: "aria-current", value: "page" });
    const text2 = escapeText$2(item.content ?? "", format);
    return inlineElement$2("li", [], inlineElement$2("a", attrs2, text2, format), format);
  });
  const list = element$3("ul", [classAttr$5(format, "flex flex-row items-center gap-1")], listItems, format);
  return element$3("nav", [{ name: "aria-label", value: label }, classAttr$5(format, "mx-auto flex w-full justify-center")], [list], format);
};
const SEGMENTED_ITEM_CLASSES = "inline-flex h-8 items-center justify-center rounded-lg px-4 text-sm font-medium text-zinc-500 hover:text-zinc-950";
const SEGMENTED_ITEM_ACTIVE_CLASSES = "inline-flex h-8 items-center justify-center rounded-lg bg-white px-4 text-sm font-medium text-zinc-950 shadow-sm";
const emitSegmentedControl = (node, format) => {
  const items = flattenBracketItems(node.children).filter(
    (i) => i.type === "button" || i.type === "nav-item"
  );
  const buttons = items.map((item) => {
    const active = bracketItemActive(item);
    const attrs2 = [
      { name: "type", value: "button" },
      classAttr$5(format, active ? SEGMENTED_ITEM_ACTIVE_CLASSES : SEGMENTED_ITEM_CLASSES),
      { name: "aria-pressed", value: active ? "true" : "false" }
    ];
    const text2 = escapeText$2(item.content ?? "", format);
    return inlineElement$2("button", attrs2, text2, format);
  });
  return element$3(
    "div",
    [classAttr$5(format, "inline-flex items-center gap-0.5 rounded-lg bg-zinc-100 p-1"), { name: "role", value: "group" }],
    buttons,
    format
  );
};
const emitScrollArea = (node, format, recurse) => {
  var _a;
  const maxHeight = (_a = node.props) == null ? void 0 : _a.maxHeight;
  const styleValue = maxHeight !== void 0 ? `max-height:${typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight}` : void 0;
  const attrs2 = [
    classAttr$5(format, "relative size-full min-h-0 overflow-hidden rounded-lg border border-zinc-200")
  ];
  if (styleValue !== void 0) attrs2.push({ name: "style", value: styleValue });
  return element$3("div", attrs2, childFragments$5(node.children, format, recurse), format);
};
const SIDEBAR_ITEM_CLASSES = "flex h-8 w-full items-center gap-2 rounded-lg p-2 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950";
const SIDEBAR_ITEM_ACTIVE_CLASSES = "flex h-8 w-full items-center gap-2 rounded-lg bg-zinc-100 p-2 text-sm font-medium text-zinc-950";
const emitSidebar = (node, format, recurse) => {
  var _a;
  const title = typeof ((_a = node.props) == null ? void 0 : _a.title) === "string" ? node.props.title : void 0;
  const inner = (node.children ?? []).map((child) => {
    if (child.type === "list") {
      const items = (child.children ?? []).filter((li) => li.type === "list-item").map((li) => {
        var _a2;
        const active = (((_a2 = li.props) == null ? void 0 : _a2.classes) ?? []).includes("active");
        const text2 = escapeText$2((li.content ?? "").replace(/\s*:::\s*$/, "").trim(), format);
        return inlineElement$2(
          "a",
          [{ name: "href", value: "#" }, classAttr$5(format, active ? SIDEBAR_ITEM_ACTIVE_CLASSES : SIDEBAR_ITEM_CLASSES)],
          text2,
          format
        );
      });
      return element$3("nav", [classAttr$5(format, "flex flex-col gap-0.5")], items, format);
    }
    return recurse(child, format);
  }).filter((f) => f.length > 0);
  const header = title !== void 0 ? inlineElement$2("div", [classAttr$5(format, "px-2 pb-3 text-sm font-semibold text-zinc-950")], escapeText$2(title, format), format) : "";
  return element$3(
    "aside",
    [classAttr$5(format, "flex w-64 flex-col gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-3")],
    [header, ...inner],
    format
  );
};
const emitMenubar = (node, format, recurse) => element$3(
  "div",
  [classAttr$5(format, "flex w-fit items-center gap-0.5 rounded-lg border border-zinc-200 bg-zinc-50 p-1"), { name: "role", value: "menubar" }],
  childFragments$5(node.children, format, recurse),
  format
);
function classAttr$4(format, classes) {
  return { name: format === "jsx" ? "className" : "class", value: classes };
}
function openTag$2(tag, attrs2, format) {
  const rendered = attrs2.map(
    (attr2) => attr2.value === void 0 ? attr2.name : `${attr2.name}="${format === "jsx" ? escapeJsxAttr(attr2.value) : escapeHtmlAttr(attr2.value)}"`
  );
  return `<${[tag, ...rendered].join(" ")}>`;
}
function element$2(tag, attrs2, children, format) {
  const open = openTag$2(tag, attrs2, format);
  const body = children.filter((fragment) => fragment.length > 0);
  if (body.length === 0) return `${open}</${tag}>`;
  return [open, ...body, `</${tag}>`].join("\n");
}
function inlineElement$1(tag, attrs2, text2, format) {
  return `${openTag$2(tag, attrs2, format)}${text2}</${tag}>`;
}
function escapeText$1(text2, format) {
  return format === "jsx" ? escapeJsxText(text2) : escapeHtmlText(text2);
}
function childFragments$4(children, format, recurse) {
  return (children ?? []).map((child) => recurse(child, format)).filter((fragment) => fragment.length > 0);
}
const INPUT_BASE = "h-9 w-full min-w-0 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none placeholder:text-zinc-500";
const emitForm = (node, format, recurse) => {
  var _a, _b;
  const attrs2 = [classAttr$4(format, "flex flex-col gap-4")];
  if ((_a = node.props) == null ? void 0 : _a.action) attrs2.push({ name: "action", value: safeUrl(node.props.action) });
  if ((_b = node.props) == null ? void 0 : _b.method) attrs2.push({ name: "method", value: node.props.method });
  return element$2("form", attrs2, childFragments$4(node.children, format, recurse), format);
};
const emitField = (node, format, recurse) => {
  var _a, _b, _c;
  const children = [];
  if ((_a = node.props) == null ? void 0 : _a.label) {
    children.push(inlineElement$1("label", [classAttr$4(format, "text-sm font-medium text-zinc-950")], escapeText$1(node.props.label, format), format));
  }
  children.push(...childFragments$4(node.children, format, recurse));
  if ((_b = node.props) == null ? void 0 : _b.description) {
    children.push(inlineElement$1("p", [classAttr$4(format, "text-xs text-zinc-500")], escapeText$1(node.props.description, format), format));
  }
  if ((_c = node.props) == null ? void 0 : _c.error) {
    children.push(inlineElement$1("p", [{ name: "role", value: "alert" }, classAttr$4(format, "text-xs text-red-600")], escapeText$1(node.props.error, format), format));
  }
  return element$2("div", [classAttr$4(format, "flex flex-col items-start gap-2")], children, format);
};
const emitFieldset = (node, format, recurse) => {
  var _a, _b;
  const children = [];
  if ((_a = node.props) == null ? void 0 : _a.legend) {
    children.push(inlineElement$1("legend", [classAttr$4(format, "px-1 text-sm font-semibold text-zinc-950")], escapeText$1(node.props.legend, format), format));
  }
  if ((_b = node.props) == null ? void 0 : _b.description) {
    children.push(inlineElement$1("p", [classAttr$4(format, "text-xs text-zinc-500")], escapeText$1(node.props.description, format), format));
  }
  children.push(...childFragments$4(node.children, format, recurse));
  return element$2("fieldset", [classAttr$4(format, "flex flex-col gap-3 rounded-xl border border-zinc-200 p-4")], children, format);
};
const emitLabel = (node, format) => {
  var _a;
  const attrs2 = [classAttr$4(format, "text-sm font-medium text-zinc-950")];
  if ((_a = node.props) == null ? void 0 : _a.htmlFor) attrs2.push({ name: "for", value: node.props.htmlFor });
  return inlineElement$1("label", attrs2, escapeText$1(node.content, format), format);
};
const INPUT_GROUP_BASE = "flex w-full items-stretch overflow-hidden rounded-lg border border-zinc-200";
const emitInputGroup = (node, format, recurse) => {
  var _a, _b;
  const children = [];
  if ((_a = node.props) == null ? void 0 : _a.addonStart) {
    children.push(inlineElement$1("span", [classAttr$4(format, "inline-flex items-center border-r border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500")], escapeText$1(node.props.addonStart, format), format));
  }
  children.push(...childFragments$4(node.children, format, recurse));
  if ((_b = node.props) == null ? void 0 : _b.addonEnd) {
    children.push(inlineElement$1("span", [classAttr$4(format, "inline-flex items-center border-l border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500")], escapeText$1(node.props.addonEnd, format), format));
  }
  return element$2("div", [classAttr$4(format, INPUT_GROUP_BASE)], children, format);
};
const emitOtpField = (node, format) => {
  var _a, _b;
  const length = Number(((_a = node.props) == null ? void 0 : _a.length) ?? 6);
  const maxLength = Number(((_b = node.props) == null ? void 0 : _b.maxLength) ?? 1);
  const slots = Array.from(
    { length },
    () => inlineElement$1(
      "input",
      [
        classAttr$4(format, "h-11 w-10 rounded-lg border border-zinc-200 text-center text-base tabular-nums text-zinc-950 outline-none"),
        { name: "type", value: "text" },
        { name: "inputMode", value: "numeric" },
        { name: "maxLength", value: String(maxLength) },
        { name: "aria-label", value: "digit" }
      ],
      "",
      format
    ).replace("></input>", ">")
  );
  return element$2(
    "div",
    [classAttr$4(format, "flex gap-2"), { name: "role", value: "group" }, { name: "aria-label", value: "Verification code" }],
    slots,
    format
  );
};
const emitNumberField = (node, format) => {
  const p = node.props ?? {};
  const inputAttrs = [
    classAttr$4(format, "w-20 border-0 bg-transparent p-1 text-center text-sm tabular-nums text-zinc-950 outline-none"),
    { name: "type", value: "number" }
  ];
  if (p.min !== void 0) inputAttrs.push({ name: "min", value: String(p.min) });
  if (p.max !== void 0) inputAttrs.push({ name: "max", value: String(p.max) });
  if (p.step !== void 0) inputAttrs.push({ name: "step", value: String(p.step) });
  if (p.value !== void 0) inputAttrs.push({ name: "value", value: String(p.value) });
  if (p.placeholder) inputAttrs.push({ name: "placeholder", value: p.placeholder });
  const stepper = (label, glyph) => inlineElement$1(
    "button",
    [
      { name: "type", value: "button" },
      classAttr$4(format, "h-9 w-8 text-base text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"),
      { name: "aria-label", value: label }
    ],
    glyph,
    format
  );
  const input = inlineElement$1("input", inputAttrs, "", format).replace("></input>", ">");
  return element$2(
    "div",
    [classAttr$4(format, "inline-flex w-fit items-center overflow-hidden rounded-lg border border-zinc-200")],
    [stepper("Decrease", "−"), input, stepper("Increase", "+")],
    format
  );
};
const emitAutocomplete = (node, format) => {
  const p = node.props ?? {};
  const inputAttrs = [
    classAttr$4(format, INPUT_BASE),
    { name: "type", value: "text" },
    { name: "role", value: "combobox" },
    { name: "aria-expanded", value: "false" },
    { name: "aria-autocomplete", value: "list" }
  ];
  if (p.placeholder) inputAttrs.push({ name: "placeholder", value: p.placeholder });
  const input = inlineElement$1("input", inputAttrs, "", format).replace("></input>", ">");
  const suggestions = p.suggestions ?? [];
  const items = suggestions.map(
    (s) => inlineElement$1("li", [{ name: "role", value: "option" }, classAttr$4(format, "rounded-md px-2.5 py-1.5 text-sm text-zinc-950 hover:bg-zinc-100")], escapeText$1(s, format), format)
  );
  const children = [input];
  if (items.length > 0) {
    children.push(element$2("ul", [{ name: "role", value: "listbox" }, classAttr$4(format, "mt-1 flex flex-col gap-0.5 rounded-lg border border-zinc-200 bg-white p-1 shadow-md")], items, format));
  }
  return element$2("div", [classAttr$4(format, "flex w-full max-w-sm flex-col")], children, format);
};
const emitCombobox = (node, format) => {
  const p = node.props ?? {};
  const inputAttrs = [
    classAttr$4(format, `${INPUT_BASE} pr-8`),
    { name: "type", value: "text" },
    { name: "role", value: "combobox" },
    { name: "aria-expanded", value: "false" },
    { name: "aria-autocomplete", value: "list" }
  ];
  if (p.placeholder) inputAttrs.push({ name: "placeholder", value: p.placeholder });
  const input = inlineElement$1("input", inputAttrs, "", format).replace("></input>", ">");
  const options = p.options ?? [];
  const items = options.map(
    (o) => inlineElement$1("li", [{ name: "role", value: "option" }, classAttr$4(format, "rounded-md px-2.5 py-1.5 text-sm text-zinc-950 hover:bg-zinc-100")], escapeText$1(o, format), format)
  );
  const children = [input];
  if (items.length > 0) {
    children.push(element$2("ul", [{ name: "role", value: "listbox" }, classAttr$4(format, "mt-1 flex flex-col gap-0.5 rounded-lg border border-zinc-200 bg-white p-1 shadow-md")], items, format));
  }
  return element$2("div", [classAttr$4(format, "flex w-full max-w-sm flex-col")], children, format);
};
const emitCommand = (node, format, recurse) => {
  const p = node.props ?? {};
  const inputAttrs = [classAttr$4(format, INPUT_BASE), { name: "type", value: "text" }];
  if (p.placeholder) inputAttrs.push({ name: "placeholder", value: p.placeholder });
  const input = inlineElement$1("input", inputAttrs, "", format).replace("></input>", ">");
  return element$2(
    "div",
    [classAttr$4(format, "flex w-full max-w-md flex-col gap-2 rounded-xl border border-zinc-200 p-2"), { name: "role", value: "dialog" }, { name: "aria-label", value: "Command menu" }],
    [input, ...childFragments$4(node.children, format, recurse)],
    format
  );
};
const emitCheckboxGroup = (node, format, recurse) => {
  var _a, _b;
  const children = [];
  if ((_a = node.props) == null ? void 0 : _a.label) {
    children.push(inlineElement$1("p", [classAttr$4(format, "text-sm font-medium text-zinc-950")], escapeText$1(node.props.label, format), format));
  }
  if ((_b = node.props) == null ? void 0 : _b.description) {
    children.push(inlineElement$1("p", [classAttr$4(format, "text-xs text-zinc-500")], escapeText$1(node.props.description, format), format));
  }
  children.push(...childFragments$4(node.children, format, recurse));
  return element$2("div", [{ name: "role", value: "group" }, classAttr$4(format, "flex flex-col items-start gap-3")], children, format);
};
const TOGGLE_CLASSES = "inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-500 hover:text-zinc-950";
const TOGGLE_PRESSED_CLASSES = "inline-flex h-8 items-center justify-center rounded-lg border border-zinc-950 bg-zinc-950 px-3 text-sm font-medium text-zinc-50";
function bracketItems(children) {
  const out = [];
  for (const child of children ?? []) {
    const anyChild = child;
    if (anyChild.type === "container" && anyChild.containerType === "button-group") {
      out.push(...anyChild.children ?? []);
    } else {
      out.push(child);
    }
  }
  return out;
}
const emitToggleGroup = (node, format) => {
  const items = bracketItems(node.children).filter((i) => i.type === "button" || i.type === "nav-item");
  const buttons = items.map((item) => {
    var _a, _b, _c;
    const pressed = ((_b = (_a = item.props) == null ? void 0 : _a.classes) == null ? void 0 : _b.includes("active")) === true || ((_c = item.props) == null ? void 0 : _c.variant) === "primary";
    const attrs2 = [
      { name: "type", value: "button" },
      classAttr$4(format, pressed ? TOGGLE_PRESSED_CLASSES : TOGGLE_CLASSES),
      { name: "aria-pressed", value: pressed ? "true" : "false" }
    ];
    return inlineElement$1("button", attrs2, escapeText$1(item.content ?? "", format), format);
  });
  return element$2("div", [{ name: "role", value: "group" }, classAttr$4(format, "inline-flex items-center gap-1")], buttons, format);
};
const emitSwitch = (node, format) => {
  const p = node.props ?? {};
  const trackAttrs = [
    { name: "type", value: "button" },
    { name: "role", value: "switch" },
    { name: "aria-checked", value: node.checked ? "true" : "false" },
    classAttr$4(format, node.checked ? "relative h-5 w-9 rounded-full bg-zinc-950 transition-colors" : "relative h-5 w-9 rounded-full bg-zinc-200 transition-colors")
  ];
  if (p.disabled) trackAttrs.push({ name: "disabled" });
  const thumb = inlineElement$1(
    "span",
    [classAttr$4(format, node.checked ? "absolute left-[18px] top-0.5 size-4 rounded-full bg-white shadow-sm transition-all" : "absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-all")],
    "",
    format
  ).replace("></span>", ">");
  const control = element$2("button", trackAttrs, [thumb], format);
  if (p.label || p.description) {
    const text2 = [];
    if (p.label) text2.push(inlineElement$1("span", [classAttr$4(format, "text-sm text-zinc-950")], escapeText$1(p.label, format), format));
    if (p.description) text2.push(inlineElement$1("span", [classAttr$4(format, "text-xs text-zinc-500")], escapeText$1(p.description, format), format));
    const labels = element$2("span", [classAttr$4(format, "flex flex-col")], text2, format);
    return element$2("div", [classAttr$4(format, "flex items-center gap-3")], [control, labels], format);
  }
  return control;
};
const emitSlider = (node, format) => {
  const p = node.props ?? {};
  const min = p.min ?? 0;
  const max = p.max ?? 100;
  const range = max - min || 1;
  const pct = Math.max(0, Math.min(100, (node.value - min) / range * 100));
  const labelHTML = p.label ? inlineElement$1("label", [classAttr$4(format, "flex w-full justify-between text-sm text-zinc-950")], `${escapeText$1(p.label, format)} `, format) : "";
  const valueHTML = inlineElement$1("span", [classAttr$4(format, "text-sm tabular-nums text-zinc-500")], escapeText$1(String(node.value), format), format);
  const track = element$2(
    "div",
    [
      { name: "role", value: "slider" },
      { name: "aria-valuenow", value: String(node.value) },
      { name: "aria-valuemin", value: String(min) },
      { name: "aria-valuemax", value: String(max) },
      classAttr$4(format, "relative h-1.5 w-full rounded-full bg-zinc-200")
    ],
    [
      inlineElement$1("div", [classAttr$4(format, "absolute left-0 top-0 h-full rounded-full bg-zinc-950")], "", format).replace("></div>", ` style="width:${pct}%"></div>`),
      inlineElement$1("div", [classAttr$4(format, "absolute top-1/2 size-4 -translate-y-1/2 rounded-full border-2 border-zinc-950 bg-white")], "", format).replace("></div>", ` style="left:${pct}%"></div>`)
    ],
    format
  );
  return element$2("div", [classAttr$4(format, "flex w-full max-w-90 flex-col gap-2")], [labelHTML, valueHTML, track].filter(Boolean), format);
};
const emitToggle = (node, format) => {
  var _a;
  const attrs2 = [
    { name: "type", value: "button" },
    classAttr$4(format, node.pressed ? TOGGLE_PRESSED_CLASSES : TOGGLE_CLASSES),
    { name: "aria-pressed", value: node.pressed ? "true" : "false" }
  ];
  return inlineElement$1("button", attrs2, escapeText$1(((_a = node.props) == null ? void 0 : _a.label) ?? "", format), format);
};
function classAttr$3(format, classes) {
  return { name: format === "jsx" ? "className" : "class", value: classes };
}
function openTag$1(tag, attrs2, format) {
  const rendered = attrs2.map((attr2) => attr2.value === void 0 ? attr2.name : ` ${attr2.name}="${attr2.value}"`).join("");
  return format === "jsx" ? `<${tag}${rendered}>` : `<${tag}${rendered}>`;
}
function element$1(tag, attrs2, children, format) {
  const open = openTag$1(tag, attrs2, format);
  const body = children.filter((f) => f.length > 0);
  if (body.length === 0) return `${open}</${tag}>`;
  return `${open}${body.join("")}</${tag}>`;
}
function inlineElement(tag, attrs2, text2, format) {
  return `${openTag$1(tag, attrs2, format)}${text2}</${tag}>`;
}
function escapeText(text2, format) {
  return format === "jsx" ? escapeJsxText(text2) : escapeHtmlText(text2);
}
function childFragments$3(children, format, recurse) {
  return (children ?? []).map((c) => recurse(c, format)).filter((f) => f.length > 0);
}
const AVATAR_SIZE = {
  sm: "size-6 text-[10px]",
  md: "size-9 text-xs",
  lg: "size-12 text-base",
  xl: "size-16 text-lg"
};
function avatarInitials(name) {
  if (!name) return "?";
  return name.split(/\s+/).map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";
}
const emitAvatar = (node, format) => {
  var _a;
  const size = ["sm", "md", "lg", "xl"].find((s) => {
    var _a2;
    return s === ((_a2 = node.props) == null ? void 0 : _a2.size);
  }) ?? "md";
  const classes = `inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-zinc-100 text-zinc-950 font-medium align-middle ${AVATAR_SIZE[size] ?? AVATAR_SIZE.md}`;
  const name = (_a = node.props) == null ? void 0 : _a.name;
  const initials = avatarInitials(name);
  return element$1(
    "div",
    [classAttr$3(format, classes), { name: "role", value: "img" }, { name: "aria-label", value: name ?? "avatar" }],
    [
      inlineElement(
        "span",
        [classAttr$3(format, "flex size-full items-center justify-center rounded-full bg-zinc-100")],
        escapeText(initials, format),
        format
      )
    ],
    format
  );
};
const emitFrame = (node, format, recurse) => {
  const classes = "relative flex flex-col rounded-2xl bg-zinc-100 p-1 *:[[data-slot=frame-panel]+[data-slot=frame-panel]]:mt-1";
  return element$1(
    "div",
    [{ name: "data-slot", value: "frame" }, classAttr$3(format, classes)],
    childFragments$3(node.children, format, recurse),
    format
  );
};
const emitGroup = (node, format, recurse) => {
  const orientation = node.orientation === "vertical" ? "vertical" : "horizontal";
  const classes = `flex w-fit *:focus-visible:z-1 has-[>[data-slot=group]]:gap-2 *:has-focus-visible:z-1 ${orientation === "vertical" ? "flex-col *:data-slot:has-[~[data-slot]]:rounded-b-none *:data-slot:has-[~[data-slot]]:border-b-0" : "*:data-slot:has-[~[data-slot]]:rounded-e-none *:data-slot:has-[~[data-slot]]:border-e-0"}`;
  return element$1(
    "div",
    [
      { name: "role", value: "group" },
      { name: "data-orientation", value: orientation },
      { name: "data-slot", value: "group" },
      classAttr$3(format, classes)
    ],
    childFragments$3(node.children, format, recurse),
    format
  );
};
const emitEmpty = (node, format, recurse) => {
  const classes = "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 text-balance px-6 py-12 text-center md:py-20";
  return element$1(
    "div",
    [{ name: "data-slot", value: "empty" }, classAttr$3(format, classes)],
    childFragments$3(node.children, format, recurse),
    format
  );
};
const CAL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
const CAL_WD = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const emitCalendar = (node, format) => {
  var _a, _b;
  const year = Number(((_a = node.props) == null ? void 0 : _a.year) ?? (/* @__PURE__ */ new Date()).getFullYear());
  const monthRaw = ((_b = node.props) == null ? void 0 : _b.month) ?? CAL_MONTHS[(/* @__PURE__ */ new Date()).getMonth()];
  const monthIdx = Math.max(
    0,
    CAL_MONTHS.findIndex((m) => m.toLowerCase() === String(monthRaw).toLowerCase())
  );
  const first = new Date(year, monthIdx, 1);
  const start = first.getDay();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const dayCells = [];
  for (let i = 0; i < start; i++) {
    dayCells.push(
      inlineElement(
        "div",
        [classAttr$3(format, "calendar-day calendar-day-outside text-zinc-300 pointer-events-none")],
        "",
        format
      )
    );
  }
  for (let d = 1; d <= daysInMonth; d++) {
    dayCells.push(
      inlineElement(
        "button",
        [
          { name: "type", value: "button" },
          classAttr$3(
            format,
            "calendar-day h-8 min-w-8 border-0 bg-transparent rounded-md cursor-pointer text-[13px] text-zinc-950 tabular-nums hover:bg-zinc-100"
          )
        ],
        escapeText(String(d), format),
        format
      )
    );
  }
  while (dayCells.length % 7 !== 0) {
    dayCells.push(
      inlineElement(
        "div",
        [classAttr$3(format, "calendar-day calendar-day-outside text-zinc-300 pointer-events-none")],
        "",
        format
      )
    );
  }
  const weekdays = CAL_WD.map(
    (w) => inlineElement(
      "div",
      [classAttr$3(format, "calendar-weekday text-center text-[11px] font-medium text-zinc-500 py-1.5")],
      w,
      format
    )
  );
  return element$1(
    "div",
    [
      { name: "data-slot", value: "calendar" },
      classAttr$3(format, "inline-flex flex-col rounded-xl border bg-white p-3 min-w-[260px] text-sm")
    ],
    [
      element$1(
        "div",
        [classAttr$3(format, "flex items-center justify-between px-1 pb-2")],
        [
          inlineElement(
            "button",
            [
              { name: "type", value: "button" },
              { name: "aria-label", value: "Previous month" },
              classAttr$3(format, "w-7 h-7 border-0 bg-transparent rounded-md cursor-pointer text-zinc-500 hover:bg-zinc-100")
            ],
            "←",
            format
          ),
          inlineElement(
            "div",
            [classAttr$3(format, "calendar-caption font-semibold text-zinc-950")],
            escapeText(`${CAL_MONTHS[monthIdx]} ${year}`, format),
            format
          ),
          inlineElement(
            "button",
            [
              { name: "type", value: "button" },
              { name: "aria-label", value: "Next month" },
              classAttr$3(format, "w-7 h-7 border-0 bg-transparent rounded-md cursor-pointer text-zinc-500 hover:bg-zinc-100")
            ],
            "→",
            format
          )
        ],
        format
      ),
      element$1(
        "div",
        [classAttr$3(format, "calendar-grid grid grid-cols-7 gap-0.5")],
        [...weekdays, ...dayCells],
        format
      )
    ],
    format
  );
};
const emitDatePicker = (node, format) => {
  var _a, _b;
  const placeholder = ((_a = node.props) == null ? void 0 : _a.placeholder) ?? "Pick a date";
  const value = (_b = node.props) == null ? void 0 : _b.value;
  const labelText = value ?? placeholder;
  const labelClasses = value ? "date-picker-value font-medium" : "date-picker-placeholder text-zinc-400 font-normal";
  return element$1(
    "div",
    [{ name: "data-slot", value: "date-picker" }, classAttr$3(format, "inline-block")],
    [
      element$1(
        "button",
        [
          { name: "type", value: "button" },
          { name: "aria-haspopup", value: "dialog" },
          classAttr$3(
            format,
            "date-picker-trigger inline-flex items-center gap-2 h-9 px-3 min-w-[220px] bg-white border border-zinc-200 rounded-lg text-sm text-zinc-950 justify-between"
          )
        ],
        [
          inlineElement("span", [classAttr$3(format, labelClasses)], escapeText(labelText, format), format),
          inlineElement(
            "span",
            [classAttr$3(format, "date-picker-caret text-zinc-500 text-xs"), { name: "aria-hidden", value: "true" }],
            "▾",
            format
          )
        ],
        format
      )
    ],
    format
  );
};
function attrEscaped$1(format, value) {
  return format === "jsx" ? escapeJsxAttr(value) : escapeHtmlAttr(value);
}
function textEscaped$1(format, value) {
  return format === "jsx" ? escapeJsxText(value) : escapeHtmlText(value);
}
function classAttr$2(format, classes) {
  return ` ${format === "jsx" ? "className" : "class"}="${attrEscaped$1(format, classes)}"`;
}
function childFragments$2(children, format, recurse) {
  return (children ?? []).map((child) => recurse(child, format)).filter((fragment) => fragment.length > 0);
}
const ALERT_BASE_CLASSES = "relative grid w-full items-start gap-y-0.5 rounded-lg border px-3.5 py-3 text-sm text-zinc-950";
const ALERT_VARIANT_BG = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  info: "border-blue-200 bg-blue-50 text-blue-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  error: "border-red-200 bg-red-50 text-red-900"
};
const ALERT_TITLE_CLASSES = "font-medium";
function splitAlertTitle(node) {
  const children = node.children ?? [];
  if (children.length < 2) return { title: void 0, body: children };
  const first = children[0];
  if (first.type !== "paragraph") return { title: void 0, body: children };
  const fromContent = typeof first.content === "string" ? first.content : null;
  const fromChildren = Array.isArray(first.children) ? first.children.map((c) => {
    if (c.type === "text") {
      const t = c;
      return t.content ?? t.value ?? "";
    }
    return "";
  }).join("") : "";
  const title = fromContent ?? (fromChildren.length > 0 ? fromChildren : void 0);
  return { title, body: children.slice(1) };
}
const emitAlert = (node, format, recurse) => {
  var _a;
  if (node.containerType !== "alert") {
    return "";
  }
  const variantClass = (((_a = node.props) == null ? void 0 : _a.classes) ?? []).find(
    (c) => c === "success" || c === "info" || c === "warning" || c === "error"
  );
  const classes = variantClass ? `${ALERT_BASE_CLASSES} ${ALERT_VARIANT_BG[variantClass]}` : ALERT_BASE_CLASSES;
  const { title, body } = splitAlertTitle(node);
  const bodyFragments = childFragments$2(body, format, recurse);
  const titleFragment = title !== void 0 ? `<p${classAttr$2(format, ALERT_TITLE_CLASSES)}>${textEscaped$1(format, title)}</p>` : "";
  const allFragments = [titleFragment, ...bodyFragments].filter((f) => f.length > 0);
  if (allFragments.length === 0) {
    return `<div role="alert"${classAttr$2(format, classes)}></div>`;
  }
  return `<div role="alert"${classAttr$2(format, classes)}>
${allFragments.join("\n")}
</div>`;
};
const TOAST_BASE_CLASSES = "pointer-events-auto flex items-center justify-between gap-1.5 overflow-hidden rounded-lg border border-zinc-200 bg-white px-3.5 py-3 text-sm shadow-sm";
const TOAST_VARIANT_BORDER = {
  success: "border-emerald-200",
  info: "border-blue-200",
  warning: "border-amber-200",
  error: "border-red-200"
};
const TOAST_TITLE_CLASSES = "font-medium text-zinc-950";
function splitToastTitle(node) {
  const children = node.children ?? [];
  if (children.length < 2) return { title: void 0, body: children };
  const first = children[0];
  if (first.type !== "paragraph") return { title: void 0, body: children };
  const fromContent = typeof first.content === "string" ? first.content : null;
  const fromChildren = Array.isArray(first.children) ? first.children.map((c) => {
    if (c.type === "text") {
      const t = c;
      return t.content ?? t.value ?? "";
    }
    return "";
  }).join("") : "";
  const title = fromContent ?? (fromChildren.length > 0 ? fromChildren : void 0);
  return { title, body: children.slice(1) };
}
const emitToast = (node, format, recurse) => {
  var _a;
  const variant = (_a = node.props) == null ? void 0 : _a.toastType;
  const variantClass = variant && variant !== "loading" ? TOAST_VARIANT_BORDER[variant] : void 0;
  const classes = variantClass ? `${TOAST_BASE_CLASSES} ${variantClass}` : TOAST_BASE_CLASSES;
  const { title, body } = splitToastTitle(node);
  const bodyFragments = childFragments$2(body, format, recurse);
  const fragments = [];
  if (title !== void 0) {
    fragments.push(
      `<p${classAttr$2(format, TOAST_TITLE_CLASSES)}>${textEscaped$1(format, title)}</p>`
    );
  }
  fragments.push(...bodyFragments);
  if (fragments.length === 0) {
    return `<div role="status"${classAttr$2(format, classes)}></div>`;
  }
  return `<div role="status"${classAttr$2(format, classes)}>
${fragments.join("\n")}
</div>`;
};
const SKELETON_CLASSES = "animate-skeleton block w-full rounded-sm bg-zinc-100 [background:linear-gradient(120deg,transparent_40%,rgba(255,255,255,0.64)_50%,transparent_60%)_#f4f4f5_0_0/200%_100%]";
function styleForSize(node) {
  var _a, _b;
  const width = (_a = node.props) == null ? void 0 : _a.width;
  const height = (_b = node.props) == null ? void 0 : _b.height;
  const parts = [];
  if (width !== void 0) {
    parts.push(`width:${typeof width === "number" ? `${width}px` : width}`);
  }
  if (height !== void 0) {
    parts.push(`height:${typeof height === "number" ? `${height}px` : height}`);
  }
  return parts.length > 0 ? ` style="${parts.join(";")}"` : "";
}
const emitSkeleton = (node, format) => {
  return `<div${classAttr$2(format, SKELETON_CLASSES)}${styleForSize(node)}></div>`;
};
const SPINNER_BASE_CLASSES = "inline-block animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-950";
const SPINNER_SIZE_CLASSES = {
  small: "h-3 w-3 border-[1.5px]",
  medium: "h-4 w-4 border-2",
  large: "h-6 w-6 border-[3px]"
};
const emitSpinner = (node, format) => {
  var _a;
  const size = ((_a = node.props) == null ? void 0 : _a.size) ?? "medium";
  const sizeCls = SPINNER_SIZE_CLASSES[size] ?? SPINNER_SIZE_CLASSES.medium;
  const classes = `${SPINNER_BASE_CLASSES} ${sizeCls}`;
  return `<div role="status" aria-label="Loading"${classAttr$2(format, classes)}></div>`;
};
const KBD_CLASSES = "pointer-events-none inline-flex h-5 min-w-5 select-none items-center justify-center gap-1 rounded bg-zinc-100 px-1 font-sans font-medium text-zinc-500 text-xs";
const emitKbd = (node, format) => {
  var _a;
  const extra = (((_a = node.props) == null ? void 0 : _a.classes) ?? []).join(" ");
  const classes = extra ? `${KBD_CLASSES} ${extra}` : KBD_CLASSES;
  return `<kbd${classAttr$2(format, classes)}>${textEscaped$1(format, node.content)}</kbd>`;
};
const PROGRESS_ROOT_CLASSES = "flex w-full flex-col gap-2";
const PROGRESS_LABEL_CLASSES = "font-medium text-sm text-zinc-950";
const PROGRESS_TRACK_CLASSES = "block h-1.5 w-full overflow-hidden rounded-full bg-zinc-100";
const PROGRESS_INDICATOR_CLASSES = "block h-full rounded-full bg-zinc-950 transition-all duration-500";
const PROGRESS_VALUE_CLASSES = "text-sm tabular-nums text-zinc-950";
const emitProgress = (node, format) => {
  var _a;
  const value = Math.max(0, Math.min(100, Number(node.value ?? 0)));
  const indeterminate = !!node.indeterminate;
  const width = indeterminate ? 100 : value;
  const label = (_a = node.props) == null ? void 0 : _a.label;
  const parts = [];
  if (typeof label === "string" && label.length > 0) {
    parts.push(`<p${classAttr$2(format, PROGRESS_LABEL_CLASSES)}>${textEscaped$1(format, label)}</p>`);
  }
  parts.push(
    `<div${classAttr$2(format, PROGRESS_TRACK_CLASSES)}>
  <div${classAttr$2(format, PROGRESS_INDICATOR_CLASSES)} style="width:${width}%"></div>
</div>`
  );
  if (!indeterminate) {
    parts.push(`<p${classAttr$2(format, PROGRESS_VALUE_CLASSES)}>${value}%</p>`);
  }
  return `<div${classAttr$2(format, PROGRESS_ROOT_CLASSES)} role="progressbar" aria-valuenow="${value}"${indeterminate ? ' data-indeterminate="true"' : ""}>
${parts.join("\n")}
</div>`;
};
const METER_ROOT_CLASSES = "flex w-full flex-col gap-2";
const METER_LABEL_CLASSES = "font-medium text-sm text-zinc-950";
const METER_TRACK_CLASSES = "block h-2 w-full overflow-hidden bg-zinc-100";
const METER_INDICATOR_CLASSES = "block h-full bg-zinc-950 transition-all duration-500";
const METER_VALUE_CLASSES = "text-sm tabular-nums text-zinc-950";
const emitMeter = (node, format) => {
  var _a;
  const value = Number(node.value ?? 0);
  const min = Number(node.min ?? 0);
  const max = Number(node.max ?? 100);
  const range = max - min || 1;
  const pct = Math.max(0, Math.min(100, (value - min) / range * 100));
  const label = (_a = node.props) == null ? void 0 : _a.label;
  const parts = [];
  if (typeof label === "string" && label.length > 0) {
    parts.push(`<p${classAttr$2(format, METER_LABEL_CLASSES)}>${textEscaped$1(format, label)}</p>`);
  }
  parts.push(
    `<div${classAttr$2(format, METER_TRACK_CLASSES)}>
  <div${classAttr$2(format, METER_INDICATOR_CLASSES)} style="width:${pct}%"></div>
</div>`
  );
  parts.push(`<p${classAttr$2(format, METER_VALUE_CLASSES)}>${value} / ${max}</p>`);
  return `<div${classAttr$2(format, METER_ROOT_CLASSES)} role="meter" aria-valuenow="${value}" aria-valuemin="${min}" aria-valuemax="${max}">
${parts.join("\n")}
</div>`;
};
function classAttr$1(format, classes) {
  return { name: format === "jsx" ? "className" : "class", value: classes };
}
function openTag(tag, attrs2, format) {
  const rendered = attrs2.map(
    (attr2) => attr2.value === void 0 ? attr2.name : `${attr2.name}="${format === "jsx" ? escapeJsxAttr(attr2.value) : escapeHtmlAttr(attr2.value)}"`
  );
  return `<${[tag, ...rendered].join(" ")}>`;
}
function element(tag, attrs2, children, format) {
  const open = openTag(tag, attrs2, format);
  const body = children.filter((fragment) => fragment.length > 0);
  if (body.length === 0) return `${open}</${tag}>`;
  return [open, ...body, `</${tag}>`].join("\n");
}
function childFragments$1(children, format, recurse) {
  return (children ?? []).map((child) => recurse(child, format)).filter((fragment) => fragment.length > 0);
}
const CARD_CLASSES = "rounded-xl border border-zinc-200 bg-white p-6 shadow-sm";
const HERO_CLASSES = "py-16 px-8 text-center border-y border-zinc-200";
const SIDEBAR_CLASSES = "grid md:grid-cols-[240px_1fr] gap-6";
const MODAL_OVERLAY_CLASSES = "fixed inset-0 flex items-center justify-center bg-black/50";
const MODAL_PANEL_CLASSES = "rounded-xl bg-white p-6 max-w-md shadow-xl";
const STATE_PLACEHOLDER_CLASSES = "rounded-lg border border-dashed p-8 text-center text-zinc-500";
const ERROR_PLACEHOLDER_CLASSES = "rounded-lg border border-dashed border-red-200 p-8 text-center text-red-600";
const FALLBACK_CLASSES = "rounded-lg border border-zinc-200";
function containerClasses(containerType) {
  switch (containerType) {
    case "card":
      return CARD_CLASSES;
    case "hero":
      return HERO_CLASSES;
    case "sidebar":
      return SIDEBAR_CLASSES;
    case "modal":
      return MODAL_OVERLAY_CLASSES;
    case "empty":
    case "loading":
      return STATE_PLACEHOLDER_CLASSES;
    case "error":
      return ERROR_PLACEHOLDER_CLASSES;
    default:
      return FALLBACK_CLASSES;
  }
}
const emitContainer = (node, format, recurse) => {
  const kind = node.containerType;
  if (kind === "alert") {
    return emitAlert(node, format, recurse);
  }
  const children = childFragments$1(node.children, format, recurse);
  if (kind === "modal") {
    const panel = element(
      "div",
      [{ name: "role", value: "dialog" }, { name: "aria-modal", value: "true" }, classAttr$1(format, MODAL_PANEL_CLASSES)],
      children,
      format
    );
    return element("div", [classAttr$1(format, MODAL_OVERLAY_CLASSES)], [panel], format);
  }
  return element("div", [classAttr$1(format, containerClasses(kind))], children, format);
};
function gridColumns(columns) {
  return Number.isInteger(columns) && columns >= 1 && columns <= 12 ? columns : 3;
}
const emitGrid = (node, format, recurse) => element(
  "div",
  [classAttr$1(format, `grid grid-cols-${gridColumns(node.columns)} gap-3`)],
  childFragments$1(node.children, format, recurse),
  format
);
const emitGridItem = (node, format, recurse) => element("div", [classAttr$1(format, "min-w-0")], childFragments$1(node.children, format, recurse), format);
const ROW_BASE_CLASSES = "flex items-center gap-3";
function rowClasses(node) {
  var _a, _b, _c, _d;
  const align = ((_a = node.props) == null ? void 0 : _a.right) === true || ((_b = node.props) == null ? void 0 : _b.right) === "true" ? "justify-end" : ((_c = node.props) == null ? void 0 : _c.center) === true || ((_d = node.props) == null ? void 0 : _d.center) === "true" ? "justify-center" : "";
  return align === "" ? ROW_BASE_CLASSES : `${ROW_BASE_CLASSES} ${align}`;
}
const emitRow = (node, format, recurse) => element("div", [classAttr$1(format, rowClasses(node))], childFragments$1(node.children, format, recurse), format);
const emitDemo = (node, format, recurse) => childFragments$1(node.children, format, recurse).join("\n");
function attrEscaped(format, value) {
  return format === "jsx" ? escapeJsxAttr(value) : escapeHtmlAttr(value);
}
function textEscaped(format, value) {
  return format === "jsx" ? escapeJsxText(value) : escapeHtmlText(value);
}
function classAttr(format, classes) {
  return ` ${format === "jsx" ? "className" : "class"}="${attrEscaped(format, classes)}"`;
}
function childFragments(children, format, recurse) {
  return (children ?? []).map((child) => recurse(child, format)).filter((fragment) => fragment.length > 0);
}
const DIALOG_BASE = "fixed inset-0 z-50 grid grid-rows-[1fr_auto_3fr] justify-items-center p-4";
const DIALOG_POPUP_BASE = "relative row-start-2 flex max-h-full min-h-0 w-full min-w-0 max-w-lg origin-center flex-col rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-950 shadow-lg";
const ALERT_DIALOG_BASE = DIALOG_POPUP_BASE;
const SHEET_POPUP_BASE = "fixed z-50 gap-4 bg-white p-6 shadow-lg transition ease-in-out border-zinc-200";
const DRAWER_POPUP_BASE = "fixed z-50 gap-4 bg-white p-6 shadow-lg transition ease-in-out border-zinc-200";
const POPOVER_BASE = "z-50 w-72 origin-[--radix-popover-content-transform-origin] rounded-md border border-zinc-200 bg-white p-4 text-zinc-950 shadow-md outline-none";
const TOOLTIP_BASE = "z-50 overflow-hidden rounded-md bg-zinc-950 px-3 py-1.5 text-xs text-zinc-50 shadow-sm";
const PREVIEW_CARD_BASE = "flex w-full flex-col items-start gap-1 rounded-lg border border-zinc-200 bg-white p-4 text-zinc-950 shadow-sm";
const emitDialog = (node, format, recurse) => {
  var _a, _b;
  const title = typeof ((_a = node.props) == null ? void 0 : _a.title) === "string" ? node.props.title : void 0;
  const desc = typeof ((_b = node.props) == null ? void 0 : _b.description) === "string" ? node.props.description : void 0;
  const inner = childFragments(node.children, format, recurse);
  const titleFragment = title ? `<h2${classAttr(format, "text-lg font-semibold leading-none tracking-tight")}>${textEscaped(format, title)}</h2>` : "";
  const descFragment = desc ? `<p${classAttr(format, "text-sm text-zinc-500")}>${textEscaped(format, desc)}</p>` : "";
  const close = `<button type="button"${classAttr(format, "absolute end-2 top-2 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2")} aria-label="Close">×</button>`;
  const popup = `<div${classAttr(format, DIALOG_POPUP_BASE)} role="dialog">
${[titleFragment, descFragment, ...inner, close].filter((f) => f.length > 0).join("\n")}
</div>`;
  return `<div${classAttr(format, DIALOG_BASE)}>
  ${popup}
</div>`;
};
const emitAlertDialog = (node, format, recurse) => {
  var _a, _b, _c, _d, _e;
  const title = typeof ((_a = node.props) == null ? void 0 : _a.title) === "string" ? node.props.title : void 0;
  const desc = typeof ((_b = node.props) == null ? void 0 : _b.description) === "string" ? node.props.description : void 0;
  const actionText = typeof ((_c = node.props) == null ? void 0 : _c.actionText) === "string" ? node.props.actionText : "Continue";
  const cancelText = typeof ((_d = node.props) == null ? void 0 : _d.cancelText) === "string" ? node.props.cancelText : "Cancel";
  const actionVariant = ((_e = node.props) == null ? void 0 : _e.actionVariant) === "secondary" ? "secondary" : "primary";
  const inner = childFragments(node.children, format, recurse);
  const titleFragment = title ? `<h2${classAttr(format, "text-lg font-semibold leading-none tracking-tight")}>${textEscaped(format, title)}</h2>` : "";
  const descFragment = desc ? `<p${classAttr(format, "text-sm text-zinc-500")}>${textEscaped(format, desc)}</p>` : "";
  const actions = `<div${classAttr(format, "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end")}>
    <button type="button"${classAttr(format, "inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-950 hover:bg-zinc-50")}>${textEscaped(format, cancelText)}</button>
    <button type="button"${classAttr(format, `inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium text-white ${actionVariant === "primary" ? "bg-zinc-950 hover:bg-zinc-800" : "bg-zinc-100 text-zinc-950 hover:bg-zinc-200"}`)}>${textEscaped(format, actionText)}</button>
  </div>`;
  const popup = `<div${classAttr(format, ALERT_DIALOG_BASE)} role="alertdialog">
${[titleFragment, descFragment, ...inner, actions].filter((f) => f.length > 0).join("\n")}
</div>`;
  return `<div${classAttr(format, DIALOG_BASE)}>
  ${popup}
</div>`;
};
const SHEET_SIDE_CLASSES = {
  top: "inset-x-0 top-0 border-b",
  right: "inset-y-0 right-0 h-full w-3/4 max-w-sm border-l sm:max-w-sm",
  bottom: "inset-x-0 bottom-0 border-t",
  left: "inset-y-0 left-0 h-full w-3/4 max-w-sm border-r sm:max-w-sm"
};
const emitSheet = (node, format, recurse) => {
  var _a, _b;
  const title = typeof ((_a = node.props) == null ? void 0 : _a.title) === "string" ? node.props.title : void 0;
  const desc = typeof ((_b = node.props) == null ? void 0 : _b.description) === "string" ? node.props.description : void 0;
  const inner = childFragments(node.children, format, recurse);
  const sideClass = SHEET_SIDE_CLASSES[node.side] || SHEET_SIDE_CLASSES.right;
  const popupClasses = `${SHEET_POPUP_BASE} ${sideClass}`;
  const titleFragment = title ? `<h2${classAttr(format, "text-lg font-semibold text-zinc-950")}>${textEscaped(format, title)}</h2>` : "";
  const descFragment = desc ? `<p${classAttr(format, "text-sm text-zinc-500")}>${textEscaped(format, desc)}</p>` : "";
  const close = `<button type="button"${classAttr(format, "absolute end-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100")} aria-label="Close">×</button>`;
  return `<div${classAttr(format, popupClasses)} role="dialog" data-side="${attrEscaped(format, node.side)}">
${[titleFragment, descFragment, ...inner, close].filter((f) => f.length > 0).join("\n")}
</div>`;
};
const emitDrawer = (node, format, recurse) => {
  var _a;
  const title = typeof ((_a = node.props) == null ? void 0 : _a.title) === "string" ? node.props.title : void 0;
  const inner = childFragments(node.children, format, recurse);
  const sideClass = SHEET_SIDE_CLASSES[node.side] || SHEET_SIDE_CLASSES.left;
  const popupClasses = `${DRAWER_POPUP_BASE} ${sideClass}`;
  const titleFragment = title ? `<h2${classAttr(format, "text-lg font-semibold text-zinc-950")}>${textEscaped(format, title)}</h2>` : "";
  return `<div${classAttr(format, popupClasses)} role="dialog" data-side="${attrEscaped(format, node.side)}">
${[titleFragment, ...inner].filter((f) => f.length > 0).join("\n")}
</div>`;
};
const emitPopover = (node, format, recurse) => {
  var _a, _b;
  const title = typeof ((_a = node.props) == null ? void 0 : _a.title) === "string" ? node.props.title : void 0;
  const desc = typeof ((_b = node.props) == null ? void 0 : _b.description) === "string" ? node.props.description : void 0;
  const inner = childFragments(node.children, format, recurse);
  const titleFragment = title ? `<h3${classAttr(format, "text-base font-semibold leading-none tracking-tight")}>${textEscaped(format, title)}</h3>` : "";
  const descFragment = desc ? `<p${classAttr(format, "text-sm text-zinc-500")}>${textEscaped(format, desc)}</p>` : "";
  return `<div${classAttr(format, POPOVER_BASE)} role="dialog">
${[titleFragment, descFragment, ...inner].filter((f) => f.length > 0).join("\n")}
</div>`;
};
const emitTooltip = (node, format) => {
  var _a, _b, _c, _d;
  const content = ((_a = node.props) == null ? void 0 : _a.content) ?? "";
  const side = ((_b = node.props) == null ? void 0 : _b.side) === "right" || ((_c = node.props) == null ? void 0 : _c.side) === "bottom" || ((_d = node.props) == null ? void 0 : _d.side) === "left" ? node.props.side : "top";
  return `<span${classAttr(format, TOOLTIP_BASE)} role="tooltip" data-side="${attrEscaped(format, side)}">${textEscaped(format, content)}</span>`;
};
const emitPreviewCard = (node, format, recurse) => {
  var _a;
  const href = typeof ((_a = node.props) == null ? void 0 : _a.href) === "string" ? node.props.href : void 0;
  const inner = childFragments(node.children, format, recurse);
  const card = `<div${classAttr(format, PREVIEW_CARD_BASE)}>
${inner.join("\n")}
</div>`;
  if (href) {
    return `<a${classAttr(format, "block text-zinc-950 no-underline")} href="${attrEscaped(format, href)}">${card}</a>`;
  }
  return card;
};
const FAMILY_EMITTERS = {
  button: emitButton,
  input: emitInput,
  textarea: emitTextarea,
  select: emitSelect,
  checkbox: emitCheckbox,
  radio: emitRadio,
  "radio-group": emitRadioGroup,
  icon: emitIcon,
  badge: emitBadge,
  container: emitContainer,
  nav: emitNav,
  "nav-item": emitNavItem,
  brand: emitBrand,
  grid: emitGrid,
  "grid-item": emitGridItem,
  row: emitRow,
  heading: emitHeading,
  paragraph: emitParagraph,
  text: emitText,
  image: emitImage,
  link: emitLink,
  list: emitList,
  "list-item": emitListItem,
  table: emitTable,
  "table-header": emitTableHeader,
  "table-row": emitTableRow,
  "table-cell": emitTableCell,
  blockquote: emitBlockquote,
  code: emitCode,
  separator: emitSeparator,
  tabs: emitTabs,
  tab: emitTab,
  breadcrumbs: emitBreadcrumbs,
  demo: emitDemo,
  // Phase 3 Task 2: feedback family
  toast: emitToast,
  skeleton: emitSkeleton,
  spinner: emitSpinner,
  kbd: emitKbd,
  progress: emitProgress,
  meter: emitMeter,
  // Phase 3 Task 3: overlay family
  dialog: emitDialog,
  "alert-dialog": emitAlertDialog,
  sheet: emitSheet,
  drawer: emitDrawer,
  popover: emitPopover,
  tooltip: emitTooltip,
  "preview-card": emitPreviewCard,
  // Phase 3 Task 4: navigation family
  pagination: emitPagination,
  "segmented-control": emitSegmentedControl,
  "scroll-area": emitScrollArea,
  sidebar: emitSidebar,
  menubar: emitMenubar,
  // Phase 3 Task 5: data entry family
  form: emitForm,
  field: emitField,
  fieldset: emitFieldset,
  label: emitLabel,
  "input-group": emitInputGroup,
  "otp-field": emitOtpField,
  "number-field": emitNumberField,
  autocomplete: emitAutocomplete,
  combobox: emitCombobox,
  command: emitCommand,
  "checkbox-group": emitCheckboxGroup,
  "toggle-group": emitToggleGroup,
  switch: emitSwitch,
  slider: emitSlider,
  toggle: emitToggle,
  // Phase 3 Task 6: display family
  avatar: emitAvatar,
  frame: emitFrame,
  group: emitGroup,
  empty: emitEmpty,
  calendar: emitCalendar,
  "date-picker": emitDatePicker
};
const DISPATCH = Object.freeze(
  FAMILY_EMITTERS
);
function emitNode(node, format) {
  const emitter = DISPATCH[node.type];
  if (emitter === void 0) {
    throw new Error(`Unsupported codegen node type: ${node.type}`);
  }
  return emitter(node, format, emitNode);
}
function generateCode(input, options) {
  const format = (options == null ? void 0 : options.format) ?? "html";
  const nodes = Array.isArray(input) ? input : [input];
  return nodes.map((node) => emitNode(node, format)).filter((fragment) => fragment.length > 0).join("\n");
}
function renderNode$2(node, context) {
  if (node == null) return "";
  switch (node.type) {
    case "button":
      return renderButton$2(node, context);
    case "input":
      return renderInput$2(node, context);
    case "textarea":
      return renderTextarea$2(node, context);
    case "select":
      return renderSelect$2(node, context);
    case "checkbox":
      return renderCheckbox$2(node, context);
    case "radio":
      return renderRadio$2(node, context);
    case "radio-group":
      return renderRadioGroup$2(node, context);
    case "icon":
      return renderIcon$2(node, context);
    case "badge":
      return renderBadge$2(node, context);
    case "container":
      return renderContainer$2(node, context);
    case "nav":
      return renderNav$2(node, context);
    case "nav-item":
      return renderNavItem$2(node, context);
    case "brand":
      return renderBrand$2(node, context);
    case "grid":
      return renderGrid$2(node, context);
    case "grid-item":
      return renderGridItem$2(node, context);
    case "row":
      return renderRow$2(node, context);
    case "heading":
      return renderHeading$2(node, context);
    case "paragraph":
      return renderParagraph$2(node, context);
    case "text":
      return renderText$2(node);
    case "image":
      return renderImage$2(node, context);
    case "link":
      return renderLink$2(node, context);
    case "list":
      return renderList$2(node, context);
    case "list-item":
      return renderListItem$2(node, context);
    case "table":
      return renderTable$2(node, context);
    case "table-header":
      return renderTableHeader$2(node, context);
    case "table-row":
      return renderTableRow$2(node, context);
    case "table-cell":
      return renderTableCell$2(node, context);
    case "blockquote":
      return renderBlockquote$2(node, context);
    case "code":
      return renderCode$2(node, context);
    case "separator":
      return renderSeparator$2(node, context);
    case "tabs":
      return renderTabs(node, context);
    case "tab":
      return renderTab(node, context);
    case "breadcrumbs":
      return renderBreadcrumbs(node, context);
    case "demo":
      return renderDemo(node, context);
    case "toast":
      return renderToast(node, context);
    case "skeleton":
      return renderSkeleton(node, context);
    case "spinner":
      return renderSpinner(node, context);
    case "kbd":
      return renderKbd(node, context);
    case "progress":
      return renderProgress(node, context);
    case "meter":
      return renderMeter(node, context);
    case "dialog":
      return renderDialog(node, context);
    case "alert-dialog":
      return renderAlertDialog(node, context);
    case "sheet":
      return renderSheet(node, context);
    case "drawer":
      return renderDrawer(node, context);
    case "popover":
      return renderPopover(node, context);
    case "tooltip":
      return renderTooltip(node, context);
    case "preview-card":
      return renderPreviewCard(node, context);
    case "pagination":
      return renderPagination(node, context);
    case "segmented-control":
      return renderSegmentedControl(node, context);
    case "scroll-area":
      return renderScrollArea(node, context);
    case "sidebar":
      return renderSidebarNav(node, context);
    case "menubar":
      return renderMenubar(node, context);
    case "form":
      return renderForm(node, context);
    case "field":
      return renderField(node, context);
    case "fieldset":
      return renderFieldset(node, context);
    case "label":
      return renderLabel(node, context);
    case "input-group":
      return renderInputGroup(node, context);
    case "otp-field":
      return renderOtpField(node, context);
    case "number-field":
      return renderNumberField(node, context);
    case "autocomplete":
      return renderAutocomplete(node, context);
    case "combobox":
      return renderCombobox(node, context);
    case "command":
      return renderCommand(node, context);
    case "checkbox-group":
      return renderCheckboxGroup(node, context);
    case "toggle-group":
      return renderToggleGroup(node, context);
    case "switch":
      return renderSwitch(node, context);
    case "slider":
      return renderSlider(node, context);
    case "toggle":
      return renderToggleNode(node, context);
    case "avatar":
      return renderAvatar(node, context);
    case "frame":
      return renderFrame(node, context);
    case "group":
      return renderGroup(node, context);
    case "empty":
      return renderEmpty(node, context);
    case "calendar":
      return renderCalendar(node, context);
    case "date-picker":
      return renderDatePicker(node, context);
    default:
      return `<!-- Unknown node type: ${node.type} -->`;
  }
}
function renderButton$2(node, context) {
  var _a;
  const { classPrefix: prefix } = context;
  const classes = buildClasses$1(prefix, "button", node.props);
  const disabled = node.props.state === "disabled" ? " disabled" : "";
  const loading = node.props.state === "loading" ? ` ${prefix}loading` : "";
  const contentHTML = node.children ? node.children.map((child) => renderNode$2(child, context)).join("") : escapeHtml$1(node.content);
  const href = node.href || ((_a = node.props) == null ? void 0 : _a.href);
  if (href) {
    return `<a href="${escapeHtml$1(href)}" class="${classes}${loading}">${contentHTML}</a>`;
  }
  return `<button class="${classes}${loading}"${disabled}>${contentHTML}</button>`;
}
function renderBadge$2(node, context) {
  const { classPrefix: prefix } = context;
  const classes = buildClasses$1(prefix, "badge", node.props);
  return `<span class="${classes}">${escapeHtml$1(node.content)}</span>`;
}
function renderInput$2(node, context) {
  const { classPrefix: prefix } = context;
  const classes = buildClasses$1(prefix, "input", node.props);
  const type = node.props.inputType || node.props.type || "text";
  const required = node.props.required ? " required" : "";
  const disabled = node.props.disabled ? " disabled" : "";
  const placeholder = node.props.placeholder ? ` placeholder="${escapeHtml$1(node.props.placeholder)}"` : "";
  const value = node.props.value ? ` value="${escapeHtml$1(node.props.value)}"` : "";
  const style = node.props.width ? ` style="width: ${node.props.width}ch; max-width: ${node.props.width}ch;"` : "";
  return `<input type="${type}" class="${classes}"${placeholder}${value}${required}${disabled}${style} />`;
}
function renderTextarea$2(node, context) {
  const { classPrefix: prefix } = context;
  const classes = buildClasses$1(prefix, "textarea", node.props);
  const rows = node.props.rows || 4;
  const required = node.props.required ? " required" : "";
  const disabled = node.props.disabled ? " disabled" : "";
  const placeholder = node.props.placeholder ? ` placeholder="${escapeHtml$1(node.props.placeholder)}"` : "";
  const value = node.props.value || "";
  return `<textarea class="${classes}" rows="${rows}"${placeholder}${required}${disabled}>${escapeHtml$1(value)}</textarea>`;
}
function renderSelect$2(node, context) {
  const { classPrefix: prefix } = context;
  const classes = buildClasses$1(prefix, "select", node.props);
  const required = node.props.required ? " required" : "";
  const disabled = node.props.disabled ? " disabled" : "";
  const multiple = node.props.multiple ? " multiple" : "";
  const optionsHTML = (node.options || []).map((opt) => {
    const selected = opt.selected ? " selected" : "";
    return `<option value="${escapeHtml$1(opt.value)}"${selected}>${escapeHtml$1(opt.label)}</option>`;
  }).join("\n    ");
  const placeholder = node.props.placeholder;
  const placeholderOption = placeholder ? `<option value="" disabled selected>${escapeHtml$1(placeholder)}</option>
    ` : "";
  return `<select class="${classes}"${required}${disabled}${multiple}>
    ${placeholderOption}${optionsHTML}
  </select>`;
}
function renderCheckbox$2(node, context) {
  const { classPrefix: prefix } = context;
  const classes = buildClasses$1(prefix, "checkbox", node.props);
  const checked = node.checked ? " checked" : "";
  const disabled = node.props.disabled ? " disabled" : "";
  const value = node.props.value ? ` value="${escapeHtml$1(node.props.value)}"` : "";
  let labelHTML = escapeHtml$1(node.label || "");
  let nestedHTML = "";
  if (node.children) {
    const inlineChildren = [];
    const nestedChildren = [];
    for (const child of node.children) {
      if (child.type === "list") {
        nestedChildren.push(child);
      } else {
        inlineChildren.push(child);
      }
    }
    if (inlineChildren.length > 0) {
      labelHTML = inlineChildren.map((child) => renderNode$2(child, context)).join("");
    }
    if (nestedChildren.length > 0) {
      nestedHTML = nestedChildren.map((child) => renderNode$2(child, context)).join("");
    }
  }
  return `<label class="${classes}">
    <input type="checkbox"${checked}${disabled}${value} />
    <span>${labelHTML}</span>
  </label>${nestedHTML}`;
}
function renderRadio$2(node, context) {
  const { classPrefix: prefix } = context;
  const classes = buildClasses$1(prefix, "radio", node.props);
  const checked = node.selected ? " checked" : "";
  const disabled = node.props.disabled ? " disabled" : "";
  const name = node.props.name ? ` name="${escapeHtml$1(node.props.name)}"` : "";
  const value = node.props.value ? ` value="${escapeHtml$1(node.props.value)}"` : "";
  const labelHTML = escapeHtml$1(node.label);
  const childrenHTML = node.children ? node.children.map((child) => renderNode$2(child, context)).join("") : "";
  return `<label class="${classes}">
    <input type="radio"${checked}${disabled}${name}${value} />
    <span>${labelHTML}</span>
  </label>${childrenHTML}`;
}
function renderRadioGroup$2(node, context) {
  var _a;
  const { classPrefix: prefix } = context;
  const isInline = (_a = node.props) == null ? void 0 : _a.inline;
  const classes = buildClasses$1(prefix, "radio-group", node.props);
  const inlineClass = isInline ? ` ${prefix}radio-group-inline` : "";
  const groupName = `radio-${Math.random().toString(36).substr(2, 9)}`;
  const radios = (node.children || []).map((child) => {
    if (child.type === "radio") {
      const modifiedChild = { ...child, props: { ...child.props, name: groupName } };
      return renderNode$2(modifiedChild, context);
    }
    return renderNode$2(child, context);
  }).join("\n    ");
  return `<div class="${classes}${inlineClass}">
    ${radios}
</div>`;
}
function renderIcon$2(node, context) {
  const { classPrefix: prefix } = context;
  const classes = buildClasses$1(prefix, "icon", node.props);
  const iconName = node.props.name || "default";
  const iconMap = {
    // Social media
    "twitter": "𝕏",
    // Twitter/X logo approximation
    "github": "⊙",
    // GitHub-like symbol
    "linkedin": "in",
    // LinkedIn text representation
    "facebook": "f",
    "instagram": "◉",
    "youtube": "▶",
    // Common UI icons
    "home": "🏠",
    "user": "👤",
    "settings": "⚙️",
    "search": "🔍",
    "star": "⭐",
    "heart": "❤️",
    "mail": "✉️",
    "phone": "📞",
    "calendar": "📅",
    "clock": "🕐",
    "location": "📍",
    "link": "🔗",
    "download": "⬇️",
    "upload": "⬆️",
    "edit": "✏️",
    "delete": "🗑️",
    "plus": "➕",
    "minus": "➖",
    "check": "✓",
    "close": "✕",
    "menu": "☰",
    "more": "⋯",
    "info": "ℹ️",
    "warning": "⚠️",
    "error": "❌",
    "success": "✅",
    // Arrows
    "arrow-up": "↑",
    "arrow-down": "↓",
    "arrow-left": "←",
    "arrow-right": "→",
    // Business/Finance
    "chart": "📊",
    "dollar": "$",
    "euro": "€",
    "pound": "£",
    // Tech
    "code": "</>",
    "database": "🗄️",
    "cloud": "☁️",
    "wifi": "📶",
    // Communication
    "chat": "💬",
    "video": "🎥",
    "microphone": "🎤",
    "bell": "🔔",
    // Files
    "file": "📄",
    "folder": "📁",
    "image": "🖼️",
    "document": "📃",
    "pdf": "📑",
    // Brand placeholders
    "logo": "◈",
    "brand": "◆",
    // Activities
    "rocket": "🚀",
    "bulb": "💡",
    "shield": "🛡️",
    "lock": "🔒",
    "unlock": "🔓",
    "key": "🔑",
    "gift": "🎁",
    "trophy": "🏆",
    "flag": "🚩",
    "bookmark": "🔖",
    "tag": "🏷️",
    "cart": "🛒",
    "credit-card": "💳",
    // Default
    "default": "●"
  };
  const iconContent = iconMap[iconName] || iconMap["default"];
  const socialIcons = ["twitter", "github", "linkedin", "facebook", "instagram", "youtube"];
  if (socialIcons.includes(iconName)) {
    return `<span class="${classes}" data-icon="${iconName}" aria-label="${iconName}" style="font-family: monospace; font-weight: bold; font-style: normal;">${iconContent}</span>`;
  }
  return `<span class="${classes}" data-icon="${iconName}" aria-label="${iconName}">${iconContent}</span>`;
}
function renderContainer$2(node, context) {
  var _a;
  const { classPrefix: prefix } = context;
  const classes = buildClasses$1(prefix, `container-${node.containerType}`, node.props);
  const nodeClasses = ((_a = node.props) == null ? void 0 : _a.classes) || [];
  if (node.containerType === "alert") {
    return renderAlertContainer(node, context, classes, nodeClasses);
  }
  if (node.containerType === "layout" && nodeClasses.includes("sidebar-main")) {
    return renderSidebarMainLayout(node, context, classes);
  }
  const childrenHTML = (node.children || []).map((child) => renderNode$2(child, context)).join("\n  ");
  return `<div class="${classes}">
  ${childrenHTML}
</div>`;
}
function renderAlertContainer(node, context, classes, nodeClasses) {
  const { classPrefix: prefix } = context;
  const variantClass = nodeClasses.find(
    (c) => c === "success" || c === "info" || c === "warning" || c === "error"
  );
  const role = "alert";
  const variantAttr = variantClass ? ` data-variant="${escapeHtml$1(variantClass)}"` : "";
  const children = node.children || [];
  let title = null;
  let bodyChildren = children;
  if (children.length > 1) {
    const first = children[0];
    if (first.type === "paragraph") {
      const fromContent = typeof first.content === "string" ? first.content : null;
      const fromChildren = Array.isArray(first.children) ? first.children.map((c) => c.type === "text" ? c.value ?? "" : "").join("") : "";
      const titleText = fromContent ?? (fromChildren.length > 0 ? fromChildren : null);
      if (titleText !== null) {
        title = titleText;
        bodyChildren = children.slice(1);
      }
    }
  }
  const bodyHTML = bodyChildren.map((child) => renderNode$2(child, context)).join("\n  ");
  const titleHTML = title !== null ? `  <p class="${prefix}alert-title">${escapeHtml$1(title)}</p>
` : "";
  return `<div class="${classes}" role="${role}"${variantAttr}>
${titleHTML}  ${bodyHTML}
</div>`;
}
function renderSidebarMainLayout(node, context, classes) {
  var _a;
  const { classPrefix: prefix } = context;
  const children = node.children || [];
  const sections = [];
  let current = null;
  for (const child of children) {
    if (child.type === "container" && (child.containerType === "sidebar" || child.containerType === "main") || child.type === "sidebar") {
      if (current) sections.push(current);
      const name = child.type === "sidebar" ? "sidebar" : child.containerType;
      sections.push({ name, nodes: child.children || [] });
      current = null;
    } else {
      const childClasses = ((_a = child.props) == null ? void 0 : _a.classes) || [];
      if (child.type === "heading" && (childClasses.includes("sidebar") || childClasses.includes("main"))) {
        if (current) sections.push(current);
        current = { name: childClasses.includes("sidebar") ? "sidebar" : "main", nodes: [] };
      } else if (current) {
        current.nodes.push(child);
      }
    }
  }
  if (current) sections.push(current);
  const sectionsHTML = sections.map((s) => {
    const contentHTML = s.nodes.map((child) => renderNode$2(child, context)).join("\n    ");
    return `  <div class="${prefix}layout-${s.name}">
    ${contentHTML}
  </div>`;
  }).join("\n");
  return `<div class="${classes}">
${sectionsHTML}
</div>`;
}
function renderNav$2(node, context) {
  const { classPrefix: prefix } = context;
  const classes = buildClasses$1(prefix, "nav", node.props);
  const childrenHTML = (node.children || []).map((child) => renderNode$2(child, context)).join("\n    ");
  return `<nav class="${classes}">
  <div class="${prefix}nav-content">
    ${childrenHTML}
  </div>
</nav>`;
}
function renderNavItem$2(node, context) {
  var _a;
  const { classPrefix: prefix } = context;
  const href = node.href || "#";
  const contentHTML = node.children ? node.children.map((child) => renderNode$2(child, context)).join("") : escapeHtml$1(node.content);
  if (((_a = node.props) == null ? void 0 : _a.variant) === "primary") {
    const classes2 = `${buildClasses$1(prefix, "button", node.props)} ${prefix}button-primary`;
    return `<a href="${href}" class="${classes2.trim()}" style="text-decoration:none;color:inherit;">${contentHTML}</a>`;
  }
  const classes = buildClasses$1(prefix, "nav-item", node.props);
  return `<a href="${href}" class="${classes}">${contentHTML}</a>`;
}
function renderBreadcrumbs(node, context) {
  const { classPrefix: prefix } = context;
  const items = node.children || [];
  const crumbsHTML = items.map((crumb, i) => {
    const isLast = i === items.length - 1;
    const label = escapeHtml$1(crumb.content || "");
    return isLast ? `<span class="${prefix}breadcrumb-item ${prefix}breadcrumb-current" aria-current="page">${label}</span>` : `<span class="${prefix}breadcrumb-item"><a href="#">${label}</a></span><span class="${prefix}breadcrumb-sep" aria-hidden="true">›</span>`;
  }).join("");
  return `<nav class="${prefix}breadcrumbs" aria-label="breadcrumb">${crumbsHTML}</nav>`;
}
function renderBrand$2(node, context) {
  const { classPrefix: prefix } = context;
  const classes = buildClasses$1(prefix, "brand", node.props);
  const childrenHTML = (node.children || []).map((child) => renderNode$2(child, context)).join("");
  return `<div class="${classes}">${childrenHTML}</div>`;
}
function renderGrid$2(node, context) {
  var _a;
  const { classPrefix: prefix } = context;
  const classes = buildClasses$1(prefix, "grid", node.props);
  const columns = node.columns || 3;
  const gridClass = `${classes} ${prefix}grid-${columns}`;
  const isCard = !!((_a = node.props) == null ? void 0 : _a.card);
  const childrenHTML = (node.children || []).map((child) => renderGridItem$2(child, context, isCard)).join("\n  ");
  return `<div class="${gridClass}" style="--grid-columns: ${columns}">
  ${childrenHTML}
</div>`;
}
function renderGridItem$2(node, context, isCard = false) {
  var _a, _b;
  const { classPrefix: prefix } = context;
  const extraClasses = isCard ? [...((_a = node.props) == null ? void 0 : _a.classes) || [], "grid-item-card"] : ((_b = node.props) == null ? void 0 : _b.classes) || [];
  const itemProps = { ...node.props, classes: extraClasses };
  const classes = buildClasses$1(prefix, "grid-item", itemProps);
  const childrenHTML = (node.children || []).map((child) => renderNode$2(child, context)).join("\n    ");
  return `<div class="${classes}">
    ${childrenHTML}
  </div>`;
}
function renderRow$2(node, context) {
  const { classPrefix: prefix } = context;
  const classes = buildClasses$1(prefix, "row", node.props);
  const childrenHTML = (node.children || []).map((child) => renderGridItem$2(child, context)).join("\n  ");
  return `<div class="${classes}">
  ${childrenHTML}
</div>`;
}
function renderHeading$2(node, context) {
  var _a;
  if (!node.content && !((_a = node.children) == null ? void 0 : _a.length)) return "";
  const { classPrefix: prefix } = context;
  const level = node.level || 1;
  const classes = buildClasses$1(prefix, `h${level}`, node.props);
  const content = node.content || "";
  const childrenHTML = node.children ? node.children.map((child) => renderNode$2(child, context)).join("") : escapeHtml$1(content);
  return `<h${level} class="${classes}">${childrenHTML}</h${level}>`;
}
function renderParagraph$2(node, context) {
  const { classPrefix: prefix } = context;
  const classes = buildClasses$1(prefix, "paragraph", node.props);
  let childrenHTML;
  if (node.children) {
    childrenHTML = node.children.map((child) => renderNode$2(child, context)).join("");
  } else if (node.content) {
    const hasHtmlTags = /<[^>]+>/.test(node.content);
    childrenHTML = hasHtmlTags ? node.content : escapeHtml$1(node.content);
  } else {
    childrenHTML = "";
  }
  return `<p class="${classes}">${childrenHTML}</p>`;
}
function renderText$2(node, _context) {
  const content = node.content || "";
  const hasHtmlTags = /<[^>]+>/.test(content);
  return hasHtmlTags ? content : escapeHtml$1(content);
}
function renderImage$2(node, context) {
  const { classPrefix: prefix } = context;
  const classes = buildClasses$1(prefix, "image", node.props);
  const src = node.src || "";
  const alt = node.alt || "";
  const width = node.props.width ? ` width="${node.props.width}"` : "";
  const height = node.props.height ? ` height="${node.props.height}"` : "";
  return `<img src="${escapeHtml$1(src)}" alt="${escapeHtml$1(alt)}" class="${classes}"${width}${height} />`;
}
function renderLink$2(node, context) {
  const { classPrefix: prefix } = context;
  const classes = buildClasses$1(prefix, "link", node.props);
  const href = node.href || "#";
  const title = node.title ? ` title="${escapeHtml$1(node.title)}"` : "";
  const childrenHTML = node.children ? node.children.map((child) => renderNode$2(child, context)).join("") : escapeHtml$1(node.content || "");
  return `<a href="${escapeHtml$1(href)}" class="${classes}"${title}>${childrenHTML}</a>`;
}
function renderList$2(node, context) {
  const { classPrefix: prefix } = context;
  const classes = buildClasses$1(prefix, "list", node.props);
  const tag = node.ordered ? "ol" : "ul";
  const childrenHTML = (node.children || []).map((child) => renderNode$2(child, context)).join("\n  ");
  return `<${tag} class="${classes}">
  ${childrenHTML}
</${tag}>`;
}
function renderListItem$2(node, context) {
  const { classPrefix: prefix } = context;
  const classes = buildClasses$1(prefix, "list-item", node.props);
  let html = "";
  if (node.content) {
    html = escapeHtml$1(node.content);
  }
  if (node.children) {
    const childrenHTML = node.children.map((child) => renderNode$2(child, context)).join("");
    html += childrenHTML;
  }
  return `<li class="${classes}">${html}</li>`;
}
function renderTable$2(node, context) {
  var _a, _b;
  const { classPrefix: prefix } = context;
  const classes = buildClasses$1(prefix, "table", node.props);
  const headerNode = (_a = node.children) == null ? void 0 : _a.find((child) => child.type === "table-header");
  const rowNodes = ((_b = node.children) == null ? void 0 : _b.filter((child) => child.type === "table-row")) || [];
  const headerHTML = headerNode ? renderNode$2(headerNode, context) : "";
  const rowsHTML = rowNodes.map((child) => renderNode$2(child, context)).join("\n    ");
  const bodyHTML = rowsHTML ? `
  <tbody>
    ${rowsHTML}
  </tbody>` : "";
  return `<table class="${classes}">
  ${headerHTML}${bodyHTML}
</table>`;
}
function renderTableHeader$2(node, context) {
  const cellsHTML = (node.children || []).map((child) => renderNode$2(child, context)).join("\n    ");
  return `<thead>
    <tr>
      ${cellsHTML}
    </tr>
  </thead>`;
}
function renderTableRow$2(node, context) {
  const cellsHTML = (node.children || []).map((child) => renderNode$2(child, context)).join("\n    ");
  return `<tr>
    ${cellsHTML}
  </tr>`;
}
function renderTableCell$2(node, context) {
  const { classPrefix: prefix } = context;
  const tag = node.header ? "th" : "td";
  const align = node.align || "left";
  const classes = buildClasses$1(prefix, `table-cell ${prefix}align-${align}`, {});
  const contentHTML = node.children && node.children.length > 0 ? node.children.map((child) => renderNode$2(child, context)).join("") : escapeHtml$1(node.content || "");
  return `<${tag} class="${classes}">${contentHTML}</${tag}>`;
}
function renderBlockquote$2(node, context) {
  const { classPrefix: prefix } = context;
  const classes = buildClasses$1(prefix, "blockquote", node.props);
  const childrenHTML = (node.children || []).map((child) => renderNode$2(child, context)).join("\n  ");
  return `<blockquote class="${classes}">
  ${childrenHTML}
</blockquote>`;
}
function renderCode$2(node, context) {
  const { classPrefix: prefix } = context;
  const inline = node.inline !== false;
  if (inline) {
    const classes = buildClasses$1(prefix, "code-inline", {});
    return `<code class="${classes}">${escapeHtml$1(node.value)}</code>`;
  } else {
    const classes = buildClasses$1(prefix, "code-block", {});
    const lang = node.lang ? ` data-lang="${escapeHtml$1(node.lang)}"` : "";
    return `<pre class="${classes}"><code${lang}>${escapeHtml$1(node.value)}</code></pre>`;
  }
}
function renderSeparator$2(node, context) {
  const { classPrefix: prefix } = context;
  const classes = buildClasses$1(prefix, "separator", node.props);
  return `<hr class="${classes}" />`;
}
function renderTabs(node, context) {
  const { classPrefix: prefix } = context;
  const classes = buildClasses$1(prefix, "tabs", node.props);
  const tabs = node.children || [];
  const headers = tabs.map((tab, i) => {
    const activeClass = tab.active ? ` ${prefix}active` : "";
    return `<button type="button" role="tab" class="${prefix}tab-header${activeClass}" data-wmd-tab="${i}">${escapeHtml$1(tab.label || "")}</button>`;
  }).join("");
  const panels = tabs.map((tab, i) => {
    const panelChildren = (tab.children || []).map((c) => renderNode$2(c, context)).join("\n    ");
    const hidden = tab.active ? "" : " hidden";
    return `<div class="${prefix}tab-panel" role="tabpanel" data-wmd-tab-panel="${i}"${hidden}>
    ${panelChildren}
  </div>`;
  }).join("\n  ");
  return `<div class="${classes}" data-wmd-tabs>
  <div class="${prefix}tab-headers" role="tablist">${headers}</div>
  <div class="${prefix}tab-panels">
  ${panels}
  </div>
</div>${getTabsScript(prefix)}`;
}
function renderTab(node, context) {
  const { classPrefix: prefix } = context;
  const hidden = node.active ? "" : " hidden";
  const childrenHTML = (node.children || []).map((c) => renderNode$2(c, context)).join("");
  return `<div class="${prefix}tab-panel" role="tabpanel"${hidden}>${childrenHTML}</div>`;
}
function getTabsScript(prefix) {
  return `<script>(function(){if(window.__wmdTabsInit)return;window.__wmdTabsInit=true;document.addEventListener('click',function(e){var btn=e.target.closest('.${prefix}tab-header');if(!btn)return;var root=btn.closest('[data-wmd-tabs]');if(!root)return;var idx=btn.getAttribute('data-wmd-tab');root.querySelectorAll('.${prefix}tab-header').forEach(function(b){b.classList.toggle('${prefix}active',b.getAttribute('data-wmd-tab')===idx);});root.querySelectorAll('[data-wmd-tab-panel]').forEach(function(p){if(p.getAttribute('data-wmd-tab-panel')===idx){p.removeAttribute('hidden');}else{p.setAttribute('hidden','');}});});})();<\/script>`;
}
function buildClasses$1(prefix, baseClass, props) {
  const classes = [`${prefix}${baseClass}`];
  if (props.classes && Array.isArray(props.classes)) {
    props.classes.forEach((cls) => {
      classes.push(`${prefix}${cls}`);
    });
  }
  if (props.variant) {
    classes.push(`${prefix}${baseClass}-${props.variant}`);
  }
  if (props.state) {
    classes.push(`${prefix}state-${props.state}`);
  }
  return classes.join(" ");
}
function renderDemo(node, context) {
  var _a, _b;
  const { classPrefix: prefix } = context;
  const previewHTML = (node.children || []).map((child) => renderNode$2(child, context)).join("\n");
  const showRaw = context.style !== "coss" || ((_b = (_a = node.props) == null ? void 0 : _a.classes) == null ? void 0 : _b.includes("show-source")) === true;
  let codeSource;
  if (showRaw) {
    codeSource = node.raw || "";
  } else {
    try {
      codeSource = generateCode(node.children || [], { format: context.codegen });
    } catch {
      codeSource = node.raw || "";
    }
  }
  const codeHTML = escapeHtml$1(codeSource);
  return `<div class="${prefix}demo">
  <div class="${prefix}demo-preview">${previewHTML}</div>
  <div class="${prefix}demo-code">
    <div class="${prefix}demo-code-toolbar">
      <button class="${prefix}demo-copy" onclick="(function(btn){var code=btn.closest('.${prefix}demo-code').querySelector('code');navigator.clipboard.writeText(code.textContent).then(function(){btn.textContent='Copied!';setTimeout(function(){btn.textContent='Copy'},1500)})})(this)">Copy</button>
    </div>
    <pre><code>${codeHTML}</code></pre>
  </div>
</div>`;
}
function escapeHtml$1(text2) {
  if (!text2) return "";
  return text2.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function renderToast(node, context) {
  var _a, _b;
  const { classPrefix: prefix } = context;
  const toastType = (_a = node.props) == null ? void 0 : _a.toastType;
  const variantClass = toastType && toastType !== "loading" ? toastType : void 0;
  const extraClasses = (((_b = node.props) == null ? void 0 : _b.classes) || []).filter(
    (c) => c !== variantClass
  );
  const cls = buildClasses$1(prefix, "toast", { ...node.props, classes: extraClasses });
  const variantHTML = variantClass ? ` data-variant="${escapeHtml$1(variantClass)}"` : "";
  const childrenHTML = (node.children || []).map((child) => renderNode$2(child, context)).join("\n  ");
  return `<div class="${cls}" role="status"${variantHTML}>
  ${childrenHTML}
</div>`;
}
function renderSkeleton(node, context) {
  var _a, _b;
  const { classPrefix: prefix } = context;
  const cls = buildClasses$1(prefix, "skeleton", node.props);
  const width = (_a = node.props) == null ? void 0 : _a.width;
  const height = (_b = node.props) == null ? void 0 : _b.height;
  const styleAttr = width !== void 0 || height !== void 0 ? ` style="${[
    width !== void 0 ? `width:${typeof width === "number" ? `${width}px` : width}` : "",
    height !== void 0 ? `height:${typeof height === "number" ? `${height}px` : height}` : ""
  ].filter(Boolean).join(";")}"` : "";
  return `<div class="${cls}"${styleAttr}></div>`;
}
function renderSpinner(node, context) {
  var _a;
  const { classPrefix: prefix } = context;
  const size = ((_a = node.props) == null ? void 0 : _a.size) || "medium";
  const sizeClass = size === "small" ? "spinner-sm" : size === "large" ? "spinner-lg" : "spinner-md";
  const cls = buildClasses$1(prefix, "spinner", { ...node.props, classes: [sizeClass] });
  return `<div class="${cls}" role="status" aria-label="Loading"></div>`;
}
function renderKbd(node, context) {
  const { classPrefix: prefix } = context;
  const cls = buildClasses$1(prefix, "kbd", node.props);
  return `<kbd class="${cls}">${escapeHtml$1(node.content ?? "")}</kbd>`;
}
function renderProgress(node, context) {
  var _a;
  const { classPrefix: prefix } = context;
  const cls = buildClasses$1(prefix, "progress", node.props);
  const value = Math.max(0, Math.min(100, Number(node.value ?? 0)));
  const indeterminate = !!node.indeterminate;
  const labelText = (_a = node.props) == null ? void 0 : _a.label;
  const labelHTML = labelText ? `  <p class="${prefix}progress-label">${escapeHtml$1(labelText)}</p>
` : "";
  const trackWidth = indeterminate ? 100 : value;
  const indicatorStyle = ` style="width:${trackWidth}%"`;
  const trackHTML = `  <div class="${prefix}progress-track">
    <div class="${prefix}progress-indicator"${indicatorStyle}></div>
  </div>`;
  const valueHTML = !indeterminate ? `
  <p class="${prefix}progress-value">${value}%</p>` : "";
  return `<div class="${cls}" role="progressbar" aria-valuenow="${value}"${indeterminate ? "" : ` aria-valuemin="0" aria-valuemax="100"`}${indeterminate ? ' data-indeterminate="true"' : ""}>
${labelHTML}${trackHTML}${valueHTML}
</div>`;
}
function renderMeter(node, context) {
  var _a;
  const { classPrefix: prefix } = context;
  const cls = buildClasses$1(prefix, "meter", node.props);
  const value = Number(node.value ?? 0);
  const min = Number(node.min ?? 0);
  const max = Number(node.max ?? 100);
  const range = max - min || 1;
  const pct = Math.max(0, Math.min(100, (value - min) / range * 100));
  const labelText = (_a = node.props) == null ? void 0 : _a.label;
  const labelHTML = labelText ? `  <p class="${prefix}meter-label">${escapeHtml$1(labelText)}</p>
` : "";
  const indicatorStyle = ` style="width:${pct}%"`;
  const trackHTML = `  <div class="${prefix}meter-track">
    <div class="${prefix}meter-indicator"${indicatorStyle}></div>
  </div>`;
  const valueHTML = `
  <p class="${prefix}meter-value">${value} / ${max}</p>`;
  return `<div class="${cls}" role="meter" aria-valuenow="${value}" aria-valuemin="${min}" aria-valuemax="${max}">
${labelHTML}${trackHTML}${valueHTML}
</div>`;
}
function overlayShell(context, kind, props, inner, role = "dialog", ariaLabel, dataAttrs = "") {
  const { classPrefix: prefix } = context;
  const cleanedProps = { ...props };
  delete cleanedProps.title;
  delete cleanedProps.description;
  delete cleanedProps.showClose;
  delete cleanedProps.cancelText;
  delete cleanedProps.actionText;
  delete cleanedProps.actionVariant;
  delete cleanedProps.content;
  delete cleanedProps.trigger;
  const cls = buildClasses$1(prefix, kind, cleanedProps);
  const title = typeof props.title === "string" ? props.title : void 0;
  const desc = typeof props.description === "string" ? props.description : void 0;
  const showClose = props.showClose !== false;
  const titleHTML = title ? `  <h2 class="${prefix}${kind}-title">${escapeHtml$1(title)}</h2>
` : "";
  const descHTML = desc ? `  <p class="${prefix}${kind}-description">${escapeHtml$1(desc)}</p>
` : "";
  const closeHTML = showClose && kind === "dialog" ? `  <button type="button" class="${prefix}${kind}-close" aria-label="Close">×</button>
` : "";
  const ariaLabelAttr = "";
  return `<div class="${cls}" role="${role}"${ariaLabelAttr}${dataAttrs}>
${titleHTML}${descHTML}${inner}${closeHTML}</div>`;
}
function renderDialog(node, context) {
  const inner = (node.children || []).map((c) => renderNode$2(c, context)).join("\n  ");
  return overlayShell(context, "dialog", node.props || {}, inner, "dialog");
}
function renderAlertDialog(node, context) {
  var _a, _b, _c;
  const inner = (node.children || []).map((c) => renderNode$2(c, context)).join("\n  ");
  const actionVariant = ((_a = node.props) == null ? void 0 : _a.actionVariant) || "danger";
  const actionText = ((_b = node.props) == null ? void 0 : _b.actionText) || "Confirm";
  const cancelText = ((_c = node.props) == null ? void 0 : _c.cancelText) || "Cancel";
  const actionsHTML = `
  <div class="${context.classPrefix}alert-dialog-actions">
    <button type="button" class="${context.classPrefix}button ${context.classPrefix}${actionVariant}">${escapeHtml$1(cancelText)}</button>
    <button type="button" class="${context.classPrefix}button ${context.classPrefix}${actionVariant === "danger" ? "primary" : "danger"}">${escapeHtml$1(actionText)}</button>
  </div>`;
  return overlayShell(context, "alert-dialog", node.props || {}, inner + actionsHTML, "alertdialog");
}
function renderSheet(node, context) {
  const inner = (node.children || []).map((c) => renderNode$2(c, context)).join("\n  ");
  const side = node.side || "right";
  return overlayShell(
    context,
    "sheet",
    node.props || {},
    inner,
    "dialog",
    void 0,
    ` data-side="${escapeHtml$1(side)}"`
  );
}
function renderDrawer(node, context) {
  const inner = (node.children || []).map((c) => renderNode$2(c, context)).join("\n  ");
  const side = node.side || "left";
  return overlayShell(
    context,
    "drawer",
    node.props || {},
    inner,
    "dialog",
    void 0,
    ` data-side="${escapeHtml$1(side)}"`
  );
}
function renderPopover(node, context) {
  const inner = (node.children || []).map((c) => renderNode$2(c, context)).join("\n  ");
  return overlayShell(context, "popover", node.props || {}, inner, "dialog");
}
function renderTooltip(node, context) {
  var _a, _b;
  const { classPrefix: prefix } = context;
  const cleanedProps = { ...node.props || {} };
  delete cleanedProps.content;
  delete cleanedProps.side;
  const cls = buildClasses$1(prefix, "tooltip", cleanedProps);
  const content = ((_a = node.props) == null ? void 0 : _a.content) || "";
  const side = ((_b = node.props) == null ? void 0 : _b.side) || "top";
  const childHTML = (node.children || []).map((c) => renderNode$2(c, context)).join("\n  ");
  const inner = childHTML || content;
  return `<span class="${cls}" role="tooltip" data-side="${escapeHtml$1(side)}">${escapeHtml$1(inner)}</span>`;
}
function renderPreviewCard(node, context) {
  var _a;
  const { classPrefix: prefix } = context;
  const cls = buildClasses$1(prefix, "preview-card", node.props || {});
  const childrenHTML = (node.children || []).map((c) => renderNode$2(c, context)).join("\n  ");
  const href = (_a = node.props) == null ? void 0 : _a.href;
  const wrap = (inner) => href ? `<a class="${prefix}preview-card-link" href="${escapeHtml$1(href)}">${inner}</a>` : inner;
  return wrap(`<div class="${cls}">
  ${childrenHTML}
</div>`);
}
function renderPagination(node, context) {
  var _a;
  const { classPrefix: prefix } = context;
  const label = ((_a = node.props) == null ? void 0 : _a.label) || "pagination";
  const raw = node.children || [];
  const items = [];
  for (const child of raw) {
    if (child.type === "container" && child.containerType === "button-group") {
      items.push(...child.children || []);
    } else {
      items.push(child);
    }
  }
  const linksHTML = items.filter((item) => item.type === "button" || item.type === "nav-item" || item.type === "text").map((item) => {
    var _a2, _b;
    const isCurrent = (((_a2 = item.props) == null ? void 0 : _a2.classes) || []).includes("active") || ((_b = item.props) == null ? void 0 : _b.variant) === "primary";
    const text2 = item.content ?? "";
    const linkCls = `${prefix}pagination-link${isCurrent ? ` ${prefix}pagination-active` : ""}`;
    const currentAttr = isCurrent ? ' aria-current="page"' : "";
    return `      <li class="${prefix}pagination-item"><a class="${linkCls}" href="#"${currentAttr}>${escapeHtml$1(text2)}</a></li>`;
  }).join("\n");
  return `<nav class="${prefix}pagination" aria-label="${escapeHtml$1(label)}" role="navigation">
    <ul class="${prefix}pagination-content">
${linksHTML}
    </ul>
</nav>`;
}
function renderSegmentedControl(node, context) {
  const { classPrefix: prefix } = context;
  const raw = node.children || [];
  const items = [];
  for (const child of raw) {
    if (child.type === "container" && child.containerType === "button-group") {
      items.push(...child.children || []);
    } else {
      items.push(child);
    }
  }
  const buttonsHTML = items.filter((item) => item.type === "button" || item.type === "nav-item").map((item) => {
    var _a, _b;
    const isActive = (((_a = item.props) == null ? void 0 : _a.classes) || []).includes("active") || ((_b = item.props) == null ? void 0 : _b.variant) === "primary";
    const text2 = item.content ?? "";
    const btnCls = `${prefix}segmented-item${isActive ? ` ${prefix}segmented-active` : ""}`;
    const activeAttr = isActive ? ' aria-pressed="true"' : ' aria-pressed="false"';
    return `  <button type="button" class="${btnCls}"${activeAttr}>${escapeHtml$1(text2)}</button>`;
  }).join("\n");
  return `<div class="${prefix}segmented-control" role="group">
${buttonsHTML}
</div>`;
}
function renderScrollArea(node, context) {
  var _a;
  const { classPrefix: prefix } = context;
  const cleaned = { ...node.props || {} };
  delete cleaned.maxHeight;
  const cls = buildClasses$1(prefix, "scroll-area", cleaned);
  const maxHeight = (_a = node.props) == null ? void 0 : _a.maxHeight;
  const styleAttr = maxHeight !== void 0 ? ` style="max-height:${typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight}"` : "";
  const childrenHTML = (node.children || []).map((c) => renderNode$2(c, context)).join("\n    ");
  return `<div class="${cls}"${styleAttr}>
  <div class="${prefix}scroll-area-viewport">
    ${childrenHTML}
  </div>
</div>`;
}
function renderSidebarNav(node, context) {
  var _a;
  const { classPrefix: prefix } = context;
  const cleaned = { ...node.props || {} };
  delete cleaned.title;
  const cls = buildClasses$1(prefix, "sidebar-nav", cleaned);
  const title = (_a = node.props) == null ? void 0 : _a.title;
  const titleHTML = title ? `  <div class="${prefix}sidebar-header">${escapeHtml$1(title)}</div>
` : "";
  const childrenHTML = (node.children || []).map((c) => {
    if (c.type === "list") {
      const itemsHTML = (c.children || []).map((li) => {
        var _a2;
        const liClasses = ((_a2 = li.props) == null ? void 0 : _a2.classes) || [];
        const isActive = liClasses.includes("active");
        const itemCls = `${prefix}sidebar-item${isActive ? ` ${prefix}sidebar-item-active` : ""}`;
        const text2 = (li.content ?? "").replace(/\s*:::\s*$/, "").trim();
        return `    <a class="${itemCls}" href="#">${escapeHtml$1(text2)}</a>`;
      }).join("\n");
      return `  <nav class="${prefix}sidebar-menu">
${itemsHTML}
  </nav>`;
    }
    return renderNode$2(c, context).split("\n").map((l) => l ? `  ${l}` : l).join("\n");
  }).join("\n");
  return `<aside class="${cls}">
${titleHTML}${childrenHTML}
</aside>`;
}
function renderMenubar(node, context) {
  const { classPrefix: prefix } = context;
  const cls = buildClasses$1(prefix, "menubar", node.props || {});
  const childrenHTML = (node.children || []).map((c) => renderNode$2(c, context)).join("\n  ");
  return `<div class="${cls}" role="menubar">
  ${childrenHTML}
</div>`;
}
function renderForm(node, context) {
  var _a, _b;
  const { classPrefix: prefix } = context;
  const action = (_a = node.props) == null ? void 0 : _a.action;
  const method = (_b = node.props) == null ? void 0 : _b.method;
  const actionAttr = action ? ` action="${escapeHtml$1(action)}"` : "";
  const methodAttr = method ? ` method="${escapeHtml$1(method)}"` : "";
  const childrenHTML = (node.children || []).map((c) => renderNode$2(c, context)).join("\n  ");
  return `<form class="${prefix}form"${actionAttr}${methodAttr}>
  ${childrenHTML}
</form>`;
}
function renderField(node, context) {
  var _a, _b, _c;
  const { classPrefix: prefix } = context;
  const label = (_a = node.props) == null ? void 0 : _a.label;
  const desc = (_b = node.props) == null ? void 0 : _b.description;
  const error = (_c = node.props) == null ? void 0 : _c.error;
  const labelHTML = label ? `  <label class="${prefix}field-label">${escapeHtml$1(label)}</label>
` : "";
  const childrenHTML = (node.children || []).map((c) => renderNode$2(c, context)).join("\n  ");
  const descHTML = desc ? `
  <p class="${prefix}field-description">${escapeHtml$1(desc)}</p>` : "";
  const errorHTML = error ? `
  <p class="${prefix}field-error" role="alert">${escapeHtml$1(error)}</p>` : "";
  return `<div class="${prefix}field">
${labelHTML}  ${childrenHTML}${descHTML}${errorHTML}
</div>`;
}
function renderFieldset(node, context) {
  var _a, _b;
  const { classPrefix: prefix } = context;
  const legend = (_a = node.props) == null ? void 0 : _a.legend;
  const desc = (_b = node.props) == null ? void 0 : _b.description;
  const legendHTML = legend ? `  <legend class="${prefix}fieldset-legend">${escapeHtml$1(legend)}</legend>
` : "";
  const descHTML = desc ? `  <p class="${prefix}fieldset-description">${escapeHtml$1(desc)}</p>
` : "";
  const childrenHTML = (node.children || []).map((c) => renderNode$2(c, context)).join("\n  ");
  return `<fieldset class="${prefix}fieldset">
${legendHTML}${descHTML}  ${childrenHTML}
</fieldset>`;
}
function renderLabel(node, context) {
  var _a;
  const { classPrefix: prefix } = context;
  const htmlFor = (_a = node.props) == null ? void 0 : _a.htmlFor;
  const forAttr = htmlFor ? ` for="${escapeHtml$1(htmlFor)}"` : "";
  return `<label class="${prefix}label"${forAttr}>${escapeHtml$1(node.content ?? "")}</label>`;
}
function renderInputGroup(node, context) {
  var _a, _b;
  const { classPrefix: prefix } = context;
  const start = (_a = node.props) == null ? void 0 : _a.addonStart;
  const end = (_b = node.props) == null ? void 0 : _b.addonEnd;
  const childrenHTML = (node.children || []).map((c) => renderNode$2(c, context)).join("\n  ");
  const startHTML = start ? `  <span class="${prefix}input-group-addon">${escapeHtml$1(start)}</span>
` : "";
  const endHTML = end ? `
  <span class="${prefix}input-group-addon">${escapeHtml$1(end)}</span>` : "";
  return `<div class="${prefix}input-group">
${startHTML}  ${childrenHTML}${endHTML}
</div>`;
}
function renderOtpField(node, context) {
  var _a, _b;
  const { classPrefix: prefix } = context;
  const length = Number(((_a = node.props) == null ? void 0 : _a.length) ?? 6);
  const maxLength = Number(((_b = node.props) == null ? void 0 : _b.maxLength) ?? 1);
  const slots = Array.from(
    { length },
    () => `<input class="${prefix}otp-slot" type="text" inputmode="numeric" maxlength="${maxLength}" aria-label="digit">`
  ).join("\n  ");
  return `<div class="${prefix}otp-field" role="group" aria-label="Verification code">
  ${slots}
</div>`;
}
function renderNumberField(node, context) {
  const { classPrefix: prefix } = context;
  const p = node.props || {};
  const numAttrs = (name) => p[name] !== void 0 ? ` ${name}="${escapeHtml$1(String(p[name]))}"` : "";
  const valueAttr = p.value !== void 0 ? ` value="${escapeHtml$1(String(p.value))}"` : "";
  const placeholderAttr = p.placeholder ? ` placeholder="${escapeHtml$1(p.placeholder)}"` : "";
  const btnCls = `${prefix}number-stepper`;
  return `<div class="${prefix}number-field">
  <button type="button" class="${btnCls}" aria-label="Decrease">−</button>
  <input class="${prefix}number-input" type="number"${numAttrs("min")}${numAttrs("max")}${numAttrs("step")}${valueAttr}${placeholderAttr}>
  <button type="button" class="${btnCls}" aria-label="Increase">+</button>
</div>`;
}
function renderAutocomplete(node, context) {
  const { classPrefix: prefix } = context;
  const p = node.props || {};
  const placeholderAttr = p.placeholder ? ` placeholder="${escapeHtml$1(p.placeholder)}"` : "";
  const suggestions = p.suggestions || [];
  const listItems = suggestions.map((s) => `    <li class="${prefix}autocomplete-option" role="option">${escapeHtml$1(s)}</li>`).join("\n");
  const listHTML = suggestions.length > 0 ? `
  <ul class="${prefix}autocomplete-list" role="listbox">
${listItems}
  </ul>` : "";
  return `<div class="${prefix}autocomplete">
  <input class="${prefix}autocomplete-input" type="text" role="combobox" aria-expanded="false" aria-autocomplete="list"${placeholderAttr}>${listHTML}
</div>`;
}
function renderCombobox(node, context) {
  const { classPrefix: prefix } = context;
  const p = node.props || {};
  const placeholderAttr = p.placeholder ? ` placeholder="${escapeHtml$1(p.placeholder)}"` : "";
  const options = p.options || [];
  const listItems = options.map((o) => `    <li class="${prefix}combobox-option" role="option">${escapeHtml$1(o)}</li>`).join("\n");
  const listHTML = options.length > 0 ? `
  <ul class="${prefix}combobox-list" role="listbox">
${listItems}
  </ul>` : "";
  return `<div class="${prefix}combobox">
  <input class="${prefix}combobox-input" type="text" role="combobox" aria-expanded="false" aria-autocomplete="list"${placeholderAttr}>
  <span class="${prefix}combobox-caret" aria-hidden="true">▾</span>${listHTML}
</div>`;
}
function renderCommand(node, context) {
  const { classPrefix: prefix } = context;
  const p = node.props || {};
  const placeholderAttr = p.placeholder ? ` placeholder="${escapeHtml$1(p.placeholder)}"` : "";
  const childrenHTML = (node.children || []).map((c) => renderNode$2(c, context)).join("\n  ");
  return `<div class="${prefix}command" role="dialog" aria-label="Command menu">
  <input class="${prefix}command-input" type="text"${placeholderAttr}>
  ${childrenHTML}
</div>`;
}
function renderCheckboxGroup(node, context) {
  var _a, _b;
  const { classPrefix: prefix } = context;
  const label = (_a = node.props) == null ? void 0 : _a.label;
  const desc = (_b = node.props) == null ? void 0 : _b.description;
  const labelHTML = label ? `  <p class="${prefix}checkbox-group-label">${escapeHtml$1(label)}</p>
` : "";
  const descHTML = desc ? `  <p class="${prefix}checkbox-group-description">${escapeHtml$1(desc)}</p>
` : "";
  const childrenHTML = (node.children || []).map((c) => renderNode$2(c, context)).join("\n  ");
  return `<div class="${prefix}checkbox-group" role="group">
${labelHTML}${descHTML}  ${childrenHTML}
</div>`;
}
function renderToggleGroup(node, context) {
  const { classPrefix: prefix } = context;
  const raw = node.children || [];
  const items = [];
  for (const child of raw) {
    if (child.type === "container" && child.containerType === "button-group") {
      items.push(...child.children || []);
    } else {
      items.push(child);
    }
  }
  const buttonsHTML = items.filter((item) => item.type === "button" || item.type === "nav-item").map((item) => {
    var _a, _b;
    const isPressed = (((_a = item.props) == null ? void 0 : _a.classes) || []).includes("active") || ((_b = item.props) == null ? void 0 : _b.variant) === "primary";
    const text2 = item.content ?? "";
    const btnCls = `${prefix}toggle${isPressed ? ` ${prefix}toggle-pressed` : ""}`;
    const pressedAttr = isPressed ? ' aria-pressed="true"' : ' aria-pressed="false"';
    return `  <button type="button" class="${btnCls}"${pressedAttr}>${escapeHtml$1(text2)}</button>`;
  }).join("\n");
  return `<div class="${prefix}toggle-group" role="group">
${buttonsHTML}
</div>`;
}
function renderSwitch(node, context) {
  const { classPrefix: prefix } = context;
  const checked = !!node.checked;
  const p = node.props || {};
  const trackCls = `${prefix}switch${checked ? ` ${prefix}switch-on` : ""}`;
  const disabledAttr = p.disabled ? " disabled" : "";
  const labelHTML = p.label ? `  <span class="${prefix}switch-label">${escapeHtml$1(p.label)}</span>` : "";
  const descHTML = p.description ? `
  <span class="${prefix}switch-description">${escapeHtml$1(p.description)}</span>` : "";
  const control = `  <button type="button" class="${trackCls}" role="switch" aria-checked="${checked}"${disabledAttr}>
    <span class="${prefix}switch-thumb"></span>
  </button>`;
  const layout = labelHTML || descHTML ? `<div class="${prefix}switch-row">
${control}${labelHTML}${descHTML}
</div>` : control;
  return layout;
}
function renderSlider(node, context) {
  const { classPrefix: prefix } = context;
  const p = node.props || {};
  const value = Number(node.value ?? 50);
  const min = Number(p.min ?? 0);
  const max = Number(p.max ?? 100);
  const step = Number(p.step ?? 1);
  const range = max - min || 1;
  const pct = Math.max(0, Math.min(100, (value - min) / range * 100));
  const labelHTML = p.label ? `  <label class="${prefix}slider-label">${escapeHtml$1(p.label)} <span class="${prefix}slider-value">${value}</span></label>
` : "";
  return `<div class="${prefix}slider">
${labelHTML}  <div class="${prefix}slider-track" role="slider" aria-valuenow="${value}" aria-valuemin="${min}" aria-valuemax="${max}" aria-step="${step}">
    <div class="${prefix}slider-fill" style="width:${pct}%"></div>
    <div class="${prefix}slider-thumb" style="left:${pct}%"></div>
  </div>
</div>`;
}
function renderToggleNode(node, context) {
  var _a;
  const { classPrefix: prefix } = context;
  const pressed = !!node.pressed;
  const label = (_a = node.props) == null ? void 0 : _a.label;
  const btnCls = `${prefix}toggle${pressed ? ` ${prefix}toggle-pressed` : ""}`;
  const pressedAttr = pressed ? ' aria-pressed="true"' : ' aria-pressed="false"';
  const text2 = label ?? "";
  return `<button type="button" class="${btnCls}"${pressedAttr}>${escapeHtml$1(text2)}</button>`;
}
function renderAvatar(node, context) {
  var _a, _b;
  const { classPrefix: prefix } = context;
  const size = ((_a = node.props) == null ? void 0 : _a.size) ?? "md";
  const sizeCls = `${prefix}avatar ${prefix}avatar-${size}`;
  const name = (_b = node.props) == null ? void 0 : _b.name;
  const initials = name ? name.split(/\s+/).map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() : "?";
  return `<div class="${sizeCls}" role="img" aria-label="${escapeHtml$1(name ?? "avatar")}">
  <span class="${prefix}avatar-fallback">${escapeHtml$1(initials)}</span>
</div>`;
}
function renderFrame(node, context) {
  const { classPrefix: prefix } = context;
  const childrenHTML = (node.children || []).map((c) => renderNode$2(c, context)).join("\n  ");
  return `<div class="${prefix}frame">
  ${childrenHTML}
</div>`;
}
function renderGroup(node, context) {
  const { classPrefix: prefix } = context;
  const orientation = (node.orientation || "horizontal") === "vertical" ? "vertical" : "horizontal";
  const childrenHTML = (node.children || []).map((c) => renderNode$2(c, context)).join("\n  ");
  return `<div class="${prefix}group ${prefix}group-${orientation}" role="group" data-orientation="${orientation}">
  ${childrenHTML}
</div>`;
}
function renderEmpty(node, context) {
  const { classPrefix: prefix } = context;
  const childrenHTML = (node.children || []).map((c) => renderNode$2(c, context)).join("\n  ");
  return `<div class="${prefix}empty" data-slot="empty">
  ${childrenHTML}
</div>`;
}
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
function renderCalendar(node, context) {
  var _a, _b;
  const { classPrefix: prefix } = context;
  const year = Number(((_a = node.props) == null ? void 0 : _a.year) ?? (/* @__PURE__ */ new Date()).getFullYear());
  const monthName = ((_b = node.props) == null ? void 0 : _b.month) ?? MONTH_NAMES[(/* @__PURE__ */ new Date()).getMonth()];
  const monthIdx = MONTH_NAMES.findIndex((m) => m.toLowerCase() === String(monthName).toLowerCase());
  const safeIdx = monthIdx >= 0 ? monthIdx : (/* @__PURE__ */ new Date()).getMonth();
  const first = new Date(year, safeIdx, 1);
  const last = new Date(year, safeIdx + 1, 0);
  const startWeekday = first.getDay();
  const daysInMonth = last.getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(`<div class="${prefix}calendar-day ${prefix}calendar-day-outside"></div>`);
  for (let d = 1; d <= daysInMonth; d++) cells.push(`<button type="button" class="${prefix}calendar-day">${d}</button>`);
  while (cells.length % 7 !== 0) cells.push(`<div class="${prefix}calendar-day ${prefix}calendar-day-outside"></div>`);
  const weekdays = WEEKDAY_NAMES.map((w) => `<div class="${prefix}calendar-weekday">${w}</div>`).join("");
  return `<div class="${prefix}calendar" data-slot="calendar">
  <div class="${prefix}calendar-header">
    <button type="button" class="${prefix}calendar-nav" aria-label="Previous month">&larr;</button>
    <div class="${prefix}calendar-caption">${escapeHtml$1(MONTH_NAMES[safeIdx])} ${year}</div>
    <button type="button" class="${prefix}calendar-nav" aria-label="Next month">&rarr;</button>
  </div>
  <div class="${prefix}calendar-grid">
    ${weekdays}
    ${cells.join("\n    ")}
  </div>
</div>`;
}
function renderDatePicker(node, context) {
  var _a, _b;
  const { classPrefix: prefix } = context;
  const placeholder = ((_a = node.props) == null ? void 0 : _a.placeholder) ?? "Pick a date";
  const value = (_b = node.props) == null ? void 0 : _b.value;
  return `<div class="${prefix}date-picker" data-slot="date-picker">
  <button type="button" class="${prefix}date-picker-trigger" aria-haspopup="dialog">
    <span class="${prefix}date-picker-value${value ? "" : ` ${prefix}date-picker-placeholder`}">${escapeHtml$1(value ?? placeholder)}</span>
    <span class="${prefix}date-picker-caret" aria-hidden="true">&#9662;</span>
  </button>
</div>`;
}
function repeatString(str, count) {
  let result = "";
  for (let i = 0; i < count; i++) {
    result += str;
  }
  return result;
}
function renderNode$1(node, context, indent = 0) {
  if (node == null) return "";
  const indentStr = repeatString("  ", indent);
  switch (node.type) {
    case "button":
      return renderButton$1(node, context, indent);
    case "input":
      return renderInput$1(node, context, indent);
    case "textarea":
      return renderTextarea$1(node, context, indent);
    case "select":
      return renderSelect$1(node, context, indent);
    case "checkbox":
      return renderCheckbox$1(node, context, indent);
    case "radio":
      return renderRadio$1(node, context, indent);
    case "radio-group":
      return renderRadioGroup$1(node, context, indent);
    case "icon":
      return renderIcon$1(node, context, indent);
    case "badge":
      return renderBadge$1(node, context, indent);
    case "container":
      return renderContainer$1(node, context, indent);
    case "nav":
      return renderNav$1(node, context, indent);
    case "nav-item":
      return renderNavItem$1(node, context, indent);
    case "brand":
      return renderBrand$1(node, context, indent);
    case "grid":
      return renderGrid$1(node, context, indent);
    case "row":
      return renderRow$1(node, context, indent);
    case "grid-item":
      return renderGridItem$1(node, context, indent);
    case "heading":
      return renderHeading$1(node, context, indent);
    case "paragraph":
      return renderParagraph$1(node, context, indent);
    case "text":
      return renderText$1(node);
    case "image":
      return renderImage$1(node, context, indent);
    case "link":
      return renderLink$1(node, context, indent);
    case "list":
      return renderList$1(node, context, indent);
    case "list-item":
      return renderListItem$1(node, context, indent);
    case "table":
      return renderTable$1(node, context, indent);
    case "table-header":
      return renderTableHeader$1(node, context, indent);
    case "table-row":
      return renderTableRow$1(node, context, indent);
    case "table-cell":
      return renderTableCell$1(node, context, indent);
    case "blockquote":
      return renderBlockquote$1(node, context, indent);
    case "code":
      return renderCode$1(node, context, indent);
    case "separator":
      return renderSeparator$1(node, context, indent);
    default:
      return `${indentStr}{/* Unknown node type: ${node.type} */}`;
  }
}
function renderButton$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "button", node.props);
  const disabled = node.props.state === "disabled";
  const classAttr2 = context.useClassName ? "className" : "class";
  const contentJSX = node.children ? node.children.map((child) => renderNode$1(child, context, 0)).join("") : escapeJSX(node.content);
  return `${indentStr}<button ${classAttr2}="${classes}"${disabled ? " disabled" : ""}>
${indentStr}  ${contentJSX}
${indentStr}</button>`;
}
function renderBadge$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "badge", node.props);
  const classAttr2 = context.useClassName ? "className" : "class";
  return `${indentStr}<span ${classAttr2}="${classes}">${escapeJSX(node.content)}</span>`;
}
function renderInput$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "input", node.props);
  const type = node.props.inputType || node.props.type || "text";
  const classAttr2 = context.useClassName ? "className" : "class";
  const attrs2 = [];
  if (node.props.placeholder) attrs2.push(`placeholder="${escapeJSX(node.props.placeholder)}"`);
  if (node.props.value) attrs2.push(`defaultValue="${escapeJSX(node.props.value)}"`);
  if (node.props.required) attrs2.push("required");
  if (node.props.disabled) attrs2.push("disabled");
  return `${indentStr}<input type="${type}" ${classAttr2}="${classes}" ${attrs2.join(" ")} />`;
}
function renderTextarea$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "textarea", node.props);
  const rows = node.props.rows || 4;
  const classAttr2 = context.useClassName ? "className" : "class";
  const attrs2 = [];
  if (node.props.placeholder) attrs2.push(`placeholder="${escapeJSX(node.props.placeholder)}"`);
  if (node.props.required) attrs2.push("required");
  if (node.props.disabled) attrs2.push("disabled");
  const value = node.props.value || "";
  return `${indentStr}<textarea ${classAttr2}="${classes}" rows={${rows}} ${attrs2.join(" ")}>
${indentStr}  ${escapeJSX(value)}
${indentStr}</textarea>`;
}
function renderSelect$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "select", node.props);
  const classAttr2 = context.useClassName ? "className" : "class";
  const attrs2 = [];
  if (node.props.required) attrs2.push("required");
  if (node.props.disabled) attrs2.push("disabled");
  if (node.props.multiple) attrs2.push("multiple");
  const optionsJSX = (node.options || []).map((opt) => {
    const selected = opt.selected ? " defaultSelected" : "";
    return `    <option value="${escapeJSX(opt.value)}"${selected}>${escapeJSX(opt.label)}</option>`;
  }).join("\n");
  const placeholder = node.props.placeholder;
  const placeholderOption = placeholder ? `    <option value="" disabled defaultSelected>${escapeJSX(placeholder)}</option>
` : "";
  return `${indentStr}<select ${classAttr2}="${classes}" ${attrs2.join(" ")}>
${placeholderOption}${optionsJSX}
${indentStr}</select>`;
}
function renderCheckbox$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "checkbox", node.props);
  const checked = node.checked;
  const classAttr2 = context.useClassName ? "className" : "class";
  const attrs2 = [];
  if (node.props.value) attrs2.push(`value="${escapeJSX(node.props.value)}"`);
  if (node.props.disabled) attrs2.push("disabled");
  const labelJSX = node.children ? node.children.map((child) => renderNode$1(child, context, 0)).join("") : escapeJSX(node.label);
  return `${indentStr}<label ${classAttr2}="${classes}">
${indentStr}  <input type="checkbox"${checked ? " defaultChecked" : ""} ${attrs2.join(" ")} />
${indentStr}  <span>${labelJSX}</span>
${indentStr}</label>`;
}
function renderRadio$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "radio", node.props);
  const checked = node.selected;
  const classAttr2 = context.useClassName ? "className" : "class";
  const attrs2 = [];
  if (node.props.name) attrs2.push(`name="${escapeJSX(node.props.name)}"`);
  if (node.props.value) attrs2.push(`value="${escapeJSX(node.props.value)}"`);
  if (node.props.disabled) attrs2.push("disabled");
  return `${indentStr}<label ${classAttr2}="${classes}">
${indentStr}  <input type="radio"${checked ? " defaultChecked" : ""} ${attrs2.join(" ")} />
${indentStr}  <span>${escapeJSX(node.label)}</span>
${indentStr}</label>`;
}
function renderRadioGroup$1(node, context, indent) {
  var _a;
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const isInline = (_a = node.props) == null ? void 0 : _a.inline;
  const classes = buildClasses(prefix, "radio-group", node.props);
  const inlineClass = isInline ? ` ${prefix}radio-group-inline` : "";
  const classAttr2 = context.useClassName ? "className" : "class";
  const groupName = `radio-${Math.random().toString(36).substr(2, 9)}`;
  const radios = (node.children || []).map((child) => {
    if (child.type === "radio") {
      const modifiedChild = { ...child, props: { ...child.props, name: groupName } };
      return renderNode$1(modifiedChild, context, indent + 1);
    }
    return renderNode$1(child, context, indent + 1);
  }).join("\n");
  return `${indentStr}<div ${classAttr2}="${classes}${inlineClass}">
${radios}
${indentStr}</div>`;
}
function renderIcon$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "icon", node.props);
  const iconName = node.props.name || "default";
  const classAttr2 = context.useClassName ? "className" : "class";
  const iconMap = {
    "home": "🏠",
    "user": "👤",
    "settings": "⚙️",
    "search": "🔍",
    "star": "⭐",
    "heart": "❤️",
    "mail": "✉️",
    "phone": "📞",
    "check": "✓",
    "close": "✕",
    "menu": "☰",
    "more": "⋯",
    "default": "●"
  };
  const iconContent = iconMap[iconName] || iconMap["default"];
  return `${indentStr}<span ${classAttr2}="${classes}" data-icon="${iconName}" aria-label="${iconName}">${iconContent}</span>`;
}
function renderContainer$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, `container-${node.containerType}`, node.props);
  const classAttr2 = context.useClassName ? "className" : "class";
  const childrenJSX = (node.children || []).map((child) => renderNode$1(child, context, indent + 1)).join("\n");
  return `${indentStr}<div ${classAttr2}="${classes}">
${childrenJSX}
${indentStr}</div>`;
}
function renderNav$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "nav", node.props);
  const classAttr2 = context.useClassName ? "className" : "class";
  const childrenJSX = (node.children || []).map((child) => renderNode$1(child, context, indent + 2)).join("\n");
  return `${indentStr}<nav ${classAttr2}="${classes}">
${indentStr}  <div ${classAttr2}="${prefix}nav-content">
${childrenJSX}
${indentStr}  </div>
${indentStr}</nav>`;
}
function renderNavItem$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "nav-item", node.props);
  const href = node.href || "#";
  const classAttr2 = context.useClassName ? "className" : "class";
  const contentJSX = node.children ? node.children.map((child) => renderNode$1(child, context, 0)).join("") : escapeJSX(node.content);
  return `${indentStr}<a href="${href}" ${classAttr2}="${classes}">${contentJSX}</a>`;
}
function renderBrand$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "brand", node.props);
  const classAttr2 = context.useClassName ? "className" : "class";
  const childrenJSX = (node.children || []).map((child) => renderNode$1(child, context, 0)).join("");
  return `${indentStr}<div ${classAttr2}="${classes}">${childrenJSX}</div>`;
}
function renderRow$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "row", node.props);
  const classAttr2 = context.useClassName ? "className" : "class";
  const childrenJSX = (node.children || []).map((child) => renderNode$1(child, context, indent + 1)).join("\n");
  return `${indentStr}<div ${classAttr2}="${classes}">
${childrenJSX}
${indentStr}</div>`;
}
function renderGrid$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "grid", node.props);
  const columns = node.columns || 3;
  const gridClass = `${classes} ${prefix}grid-${columns}`;
  const classAttr2 = context.useClassName ? "className" : "class";
  const childrenJSX = (node.children || []).map((child) => renderNode$1(child, context, indent + 1)).join("\n");
  return `${indentStr}<div ${classAttr2}="${gridClass}" style={{ '--grid-columns': ${columns} }${context.typescript ? " as React.CSSProperties" : ""}}>
${childrenJSX}
${indentStr}</div>`;
}
function renderGridItem$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "grid-item", node.props);
  const classAttr2 = context.useClassName ? "className" : "class";
  const childrenJSX = (node.children || []).map((child) => renderNode$1(child, context, indent + 1)).join("\n");
  return `${indentStr}<div ${classAttr2}="${classes}">
${childrenJSX}
${indentStr}</div>`;
}
function renderHeading$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const level = node.level || 1;
  const classes = buildClasses(prefix, `h${level}`, node.props);
  const classAttr2 = context.useClassName ? "className" : "class";
  const childrenJSX = node.children ? node.children.map((child) => renderNode$1(child, context, 0)).join("") : escapeJSX(node.content || "");
  const tag = `h${level}`;
  return `${indentStr}<${tag} ${classAttr2}="${classes}">${childrenJSX}</${tag}>`;
}
function renderParagraph$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "paragraph", node.props);
  const classAttr2 = context.useClassName ? "className" : "class";
  const childrenJSX = node.children ? node.children.map((child) => renderNode$1(child, context, 0)).join("") : node.content ? escapeJSX(node.content) : "";
  return `${indentStr}<p ${classAttr2}="${classes}">${childrenJSX}</p>`;
}
function renderText$1(node, _context, _indent) {
  return escapeJSX(node.content || "");
}
function renderImage$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "image", node.props);
  const src = node.src || "";
  const alt = node.alt || "";
  const classAttr2 = context.useClassName ? "className" : "class";
  const attrs2 = [];
  if (node.props.width) attrs2.push(`width="${node.props.width}"`);
  if (node.props.height) attrs2.push(`height="${node.props.height}"`);
  return `${indentStr}<img src="${escapeJSX(src)}" alt="${escapeJSX(alt)}" ${classAttr2}="${classes}" ${attrs2.join(" ")} />`;
}
function renderLink$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "link", node.props);
  const href = node.href || "#";
  const classAttr2 = context.useClassName ? "className" : "class";
  const attrs2 = [];
  if (node.title) attrs2.push(`title="${escapeJSX(node.title)}"`);
  const childrenJSX = node.children ? node.children.map((child) => renderNode$1(child, context, 0)).join("") : escapeJSX(node.content || "");
  return `${indentStr}<a href="${escapeJSX(href)}" ${classAttr2}="${classes}" ${attrs2.join(" ")}>${childrenJSX}</a>`;
}
function renderList$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "list", node.props);
  const tag = node.ordered ? "ol" : "ul";
  const classAttr2 = context.useClassName ? "className" : "class";
  const childrenJSX = (node.children || []).map((child) => renderNode$1(child, context, indent + 1)).join("\n");
  return `${indentStr}<${tag} ${classAttr2}="${classes}">
${childrenJSX}
${indentStr}</${tag}>`;
}
function renderListItem$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "list-item", node.props);
  const classAttr2 = context.useClassName ? "className" : "class";
  const childrenJSX = node.children ? node.children.map((child) => renderNode$1(child, context, 0)).join("") : escapeJSX(node.content || "");
  return `${indentStr}<li ${classAttr2}="${classes}">${childrenJSX}</li>`;
}
function renderTable$1(node, context, indent) {
  var _a, _b;
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "table", node.props);
  const classAttr2 = context.useClassName ? "className" : "class";
  const headerNode = (_a = node.children) == null ? void 0 : _a.find((child) => child.type === "table-header");
  const rowNodes = ((_b = node.children) == null ? void 0 : _b.filter((child) => child.type === "table-row")) || [];
  const headerJSX = headerNode ? renderNode$1(headerNode, context, indent + 1) : "";
  const rowsJSX = rowNodes.map((child) => renderNode$1(child, context, indent + 2)).join("\n");
  const bodyJSX = rowsJSX ? `
${indentStr}  <tbody>
${rowsJSX}
${indentStr}  </tbody>` : "";
  return `${indentStr}<table ${classAttr2}="${classes}">
${headerJSX}${bodyJSX}
${indentStr}</table>`;
}
function renderTableHeader$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const cellsJSX = (node.children || []).map((child) => renderNode$1(child, context, indent + 2)).join("\n");
  return `${indentStr}  <thead>
${indentStr}    <tr>
${cellsJSX}
${indentStr}    </tr>
${indentStr}  </thead>`;
}
function renderTableRow$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const cellsJSX = (node.children || []).map((child) => renderNode$1(child, context, indent + 1)).join("\n");
  return `${indentStr}    <tr>
${cellsJSX}
${indentStr}    </tr>`;
}
function renderTableCell$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const tag = node.header ? "th" : "td";
  const align = node.align || "left";
  const classes = buildClasses(prefix, `table-cell ${prefix}align-${align}`, {});
  const classAttr2 = context.useClassName ? "className" : "class";
  const contentJSX = node.children && node.children.length > 0 ? node.children.map((child) => renderNode$1(child, context, 0)).join("") : escapeJSX(node.content || "");
  return `${indentStr}      <${tag} ${classAttr2}="${classes}">${contentJSX}</${tag}>`;
}
function renderBlockquote$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "blockquote", node.props);
  const classAttr2 = context.useClassName ? "className" : "class";
  const childrenJSX = (node.children || []).map((child) => renderNode$1(child, context, indent + 1)).join("\n");
  return `${indentStr}<blockquote ${classAttr2}="${classes}">
${childrenJSX}
${indentStr}</blockquote>`;
}
function renderCode$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const inline = node.inline !== false;
  const classAttr2 = context.useClassName ? "className" : "class";
  if (inline) {
    const classes = buildClasses(prefix, "code-inline", {});
    return `${indentStr}<code ${classAttr2}="${classes}">${escapeJSX(node.value)}</code>`;
  } else {
    const classes = buildClasses(prefix, "code-block", {});
    const dataLang = node.lang ? ` data-lang="${escapeJSX(node.lang)}"` : "";
    return `${indentStr}<pre ${classAttr2}="${classes}"><code${dataLang}>${escapeJSX(node.value)}</code></pre>`;
  }
}
function renderSeparator$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "separator", node.props);
  const classAttr2 = context.useClassName ? "className" : "class";
  return `${indentStr}<hr ${classAttr2}="${classes}" />`;
}
function buildClasses(prefix, baseClass, props) {
  const classes = [`${prefix}${baseClass}`];
  if (props.classes && Array.isArray(props.classes)) {
    props.classes.forEach((cls) => {
      classes.push(`${prefix}${cls}`);
    });
  }
  if (props.variant) {
    classes.push(`${prefix}${baseClass}-${props.variant}`);
  }
  if (props.state) {
    classes.push(`${prefix}state-${props.state}`);
  }
  return classes.join(" ");
}
function escapeJSX(text2) {
  if (!text2) return "";
  return text2.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/{/g, "&#123;").replace(/}/g, "&#125;");
}
function renderNode(node, context) {
  if (node == null) return "";
  switch (node.type) {
    case "button":
      return renderButton(node);
    case "input":
      return renderInput(node);
    case "textarea":
      return renderTextarea(node);
    case "select":
      return renderSelect(node);
    case "checkbox":
      return renderCheckbox(node);
    case "radio":
      return renderRadio(node);
    case "radio-group":
      return renderRadioGroup(node);
    case "icon":
      return renderIcon(node);
    case "badge":
      return renderBadge(node);
    case "container":
      return renderContainer(node);
    case "nav":
      return renderNav(node);
    case "nav-item":
      return renderNavItem(node);
    case "brand":
      return renderBrand(node);
    case "grid":
      return renderGrid(node);
    case "row":
      return renderRow(node);
    case "grid-item":
      return renderGridItem(node);
    case "heading":
      return renderHeading(node);
    case "paragraph":
      return renderParagraph(node);
    case "text":
      return renderText(node);
    case "image":
      return renderImage(node);
    case "link":
      return renderLink(node);
    case "list":
      return renderList(node);
    case "list-item":
      return renderListItem(node);
    case "table":
      return renderTable(node);
    case "table-header":
      return renderTableHeader(node);
    case "table-row":
      return renderTableRow(node);
    case "table-cell":
      return renderTableCell(node);
    case "blockquote":
      return renderBlockquote(node);
    case "code":
      return renderCode(node);
    case "separator":
      return renderSeparator();
    default:
      return `<!-- Unknown node type: ${node.type} -->`;
  }
}
function renderBadge(node) {
  const variant = node.props.variant;
  const nodeClasses = node.props.classes || [];
  let classes = "inline-block px-2.5 py-0.5 rounded-full text-xs font-medium";
  if (variant === "primary" || nodeClasses.includes("primary")) {
    classes += " bg-blue-100 text-blue-800";
  } else if (variant === "success" || nodeClasses.includes("success")) {
    classes += " bg-green-100 text-green-800";
  } else if (variant === "warning" || nodeClasses.includes("warning")) {
    classes += " bg-yellow-100 text-yellow-800";
  } else if (variant === "error" || nodeClasses.includes("error")) {
    classes += " bg-red-100 text-red-800";
  } else {
    classes += " bg-gray-100 text-gray-800";
  }
  return `<span class="${classes}">${escapeHtml(node.content)}</span>`;
}
function renderButton(node, context) {
  let classes = "px-4 py-2 rounded-md font-medium transition-colors";
  const variant = node.props.variant;
  const nodeClasses = node.props.classes || [];
  const isPrimary = variant === "primary" || nodeClasses.includes("primary");
  const isSecondary = variant === "secondary" || nodeClasses.includes("secondary");
  const isDanger = variant === "danger" || nodeClasses.includes("danger");
  if (isPrimary) {
    classes += " bg-indigo-600 text-white hover:bg-indigo-700";
  } else if (isSecondary) {
    classes += " bg-gray-200 text-gray-900 hover:bg-gray-300";
  } else if (isDanger) {
    classes += " bg-red-600 text-white hover:bg-red-700";
  } else {
    classes += " bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300";
  }
  if (node.props.state === "disabled") {
    classes += " opacity-50 cursor-not-allowed";
  } else if (node.props.state === "loading") {
    classes += " opacity-75 cursor-wait";
  }
  const disabled = node.props.state === "disabled" ? " disabled" : "";
  const contentHTML = node.children ? node.children.map((child) => renderNode(child)).join("") : escapeHtml(node.content);
  return `<button class="${classes}"${disabled}>${contentHTML}</button>`;
}
function renderInput(node, _context) {
  const classes = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
  const type = node.props.inputType || node.props.type || "text";
  const required = node.props.required ? " required" : "";
  const disabled = node.props.disabled ? " disabled" : "";
  const placeholder = node.props.placeholder ? ` placeholder="${escapeHtml(node.props.placeholder)}"` : "";
  const value = node.props.value ? ` value="${escapeHtml(node.props.value)}"` : "";
  return `<input type="${type}" class="${classes}"${placeholder}${value}${required}${disabled} />`;
}
function renderTextarea(node, _context) {
  const classes = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-vertical";
  const rows = node.props.rows || 4;
  const required = node.props.required ? " required" : "";
  const disabled = node.props.disabled ? " disabled" : "";
  const placeholder = node.props.placeholder ? ` placeholder="${escapeHtml(node.props.placeholder)}"` : "";
  const value = node.props.value || "";
  return `<textarea class="${classes}" rows="${rows}"${placeholder}${required}${disabled}>${escapeHtml(value)}</textarea>`;
}
function renderSelect(node, _context) {
  const classes = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
  const required = node.props.required ? " required" : "";
  const disabled = node.props.disabled ? " disabled" : "";
  const multiple = node.props.multiple ? " multiple" : "";
  const optionsHTML = (node.options || []).map((opt) => {
    const selected = opt.selected ? " selected" : "";
    return `<option value="${escapeHtml(opt.value)}"${selected}>${escapeHtml(opt.label)}</option>`;
  }).join("\n    ");
  const placeholder = node.props.placeholder;
  const placeholderOption = placeholder ? `<option value="" disabled selected>${escapeHtml(placeholder)}</option>
    ` : "";
  return `<select class="${classes}"${required}${disabled}${multiple}>
    ${placeholderOption}${optionsHTML}
  </select>`;
}
function renderCheckbox(node, context) {
  const classes = "flex items-center gap-2 cursor-pointer";
  const checked = node.checked ? " checked" : "";
  const disabled = node.props.disabled ? " disabled" : "";
  const value = node.props.value ? ` value="${escapeHtml(node.props.value)}"` : "";
  const labelHTML = node.children ? node.children.map((child) => renderNode(child)).join("") : escapeHtml(node.label);
  return `<label class="${classes}">
    <input type="checkbox" class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"${checked}${disabled}${value} />
    <span class="text-gray-900">${labelHTML}</span>
  </label>`;
}
function renderRadio(node, _context) {
  const classes = "flex items-center gap-2 cursor-pointer";
  const checked = node.selected ? " checked" : "";
  const disabled = node.props.disabled ? " disabled" : "";
  const name = node.props.name ? ` name="${escapeHtml(node.props.name)}"` : "";
  const value = node.props.value ? ` value="${escapeHtml(node.props.value)}"` : "";
  return `<label class="${classes}">
    <input type="radio" class="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"${checked}${disabled}${name}${value} />
    <span class="text-gray-900">${escapeHtml(node.label)}</span>
  </label>`;
}
function renderRadioGroup(node, context) {
  var _a;
  const isInline = (_a = node.props) == null ? void 0 : _a.inline;
  const classes = isInline ? "flex flex-wrap gap-4" : "flex flex-col gap-2";
  const groupName = `radio-${Math.random().toString(36).substr(2, 9)}`;
  const radios = (node.children || []).map((child) => {
    if (child.type === "radio") {
      const modifiedChild = { ...child, props: { ...child.props, name: groupName } };
      return renderNode(modifiedChild);
    }
    return renderNode(child);
  }).join("\n    ");
  return `<div class="${classes}">
    ${radios}
</div>`;
}
function renderIcon(node, _context) {
  const classes = "inline-block align-middle";
  const iconName = node.props.name || "default";
  const iconMap = {
    "home": "🏠",
    "user": "👤",
    "settings": "⚙️",
    "search": "🔍",
    "star": "⭐",
    "heart": "❤️",
    "mail": "✉️",
    "phone": "📞",
    "check": "✓",
    "close": "✕",
    "menu": "☰",
    "more": "⋯",
    "default": "●"
  };
  const iconContent = iconMap[iconName] || iconMap["default"];
  return `<span class="${classes}" data-icon="${iconName}" aria-label="${iconName}">${iconContent}</span>`;
}
function renderContainer(node, context) {
  let classes = "";
  switch (node.containerType) {
    case "hero":
      classes = "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg p-12 text-center my-8 shadow-lg";
      break;
    case "card":
      classes = "bg-white rounded-lg p-6 shadow-md border border-gray-200 my-4";
      break;
    case "modal":
      classes = "bg-white rounded-lg p-8 shadow-2xl max-w-md mx-auto my-8";
      break;
    case "footer":
      classes = "bg-gray-900 text-gray-300 p-8 rounded-lg mt-12";
      break;
    case "alert":
      classes = "border-l-4 p-4 my-4 rounded";
      if (node.props.state === "error") {
        classes += " bg-red-50 border-red-500 text-red-900";
      } else if (node.props.state === "success") {
        classes += " bg-green-50 border-green-500 text-green-900";
      } else if (node.props.state === "warning") {
        classes += " bg-yellow-50 border-yellow-500 text-yellow-900";
      } else {
        classes += " bg-blue-50 border-blue-500 text-blue-900";
      }
      break;
    case "section":
      classes = "py-6 border-b border-gray-200 last:border-b-0";
      break;
    case "form-group":
      classes = "mb-4";
      break;
    case "button-group":
      classes = "flex flex-wrap gap-2 my-4";
      break;
    default:
      classes = "p-4 my-4";
  }
  const childrenHTML = (node.children || []).map((child) => renderNode(child)).join("\n  ");
  return `<div class="${classes}">
  ${childrenHTML}
</div>`;
}
function renderNav(node, context) {
  const classes = "bg-white shadow-sm rounded-lg p-4 mb-8";
  const childrenHTML = (node.children || []).map((child) => renderNode(child)).join("\n    ");
  return `<nav class="${classes}">
  <div class="flex items-center gap-6 flex-wrap">
    ${childrenHTML}
  </div>
</nav>`;
}
function renderNavItem(node, context) {
  const classes = "text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors font-medium";
  const href = node.href || "#";
  const contentHTML = node.children ? node.children.map((child) => renderNode(child)).join("") : escapeHtml(node.content);
  return `<a href="${href}" class="${classes}">${contentHTML}</a>`;
}
function renderBrand(node, context) {
  const classes = "font-bold text-xl text-gray-900 mr-auto flex items-center gap-2";
  const childrenHTML = (node.children || []).map((child) => renderNode(child)).join("");
  return `<div class="${classes}">${childrenHTML}</div>`;
}
function renderRow(node, context) {
  var _a, _b, _c, _d;
  const classes = ((_b = (_a = node.props) == null ? void 0 : _a.classes) == null ? void 0 : _b.includes("right")) ? "flex items-center gap-3 flex-wrap justify-end" : ((_d = (_c = node.props) == null ? void 0 : _c.classes) == null ? void 0 : _d.includes("center")) ? "flex items-center gap-3 flex-wrap justify-center" : "flex items-center gap-3 flex-wrap";
  const childrenHTML = (node.children || []).map((child) => renderNode(child)).join("\n  ");
  return `<div class="${classes}">
  ${childrenHTML}
</div>`;
}
function renderGrid(node, context) {
  const columns = node.columns || 3;
  let gridClasses = "grid gap-6 my-8";
  if (columns === 2) {
    gridClasses += " grid-cols-1 md:grid-cols-2";
  } else if (columns === 3) {
    gridClasses += " grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  } else if (columns === 4) {
    gridClasses += " grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
  } else {
    gridClasses += ` grid-cols-1 md:grid-cols-${Math.min(columns, 4)}`;
  }
  const childrenHTML = (node.children || []).map((child) => renderNode(child)).join("\n  ");
  return `<div class="${gridClasses}">
  ${childrenHTML}
</div>`;
}
function renderGridItem(node, context) {
  const classes = "bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow";
  const childrenHTML = (node.children || []).map((child) => renderNode(child)).join("\n    ");
  return `<div class="${classes}">
    ${childrenHTML}
  </div>`;
}
function renderHeading(node, context) {
  const level = node.level || 1;
  let classes = "font-bold text-gray-900 my-4";
  switch (level) {
    case 1:
      classes = "text-4xl font-extrabold text-gray-900 mb-4 mt-8";
      break;
    case 2:
      classes = "text-3xl font-bold text-gray-900 mb-3 mt-6";
      break;
    case 3:
      classes = "text-2xl font-semibold text-gray-900 mb-2 mt-4";
      break;
    case 4:
      classes = "text-xl font-semibold text-gray-800 mb-2 mt-4";
      break;
    case 5:
      classes = "text-lg font-medium text-gray-800 mb-2 mt-3";
      break;
    case 6:
      classes = "text-base font-medium text-gray-700 mb-2 mt-2";
      break;
  }
  const childrenHTML = node.children ? node.children.map((child) => renderNode(child)).join("") : escapeHtml(node.content || "");
  return `<h${level} class="${classes}">${childrenHTML}</h${level}>`;
}
function renderParagraph(node, context) {
  const classes = "text-gray-700 my-3";
  const childrenHTML = node.children ? node.children.map((child) => renderNode(child)).join("") : node.content ? escapeHtml(node.content) : "";
  return `<p class="${classes}">${childrenHTML}</p>`;
}
function renderText(node) {
  return escapeHtml(node.content || "");
}
function renderImage(node, _context) {
  const classes = "max-w-full h-auto rounded-lg shadow-md";
  const src = node.src || "";
  const alt = node.alt || "";
  const attrs2 = [];
  if (node.props.width) attrs2.push(`width="${node.props.width}"`);
  if (node.props.height) attrs2.push(`height="${node.props.height}"`);
  return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="${classes}" ${attrs2.join(" ")} />`;
}
function renderLink(node, context) {
  const classes = "text-indigo-600 hover:text-indigo-800 underline";
  const href = node.href || "#";
  const title = node.title ? ` title="${escapeHtml(node.title)}"` : "";
  const childrenHTML = node.children ? node.children.map((child) => renderNode(child)).join("") : escapeHtml(node.content || "");
  return `<a href="${escapeHtml(href)}" class="${classes}"${title}>${childrenHTML}</a>`;
}
function renderList(node, context) {
  const classes = "my-4 pl-6 space-y-2";
  const tag = node.ordered ? "ol" : "ul";
  const listStyle = node.ordered ? " list-decimal" : " list-disc";
  const childrenHTML = (node.children || []).map((child) => renderNode(child)).join("\n  ");
  return `<${tag} class="${classes}${listStyle}">
  ${childrenHTML}
</${tag}>`;
}
function renderListItem(node, context) {
  const classes = "text-gray-700";
  const childrenHTML = node.children ? node.children.map((child) => renderNode(child)).join("") : escapeHtml(node.content || "");
  return `<li class="${classes}">${childrenHTML}</li>`;
}
function renderTable(node, context) {
  var _a, _b;
  const classes = "min-w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden my-6";
  const headerNode = (_a = node.children) == null ? void 0 : _a.find((child) => child.type === "table-header");
  const rowNodes = ((_b = node.children) == null ? void 0 : _b.filter((child) => child.type === "table-row")) || [];
  const headerHTML = headerNode ? renderNode(headerNode) : "";
  const rowsHTML = rowNodes.map((child) => renderNode(child)).join("\n    ");
  const bodyHTML = rowsHTML ? `
  <tbody class="divide-y divide-gray-200">
    ${rowsHTML}
  </tbody>` : "";
  return `<table class="${classes}">
  ${headerHTML}${bodyHTML}
</table>`;
}
function renderTableHeader(node, context) {
  const cellsHTML = (node.children || []).map((child) => renderNode(child)).join("\n    ");
  return `<thead class="bg-gray-50">
    <tr>
      ${cellsHTML}
    </tr>
  </thead>`;
}
function renderTableRow(node, context) {
  const cellsHTML = (node.children || []).map((child) => renderNode(child)).join("\n    ");
  return `<tr class="hover:bg-gray-50">
    ${cellsHTML}
  </tr>`;
}
function renderTableCell(node, context) {
  const tag = node.header ? "th" : "td";
  const align = node.align || "left";
  let classes = "px-6 py-3 text-gray-900";
  if (node.header) {
    classes = "px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider";
  } else {
    if (align === "center") classes += " text-center";
    if (align === "right") classes += " text-right";
  }
  const contentHTML = node.children && node.children.length > 0 ? node.children.map((child) => renderNode(child)).join("") : escapeHtml(node.content || "");
  return `<${tag} class="${classes}">${contentHTML}</${tag}>`;
}
function renderBlockquote(node, context) {
  const classes = "border-l-4 border-indigo-500 pl-4 my-4 text-gray-700 italic";
  const childrenHTML = (node.children || []).map((child) => renderNode(child)).join("\n  ");
  return `<blockquote class="${classes}">
  ${childrenHTML}
</blockquote>`;
}
function renderCode(node) {
  const inline = node.inline !== false;
  if (inline) {
    const classes = "bg-gray-100 text-indigo-600 rounded px-2 py-1 font-mono text-sm";
    return `<code class="${classes}">${escapeHtml(node.value)}</code>`;
  } else {
    const classes = "bg-gray-900 text-gray-100 rounded-lg p-4 my-4 overflow-x-auto";
    const dataLang = node.lang ? ` data-lang="${escapeHtml(node.lang)}"` : "";
    return `<pre class="${classes}"><code class="font-mono text-sm"${dataLang}>${escapeHtml(node.value)}</code></pre>`;
  }
}
function renderSeparator() {
  const classes = "border-t border-gray-300 my-8";
  return `<hr class="${classes}" />`;
}
function escapeHtml(text2) {
  if (!text2) return "";
  return text2.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function renderToHTML(ast, options = {}) {
  const {
    style = "coss",
    inlineStyles = true,
    pretty = true,
    classPrefix = "wmd-",
    codegen = "html"
  } = options;
  const context = {
    style,
    classPrefix,
    inlineStyles,
    pretty,
    codegen
  };
  const childrenHTML = ast.children.map((child) => renderNode$2(child, context)).join("\n");
  const css = inlineStyles ? styles.getStyleCSS(style, classPrefix) : "";
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>wiremd Mockup</title>
  ${css ? `<style>
${css}
  </style>` : ""}
</head>
<body class="${classPrefix}root ${classPrefix}${style}">
  ${childrenHTML}
</body>
</html>`;
  return pretty ? html : html.replace(/\n\s*/g, "");
}
function renderToJSON(ast, options = {}) {
  const { pretty = true } = options;
  return JSON.stringify(ast, null, pretty ? 2 : 0);
}
function renderToReact(ast, options = {}) {
  const {
    classPrefix = "wmd-",
    typescript = true,
    componentName = "WiremdComponent"
  } = options;
  const context = {
    classPrefix,
    typescript,
    useClassName: true
  };
  const childrenJSX = ast.children.map((child) => renderNode$1(child, context, 1)).join("\n");
  const typeAnnotation = typescript ? ": React.FC" : "";
  const importStatement = typescript ? "import React from 'react';\n\n" : "import React from 'react';\n\n";
  const component = `${importStatement}export const ${componentName}${typeAnnotation} = () => {
  return (
    <div className="${classPrefix}root">
${childrenJSX}
    </div>
  );
};`;
  return component;
}
function renderToTailwind(ast, options = {}) {
  const { pretty = true } = options;
  const childrenHTML = ast.children.map((child) => renderNode(child)).join("\n  ");
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>wiremd Mockup - Tailwind</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
</head>
<body class="bg-gray-50 p-6">
  ${childrenHTML}
</body>
</html>`;
  return pretty ? html : html.replace(/\n\s*/g, "");
}
function render(ast, options = {}) {
  const { format = "html" } = options;
  if (format === "json") {
    return renderToJSON(ast, options);
  }
  if (format === "react") {
    return renderToReact(ast, options);
  }
  if (format === "tailwind") {
    return renderToTailwind(ast, options);
  }
  return renderToHTML(ast, options);
}
exports.generateCode = generateCode;
exports.render = render;
exports.renderToHTML = renderToHTML;
exports.renderToJSON = renderToJSON;
exports.renderToReact = renderToReact;
exports.renderToTailwind = renderToTailwind;

import { W as WIREMD_STYLES } from "./types-HXY8TWaA.js";
import { S as SYNTAX_VERSION, p as parse, v as validate, s as spansFromPosition } from "./index-D4Jwduto.js";
import { g as getStyleCSS } from "./styles-CpDsztg2.js";
function renderPreview(documentNode, options) {
  const style = options.style ?? "coss";
  const classPrefix = options.classPrefix;
  if (!CLASS_PREFIX_PATTERN.test(classPrefix)) {
    throw new TypeError(
      `classPrefix must be a non-empty ASCII identifier (${CLASS_PREFIX_PATTERN.source}); received ${JSON.stringify(classPrefix)}. Recommended shape: "ok-wiremd-" (trailing separator keeps generated class names token-separated).`
    );
  }
  const diagnostics = [];
  const context = {
    classPrefix,
    diagnostics,
    radioGroupCounter: 0
  };
  const childrenHTML = documentNode.children.map((child) => renderPreviewNode(child, context)).join("\n");
  const html = `<div class="${classPrefix}root ${classPrefix}${style}" style="color-scheme: light">
${childrenHTML}
</div>`;
  let css = getStyleCSS(style, classPrefix);
  if (/<\/?(script|iframe)/i.test(css)) {
    diagnostics.push({
      severity: "error",
      code: "wmd-preview-render-failed",
      message: "Style CSS unexpectedly contained scriptable elements.",
      source: "renderer"
    });
  }
  if (/^[ \t]*@import/m.test(css)) {
    diagnostics.push({
      severity: "info",
      code: "wmd-font-substituted",
      message: "External font imports are disabled in previews; local fallback fonts are used.",
      source: "renderer"
    });
  }
  css = preparePreviewCss(css, classPrefix);
  return { html, css, classPrefix, diagnostics };
}
function preparePreviewCss(css, classPrefix) {
  let out = css.replace(/^[ \t]*@import[^\n]*\n?/gm, "");
  out = out.replace(/\s*!important/gi, "");
  out = out.replace(/^([ \t]*)\*[ \t]*\{/gm, `$1.${classPrefix}root * {`);
  out = out.replace(/^([ \t]*)body[ \t]*\{/gm, `$1.${classPrefix}root {`);
  out = out.replace(new RegExp(`body\\.${classPrefix}`, "g"), `div.${classPrefix}`);
  return out;
}
function escapeHtml(text) {
  if (!text) return "";
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
const CLASS_PREFIX_PATTERN = /^[A-Za-z_][A-Za-z0-9_-]*$/;
const CLASS_TOKEN_PATTERN = /^[A-Za-z0-9_-]+$/;
function buildClasses(context, baseClass, props) {
  const { classPrefix: prefix } = context;
  const classes = [`${prefix}${baseClass}`];
  const drop = (kind, raw) => {
    context.diagnostics.push({
      severity: "warning",
      code: "wmd-class-sanitized",
      message: `Author ${kind} "${raw}" is not a safe CSS class token and was omitted from the preview.`,
      source: "renderer"
    });
  };
  if (Array.isArray(props == null ? void 0 : props.classes)) {
    for (const cls of props.classes) {
      if (typeof cls === "string" && CLASS_TOKEN_PATTERN.test(cls)) {
        classes.push(`${prefix}${cls}`);
      } else {
        drop("class", String(cls));
      }
    }
  }
  if (typeof (props == null ? void 0 : props.variant) === "string") {
    if (CLASS_TOKEN_PATTERN.test(props.variant)) {
      classes.push(`${prefix}${baseClass}-${props.variant}`);
    } else {
      drop("variant", props.variant);
    }
  }
  if (typeof (props == null ? void 0 : props.state) === "string") {
    if (CLASS_TOKEN_PATTERN.test(props.state)) {
      classes.push(`${prefix}state-${props.state}`);
    } else {
      drop("state", props.state);
    }
  }
  return escapeHtml(classes.join(" "));
}
const SAFE_SCHEMES = /* @__PURE__ */ new Set(["https:", "mailto:"]);
function safeUrl(rawUrl, context, kind) {
  const raw = (rawUrl ?? "").trim();
  if (raw === "") return { url: "#" };
  if (raw.startsWith("#")) return { url: raw };
  if (raw.startsWith("/") && !raw.startsWith("//")) return { url: raw };
  if (raw.startsWith("//")) {
    context.diagnostics.push({
      severity: "warning",
      code: "wmd-url-blocked",
      message: 'Blocked protocol-relative "//" URL in preview content.',
      source: "renderer"
    });
    return { url: "#", blocked: true };
  }
  const schemeMatch = raw.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (!schemeMatch) {
    if (kind === "image") {
      context.diagnostics.push({
        severity: "warning",
        code: "wmd-image-relative",
        message: "Relative image source cannot be resolved inside an embedded preview; a placeholder is shown.",
        source: "renderer"
      });
      return { url: "", relativeImage: true };
    }
    return { url: raw };
  }
  const scheme = schemeMatch[1].toLowerCase();
  if (SAFE_SCHEMES.has(`${scheme}:`)) {
    return { url: raw };
  }
  context.diagnostics.push({
    severity: "warning",
    code: "wmd-url-blocked",
    message: `Blocked "${scheme}:" URL in preview content.`,
    source: "renderer"
  });
  return { url: "#", blocked: true };
}
function renderPreviewNode(node, context) {
  if (node == null) return "";
  switch (node.type) {
    case "button":
      return renderButton(node, context);
    case "input":
      return renderInput(node, context);
    case "textarea":
      return renderTextarea(node, context);
    case "select":
      return renderSelect(node, context);
    case "checkbox":
      return renderCheckbox(node, context);
    case "radio":
      return renderRadio(node, context);
    case "radio-group":
      return renderRadioGroup(node, context);
    case "icon":
      return renderIcon(node, context);
    case "badge":
      return renderBadge(node, context);
    case "container":
      return renderContainer(node, context);
    case "nav":
      return renderNav(node, context);
    case "nav-item":
      return renderNavItem(node, context);
    case "brand":
      return renderBrand(node, context);
    case "grid":
      return renderGrid(node, context);
    case "grid-item":
      return renderGridItem(node, context);
    case "row":
      return renderRow(node, context);
    case "heading":
      return renderHeading(node, context);
    case "paragraph":
      return renderParagraph(node, context);
    case "text":
      return renderText(node, context);
    case "image":
      return renderImage(node, context);
    case "link":
      return renderLink(node, context);
    case "list":
      return renderList(node, context);
    case "list-item":
      return renderListItem(node, context);
    case "table":
      return renderTable(node, context);
    case "table-header":
      return renderTableHeader(node, context);
    case "table-row":
      return renderTableRow(node, context);
    case "table-cell":
      return renderTableCell(node, context);
    case "blockquote":
      return renderBlockquote(node, context);
    case "code":
      return renderCode(node, context);
    case "separator":
      return renderSeparator(node, context);
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
      return renderToggle(node, context);
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
function renderChildren(node, context) {
  return (node.children ?? []).map((child) => renderPreviewNode(child, context)).join("\n");
}
function renderButton(node, context) {
  var _a, _b;
  const { classPrefix: prefix } = context;
  const classes = buildClasses(context, "button", node.props);
  const disabled = node.props.state === "disabled" ? " disabled" : "";
  const loading = node.props.state === "loading" ? ` ${prefix}loading` : "";
  const contentHTML = node.children ? node.children.map((child) => renderPreviewNode(child, context)).join("") : escapeHtml(node.content);
  const hrefResult = safeUrl(node.href || ((_a = node.props) == null ? void 0 : _a.href), context, "link");
  if (node.href || ((_b = node.props) == null ? void 0 : _b.href)) {
    return `<a href="${escapeHtml(hrefResult.url)}" class="${classes}${loading}">${contentHTML}</a>`;
  }
  return `<button type="button" class="${classes}${loading}"${disabled}>${contentHTML}</button>`;
}
function renderBadge(node, context) {
  const classes = buildClasses(context, "badge", node.props);
  return `<span class="${classes}">${escapeHtml(node.content)}</span>`;
}
function renderInput(node, context) {
  const classes = buildClasses(context, "input", node.props);
  const type = node.props.inputType || node.props.type || "text";
  const required = node.props.required ? " required" : "";
  const disabled = node.props.disabled ? " disabled" : "";
  const placeholder = node.props.placeholder ? ` placeholder="${escapeHtml(node.props.placeholder)}"` : "";
  const value = node.props.value ? ` value="${escapeHtml(node.props.value)}"` : "";
  const style = node.props.width ? ` style="width: ${Number(node.props.width) || 20}ch; max-width: ${Number(node.props.width) || 20}ch;"` : "";
  return `<input type="${escapeHtml(String(type))}" class="${classes}"${placeholder}${value}${required}${disabled}${style} readonly />`;
}
function renderTextarea(node, context) {
  const classes = buildClasses(context, "textarea", node.props);
  const rows = node.props.rows || 4;
  const required = node.props.required ? " required" : "";
  const disabled = node.props.disabled ? " disabled" : "";
  const placeholder = node.props.placeholder ? ` placeholder="${escapeHtml(node.props.placeholder)}"` : "";
  const value = node.props.value || "";
  return `<textarea class="${classes}" rows="${Number(rows) || 4}"${placeholder}${required}${disabled} readonly>${escapeHtml(value)}</textarea>`;
}
function renderSelect(node, context) {
  const classes = buildClasses(context, "select", node.props);
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
  const classes = buildClasses(context, "checkbox", node.props);
  const checked = node.checked ? " checked" : "";
  const disabled = node.props.disabled ? " disabled" : "";
  const value = node.props.value ? ` value="${escapeHtml(node.props.value)}"` : "";
  let labelHTML = escapeHtml(node.label || "");
  let nestedHTML = "";
  if (node.children) {
    const inlineChildren = [];
    const nestedChildren = [];
    for (const child of node.children) {
      if (child.type === "list") nestedChildren.push(child);
      else inlineChildren.push(child);
    }
    if (inlineChildren.length > 0) {
      labelHTML = inlineChildren.map((child) => renderPreviewNode(child, context)).join("");
    }
    if (nestedChildren.length > 0) {
      nestedHTML = nestedChildren.map((child) => renderPreviewNode(child, context)).join("");
    }
  }
  return `<label class="${classes}">
    <input type="checkbox"${checked}${disabled}${value} disabled />
    <span>${labelHTML}</span>
  </label>${nestedHTML}`;
}
function renderRadio(node, context) {
  const classes = buildClasses(context, "radio", node.props);
  const checked = node.selected ? " checked" : "";
  const disabled = node.props.disabled ? " disabled" : "";
  const name = node.props.name ? ` name="${escapeHtml(node.props.name)}"` : "";
  const value = node.props.value ? ` value="${escapeHtml(node.props.value)}"` : "";
  const labelHTML = escapeHtml(node.label);
  const childrenHTML = node.children ? node.children.map((child) => renderPreviewNode(child, context)).join("") : "";
  return `<label class="${classes}">
    <input type="radio"${checked}${disabled}${name}${value} disabled />
    <span>${labelHTML}</span>
  </label>${childrenHTML}`;
}
function renderRadioGroup(node, context) {
  var _a;
  const { classPrefix: prefix } = context;
  const isInline = (_a = node.props) == null ? void 0 : _a.inline;
  const classes = buildClasses(context, "radio-group", node.props);
  const inlineClass = isInline ? ` ${prefix}radio-group-inline` : "";
  context.radioGroupCounter += 1;
  const groupName = `radio-preview-${context.radioGroupCounter}`;
  const radios = (node.children || []).map((child) => {
    if (child.type === "radio") {
      const modifiedChild = { ...child, props: { ...child.props, name: groupName } };
      return renderPreviewNode(modifiedChild, context);
    }
    return renderPreviewNode(child, context);
  }).join("\n    ");
  return `<div class="${classes}${inlineClass}">
    ${radios}
</div>`;
}
function renderIcon(node, context) {
  const classes = buildClasses(context, "icon", node.props);
  const iconName = node.props.name || "default";
  const iconMap = {
    "twitter": "𝕏",
    "github": "⊙",
    "linkedin": "in",
    "facebook": "f",
    "instagram": "◉",
    "youtube": "▶",
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
    "arrow-up": "↑",
    "arrow-down": "↓",
    "arrow-left": "←",
    "arrow-right": "→",
    "chart": "📊",
    "dollar": "$",
    "euro": "€",
    "pound": "£",
    "code": "</>",
    "database": "🗄️",
    "cloud": "☁️",
    "wifi": "📶",
    "chat": "💬",
    "video": "🎥",
    "microphone": "🎤",
    "bell": "🔔",
    "file": "📄",
    "folder": "📁",
    "image": "🖼️",
    "document": "📃",
    "pdf": "📑",
    "logo": "◈",
    "brand": "◆",
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
    "default": "●"
  };
  const iconContent = iconMap[iconName] || iconMap["default"];
  const socialIcons = ["twitter", "github", "linkedin", "facebook", "instagram", "youtube"];
  if (socialIcons.includes(iconName)) {
    return `<span class="${classes}" data-icon="${escapeHtml(iconName)}" aria-label="${escapeHtml(iconName)}" style="font-family: monospace; font-weight: bold; font-style: normal;">${iconContent}</span>`;
  }
  return `<span class="${classes}" data-icon="${escapeHtml(iconName)}" aria-label="${escapeHtml(iconName)}">${iconContent}</span>`;
}
function renderContainer(node, context) {
  var _a;
  const classes = buildClasses(context, `container-${node.containerType}`, node.props);
  const nodeClasses = ((_a = node.props) == null ? void 0 : _a.classes) || [];
  if (node.containerType === "layout" && nodeClasses.includes("sidebar-main")) {
    return renderSidebarMainLayout(node, context, classes);
  }
  const childrenHTML = renderChildren(node, context);
  return `<div class="${classes}">
  ${childrenHTML}
</div>`;
}
function renderSidebarMainLayout(node, context, classes) {
  var _a;
  const { classPrefix: prefix } = context;
  const children = node.children || [];
  const sections = [];
  let current = null;
  for (const child of children) {
    if (child.type === "container" && (child.containerType === "sidebar" || child.containerType === "main")) {
      if (current) sections.push(current);
      sections.push({ name: child.containerType, nodes: child.children || [] });
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
    const contentHTML = s.nodes.map((child) => renderPreviewNode(child, context)).join("\n    ");
    return `  <div class="${prefix}layout-${s.name}">
    ${contentHTML}
  </div>`;
  }).join("\n");
  return `<div class="${classes}">
${sectionsHTML}
</div>`;
}
function renderNav(node, context) {
  const { classPrefix: prefix } = context;
  const classes = buildClasses(context, "nav", node.props);
  const childrenHTML = renderChildren(node, context);
  return `<nav class="${classes}">
  <div class="${prefix}nav-content">
    ${childrenHTML}
  </div>
</nav>`;
}
function renderNavItem(node, context) {
  var _a;
  const { classPrefix: prefix } = context;
  const contentHTML = node.children ? node.children.map((child) => renderPreviewNode(child, context)).join("") : escapeHtml(node.content);
  const hrefResult = safeUrl(node.href, context, "link");
  if (((_a = node.props) == null ? void 0 : _a.variant) === "primary") {
    const classes2 = `${buildClasses(context, "button", node.props)} ${prefix}button-primary`;
    return `<a href="${escapeHtml(hrefResult.url)}" class="${classes2.trim()}" style="text-decoration:none;color:inherit;">${contentHTML}</a>`;
  }
  const classes = buildClasses(context, "nav-item", node.props);
  return `<a href="${escapeHtml(hrefResult.url)}" class="${classes}">${contentHTML}</a>`;
}
function renderBreadcrumbs(node, context) {
  const { classPrefix: prefix } = context;
  const items = node.children || [];
  const crumbsHTML = items.map((crumb, i) => {
    const isLast = i === items.length - 1;
    const label = escapeHtml(crumb.content || "");
    return isLast ? `<span class="${prefix}breadcrumb-item ${prefix}breadcrumb-current" aria-current="page">${label}</span>` : `<span class="${prefix}breadcrumb-item"><a href="#">${label}</a></span><span class="${prefix}breadcrumb-sep" aria-hidden="true">›</span>`;
  }).join("");
  return `<nav class="${prefix}breadcrumbs" aria-label="breadcrumb">${crumbsHTML}</nav>`;
}
function renderBrand(node, context) {
  const classes = buildClasses(context, "brand", node.props);
  const childrenHTML = renderChildren(node, context);
  return `<div class="${classes}">${childrenHTML}</div>`;
}
function renderGrid(node, context) {
  var _a;
  const { classPrefix: prefix } = context;
  const classes = buildClasses(context, "grid", node.props);
  const columns = node.columns || 3;
  const gridClass = `${classes} ${prefix}grid-${columns}`;
  const isCard = !!((_a = node.props) == null ? void 0 : _a.card);
  const childrenHTML = (node.children || []).map((child) => renderGridItem(child, context, isCard)).join("\n  ");
  return `<div class="${gridClass}" style="--grid-columns: ${columns}">
  ${childrenHTML}
</div>`;
}
function renderGridItem(node, context, isCard = false) {
  var _a, _b;
  const extraClasses = isCard ? [...((_a = node.props) == null ? void 0 : _a.classes) || [], "grid-item-card"] : ((_b = node.props) == null ? void 0 : _b.classes) || [];
  const itemProps = { ...node.props, classes: extraClasses };
  const classes = buildClasses(context, "grid-item", itemProps);
  const childrenHTML = renderChildren(node, context);
  return `<div class="${classes}">
    ${childrenHTML}
  </div>`;
}
function renderRow(node, context) {
  const classes = buildClasses(context, "row", node.props);
  const childrenHTML = (node.children || []).map((child) => renderGridItem(child, context)).join("\n  ");
  return `<div class="${classes}">
  ${childrenHTML}
</div>`;
}
function renderHeading(node, context) {
  var _a;
  if (!node.content && !((_a = node.children) == null ? void 0 : _a.length)) return "";
  const level = Math.min(Math.max(Number(node.level) || 1, 1), 6);
  const classes = buildClasses(context, `h${level}`, node.props);
  const content = node.content || "";
  const childrenHTML = node.children ? node.children.map((child) => renderPreviewNode(child, context)).join("") : escapeHtml(content);
  return `<h${level} class="${classes}">${childrenHTML}</h${level}>`;
}
function renderParagraph(node, context) {
  const classes = buildClasses(context, "paragraph", node.props);
  let childrenHTML;
  if (node.children) {
    childrenHTML = node.children.map((child) => renderPreviewNode(child, context)).join("");
  } else if (node.content) {
    childrenHTML = renderInlineRichText(node.content, context);
  } else {
    childrenHTML = "";
  }
  return `<p class="${classes}">${childrenHTML}</p>`;
}
function renderInlineRichText(content, context) {
  let result = "";
  const remaining = content;
  const pattern = /<(strong|em|code)>([\s\S]*?)<\/\1>|<a href="([^"]*)">([\s\S]*?)<\/a>/g;
  let match;
  let lastIndex = 0;
  while ((match = pattern.exec(remaining)) !== null) {
    result += escapeHtml(remaining.slice(lastIndex, match.index));
    if (match[1] === "strong") {
      result += `<strong>${escapeHtml(match[2])}</strong>`;
    } else if (match[1] === "em") {
      result += `<em>${escapeHtml(match[2])}</em>`;
    } else if (match[1] === "code") {
      result += `<code>${escapeHtml(match[2])}</code>`;
    } else {
      const href = safeUrl(match[3], context, "link");
      result += `<a href="${escapeHtml(href.url)}">${escapeHtml(match[4])}</a>`;
    }
    lastIndex = match.index + match[0].length;
  }
  result += escapeHtml(remaining.slice(lastIndex));
  return result;
}
function renderText(node, context) {
  const content = node.content || "";
  return renderInlineRichText(content, context);
}
function renderImage(node, context) {
  const { classPrefix: prefix } = context;
  const classes = buildClasses(context, "image", node.props);
  const alt = node.alt || "";
  const width = node.props.width ? ` width="${escapeHtml(String(node.props.width))}"` : "";
  const height = node.props.height ? ` height="${escapeHtml(String(node.props.height))}"` : "";
  const srcResult = safeUrl(node.src, context, "image");
  if (srcResult.relativeImage || srcResult.url === "") {
    return `<span class="${classes} ${prefix}image-placeholder" role="img" aria-label="${escapeHtml(alt)}">🖼️</span>`;
  }
  return `<img src="${escapeHtml(srcResult.url)}" alt="${escapeHtml(alt)}" class="${classes}"${width}${height} loading="lazy" />`;
}
function renderLink(node, context) {
  const classes = buildClasses(context, "link", node.props);
  const title = node.title ? ` title="${escapeHtml(node.title)}"` : "";
  const childrenHTML = node.children ? node.children.map((child) => renderPreviewNode(child, context)).join("") : escapeHtml(node.content || "");
  const hrefResult = safeUrl(node.href, context, "link");
  return `<a href="${escapeHtml(hrefResult.url)}" class="${classes}"${title}>${childrenHTML}</a>`;
}
function renderList(node, context) {
  const classes = buildClasses(context, "list", node.props);
  const tag = node.ordered ? "ol" : "ul";
  const childrenHTML = (node.children || []).map((child) => renderPreviewNode(child, context)).join("\n  ");
  return `<${tag} class="${classes}">
  ${childrenHTML}
</${tag}>`;
}
function renderListItem(node, context) {
  const classes = buildClasses(context, "list-item", node.props);
  let html = "";
  if (node.content) {
    html = escapeHtml(node.content);
  }
  if (node.children) {
    const childrenHTML = node.children.map((child) => renderPreviewNode(child, context)).join("");
    html += childrenHTML;
  }
  return `<li class="${classes}">${html}</li>`;
}
function renderTable(node, context) {
  var _a, _b;
  const classes = buildClasses(context, "table", node.props);
  const headerNode = (_a = node.children) == null ? void 0 : _a.find((child) => child.type === "table-header");
  const rowNodes = ((_b = node.children) == null ? void 0 : _b.filter((child) => child.type === "table-row")) || [];
  const headerHTML = headerNode ? renderPreviewNode(headerNode, context) : "";
  const rowsHTML = rowNodes.map((child) => renderPreviewNode(child, context)).join("\n    ");
  const bodyHTML = rowsHTML ? `
  <tbody>
    ${rowsHTML}
  </tbody>` : "";
  return `<table class="${classes}">
  ${headerHTML}${bodyHTML}
</table>`;
}
function renderTableHeader(node, context) {
  const cellsHTML = (node.children || []).map((child) => renderPreviewNode(child, context)).join("\n    ");
  return `<thead>
    <tr>
      ${cellsHTML}
    </tr>
  </thead>`;
}
function renderTableRow(node, context) {
  const cellsHTML = (node.children || []).map((child) => renderPreviewNode(child, context)).join("\n    ");
  return `<tr>
    ${cellsHTML}
  </tr>`;
}
function renderTableCell(node, context) {
  const { classPrefix: prefix } = context;
  const tag = node.header ? "th" : "td";
  const align = node.align || "left";
  const classes = buildClasses(context, `table-cell ${prefix}align-${align}`, {});
  const contentHTML = node.children && node.children.length > 0 ? node.children.map((child) => renderPreviewNode(child, context)).join("") : escapeHtml(node.content || "");
  return `<${tag} class="${classes}">${contentHTML}</${tag}>`;
}
function renderBlockquote(node, context) {
  const classes = buildClasses(context, "blockquote", node.props);
  const childrenHTML = renderChildren(node, context);
  return `<blockquote class="${classes}">
  ${childrenHTML}
</blockquote>`;
}
function renderCode(node, context) {
  const inline = node.inline !== false;
  if (inline) {
    const classes2 = buildClasses(context, "code-inline", {});
    return `<code class="${classes2}">${escapeHtml(node.value)}</code>`;
  }
  const classes = buildClasses(context, "code-block", {});
  const lang = node.lang ? ` data-lang="${escapeHtml(node.lang)}"` : "";
  return `<pre class="${classes}"><code${lang}>${escapeHtml(node.value)}</code></pre>`;
}
function renderSeparator(node, context) {
  const classes = buildClasses(context, "separator", node.props);
  return `<hr class="${classes}" />`;
}
function renderTabs(node, context) {
  const { classPrefix: prefix } = context;
  const classes = buildClasses(context, "tabs", node.props);
  const tabs = node.children || [];
  context.diagnostics.push({
    severity: "info",
    code: "wmd-tabs-static",
    message: "Interactive tabs are rendered as stacked static panels in embedded previews.",
    source: "renderer"
  });
  const sections = tabs.map((tab, i) => {
    const panelChildren = (tab.children || []).map((c) => renderPreviewNode(c, context)).join("\n    ");
    return `<div class="${prefix}tab-static-section">
    <div class="${prefix}tab-header${tab.active ? ` ${prefix}active` : ""}" role="heading" aria-level="3">${escapeHtml(tab.label || "")}</div>
    <div class="${prefix}tab-panel" role="tabpanel" data-wmd-tab-panel="${i}">
    ${panelChildren}
  </div>
  </div>`;
  }).join("\n  ");
  return `<div class="${classes} ${prefix}tabs-static" data-wmd-tabs-static>
  ${sections}
  </div>`;
}
function renderTab(node, context) {
  const { classPrefix: prefix } = context;
  const childrenHTML = (node.children || []).map((c) => renderPreviewNode(c, context)).join("");
  return `<div class="${prefix}tab-panel" role="tabpanel">${childrenHTML}</div>`;
}
function renderDemo(node, context) {
  const { classPrefix: prefix } = context;
  context.diagnostics.push({
    severity: "info",
    code: "wmd-demo-static",
    message: "Demo source pane and copy control are omitted in embedded previews.",
    source: "renderer"
  });
  const previewHTML = renderChildren(node, context);
  return `<div class="${prefix}demo">
  <div class="${prefix}demo-preview">${previewHTML}</div>
</div>`;
}
const CSS_LENGTH_PATTERN = /^[0-9]*\.?[0-9]+(?:px|em|rem|ch|ex|vh|vw|%)?$/;
function cssLength(value, context) {
  if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
  if (typeof value === "string" && CSS_LENGTH_PATTERN.test(value.trim())) return value.trim();
  if (value !== void 0) {
    context.diagnostics.push({
      severity: "warning",
      code: "wmd-style-sanitized",
      message: `Inline style length ${JSON.stringify(value)} is not a safe CSS length and was omitted from the preview.`,
      source: "renderer"
    });
  }
  return void 0;
}
function renderToast(node, context) {
  var _a, _b;
  const toastType = (_a = node.props) == null ? void 0 : _a.toastType;
  const variantClass = toastType && toastType !== "loading" ? toastType : void 0;
  const extraClasses = (((_b = node.props) == null ? void 0 : _b.classes) || []).filter(
    (c) => c !== variantClass
  );
  const cls = buildClasses(context, "toast", { ...node.props, classes: extraClasses });
  const variantHTML = variantClass ? ` data-variant="${escapeHtml(variantClass)}"` : "";
  const childrenHTML = (node.children || []).map((c) => renderPreviewNode(c, context)).join("\n  ");
  return `<div class="${cls}" role="status"${variantHTML}>
  ${childrenHTML}
</div>`;
}
function renderSkeleton(node, context) {
  var _a, _b;
  const cls = buildClasses(context, "skeleton", node.props);
  const width = cssLength((_a = node.props) == null ? void 0 : _a.width, context);
  const height = cssLength((_b = node.props) == null ? void 0 : _b.height, context);
  const styleAttr = width !== void 0 || height !== void 0 ? ` style="${[
    width !== void 0 ? `width:${width}` : "",
    height !== void 0 ? `height:${height}` : ""
  ].filter(Boolean).join(";")}"` : "";
  return `<div class="${cls}"${styleAttr}></div>`;
}
function renderSpinner(node, context) {
  var _a;
  const size = ((_a = node.props) == null ? void 0 : _a.size) || "medium";
  const sizeClass = size === "small" ? "spinner-sm" : size === "large" ? "spinner-lg" : "spinner-md";
  const cls = buildClasses(context, "spinner", { ...node.props, classes: [sizeClass] });
  return `<div class="${cls}" role="status" aria-label="Loading"></div>`;
}
function renderKbd(node, context) {
  const cls = buildClasses(context, "kbd", node.props);
  return `<kbd class="${cls}">${escapeHtml(node.content ?? "")}</kbd>`;
}
function renderProgress(node, context) {
  var _a;
  const { classPrefix: prefix } = context;
  const cls = buildClasses(context, "progress", node.props);
  const value = Math.max(0, Math.min(100, Number(node.value ?? 0)));
  const indeterminate = !!node.indeterminate;
  const labelText = (_a = node.props) == null ? void 0 : _a.label;
  const labelHTML = labelText ? `  <p class="${prefix}progress-label">${escapeHtml(labelText)}</p>
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
  const cls = buildClasses(context, "meter", node.props);
  const value = Number(node.value ?? 0);
  const min = Number(node.min ?? 0);
  const max = Number(node.max ?? 100);
  const range = max - min || 1;
  const pct = Math.max(0, Math.min(100, (value - min) / range * 100));
  const labelText = (_a = node.props) == null ? void 0 : _a.label;
  const labelHTML = labelText ? `  <p class="${prefix}meter-label">${escapeHtml(labelText)}</p>
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
  const cls = buildClasses(context, kind, cleanedProps);
  const title = typeof props.title === "string" ? props.title : void 0;
  const desc = typeof props.description === "string" ? props.description : void 0;
  const showClose = props.showClose !== false;
  const titleHTML = title ? `  <h2 class="${prefix}${kind}-title">${escapeHtml(title)}</h2>
` : "";
  const descHTML = desc ? `  <p class="${prefix}${kind}-description">${escapeHtml(desc)}</p>
` : "";
  const closeHTML = showClose && kind === "dialog" ? `  <button type="button" class="${prefix}${kind}-close" aria-label="Close">×</button>
` : "";
  const ariaLabelAttr = "";
  return `<div class="${cls}" role="${role}"${ariaLabelAttr}${dataAttrs}>
${titleHTML}${descHTML}${inner}${closeHTML}</div>`;
}
function renderDialog(node, context) {
  const inner = (node.children || []).map((c) => renderPreviewNode(c, context)).join("\n  ");
  return overlayShell(context, "dialog", node.props || {}, inner, "dialog");
}
function renderAlertDialog(node, context) {
  var _a, _b, _c;
  const { classPrefix: prefix } = context;
  const inner = (node.children || []).map((c) => renderPreviewNode(c, context)).join("\n  ");
  const actionVariant = ((_a = node.props) == null ? void 0 : _a.actionVariant) || "danger";
  const actionText = ((_b = node.props) == null ? void 0 : _b.actionText) || "Confirm";
  const cancelText = ((_c = node.props) == null ? void 0 : _c.cancelText) || "Cancel";
  const actionsHTML = `
  <div class="${prefix}alert-dialog-actions">
    <button type="button" class="${prefix}button ${prefix}${actionVariant}">${escapeHtml(cancelText)}</button>
    <button type="button" class="${prefix}button ${prefix}${actionVariant === "danger" ? "primary" : "danger"}">${escapeHtml(actionText)}</button>
  </div>`;
  return overlayShell(context, "alert-dialog", node.props || {}, inner + actionsHTML, "alertdialog");
}
function renderSheet(node, context) {
  const inner = (node.children || []).map((c) => renderPreviewNode(c, context)).join("\n  ");
  const side = node.side || "right";
  return overlayShell(
    context,
    "sheet",
    node.props || {},
    inner,
    "dialog",
    void 0,
    ` data-side="${escapeHtml(side)}"`
  );
}
function renderDrawer(node, context) {
  const inner = (node.children || []).map((c) => renderPreviewNode(c, context)).join("\n  ");
  const side = node.side || "left";
  return overlayShell(
    context,
    "drawer",
    node.props || {},
    inner,
    "dialog",
    void 0,
    ` data-side="${escapeHtml(side)}"`
  );
}
function renderPopover(node, context) {
  const inner = (node.children || []).map((c) => renderPreviewNode(c, context)).join("\n  ");
  return overlayShell(context, "popover", node.props || {}, inner, "dialog");
}
function renderTooltip(node, context) {
  var _a, _b;
  const cleanedProps = { ...node.props || {} };
  delete cleanedProps.content;
  delete cleanedProps.side;
  const cls = buildClasses(context, "tooltip", cleanedProps);
  const content = ((_a = node.props) == null ? void 0 : _a.content) || "";
  const side = ((_b = node.props) == null ? void 0 : _b.side) || "top";
  const childHTML = (node.children || []).map((c) => renderPreviewNode(c, context)).join("\n  ");
  const inner = childHTML || content;
  return `<span class="${cls}" role="tooltip" data-side="${escapeHtml(side)}">${escapeHtml(inner)}</span>`;
}
function renderPreviewCard(node, context) {
  var _a;
  const { classPrefix: prefix } = context;
  const cls = buildClasses(context, "preview-card", node.props || {});
  const childrenHTML = (node.children || []).map((c) => renderPreviewNode(c, context)).join("\n  ");
  const href = (_a = node.props) == null ? void 0 : _a.href;
  const wrap = (inner) => {
    if (!href) return inner;
    const hrefResult = safeUrl(href, context, "link");
    return `<a class="${prefix}preview-card-link" href="${escapeHtml(hrefResult.url)}">${inner}</a>`;
  };
  return wrap(`<div class="${cls}">
  ${childrenHTML}
</div>`);
}
function flattenGroupItems(raw) {
  const items = [];
  for (const child of raw) {
    if (child.type === "container" && child.containerType === "button-group") {
      items.push(...child.children || []);
    } else {
      items.push(child);
    }
  }
  return items;
}
function renderPagination(node, context) {
  var _a;
  const { classPrefix: prefix } = context;
  const label = ((_a = node.props) == null ? void 0 : _a.label) || "pagination";
  const items = flattenGroupItems(node.children || []);
  const linksHTML = items.filter((item) => item.type === "button" || item.type === "nav-item" || item.type === "text").map((item) => {
    var _a2, _b;
    const isCurrent = (((_a2 = item.props) == null ? void 0 : _a2.classes) || []).includes("active") || ((_b = item.props) == null ? void 0 : _b.variant) === "primary";
    const text = item.content ?? "";
    const linkCls = `${prefix}pagination-link${isCurrent ? ` ${prefix}pagination-active` : ""}`;
    const currentAttr = isCurrent ? ' aria-current="page"' : "";
    return `      <li class="${prefix}pagination-item"><a class="${linkCls}" href="#"${currentAttr}>${escapeHtml(text)}</a></li>`;
  }).join("\n");
  return `<nav class="${prefix}pagination" aria-label="${escapeHtml(label)}" role="navigation">
    <ul class="${prefix}pagination-content">
${linksHTML}
    </ul>
</nav>`;
}
function renderSegmentedControl(node, context) {
  const { classPrefix: prefix } = context;
  const items = flattenGroupItems(node.children || []);
  const buttonsHTML = items.filter((item) => item.type === "button" || item.type === "nav-item").map((item) => {
    var _a, _b;
    const isActive = (((_a = item.props) == null ? void 0 : _a.classes) || []).includes("active") || ((_b = item.props) == null ? void 0 : _b.variant) === "primary";
    const text = item.content ?? "";
    const btnCls = `${prefix}segmented-item${isActive ? ` ${prefix}segmented-active` : ""}`;
    const activeAttr = isActive ? ' aria-pressed="true"' : ' aria-pressed="false"';
    return `  <button type="button" class="${btnCls}"${activeAttr}>${escapeHtml(text)}</button>`;
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
  const cls = buildClasses(context, "scroll-area", cleaned);
  const maxHeight = cssLength((_a = node.props) == null ? void 0 : _a.maxHeight, context);
  const styleAttr = maxHeight !== void 0 ? ` style="max-height:${maxHeight}"` : "";
  const childrenHTML = (node.children || []).map((c) => renderPreviewNode(c, context)).join("\n    ");
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
  const cls = buildClasses(context, "sidebar-nav", cleaned);
  const title = (_a = node.props) == null ? void 0 : _a.title;
  const titleHTML = title ? `  <div class="${prefix}sidebar-header">${escapeHtml(title)}</div>
` : "";
  const childrenHTML = (node.children || []).map((c) => {
    if (c.type === "list") {
      const itemsHTML = (c.children || []).map((li) => {
        var _a2;
        const liClasses = ((_a2 = li.props) == null ? void 0 : _a2.classes) || [];
        const isActive = liClasses.includes("active");
        const itemCls = `${prefix}sidebar-item${isActive ? ` ${prefix}sidebar-item-active` : ""}`;
        const text = (li.content ?? "").replace(/\s*:::\s*$/, "").trim();
        return `    <a class="${itemCls}" href="#">${escapeHtml(text)}</a>`;
      }).join("\n");
      return `  <nav class="${prefix}sidebar-menu">
${itemsHTML}
  </nav>`;
    }
    return renderPreviewNode(c, context).split("\n").map((l) => l ? `  ${l}` : l).join("\n");
  }).join("\n");
  return `<aside class="${cls}">
${titleHTML}${childrenHTML}
</aside>`;
}
function renderMenubar(node, context) {
  const cls = buildClasses(context, "menubar", node.props || {});
  const childrenHTML = (node.children || []).map((c) => renderPreviewNode(c, context)).join("\n  ");
  return `<div class="${cls}" role="menubar">
  ${childrenHTML}
</div>`;
}
function renderForm(node, context) {
  var _a, _b;
  const { classPrefix: prefix } = context;
  const actionAttr = ((_a = node.props) == null ? void 0 : _a.action) ? ` action="${escapeHtml(safeUrl(node.props.action, context, "link").url)}"` : "";
  const method = (_b = node.props) == null ? void 0 : _b.method;
  const methodAttr = method ? ` method="${escapeHtml(method)}"` : "";
  const childrenHTML = (node.children || []).map((c) => renderPreviewNode(c, context)).join("\n  ");
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
  const labelHTML = label ? `  <label class="${prefix}field-label">${escapeHtml(label)}</label>
` : "";
  const childrenHTML = (node.children || []).map((c) => renderPreviewNode(c, context)).join("\n  ");
  const descHTML = desc ? `
  <p class="${prefix}field-description">${escapeHtml(desc)}</p>` : "";
  const errorHTML = error ? `
  <p class="${prefix}field-error" role="alert">${escapeHtml(error)}</p>` : "";
  return `<div class="${prefix}field">
${labelHTML}  ${childrenHTML}${descHTML}${errorHTML}
</div>`;
}
function renderFieldset(node, context) {
  var _a, _b;
  const { classPrefix: prefix } = context;
  const legend = (_a = node.props) == null ? void 0 : _a.legend;
  const desc = (_b = node.props) == null ? void 0 : _b.description;
  const legendHTML = legend ? `  <legend class="${prefix}fieldset-legend">${escapeHtml(legend)}</legend>
` : "";
  const descHTML = desc ? `  <p class="${prefix}fieldset-description">${escapeHtml(desc)}</p>
` : "";
  const childrenHTML = (node.children || []).map((c) => renderPreviewNode(c, context)).join("\n  ");
  return `<fieldset class="${prefix}fieldset">
${legendHTML}${descHTML}  ${childrenHTML}
</fieldset>`;
}
function renderLabel(node, context) {
  var _a;
  const { classPrefix: prefix } = context;
  const htmlFor = (_a = node.props) == null ? void 0 : _a.htmlFor;
  const forAttr = htmlFor ? ` for="${escapeHtml(htmlFor)}"` : "";
  return `<label class="${prefix}label"${forAttr}>${escapeHtml(node.content ?? "")}</label>`;
}
function renderInputGroup(node, context) {
  var _a, _b;
  const { classPrefix: prefix } = context;
  const start = (_a = node.props) == null ? void 0 : _a.addonStart;
  const end = (_b = node.props) == null ? void 0 : _b.addonEnd;
  const childrenHTML = (node.children || []).map((c) => renderPreviewNode(c, context)).join("\n  ");
  const startHTML = start ? `  <span class="${prefix}input-group-addon">${escapeHtml(start)}</span>
` : "";
  const endHTML = end ? `
  <span class="${prefix}input-group-addon">${escapeHtml(end)}</span>` : "";
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
    () => `<input class="${prefix}otp-slot" type="text" inputmode="numeric" maxlength="${maxLength}" aria-label="digit" readonly>`
  ).join("\n  ");
  return `<div class="${prefix}otp-field" role="group" aria-label="Verification code">
  ${slots}
</div>`;
}
function renderNumberField(node, context) {
  const { classPrefix: prefix } = context;
  const p = node.props || {};
  const numAttrs = (name) => p[name] !== void 0 ? ` ${name}="${escapeHtml(String(p[name]))}"` : "";
  const valueAttr = p.value !== void 0 ? ` value="${escapeHtml(String(p.value))}"` : "";
  const placeholderAttr = p.placeholder ? ` placeholder="${escapeHtml(p.placeholder)}"` : "";
  const btnCls = `${prefix}number-stepper`;
  return `<div class="${prefix}number-field">
  <button type="button" class="${btnCls}" aria-label="Decrease">−</button>
  <input class="${prefix}number-input" type="number"${numAttrs("min")}${numAttrs("max")}${numAttrs("step")}${valueAttr}${placeholderAttr} readonly>
  <button type="button" class="${btnCls}" aria-label="Increase">+</button>
</div>`;
}
function renderAutocomplete(node, context) {
  const { classPrefix: prefix } = context;
  const p = node.props || {};
  const placeholderAttr = p.placeholder ? ` placeholder="${escapeHtml(p.placeholder)}"` : "";
  const suggestions = p.suggestions || [];
  const listItems = suggestions.map((s) => `    <li class="${prefix}autocomplete-option" role="option">${escapeHtml(s)}</li>`).join("\n");
  const listHTML = suggestions.length > 0 ? `
  <ul class="${prefix}autocomplete-list" role="listbox">
${listItems}
  </ul>` : "";
  return `<div class="${prefix}autocomplete">
  <input class="${prefix}autocomplete-input" type="text" role="combobox" aria-expanded="false" aria-autocomplete="list"${placeholderAttr} readonly>${listHTML}
</div>`;
}
function renderCombobox(node, context) {
  const { classPrefix: prefix } = context;
  const p = node.props || {};
  const placeholderAttr = p.placeholder ? ` placeholder="${escapeHtml(p.placeholder)}"` : "";
  const options = p.options || [];
  const listItems = options.map((o) => `    <li class="${prefix}combobox-option" role="option">${escapeHtml(o)}</li>`).join("\n");
  const listHTML = options.length > 0 ? `
  <ul class="${prefix}combobox-list" role="listbox">
${listItems}
  </ul>` : "";
  return `<div class="${prefix}combobox">
  <input class="${prefix}combobox-input" type="text" role="combobox" aria-expanded="false" aria-autocomplete="list"${placeholderAttr} readonly>
  <span class="${prefix}combobox-caret" aria-hidden="true">▾</span>${listHTML}
</div>`;
}
function renderCommand(node, context) {
  const { classPrefix: prefix } = context;
  const p = node.props || {};
  const placeholderAttr = p.placeholder ? ` placeholder="${escapeHtml(p.placeholder)}"` : "";
  const childrenHTML = (node.children || []).map((c) => renderPreviewNode(c, context)).join("\n  ");
  return `<div class="${prefix}command" role="dialog" aria-label="Command menu">
  <input class="${prefix}command-input" type="text"${placeholderAttr} readonly>
  ${childrenHTML}
</div>`;
}
function renderCheckboxGroup(node, context) {
  var _a, _b;
  const { classPrefix: prefix } = context;
  const label = (_a = node.props) == null ? void 0 : _a.label;
  const desc = (_b = node.props) == null ? void 0 : _b.description;
  const labelHTML = label ? `  <p class="${prefix}checkbox-group-label">${escapeHtml(label)}</p>
` : "";
  const descHTML = desc ? `  <p class="${prefix}checkbox-group-description">${escapeHtml(desc)}</p>
` : "";
  const childrenHTML = (node.children || []).map((c) => renderPreviewNode(c, context)).join("\n  ");
  return `<div class="${prefix}checkbox-group" role="group">
${labelHTML}${descHTML}  ${childrenHTML}
</div>`;
}
function renderToggleGroup(node, context) {
  const { classPrefix: prefix } = context;
  const items = flattenGroupItems(node.children || []);
  const buttonsHTML = items.filter((item) => item.type === "button" || item.type === "nav-item").map((item) => {
    var _a, _b;
    const isPressed = (((_a = item.props) == null ? void 0 : _a.classes) || []).includes("active") || ((_b = item.props) == null ? void 0 : _b.variant) === "primary";
    const text = item.content ?? "";
    const btnCls = `${prefix}toggle${isPressed ? ` ${prefix}toggle-pressed` : ""}`;
    const pressedAttr = isPressed ? ' aria-pressed="true"' : ' aria-pressed="false"';
    return `  <button type="button" class="${btnCls}"${pressedAttr}>${escapeHtml(text)}</button>`;
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
  const labelHTML = p.label ? `  <span class="${prefix}switch-label">${escapeHtml(p.label)}</span>` : "";
  const descHTML = p.description ? `
  <span class="${prefix}switch-description">${escapeHtml(p.description)}</span>` : "";
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
  const labelHTML = p.label ? `  <label class="${prefix}slider-label">${escapeHtml(p.label)} <span class="${prefix}slider-value">${value}</span></label>
` : "";
  return `<div class="${prefix}slider">
${labelHTML}  <div class="${prefix}slider-track" role="slider" aria-valuenow="${value}" aria-valuemin="${min}" aria-valuemax="${max}" aria-step="${step}">
    <div class="${prefix}slider-fill" style="width:${pct}%"></div>
    <div class="${prefix}slider-thumb" style="left:${pct}%"></div>
  </div>
</div>`;
}
function renderToggle(node, context) {
  var _a;
  const { classPrefix: prefix } = context;
  const pressed = !!node.pressed;
  const label = (_a = node.props) == null ? void 0 : _a.label;
  const btnCls = `${prefix}toggle${pressed ? ` ${prefix}toggle-pressed` : ""}`;
  const pressedAttr = pressed ? ' aria-pressed="true"' : ' aria-pressed="false"';
  const text = label ?? "";
  return `<button type="button" class="${btnCls}"${pressedAttr}>${escapeHtml(text)}</button>`;
}
function renderAvatar(node, context) {
  var _a, _b;
  const { classPrefix: prefix } = context;
  const size = ((_a = node.props) == null ? void 0 : _a.size) ?? "md";
  const sizeCls = `${prefix}avatar ${prefix}avatar-${size}`;
  const name = (_b = node.props) == null ? void 0 : _b.name;
  const initials = name ? name.split(/\s+/).map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() : "?";
  return `<div class="${sizeCls}" role="img" aria-label="${escapeHtml(name ?? "avatar")}">
  <span class="${prefix}avatar-fallback">${escapeHtml(initials)}</span>
</div>`;
}
function renderFrame(node, context) {
  const { classPrefix: prefix } = context;
  const childrenHTML = (node.children || []).map((c) => renderPreviewNode(c, context)).join("\n  ");
  return `<div class="${prefix}frame">
  ${childrenHTML}
</div>`;
}
function renderGroup(node, context) {
  const { classPrefix: prefix } = context;
  const orientation = (node.orientation || "horizontal") === "vertical" ? "vertical" : "horizontal";
  const childrenHTML = (node.children || []).map((c) => renderPreviewNode(c, context)).join("\n  ");
  return `<div class="${prefix}group ${prefix}group-${orientation}" role="group" data-orientation="${orientation}">
  ${childrenHTML}
</div>`;
}
function renderEmpty(node, context) {
  const { classPrefix: prefix } = context;
  const childrenHTML = (node.children || []).map((c) => renderPreviewNode(c, context)).join("\n  ");
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
    <div class="${prefix}calendar-caption">${escapeHtml(MONTH_NAMES[safeIdx])} ${year}</div>
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
    <span class="${prefix}date-picker-value${value ? "" : ` ${prefix}date-picker-placeholder`}">${escapeHtml(value ?? placeholder)}</span>
    <span class="${prefix}date-picker-caret" aria-hidden="true">&#9662;</span>
  </button>
</div>`;
}
function compileWiremd(source, options = {}) {
  const diagnostics = [];
  const emit = (diagnostic) => {
    var _a;
    diagnostics.push(diagnostic);
    (_a = options.onDiagnostic) == null ? void 0 : _a.call(options, diagnostic);
  };
  if (typeof source !== "string") {
    emit({
      severity: "error",
      code: "wmd-invalid-source",
      message: "wiremd source must be a string.",
      source: "parser"
    });
    return { document: null, diagnostics, syntaxVersion: SYNTAX_VERSION };
  }
  let style;
  if (options.style !== void 0) {
    if (WIREMD_STYLES.includes(options.style)) {
      style = options.style;
    } else {
      emit({
        severity: "error",
        code: "wmd-invalid-style",
        message: `Unknown wiremd style ${JSON.stringify(options.style)}. Valid styles: ${WIREMD_STYLES.join(", ")}.`,
        source: "parser"
      });
    }
  }
  if (options.syntaxVersion !== void 0 && options.syntaxVersion !== SYNTAX_VERSION) {
    emit({
      severity: "error",
      code: "wmd-invalid-syntax-version",
      message: `Fence declares syntax version "${options.syntaxVersion}" but this compiler speaks "${SYNTAX_VERSION}". Source is preserved; rendering may be incomplete.`,
      source: "parser"
    });
  }
  reportDisabledIncludes(source, emit);
  let document = null;
  try {
    document = parse(source, { position: true }, emit);
  } catch (error) {
    emit({
      severity: "error",
      code: "wmd-internal-parse-error",
      message: `Unexpected parser failure: ${error instanceof Error ? error.message : String(error)}`,
      source: "parser"
    });
    return { document: null, diagnostics, syntaxVersion: SYNTAX_VERSION, style };
  }
  if (options.validate !== false && document) {
    const validationErrors = validate(document, { attachNodes: true });
    for (const validationError of validationErrors) {
      emit(validationErrorToDiagnostic(validationError));
    }
  }
  return { document, diagnostics, syntaxVersion: SYNTAX_VERSION, style };
}
function renderToPreview(document, options) {
  return renderPreview(document, options);
}
const INCLUDE_TOKEN_PATTERN = /!\[\[\s*([^\]]+?)\s*\]\]/g;
const CODE_SPAN_SPLIT = /(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`)/g;
function reportDisabledIncludes(source, emit) {
  const parts = source.split(CODE_SPAN_SPLIT);
  const hasToken = /!\[\[\s*[^\]]+?\s*\]\]/;
  let partOffset = 0;
  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    if (i % 2 === 0 && hasToken.test(part)) {
      INCLUDE_TOKEN_PATTERN.lastIndex = 0;
      let match;
      while ((match = INCLUDE_TOKEN_PATTERN.exec(part)) !== null) {
        const startOffset = partOffset + match.index;
        const endOffset = startOffset + match[0].length;
        emit({
          severity: "warning",
          code: "wmd-includes-disabled",
          message: `Include "![[${match[1]}]]" is disabled in embedded previews and renders as text.`,
          source: "include",
          start: offsetToSpan(source, startOffset),
          end: offsetToSpan(source, endOffset)
        });
      }
    }
    partOffset += part.length;
  }
}
function offsetToSpan(source, offset) {
  let line = 1;
  let lastNewline = -1;
  for (let i = 0; i < offset && i < source.length; i += 1) {
    if (source.charCodeAt(i) === 10) {
      line += 1;
      lastNewline = i;
    }
  }
  return {
    line,
    column: offset - lastNewline,
    offset
  };
}
function validationErrorToDiagnostic(error) {
  const nodeWithPosition = error.node;
  const spans = nodeWithPosition && nodeWithPosition.position ? spansFromPosition(nodeWithPosition.position) : {};
  return {
    severity: "error",
    code: "wmd-invalid-wiremd-ast",
    message: error.code ? `${error.message} (${error.code})` : error.message,
    source: "validator",
    ...spans
  };
}
export {
  WIREMD_STYLES,
  compileWiremd,
  renderToPreview
};

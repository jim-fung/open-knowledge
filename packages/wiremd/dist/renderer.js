import { g as getStyleCSS } from "./styles-DnE-eq0t.js";
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
  if (node.containerType === "layout" && nodeClasses.includes("sidebar-main")) {
    return renderSidebarMainLayout(node, context, classes);
  }
  const childrenHTML = (node.children || []).map((child) => renderNode$2(child, context)).join("\n  ");
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
  const { classPrefix: prefix } = context;
  const previewHTML = (node.children || []).map((child) => renderNode$2(child, context)).join("\n");
  const codeHTML = escapeHtml$1(node.raw || "");
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
function escapeHtml$1(text) {
  if (!text) return "";
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
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
  const classAttr = context.useClassName ? "className" : "class";
  const contentJSX = node.children ? node.children.map((child) => renderNode$1(child, context, 0)).join("") : escapeJSX(node.content);
  return `${indentStr}<button ${classAttr}="${classes}"${disabled ? " disabled" : ""}>
${indentStr}  ${contentJSX}
${indentStr}</button>`;
}
function renderBadge$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "badge", node.props);
  const classAttr = context.useClassName ? "className" : "class";
  return `${indentStr}<span ${classAttr}="${classes}">${escapeJSX(node.content)}</span>`;
}
function renderInput$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "input", node.props);
  const type = node.props.inputType || node.props.type || "text";
  const classAttr = context.useClassName ? "className" : "class";
  const attrs = [];
  if (node.props.placeholder) attrs.push(`placeholder="${escapeJSX(node.props.placeholder)}"`);
  if (node.props.value) attrs.push(`defaultValue="${escapeJSX(node.props.value)}"`);
  if (node.props.required) attrs.push("required");
  if (node.props.disabled) attrs.push("disabled");
  return `${indentStr}<input type="${type}" ${classAttr}="${classes}" ${attrs.join(" ")} />`;
}
function renderTextarea$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "textarea", node.props);
  const rows = node.props.rows || 4;
  const classAttr = context.useClassName ? "className" : "class";
  const attrs = [];
  if (node.props.placeholder) attrs.push(`placeholder="${escapeJSX(node.props.placeholder)}"`);
  if (node.props.required) attrs.push("required");
  if (node.props.disabled) attrs.push("disabled");
  const value = node.props.value || "";
  return `${indentStr}<textarea ${classAttr}="${classes}" rows={${rows}} ${attrs.join(" ")}>
${indentStr}  ${escapeJSX(value)}
${indentStr}</textarea>`;
}
function renderSelect$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "select", node.props);
  const classAttr = context.useClassName ? "className" : "class";
  const attrs = [];
  if (node.props.required) attrs.push("required");
  if (node.props.disabled) attrs.push("disabled");
  if (node.props.multiple) attrs.push("multiple");
  const optionsJSX = (node.options || []).map((opt) => {
    const selected = opt.selected ? " defaultSelected" : "";
    return `    <option value="${escapeJSX(opt.value)}"${selected}>${escapeJSX(opt.label)}</option>`;
  }).join("\n");
  const placeholder = node.props.placeholder;
  const placeholderOption = placeholder ? `    <option value="" disabled defaultSelected>${escapeJSX(placeholder)}</option>
` : "";
  return `${indentStr}<select ${classAttr}="${classes}" ${attrs.join(" ")}>
${placeholderOption}${optionsJSX}
${indentStr}</select>`;
}
function renderCheckbox$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "checkbox", node.props);
  const checked = node.checked;
  const classAttr = context.useClassName ? "className" : "class";
  const attrs = [];
  if (node.props.value) attrs.push(`value="${escapeJSX(node.props.value)}"`);
  if (node.props.disabled) attrs.push("disabled");
  const labelJSX = node.children ? node.children.map((child) => renderNode$1(child, context, 0)).join("") : escapeJSX(node.label);
  return `${indentStr}<label ${classAttr}="${classes}">
${indentStr}  <input type="checkbox"${checked ? " defaultChecked" : ""} ${attrs.join(" ")} />
${indentStr}  <span>${labelJSX}</span>
${indentStr}</label>`;
}
function renderRadio$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "radio", node.props);
  const checked = node.selected;
  const classAttr = context.useClassName ? "className" : "class";
  const attrs = [];
  if (node.props.name) attrs.push(`name="${escapeJSX(node.props.name)}"`);
  if (node.props.value) attrs.push(`value="${escapeJSX(node.props.value)}"`);
  if (node.props.disabled) attrs.push("disabled");
  return `${indentStr}<label ${classAttr}="${classes}">
${indentStr}  <input type="radio"${checked ? " defaultChecked" : ""} ${attrs.join(" ")} />
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
  const classAttr = context.useClassName ? "className" : "class";
  const groupName = `radio-${Math.random().toString(36).substr(2, 9)}`;
  const radios = (node.children || []).map((child) => {
    if (child.type === "radio") {
      const modifiedChild = { ...child, props: { ...child.props, name: groupName } };
      return renderNode$1(modifiedChild, context, indent + 1);
    }
    return renderNode$1(child, context, indent + 1);
  }).join("\n");
  return `${indentStr}<div ${classAttr}="${classes}${inlineClass}">
${radios}
${indentStr}</div>`;
}
function renderIcon$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "icon", node.props);
  const iconName = node.props.name || "default";
  const classAttr = context.useClassName ? "className" : "class";
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
  return `${indentStr}<span ${classAttr}="${classes}" data-icon="${iconName}" aria-label="${iconName}">${iconContent}</span>`;
}
function renderContainer$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, `container-${node.containerType}`, node.props);
  const classAttr = context.useClassName ? "className" : "class";
  const childrenJSX = (node.children || []).map((child) => renderNode$1(child, context, indent + 1)).join("\n");
  return `${indentStr}<div ${classAttr}="${classes}">
${childrenJSX}
${indentStr}</div>`;
}
function renderNav$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "nav", node.props);
  const classAttr = context.useClassName ? "className" : "class";
  const childrenJSX = (node.children || []).map((child) => renderNode$1(child, context, indent + 2)).join("\n");
  return `${indentStr}<nav ${classAttr}="${classes}">
${indentStr}  <div ${classAttr}="${prefix}nav-content">
${childrenJSX}
${indentStr}  </div>
${indentStr}</nav>`;
}
function renderNavItem$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "nav-item", node.props);
  const href = node.href || "#";
  const classAttr = context.useClassName ? "className" : "class";
  const contentJSX = node.children ? node.children.map((child) => renderNode$1(child, context, 0)).join("") : escapeJSX(node.content);
  return `${indentStr}<a href="${href}" ${classAttr}="${classes}">${contentJSX}</a>`;
}
function renderBrand$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "brand", node.props);
  const classAttr = context.useClassName ? "className" : "class";
  const childrenJSX = (node.children || []).map((child) => renderNode$1(child, context, 0)).join("");
  return `${indentStr}<div ${classAttr}="${classes}">${childrenJSX}</div>`;
}
function renderRow$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "row", node.props);
  const classAttr = context.useClassName ? "className" : "class";
  const childrenJSX = (node.children || []).map((child) => renderNode$1(child, context, indent + 1)).join("\n");
  return `${indentStr}<div ${classAttr}="${classes}">
${childrenJSX}
${indentStr}</div>`;
}
function renderGrid$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "grid", node.props);
  const columns = node.columns || 3;
  const gridClass = `${classes} ${prefix}grid-${columns}`;
  const classAttr = context.useClassName ? "className" : "class";
  const childrenJSX = (node.children || []).map((child) => renderNode$1(child, context, indent + 1)).join("\n");
  return `${indentStr}<div ${classAttr}="${gridClass}" style={{ '--grid-columns': ${columns} }${context.typescript ? " as React.CSSProperties" : ""}}>
${childrenJSX}
${indentStr}</div>`;
}
function renderGridItem$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "grid-item", node.props);
  const classAttr = context.useClassName ? "className" : "class";
  const childrenJSX = (node.children || []).map((child) => renderNode$1(child, context, indent + 1)).join("\n");
  return `${indentStr}<div ${classAttr}="${classes}">
${childrenJSX}
${indentStr}</div>`;
}
function renderHeading$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const level = node.level || 1;
  const classes = buildClasses(prefix, `h${level}`, node.props);
  const classAttr = context.useClassName ? "className" : "class";
  const childrenJSX = node.children ? node.children.map((child) => renderNode$1(child, context, 0)).join("") : escapeJSX(node.content || "");
  const tag = `h${level}`;
  return `${indentStr}<${tag} ${classAttr}="${classes}">${childrenJSX}</${tag}>`;
}
function renderParagraph$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "paragraph", node.props);
  const classAttr = context.useClassName ? "className" : "class";
  const childrenJSX = node.children ? node.children.map((child) => renderNode$1(child, context, 0)).join("") : node.content ? escapeJSX(node.content) : "";
  return `${indentStr}<p ${classAttr}="${classes}">${childrenJSX}</p>`;
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
  const classAttr = context.useClassName ? "className" : "class";
  const attrs = [];
  if (node.props.width) attrs.push(`width="${node.props.width}"`);
  if (node.props.height) attrs.push(`height="${node.props.height}"`);
  return `${indentStr}<img src="${escapeJSX(src)}" alt="${escapeJSX(alt)}" ${classAttr}="${classes}" ${attrs.join(" ")} />`;
}
function renderLink$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "link", node.props);
  const href = node.href || "#";
  const classAttr = context.useClassName ? "className" : "class";
  const attrs = [];
  if (node.title) attrs.push(`title="${escapeJSX(node.title)}"`);
  const childrenJSX = node.children ? node.children.map((child) => renderNode$1(child, context, 0)).join("") : escapeJSX(node.content || "");
  return `${indentStr}<a href="${escapeJSX(href)}" ${classAttr}="${classes}" ${attrs.join(" ")}>${childrenJSX}</a>`;
}
function renderList$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "list", node.props);
  const tag = node.ordered ? "ol" : "ul";
  const classAttr = context.useClassName ? "className" : "class";
  const childrenJSX = (node.children || []).map((child) => renderNode$1(child, context, indent + 1)).join("\n");
  return `${indentStr}<${tag} ${classAttr}="${classes}">
${childrenJSX}
${indentStr}</${tag}>`;
}
function renderListItem$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "list-item", node.props);
  const classAttr = context.useClassName ? "className" : "class";
  const childrenJSX = node.children ? node.children.map((child) => renderNode$1(child, context, 0)).join("") : escapeJSX(node.content || "");
  return `${indentStr}<li ${classAttr}="${classes}">${childrenJSX}</li>`;
}
function renderTable$1(node, context, indent) {
  var _a, _b;
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "table", node.props);
  const classAttr = context.useClassName ? "className" : "class";
  const headerNode = (_a = node.children) == null ? void 0 : _a.find((child) => child.type === "table-header");
  const rowNodes = ((_b = node.children) == null ? void 0 : _b.filter((child) => child.type === "table-row")) || [];
  const headerJSX = headerNode ? renderNode$1(headerNode, context, indent + 1) : "";
  const rowsJSX = rowNodes.map((child) => renderNode$1(child, context, indent + 2)).join("\n");
  const bodyJSX = rowsJSX ? `
${indentStr}  <tbody>
${rowsJSX}
${indentStr}  </tbody>` : "";
  return `${indentStr}<table ${classAttr}="${classes}">
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
  const classAttr = context.useClassName ? "className" : "class";
  const contentJSX = node.children && node.children.length > 0 ? node.children.map((child) => renderNode$1(child, context, 0)).join("") : escapeJSX(node.content || "");
  return `${indentStr}      <${tag} ${classAttr}="${classes}">${contentJSX}</${tag}>`;
}
function renderBlockquote$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "blockquote", node.props);
  const classAttr = context.useClassName ? "className" : "class";
  const childrenJSX = (node.children || []).map((child) => renderNode$1(child, context, indent + 1)).join("\n");
  return `${indentStr}<blockquote ${classAttr}="${classes}">
${childrenJSX}
${indentStr}</blockquote>`;
}
function renderCode$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const inline = node.inline !== false;
  const classAttr = context.useClassName ? "className" : "class";
  if (inline) {
    const classes = buildClasses(prefix, "code-inline", {});
    return `${indentStr}<code ${classAttr}="${classes}">${escapeJSX(node.value)}</code>`;
  } else {
    const classes = buildClasses(prefix, "code-block", {});
    const dataLang = node.lang ? ` data-lang="${escapeJSX(node.lang)}"` : "";
    return `${indentStr}<pre ${classAttr}="${classes}"><code${dataLang}>${escapeJSX(node.value)}</code></pre>`;
  }
}
function renderSeparator$1(node, context, indent) {
  const indentStr = repeatString("  ", indent);
  const { classPrefix: prefix } = context;
  const classes = buildClasses(prefix, "separator", node.props);
  const classAttr = context.useClassName ? "className" : "class";
  return `${indentStr}<hr ${classAttr}="${classes}" />`;
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
function escapeJSX(text) {
  if (!text) return "";
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/{/g, "&#123;").replace(/}/g, "&#125;");
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
  const attrs = [];
  if (node.props.width) attrs.push(`width="${node.props.width}"`);
  if (node.props.height) attrs.push(`height="${node.props.height}"`);
  return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="${classes}" ${attrs.join(" ")} />`;
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
function escapeHtml(text) {
  if (!text) return "";
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function renderToHTML(ast, options = {}) {
  const {
    style = "sketch",
    inlineStyles = true,
    pretty = true,
    classPrefix = "wmd-"
  } = options;
  const context = {
    classPrefix
  };
  const childrenHTML = ast.children.map((child) => renderNode$2(child, context)).join("\n");
  const css = inlineStyles ? getStyleCSS(style, classPrefix) : "";
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
export {
  render,
  renderToHTML,
  renderToJSON,
  renderToReact,
  renderToTailwind
};
//# sourceMappingURL=renderer.js.map

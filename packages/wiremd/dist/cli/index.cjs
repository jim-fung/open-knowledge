#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const fs = require("fs");
const path = require("path");
const url = require("url");
const parser = require("../index-DKyF7GVt.cjs");
const parser_includes = require("../parser/includes.cjs");
const renderer = require("../index-Bp-pZ8j_.cjs");
const types = require("../types-bdisTnhv.cjs");
const http = require("http");
const crypto = require("crypto");
const chokidar = require("chokidar");
const chalk = require("chalk");
var _documentCurrentScript = typeof document !== "undefined" ? document.currentScript : null;
const liveReloadScript = `
<style>
  /* Wiremd Live Preview UI */
  #wiremd-toolbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px;
  }

  #wiremd-toolbar .logo {
    font-weight: 600;
    font-size: 14px;
  }

#wiremd-toolbar .status {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    background: rgba(255,255,255,0.2);
    border-radius: 12px;
    font-size: 12px;
  }

  #wiremd-toolbar .status.connected {
    background: rgba(76, 175, 80, 0.3);
  }

  #wiremd-toolbar .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  #wiremd-toolbar .spacer {
    flex: 1;
  }

  #wiremd-toolbar .viewport-selector {
    display: flex;
    gap: 8px;
  }

  #wiremd-toolbar .viewport-btn {
    padding: 4px 10px;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 4px;
    color: white;
    cursor: pointer;
    font-size: 11px;
    transition: all 0.2s;
  }

  #wiremd-toolbar .viewport-btn:hover {
    background: rgba(255,255,255,0.25);
  }

  #wiremd-toolbar .viewport-btn.active {
    background: rgba(255,255,255,0.35);
    border-color: rgba(255,255,255,0.5);
  }

  #wiremd-error-overlay {
    display: none;
    position: fixed;
    top: 60px;
    left: 50%;
    transform: translateX(-50%);
    max-width: 800px;
    width: 90%;
    background: #ff5252;
    color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideDown 0.3s ease;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  #wiremd-error-overlay.show {
    display: block;
  }

  #wiremd-error-overlay h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
  }

  #wiremd-error-overlay pre {
    background: rgba(0,0,0,0.2);
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 12px;
    margin: 12px 0 0 0;
  }

  #wiremd-error-overlay .close-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    padding: 4px 8px;
    opacity: 0.8;
    transition: opacity 0.2s;
  }

  #wiremd-error-overlay .close-btn:hover {
    opacity: 1;
  }

  #wiremd-preview-wrapper {
    transition: padding 0.3s ease;
  }

  #wiremd-preview-wrapper.viewport-mobile {
    padding: 20px;
    display: flex;
    justify-content: center;
  }

  #wiremd-preview-wrapper.viewport-mobile > * {
    max-width: 375px;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
    border-radius: 8px;
    overflow: hidden;
  }

  #wiremd-preview-wrapper.viewport-tablet {
    padding: 20px;
    display: flex;
    justify-content: center;
  }

  #wiremd-preview-wrapper.viewport-tablet > * {
    max-width: 768px;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
    border-radius: 8px;
    overflow: hidden;
  }

  #wiremd-preview-wrapper.viewport-laptop {
    padding: 20px;
    display: flex;
    justify-content: center;
  }

  #wiremd-preview-wrapper.viewport-laptop > * {
    max-width: 1024px;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
    border-radius: 8px;
    overflow: hidden;
  }

  .wiremd-reload-indicator {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(102, 126, 234, 0.95);
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-size: 13px;
    display: none;
    animation: fadeIn 0.3s ease;
  }

  .wiremd-reload-indicator.show {
    display: block;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>

<div id="wiremd-toolbar">
  <div class="logo">⚡ Wiremd Live</div>
<div class="status" id="wiremd-status">
    <div class="status-dot"></div>
    <span>Connecting...</span>
  </div>
  <div class="spacer"></div>
  <div class="viewport-selector">
    <button class="viewport-btn active" data-viewport="full">Full</button>
    <button class="viewport-btn" data-viewport="laptop">💻 Laptop</button>
    <button class="viewport-btn" data-viewport="tablet">📱 Tablet</button>
    <button class="viewport-btn" data-viewport="mobile">📱 Mobile</button>
  </div>
</div>

<div id="wiremd-error-overlay">
  <button class="close-btn" onclick="this.parentElement.classList.remove('show')">×</button>
  <h3>⚠️ Render Error</h3>
  <div id="wiremd-error-message"></div>
</div>

<div class="wiremd-reload-indicator" id="wiremd-reload-indicator">
  🔄 Reloading preview...
</div>

<script>
  // Enhanced live-reload client with error handling
  (function() {
    let retryCount = 0;
    const maxRetries = 10;
    let ws = null;

    // Wrap existing content in preview wrapper
    const body = document.body;
    const wrapper = document.createElement('div');
    wrapper.id = 'wiremd-preview-wrapper';
    wrapper.className = 'viewport-full';
    while (body.firstChild && body.firstChild.id !== 'wiremd-toolbar' && body.firstChild.id !== 'wiremd-error-overlay' && body.firstChild.id !== 'wiremd-reload-indicator') {
      wrapper.appendChild(body.firstChild);
    }
    body.appendChild(wrapper);

    body.style.paddingTop = '56px';

    const statusEl = document.getElementById('wiremd-status');
    const errorOverlay = document.getElementById('wiremd-error-overlay');
    const errorMessage = document.getElementById('wiremd-error-message');
    const reloadIndicator = document.getElementById('wiremd-reload-indicator');


    // Viewport switcher
    document.querySelectorAll('.viewport-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.viewport-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const viewport = btn.dataset.viewport;
        wrapper.className = 'viewport-' + viewport;
      });
    });

    function updateStatus(connected) {
      if (connected) {
        statusEl.className = 'status connected';
        statusEl.innerHTML = '<div class="status-dot"></div><span>Connected</span>';
      } else {
        statusEl.className = 'status';
        statusEl.innerHTML = '<div class="status-dot"></div><span>Disconnected</span>';
      }
    }

    function showError(message) {
      errorMessage.textContent = message;
      errorOverlay.classList.add('show');
      setTimeout(() => {
        errorOverlay.classList.remove('show');
      }, 8000);
    }

    function connect() {
      // Derive host from the page location so LAN IP / container / tunnel
      // access connects to the right server instead of always localhost.
      ws = new WebSocket(
        (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/__ws'
      );

      ws.onopen = () => {
        console.log('[wiremd] Connected to live-reload server');
        updateStatus(true);
        retryCount = 0;
      };

      ws.onmessage = (event) => {
        const data = event.data;

        if (data === 'reload') {
          console.log('[wiremd] Reloading...');
          reloadIndicator.classList.add('show');
          setTimeout(() => {
            window.location.reload();
          }, 300);
        } else if (data.startsWith('error:')) {
          const errorMsg = data.substring(6);
          showError(errorMsg);
        }
      };

      ws.onclose = () => {
        updateStatus(false);
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(\`[wiremd] Reconnecting... (\${retryCount}/\${maxRetries})\`);
          setTimeout(connect, 1000);
        } else {
          showError('Lost connection to dev server. Please restart the server.');
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    // Handle page errors
    window.addEventListener('error', (event) => {
      console.error('[wiremd] Page error:', event.error);
    });
  })();
<\/script>
`;
let activeWsClients = /* @__PURE__ */ new Set();
function buildTree(dir, base, depth = 0) {
  const node = { dirs: {}, files: [] };
  if (depth > 32) return node;
  let entries;
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return node;
  }
  for (const entry of entries.sort()) {
    if (entry.startsWith("_") || entry.startsWith(".") || entry === "node_modules") continue;
    const full = path.join(dir, entry);
    let stat;
    try {
      stat = fs.statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      node.dirs[entry] = buildTree(full, base, depth + 1);
    } else if (entry.endsWith(".md")) {
      node.files.push(path.relative(base, full));
    }
  }
  return node;
}
function renderTree(node, depth = 0) {
  const parts = [];
  for (const file of node.files) {
    const name = file.split("/").pop();
    const href = file.split("/").map(encodeURIComponent).join("/");
    parts.push(`<li class="file"><a href="/${href}">${name}</a></li>`);
  }
  for (const [dirName, child] of Object.entries(node.dirs)) {
    const inner = renderTree(child, depth + 1);
    if (inner) {
      const open = depth === 0 ? " open" : "";
      parts.push(`<li class="dir"><details${open}><summary>${dirName}</summary><ul>${inner}</ul></details></li>`);
    }
  }
  return parts.join("");
}
function renderIndex(rootDir) {
  const tree = buildTree(rootDir, rootDir);
  const inner = renderTree(tree);
  const dirName = rootDir.split("/").pop();
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>wiremd</title>
<style>
body{font-family:system-ui,sans-serif;max-width:480px;margin:60px auto;padding:0 20px;color:#222}
h1{font-size:1rem;color:#888;margin-bottom:1rem;font-weight:500}
ul{list-style:none;padding:0;margin:0}
li{margin:0}
li.dir{margin-top:4px}
details>ul{padding-left:16px;border-left:1px solid #e0e0e0;margin:2px 0 2px 8px}
summary{cursor:pointer;padding:6px 8px;border-radius:4px;font-size:0.85rem;font-weight:600;color:#555;user-select:none;list-style:none}
summary:hover{background:#f5f5f5}
summary::before{content:'▸ ';font-size:0.75em;color:#aaa}
details[open]>summary::before{content:'▾ '}
a{display:block;padding:5px 8px;border-radius:4px;color:#333;text-decoration:none;font-size:0.9rem}
a:hover{background:#f0f0f0}
</style>
</head><body><h1>${dirName}/</h1><ul>${inner}</ul></body></html>`;
}
function startServer(options) {
  const { port, outputPath, renderFile, inputFile } = options;
  const rootDir = options.rootDir || (outputPath ? path.dirname(outputPath) : process.cwd());
  const wsClients = /* @__PURE__ */ new Set();
  activeWsClients = wsClients;
  const injectScript = (html) => {
    const idx = html.lastIndexOf("</body>");
    if (idx === -1) return html + liveReloadScript;
    return html.slice(0, idx) + liveReloadScript + "\n</body>" + html.slice(idx + "</body>".length);
  };
  const server = http.createServer((req, res) => {
    if (req.url === "/__ws") {
      res.writeHead(426, { "Content-Type": "text/plain" });
      res.end("This endpoint requires WebSocket upgrade");
      return;
    }
    const urlPath = (req.url || "/").split("?")[0];
    let html = null;
    if (urlPath === "/" || urlPath === "") {
      if (inputFile) {
        res.writeHead(302, { Location: `/${inputFile}` });
        res.end();
        return;
      }
      if (!outputPath) {
        try {
          html = renderIndex(rootDir);
        } catch (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end(`Error listing ${rootDir}: ${err.message}`);
          return;
        }
        res.writeHead(200, { "Content-Type": "text/html", "Cache-Control": "no-cache, no-store, must-revalidate" });
        res.end(injectScript(html));
        return;
      }
      try {
        html = fs.readFileSync(outputPath, "utf-8");
      } catch {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end(`Error reading: ${outputPath}`);
        return;
      }
    } else if (renderFile) {
      let requestedFile;
      try {
        requestedFile = decodeURIComponent(urlPath.replace(/^\//, ""));
      } catch {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end(`Bad request: malformed URL encoding in ${urlPath}`);
        return;
      }
      const targetPath = path.join(rootDir, requestedFile);
      if (targetPath.endsWith(".md") && fs.existsSync(targetPath)) {
        try {
          html = renderFile(targetPath);
        } catch (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end(`Error rendering ${targetPath}: ${err.message}`);
          return;
        }
      } else if (targetPath.endsWith(".html")) {
        if (fs.existsSync(targetPath)) {
          try {
            html = fs.readFileSync(targetPath, "utf-8");
          } catch {
          }
        }
        if (!html) {
          const mdPath = targetPath.replace(/\.html$/, ".md");
          if (fs.existsSync(mdPath)) {
            try {
              html = renderFile(mdPath);
            } catch (err) {
              res.writeHead(500, { "Content-Type": "text/plain" });
              res.end(`Error rendering ${mdPath}: ${err.message}`);
              return;
            }
          }
        }
      } else {
        const dirIndex = path.join(rootDir, requestedFile, "index.md");
        if (fs.existsSync(dirIndex)) {
          try {
            html = renderFile(dirIndex);
          } catch (err) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end(`Error rendering ${dirIndex}: ${err.message}`);
            return;
          }
        }
      }
    }
    if (!html) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end(`Not found: ${urlPath}`);
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html", "Cache-Control": "no-cache, no-store, must-revalidate" });
    res.end(injectScript(html));
  });
  server.on("upgrade", (req, socket, _head) => {
    if (req.url === "/__ws") {
      const key = req.headers["sec-websocket-key"];
      const hash = crypto.createHash("sha1").update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest("base64");
      socket.write(
        `HTTP/1.1 101 Switching Protocols\r
Upgrade: websocket\r
Connection: Upgrade\r
Sec-WebSocket-Accept: ${hash}\r
\r
`
      );
      wsClients.add(socket);
      socket.on("close", () => {
        wsClients.delete(socket);
      });
      socket.on("error", () => {
        wsClients.delete(socket);
      });
    } else {
      socket.destroy();
    }
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${port} is already in use. Stop the other process or choose another port: wiremd --serve <port>`);
    } else {
      console.error(`❌ Dev server error: ${err.message}`);
    }
  });
  server.listen(port, () => {
    console.log(`🚀 Dev server running at http://localhost:${port}`);
    console.log(`📡 Live-reload enabled`);
    console.log(`Press Ctrl+C to stop`);
  });
  return server;
}
function notifyReload() {
  sendMessageToClients("reload");
}
function notifyError(errorMessage) {
  sendMessageToClients(`error:${errorMessage}`);
}
function sendMessageToClients(message) {
  const payload = Buffer.from(message, "utf-8");
  const len = payload.length;
  let header;
  if (len <= 125) {
    header = Buffer.from([129, len]);
  } else if (len <= 65535) {
    header = Buffer.alloc(4);
    header[0] = 129;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 129;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }
  const frame = Buffer.concat([header, payload]);
  activeWsClients.forEach((socket) => {
    try {
      socket.write(frame);
    } catch {
      activeWsClients.delete(socket);
    }
  });
}
const DEPRECATED_STYLES = ["sketch", "clean", "wireframe", "none", "tailwind", "material", "brutal"];
function warnIfDeprecatedStyle(style, log) {
  if (DEPRECATED_STYLES.includes(style)) {
    log.style(`Style '${style}' is deprecated and will be removed in the next major release — use --style coss`);
  }
}
function showHelp() {
  console.log(`
┌─────────────────────────────────────────────────────────────────┐
│  wiremd - Text-first UI design tool                            │
│  Generate wireframes from Markdown syntax                       │
└─────────────────────────────────────────────────────────────────┘

USAGE:
  wiremd <input.md> [options]

OPTIONS:
  -o, --output <file>        Output file path (default: <input>.html)
  -f, --format <format>      Output format: html, json (default: html)
  -s, --style <style>        Visual style: coss (default), or deprecated: sketch, clean, wireframe, none, tailwind, material, brutal
  --codegen <format>         Code format for coss demo code panes: html, jsx (default: html)
  -w, --watch                Watch for changes and regenerate
  --serve <port>             Start dev server with live-reload (default: 3000)
  --watch-pattern <pattern>  Glob pattern for files to watch (e.g., "**/*.md")
  --ignore <pattern>         Glob pattern for files to ignore (e.g., "**/node_modules/**")
  -p, --pretty               Pretty print output (default: true)
  -h, --help                 Show this help message
  -v, --version              Show version number

EXAMPLES:
  # Generate HTML with the default coss style
  wiremd wireframe.md

  # Output to specific file
  wiremd wireframe.md -o output.html

  # Use a deprecated legacy style (warns; removed next major)
  wiremd wireframe.md --style sketch

  # Watch mode with live-reload
  wiremd wireframe.md --watch --serve 3000

  # Watch multiple files with pattern
  wiremd wireframe.md --watch --watch-pattern "src/**/*.md"

  # Generate JSON output
  wiremd wireframe.md --format json

STYLES:
  coss       - Cal.com-inspired neutral design system (default)
  Deprecated (removed next major):
  sketch     - Balsamiq-inspired hand-drawn look
  clean      - Modern minimal design
  wireframe  - Traditional grayscale with hatching
  none       - Unstyled semantic HTML
  tailwind   - Modern utility-first design with purple accents
  material   - Google Material Design with elevation system
  brutal     - Neo-brutalism with bold colors and thick borders

For more information: https://github.com/akonan/wiremd
`);
}
function showVersion() {
  try {
    const currentDir = (typeof document === "undefined" ? require("url").pathToFileURL(__filename).href : _documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === "SCRIPT" && _documentCurrentScript.src || new URL("cli/index.cjs", document.baseURI).href) ? path.dirname(new URL(typeof document === "undefined" ? require("url").pathToFileURL(__filename).href : _documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === "SCRIPT" && _documentCurrentScript.src || new URL("cli/index.cjs", document.baseURI).href).pathname) : __dirname;
    const pkgPath = path.resolve(currentDir, "../../package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    console.log(`wiremd v${pkg.version}`);
  } catch {
    console.log(`wiremd v${parser.VERSION}`);
  }
}
function readFlagValue(args, i, flag) {
  const value = args[i + 1];
  if (value === void 0 || value.startsWith("-")) {
    console.error(`Error: ${flag} requires a value`);
    process.exit(1);
  }
  return { value, next: i + 1 };
}
function parseArgs(args) {
  const options = {
    input: "",
    format: "html",
    style: "coss",
    pretty: true
  };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "-h":
      case "--help":
        showHelp();
        return null;
      case "-v":
      case "--version":
        showVersion();
        return null;
      case "-o":
      case "--output": {
        const { value, next } = readFlagValue(args, i, arg);
        options.output = value;
        i = next;
        break;
      }
      case "-f":
      case "--format": {
        const { value: format } = readFlagValue(args, i, arg);
        if (format !== "html" && format !== "json") {
          console.error(`Error: Invalid format "${format}". Must be html or json.`);
          process.exit(1);
        }
        options.format = format;
        break;
      }
      case "-s":
      case "--style": {
        const { value: style } = readFlagValue(args, i, arg);
        if (!types.WIREMD_STYLES.includes(style)) {
          console.error(`Error: Invalid style "${style}". Must be one of: ${types.WIREMD_STYLES.join(", ")}.`);
          process.exit(1);
        }
        options.style = style;
        break;
      }
      case "--codegen": {
        const { value: codegen, next } = readFlagValue(args, i, arg);
        if (codegen !== "html" && codegen !== "jsx") {
          console.error(`Error: Invalid codegen "${codegen}". Must be html or jsx.`);
          process.exit(1);
        }
        options.codegen = codegen;
        i = next;
        break;
      }
      case "-w":
      case "--watch":
        options.watch = true;
        break;
      case "--serve": {
        const { value } = readFlagValue(args, i, arg);
        const port = parseInt(value, 10);
        if (isNaN(port) || !Number.isInteger(port) || port < 1 || port > 65535) {
          console.error("Error: --serve requires a port between 1 and 65535");
          process.exit(1);
        }
        options.serve = port;
        break;
      }
      case "--watch-pattern": {
        const { value, next } = readFlagValue(args, i, arg);
        options.watchPattern = value;
        i = next;
        break;
      }
      case "--ignore": {
        const { value, next } = readFlagValue(args, i, arg);
        options.ignorePattern = value;
        i = next;
        break;
      }
      case "-p":
      case "--pretty":
        options.pretty = true;
        break;
      default:
        if (arg.startsWith("-")) {
          console.error(`Error: Unknown option "${arg}"`);
          console.error('Run "wiremd --help" for usage information.');
          process.exit(1);
        }
        if (!options.input) {
          options.input = arg;
        }
    }
  }
  if (!options.input) {
    console.error("Error: No input file specified");
    console.error('Run "wiremd --help" for usage information.');
    process.exit(1);
  }
  return options;
}
const logger = {
  info: (msg) => console.log(chalk.blue("ℹ"), msg),
  success: (msg) => console.log(chalk.green("✓"), msg),
  warning: (msg) => console.log(chalk.yellow("⚠"), msg),
  error: (msg) => console.log(chalk.red("✗"), msg),
  watching: (msg) => console.log(chalk.cyan("👀"), msg),
  changed: (msg) => console.log(chalk.magenta("📝"), msg),
  style: (msg) => console.log(chalk.gray("🎨"), msg),
  format: (msg) => console.log(chalk.gray("📦"), msg)
};
function checkFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const fileSizeMB = stats.size / (1024 * 1024);
    if (fileSizeMB > 10) {
      logger.warning(`Large file detected (${fileSizeMB.toFixed(2)}MB). Processing may take longer.`);
    }
  } catch (error) {
  }
}
function generateOutput(options) {
  const { input, format, style, pretty, codegen } = options;
  if (!fs.existsSync(input)) {
    throw new Error(`File not found: ${input}`);
  }
  checkFileSize(input);
  const raw = fs.readFileSync(input, "utf-8");
  const markdown = parser_includes.resolveIncludes(raw, path.resolve(input));
  const ast = parser.parse(markdown);
  if (format === "json") {
    return renderer.renderToJSON(ast, { pretty });
  } else {
    const renderOptions = {
      style,
      pretty,
      inlineStyles: true
    };
    if (codegen !== void 0) {
      renderOptions.codegen = codegen;
    }
    return renderer.renderToHTML(ast, renderOptions);
  }
}
function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Error: No input file specified");
    console.error('Run "wiremd --help" for usage information.\n');
    process.exit(1);
  }
  const options = parseArgs(args);
  if (!options) {
    process.exit(0);
  }
  if (options.style) {
    warnIfDeprecatedStyle(options.style, logger);
  }
  const inputIsDir = fs.existsSync(options.input) && fs.statSync(options.input).isDirectory();
  if (inputIsDir) {
    if (!options.serve && !options.watch) {
      console.error("Error: Directory input requires --serve or --watch");
      process.exit(1);
    }
    const rootDir = path.resolve(options.input);
    logger.watching(`Watching: ${chalk.bold(options.input)}`);
    if (options.serve) {
      const indexFile = fs.existsSync(path.join(rootDir, "index.md")) ? "index.md" : void 0;
      startServer({
        port: options.serve,
        rootDir,
        inputFile: indexFile,
        renderFile: (mdPath) => generateOutput({ ...options, input: mdPath })
      });
      console.log("");
    }
    const ignorePatterns = [
      "**/node_modules/**",
      "**/.git/**",
      "**/dist/**",
      "**/build/**",
      ...options.ignorePattern ? [options.ignorePattern] : []
    ];
    const watchPaths = options.watchPattern ? [options.watchPattern] : [path.join(rootDir, "**/*.md")];
    logger.info(`Ignoring: ${chalk.gray(ignorePatterns.join(", "))}`);
    console.log("");
    const watcher = chokidar.watch(watchPaths, {
      ignored: ignorePatterns,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 50 }
    });
    watcher.on("change", (path2) => {
      logger.changed(`${chalk.bold("changed")}: ${chalk.dim(path2.replace(process.cwd(), "."))}`);
      if (options.serve) notifyReload();
    }).on("add", (path2) => {
      logger.info(`New file: ${chalk.dim(path2.replace(process.cwd(), "."))}`);
      if (options.serve) notifyReload();
    }).on("unlink", (path2) => {
      logger.warning(`Removed: ${chalk.dim(path2.replace(process.cwd(), "."))}`);
      if (options.serve) notifyReload();
    }).on("ready", () => logger.info("Watcher ready. Press Ctrl+C to stop."));
    return;
  }
  if (!options.output) {
    const ext = options.format === "json" ? ".json" : ".html";
    options.output = options.input.replace(/\.md$/, ext);
  }
  if (options.watch || options.serve) {
    logger.watching(`Watching: ${chalk.bold(options.input)}`);
    try {
      const output = generateOutput(options);
      fs.writeFileSync(options.output, output, "utf-8");
      logger.success(`Generated: ${chalk.bold(options.output)}`);
      logger.style(`Style: ${chalk.bold(options.style)}`);
      logger.format(`Format: ${chalk.bold(options.format)}`);
      console.log("");
    } catch (error) {
      logger.error(`Initial generation failed: ${error.message}`);
    }
    if (options.serve) {
      const port = options.serve;
      startServer({
        port,
        outputPath: options.output,
        renderFile: (mdPath) => generateOutput({ ...options, input: mdPath }),
        rootDir: path.dirname(options.input),
        inputFile: path.basename(options.input)
      });
      console.log("");
    }
    const watchPaths = [];
    const ignorePatterns = [
      "**/node_modules/**",
      "**/.git/**",
      "**/dist/**",
      "**/build/**"
    ];
    if (options.ignorePattern) {
      ignorePatterns.push(options.ignorePattern);
    }
    if (options.watchPattern) {
      watchPaths.push(options.watchPattern);
      logger.info(`Watch pattern: ${chalk.bold(options.watchPattern)}`);
    } else {
      watchPaths.push(options.input);
      const inputDir = path.dirname(options.input);
      watchPaths.push(path.join(inputDir, "**/*.md"));
    }
    logger.info(`Ignoring: ${chalk.gray(ignorePatterns.join(", "))}`);
    console.log("");
    const watcher = chokidar.watch(watchPaths, {
      ignored: ignorePatterns,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50
      },
      // Performance optimizations
      usePolling: false,
      // Use native fs.watch for better performance
      interval: 100,
      binaryInterval: 300
    });
    let isProcessing = false;
    let pendingRegeneration = false;
    const regenerate = async (filePath, event) => {
      if (isProcessing) {
        pendingRegeneration = true;
        return;
      }
      isProcessing = true;
      pendingRegeneration = false;
      try {
        const relativePath = filePath.replace(process.cwd(), ".");
        logger.changed(`${chalk.bold(event)}: ${chalk.dim(relativePath)}`);
        if (!fs.existsSync(options.input)) {
          logger.warning("Input file deleted. Waiting for it to be restored...");
          isProcessing = false;
          return;
        }
        const output = generateOutput(options);
        fs.writeFileSync(options.output, output, "utf-8");
        const timestamp = chalk.dim((/* @__PURE__ */ new Date()).toLocaleTimeString());
        logger.success(`Regenerated: ${chalk.bold(options.output)} ${timestamp}`);
        if (options.serve) {
          notifyReload();
        }
      } catch (error) {
        logger.error(`${error.message}`);
        if (error.stack) {
          console.log(chalk.dim(error.stack.split("\n").slice(1, 4).join("\n")));
        }
        if (options.serve) {
          notifyError(error.message);
        }
        logger.info("Watching for changes to retry...");
      } finally {
        isProcessing = false;
        if (pendingRegeneration) {
          setTimeout(() => regenerate(filePath, event), 50);
        }
      }
    };
    watcher.on("change", (path2) => regenerate(path2, "changed")).on("add", (path2) => {
      logger.info(`New file detected: ${chalk.dim(path2.replace(process.cwd(), "."))}`);
      regenerate(path2, "added");
    }).on("unlink", (path2) => {
      const relativePath = path2.replace(process.cwd(), ".");
      logger.warning(`File removed: ${chalk.dim(relativePath)}`);
      if (path2 === options.input) {
        logger.warning("Main input file deleted. Waiting for restoration...");
        if (options.serve) {
          notifyError(`Input file removed: ${relativePath}`);
        }
      }
    }).on("error", (error) => {
      logger.error(`Watcher error: ${error.message}`);
    }).on("ready", () => {
      logger.info(chalk.green("Watcher ready. Press Ctrl+C to stop."));
    });
    const shutdown = () => {
      console.log("");
      logger.info("Stopping watch mode...");
      watcher.close().then(() => {
        logger.success("Watch mode stopped.");
        process.exit(0);
      });
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
    return;
  }
  logger.info(`Parsing: ${chalk.bold(options.input)}`);
  try {
    const output = generateOutput(options);
    fs.writeFileSync(options.output, output, "utf-8");
    logger.success(`Generated: ${chalk.bold(options.output)}`);
    logger.style(`Style: ${chalk.bold(options.style)}`);
    logger.format(`Format: ${chalk.bold(options.format)}`);
  } catch (error) {
    logger.error(`Generation failed: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}
const isMainModule = process.argv[1] !== void 0 && (typeof document === "undefined" ? require("url").pathToFileURL(__filename).href : _documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === "SCRIPT" && _documentCurrentScript.src || new URL("cli/index.cjs", document.baseURI).href) === url.pathToFileURL(process.argv[1]).href;
if (isMainModule) {
  main();
}
exports.checkFileSize = checkFileSize;
exports.generateOutput = generateOutput;
exports.main = main;
exports.parseArgs = parseArgs;
exports.showHelp = showHelp;
exports.showVersion = showVersion;
exports.warnIfDeprecatedStyle = warnIfDeprecatedStyle;

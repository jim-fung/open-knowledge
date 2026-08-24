/**
 * wiremd - Text-first UI design tool
 * Parse markdown-based UI mockup syntax and render to HTML/JSON
 *
 * Copyright (c) 2025 wiremd
 * Licensed under MIT License
 * https://github.com/akonan/wiremd/blob/main/LICENSE
 *
 * @packageDocumentation
 */
export * from './types.js';
export * from './diagnostics.js';
export * from './parser/index.js';
export * from './renderer/index.js';
export { VERSION, SYNTAX_VERSION } from './version.js';
export { generateCode } from './codegen/coss/index.js';
export type { CodegenFormat, CodegenInput, CodegenOptions } from './codegen/coss/types.js';
//# sourceMappingURL=index.d.ts.map
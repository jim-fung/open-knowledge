import { NodeEmitter } from '../types.js';
import { WiremdNode } from '../../../types.js';

export declare const emitButton: NodeEmitter<Extract<WiremdNode, {
    type: 'button';
}>>;
export declare const emitBadge: NodeEmitter<Extract<WiremdNode, {
    type: 'badge';
}>>;
/**
 * Inline SVG circle placeholder for the named icon, wrapped in a labelled
 * span. SVG presentation attributes are kebab-case in HTML and camelCase in
 * JSX (`viewBox` is already camelCase in both).
 */
export declare const emitIcon: NodeEmitter<Extract<WiremdNode, {
    type: 'icon';
}>>;
export declare const emitCheckbox: NodeEmitter<Extract<WiremdNode, {
    type: 'checkbox';
}>>;
//# sourceMappingURL=actions.d.ts.map
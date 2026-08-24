import { NodeEmitter } from '../types.js';
import { WiremdNode } from '../../../types.js';

type ContainerNode = Extract<WiremdNode, {
    type: 'container';
}>;
type GridNode = Extract<WiremdNode, {
    type: 'grid';
}>;
type GridItemNode = Extract<WiremdNode, {
    type: 'grid-item';
}>;
type RowNode = Extract<WiremdNode, {
    type: 'row';
}>;
type DemoNode = Extract<WiremdNode, {
    type: 'demo';
}>;
export declare const emitContainer: NodeEmitter<ContainerNode>;
export declare const emitGrid: NodeEmitter<GridNode>;
export declare const emitGridItem: NodeEmitter<GridItemNode>;
export declare const emitRow: NodeEmitter<RowNode>;
/** `demo` emits its children as an ordered fragment - no wrapper element, `raw` ignored. */
export declare const emitDemo: NodeEmitter<DemoNode>;
export {};
//# sourceMappingURL=layout.d.ts.map
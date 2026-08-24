import { NodeEmitter } from '../types.js';
import { WiremdNode } from '../../../types.js';

export declare const emitDialog: NodeEmitter<Extract<WiremdNode, {
    type: 'dialog';
}>>;
export declare const emitAlertDialog: NodeEmitter<Extract<WiremdNode, {
    type: 'alert-dialog';
}>>;
export declare const emitSheet: NodeEmitter<Extract<WiremdNode, {
    type: 'sheet';
}>>;
export declare const emitDrawer: NodeEmitter<Extract<WiremdNode, {
    type: 'drawer';
}>>;
export declare const emitPopover: NodeEmitter<Extract<WiremdNode, {
    type: 'popover';
}>>;
export declare const emitTooltip: NodeEmitter<Extract<WiremdNode, {
    type: 'tooltip';
}>>;
export declare const emitPreviewCard: NodeEmitter<Extract<WiremdNode, {
    type: 'preview-card';
}>>;
//# sourceMappingURL=overlays.d.ts.map
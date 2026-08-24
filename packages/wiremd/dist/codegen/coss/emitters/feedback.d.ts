import { NodeEmitter } from '../types.js';
import { WiremdNode } from '../../../types.js';

export declare const emitAlert: NodeEmitter<Extract<WiremdNode, {
    type: 'container';
}>>;
export declare const emitToast: NodeEmitter<Extract<WiremdNode, {
    type: 'toast';
}>>;
export declare const emitSkeleton: NodeEmitter<Extract<WiremdNode, {
    type: 'skeleton';
}>>;
export declare const emitSpinner: NodeEmitter<Extract<WiremdNode, {
    type: 'spinner';
}>>;
export declare const emitKbd: NodeEmitter<Extract<WiremdNode, {
    type: 'kbd';
}>>;
export declare const emitProgress: NodeEmitter<Extract<WiremdNode, {
    type: 'progress';
}>>;
export declare const emitMeter: NodeEmitter<Extract<WiremdNode, {
    type: 'meter';
}>>;
//# sourceMappingURL=feedback.d.ts.map
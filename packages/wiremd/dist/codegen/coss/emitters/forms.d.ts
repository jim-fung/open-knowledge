import { NodeEmitter } from '../types.js';
import { WiremdNode } from '../../../types.js';

export declare const emitInput: NodeEmitter<Extract<WiremdNode, {
    type: 'input';
}>>;
export declare const emitTextarea: NodeEmitter<Extract<WiremdNode, {
    type: 'textarea';
}>>;
export declare const emitSelect: NodeEmitter<Extract<WiremdNode, {
    type: 'select';
}>>;
export declare const emitRadio: NodeEmitter<Extract<WiremdNode, {
    type: 'radio';
}>>;
export declare const emitRadioGroup: NodeEmitter<Extract<WiremdNode, {
    type: 'radio-group';
}>>;
//# sourceMappingURL=forms.d.ts.map
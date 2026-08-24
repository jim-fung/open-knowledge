import { NodeEmitter } from '../types.js';
import { WiremdNode } from '../../../types.js';

type AvatarNode = Extract<WiremdNode, {
    type: 'avatar';
}>;
export declare const emitAvatar: NodeEmitter<AvatarNode>;
type FrameNode = Extract<WiremdNode, {
    type: 'frame';
}>;
export declare const emitFrame: NodeEmitter<FrameNode>;
type GroupNode = Extract<WiremdNode, {
    type: 'group';
}>;
export declare const emitGroup: NodeEmitter<GroupNode>;
type EmptyNode = Extract<WiremdNode, {
    type: 'empty';
}>;
export declare const emitEmpty: NodeEmitter<EmptyNode>;
type CalendarNode = Extract<WiremdNode, {
    type: 'calendar';
}>;
export declare const emitCalendar: NodeEmitter<CalendarNode>;
type DatePickerNode = Extract<WiremdNode, {
    type: 'date-picker';
}>;
export declare const emitDatePicker: NodeEmitter<DatePickerNode>;
export {};
//# sourceMappingURL=display.d.ts.map
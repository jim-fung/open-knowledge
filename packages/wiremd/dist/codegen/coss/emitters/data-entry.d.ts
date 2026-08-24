import { NodeEmitter } from '../types.js';
import { WiremdNode } from '../../../types.js';

type FormNode = Extract<WiremdNode, {
    type: 'form';
}>;
type FieldNode = Extract<WiremdNode, {
    type: 'field';
}>;
type FieldsetNode = Extract<WiremdNode, {
    type: 'fieldset';
}>;
type LabelNode = Extract<WiremdNode, {
    type: 'label';
}>;
type InputGroupNode = Extract<WiremdNode, {
    type: 'input-group';
}>;
type OtpFieldNode = Extract<WiremdNode, {
    type: 'otp-field';
}>;
type NumberFieldNode = Extract<WiremdNode, {
    type: 'number-field';
}>;
type AutocompleteNode = Extract<WiremdNode, {
    type: 'autocomplete';
}>;
type ComboboxNode = Extract<WiremdNode, {
    type: 'combobox';
}>;
type CommandNode = Extract<WiremdNode, {
    type: 'command';
}>;
type CheckboxGroupNode = Extract<WiremdNode, {
    type: 'checkbox-group';
}>;
type ToggleGroupNode = Extract<WiremdNode, {
    type: 'toggle-group';
}>;
type SwitchNode = Extract<WiremdNode, {
    type: 'switch';
}>;
type SliderNode = Extract<WiremdNode, {
    type: 'slider';
}>;
type ToggleNode = Extract<WiremdNode, {
    type: 'toggle';
}>;
export declare const emitForm: NodeEmitter<FormNode>;
export declare const emitField: NodeEmitter<FieldNode>;
export declare const emitFieldset: NodeEmitter<FieldsetNode>;
export declare const emitLabel: NodeEmitter<LabelNode>;
export declare const emitInputGroup: NodeEmitter<InputGroupNode>;
export declare const emitOtpField: NodeEmitter<OtpFieldNode>;
export declare const emitNumberField: NodeEmitter<NumberFieldNode>;
export declare const emitAutocomplete: NodeEmitter<AutocompleteNode>;
export declare const emitCombobox: NodeEmitter<ComboboxNode>;
export declare const emitCommand: NodeEmitter<CommandNode>;
export declare const emitCheckboxGroup: NodeEmitter<CheckboxGroupNode>;
export declare const emitToggleGroup: NodeEmitter<ToggleGroupNode>;
export declare const emitSwitch: NodeEmitter<SwitchNode>;
export declare const emitSlider: NodeEmitter<SliderNode>;
export declare const emitToggle: NodeEmitter<ToggleNode>;
export {};
//# sourceMappingURL=data-entry.d.ts.map
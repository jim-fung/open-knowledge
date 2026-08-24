/**
 * wiremd AST and JSON Schema Type Definitions (Simplified)
 * Version: 0.1
 *
 * Copyright (c) 2025 wiremd
 * Licensed under the MIT License
 * https://github.com/akonan/wiremd/blob/main/LICENSE
 */
export interface Position {
    line: number;
    column: number;
    offset?: number;
}
export interface Location {
    start: Position;
    end: Position;
}
export interface ComponentProps {
    classes?: string[];
    state?: 'disabled' | 'loading' | 'active' | 'error' | 'success' | 'warning';
    [key: string]: unknown;
}
export interface DocumentMeta {
    title?: string;
    description?: string;
    viewport?: 'mobile' | 'tablet' | 'desktop' | 'auto';
    theme?: WiremdStyle;
    version?: string;
}
export interface DocumentNode {
    type: 'document';
    version: string;
    meta: DocumentMeta;
    children: WiremdNode[];
    position?: Location;
}
export type WiremdNode = {
    type: 'container';
    containerType: 'hero' | 'card' | 'modal' | 'sidebar' | 'footer' | 'alert' | 'grid' | 'layout' | 'section' | 'form-group' | 'button-group';
    props: ComponentProps;
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'nav';
    props: ComponentProps;
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'nav-item';
    content?: string;
    children?: WiremdNode[];
    href?: string;
    props: ComponentProps;
    position?: Location;
} | {
    type: 'brand';
    children: WiremdNode[];
    props: ComponentProps;
    position?: Location;
} | {
    type: 'grid';
    columns: number;
    props: ComponentProps;
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'grid-item';
    props: ComponentProps;
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'row';
    props: ComponentProps;
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'button';
    content?: string;
    children?: WiremdNode[];
    href?: string;
    props: ComponentProps & {
        variant?: 'primary' | 'secondary' | 'danger';
        type?: 'button' | 'submit' | 'reset';
    };
    position?: Location;
} | {
    type: 'input';
    props: ComponentProps & {
        inputType?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'date' | 'time' | 'datetime-local' | 'search';
        placeholder?: string;
        value?: string;
        required?: boolean;
        disabled?: boolean;
        pattern?: string;
        min?: number | string;
        max?: number | string;
        step?: number | string;
        width?: number;
    };
    position?: Location;
} | {
    type: 'textarea';
    props: ComponentProps & {
        placeholder?: string;
        rows?: number;
        cols?: number;
        required?: boolean;
        disabled?: boolean;
        value?: string;
    };
    position?: Location;
} | {
    type: 'select';
    props: ComponentProps & {
        placeholder?: string;
        required?: boolean;
        disabled?: boolean;
        multiple?: boolean;
        value?: string;
    };
    options: Array<{
        type: 'option';
        value: string;
        label: string;
        selected?: boolean;
        position?: Location;
    }>;
    position?: Location;
} | {
    type: 'option';
    value: string;
    label: string;
    selected?: boolean;
    position?: Location;
} | {
    type: 'checkbox';
    label?: string;
    children?: WiremdNode[];
    checked: boolean;
    props: ComponentProps & {
        required?: boolean;
        disabled?: boolean;
        value?: string;
    };
    position?: Location;
} | {
    type: 'radio';
    label: string;
    selected: boolean;
    props: ComponentProps & {
        name?: string;
        value?: string;
        required?: boolean;
        disabled?: boolean;
    };
    children?: WiremdNode[];
    position?: Location;
} | {
    type: 'radio-group';
    name?: string;
    props: ComponentProps;
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'form';
    props: ComponentProps & {
        action?: string;
        method?: 'get' | 'post';
    };
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'heading';
    level: 1 | 2 | 3 | 4 | 5 | 6;
    content?: string;
    children?: WiremdNode[];
    props: ComponentProps;
    position?: Location;
} | {
    type: 'paragraph';
    content?: string;
    children?: WiremdNode[];
    props: ComponentProps;
    position?: Location;
} | {
    type: 'text';
    content: string;
    props?: ComponentProps;
    position?: Location;
} | {
    type: 'image';
    src: string;
    alt: string;
    props: ComponentProps & {
        width?: number | string;
        height?: number | string;
        loading?: 'lazy' | 'eager';
    };
    position?: Location;
} | {
    type: 'icon';
    props: ComponentProps & {
        name: string;
        size?: 'small' | 'medium' | 'large';
    };
    position?: Location;
} | {
    type: 'link';
    href: string;
    title?: string;
    content?: string;
    children?: WiremdNode[];
    props: ComponentProps;
    position?: Location;
} | {
    type: 'list';
    ordered: boolean;
    props: ComponentProps;
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'list-item';
    content?: string;
    children?: WiremdNode[];
    props: ComponentProps;
    position?: Location;
} | {
    type: 'table';
    props: ComponentProps;
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'table-header';
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'table-row';
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'table-cell';
    content?: string;
    children?: WiremdNode[];
    align?: 'left' | 'center' | 'right';
    header?: boolean;
    position?: Location;
} | {
    type: 'blockquote';
    props: ComponentProps;
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'code';
    value: string;
    lang?: string;
    inline?: boolean;
    position?: Location;
} | {
    type: 'tabs';
    props: ComponentProps;
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'tab';
    label: string;
    active: boolean;
    props: ComponentProps;
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'accordion';
    props: ComponentProps;
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'accordion-item';
    summary: string;
    expanded: boolean;
    props: ComponentProps;
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'breadcrumbs';
    props: ComponentProps;
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'breadcrumb-item';
    content?: string;
    children?: WiremdNode[];
    href?: string;
    current?: boolean;
    position?: Location;
} | {
    type: 'alert';
    alertType: 'success' | 'info' | 'warning' | 'error';
    props: ComponentProps;
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'badge';
    content: string;
    props: ComponentProps & {
        variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
    };
    position?: Location;
} | {
    type: 'separator';
    props: ComponentProps;
    position?: Location;
} | {
    type: 'loading-state';
    message?: string;
    props: ComponentProps;
    children?: WiremdNode[];
    position?: Location;
} | {
    type: 'empty-state';
    icon?: string;
    title?: string;
    props: ComponentProps;
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'error-state';
    icon?: string;
    title?: string;
    props: ComponentProps;
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'toast';
    props: ComponentProps & {
        toastType?: 'success' | 'info' | 'warning' | 'error' | 'loading';
    };
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'skeleton';
    props: ComponentProps & {
        width?: number | string;
        height?: number | string;
    };
    position?: Location;
} | {
    type: 'spinner';
    props: ComponentProps & {
        size?: 'small' | 'medium' | 'large';
    };
    position?: Location;
} | {
    type: 'kbd';
    content: string;
    props: ComponentProps;
    position?: Location;
} | {
    type: 'progress';
    value: number;
    indeterminate: boolean;
    props: ComponentProps & {
        label?: string;
    };
    position?: Location;
} | {
    type: 'meter';
    value: number;
    min: number;
    max: number;
    props: ComponentProps & {
        label?: string;
    };
    position?: Location;
} | {
    type: 'dialog';
    props: ComponentProps & {
        title?: string;
        description?: string;
        showClose?: boolean;
    };
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'alert-dialog';
    props: ComponentProps & {
        title?: string;
        description?: string;
        cancelText?: string;
        actionText?: string;
        actionVariant?: 'primary' | 'secondary' | 'danger';
    };
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'sheet';
    side: 'top' | 'right' | 'bottom' | 'left';
    props: ComponentProps & {
        title?: string;
        description?: string;
        showClose?: boolean;
    };
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'drawer';
    side: 'top' | 'right' | 'bottom' | 'left';
    props: ComponentProps & {
        title?: string;
    };
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'popover';
    props: ComponentProps & {
        title?: string;
        description?: string;
        trigger?: string;
    };
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'tooltip';
    props: ComponentProps & {
        content: string;
        side?: 'top' | 'right' | 'bottom' | 'left';
    };
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'preview-card';
    props: ComponentProps & {
        href?: string;
    };
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'pagination';
    props: ComponentProps & {
        label?: string;
    };
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'segmented-control';
    props: ComponentProps;
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'scroll-area';
    props: ComponentProps & {
        maxHeight?: number | string;
    };
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'sidebar';
    props: ComponentProps & {
        title?: string;
    };
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'menubar';
    props: ComponentProps;
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'form';
    props: ComponentProps & {
        action?: string;
        method?: 'get' | 'post';
    };
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'field';
    props: ComponentProps & {
        label?: string;
        description?: string;
        error?: string;
    };
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'fieldset';
    props: ComponentProps & {
        legend?: string;
        description?: string;
    };
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'label';
    content: string;
    props: ComponentProps & {
        htmlFor?: string;
    };
    position?: Location;
} | {
    type: 'input-group';
    props: ComponentProps & {
        addonStart?: string;
        addonEnd?: string;
    };
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'otp-field';
    props: ComponentProps & {
        length?: number;
        maxLength?: number;
    };
    position?: Location;
} | {
    type: 'number-field';
    props: ComponentProps & {
        value?: number;
        min?: number;
        max?: number;
        step?: number;
        placeholder?: string;
    };
    position?: Location;
} | {
    type: 'autocomplete';
    props: ComponentProps & {
        placeholder?: string;
        suggestions?: string[];
    };
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'combobox';
    props: ComponentProps & {
        placeholder?: string;
        options?: string[];
    };
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'command';
    props: ComponentProps & {
        placeholder?: string;
    };
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'checkbox-group';
    props: ComponentProps & {
        label?: string;
        description?: string;
    };
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'toggle-group';
    props: ComponentProps;
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'switch';
    checked: boolean;
    props: ComponentProps & {
        label?: string;
        description?: string;
        disabled?: boolean;
    };
    position?: Location;
} | {
    type: 'slider';
    value: number;
    props: ComponentProps & {
        min?: number;
        max?: number;
        step?: number;
        label?: string;
    };
    position?: Location;
} | {
    type: 'toggle';
    pressed: boolean;
    props: ComponentProps & {
        label?: string;
    };
    position?: Location;
} | {
    type: 'avatar';
    props: ComponentProps & {
        size?: 'sm' | 'md' | 'lg' | 'xl';
        name?: string;
    };
    position?: Location;
} | {
    type: 'frame';
    props: ComponentProps;
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'group';
    orientation: 'horizontal' | 'vertical';
    props: ComponentProps;
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'empty';
    props: ComponentProps;
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'calendar';
    props: ComponentProps & {
        month?: string;
        year?: number;
    };
    children: WiremdNode[];
    position?: Location;
} | {
    type: 'date-picker';
    props: ComponentProps & {
        placeholder?: string;
        value?: string;
    };
    position?: Location;
} | {
    type: 'demo';
    raw: string;
    props: ComponentProps;
    children: WiremdNode[];
    position?: Location;
};
export declare function isButtonNode(node: WiremdNode): node is Extract<WiremdNode, {
    type: 'button';
}>;
export declare function isInputNode(node: WiremdNode): node is Extract<WiremdNode, {
    type: 'input';
}>;
export declare function isContainerNode(node: WiremdNode): node is Extract<WiremdNode, {
    type: 'container';
}>;
export declare function isHeadingNode(node: WiremdNode): node is Extract<WiremdNode, {
    type: 'heading';
}>;
export declare function isTextNode(node: WiremdNode): node is Extract<WiremdNode, {
    type: 'text';
}>;
export declare function isIconNode(node: WiremdNode): node is Extract<WiremdNode, {
    type: 'icon';
}>;
export declare function isNavNode(node: WiremdNode): node is Extract<WiremdNode, {
    type: 'nav';
}>;
export declare function isGridNode(node: WiremdNode): node is Extract<WiremdNode, {
    type: 'grid';
}>;
export declare function isFormNode(node: WiremdNode): node is Extract<WiremdNode, {
    type: 'form';
}>;
export interface ParseOptions {
    position?: boolean;
    validate?: boolean;
    strict?: boolean;
    icons?: Record<string, string>;
}
/** Ordered style identifiers accepted across renderers, CLI, and embed API. */
export declare const WIREMD_STYLES: readonly ["coss", "sketch", "clean", "wireframe", "none", "tailwind", "material", "brutal"];
export type WiremdStyle = (typeof WIREMD_STYLES)[number];
export interface RenderOptions {
    format?: 'html' | 'json' | 'react' | 'tailwind';
    style?: WiremdStyle;
    inlineStyles?: boolean;
    pretty?: boolean;
    classPrefix?: string;
    typescript?: boolean;
    componentName?: string;
    codegen?: 'html' | 'jsx';
}
export interface ParseError extends Error {
    position?: Location;
    code?: string;
    severity?: 'error' | 'warning';
}
export interface ValidationError {
    message: string;
    path?: string[];
    code?: string;
    node?: WiremdNode;
}
//# sourceMappingURL=types.d.ts.map
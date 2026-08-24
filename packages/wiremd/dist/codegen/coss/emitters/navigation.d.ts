import { NodeEmitter } from '../types.js';
import { WiremdNode } from '../../../types.js';

type NavNode = Extract<WiremdNode, {
    type: 'nav';
}>;
type NavItemNode = Extract<WiremdNode, {
    type: 'nav-item';
}>;
type BrandNode = Extract<WiremdNode, {
    type: 'brand';
}>;
type TabsNode = Extract<WiremdNode, {
    type: 'tabs';
}>;
type TabNode = Extract<WiremdNode, {
    type: 'tab';
}>;
type BreadcrumbsNode = Extract<WiremdNode, {
    type: 'breadcrumbs';
}>;
export declare const emitNav: NodeEmitter<NavNode>;
export declare const emitNavItem: NodeEmitter<NavItemNode>;
export declare const emitBrand: NodeEmitter<BrandNode>;
/**
 * Tabs composite: a wrapper grouping the trigger list and the panels.
 * Triggers are built from each `tab` child's label/active flag; panels are
 * the emitted `tab` nodes themselves, recursed through the dispatcher.
 */
export declare const emitTabs: NodeEmitter<TabsNode>;
/** A single tab: its panel. Active panels render; inactive panels carry `hidden`. */
export declare const emitTab: NodeEmitter<TabNode>;
/**
 * Breadcrumbs render their `breadcrumb-item` children internally: every
 * non-current crumb becomes a link followed by a separator `li`, the current
 * crumb becomes a `span` with `aria-current="page"`. `breadcrumb-item` markup
 * never appears in the generated output.
 */
export declare const emitBreadcrumbs: NodeEmitter<BreadcrumbsNode>;
type PaginationNode = Extract<WiremdNode, {
    type: 'pagination';
}>;
type SegmentedControlNode = Extract<WiremdNode, {
    type: 'segmented-control';
}>;
type ScrollAreaNode = Extract<WiremdNode, {
    type: 'scroll-area';
}>;
type SidebarNode = Extract<WiremdNode, {
    type: 'sidebar';
}>;
type MenubarNode = Extract<WiremdNode, {
    type: 'menubar';
}>;
export declare const emitPagination: NodeEmitter<PaginationNode>;
export declare const emitSegmentedControl: NodeEmitter<SegmentedControlNode>;
export declare const emitScrollArea: NodeEmitter<ScrollAreaNode>;
export declare const emitSidebar: NodeEmitter<SidebarNode>;
export declare const emitMenubar: NodeEmitter<MenubarNode>;
export {};
//# sourceMappingURL=navigation.d.ts.map
/**
 * wiremd-promoter — fence-meta `style=<token>` handling.
 *
 * The promoter's only meta awareness: a `style=…` token becomes the
 * descriptor's optional `style` prop (validated later against
 * WIREMD_STYLES by the embed boundary), and the WiremdFence serializer
 * re-emits it so the on-disk fence round-trips. Any other meta token is
 * v1-unspecified and must stay ignored.
 */

import { describe, expect, test } from 'vitest';
import { createRegistry } from '../registry/index.ts';
import { wiremdPromoterPlugin } from './wiremd-promoter.ts';

interface Attr {
  name: string;
  value?: unknown;
}

function promoteWiremd(meta: string | null, body: string): { name: string; attributes: Attr[] } {
  const tree = {
    type: 'root',
    children: [{ type: 'code', lang: 'wiremd', meta, value: body }],
  };
  wiremdPromoterPlugin()(tree as never);
  return tree.children[0] as { name: string; attributes: Attr[] };
}

function attrsOf(node: { attributes: Attr[] }): Record<string, unknown> {
  return Object.fromEntries(node.attributes.map((a) => [a.name, a.value]));
}

describe('wiremd-promoter style meta', () => {
  test('a style token promotes to the style prop beside source', () => {
    const node = promoteWiremd('style=wireframe', '# Sign in\n[Continue]*');
    expect(node.name).toBe('WiremdFence');
    expect(attrsOf(node)).toEqual({ source: '# Sign in\n[Continue]*', style: 'wireframe' });
  });

  test('fences without meta promote with source only (sketch default downstream)', () => {
    const node = promoteWiremd(null, '# Plain');
    expect(node.attributes.map((a) => a.name)).toEqual(['source']);
  });

  test('non-style meta tokens stay ignored (v1-unspecified)', () => {
    const node = promoteWiremd('h=400', '# Tall');
    expect(node.attributes.map((a) => a.name)).toEqual(['source']);
  });

  test('the descriptor serializes a style prop back into fence meta', () => {
    const registry = createRegistry();
    const serialized = registry.get('WiremdFence').serialize({
      attrs: { props: { source: '# Sign in', style: 'wireframe' } },
    } as never);
    expect(serialized).toMatchObject({ type: 'code', lang: 'wiremd', meta: 'style=wireframe' });
  });

  test('the descriptor serializes no meta when style is unset (back-compat bytes)', () => {
    const registry = createRegistry();
    const serialized = registry.get('WiremdFence').serialize({
      attrs: { props: { source: '# Sign in' } },
    } as never);
    expect(serialized).toMatchObject({ type: 'code', lang: 'wiremd', meta: null });
  });

  test('promote → serialize round-trips the full fence', () => {
    const body = '# Sign in\nEmail\n[you@example.com___]\n[Continue]*';
    const promoted = promoteWiremd('style=wireframe', body);
    const out = createRegistry()
      .get('WiremdFence')
      .serialize({ attrs: { props: attrsOf(promoted) } } as never);
    expect(out.meta).toBe('style=wireframe');
    expect(out.value).toBe(body);
  });
});

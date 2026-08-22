/**
 * Wiremd fallback + non-wiremd regression (J5/J6, O4/O6).
 *
 * The compatibility contract is SOURCE compatibility, not visual parity:
 *
 *   - the same committed file read as Markdown shows a plain readable
 *     ` ```wiremd ` code fence (external-reader / older-client parity —
 *     asserted via source mode, which renders the file's real bytes);
 *   - the Mermaid fence path is untouched by the new promoter (its own
 *     promotion still works end-to-end);
 *   - documents with NO wiremd content parse and render identically
 *     (zero collateral from the pipeline addition).
 */

import { randomUUID } from 'node:crypto';
import { expect, test, waitForActiveProviderSynced } from './_helpers';

test.describe('Wiremd fallback and regression', () => {
  test('the committed file reads as an ordinary wiremd code fence in markdown', async ({
    page,
    api,
  }) => {
    const docName = `wiremd-fallback-${randomUUID().slice(0, 8)}`;
    await api.createPage(`${docName}.md`);
    await api.replaceDoc(docName, '# Notes\n\n```wiremd\n# Mockup\n[Submit]\n```\n');
    await page.goto(`/#/${docName}`);
    await waitForActiveProviderSynced(page);
    await page.waitForSelector('.ProseMirror:not(.composer-prosemirror)');

    // Source mode = the file's actual bytes. No OK-specific markup may
    // have replaced the fence; any Markdown client could read this.
    await page.getByRole('radio', { name: 'Markdown source' }).click();
    await page.waitForSelector('.cm-content', { timeout: 10_000 });
    const sourceText = await page.locator('.cm-content').innerText();
    expect(sourceText).toContain('```wiremd\n# Mockup\n[Submit]\n```');
    expect(sourceText).not.toMatch(/<WiremdFence/);
  });

  test('mermaid fence promotion still renders after adding the wiremd promoter', async ({
    page,
    api,
  }) => {
    const docName = `wiremd-regress-mermaid-${randomUUID().slice(0, 8)}`;
    await api.createPage(`${docName}.md`);
    await api.replaceDoc(docName, '```mermaid\nflowchart TD\n  A[Start] --> B[End]\n```\n');
    await page.goto(`/#/${docName}`);
    await waitForActiveProviderSynced(page);
    await page.waitForSelector('.ProseMirror:not(.composer-prosemirror)');

    const mermaidBlock = page.locator('.jsx-component-wrapper[data-component-type="mermaidfence"]');
    await expect(mermaidBlock).toBeVisible();
    // Mermaid's lazy renderer drew its SVG.
    await expect(mermaidBlock.locator('svg').first()).toBeVisible({ timeout: 15_000 });
  });

  test('plain markdown without fences is unaffected by the wiremd pipeline', async ({
    page,
    api,
  }) => {
    const docName = `wiremd-regress-plain-${randomUUID().slice(0, 8)}`;
    await api.createPage(`${docName}.md`);
    await api.replaceDoc(
      docName,
      '# Title\n\nA paragraph with **bold** text.\n\n- one\n- two\n\n| A | B |\n|---|---|\n| 1 | 2 |\n',
    );
    await page.goto(`/#/${docName}`);
    await waitForActiveProviderSynced(page);
    await page.waitForSelector('.ProseMirror:not(.composer-prosemirror)');

    await expect(page.getByRole('heading', { name: 'Title' })).toBeVisible();
    await expect(
      page.locator('.jsx-component-wrapper[data-component-type="wiremdfence"]'),
    ).toHaveCount(0);
    await expect(page.getByText('bold', { exact: true })).toBeVisible();
    await expect(page.getByText('one')).toBeVisible();

    // Round-trips byte-stable through mode flip (parse + serialize with no
    // wiremd nodes in the tree).
    await page.getByRole('radio', { name: 'Markdown source' }).click();
    await page.waitForSelector('.cm-content', { timeout: 10_000 });
    const sourceText = await page.locator('.cm-content').innerText();
    expect(sourceText).toContain('# Title');
    expect(sourceText).toContain('| A | B |');
    expect(sourceText).not.toContain('```wiremd');
  });
});

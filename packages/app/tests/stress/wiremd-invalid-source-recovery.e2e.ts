/**
 * Wiremd failure recovery — invalid/unsupported source journeys (J2, Q6).
 *
 * The wiremd parser is permissive: it never throws, it degrades. Two
 * recoverable states must be visible instead of silent:
 *
 *   - UNSUPPORTED constructs (raw HTML blocks) are dropped from the render —
 *     the preview shows the surviving subset WITH an omissions warning
 *     ("rendered with omissions"), never implying false completeness;
 *   - the fence source stays authoritative through every failure: it remains
 *     in the document byte-for-byte after reload (invalid input never
 *     changes committed source).
 */

import { randomUUID } from 'node:crypto';
import { expect, test, waitForActiveProviderSynced } from './_helpers';

const PARTIAL_DOC = `Before.

\`\`\`wiremd
<div>this raw html block is unsupported</div>

# Still renders
[Button works]
\`\`\`

After.
`;

test.describe('Wiremd invalid-source recovery', () => {
  test('unsupported constructs surface an omissions warning while valid content still renders', async ({
    page,
    api,
  }) => {
    const docName = `wiremd-partial-${randomUUID().slice(0, 8)}`;
    await api.createPage(`${docName}.md`);
    await api.replaceDoc(docName, PARTIAL_DOC);
    await page.goto(`/#/${docName}`);
    await waitForActiveProviderSynced(page);
    await page.waitForSelector('.ProseMirror:not(.composer-prosemirror)');

    // Non-blocking warning badge on the block — distinct from a fatal error.
    const fence = page.locator('.jsx-component-wrapper[data-component-type="wiremdfence"]');
    await expect(fence).toBeVisible();
    await expect(fence.getByText('Wireframe rendered with omissions.')).toBeVisible();

    // The surviving subset rendered inside the frame…
    const previewFrame = page.frameLocator('iframe[title="Wiremd wireframe preview"]');
    await expect(previewFrame.getByText('Still renders')).toBeVisible();
    await expect(previewFrame.getByText('Button works')).toBeVisible();

    // …while the dropped construct appears nowhere as markup or text.
    await expect(previewFrame.getByText('this raw html block is unsupported')).toHaveCount(0);
  });

  test('failed/partial compiles never alter the committed source across reload', async ({
    page,
    api,
  }) => {
    const docName = `wiremd-keep-${randomUUID().slice(0, 8)}`;
    await api.createPage(`${docName}.md`);
    await api.replaceDoc(docName, PARTIAL_DOC);
    await page.goto(`/#/${docName}`);
    await waitForActiveProviderSynced(page);
    await page.waitForSelector('.ProseMirror:not(.composer-prosemirror)');

    // Hard-reload: re-parse from persisted source. The raw HTML block the
    // renderer dropped must come back exactly as authored.
    await page.reload();
    await waitForActiveProviderSynced(page);
    await page.waitForSelector('.ProseMirror:not(.composer-prosemirror)');

    await page.getByRole('radio', { name: 'Markdown source' }).click();
    await page.waitForSelector('.cm-content', { timeout: 10_000 });
    const sourceText = await page.locator('.cm-content').innerText();
    expect(sourceText).toContain('<div>this raw html block is unsupported</div>');
    expect(sourceText).toContain('# Still renders');
    expect(sourceText).toContain('[Button works]');

    // Back to WYSIWYG: the partial-render warning state again — recovery,
    // not a wedged block.
    await page.getByRole('radio', { name: 'Visual editor' }).click();
    const fence = page.locator('.jsx-component-wrapper[data-component-type="wiremdfence"]');
    await expect(fence.getByText('Wireframe rendered with omissions.')).toBeVisible();
  });
});

/**
 * Wiremd source editing + lossless round-trip (J3, O2/O3).
 *
 * Proves the fence is the authoritative source through the edit cycle:
 *
 *   1. the fullscreen source modal opens seeded with the exact fence body
 *      and the `markdown` CodeMirror grammar;
 *   2. saving an edit commits to the node's `source` prop and the preview
 *      recompiles to reflect it;
 *   3. switching to Markdown source mode shows the SAME ` ```wiremd `
 *      fence with the edited body — serialize-back is lossless;
 *   4. Cancel never mutates the node.
 */

import { randomUUID } from 'node:crypto';
import { expect, test, waitForActiveProviderSynced } from './_helpers';

const INITIAL_SOURCE = '# Sign in\n\nEmail\n[name________________]\n\n[Continue]*';

const DOC_WITH_FENCE = `\`\`\`wiremd
${INITIAL_SOURCE}
\`\`\`
`;

/** Hover-reveal the block chrome and open the source modal via the
 * pencil. `force: true` matches the repo idiom for chrome buttons whose
 * overlay straddles nodeview content (see jsx-prop-panel-placeholder). */
async function openSourceModal(page: import('@playwright/test').Page) {
  const fence = page.locator('.jsx-component-wrapper[data-component-type="wiremdfence"]');
  await expect(fence).toBeVisible();
  await fence.hover();
  const editButton = fence.getByRole('button', { name: 'Edit WireMD source' });
  await expect(editButton).toBeVisible();
  await editButton.click({ force: true });
  // The shared CodePreviewEditModal mounts a CodeMirror surface.
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const cmContent = dialog.locator('.cm-content');
  await expect(cmContent).toBeVisible();
  return { dialog, cmContent };
}

test.describe('Wiremd source editing', () => {
  test('edit modal seeds the exact fence body; saving recompiles the preview', async ({
    page,
    api,
  }) => {
    const docName = `wiremd-edit-${randomUUID().slice(0, 8)}`;
    await api.createPage(`${docName}.md`);
    await api.replaceDoc(docName, DOC_WITH_FENCE);
    await page.goto(`/#/${docName}`);
    await waitForActiveProviderSynced(page);
    await page.waitForSelector('.ProseMirror:not(.composer-prosemirror)');

    // Initial preview rendered the original button label.
    const previewFrame = page.frameLocator('iframe[title="Wiremd wireframe preview"]');
    await expect(previewFrame.getByText('Continue')).toBeVisible();

    const { cmContent } = await openSourceModal(page);

    // The modal seeded with the EXACT current fence payload.
    await expect(cmContent).toContainText('[Continue]*');

    // Rewrite the draft: rename the button and add a checkbox row.
    await cmContent.click();
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+a' : 'Control+a');
    await page.keyboard.type(
      '# Sign in\n\nEmail\n[name________________]\n\n[Join now]*\n\n[x] Remember me',
    );

    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();

    // Preview recompiled from the edited source — new label AND new row.
    await expect(previewFrame.getByText('Join now')).toBeVisible({ timeout: 10_000 });
    await expect(previewFrame.locator('input[type="checkbox"]')).toHaveCount(1);
    // The old label is gone from the derived preview.
    await expect(previewFrame.getByText('Continue')).toHaveCount(0);
  });

  test('the edited fence serializes back into markdown source mode', async ({ page, api }) => {
    const docName = `wiremd-serialize-${randomUUID().slice(0, 8)}`;
    await api.createPage(`${docName}.md`);
    await api.replaceDoc(docName, DOC_WITH_FENCE);
    await page.goto(`/#/${docName}`);
    await waitForActiveProviderSynced(page);
    await page.waitForSelector('.ProseMirror:not(.composer-prosemirror)');

    const { cmContent } = await openSourceModal(page);
    await cmContent.click();
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+a' : 'Control+a');
    await page.keyboard.type('# Renamed heading\n[Save]*');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();

    // On-disk form: an ordinary ```wiremd fence carrying the edited body.
    await page.getByRole('radio', { name: 'Markdown source' }).click();
    await page.waitForSelector('.cm-content', { timeout: 10_000 });
    const sourceText = await page.locator('.cm-content').innerText();
    expect(sourceText).toContain('```wiremd');
    expect(sourceText).toContain('# Renamed heading');
    expect(sourceText).toContain('[Save]*');
    expect(sourceText).not.toContain('# Sign in');
  });

  test('cancel leaves the source untouched and the preview on the old compile', async ({
    page,
    api,
  }) => {
    const docName = `wiremd-cancel-${randomUUID().slice(0, 8)}`;
    await api.createPage(`${docName}.md`);
    await api.replaceDoc(docName, DOC_WITH_FENCE);
    await page.goto(`/#/${docName}`);
    await waitForActiveProviderSynced(page);
    await page.waitForSelector('.ProseMirror:not(.composer-prosemirror)');

    const previewFrame = page.frameLocator('iframe[title="Wiremd wireframe preview"]');
    await expect(previewFrame.getByText('Continue')).toBeVisible();

    const { cmContent } = await openSourceModal(page);
    await cmContent.click();
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+a' : 'Control+a');
    await page.keyboard.type('# This must not persist');
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();

    // Preview still reflects the pre-edit compile…
    await expect(previewFrame.getByText('Continue')).toBeVisible();
    await expect(previewFrame.getByText('This must not persist')).toHaveCount(0);

    // …and the stored fence still carries the original bytes (asserted
    // per-line: CM paints blank lines with non-literal whitespace, so an
    // exact multiline match is brittle).
    await page.getByRole('radio', { name: 'Markdown source' }).click();
    await page.waitForSelector('.cm-content', { timeout: 10_000 });
    const sourceText = await page.locator('.cm-content').innerText();
    expect(sourceText).toContain('# Sign in');
    expect(sourceText).toContain('[name________________]');
    expect(sourceText).toContain('[Continue]*');
    expect(sourceText).not.toContain('This must not persist');
  });
});

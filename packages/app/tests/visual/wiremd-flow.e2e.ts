/**
 * Wiremd user-flow visual suite — snapshot images for every stage of the
 * ` ```wiremd ` fence journey.
 *
 * Companion to the behavioral specs in `tests/stress/wiremd-*.e2e.ts`:
 * those assert behavior; this one freezes what each stage LOOKS like, one
 * baseline image per flow stage:
 *
 *   VR-WMD-01  capable client: fence promoted + live preview rendered
 *   VR-WMD-02  promotion scope: js fence stays an ordinary code block
 *   VR-WMD-03  empty fence → explicit empty-state card (no zero-height stub)
 *   VR-WMD-04  edit modal opened, seeded with the exact fence body
 *   VR-WMD-05  preview recompiled after an edit (new label + checkbox row)
 *   VR-WMD-06  markdown source view: serialized ` ```wiremd ` fence
 *   VR-WMD-07  partial render: omissions warning over surviving content
 *   VR-WMD-08  load-failure recovery affordance is source-visible
 *              (covered by the Retry UI; not pixel-stable across chunk
 *              states — asserted behaviorally in stress specs instead)
 *
 * Baselines live in `wiremd-flow.e2e.ts-snapshots/`. First run creates
 * them; updates require the explicit `test:visual:update` script per
 * `updateSnapshots: 'none'` in `playwright.visual.config.ts`.
 */

import { randomUUID } from 'node:crypto';
import type { Page } from '@playwright/test';
import { expect, test } from '../stress/_helpers';

async function waitForProvider(page: Page) {
  await page.waitForFunction(() => Boolean(window.__activeProvider?.isSynced), {
    timeout: 15_000,
  });
}

const MIXED_DOC = `# Checkout redesign

Prose before the wireframe.

\`\`\`wiremd
# Sign in

Email
[name________________]

[Continue]*
\`\`\`

Prose after the wireframe.
`;

const PARTIAL_DOC = `Before.

\`\`\`wiremd
<div>unsupported raw html block</div>

# Still renders
[Button works]
\`\`\`
`;

test.describe('Wiremd user-flow snapshots', () => {
  test('VR-WMD-01/02 — promoted preview renders; sibling js fence stays a code block', async ({
    page,
    api,
  }) => {
    const docName = `wmd-vis-${randomUUID().slice(0, 8)}`;
    await api.createPage(`${docName}.md`);
    await api.replaceDoc(docName, `${MIXED_DOC}\n\`\`\`js\nconsole.log('plain code');\n\`\`\`\n`);
    await page.goto(`/#/${docName}`);
    await waitForProvider(page);
    await page.waitForSelector('.ProseMirror:not(.composer-prosemirror)');

    const editor = page.locator('.ProseMirror:not(.composer-prosemirror)');
    const previewFrame = page.frameLocator('iframe[title="Wireframe preview"]');
    await expect(previewFrame.getByText('Sign in')).toBeVisible();

    // Whole-editor capture: prose + promoted block + plain js code block.
    await expect(editor).toHaveScreenshot('wiremd-01-preview-in-mixed-doc.png', {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
      caret: 'hide',
    });

    // Close-up of the WiremdFence nodeview itself.
    const fence = page.locator('.jsx-component-wrapper[data-component-type="wiremdfence"]');
    await expect(fence).toHaveScreenshot('wiremd-02-fence-nodeview.png', {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
      caret: 'hide',
    });
  });

  test('VR-WMD-03 — empty fence renders the explicit empty-state card', async ({ page, api }) => {
    const docName = `wmd-vis-empty-${randomUUID().slice(0, 8)}`;
    await api.createPage(`${docName}.md`);
    await api.replaceDoc(docName, 'Before.\n\n```wiremd\n```\n\nAfter.\n');
    await page.goto(`/#/${docName}`);
    await waitForProvider(page);
    await page.waitForSelector('.ProseMirror:not(.composer-prosemirror)');

    await expect(page.getByText('Add a wiremd wireframe')).toBeVisible();
    const editor = page.locator('.ProseMirror:not(.composer-prosemirror)');
    await expect(editor).toHaveScreenshot('wiremd-03-empty-fence-placeholder.png', {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
      caret: 'hide',
    });
  });

  test('VR-WMD-04/05 — edit modal seeded from the fence; preview recompiles after save', async ({
    page,
    api,
  }) => {
    const docName = `wmd-vis-edit-${randomUUID().slice(0, 8)}`;
    await api.createPage(`${docName}.md`);
    await api.replaceDoc(docName, `\`\`\`wiremd\n# Sign in\n[Continue]*\n\`\`\`\n`);
    await page.goto(`/#/${docName}`);
    await waitForProvider(page);
    await page.waitForSelector('.ProseMirror:not(.composer-prosemirror)');

    const previewFrame = page.frameLocator('iframe[title="Wireframe preview"]');
    await expect(previewFrame.getByText('Continue')).toBeVisible();

    // Open the fullscreen source modal via the block chrome pencil.
    const fence = page.locator('.jsx-component-wrapper[data-component-type="wiremdfence"]');
    await fence.hover();
    const editButton = fence.getByRole('button', { name: 'Edit WireMD source' });
    await editButton.waitFor({ state: 'visible', timeout: 5_000 });
    await editButton.click({ force: true });
    const dialog = page.getByRole('dialog');
    await expect(dialog.locator('.cm-content')).toBeVisible();
    await expect(dialog.locator('.cm-content')).toContainText('[Continue]*');

    await expect(page).toHaveScreenshot('wiremd-04-edit-modal-seeded.png', {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
      caret: 'hide',
    });

    // Edit and commit.
    const cmContent = dialog.locator('.cm-content');
    await cmContent.click();
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+a' : 'Control+a');
    await page.keyboard.type(
      '# Sign in\n\nEmail\n[name________________]\n\n[Join now]*\n\n[x] Remember me',
    );
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();

    await expect(previewFrame.getByText('Join now')).toBeVisible({ timeout: 10_000 });
    const editor = page.locator('.ProseMirror:not(.composer-prosemirror)');
    await expect(editor).toHaveScreenshot('wiremd-05-preview-after-edit.png', {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
      caret: 'hide',
    });
  });

  test('VR-WMD-06 — markdown source mode shows the serialized wiremd fence', async ({
    page,
    api,
  }) => {
    const docName = `wmd-vis-src-${randomUUID().slice(0, 8)}`;
    await api.createPage(`${docName}.md`);
    await api.replaceDoc(docName, `\`\`\`wiremd\n# Mockup\n[Submit]\n\`\`\`\n`);
    await page.goto(`/#/${docName}`);
    await waitForProvider(page);
    await page.waitForSelector('.ProseMirror:not(.composer-prosemirror)');

    await page.getByRole('radio', { name: 'Markdown source' }).click();
    await page.waitForSelector('.cm-line', { timeout: 10_000 });
    await expect(page.locator('.cm-content')).toContainText('```wiremd');

    await expect(page).toHaveScreenshot('wiremd-06-markdown-source-fallback.png', {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
      caret: 'hide',
    });
  });

  test('VR-WMD-07 — unsupported constructs show the omissions warning with surviving content', async ({
    page,
    api,
  }) => {
    const docName = `wmd-vis-partial-${randomUUID().slice(0, 8)}`;
    await api.createPage(`${docName}.md`);
    await api.replaceDoc(docName, PARTIAL_DOC);
    await page.goto(`/#/${docName}`);
    await waitForProvider(page);
    await page.waitForSelector('.ProseMirror:not(.composer-prosemirror)');

    const fence = page.locator('.jsx-component-wrapper[data-component-type="wiremdfence"]');
    await expect(fence.getByText('Wireframe rendered with omissions.')).toBeVisible();
    const previewFrame = page.frameLocator('iframe[title="Wireframe preview"]');
    await expect(previewFrame.getByText('Still renders')).toBeVisible();

    await expect(fence).toHaveScreenshot('wiremd-07-partial-render-warning.png', {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
      caret: 'hide',
    });
  });
});

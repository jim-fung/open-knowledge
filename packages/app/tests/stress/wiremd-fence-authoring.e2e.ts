/**
 * Wiremd fence authoring — the capable-client preview journey (J1).
 *
 * Proves the v1 contract end-to-end in a real editor: an ordinary `.md`
 * document containing a ` ```wiremd ` fenced block promotes to the built-in
 * `WiremdFence` node, renders a live visual preview through the
 * `wiremd/embed` boundary, and leaves the surrounding prose untouched.
 * A `js` fence in the same document must stay an ordinary code block —
 * promotion is exactly `lang === 'wiremd'`, nothing broader.
 */

import { randomUUID } from 'node:crypto';
import { expect, test, waitForActiveProviderSynced } from './_helpers';

const WIREMD_DOC = `# Checkout redesign

Some ordinary Markdown prose before the fence.

\`\`\`wiremd
# Sign in

Email
[name________________]

[Continue]*
[Cancel]
\`\`\`

Prose after the fence, so collateral damage is visible.
`;

test.describe('Wiremd fence authoring', () => {
  test('a wiremd fence promotes and renders a live preview inside ordinary markdown', async ({
    page,
    api,
  }) => {
    const docName = `wiremd-author-${randomUUID().slice(0, 8)}`;
    await api.createPage(`${docName}.md`);
    await api.replaceDoc(docName, WIREMD_DOC);
    await page.goto(`/#/${docName}`);
    await waitForActiveProviderSynced(page);
    await page.waitForSelector('.ProseMirror:not(.composer-prosemirror)');

    // The fence promoted to the built-in WiremdFence nodeview…
    const fence = page.locator('.jsx-component-wrapper[data-component-type="wiremdfence"]');
    await expect(fence).toHaveCount(1);

    // …and its lazy renderer mounted the sandboxed preview iframe.
    const previewFrame = page.frameLocator('iframe[title="Wiremd wireframe preview"]');
    await expect(previewFrame.locator('.ok-wiremd-root')).toHaveCount(1);

    // The wireframe's actual content rendered inside the frame — the
    // embed compile produced real markup, not an empty shell.
    await expect(previewFrame.getByText('Sign in')).toBeVisible();
    await expect(previewFrame.locator('input[type="text"]')).toHaveCount(1);
    await expect(previewFrame.getByText('Continue')).toBeVisible();

    // Surrounding prose survived promotion intact.
    await expect(page.getByText('Some ordinary Markdown prose before the fence.')).toBeVisible();
    await expect(
      page.getByText('Prose after the fence, so collateral damage is visible.'),
    ).toBeVisible();
  });

  test('non-wiremd fences in the same document stay ordinary code blocks', async ({
    page,
    api,
  }) => {
    const docName = `wiremd-scope-${randomUUID().slice(0, 8)}`;
    await api.createPage(`${docName}.md`);
    await api.replaceDoc(
      docName,
      `${WIREMD_DOC}\n\`\`\`js\nconsole.log('not a wireframe');\n\`\`\`\n`,
    );
    await page.goto(`/#/${docName}`);
    await waitForActiveProviderSynced(page);
    await page.waitForSelector('.ProseMirror:not(.composer-prosemirror)');

    // Exactly one promotion — the js fence did NOT become a WiremdFence.
    await expect(
      page.locator('.jsx-component-wrapper[data-component-type="wiremdfence"]'),
    ).toHaveCount(1);
    // The js fence renders as an ordinary code block surface.
    await expect(page.getByText("console.log('not a wireframe');")).toBeVisible();
  });

  test('an empty wiremd fence shows the explicit empty-state card, not a zero-height stub', async ({
    page,
    api,
  }) => {
    const docName = `wiremd-empty-${randomUUID().slice(0, 8)}`;
    await api.createPage(`${docName}.md`);
    await api.replaceDoc(docName, 'Before.\n\n```wiremd\n```\n\nAfter.\n');
    await page.goto(`/#/${docName}`);
    await waitForActiveProviderSynced(page);
    await page.waitForSelector('.ProseMirror:not(.composer-prosemirror)');

    // The shared source-bearing-leaf placeholder card (same mechanism
    // MermaidFence uses for its empty state) gives the block a real
    // click target with a clear CTA label.
    await expect(page.getByText('Add a wiremd wireframe')).toBeVisible();
    // No preview iframe mounted for an empty source.
    await expect(page.locator('iframe[title="Wiremd wireframe preview"]')).toHaveCount(0);
  });
});

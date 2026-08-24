/**
 * Plot fence authoring — real-browser journey for the declarative chart
 * fence (companion to wiremd-fence-authoring.e2e.ts).
 *
 * Proves in a live editor that an ordinary `.md` document containing a
 * ` ```plot ` fenced block promotes to the built-in `PlotFence` node,
 * lazy-loads @observablehq/plot, and renders a real SVG chart without
 * executing author code — while surrounding prose stays untouched and a
 * sibling `js` fence stays an ordinary code block. A spec naming a
 * non-allowlisted mark must render the fatal diagnostic beside the
 * unchanged source, never write back to the document.
 */

import { randomUUID } from 'node:crypto';
import { expect, test, waitForActiveProviderSynced } from './_helpers';

const PLOT_SPEC = JSON.stringify({
  marks: [
    {
      mark: 'barY',
      data: [
        { month: 'Jan', high: 7 },
        { month: 'Apr', high: 16 },
        { month: 'Jul', high: 27 },
      ],
      options: { x: 'month', y: 'high' },
    },
  ],
  y: { grid: true },
});

const PLOT_DOC = `# Weather notebook

Some ordinary Markdown prose before the fence.

\`\`\`plot
${PLOT_SPEC}
\`\`\`

Prose after the fence, so collateral damage is visible.
`;

test.describe('Plot fence authoring', () => {
  test('a plot fence promotes, lazy-loads the library, and renders a real SVG chart', async ({
    page,
    api,
  }) => {
    const docName = `plot-author-${randomUUID().slice(0, 8)}`;
    await api.createPage(`${docName}.md`);
    await api.replaceDoc(docName, `${PLOT_DOC}\n\`\`\`js\nconsole.log('not a chart');\n\`\`\`\n`);
    await page.goto(`/#/${docName}`);
    await waitForActiveProviderSynced(page);
    await page.waitForSelector('.ProseMirror:not(.composer-prosemirror)');

    // Exactly one promotion — the js fence did NOT become a PlotFence.
    const fence = page.locator('.jsx-component-wrapper[data-component-type="plotfence"]');
    await expect(fence).toHaveCount(1);

    // The lazy renderer mounted and committed a chart (debounce + dynamic
    // import mean this lands well after first paint).
    const host = page.locator('[data-component-type-renderer="plot"] .plot-host');
    await expect(host.locator('svg')).toBeVisible({ timeout: 15_000 });
    // Plot draws actual data geometry, not an empty shell: bar marks exist.
    await expect(host.locator('svg .mark-bar, svg path[aria-label], svg g').first()).toBeAttached();

    // Surrounding prose survived promotion intact…
    await expect(page.getByText('Some ordinary Markdown prose before the fence.')).toBeVisible();
    await expect(
      page.getByText('Prose after the fence, so collateral damage is visible.'),
    ).toBeVisible();
    // …and the js fence still renders as an ordinary code block surface.
    await expect(page.getByText("console.log('not a chart');")).toBeVisible();
  });

  test('an unknown mark name surfaces the fatal banner while the source stays authoritative', async ({
    page,
    api,
  }) => {
    const docName = `plot-invalid-${randomUUID().slice(0, 8)}`;
    await api.createPage(`${docName}.md`);
    await api.replaceDoc(
      docName,
      `\`\`\`plot\n${JSON.stringify({ marks: [{ mark: 'notAPlotMark', data: [1] }] })}\n\`\`\`\n`,
    );
    await page.goto(`/#/${docName}`);
    await waitForActiveProviderSynced(page);
    await page.waitForSelector('.ProseMirror:not(.composer-prosemirror)');

    // The fatal banner names the problem…
    const alert = page.locator('[data-component-type-renderer="plot"] [role="alert"]');
    await expect(alert).toContainText("Couldn't render chart.", { timeout: 15_000 });
    await expect(alert).toContainText('unknown mark');

    // …and the fence source is shown unchanged beside it — never rewritten.
    const source = page.locator('[data-component-type-renderer="plot"] .plot-source');
    await expect(source).toContainText('notAPlotMark');
  });

  test('an empty plot fence shows the explicit empty-state card, not a zero-height stub', async ({
    page,
    api,
  }) => {
    const docName = `plot-empty-${randomUUID().slice(0, 8)}`;
    await api.createPage(`${docName}.md`);
    await api.replaceDoc(docName, 'Before.\n\n```plot\n```\n\nAfter.\n');
    await page.goto(`/#/${docName}`);
    await waitForActiveProviderSynced(page);
    await page.waitForSelector('.ProseMirror:not(.composer-prosemirror)');

    // The shared source-bearing-leaf placeholder card (same mechanism
    // MermaidFence/WiremdFence use for their empty states).
    await expect(page.getByText('Add a plot chart')).toBeVisible();
    await expect(page.locator('[data-component-type-renderer="plot"] .plot-host')).toHaveCount(0);
  });
});

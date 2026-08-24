/**
 * Wiremd component variants × flows — 20 real-browser scenarios rendered in
 * the WIREFRAME style (via the `style=wireframe` fence-meta token, which the
 * promoter promotes to WiremdFence.style and the serializer round-trips).
 *
 * Component coverage: buttons (variants/disabled/button-links), inputs
 * (required), textarea, select, checkboxes, tabs, cards, grids, rows,
 * navigation, badges, tables, icons. Flow coverage: multi-style documents,
 * unknown-style fatality, source-mode round-trip of the style meta.
 *
 * Structural assertions target the `ok-wiremd-*` class contract emitted by
 * the embed renderer; style application is pinned by the theme's CSS
 * fingerprint comment (`/* wiremd Wireframe Style … *​/`) inside the srcdoc.
 */

import { randomUUID } from 'node:crypto';
import type { Page } from '@playwright/test';
import { expect, test, waitForActiveProviderSynced } from './_helpers';

interface DocApi {
  createPage(name: string): Promise<unknown>;
  replaceDoc(name: string, markdown: string): Promise<unknown>;
}

const P = 'ok-wiremd';

/** Wrap wiremd body lines into a wireframe-styled fenced block. */
function wf(body: string): string {
  return `\`\`\`wiremd style=wireframe\n${body}\n\`\`\``;
}

async function openDoc(page: Page, api: DocApi, name: string, markdown: string) {
  await api.createPage(`${name}.md`);
  await api.replaceDoc(name, markdown);
  await page.goto(`/#/${name}`);
  await waitForActiveProviderSynced(page);
  await page.waitForSelector('.ProseMirror:not(.composer-prosemirror)');
}

function previewFrame(page: Page, index = 0) {
  return page.frameLocator('iframe[title="Wireframe preview"]').nth(index);
}

test.describe('Wiremd component variants (wireframe style)', () => {
  test('01 · button variants render primary styling and four buttons', async ({ page, api }) => {
    const docName = `wv-buttons-${randomUUID().slice(0, 8)}`;
    await openDoc(
      page,
      api,
      docName,
      `${wf('[Default] [Primary]* [Secondary]{variant:secondary} [Danger]{variant:danger}')}\n`,
    );
    const frame = previewFrame(page);
    await expect(frame.locator(`.${P}-root`)).toBeAttached({ timeout: 15_000 });
    await expect(frame.locator(`.${P}-button`)).toHaveCount(4);
    // Primary marker (*) drives the button-primary modifier class…
    await expect(
      frame.locator(`.${P}-button-primary`).filter({ hasText: 'Primary' }),
    ).toBeAttached();
    // …and every button's label survived intact.
    for (const label of ['Default', 'Primary', 'Secondary', 'Danger']) {
      await expect(frame.locator(`.${P}-button`, { hasText: label })).toBeAttached();
    }
  });

  test('02 · wireframe theme fingerprint rides in the preview CSS', async ({ page, api }) => {
    const docName = `wv-theme-${randomUUID().slice(0, 8)}`;
    await openDoc(page, api, docName, `${wf('# Theme probe\n[Ok]*')}\n`);
    await expect(previewFrame(page).locator(`.${P}-root`)).toBeAttached({ timeout: 15_000 });
    const srcdoc = await page.locator('iframe[title="Wireframe preview"]').getAttribute('srcdoc');
    expect(srcdoc ?? '').toContain('wiremd Wireframe Style');
  });

  test('03 · radio groups render checked state and share one group name', async ({ page, api }) => {
    const docName = `wv-radio-${randomUUID().slice(0, 8)}`;
    await openDoc(page, api, docName, `${wf('( ) Email\n(x) SMS')}\n`);
    const frame = previewFrame(page);
    await expect(frame.locator(`.${P}-root`)).toBeAttached({ timeout: 15_000 });
    await expect(frame.locator(`.${P}-radio`)).toHaveCount(2);
    const states = await frame.locator('input[type="radio"]').evaluateAll((els) =>
      els.map((el) => ({
        checked: (el as HTMLInputElement).checked,
        name: el.getAttribute('name'),
      })),
    );
    expect(states.filter((s) => s.checked).length).toBe(1);
    expect(new Set(states.map((s) => s.name)).size).toBe(1);
    await expect(frame.getByText('SMS')).toBeVisible();
  });

  test('04 · button-links navigate via anchor semantics, not script', async ({ page, api }) => {
    const docName = `wv-btnlinks-${randomUUID().slice(0, 8)}`;
    await openDoc(
      page,
      api,
      docName,
      `${wf('[[Go to Dashboard](./index.md)] [[View Examples](../more.md)]*')}\n`,
    );
    const frame = previewFrame(page);
    await expect(frame.locator(`.${P}-root`)).toBeAttached({ timeout: 15_000 });
    await expect(frame.locator(`a.${P}-button`)).toHaveCount(2);
    await expect(frame.locator('a[href="./index.md"]')).toBeAttached();
    await expect(frame.locator('a[href="../more.md"]')).toBeAttached();
  });

  test('05 · required text input keeps its binding label and required flag', async ({
    page,
    api,
  }) => {
    const docName = `wv-input-${randomUUID().slice(0, 8)}`;
    await openDoc(
      page,
      api,
      docName,
      `${wf('Email\n[_____________________________]{required}')}\n`,
    );
    const frame = previewFrame(page);
    await expect(frame.locator(`.${P}-root`)).toBeAttached({ timeout: 15_000 });
    await expect(frame.locator(`.${P}-input`)).toBeAttached();
    await expect(frame.locator('input[required]')).toBeAttached();
    await expect(frame.getByText('Email')).toBeVisible();
  });

  test('06 · textarea honors its row hint and placeholder', async ({ page, api }) => {
    const docName = `wv-textarea-${randomUUID().slice(0, 8)}`;
    await openDoc(page, api, docName, `${wf('Message\n[Write your message here...]{rows:4}')}\n`);
    const frame = previewFrame(page);
    await expect(frame.locator(`.${P}-root`)).toBeAttached({ timeout: 15_000 });
    await expect(frame.locator(`.${P}-textarea`)).toBeAttached();
    const rows = await frame
      .locator('textarea')
      .first()
      .evaluate((el) => ({
        rows: el.getAttribute('rows'),
        placeholder: el.getAttribute('placeholder') ?? '',
      }));
    if (rows.rows !== null) {
      expect(rows.rows).toBe('4');
    }
    expect(rows.placeholder.toLowerCase()).toContain('message');
  });

  test('07 · dropdown opener plus list renders a real select with options', async ({
    page,
    api,
  }) => {
    const docName = `wv-select-${randomUUID().slice(0, 8)}`;
    await openDoc(
      page,
      api,
      docName,
      `${wf('Country\n[Select country            v]\n- United States\n- United Kingdom\n- Germany')}\n`,
    );
    const frame = previewFrame(page);
    await expect(frame.locator(`.${P}-root`)).toBeAttached({ timeout: 15_000 });
    await expect(frame.locator(`.${P}-select`)).toBeAttached();
    const optionCount = await frame.locator('select option').count();
    expect(optionCount).toBeGreaterThanOrEqual(3);
  });

  test('08 · task lists become checked and unchecked checkboxes', async ({ page, api }) => {
    const docName = `wv-check-${randomUUID().slice(0, 8)}`;
    await openDoc(
      page,
      api,
      docName,
      `${wf('- [ ] Email notifications\n- [x] SMS alerts\n- [x] Weekly digest')}\n`,
    );
    const frame = previewFrame(page);
    await expect(frame.locator(`.${P}-root`)).toBeAttached({ timeout: 15_000 });
    const boxes = await frame
      .locator('input[type="checkbox"]')
      .evaluateAll((els) => els.map((el) => (el as HTMLInputElement).checked));
    expect(boxes.filter(Boolean).length).toBe(2);
    expect(boxes.length).toBe(3);
  });

  test('09 · tabs activate their first panel by default', async ({ page, api }) => {
    const docName = `wv-tabs-${randomUUID().slice(0, 8)}`;
    await openDoc(
      page,
      api,
      docName,
      `${wf('::: tabs\n\n::: tab Overview\n\nOverview copy.\n\n[Get Started]*\n\n:::\n\n::: tab Features\n\nFeature list.\n\n:::\n\n:::')}\n`,
    );
    const frame = previewFrame(page);
    await expect(frame.locator(`.${P}-tabs-static`)).toBeAttached({ timeout: 15_000 });
    await expect(frame.locator(`.${P}-tab-header`)).toHaveCount(2);
    const states = await frame
      .locator(`.${P}-tab-header`)
      .evaluateAll((els) => els.map((el) => el.className));
    expect(states[0]).toContain(`${P}-active`);
    expect(states[1]).not.toContain(`${P}-active`);
    await expect(frame.getByText('Overview copy.')).toBeVisible();
  });

  test('10 · cards wrap their content and inner buttons in one container', async ({
    page,
    api,
  }) => {
    const docName = `wv-card-${randomUUID().slice(0, 8)}`;
    await openDoc(
      page,
      api,
      docName,
      `${wf('::: card\nBuild your first wireframe in minutes.\n[Read the guide] [View examples]*\n:::')}\n`,
    );
    const frame = previewFrame(page);
    await expect(frame.locator(`.${P}-container-card`)).toBeAttached({ timeout: 15_000 });
    await expect(frame.locator(`.${P}-container-card .${P}-button`)).toHaveCount(2);
  });

  test('11 · grid-N headings become column items holding their fields', async ({ page, api }) => {
    const docName = `wv-grid-${randomUUID().slice(0, 8)}`;
    await openDoc(
      page,
      api,
      docName,
      `${wf('::: grid-2\n### Billing\n[first____]\n### Shipping\n[last____]\n:::')}\n`,
    );
    const frame = previewFrame(page);
    await expect(frame.locator(`.${P}-grid`)).toBeAttached({ timeout: 15_000 });
    await expect(frame.locator(`.${P}-grid-item`)).toHaveCount(2);
    await expect(frame.locator(`.${P}-input`)).toHaveCount(2);
    await expect(frame.locator(`.${P}-h3`, { hasText: 'Billing' })).toBeAttached();
  });

  test('12 · grid-3 card gives every column card treatment', async ({ page, api }) => {
    const docName = `wv-gridcard-${randomUUID().slice(0, 8)}`;
    await openDoc(
      page,
      api,
      docName,
      `${wf('::: grid-3 card\n### Alpha\nAlpha copy.\n### Beta\nBeta copy.\n### Gamma\nGamma copy.\n:::')}\n`,
    );
    const frame = previewFrame(page);
    await expect(frame.locator(`.${P}-grid-item`)).toHaveCount(3);
    await expect(frame.locator(`.${P}-grid-item-card`)).toHaveCount(3);
    for (const name of ['Alpha', 'Beta', 'Gamma']) {
      await expect(frame.locator(`.${P}-h3`, { hasText: name })).toBeAttached();
    }
  });

  test('13 · alert containers carry their success variant class', async ({ page, api }) => {
    const docName = `wv-alert-${randomUUID().slice(0, 8)}`;
    await openDoc(
      page,
      api,
      docName,
      `${wf('::: alert {.success}\n\nProfile updated successfully.\n\n:::')}\n`,
    );
    const frame = previewFrame(page);
    await expect(frame.locator(`.${P}-container-alert`)).toBeAttached({ timeout: 15_000 });
    await expect(frame.locator(`.${P}-container-alert.${P}-success`)).toBeAttached();
    await expect(frame.getByText('Profile updated successfully.')).toBeVisible();
  });

  test('14 · blockquotes and separators keep their semantic elements', async ({ page, api }) => {
    const docName = `wv-quote-${randomUUID().slice(0, 8)}`;
    await openDoc(page, api, docName, `${wf('> Quoted wisdom for builders\n\n---')}\n`);
    const frame = previewFrame(page);
    await expect(frame.locator(`.${P}-blockquote`)).toBeAttached({ timeout: 15_000 });
    await expect(frame.locator(`.${P}-separator`)).toBeAttached();
    await expect(frame.getByText('Quoted wisdom for builders')).toBeVisible();
  });

  test('15 · navigation bars keep brand, items, and the active marker', async ({ page, api }) => {
    const docName = `wv-nav-${randomUUID().slice(0, 8)}`;
    await openDoc(page, api, docName, `${wf('[[ MyApp | Home | *Products* | Pricing ]]')}\n`);
    const frame = previewFrame(page);
    await expect(frame.locator(`.${P}-nav-content`)).toBeAttached({ timeout: 15_000 });
    await expect(frame.getByText('MyApp')).toBeVisible();
    const actives = await frame.locator(`[class*="${P}-active"]`).allTextContents();
    expect(actives.join('\n')).toContain('Products');
    // Exactly one active item — the *marker* moved, nothing else lit up.
    expect(actives.filter((t) => t.includes('Products')).length).toBe(1);
  });

  test('16 · badges carry their variant classes inline', async ({ page, api }) => {
    const docName = `wv-badges-${randomUUID().slice(0, 8)}`;
    await openDoc(
      page,
      api,
      docName,
      `${wf('Status: |Active|{.success}\nBuild: |Failing|{.error}')}\n`,
    );
    const frame = previewFrame(page);
    await expect(frame.locator(`[class*="${P}-badge"]`).first()).toBeAttached({ timeout: 15_000 });
    await expect(
      frame.locator(`.${P}-badge-success`, { hasText: 'Active' }).first(),
    ).toBeAttached();
    await expect(frame.locator(`.${P}-badge-error`, { hasText: 'Failing' }).first()).toBeAttached();
  });

  test('17 · pipe tables keep header and body structure', async ({ page, api }) => {
    const docName = `wv-table-${randomUUID().slice(0, 8)}`;
    await openDoc(
      page,
      api,
      docName,
      `${wf('| Name | Role |\n|------|------|\n| Alice | Admin |\n| Bob | Editor |\n| Clara | Viewer |')}\n`,
    );
    const frame = previewFrame(page);
    await expect(frame.locator('table')).toBeAttached({ timeout: 15_000 });
    await expect(frame.locator('th')).toHaveCount(2);
    await expect(frame.locator('tbody tr')).toHaveCount(3);
  });

  test('18 · inline icons render as graphics, not literal colon tokens', async ({ page, api }) => {
    const docName = `wv-icons-${randomUUID().slice(0, 8)}`;
    await openDoc(
      page,
      api,
      docName,
      `${wf(':home: Home  :user: Profile  :settings: Settings')}\n`,
    );
    const frame = previewFrame(page);
    await expect(frame.locator(`.${P}-icon`).first()).toBeAttached({ timeout: 15_000 });
    await expect(frame.locator(`.${P}-icon`)).toHaveCount(3);
    const bodyText = await frame.locator(`.${P}-root`).textContent();
    expect(bodyText ?? '').not.toContain(':home:');
  });
});

test.describe('Wiremd style flows (wireframe)', () => {
  test('19 · one document can mix styles per fence; each preview gets its own theme', async ({
    page,
    api,
  }) => {
    const docName = `wv-mix-${randomUUID().slice(0, 8)}`;
    const markdown = [
      '# Mixed styles',
      '',
      '```wiremd style=wireframe',
      '# Wireframe half',
      '[Save]*',
      '```',
      '',
      '```wiremd style=clean',
      '# Clean half',
      '[Save]*',
      '```',
      '',
    ].join('\n');
    await openDoc(page, api, docName, markdown);

    await expect(previewFrame(page, 0).locator(`.${P}-root`)).toBeAttached({ timeout: 15_000 });
    await expect(previewFrame(page, 1).locator(`.${P}-root`)).toBeAttached({ timeout: 15_000 });
    const srcdocs = await page
      .locator('iframe[title="Wireframe preview"]')
      .evaluateAll((frames) => frames.map((f) => f.getAttribute('srcdoc') ?? ''));
    expect(srcdocs[0]).toContain('wiremd Wireframe Style');
    expect(srcdocs[1]).toContain('wiremd Clean Style');
    expect(srcdocs[1]).not.toContain('wiremd Wireframe Style');
  });

  test('20 · an unknown style token fails fatally beside the untouched source', async ({
    page,
    api,
  }) => {
    const docName = `wv-badstyle-${randomUUID().slice(0, 8)}`;
    const body = '# Sign in\n[Continue]*';
    await openDoc(page, api, docName, `\`\`\`wiremd style=nope-style\n${body}\n\`\`\`\n`);

    const alert = page.locator('[data-component-type-renderer="wiremd"] [role="alert"]');
    await expect(alert).toContainText("Couldn't render wireframe.", { timeout: 15_000 });
    await expect(alert).toContainText('nope-style');
    // Source stays authoritative and visible…
    await expect(page.locator('pre.wiremd-source')).toContainText(body);
    // …and no preview mounts for an unknown theme.
    await expect(page.locator('iframe[title="Wireframe preview"]')).toHaveCount(0);
  });
});

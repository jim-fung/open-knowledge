/**
 * Wiremd hostile-content containment — real-browser proof of the v1
 * security posture (the review's open "no browser-level execution test"
 * gap).
 *
 * The wiremd preview is defended in depth: the parser OMITS html/script
 * constructs (surfacing omissions warnings), the policy renderer blocks
 * dangerous URL schemes, and the committed preview mounts in an iframe
 * whose sandbox attribute carries no allowances at all. The DOM suite
 * asserts these properties against mocks; THIS suite proves them in a
 * live Chromium against the real embed pipeline:
 *
 *   - script-bearing / handler-bearing fence content must not execute
 *     (no dialogs, no window globals set, none of it survives into the
 *     rendered srcdoc);
 *   - javascript:/data: link targets must be absent or inert;
 *   - the sandbox attribute must stay exactly "" (no allow-scripts,
 *     allow-same-origin, allow-forms, …) whatever the fence contains;
 *   - valid surrounding content still renders and prose survives.
 */

import { randomUUID } from 'node:crypto';
import { expect, test, waitForActiveProviderSynced } from './_helpers';

const HOSTILE_FENCE = `\`\`\`wiremd
# Sign in

<script>window.__wiremdPwned = true;</script>

<img src="x" onerror="window.__wiremdPwned = true">

<iframe src="javascript:window.__wiremdPwned = true"></iframe>

Email
[name________________]

[Evil button]{onclick="window.__wiremdPwned = true"}*

[Jailbreak](javascript:window.__wiremdPwned = true)

[Data url](data:text/html,<script>alert(1)</script>)
\`\`\``;

const HOSTILE_DOC = `# Security notebook

Prose before the hostile fence.

${HOSTILE_FENCE}

Prose after the fence.
`;

test.describe('Wiremd hostile-content containment', () => {
  test('script/handler smuggling cannot execute, and the sandbox stays allowance-free', async ({
    page,
    api,
  }) => {
    const violations: string[] = [];
    // Any dialog (alert/confirm/prompt/beforeunload) from preview content is
    // a containment breach — record and dismiss rather than hang the run.
    page.on('dialog', (dialog) => {
      violations.push(`dialog fired: ${dialog.type()} ${dialog.message()}`);
      void dialog.dismiss();
    });

    const docName = `wiremd-hostile-${randomUUID().slice(0, 8)}`;
    await api.createPage(`${docName}.md`);
    await api.replaceDoc(docName, HOSTILE_DOC);
    await page.goto(`/#/${docName}`);
    await waitForActiveProviderSynced(page);
    await page.waitForSelector('.ProseMirror:not(.composer-prosemirror)');

    const fence = page.locator('.jsx-component-wrapper[data-component-type="wiremdfence"]');
    await expect(fence).toHaveCount(1);

    // The preview mounted (valid wiremd rows survive alongside the hostile
    // constructs) and its sandbox grants NOTHING — no scripts, no same-origin,
    // no forms, no popups.
    const frame = page.frameLocator('iframe[title="Wireframe preview"]');
    await expect(frame.locator('.ok-wiremd-root')).toBeAttached({ timeout: 15_000 });
    const sandbox = await page.locator('iframe[title="Wireframe preview"]').getAttribute('sandbox');
    expect(sandbox).toBe('');

    // The smuggled markup must not survive as LIVE constructs. (Substring
    // checks over srcdoc are the wrong instrument — a blocked URL's scheme
    // text legitimately survives as visible paragraph text — so assert on
    // frame DOM structure instead.)
    await expect(frame.locator('script')).toHaveCount(0);
    await expect(frame.locator('iframe, embed, object, link[rel="import"]')).toHaveCount(0);
    const handlerAttrs = await frame
      .locator('*')
      .evaluateAll((nodes) =>
        nodes.flatMap((el) =>
          [...el.attributes]
            .filter((attr) => attr.name.toLowerCase().startsWith('on') && attr.value !== '')
            .map((attr) => `${attr.name}=${attr.value}`),
        ),
      );
    expect(handlerAttrs).toEqual([]);
    const liveTargets = await frame
      .locator('a[href]')
      .evaluateAll((anchors) =>
        anchors.map((a) => (a.getAttribute('href') ?? '').trim().toLowerCase()),
      );
    for (const href of liveTargets) {
      expect(href).not.toMatch(/^javascript:/);
      expect(href).not.toMatch(/^data:/);
    }

    // The hostile constructs were OMITTED, not silently kept — the omissions
    // banner explains what was dropped while the rest renders.
    await expect(page.getByText('Wireframe rendered with omissions.')).toBeVisible();

    // Nothing executed anywhere: no injected global on the host page…
    const pwnedHost = await page.evaluate(() =>
      Boolean((window as { __wiremdPwned?: boolean }).__wiremdPwned),
    );
    expect(pwnedHost).toBe(false);
    // …and no dialogs fired during mount or the settle window.
    await page.waitForTimeout(500);
    expect(violations).toEqual([]);
  });

  test('blocked URL schemes leave no live targets in the rendered preview', async ({
    page,
    api,
  }) => {
    const docName = `wiremd-urls-${randomUUID().slice(0, 8)}`;
    await api.createPage(`${docName}.md`);
    await api.replaceDoc(
      docName,
      'Links notebook.\n\n```wiremd\n[Click me](javascript:alert(1))\n[And me](data:text/html,hello)\n[Safe](https://example.com)\n```\n',
    );
    await page.goto(`/#/${docName}`);
    await waitForActiveProviderSynced(page);
    await page.waitForSelector('.ProseMirror:not(.composer-prosemirror)');

    const frame = page.frameLocator('iframe[title="Wireframe preview"]');
    await expect(frame.locator('.ok-wiremd-root')).toBeAttached({ timeout: 15_000 });

    // Whatever anchors exist inside the frame, NONE may carry a live
    // dangerous href. (Cross-origin srcdoc: inspect through frameLocator,
    // never contentDocument.)
    const hrefs = await frame.locator('a').evaluateAll((anchors) =>
      anchors.map((a) => ({
        text: a.textContent ?? '',
        href: a.getAttribute('href') ?? '',
      })),
    );
    for (const { href } of hrefs) {
      expect(href.trim().toLowerCase()).not.toMatch(/^javascript:/);
      expect(href.trim().toLowerCase()).not.toMatch(/^data:/);
    }
    // The safe link survived — the block is targeted, not indiscriminate.
    expect(hrefs.some(({ href }) => href === 'https://example.com')).toBe(true);
  });
});

# Website languages

The shared layout includes an Indonesian/English language dialog for first-time visitors. The selection is stored locally under `kang-denz-language`; the ID/EN control reopens the dialog. No translation service or visitor data is sent to a third party.

`src/i18n/catalog.json` maps existing website text to `[Indonesian, English]` pairs. `src/i18n/extra.json` contains dynamic UI labels and messages. Add or update the corresponding pair whenever visible copy changes. Brand names, contact numbers, and URLs remain unchanged.

`src/i18n/client.ts` translates text and accessible labels while preserving DOM elements, form values, links, and event handlers. New dynamic text is observed and translated. User-entered text is never translated. Booking uses stable internal service values for routing, and translates only message labels and selected service names.

Language changes update the current page without navigation. The saved preference carries across portfolio and journal pages. JavaScript is required for language selection; the existing server-rendered content remains accessible without it.

Validation:

- `node scripts/test-language.mjs` (Node 24): translation round trips, dynamic content, storage, picker behavior, and bilingual booking messages.
- `npm run build`
- `python scripts/audit-build.py`

Footer behavior: no bottom padding is added to the body. Floating booking/coffee controls hide while the footer intersects the viewport, and vertical overscroll is disabled where supported.

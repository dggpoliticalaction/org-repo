# ISSUES.md

## Improve development experience:

- [P1] Copy `dgg-political-action` README.md to `pragmatic-papers`. Make any necessary updates.
- [P2] Re-add admin links to homepage if database is not seeded.
- [P3] First user sign up should default to Admin.
- [P3] Improve seeding (cover all collections, blocks, fix article images).

## New Header

We need to do a Header Refresh al la Foreign Affairs complete with a few different tasks.

- Create **Header Block**: `OffCanvasBlock` in `./src/Header/OffCanvasBlock/index.tsx`. Use shadcn `Sheet`
- Add a second Nav to the Global Header (Responsively). Add the OffCanvasBlock to the Global Header (Responsively). Create sticky header on scroll
- Find/Create Stacked SVG of Pragmatic Papers Logo

## Accessibility:

I want to improve our accessibility by maxing out our Lighthouse Score.

- [P1] Accessibility: [Heading elements are not in a sequentially-descending order](https://dequeuniversity.com/rules/axe/4.11/heading-order)
- [P1] Accessibility: [Document does not have a main landmark](https://dequeuniversity.com/rules/axe/4.11/landmark-one-main)
- [P2] Performance: Header svg image doesn't have width and height set.

## Performance

The default theme handling in this payload template is leaving a lot to be desired. Crazy useEffects everywhere that we need to scrap. Want to research replacing the current implementation with the standard way using session storage/media-prefers.

## Future Research:

- Should we being using `next/image` for images? We currently use a plain `img` tag, while the template we forked now uses next/image. [ImageMedia.tsx](https://github.com/payloadcms/payload/blob/main/templates/with-vercel-website/src/components/Media/ImageMedia/index.tsx)

# Life timeline

The public page is `/life`. It is separate from the research blog. Its entries live in `src/data/life-stories.ts`, newest first, and the media files live in `public/images/life/` (or another folder under `public/`).

## Add a day

1. Save a photo, video, and optional video poster in `public/images/life/`. Use media you have permission to publish. Keep the original social post URL.
2. Add an item to `lifeStories` with the actual post date (`YYYY-MM-DD`), displayed date, source, URL, English and Vietnamese title and summary.
3. Set `kind: 'photo'` with `image` and `imageAlt`; or `kind: 'video'` with `video`, `image` as its poster, and `imageAlt`. Local videos have playback controls and the poster joins the scroll slice reveal.
4. For a temporary social story without a durable media file, use `kind: 'external-video'`. The page links to the original story and warns that the link may expire.
5. Run `npm run typecheck`, `npm run build`, and `npx playwright test tests/04-life.spec.ts`, then deploy.

The initial photos come from public posts on `@leduy.py`. The cover uses the March 22, 2021 leaf portrait. A Facebook photo marked "Only me" was excluded from the public site.

Posting on Instagram or a personal Facebook profile does not currently update this page automatically. Direct account syncing would require a supported Meta account, app authorization, and a separately configured feed. Until then, add entries through the data file and deploy.

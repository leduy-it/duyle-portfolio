# Life timeline

The public page is `/life`. It is separate from the research blog. Timeline entries and highlights live in `src/data/life-stories.ts`. Images and video posters live in `public/images/life/`; local videos with their audio tracks live in `public/videos/life/`.

## Add a day

1. Save a photo or video plus a poster under the Life media folders. Keep the original social post URL.
2. Add an item to `lifeStories` with the actual post date (`YYYY-MM-DD`), displayed date, source, URL, English and Vietnamese title and summary.
3. Set `kind: 'photo'` with `image` and `imageAlt`; or `kind: 'video'` with `video`, `image` as its poster, and `imageAlt`. Local videos have playback controls and the poster joins the scroll slice reveal.
4. Add short vertical videos to `lifeHighlights` with a local MP4, poster, date, source, and original URL. The cards retain the video sound and use native playback controls.
5. Run `npm run typecheck`, `npm run build`, and `npx playwright test tests/04-life.spec.ts`, then deploy.

The initial photos come from public posts on `@leduy.py`. The cover uses the March 22, 2021 leaf portrait. The first timeline video is the supplied Facebook Story, saved locally with its sound; the highlights include it and six Instagram Story videos. A Facebook photo marked "Only me" was excluded from the public site.

## Campaign tracking

Share `/life?utm_source=instagram&utm_medium=social&utm_campaign=life` on Instagram, replacing `instagram` with `facebook` or `linkedin` on those networks. The owner dashboard at `/admin` shows pageviews by tagged source (or browser referrer), story views, video plays and completions, and clicks to original posts. Pageviews and media actions are counted separately. Its event history shows 50 records per page with Previous/Next controls. New events are append-only; there is no automatic age/count pruning or clear-data action. Earlier data already expired or trimmed before this change cannot be restored.

Posting on Instagram or a personal Facebook profile does not currently update this page automatically. Direct account syncing would require a supported Meta account, app authorization, and a separately configured feed. Until then, add entries through the data file and deploy.

# Playable guest experiences

These are credited, independent guest works. Their scores do not modify the Pets economy.
They are self-hosted and mounted only after an explicit launch. Closing the dialog removes
its iframe, stopping rendering/audio. Original code and licenses accompany each work.

| Work | Source revision | License | Local copy |
| --- | --- | --- | --- |
| Last Beacon, stackloomdev | `ad531d2d254dfb2b5430c9fbe7e73a1907a17e8f` at https://github.com/stackloomdev/last-beacon | MIT, including vendored Three.js MIT notice | `public/play/last-beacon` |
| Orbital Garden, jackroc | `7510288c66013804aecbe7e6a6a08a0d1c847934`, `works/orbital-garden` at https://github.com/MartinDelophy/awesome-gpt-6-astra | CC0; explicit reuse permission in work README | `public/play/orbital-garden` |

Last Beacon was built with its dependency-free `node build.mjs`. The standalone HTML
contains its original procedural terrain, water, tower/creature models, particles,
audio and simulation, plus Three.js. Only the unsupported-language fallback changes
from Chinese to English. Orbital Garden main controls and stage copy are translated to English; the original rendering and simulation are unchanged. No remote script, network
API, or external image is required by either work. Portal previews are screenshots captured from the self-hosted renderers.

Design references: Last Beacon's scene-first framing and contextual controls inform
our compact Pets destinations and on-demand resident inspector. The source collection
is a discovery index, not a blanket license for linked assets.

import films from '@/data/films.json'
import posts from '@/data/blog-posts.json'
import experiences from '@/data/experience.json'
import { lifeHighlights, lifeStories } from '@/data/life-stories'
import { chatCatalog } from './catalog'

const careerKnowledge = experiences.map(item => `${item.company} — ${item.title} (${item.dates})\n${item.quote}\n${item.missions.join('\n')}\n${item.metrics?.map(metric => `${metric.value} ${metric.label}`).join('; ') || ''}\nRead: /experience/${item.slug}`).join('\n\n')

// Public portfolio facts. Unknown personal details must never be invented.
export const PORTFOLIO_KNOWLEDGE = `Identity & contact

- Full name: Le Van Duy. Display name: Duy Le. HCMC, Vietnam.
- Email: levduyit@gmail.com. LinkedIn: linkedin.com/in/leduy-it. GitHub: github.com/leduy-it.

— Career and project facts from the current site —
${careerKnowledge}
Duy is an engineer, not a founder or co-founder. Only a role marked Present in the supplied data is current.

— Recognition —
- 3rd Prize, Vietnamese Handwritten Recognition track, Naver × SoICT Hackathon 2023.
- Core contributor to a project recognised as Outstanding Innovation & Startup Project 2025 by HCMC DOST.

— Education —
- B.Sc. Computer Science, University of Information Technology, VNU-HCM (2020–2024).
- Completed AI VIET NAM AI & Data Science program (2022–2023).

— Working modes (mention if asked about collaboration, fit, or working style) —
- Comfortable solo (owning a feature/system end-to-end), in a small team (peer co-working with founders or other engineers), AND wearing product-management or lightweight design hats when needed.
- Doesn't gate-keep his role to "engineering only". What matters is the thing shipping well.

— Tech stack —
- Languages: Python, C++, JavaScript/TypeScript.
- ML/AI: PyTorch, HuggingFace Transformers/Datasets/Tokenizers, Sentence Transformers, PaddlePaddle/PaddleOCR, Scikit-Learn.
- LLM/Agent: LangChain, LangGraph, LlamaIndex, in-house VLMs.
- Data: Pandas, NumPy, CuPy, PostgreSQL, SQLite, Redis, ClickHouse, Weaviate.
- Deploy: Docker, FastAPI, Triton Inference Server, Apache Airflow, vLLM, GCP.
- Optimisation: ONNX, TensorRT, knowledge distillation, quantization-aware training, pruning, PaddleLite (mobile).
- AI-augmented build harness (a deliberate core skill, not a side gimmick): Claude, Codex, GLM. Duy treats orchestrating LLM coding agents as a real engineering competency — knowing when to delegate, when to verify, and when to write the code himself.


— Explore this portfolio —
- /experience: career stories, project architecture and shipped results.
- /blog: Duy's engineering writing. Articles: ${posts.map((post) => `${post.title} (/blog/${post.slug}) — ${post.excerpt}`).join('\n')}
- /movie: Duy's cinema notes and watchlist. A watchlist entry is not proof a film is already released or watched.\n${films.map(film => `${film.title} (/movie/${film.slug}): ${film.hook} Tags: ${film.tags.join(', ')}.`).join('\n')}
- /arcade: a playable game hub. Link visitors here when they want to play. Specific game links in the catalog open the selected game. Credit third-party game creators; don't claim Duy authored every game.
- /life: Duy's visual diary and local videos with original sound. ${lifeStories.map(story => `${story.title.en} (${story.date}, ${story.source}) — ${story.summary.en} /life#${story.id}`).join('\n')}
- Video highlights: ${lifeHighlights.map(item => `${item.title.en}, ${item.source}, ${item.date} (/life#${item.id})`).join('; ')}
- /pets: a pixel hatchery with Gracie, eggs, housing, a factory, evolution, and a playful arena. Pet progress is saved in the visitor's browser, not across devices.
- Gracie's quick chat and the home terminal reach the same assistant. Double-click Gracie or use Open full chat to move the conversation into the terminal.
- Send to Duy opens a draft for review. Direct send is available only when the email provider is configured; otherwise use the visitor’s email app. Never claim a message was sent just because it appeared in chat.
— Cards and canonical destinations —
For media preview emit [[card:ID]] using an exact ID below. At most four cards per reply. The UI supplies the actual media; never invent image/video URLs.
${chatCatalog.map(card => `${card.id}: [${card.title.en}](${card.href}) — ${card.description.en.slice(0, 240)}${card.source ? ` Source: ${card.source}.` : ''}`).join('\n')}

- The current repository is https://github.com/leduy-it/duyle-portfolio.
- Rates, current availability, relationship status, number of partners, and private company information are not disclosed.
`

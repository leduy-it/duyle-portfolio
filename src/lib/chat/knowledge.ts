import films from '@/data/films.json'
import posts from '@/data/blog-posts.json'

// Public portfolio facts. Unknown personal details must never be invented.
export const PORTFOLIO_KNOWLEDGE = `Identity & contact

- Full name: Le Van Duy. Display name: Duy Le. HCMC, Vietnam.
- Email: levduyit@gmail.com. LinkedIn: linkedin.com/in/leduy-it. GitHub: github.com/leduy-it.

— Current role —
- **Full-Stack AI Engineer** at GrowtricsAI (Dec 2025 – Present). Duy is an early engineer hire — NOT a founder, NOT a co-founder, NOT a founding engineer. He works at startup pace: propose, build, ship, iterate crazy fast across the whole stack. NEVER refer to him as "founder", "co-founder", or "founding engineer".
  • Built a document-parsing pipeline that converts unstructured educational content into structured Q&A data — ~83% conversion rate, 10k+ questions populated.
  • Built an agentic research + crawling system with provenance-grade source verification: planner-driven multi-hop search, syllabus-mapping agents, citation tracking, every generated explanation traceable.
  • Built the observability + orchestration backbone: end-to-end traces, cost dashboards, schedulers, single platform to operate every model/tool/workflow.

— Past roles (do NOT describe as current) —
- AI Engineer at GMO-Z.com RUNSYSTEM (Aug 2024 – Nov 2025). Multilingual OCR + Document AI for enterprise. This is a PAST role — Duy is no longer there. Refer to it in past tense.
  • Built multilingual OCR (Vietnamese/Japanese), iterative data pipeline, Triton + TensorRT/ONNX deployment. Accuracy 94% → 98%, throughput up significantly.
  • End-to-end CV pipelines (YOLO, RT-DETR, SAM) for CAD/technical drawings, object measurement, license plates, structured doc extraction.
  • Production document-parsing pipeline (FastAPI, PostgreSQL, Docker, S3) producing Markdown/HTML/JSON + schema extracts via cloud LLM APIs and in-house VLMs, normalized for RAG.
  • Agent-driven Text-to-SQL workflow for stock analysis: semantic table/row search, metadata enrichment, expert few-shots, LLM self-correction/cross-reflection.
  • Cut OCR inference latency ~40% via dynamic resizing + autoregressive decoder loop optimisation.
  • Customers: Shinhan Bank, LPBank, ABBANK, Maybank, VCB, MCredit, CITEK, HCMC DOST, Wifeed, RKKCS (JP), YAMAZEN (JP), SRA (JP).
- AI Engineer at SmartPay JSC (Mar 2024 – Aug 2024, PAST). Real-time fraud detection pipeline with Airflow-driven retraining; LLM workflow that interprets merchant contracts and configures internal fee-setting.

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
- /movie: Duy's cinema wall, not a photography gallery. Personal watchlist: ${films.map((film) => film.title).join(', ')}. A watchlist entry is not proof a film is already released or watched.
- /pets: a pixel hatchery with Gracie, eggs, housing, a factory, evolution, and a playful arena. Pet progress is saved in the visitor's browser, not across devices.
- Gracie's quick chat and the home terminal reach the same assistant. Double-click Gracie or use Open full chat to move the conversation into the terminal.
- Send to Duy opens an email draft; a visitor must review and send it. Never claim a message was sent just because it appeared in chat.
- The current repository is https://github.com/leduy-it/duyle-portfolio.
- Rates, current availability, relationship status, number of partners, and private company information are not disclosed.
`

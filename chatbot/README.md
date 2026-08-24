# Kashru Technologies Chatbot Widget

Lightweight AI chatbot for `https://kashru.san-vad.com/`.

It includes:

- FastAPI backend with a `/api/v1/chat` endpoint
- LangChain RAG pipeline
- FAISS vector index built from `/knowledge`
- Groq LLM support with Gemini fallback for rate limits or outages
- Vanilla JS embeddable chat widget

## Project Structure

```text
app/main.py             App factory: CORS, routes, startup warm-up
app/api/v1/             Route handlers (thin, no business logic)
app/core/               Settings (pydantic-settings) + logging setup
app/services/           RAG retrieval + LLM orchestration services
app/models/             Pydantic request/response schemas
tests/                  pytest suite (FastAPI TestClient)
.github/workflows/ci.yml  CI: install deps and run tests on push/PR to main
knowledge/              Add .txt or .md knowledge files here
scripts/build_index.py  Builds or refreshes the FAISS index
storage/faiss_index/    Generated index files, not committed
widget/                 Embeddable JS widget and local demo page
render.yaml             Render free-tier deployment config
```

## Local Setup

1. Create a virtual environment and install dependencies.

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

2. Create your `.env` file.

```bash
copy .env.example .env
```

Add at least `GROQ_API_KEY`. Add `GEMINI_API_KEY` if you want fallback support.
The default Gemini fallback model is `gemini-3.7-flash`; if Google changes model availability again, update `GEMINI_MODEL` in `.env`.

3. Build the FAISS index.

```bash
python scripts/build_index.py
```

4. Run the API.

```bash
uvicorn app.main:app --reload
```

5. Test the endpoint.

```bash
curl -X POST http://localhost:8000/api/v1/chat ^
  -H "Content-Type: application/json" ^
  -d "{\"message\":\"What services does Kashru offer?\"}"
```

Run the test suite:

```bash
pytest tests/ -v
```

## Add More Knowledge

Drop any `.txt` or `.md` files into the `knowledge/` folder. Good examples:

- `knowledge/faq.md`
- `knowledge/pricing-notes.md`
- `knowledge/projects.md`
- `knowledge/about.md`

Then rebuild the index:

```bash
python scripts/build_index.py
```

Redeploy or restart the backend after rebuilding.

## Widget Embed

After deploying the backend, host `widget/kashru-chat-widget.js` somewhere public, such as the Kashru site assets folder.

Add this single script tag before the closing `</body>` tag:

```html
<script
  src="https://kashru.san-vad.com/assets/kashru-chat-widget.js"
  data-api-url="https://YOUR-RENDER-SERVICE.onrender.com/api/v1/chat"
></script>
```

For local testing, open `widget/demo.html` while the API is running on `http://localhost:8000`.

## Render Deployment

1. Push this project to GitHub.
2. In Render, create a new Blueprint or Web Service from the repo.
3. Use the included `render.yaml`, or configure manually:
   - Build command: `pip install -r requirements.txt && python scripts/build_index.py`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables:
   - `GROQ_API_KEY`
   - `GEMINI_API_KEY` optional but recommended
   - `ALLOWED_ORIGINS=https://kashru.san-vad.com`

Render free services may sleep when idle, so the first answer after inactivity can be slower.

## Behavior Rules

The assistant keeps replies short and answers from the knowledge base. For pricing, timelines, quote requests, or project-start requests, it does not invent details and returns a WhatsApp handoff:

`https://wa.me/919806604871?text=Hi%20Kashru%20Technologies%2C%20I%20want%20to%20discuss%20a%20project`

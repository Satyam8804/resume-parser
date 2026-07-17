# Resume Parser

Upload a PDF resume and get it parsed into structured data automatically. A FastAPI backend extracts text from the PDF and uses Groq (Llama 3.3 70B) to convert it into structured JSON, which a React frontend renders as an editable form — no manual data entry required.

## Features

- **Drag-and-drop PDF upload** with client-side validation (file type, size, empty-file checks)
- **LLM-powered extraction** of personal info, summary, education, experience, projects, skills, and certifications
- **Editable form** pre-filled with extracted data — every field can be corrected before saving
- **Dynamic entries** — add or remove education, experience, project, and certification entries
- Upload progress indicator and inline error handling

## Tech Stack

**Frontend**
- React
- Tailwind CSS
- Axios
- lucide-react (icons)

**Backend**
- FastAPI
- Groq API (`llama-3.3-70b-versatile`)
- pypdf (PDF text extraction)
- Pydantic (schema validation)

## Project Structure

```
.
├── frontend/
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── FileUploader.jsx
│           └── ResumeForm.jsx
└── backend/
    ├── main.py
    ├── routes/
    │   └── upload.py
    ├── schemas/
    │   └── user.py
    └── uploads/          # uploaded PDFs (gitignored)
```

## Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install fastapi uvicorn pypdf python-dotenv groq python-multipart
```

Create a `.env` file in `backend/`:

```
GROQ_API_KEY=your_groq_api_key_here
```

Run the server:

```bash
uvicorn main:app --reload
```

Backend runs at `http://127.0.0.1:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## How It Works

1. User uploads a PDF resume via drag-and-drop or file picker.
2. The file is validated client-side (must be a PDF, under the size limit) and sent to `POST /api/upload`.
3. The backend extracts raw text with `pypdf`, then sends it to Groq's Llama 3.3 model along with a JSON schema derived from the `User` Pydantic model.
4. The model returns structured JSON, which is validated against the schema and sent back to the frontend.
5. The frontend normalizes the response and pre-fills the resume form for the user to review and edit.

## Environment Variables

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | API key for Groq, used to call the Llama 3.3 model |

## License

MIT
# ⚖️ LegalClear AI – Generative AI for Demystifying Legal Documents

**LegalClear AI** is an AI-powered legal intelligence platform that simplifies complex legal documents such as contracts, agreements, and Terms of Service (TOS).

The platform uses **Generative AI and Retrieval-Augmented Generation (RAG)** to analyze legal documents and transform complex legal language into clear, understandable explanations.

Users can upload documents and interact with them through an **AI assistant** that summarizes content, explains clauses, and highlights potential risks.

---

# 🚀 Key Features

### 📄 Document Upload

Upload legal documents in **PDF, DOCX, or TXT** format.

### 🧠 AI-Powered Summarization

Automatically generate **short summaries** from long legal documents.

### ⚠️ Risk Detection

Identify **potential legal risks and liabilities** in contracts.

### 🔍 Clause Explanation

Explain complex legal clauses in **simple and easy language**.

### 💬 AI Document Assistant

Ask questions about your uploaded document and receive **AI-generated answers**.

---

# 🧠 AI Architecture (RAG Pipeline)

LegalClear AI uses a **Retrieval-Augmented Generation (RAG)** architecture to provide accurate answers from uploaded documents.

### Workflow

1. User uploads a legal document
2. Document text is extracted and split into chunks
3. **Gemini Embeddings** convert text into vectors
4. Vectors are stored in **Pinecone Vector Database**
5. User asks a question
6. Relevant document chunks are retrieved from Pinecone
7. **Gemini LLM** generates an accurate response using retrieved context

This approach ensures **context-aware and reliable answers**.

---

# 🛠️ Tech Stack

## Backend

* Python
* FastAPI
* LangChain
* Google Gemini LLM
* Gemini Embeddings (`text-embedding-004`)

## Vector Database

* Pinecone

## Frontend

* React
* Vite
* Framer Motion
* Lucide React
* Custom CSS

---

# 📂 Project Structure

```
LegalClear-AI
│
├── backend
│   ├── main.py
│   ├── rag_pipeline.py
│   ├── requirements.txt
│   └── .env
│
├── frontend
│   ├── src
│   ├── components
│   ├── pages
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/legalclear-ai.git
cd legalclear-ai
```

---

# 2️⃣ Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate environment:

**Windows**

```bash
venv\Scripts\activate
```

**Mac/Linux**

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create `.env` file:

```
GOOGLE_API_KEY=your_gemini_api_key
PINECONE_API_KEY=your_pinecone_key
```

Start the backend server:

```bash
uvicorn main:app --reload
```

Backend runs at:

```
http://localhost:8000
```

---

# 3️⃣ Frontend Setup

Open a new terminal.

Navigate to frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# 🔄 How the Platform Works

1️⃣ Upload a legal document
2️⃣ AI processes and analyzes the document
3️⃣ The system generates embeddings and stores them in Pinecone
4️⃣ Users ask questions about the document
5️⃣ AI retrieves relevant information and generates clear answers

---

# 🌍 Use Cases

* Understanding **Terms of Service**
* Reviewing **business contracts**
* Checking **freelance agreements**
* Legal document learning for **students**
* Simplifying legal text for **non-experts**

---

# 👨‍💻 Team

**Project Title:** Generative AI for Demystifying Legal Documents

Team Members:

* R. Kanishkar
* S. Kamalesh
* K. Harriesh


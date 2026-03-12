const API_BASE = import.meta.env.VITE_API_URL || 'https://generative-ai-for-demystifying-legal-w547.onrender.com';

const api = {
  // ── Health ──────────────────────────────────────────────────────────────────
  async health() {
    const res = await fetch(`${API_BASE}/api/health`);
    return res.json();
  },

  async status() {
    const res = await fetch(`${API_BASE}/api/status`);
    return res.json();
  },

  // ── Documents ───────────────────────────────────────────────────────────────
  async uploadDocument(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE}/api/upload`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          reject(new Error(data.detail || 'Upload failed'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(formData);
    });
  },

  async listDocuments() {
    const res = await fetch(`${API_BASE}/api/documents`);
    if (!res.ok) throw new Error('Failed to list documents');
    return res.json();
  },

  async deleteDocument(docId) {
    const res = await fetch(`${API_BASE}/api/documents/${docId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete document');
    return res.json();
  },

  // ── AI Features ─────────────────────────────────────────────────────────────
  async summarize(docId) {
    const res = await fetch(`${API_BASE}/api/summarize/${docId}`, {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Summarization failed');
    return data;
  },

  async explainClause(docId, clause) {
    const res = await fetch(`${API_BASE}/api/explain-clause`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doc_id: docId, clause }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Clause explanation failed');
    return data;
  },

  async askQuestion(docId, question) {
    const res = await fetch(`${API_BASE}/api/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doc_id: docId, question }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Question answering failed');
    return data;
  },

  async analyzeRisks(docId) {
    const res = await fetch(`${API_BASE}/api/analyze-risks/${docId}`, {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Risk analysis failed');
    return data;
  },
};

export default api;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Search, ChevronRight, CornerDownRight, Zap } from 'lucide-react';
import api from '../api';

export default function ClauseExplainer({ docId }) {
  const [clause, setClause] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const explain = async () => {
    if (clause.length < 10) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.explainClause(docId, clause);
      setResult(data.explanation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    "Limitations of liability for consequential damages...",
    "Force majeure events including unforeseen strikes...",
    "Termination for convenience with 30-day notice period..."
  ];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 40 }}>
        <span className="section-label">Clause_Input_Vector</span>
        <div style={{ position: 'relative' }}>
          <textarea
            className="input"
            value={clause}
            onChange={e => setClause(e.target.value)}
            placeholder="PASTE_CLAUSE_TEXT_HERE..."
            rows={5}
            style={{ 
              borderRadius: 0, 
              background: 'transparent', 
              fontSize: 15, 
              lineHeight: 1.6, 
              padding: 24,
              border: '1px solid var(--border-lg)',
              fontFamily: 'var(--font-body)'
            }}
          />
          <div style={{ position: 'absolute', bottom: 12, right: 12, fontSize: 10, fontWeight: 800, color: 'var(--text-4)', letterSpacing: '0.1em' }}>
            {clause.length}_BYTESCached
          </div>
        </div>
      </div>

      {!result && (
        <div style={{ marginBottom: 40 }}>
          <span className="section-label" style={{ marginBottom: 20 }}>Common_Patterns</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {examples.map((ex, i) => (
              <button 
                key={i} 
                onClick={() => setClause(ex)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 0,
                  padding: '16px',
                  color: 'var(--text-2)',
                  fontSize: 12,
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'all 0.3s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--white)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ width: 4, height: 4, background: 'var(--text-4)' }} />
                <span className="serif-italic">{ex}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        className="btn btn-primary btn-lg hover-lift"
        onClick={explain}
        disabled={loading || clause.length < 10}
        style={{ width: '100%', height: 60, borderRadius: 0 }}
      >
        {loading ? <div className="spinner" /> : <><Zap size={14} style={{ marginRight: 12 }} /> EXECUTE_DECODING</>}
      </button>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 60 }}>
          <span className="section-label" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 24, height: 1, background: 'var(--white)' }} />
            Decoded_Semantic_Intent
          </span>
          <div className="md glass" style={{ padding: 40, borderRadius: 0, color: 'var(--text-1)', fontSize: 16 }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
          </div>
        </motion.div>
      )}

      {error && (
        <div style={{ marginTop: 32, padding: '16px', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 0, color: '#ff6b6b', fontSize: 11, fontWeight: 800, letterSpacing: '0.05em' }}>
          SYSTEM_FAULT: {error.toUpperCase()}
        </div>
      )}
    </div>
  );
}

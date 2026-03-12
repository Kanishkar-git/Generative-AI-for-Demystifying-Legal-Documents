import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, RefreshCw, Copy, CheckCheck, Clock, Layers, Hash, Zap } from 'lucide-react';
import api from '../api';

export default function SummaryPanel({ docId, filename, wordCount }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.summarize(docId);
      setSummary(data.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const estimatedReadTime = wordCount ? Math.ceil(wordCount / 250) : null;

  const stats = [
    { label: 'FILENAME', value: filename?.split('/').pop() || '—', icon: FileText },
    { label: 'READ_TIME', value: estimatedReadTime ? `${estimatedReadTime} MIN` : '—', icon: Clock },
    { label: 'WORD_COUNT', value: wordCount?.toLocaleString() || '—', icon: Hash },
    { label: 'PROCESSING', value: 'NEURAL_GEN', icon: Zap },
  ];

  if (loading) {
    return (
      <div style={{ padding: '100px 0', textAlign: 'center' }}>
        <div className="spinner spinner-lg" style={{ margin: '0 auto 32px' }} />
        <span className="section-label">Deconstructing_Manifest_Architectures</span>
        <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-4)', fontWeight: 800, letterSpacing: '0.1em' }}>SYNTAX_EXTRACTION_IN_PROGRESS</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {!summary ? (
        <div className="fade-in">
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', 
            background: 'var(--border)', border: '1px solid var(--border)',
            borderRadius: 0, overflow: 'hidden', marginBottom: 48
          }}>
            {stats.map(stat => (
              <div key={stat.label} style={{ background: 'var(--surface-1)', padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-4)', marginBottom: 8 }}>
                  <stat.icon size={11} />
                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.2em' }}>{stat.label}</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>{stat.value}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: '60px 40px', textAlign: 'center', border: '1px dashed var(--border-lg)', borderRadius: 0, marginBottom: 32 }}>
            <p style={{ marginBottom: 32, fontSize: 18, color: 'var(--text-2)', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.5, fontWeight: 300 }}>
              Initialize neural summarization to condense the manifest into a high-density executive brief.
            </p>
            <button className="btn btn-primary btn-lg hover-lift" onClick={generate} style={{ padding: '14px 40px', borderRadius: 0 }}>
              GENERATE_BRIEF
            </button>
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 40, 
            paddingBottom: 24, 
            borderBottom: '1px solid var(--border)' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span className="section-label" style={{ marginBottom: 0 }}>Executive_Summary_Output</span>
              <div style={{ width: 1, height: 16, background: 'var(--border-lg)' }} />
              <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--white)', letterSpacing: '0.1em' }}>(V2.1_STABLE)</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-ghost btn-sm" onClick={copy} style={{ borderRadius: 0, width: 36, height: 36, padding: 0 }}>
                {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setSummary(null)} style={{ borderRadius: 0, width: 36, height: 36, padding: 0 }}>
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          <div className="md glass" style={{ color: 'var(--text-1)', padding: 40, fontSize: 16, borderRadius: 0 }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
          </div>
        </motion.div>
      )}

      {error && (
        <div style={{ marginTop: 32, padding: 16, border: '1px solid rgba(255,107,107,0.2)', borderRadius: 0, color: '#ff6b6b', fontSize: 11, fontWeight: 800, letterSpacing: '0.05em' }}>
          SYSTEM_FAULT: {error.toUpperCase()}
        </div>
      )}
    </div>
  );
}

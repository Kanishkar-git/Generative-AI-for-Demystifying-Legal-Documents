import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ShieldAlert, RefreshCw, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import api from '../api';

export default function RiskAnalysis({ docId }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.analyzeRisks(docId);
      setResult(data.risk_analysis);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '100px 0', textAlign: 'center' }}>
        <div className="spinner spinner-lg" style={{ margin: '0 auto 32px' }} />
        <span className="section-label">Auditing_Document_Integrity</span>
        <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-4)', fontWeight: 800, letterSpacing: '0.1em' }}>RISK_MAP_GENERATION_ACTIVE</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {!result ? (
        <div className="fade-in">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            border: '1px solid var(--border)', 
            borderRadius: 0, 
            overflow: 'hidden', 
            marginBottom: 48 
          }}>
            {[
              { label: 'CRITICAL', color: 'var(--white)', icon: AlertTriangle },
              { label: 'ATTENTION', color: 'var(--text-3)', icon: Info },
              { label: 'COMPLIANT', color: 'var(--text-4)', icon: CheckCircle },
            ].map(item => (
              <div key={item.label} style={{ padding: 24, textAlign: 'center', borderRight: '1px solid var(--border)' }}>
                <item.icon size={18} color={item.color} strokeWidth={1.5} style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', color: 'var(--text-4)' }}>{item.label}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: '64px 40px', background: 'transparent', border: '1px dashed var(--border-lg)', borderRadius: 0, textAlign: 'center' }}>
            <ShieldAlert size={36} strokeWidth={1} style={{ marginBottom: 24, opacity: 0.3 }} />
            <p style={{ fontSize: 18, color: 'var(--text-2)', marginBottom: 32, maxWidth: 440, margin: '0 auto 32px', lineHeight: 1.5, fontWeight: 300 }}>
              Perform a deep-scan risk audit to identify unfavorable clauses and hidden financial architectures.
            </p>
            <button className="btn btn-primary btn-lg hover-lift" onClick={analyze} style={{ padding: '14px 40px', borderRadius: 0 }}>
               EXECUTE_RISK_AUDIT
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
              <span className="section-label" style={{ marginBottom: 0 }}>Risk_Audit_Findings</span>
              <div style={{ width: 1, height: 16, background: 'var(--border-lg)' }} />
              <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--white)', letterSpacing: '0.1em' }}>(INTEGRITY_INDEX_94.2)</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setResult(null)} style={{ borderRadius: 0, width: 36, height: 36, padding: 0 }}>
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="md glass" style={{ padding: 40, color: 'var(--text-1)', fontSize: 16, borderRadius: 0 }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
          </div>
        </motion.div>
      )}

      {error && (
        <div style={{ marginTop: 32, padding: '16px', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 0, color: '#ff6b6b', fontSize: 11, fontWeight: 800, letterSpacing: '0.05em' }}>
          SCAN_ABORTED: {error.toUpperCase()}
        </div>
      )}
    </div>
  );
}

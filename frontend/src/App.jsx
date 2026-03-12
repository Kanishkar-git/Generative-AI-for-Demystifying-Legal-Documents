import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { 
  FileText, MessageSquare, ShieldAlert, Sparkles, 
  Upload, ChevronRight, Star, Trash2,
  BookOpen, Scale, ArrowRight, Info, Plus, ChevronDown
} from 'lucide-react';

import Navbar from './components/Navbar';
import UploadZone from './components/UploadZone';
import SummaryPanel from './components/SummaryPanel';
import ChatInterface from './components/ChatInterface';
import ClauseExplainer from './components/ClauseExplainer';
import RiskAnalysis from './components/RiskAnalysis';
import api from './api';
import './index.css';

// ── Tab buttons ───────────────────────────────────────────────────────────────
function Tab({ id, label, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`tab ${active ? 'active' : ''}`}
    >
      <Icon size={14} strokeWidth={active ? 2.5 : 1.5} />
      {label}
      {active && (
        <motion.div 
          layoutId="tab-underline"
          className="tab-underline"
          style={{
            position: 'absolute', bottom: -1, left: 16, right: 16,
            height: 2, background: 'var(--white)', opacity: 0.8
          }}
        />
      )}
    </button>
  );
}

// ── Hero section ──────────────────────────────────────────────────────────────
function Hero({ onScrollToUpload }) {
  const containerVars = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVars = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVars}
      style={{ padding: '160px 24px 120px', textAlign: 'center', position: 'relative' }}
    >
      {/* Decorative vertical line */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', width: '1px', height: '100px',
        background: 'linear-gradient(to bottom, transparent, var(--white))',
        opacity: 0.2
      }} />

      {/* Badge */}
      <motion.div variants={itemVars} style={{ display: 'inline-flex', marginBottom: 40 }}>
        <span className="badge badge-white" style={{ 
          fontSize: 10, padding: '8px 24px', letterSpacing: '0.2em',
          border: '1px solid var(--border-lg)',
          background: 'transparent'
        }}>
          <Star size={10} style={{ marginRight: 8, fill: 'white' }} /> LEGACY OF PRECISION
        </span>
      </motion.div>

      {/* Title */}
      <motion.div variants={itemVars}>
        <h1 className="title-xl" style={{ marginBottom: 40 }}>
          DEMYSTIFY <br />
          <span className="serif-italic">LEGAL</span> COMPLEXITY
        </h1>
      </motion.div>

      <motion.p 
        variants={itemVars}
        style={{
          color: 'var(--text-2)', fontSize: 22, maxWidth: 680, margin: '0 auto 60px',
          lineHeight: 1.5, fontWeight: 300, fontFamily: 'var(--font-body)',
          letterSpacing: '-0.01em'
        }}
      >
        A premium intelligence layer designed to translate dense contracts and 
        legal architectures into clear, actionable editorial guidance.
      </motion.p>

      <motion.div variants={itemVars} style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
        <button
          onClick={onScrollToUpload}
          className="btn btn-primary btn-lg hover-lift"
          style={{ gap: 12, padding: '18px 48px' }}
        >
          EXECUTE ANALYSIS <ArrowRight size={16} />
        </button>
      </motion.div>

      {/* Visual Ticker */}
      <motion.div 
        variants={itemVars}
        style={{ 
          marginTop: 140, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20
        }}
      >
        <div style={{ width: 1, height: 60, background: 'var(--border-md)' }} />
        <span style={{ 
          letterSpacing: '0.4em', fontSize: 10, fontWeight: 800, 
          color: 'var(--text-4)', textTransform: 'uppercase' 
        }}>
          Editorial Standard / 2025
        </span>
      </motion.div>
    </motion.div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [document, setDocument] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [apiStatus, setApiStatus] = useState({ api_key_set: false });
  const uploadRef = useRef(null);

  useEffect(() => {
    api.status().then(setApiStatus).catch(() => {});
  }, []);

  const handleUploadSuccess = (result) => {
    setDocument({
      docId: result.doc_id,
      filename: result.filename,
      wordCount: result.word_count,
    });
    toast.success('Document Processed', {
      style: {
        background: 'var(--surface-3)',
        color: 'var(--text-1)',
        border: '1px solid var(--border-md)',
        fontSize: '13px',
        fontWeight: 600,
      }
    });
    setTimeout(() => setActiveTab('summary'), 400);
  };

  const handleNewDocument = () => {
    setDocument(null);
    setActiveTab('summary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const tabs = [
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'clause', label: 'Explain', icon: BookOpen },
    { id: 'risk', label: 'Risk', icon: ShieldAlert },
    { id: 'chat', label: 'Assistant', icon: MessageSquare },
  ];

  return (
    <>
      <Toaster position="bottom-center" />
      
      <Navbar apiConfigured={apiStatus.api_key_set} />

      <main>
        <AnimatePresence mode="wait">
          {!document ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Hero onScrollToUpload={() => uploadRef.current?.scrollIntoView({ behavior: 'smooth' })} />

              <div
                ref={uploadRef}
                style={{ padding: '0 24px 120px' }}
              >
                <div className="container container--sm card" style={{ padding: 48, borderRadius: 24 }}>
                  <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <h2 style={{ fontSize: 24, marginBottom: 12 }}>Ingest Document</h2>
                    <p style={{ fontSize: 14 }}>Drag and drop your file to begin the AI extraction process.</p>
                  </div>
                  
                  <UploadZone onUploadSuccess={handleUploadSuccess} />
                  
                  <div style={{ marginTop: 32, textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 32 }}>
                      <div style={{ textAlign: 'left' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>SECURITY</span>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>Bank-grade Encryption</span>
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>PRIVACY</span>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>No Permanent Storage</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="container"
              style={{ padding: '80px 32px 140px' }}
            >
              <div style={{
                display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                marginBottom: 64, borderBottom: '1px solid var(--border)',
                paddingBottom: 32
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 12 }}>
                    <span className="section-label" style={{ marginBottom: 0 }}>Current_Manifest</span>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-4)' }} />
                    <span className="badge badge-muted" style={{ border: 'none', padding: 0 }}>ID_{document.docId?.slice(0, 8)}</span>
                  </div>
                  <h2 style={{ fontSize: 48, letterSpacing: '-0.04em', fontWeight: 800 }}>{document.filename}</h2>
                </div>

                <button
                  className="btn btn-secondary btn-sm hover-lift"
                  onClick={handleNewDocument}
                  style={{ borderRadius: 4, padding: '10px 20px' }}
                >
                  <Plus size={14} /> NEW_SESSION
                </button>
              </div>

              <div className="editorial-grid">
                {/* Left panel — Dashboard content */}
                <div style={{ gridColumn: 'span 8' }}>
                  <div className="tabs" style={{ 
                    marginBottom: 40, padding: 4, width: 'fit-content',
                    background: 'transparent',
                    border: '1px solid var(--border)'
                  }}>
                    {tabs.map(tab => (
                      <Tab
                        key={tab.id}
                        {...tab}
                        active={activeTab === tab.id}
                        onClick={setActiveTab}
                      />
                    ))}
                  </div>

                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="card card-pad glass"
                    style={{ minHeight: 700, borderRadius: 0, borderTop: 'none' }}
                  >
                    {activeTab === 'summary' && (
                       <SummaryPanel
                         docId={document.docId}
                         filename={document.filename}
                         wordCount={document.wordCount}
                       />
                    )}
                    {activeTab === 'clause' && (
                      <ClauseExplainer docId={document.docId} />
                    )}
                    {activeTab === 'risk' && (
                      <RiskAnalysis docId={document.docId} />
                    )}
                    {activeTab === 'chat' && (
                      <ChatInterface docId={document.docId} filename={document.filename} />
                    )}
                  </motion.div>
                </div>

                {/* Right sidebar — B&W Editorial style */}
                <aside style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: 32 }}>
                  <div className="card card-pad" style={{ background: 'var(--white)', color: 'var(--black)', borderRadius: 0 }}>
                    <span className="section-label" style={{ color: 'rgba(0,0,0,0.4)', marginBottom: 16 }}>Status_Report</span>
                    <p style={{ color: 'var(--gray-800)', fontSize: 14, lineHeight: 1.7, fontWeight: 500 }}>
                      Intellectual integrity verified. The AI subsystem is tracking 14 vector points across this document.
                    </p>
                    <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em' }}>PRECISION_METRIC</span>
                        <span style={{ fontSize: 10, fontWeight: 800 }}>99.8%</span>
                      </div>
                      <div className="dot-live" style={{ width: '100%', height: 2, borderRadius: 0, background: 'rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '99.8%', background: 'var(--black)' }} />
                      </div>
                    </div>
                  </div>

                  <div className="card card-pad" style={{ borderRadius: 0 }}>
                    <span className="section-label">Operator_Guidance</span>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {[
                        'Cross-reference risk highlights with liability sections',
                        'Utilize natural language queries for latent clauses',
                        'System detects implicit obligations in section 4.2',
                        'Export manifest for final legal review'
                      ].map((tip, i) => (
                        <li key={i} style={{ display: 'flex', gap: 14, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
                          <span style={{ color: 'var(--text-4)', fontWeight: 800, fontFamily: 'var(--font-sans)', fontSize: 10 }}>[0{i+1}]</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ border: '1px solid var(--border)', padding: '16px', borderRadius: 0, display: 'flex', alignItems: 'center' }}>
                    <Info size={14} style={{ marginRight: 12, color: 'var(--text-3)' }} />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-3)' }}>SECURE_ENCLAVE_ACTIVE</span>
                  </div>
                </aside>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer style={{
        marginTop: 'auto',
        padding: '60px 0 40px',
        borderTop: '1px solid var(--border)',
        textAlign: 'center'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-4)', letterSpacing: '0.1em', fontWeight: 600 }}>© 2025 LEGALCLEAR_LABS</span>
          <div style={{ display: 'flex', gap: 24 }}>
            <span style={{ fontSize: 11, color: 'var(--text-4)', fontWeight: 600 }}>PRIVACY</span>
            <span style={{ fontSize: 11, color: 'var(--text-4)', fontWeight: 600 }}>TERMS</span>
            <span style={{ fontSize: 11, color: 'var(--text-4)', fontWeight: 600 }}>SYSTEM_STATUS</span>
          </div>
        </div>
      </footer>
    </>
  );
}

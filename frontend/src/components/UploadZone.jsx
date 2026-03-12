import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle, AlertCircle, ArrowUp } from 'lucide-react';
import api from '../api';

export default function UploadZone({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    setError(null);
    setSuccess(null);

    if (rejectedFiles.length > 0) {
      const reason = rejectedFiles[0].errors[0]?.message || 'Unsupported file type';
      setError(`INVALID_MANIFEST: ${reason}`);
      return;
    }

    if (!acceptedFiles.length) return;
    
    const file = acceptedFiles[0];
    setUploading(true);
    setProgress(0);

    try {
      const result = await api.uploadDocument(file, setProgress);
      setSuccess({ ...result, name: file.name });
      if (onUploadSuccess) onUploadSuccess(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div style={{ perspective: '1000px' }}>
      <AnimatePresence mode="wait">
        {uploading ? (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              padding: '80px 40px',
              textAlign: 'center',
              border: '1px solid var(--border-lg)',
              borderRadius: 0,
              background: 'var(--surface-1)'
            }}
          >
            <div className="spinner spinner-lg" style={{ margin: '0 auto 32px' }} />
            <span className="section-label">INGESTION_VECTOR_ACTIVE</span>
            <div style={{ width: '100%', height: 1, background: 'var(--border)', overflow: 'hidden', margin: '24px 0 12px' }}>
              <motion.div 
                style={{ height: '100%', background: 'var(--white)', width: `${progress}%` }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-4)', letterSpacing: '0.1em' }}>{progress}%_BITSTREAM_SYNCHRONIZED</span>
          </motion.div>
        ) : success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: '80px 40px',
              textAlign: 'center',
              border: '1px solid var(--white)',
              borderRadius: 0,
              background: 'var(--surface-2)'
            }}
          >
            <CheckCircle size={40} strokeWidth={1} color="var(--white)" style={{ margin: '0 auto 32px' }} />
            <span className="section-label" style={{ color: 'var(--white)', opacity: 1 }}>MANIFEST_VERIFIED</span>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 12, fontFamily: 'var(--font-sans)', fontWeight: 600 }}>{success.name.toUpperCase()}</p>
          </motion.div>
        ) : (
          <motion.div
            {...getRootProps()}
            key="idle"
            style={{
              padding: '100px 40px',
              textAlign: 'center',
              cursor: 'pointer',
              border: `1px solid ${isDragActive ? 'var(--white)' : 'var(--border-md)'}`,
              borderRadius: 0,
              background: isDragActive ? 'var(--surface-2)' : 'transparent',
              transition: 'background 0.4s var(--ease-out), border-color 0.4s var(--ease-out)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <input {...getInputProps()} />
            
            {/* Editorial Corner Markings */}
            <div style={{ position: 'absolute', top: 10, left: 10, width: 10, height: 10, borderLeft: '1px solid var(--text-4)', borderTop: '1px solid var(--text-4)' }} />
            <div style={{ position: 'absolute', top: 10, right: 10, width: 10, height: 10, borderRight: '1px solid var(--text-4)', borderTop: '1px solid var(--text-4)' }} />
            <div style={{ position: 'absolute', bottom: 10, left: 10, width: 10, height: 10, borderLeft: '1px solid var(--text-4)', borderBottom: '1px solid var(--text-4)' }} />
            <div style={{ position: 'absolute', bottom: 10, right: 10, width: 10, height: 10, borderRight: '1px solid var(--text-4)', borderBottom: '1px solid var(--text-4)' }} />

            <div style={{
              width: 56, height: 56,
              background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 32px',
              border: '1px solid var(--border-lg)'
            }}>
              {isDragActive ? <ArrowUp size={24} strokeWidth={1.5} /> : <Upload size={24} strokeWidth={1.5} />}
            </div>
            
            <span className="section-label">SUBMIT_MANIFEST_ID</span>
            <h3 style={{ 
              marginTop: 12,
              marginBottom: 12, 
              fontSize: 24, 
              fontWeight: 800,
              fontFamily: 'var(--font-serif)', 
              letterSpacing: '-0.03em' 
            }}>
              {isDragActive ? 'RELEASE DOCUMENT' : 'INITIALIZE UPLOAD'}
            </h3>
            <p style={{ fontSize: 11, color: 'var(--text-4)', fontWeight: 800, letterSpacing: '0.05em' }}>
              PDF / DOC / TXT_BUFFER_MAX: 10MB
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          style={{
            marginTop: 24, padding: '16px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 0,
            display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
          <AlertCircle size={14} color="var(--white)" />
          <p style={{ color: 'var(--text-2)', fontSize: 11, fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>SYSTEM_ERROR: {error.toUpperCase()}</p>
        </motion.div>
      )}
    </div>
  );
}

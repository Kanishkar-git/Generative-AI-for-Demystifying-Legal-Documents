import React from 'react';
import { Scale, ExternalLink, Globe } from 'lucide-react';

export default function Navbar({ apiConfigured }) {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      padding: '20px 0',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 38, height: 38,
            borderRadius: 0,
            background: 'var(--white)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(255,255,255,0.05)',
          }}>
            <Scale size={20} color="var(--black)" />
          </div>
          <div>
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 800, fontSize: 24,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              color: 'var(--text-1)',
              display: 'block'
            }}>
              LEGAL_CLEAR
            </span>
            <span style={{ 
              color: 'var(--text-4)', 
              fontSize: 9, 
              letterSpacing: '0.4em',
              fontWeight: 800,
              fontFamily: 'var(--font-sans)',
              textTransform: 'uppercase'
            }}>
              AI_EDITORIAL_LAYER
            </span>
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* API status badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid var(--border-md)',
            borderRadius: 0,
          }}>
            <div className={apiConfigured ? 'dot-live' : 'dot-warn'} />
            <span style={{
              color: apiConfigured ? 'var(--text-1)' : 'var(--text-4)',
              fontSize: 10, fontWeight: 800,
              fontFamily: 'var(--font-sans)',
              letterSpacing: '0.1em',
            }}>
              {apiConfigured ? 'NODE_01_ACTIVE' : 'OFFLINE_MODE'}
            </span>
          </div>

          <div style={{ width: 1, height: 16, background: 'var(--border)' }} />

          <a
            href="/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm"
            style={{ 
              borderRadius: 0,
              fontSize: 10,
              fontWeight: 800,
              fontFamily: 'var(--font-sans)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
          >
            <ExternalLink size={12} style={{ marginRight: 8 }} /> DOCUMENTATION
          </a>
        </div>
      </div>
    </nav>
  );
}

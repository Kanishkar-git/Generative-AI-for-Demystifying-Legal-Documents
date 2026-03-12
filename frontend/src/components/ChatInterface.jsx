import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Bot, User, RotateCcw, ArrowUpRight } from 'lucide-react';
import api from '../api';

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        display: 'flex',
        gap: 20,
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 40,
        paddingBottom: 40,
        borderBottom: '1px solid var(--border)'
      }}
    >
      <div style={{
        width: 36, height: 36,
        borderRadius: 0,
        background: isUser ? 'var(--white)' : 'transparent',
        border: '1px solid var(--border-lg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {isUser ? <User size={16} color="var(--black)" /> : <Bot size={16} color="var(--text-1)" />}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ 
          fontSize: 9, 
          fontWeight: 800, 
          letterSpacing: '0.2em', 
          color: 'var(--text-4)', 
          marginBottom: 12,
          textTransform: 'uppercase'
        }}>
          {isUser ? 'USER_INPUT' : 'SYSTEM_REPLY'}
        </div>
        <div className="md" style={{ 
          color: 'var(--text-1)',
          fontSize: 15,
          lineHeight: 1.6
        }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
        </div>
        {msg.sources && (
          <div style={{ 
            marginTop: 20, 
            fontSize: 9, 
            fontWeight: 800, 
            color: 'var(--text-4)',
            letterSpacing: '0.1em',
            padding: '4px 8px',
            border: '1px solid var(--border)',
            display: 'inline-block'
          }}>
            SOURCE_NODES: {msg.sources}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ChatInterface({ docId, filename }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `SYSTEM_ONLINE. Manifest **${filename}** successfully indexed. Initialize query to begin deep extraction.`,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const q = input;
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setInput('');
    setLoading(true);

    try {
      const result = await api.askQuestion(docId, q);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.answer,
        sources: result.sources_used,
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `FATAL_ERROR: ${err.message.toUpperCase()}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 700 }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 20, marginBottom: 32 }}>
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {loading && (
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 40 }}>
            <div className="spinner" />
            <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-4)', letterSpacing: '0.2em' }}>EXTRACTING_DATA...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ position: 'relative' }}>
        <input
          className="input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="ENTER_PROMPT..."
          disabled={loading}
          style={{ 
            paddingRight: 60, 
            borderRadius: 0, 
            height: 60, 
            background: 'transparent',
            border: '1px solid var(--border-lg)',
            fontSize: 14,
            letterSpacing: '0.02em'
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          style={{
            position: 'absolute', right: 10, top: 10,
            width: 40, height: 40,
            background: input.trim() ? 'var(--white)' : 'transparent',
            border: input.trim() ? 'none' : '1px solid var(--border)',
            borderRadius: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: input.trim() ? 'pointer' : 'default',
            transition: 'all 0.3s'
          }}
        >
          <ArrowUpRight size={20} color={input.trim() ? 'var(--black)' : 'var(--text-4)'} />
        </button>
      </div>
    </div>
  );
}

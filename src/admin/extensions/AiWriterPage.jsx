import React, { useState } from 'react';

const CONTENT_TYPES = [
  { label: 'Blog Post',    value: 'blog-post',   fields: ['title', 'excerpt', 'tag', 'body'] },
  { label: 'Case Study',   value: 'case-study',  fields: ['title', 'subtitle', 'description', 'lead', 'challenge', 'solution', 'body3'] },
  { label: 'Testimonial',  value: 'testimonial', fields: ['quote', 'authorName', 'authorRole'] },
  { label: 'FAQ Item',     value: 'faq-item',    fields: ['question', 'answer'] },
];

const FIELD_LABELS = {
  title: 'Title', subtitle: 'Subtitle', description: 'Description',
  lead: 'Lead paragraph', excerpt: 'Excerpt', tag: 'Tag / Category',
  body: 'Body content', challenge: 'Challenge section',
  solution: 'Solution section', body3: 'Impact / Results section',
  quote: 'Testimonial quote', authorName: 'Author name', authorRole: 'Author role',
  question: 'FAQ question', answer: 'FAQ answer',
};

export function AiWriterPage() {
  const [contentType, setContentType] = useState(CONTENT_TYPES[0]);
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(null);
  const [results, setResults] = useState({});
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);

  async function generate(field) {
    if (!context.trim()) {
      setError('Please enter a brief or context first.');
      return;
    }
    setLoading(field);
    setError('');
    try {
      const res = await fetch('/api/ai-writer/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: contentType.value, field, context }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Generation failed');
      setResults(prev => ({ ...prev, [field]: json.content }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  }

  async function generateAll() {
    if (!context.trim()) { setError('Please enter a brief or context first.'); return; }
    setError('');
    for (const field of contentType.fields) {
      await generate(field);
    }
  }

  function copyField(field) {
    navigator.clipboard.writeText(results[field] || '');
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleTypeChange(val) {
    setContentType(CONTENT_TYPES.find(t => t.value === val));
    setResults({});
    setError('');
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.h1}>✦ AI Content Writer</h1>
        <p style={s.sub}>Generate Techius-quality copy for any content type. Powered by Claude AI.</p>
      </div>

      <div style={s.body}>
        {/* Left: inputs */}
        <div style={s.left}>
          <div style={s.card}>
            <label style={s.label}>Content type</label>
            <div style={s.tabs}>
              {CONTENT_TYPES.map(t => (
                <button
                  key={t.value}
                  style={{ ...s.tab, ...(contentType.value === t.value ? s.tabActive : {}) }}
                  onClick={() => handleTypeChange(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <label style={{ ...s.label, marginTop: '20px' }}>Brief / context</label>
            <textarea
              style={s.textarea}
              placeholder={`Describe what you want to write about.\n\nExample: "A blog post about why headless CMS is essential for modern agency sites in 2025"`}
              value={context}
              onChange={e => setContext(e.target.value)}
              rows={6}
            />

            {error && <p style={s.error}>{error}</p>}

            <button
              style={{ ...s.btn, ...s.btnPrimary, opacity: loading ? 0.7 : 1 }}
              onClick={generateAll}
              disabled={!!loading}
            >
              {loading ? 'Generating…' : `Generate all ${contentType.label} fields`}
            </button>
          </div>
        </div>

        {/* Right: results */}
        <div style={s.right}>
          {contentType.fields.map(field => (
            <div key={field} style={s.fieldCard}>
              <div style={s.fieldHeader}>
                <span style={s.fieldName}>{FIELD_LABELS[field]}</span>
                <div style={s.fieldActions}>
                  <button
                    style={{ ...s.btn, ...s.btnSmall, opacity: loading === field ? 0.6 : 1 }}
                    onClick={() => generate(field)}
                    disabled={!!loading}
                  >
                    {loading === field ? '…' : '↺ Generate'}
                  </button>
                  {results[field] && (
                    <button
                      style={{ ...s.btn, ...s.btnSmall, ...s.btnGreen }}
                      onClick={() => copyField(field)}
                    >
                      {copied === field ? '✓ Copied!' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>

              {results[field] ? (
                <textarea
                  style={s.resultArea}
                  value={results[field]}
                  onChange={e => setResults(prev => ({ ...prev, [field]: e.target.value }))}
                  rows={field === 'body' || field === 'challenge' || field === 'solution' || field === 'body3' ? 10 : 3}
                />
              ) : (
                <div style={s.empty}>
                  {loading === field ? 'Writing…' : 'Click Generate to create content for this field'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <p style={s.poweredBy}>Powered by Claude AI (Haiku) · Techius Solutions CMS</p>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh', background: '#F6F6F9',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: '32px',
  },
  header: {
    marginBottom: '28px',
    borderBottom: '1px solid #DCDCE4',
    paddingBottom: '20px',
  },
  h1: {
    fontSize: '24px', fontWeight: 700, color: '#32324D', margin: '0 0 6px',
  },
  sub: { fontSize: '14px', color: '#666687', margin: 0 },
  body: {
    display: 'grid', gridTemplateColumns: '360px 1fr',
    gap: '24px', alignItems: 'start',
  },
  left: {},
  right: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: {
    background: '#fff', borderRadius: '8px',
    border: '1px solid #DCDCE4', padding: '20px',
  },
  label: {
    display: 'block', fontSize: '11px', fontWeight: 700,
    color: '#666687', textTransform: 'uppercase', letterSpacing: '0.07em',
    marginBottom: '8px',
  },
  tabs: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  tab: {
    padding: '5px 12px', fontSize: '12px', fontWeight: 500,
    borderRadius: '4px', border: '1px solid #DCDCE4',
    background: '#fff', color: '#666687', cursor: 'pointer',
  },
  tabActive: {
    background: '#4945FF', color: '#fff', borderColor: '#4945FF',
  },
  textarea: {
    width: '100%', padding: '10px 12px', fontSize: '13px',
    border: '1px solid #DCDCE4', borderRadius: '6px',
    resize: 'vertical', boxSizing: 'border-box',
    fontFamily: 'inherit', color: '#32324D', lineHeight: 1.6,
    background: '#FAFAFF',
  },
  error: { fontSize: '12px', color: '#D02B20', margin: '8px 0' },
  btn: {
    cursor: 'pointer', border: 'none', borderRadius: '6px',
    fontFamily: 'inherit', fontWeight: 600, transition: 'opacity .15s',
  },
  btnPrimary: {
    marginTop: '16px', width: '100%',
    padding: '10px 16px', fontSize: '13px',
    background: '#4945FF', color: '#fff',
  },
  btnSmall: {
    padding: '4px 10px', fontSize: '11px',
    background: '#F0F0FF', color: '#4945FF',
    border: '1px solid #D9D8FF',
  },
  btnGreen: {
    background: '#EAFBEA', color: '#328048',
    border: '1px solid #C6F0C2',
  },
  fieldCard: {
    background: '#fff', borderRadius: '8px',
    border: '1px solid #DCDCE4', padding: '16px',
  },
  fieldHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '10px',
  },
  fieldName: { fontSize: '12px', fontWeight: 700, color: '#32324D' },
  fieldActions: { display: 'flex', gap: '6px' },
  resultArea: {
    width: '100%', padding: '10px', fontSize: '13px',
    border: '1px solid #DCDCE4', borderRadius: '4px',
    resize: 'vertical', boxSizing: 'border-box',
    fontFamily: 'inherit', color: '#32324D', lineHeight: 1.6,
    background: '#FAFAFF',
  },
  empty: {
    padding: '12px', fontSize: '12px', color: '#8E8EA9',
    background: '#F6F6F9', borderRadius: '4px',
    textAlign: 'center', fontStyle: 'italic',
  },
  poweredBy: {
    textAlign: 'center', fontSize: '11px',
    color: '#C0C0CF', marginTop: '32px',
  },
};

import React, { useState } from 'react';

const FIELDS_BY_TYPE = {
  'api::blog-post.blog-post':   ['title', 'excerpt', 'tag', 'body'],
  'api::case-study.case-study': ['title', 'subtitle', 'description', 'lead', 'challenge', 'solution', 'body3'],
  'api::testimonial.testimonial': ['quote', 'authorName', 'authorRole'],
  'api::faq-item.faq-item':     ['question', 'answer'],
};

const FIELD_LABELS = {
  title: 'Title', subtitle: 'Subtitle', description: 'Description',
  lead: 'Lead paragraph', excerpt: 'Excerpt', tag: 'Tag/Category',
  body: 'Body content', challenge: 'Challenge section',
  solution: 'Solution section', body3: 'Impact/Results section',
  quote: 'Testimonial quote', authorName: 'Author name', authorRole: 'Author role',
  question: 'FAQ question', answer: 'FAQ answer',
};

function fillField(fieldName, value) {
  // Try to find the input/textarea for this field in the Strapi editor DOM
  const selectors = [
    `[data-testid="content-type-builder-form"] input[name="${fieldName}"]`,
    `input[name="${fieldName}"]`,
    `textarea[name="${fieldName}"]`,
    `[name="${fieldName}"]`,
    // Strapi v5 uses label-based association
    `#${fieldName}`,
  ];

  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype,
        'value'
      )?.set;
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(el, value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    }
  }
  return false;
}

export function AiWriterPanel({ data, collectionType }) {
  const [loading, setLoading] = useState(null);
  const [results, setResults] = useState({});
  const [context, setContext] = useState('');
  const [error, setError] = useState('');

  const uid = collectionType;
  const fields = FIELDS_BY_TYPE[uid] || [];

  async function generate(field) {
    setLoading(field);
    setError('');
    try {
      const contentTypeShort = uid?.split('::')[1]?.split('.')[0] ?? '';
      const res = await fetch('/api/ai-writer/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: contentTypeShort,
          field,
          context: context || data?.title || data?.question || '',
        }),
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

  function applyField(field) {
    const value = results[field];
    if (!value) return;
    const filled = fillField(field, value);
    if (!filled) {
      navigator.clipboard.writeText(value);
      alert(`Copied to clipboard — paste it into the "${FIELD_LABELS[field]}" field.`);
    }
  }

  if (!fields.length) {
    return (
      <div style={styles.panel}>
        <p style={styles.muted}>AI Writer is not configured for this content type.</p>
      </div>
    );
  }

  return (
    <div style={styles.panel}>
      <p style={styles.heading}>✦ AI Content Writer</p>

      <div style={styles.contextWrap}>
        <label style={styles.label}>Brief / context</label>
        <textarea
          style={styles.textarea}
          placeholder="Describe what you want to write about…"
          value={context}
          onChange={e => setContext(e.target.value)}
          rows={3}
        />
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.fieldList}>
        {fields.map(field => (
          <div key={field} style={styles.fieldRow}>
            <div style={styles.fieldMeta}>
              <span style={styles.fieldName}>{FIELD_LABELS[field]}</span>
              <button
                style={{ ...styles.genBtn, opacity: loading === field ? 0.6 : 1 }}
                onClick={() => generate(field)}
                disabled={!!loading}
              >
                {loading === field ? '…' : 'Generate'}
              </button>
            </div>

            {results[field] && (
              <div style={styles.resultBox}>
                <p style={styles.resultText}>{results[field].substring(0, 200)}{results[field].length > 200 ? '…' : ''}</p>
                <div style={styles.resultActions}>
                  <button style={styles.useBtn} onClick={() => applyField(field)}>Use ↗</button>
                  <button style={styles.regenBtn} onClick={() => generate(field)}>↺</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <p style={styles.poweredBy}>Powered by Claude AI</p>
    </div>
  );
}

const styles = {
  panel: {
    padding: '16px',
    fontFamily: 'system-ui, sans-serif',
  },
  heading: {
    fontWeight: 700,
    fontSize: '13px',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: '#4945FF',
    margin: '0 0 12px',
  },
  label: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 600,
    color: '#666687',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  contextWrap: { marginBottom: '12px' },
  textarea: {
    width: '100%',
    padding: '8px',
    fontSize: '13px',
    border: '1px solid #DCDCE4',
    borderRadius: '4px',
    resize: 'vertical',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    color: '#32324D',
  },
  fieldList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  fieldRow: {
    border: '1px solid #F0F0FF',
    borderRadius: '6px',
    padding: '8px 10px',
    background: '#FAFAFF',
  },
  fieldMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  fieldName: { fontSize: '12px', fontWeight: 600, color: '#32324D' },
  genBtn: {
    fontSize: '11px',
    fontWeight: 600,
    background: '#4945FF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 10px',
    cursor: 'pointer',
  },
  resultBox: {
    marginTop: '8px',
    background: '#fff',
    border: '1px solid #DCDCE4',
    borderRadius: '4px',
    padding: '8px',
  },
  resultText: { fontSize: '12px', color: '#32324D', margin: '0 0 6px', lineHeight: 1.5 },
  resultActions: { display: 'flex', gap: '6px' },
  useBtn: {
    fontSize: '11px', fontWeight: 600,
    background: '#328048', color: '#fff',
    border: 'none', borderRadius: '4px',
    padding: '3px 10px', cursor: 'pointer',
  },
  regenBtn: {
    fontSize: '11px',
    background: '#F0F0FF', color: '#4945FF',
    border: '1px solid #D9D8FF',
    borderRadius: '4px', padding: '3px 8px', cursor: 'pointer',
  },
  error: { fontSize: '12px', color: '#D02B20', marginBottom: '8px' },
  muted: { fontSize: '12px', color: '#8E8EA9' },
  poweredBy: { fontSize: '10px', color: '#C0C0CF', textAlign: 'center', marginTop: '12px' },
};

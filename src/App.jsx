import React, { useState, useRef, useCallback } from 'react'

const CATEGORIES = [
  '保養品/化妝品',
  '食品/飲品',
  '清潔用品',
  '服飾/配件',
  '家電/寵物/日用百貨/家具',
  '其他消費品',
]

const OUTPUT_FORMATS = [
  { id: '電商商品頁文案', label: '電商商品頁', icon: '🛒' },
  { id: 'FB/IG 貼文', label: 'FB / IG', icon: '📱' },
  { id: '蝦皮/momo 商品描述', label: '蝦皮 / momo', icon: '🏪' },
  { id: 'SEO 關鍵字清單', label: 'SEO 關鍵字', icon: '🔍' },
]

const TAB_KEYS = ['ecommerce', 'social', 'marketplace', 'seo']
const TAB_FORMAT_MAP = {
  ecommerce: '電商商品頁文案',
  social: 'FB/IG 貼文',
  marketplace: '蝦皮/momo 商品描述',
  seo: 'SEO 關鍵字清單',
}

// ─── Icons ───────────────────────────────────────────────
const IconUpload = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
  </svg>
)
const IconCopy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
)
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconSpinner = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{animation:'spin 0.8s linear infinite'}}>
    <path d="M21 12a9 9 0 11-18 0"/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </svg>
)
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

// ─── CopyButton ──────────────────────────────────────────
function CopyButton({ text, size = 'sm' }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} style={{
      display:'flex', alignItems:'center', gap:5,
      padding: size === 'sm' ? '5px 10px' : '8px 16px',
      background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.06)',
      color: copied ? '#34d399' : '#9898b0',
      border: `1px solid ${copied ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 6, fontSize: 12, cursor: 'pointer',
      transition: 'all 0.2s',
    }}>
      {copied ? <IconCheck/> : <IconCopy/>}
      {copied ? '已複製' : '複製'}
    </button>
  )
}

// ─── Tag ────────────────────────────────────────────────
function Tag({ children, color = 'purple' }) {
  const colors = {
    purple: { bg:'rgba(124,106,247,0.12)', color:'#a78bfa', border:'rgba(124,106,247,0.25)' },
    green:  { bg:'rgba(52,211,153,0.12)',  color:'#34d399',  border:'rgba(52,211,153,0.25)' },
    yellow: { bg:'rgba(251,191,36,0.12)', color:'#fbbf24',  border:'rgba(251,191,36,0.25)' },
  }
  const c = colors[color]
  return (
    <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:20,
      background:c.bg, color:c.color, border:`1px solid ${c.border}`,
      fontSize:12, fontWeight:500 }}>
      {children}
    </span>
  )
}

// ─── Section wrapper ────────────────────────────────────
function Section({ title, badge, children, action }) {
  return (
    <div style={{ marginBottom:24, background:'var(--surface2)', borderRadius:'var(--radius)', border:'1px solid var(--border)', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'12px 16px', borderBottom:'1px solid var(--border)', background:'rgba(255,255,255,0.02)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:13, fontWeight:600 }}>{title}</span>
          {badge && <Tag color="yellow">{badge}</Tag>}
        </div>
        {action}
      </div>
      <div style={{ padding:16 }}>{children}</div>
    </div>
  )
}

// ─── Ecommerce Result ────────────────────────────────────
function EcommerceResult({ data }) {
  if (!data) return null
  const full = [
    `【標題】${data.title}`,
    `【副標題】${data.subtitle}`,
    `\n【商品描述】\n${data.description}`,
    `\n【產品特色】\n${(data.features||[]).map((f,i)=>`${i+1}. ${f}`).join('\n')}`
  ].join('\n')
  return (
    <div>
      <Section title="商品標題" action={<CopyButton text={data.title}/>}>
        <p style={{ fontSize:18, fontWeight:700, color:'#fff', lineHeight:1.5 }}>{data.title}</p>
        {data.subtitle && <p style={{ marginTop:6, color:'var(--text2)', fontSize:14 }}>{data.subtitle}</p>}
      </Section>
      <Section title="商品描述" action={<CopyButton text={data.description}/>}>
        <p style={{ color:'var(--text2)', lineHeight:1.9, fontSize:14 }}>{data.description}</p>
      </Section>
      <Section title="產品特色" badge="5項" action={<CopyButton text={(data.features||[]).join('\n')}/>}>
        <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:8 }}>
          {(data.features||[]).map((f,i) => (
            <li key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
              <span style={{ minWidth:22, height:22, borderRadius:'50%', background:'var(--accent-glow)',
                color:'var(--accent2)', fontSize:11, fontWeight:700, display:'flex', alignItems:'center',
                justifyContent:'center', flexShrink:0, marginTop:1 }}>{i+1}</span>
              <span style={{ fontSize:14, color:'var(--text2)' }}>{f}</span>
            </li>
          ))}
        </ul>
      </Section>
      <div style={{ textAlign:'right' }}>
        <CopyButton text={full} size="md"/>
      </div>
    </div>
  )
}

// ─── Social Result ───────────────────────────────────────
function SocialResult({ data }) {
  if (!data) return null
  return (
    <div>
      <Section title="Facebook 貼文" action={<CopyButton text={data.fb}/>}>
        <pre style={{ whiteSpace:'pre-wrap', fontSize:14, color:'var(--text2)', lineHeight:1.9, fontFamily:'inherit' }}>{data.fb}</pre>
      </Section>
      <Section title="Instagram 說明文" action={<CopyButton text={data.ig_caption}/>}>
        <pre style={{ whiteSpace:'pre-wrap', fontSize:14, color:'var(--text2)', lineHeight:1.9, fontFamily:'inherit' }}>{data.ig_caption}</pre>
      </Section>
    </div>
  )
}

// ─── Marketplace Result ──────────────────────────────────
function MarketplaceResult({ data }) {
  if (!data) return null
  return (
    <div>
      <Section title="🛒 蝦皮標題" badge="建議60字內" action={<CopyButton text={data.shopee_title}/>}>
        <p style={{ fontSize:15, color:'#fff', fontWeight:500 }}>{data.shopee_title}</p>
        <p style={{ marginTop:6, fontSize:12, color: data.shopee_title?.length > 60 ? 'var(--red)' : 'var(--green)' }}>
          {data.shopee_title?.length || 0} 字
        </p>
      </Section>
      <Section title="蝦皮商品描述" action={<CopyButton text={data.shopee_desc}/>}>
        <pre style={{ whiteSpace:'pre-wrap', fontSize:14, color:'var(--text2)', lineHeight:1.9, fontFamily:'inherit' }}>{data.shopee_desc}</pre>
      </Section>
      <Section title="momo 商品描述" action={<CopyButton text={data.momo_desc}/>}>
        <pre style={{ whiteSpace:'pre-wrap', fontSize:14, color:'var(--text2)', lineHeight:1.9, fontFamily:'inherit' }}>{data.momo_desc}</pre>
      </Section>
    </div>
  )
}

// ─── SEO Result ──────────────────────────────────────────
function SeoResult({ data }) {
  if (!data) return null
  const allKeywords = [
    ...(data.primary||[]),
    ...(data.secondary||[]),
    ...(data.longtail||[])
  ].join('、')
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:12 }}>
        <CopyButton text={allKeywords} size="md"/>
      </div>
      <Section title="主要關鍵字" badge="高搜尋量">
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {(data.primary||[]).map((k,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ padding:'6px 14px', background:'rgba(124,106,247,0.15)', color:'#a78bfa',
                border:'1px solid rgba(124,106,247,0.3)', borderRadius:20, fontSize:14, fontWeight:500 }}>{k}</span>
              <CopyButton text={k}/>
            </div>
          ))}
        </div>
      </Section>
      <Section title="次要關鍵字" badge="中搜尋量">
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {(data.secondary||[]).map((k,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ padding:'5px 12px', background:'rgba(167,139,250,0.08)', color:'#c4b5fd',
                border:'1px solid rgba(167,139,250,0.2)', borderRadius:20, fontSize:13 }}>{k}</span>
              <CopyButton text={k}/>
            </div>
          ))}
        </div>
      </Section>
      <Section title="長尾關鍵字" badge="精準流量">
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {(data.longtail||[]).map((k,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ padding:'5px 12px', background:'rgba(52,211,153,0.08)', color:'#6ee7b7',
                border:'1px solid rgba(52,211,153,0.2)', borderRadius:20, fontSize:13 }}>{k}</span>
              <CopyButton text={k}/>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

// ─── Compliance Badge ────────────────────────────────────
function ComplianceBadge({ category }) {
  const rules = {
    '保養品/化妝品': { label:'化妝品衛管法', color:'#a78bfa' },
    '食品/飲品':     { label:'食安法 §28',    color:'#34d399' },
    '清潔用品':      { label:'公平交易法',    color:'#fbbf24' },
    '服飾/配件':     { label:'公平交易法',    color:'#fbbf24' },
    '家電/寵物/日用百貨/家具': { label:'廣告不實規範', color:'#60a5fa' },
    '其他消費品':    { label:'廣告不實規範',  color:'#60a5fa' },
  }
  const r = rules[category]
  if (!r) return null
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5,
      padding:'3px 10px', borderRadius:20,
      background: `${r.color}18`, color: r.color,
      border:`1px solid ${r.color}33`, fontSize:11, fontWeight:600 }}>
      ✓ 符合 {r.label}
    </span>
  )
}

// ─── Main App ────────────────────────────────────────────
export default function App() {
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('保養品/化妝品')
  const [selectedFormats, setSelectedFormats] = useState(['電商商品頁文案', 'FB/IG 貼文', '蝦皮/momo 商品描述', 'SEO 關鍵字清單'])
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('ecommerce')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef()

  const handleImage = (file) => {
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target.result)
      setImageBase64(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const toggleFormat = (id) => {
    setSelectedFormats(prev =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter(f => f !== id) : prev) : [...prev, id]
    )
  }

  const generate = async () => {
    if (!description.trim() && !imageBase64) {
      setError('請輸入產品描述或上傳圖片')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, category, imageBase64, outputFormats: selectedFormats })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || '生成失敗')
      setResult(data.result)
      // Auto-select first available tab
      const firstAvailable = TAB_KEYS.find(k => data.result[k] && selectedFormats.includes(TAB_FORMAT_MAP[k]))
      if (firstAvailable) setActiveTab(firstAvailable)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const availableTabs = TAB_KEYS.filter(k => selectedFormats.includes(TAB_FORMAT_MAP[k]))

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>

      {/* Header */}
      <header style={{
        background:'rgba(24,24,31,0.9)', backdropFilter:'blur(12px)',
        borderBottom:'1px solid var(--border)', padding:'0 24px',
        position:'sticky', top:0, zIndex:100
      }}>
        <div style={{ maxWidth:1100, margin:'0 auto', height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#7c6af7,#a78bfa)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>✍️</div>
            <span style={{ fontSize:15, fontWeight:700 }}>電商文案生成器</span>
            <Tag color="purple">AI 法規合規</Tag>
          </div>
          <div style={{ fontSize:12, color:'var(--text3)' }}>Powered by Claude</div>
        </div>
      </header>

      <main style={{ maxWidth:1100, margin:'0 auto', padding:'32px 24px', display:'grid', gridTemplateColumns:'380px 1fr', gap:24, alignItems:'start' }}>

        {/* LEFT: Input Panel */}
        <div style={{ position:'sticky', top:80 }}>
          <div style={{ background:'var(--surface)', borderRadius:'var(--radius)', border:'1px solid var(--border)', overflow:'hidden' }}>

            {/* Panel Header */}
            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', background:'rgba(124,106,247,0.06)' }}>
              <h2 style={{ fontSize:14, fontWeight:600 }}>產品資訊輸入</h2>
              <p style={{ fontSize:12, color:'var(--text3)', marginTop:3 }}>上傳圖片或輸入描述，AI 自動生成合規文案</p>
            </div>

            <div style={{ padding:20, display:'flex', flexDirection:'column', gap:20 }}>

              {/* Image Upload */}
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'var(--text2)', display:'block', marginBottom:8 }}>產品圖片 <span style={{ color:'var(--text3)', fontWeight:400 }}>(選填)</span></label>
                <div
                  onClick={() => fileInputRef.current.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleImage(e.dataTransfer.files[0]) }}
                  style={{
                    border:`2px dashed ${dragOver ? '#7c6af7' : imagePreview ? 'rgba(124,106,247,0.4)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)', cursor:'pointer', overflow:'hidden',
                    transition:'all 0.2s', background: dragOver ? 'rgba(124,106,247,0.05)' : 'transparent',
                    minHeight: imagePreview ? 'auto' : 100,
                    display:'flex', alignItems:'center', justifyContent:'center'
                  }}>
                  {imagePreview ? (
                    <div style={{ position:'relative', width:'100%' }}>
                      <img src={imagePreview} alt="preview" style={{ width:'100%', display:'block', maxHeight:200, objectFit:'cover' }}/>
                      <button onClick={e => { e.stopPropagation(); setImageFile(null); setImagePreview(null); setImageBase64(null) }}
                        style={{ position:'absolute', top:8, right:8, width:24, height:24, borderRadius:'50%',
                          background:'rgba(0,0,0,0.7)', border:'none', color:'#fff', cursor:'pointer',
                          display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <IconX/>
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign:'center', padding:20, color:'var(--text3)' }}>
                      <IconUpload/>
                      <p style={{ fontSize:13, marginTop:8 }}>點擊或拖曳上傳圖片</p>
                      <p style={{ fontSize:11, marginTop:4 }}>JPG / PNG / WebP</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display:'none' }}
                  onChange={e => handleImage(e.target.files[0])}/>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'var(--text2)', display:'block', marginBottom:8 }}>產品描述</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="例：KONO 流沙沐浴乳，500ml，珠光質地，沙龍香氛，適合各種膚質，主打洗後水潤不緊繃..."
                  rows={4}
                  style={{
                    width:'100%', background:'var(--surface2)', border:'1px solid var(--border)',
                    borderRadius:'var(--radius-sm)', color:'var(--text)', fontSize:13,
                    padding:'10px 12px', resize:'vertical', outline:'none', lineHeight:1.7,
                    fontFamily:'inherit', transition:'border 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#7c6af7'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              {/* Category */}
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'var(--text2)', display:'block', marginBottom:8 }}>產品類別 <span style={{ color:'var(--red)', fontSize:11 }}>*</span></label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  style={{ width:'100%', background:'var(--surface2)', border:'1px solid var(--border)',
                    borderRadius:'var(--radius-sm)', color:'var(--text)', fontSize:13, padding:'9px 12px', outline:'none', cursor:'pointer' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div style={{ marginTop:8 }}>
                  <ComplianceBadge category={category}/>
                </div>
              </div>

              {/* Output Formats */}
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'var(--text2)', display:'block', marginBottom:8 }}>輸出格式</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {OUTPUT_FORMATS.map(f => {
                    const active = selectedFormats.includes(f.id)
                    return (
                      <button key={f.id} onClick={() => toggleFormat(f.id)}
                        style={{
                          padding:'8px 10px', borderRadius:'var(--radius-sm)', cursor:'pointer',
                          background: active ? 'rgba(124,106,247,0.15)' : 'var(--surface2)',
                          border: `1px solid ${active ? 'rgba(124,106,247,0.4)' : 'var(--border)'}`,
                          color: active ? '#a78bfa' : 'var(--text3)',
                          fontSize:12, fontWeight: active ? 600 : 400,
                          textAlign:'left', display:'flex', alignItems:'center', gap:6,
                          transition:'all 0.15s'
                        }}>
                        <span>{f.icon}</span>{f.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{ padding:'10px 14px', background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.25)', borderRadius:'var(--radius-sm)', display:'flex', gap:8, alignItems:'flex-start' }}>
                  <span style={{ color:'var(--red)', flexShrink:0, marginTop:1 }}><IconAlert/></span>
                  <span style={{ fontSize:13, color:'#fca5a5' }}>{error}</span>
                </div>
              )}

              {/* Generate Button */}
              <button onClick={generate} disabled={loading}
                style={{
                  width:'100%', padding:'13px', borderRadius:'var(--radius-sm)',
                  background: loading ? 'rgba(124,106,247,0.3)' : 'linear-gradient(135deg, #7c6af7, #a78bfa)',
                  border:'none', color:'#fff', fontSize:14, fontWeight:700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  letterSpacing:1, transition:'all 0.2s',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(124,106,247,0.35)'
                }}>
                {loading ? <><IconSpinner/> 生成中...</> : '🚀 立即生成文案'}
              </button>

              <p style={{ fontSize:11, color:'var(--text3)', textAlign:'center' }}>
                AI 自動過濾違法詞彙 · 符合台灣廣告法規
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: Result Panel */}
        <div>
          {!result && !loading && (
            <div style={{
              minHeight:400, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              background:'var(--surface)', borderRadius:'var(--radius)', border:'1px dashed var(--border)',
              padding:48, textAlign:'center'
            }}>
              <div style={{ fontSize:48, marginBottom:16 }}>✍️</div>
              <h3 style={{ fontSize:18, fontWeight:600, marginBottom:8 }}>準備好了嗎？</h3>
              <p style={{ color:'var(--text3)', fontSize:14, lineHeight:1.7, maxWidth:320 }}>
                上傳產品圖片或輸入描述，<br/>
                AI 將自動生成符合台灣廣告法規<br/>
                且適合各大電商平台的文案
              </p>
              <div style={{ marginTop:24, display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center' }}>
                {['化妝品衛管法', '食安法', '公平交易法', 'SEO 優化', '各平台格式'].map(t => (
                  <Tag key={t} color="purple">{t}</Tag>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div style={{
              minHeight:400, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              background:'var(--surface)', borderRadius:'var(--radius)', border:'1px solid var(--border)',
            }}>
              <div style={{ width:48, height:48, borderRadius:'50%', border:'3px solid rgba(124,106,247,0.2)',
                borderTopColor:'#7c6af7', animation:'spin 0.8s linear infinite', marginBottom:20 }}/>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <p style={{ fontSize:15, fontWeight:500 }}>AI 正在生成文案...</p>
              <p style={{ fontSize:13, color:'var(--text3)', marginTop:6 }}>分析產品特性 · 套用法規規則 · 優化 SEO 關鍵字</p>
            </div>
          )}

          {result && !loading && (
            <div>
              {/* Tabs */}
              <div style={{ display:'flex', gap:4, marginBottom:20, background:'var(--surface)', borderRadius:'var(--radius-sm)', padding:4, border:'1px solid var(--border)' }}>
                {OUTPUT_FORMATS.filter(f => selectedFormats.includes(f.id)).map(f => {
                  const tabKey = TAB_KEYS.find(k => TAB_FORMAT_MAP[k] === f.id)
                  const active = activeTab === tabKey
                  return (
                    <button key={tabKey} onClick={() => setActiveTab(tabKey)}
                      style={{
                        flex:1, padding:'8px 12px', borderRadius:6, border:'none', cursor:'pointer',
                        background: active ? 'linear-gradient(135deg,#7c6af7,#a78bfa)' : 'transparent',
                        color: active ? '#fff' : 'var(--text3)',
                        fontSize:12, fontWeight: active ? 600 : 400,
                        transition:'all 0.2s', display:'flex', alignItems:'center', justifyContent:'center', gap:5
                      }}>
                      <span>{f.icon}</span><span>{f.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Result Content */}
              <div style={{ animation:'fadeIn 0.3s ease' }}>
                <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
                {activeTab === 'ecommerce' && result.ecommerce && <EcommerceResult data={result.ecommerce}/>}
                {activeTab === 'social' && result.social && <SocialResult data={result.social}/>}
                {activeTab === 'marketplace' && result.marketplace && <MarketplaceResult data={result.marketplace}/>}
                {activeTab === 'seo' && result.seo && <SeoResult data={result.seo}/>}
                {result.raw && (
                  <Section title="原始輸出">
                    <pre style={{ whiteSpace:'pre-wrap', fontSize:13, color:'var(--text2)', lineHeight:1.8, fontFamily:'monospace' }}>{result.raw}</pre>
                  </Section>
                )}
              </div>

              <div style={{ marginTop:16, padding:'12px 16px', background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.2)', borderRadius:'var(--radius-sm)', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ color:'var(--green)', fontSize:14 }}>✓</span>
                <span style={{ fontSize:12, color:'#6ee7b7' }}>文案已自動過濾違法宣稱詞彙，符合台灣廣告法規</span>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  )
}

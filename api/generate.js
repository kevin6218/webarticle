export const config = { runtime: 'edge' }

const CATEGORY_RULES = {
  '保養品/化妝品': `
【化妝品法規重點】依化妝品衛生安全管理法：
- 禁止詞：深層滲透、治療、改善疾病、消滅細菌、排毒、活化細胞、再生
- 禁止：使用前後對比圖若「使用前」呈現病態皮膚
- 可用：洗後水潤不緊繃、提升肌膚光澤感、保濕滋潤、清潔呵護
- 香氛/清潔類額外注意：不可宣稱抗菌、殺菌功效（除非有核准）`,

  '食品/飲品': `
【食品法規重點】依食安法第28條：
- 禁止詞：治療、預防疾病、增強免疫力（若無許可）、排毒、降血糖、降血壓
- 可用：補充營養、提振精神、天然原料、精心調配、美味享受
- 保健食品需有小綠人標章才可宣稱特定功效
- 強調風味、產地、原料即可，避免功效型訴求`,

  '清潔用品': `
【清潔用品法規重點】：
- 禁止：宣稱醫療殺菌效果（除非有衛署許可字號）
- 禁止：「殺死99%細菌」等除非有檢驗數據支持
- 可用：有效清潔、去除污垢、清新香氣、溫和不傷手
- 環境清潔劑不適用化妝品法規，但廣告不實仍受公平法規範`,

  '服飾/配件': `
【服飾廣告注意事項】依公平交易法：
- 禁止：誇大材質成分（如「100%蠶絲」需有實際成分支持）
- 禁止：不實尺寸、顏色描述
- 可用：質感、設計感、舒適、百搭、輕量、透氣
- 比較廣告需有事實依據`,

  '其他消費品': `
【一般消費品廣告原則】依公平交易法第21條：
- 禁止：虛偽不實、引人錯誤之表示
- 禁止：無根據的第一名、最好、全台最強等絕對性用語
- 可用：品質優良、設計精良、高CP值、使用者推薦
- 若有得獎認證可具體標示`,

  '家電/寵物/日用百貨/家具': `
【日用品廣告原則】：
- 家電：不可誇大省電數據、效能需有依據
- 寵物用品：不可宣稱治療動物疾病效果
- 家具：材質標示需正確，不可宣稱「純實木」若含密板
- 通用：功能描述需真實，避免絕對性詞彙`
}

const SEO_KEYWORDS = {
  '保養品/化妝品': ['保濕', '滋潤', '水潤', '天然', '溫和', '敏感肌', '抗老', '美白', '防曬', '精華液', '面霜', '身體乳'],
  '食品/飲品': ['天然', '無添加', '有機', '健康', '美味', '手作', '台灣', '新鮮', '精選', '低糖', '高蛋白'],
  '清潔用品': ['清潔', '去污', '除菌', '環保', '天然成分', '溫和', '香氛', '深層清潔', '家用', '廚房', '浴室'],
  '服飾/配件': ['百搭', '顯瘦', '舒適', '透氣', '質感', '韓系', '日系', '時尚', '休閒', '正式'],
  '其他消費品': ['高CP值', '質感', '實用', '耐用', '設計感', '生活', '居家', '辦公'],
  '家電/寵物/日用百貨/家具': ['實用', '耐用', '節能', '靜音', '多功能', '居家', '質感', '設計', '收納']
}

async function callClaude(apiKey, systemPrompt, userContent, maxTokens) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }]
    })
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error?.message || 'API error')
  return data.content?.[0]?.text || ''
}

function buildUserContent(description, category, imageBase64) {
  const content = []
  if (imageBase64) {
    const mimeMatch = imageBase64.match(/^data:([^;]+);base64,/)
    let mediaType = mimeMatch ? mimeMatch[1] : 'image/jpeg'
    const base64Data = imageBase64.replace(/^data:[^;]+;base64,/, '')
    try {
      const header = base64Data.substring(0, 16)
      const decoded = atob(header)
      const bytes = decoded.split('').map(c => c.charCodeAt(0))
      if (bytes[0] === 0xFF && bytes[1] === 0xD8) mediaType = 'image/jpeg'
      else if (bytes[0] === 0x89 && bytes[1] === 0x50) mediaType = 'image/png'
      else if (bytes[0] === 0x47 && bytes[1] === 0x49) mediaType = 'image/gif'
      else if (bytes[0] === 0x52 && bytes[1] === 0x49) mediaType = 'image/webp'
    } catch(e) {}
    content.push({ type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } })
  }
  content.push({ type: 'text', text: `產品類別：${category}\n產品描述：${description || '請根據圖片分析產品'}` })
  return content
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  try {
    const body = await req.json()
    const { description, category, imageBase64, outputFormats, token } = body

    // Verify session token
    const secret = process.env.SESSION_SECRET || 'default-secret-change-me'
    if (!token) {
      return new Response(JSON.stringify({ error: '請先登入' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }
    // Token is a SHA-256 hex string (64 chars)
    if (typeof token !== 'string' || token.length !== 64 || !/^[a-f0-9]+$/.test(token)) {
      return new Response(JSON.stringify({ error: '登入已過期，請重新登入' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: '未設定 ANTHROPIC_API_KEY 環境變數' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    const categoryRule = CATEGORY_RULES[category] || CATEGORY_RULES['其他消費品']
    const seoKeywords = SEO_KEYWORDS[category] || SEO_KEYWORDS['其他消費品']
    const formatsRequested = outputFormats || ['電商商品頁文案', 'FB/IG 貼文', '蝦皮/momo 商品描述', 'SEO 關鍵字清單']
    const userContent = buildUserContent(description, category, imageBase64)

    const baseRule = `你是台灣電商資深文案專家，專精法規合規文案撰寫。
${categoryRule}
SEO關鍵字池：${seoKeywords.join('、')}
核心原則：不使用違法宣稱詞彙、自然融入SEO關鍵字、台灣繁體中文、突出差異化賣點、功效描述停留在感官體驗層次。`

    const result = {}

    if (formatsRequested.includes('電商商品頁文案')) {
      // Pass 1: 長描述，純文字輸出，不受JSON限制
      const descSystem = `${baseRule}

你只需要撰寫電商商品描述文案，輸出純文字，不要JSON不要標題標籤。

請嚴格按照以下四段結構，每段獨立成段，段落間空一行：

第一段（情境共鳴）：描述目標消費者的使用場景與生活情境，讓讀者產生代入感與共鳴。此段必須寫滿90字。

第二段（產品特性）：詳細介紹產品核心成分、質地特色、香氣、技術亮點，說明與一般同類產品的差異化賣點，自然帶入保濕、水潤、溫和等SEO關鍵字。此段必須寫滿180字。

第三段（使用體驗）：描述從取用、起泡、塗抹到沖洗後的完整感官體驗，包含觸感、泡沫細緻度、沖洗後膚感、香氣留存等細節。此段必須寫滿90字。

第四段（購買呼籲）：說明適用族群與容量規格，加入促購語句，讓消費者產生立即購買的衝動。此段必須寫滿55字。

注意：四段合計必須超過400字。每段都要完整展開，不可省略。`

      const descText = await callClaude(apiKey, descSystem, [
        ...userContent,
        { type: 'text', text: '請按照四段結構撰寫，每段達到規定字數，合計400字以上。' }
      ], 1500)

      // Pass 2: 標題、副標、特色
      const titleSystem = `${baseRule}
只輸出JSON不要任何其他文字：
{"title":"商品標題30字內","subtitle":"副標題20字內","features":["特色1","特色2","特色3","特色4","特色5"]}`

      const titleText = await callClaude(apiKey, titleSystem, userContent, 500)
      const cleanTitle = titleText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      let titleData = { title: '', subtitle: '', features: [] }
      try { titleData = JSON.parse(cleanTitle) } catch(e) {}

      result.ecommerce = {
        title: titleData.title || '',
        subtitle: titleData.subtitle || '',
        description: descText.trim(),
        features: titleData.features || []
      }
    }

    // Pass 3: 其他格式
    const otherFormats = formatsRequested.filter(f => f !== '電商商品頁文案')
    if (otherFormats.length > 0) {
      const otherSystem = `${baseRule}
只輸出JSON不要任何其他文字：
{${otherFormats.includes('FB/IG 貼文') ? `"social":{"fb":"FB貼文200字含emoji含3個hashtag","ig_caption":"IG說明文150字含5個hashtag"}` : ''}${otherFormats.includes('FB/IG 貼文') && otherFormats.length > 1 ? ',' : ''}${otherFormats.includes('蝦皮/momo 商品描述') ? `"marketplace":{"shopee_title":"蝦皮標題60字內含關鍵字","shopee_desc":"蝦皮商品描述300字條列式","momo_desc":"momo商品描述250字段落式"}` : ''}${otherFormats.includes('蝦皮/momo 商品描述') && otherFormats.includes('SEO 關鍵字清單') ? ',' : ''}${otherFormats.includes('SEO 關鍵字清單') ? `"seo":{"primary":["主關鍵字1","主關鍵字2","主關鍵字3"],"secondary":["次要1","次要2","次要3","次要4","次要5"],"longtail":["長尾1","長尾2","長尾3"]}` : ''}}`

      const otherText = await callClaude(apiKey, otherSystem, userContent, 1500)
      const cleanOther = otherText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      try {
        const otherData = JSON.parse(cleanOther)
        if (otherData.social) result.social = otherData.social
        if (otherData.marketplace) result.marketplace = otherData.marketplace
        if (otherData.seo) result.seo = otherData.seo
      } catch(e) {}
    }

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
}

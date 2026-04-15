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
    const { description, category, imageBase64, outputFormats } = body

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

    const systemPrompt = `你是台灣電商資深文案專家，專精法規合規文案撰寫。

${categoryRule}

【SEO 參考關鍵字池】：${seoKeywords.join('、')}

【文案原則】：
1. 絕對不使用任何違法宣稱詞彙
2. 自然融入 SEO 關鍵字，不堆砌
3. 台灣繁體中文，口語自然
4. 突出產品差異化賣點
5. 引發購買慾望但不誇大
6. 所有功效描述停留在「感官體驗」層次

【輸出格式要求】：
請以 JSON 格式輸出，包含以下欄位（只輸出被要求的格式）：
${formatsRequested.includes('電商商品頁文案') ? `"ecommerce": { "title": "商品標題(30字內)", "subtitle": "副標題(20字內)", "description": "商品描述(350-400字，分3段：第一段情境開場約80字、第二段產品特性與成分約180字、第三段使用感受與適用族群約100字，結尾含購買呼籲)", "features": ["特色1", "特色2", "特色3", "特色4", "特色5"] }` : ''}
${formatsRequested.includes('FB/IG 貼文') ? `"social": { "fb": "FB貼文(200字內，含emoji，含3個hashtag)", "ig_caption": "IG說明文(150字內，含5個hashtag)" }` : ''}
${formatsRequested.includes('蝦皮/momo 商品描述') ? `"marketplace": { "shopee_title": "蝦皮標題(60字內含關鍵字)", "shopee_desc": "蝦皮商品描述(300字，條列式)", "momo_desc": "momo商品描述(250字，段落式)" }` : ''}
${formatsRequested.includes('SEO 關鍵字清單') ? `"seo": { "primary": ["主要關鍵字1","主要關鍵字2","主要關鍵字3"], "secondary": ["次要關鍵字1","次要關鍵字2","次要關鍵字3","次要關鍵字4","次要關鍵字5"], "longtail": ["長尾關鍵字1","長尾關鍵字2","長尾關鍵字3"] }` : ''}

只輸出 JSON，不要任何其他文字。`

    const userContent = []

    if (imageBase64) {
      const mimeMatch = imageBase64.match(/^data:([^;]+);base64,/)
      let mediaType = mimeMatch ? mimeMatch[1] : 'image/jpeg'
      const base64Data = imageBase64.replace(/^data:[^;]+;base64,/, '')
      // Auto-detect from base64 magic bytes
      const header = base64Data.substring(0, 16)
      const decoded = atob(header)
      const bytes = decoded.split('').map(c => c.charCodeAt(0))
      if (bytes[0] === 0xFF && bytes[1] === 0xD8) mediaType = 'image/jpeg'
      else if (bytes[0] === 0x89 && bytes[1] === 0x50) mediaType = 'image/png'
      else if (bytes[0] === 0x47 && bytes[1] === 0x49) mediaType = 'image/gif'
      else if (bytes[0] === 0x52 && bytes[1] === 0x49) mediaType = 'image/webp'
      userContent.push({
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data: base64Data }
      })
    }

    userContent.push({
      type: 'text',
      text: `產品類別：${category}\n產品描述：${description || '請根據圖片分析產品'}\n\n請生成符合台灣法規的電商文案。`
    })

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userContent }]
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || 'API 錯誤' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }

    const text = data.content?.[0]?.text || ''
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    let result
    try {
      result = JSON.parse(clean)
    } catch {
      result = { raw: text }
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

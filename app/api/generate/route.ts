import { NextRequest, NextResponse } from 'next/server'

interface ProductFormData {
  productName: string
  material: string
  usage: string
  targetMarket: string
  advantages: string
  tone: string
  specifications?: string
  capacity?: string
  customLogo?: string
  packaging?: string
  moq?: string
  leadTime?: string
  certifications?: string
  targetPlatform?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ProductFormData = await request.json()

    if (!body.productName) {
      return NextResponse.json(
        { error: '产品名称为必填项' },
        { status: 400 }
      )
    }

    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API 密钥未配置' },
        { status: 500 }
      )
    }

    // 构建用户提供的信息摘要
    const userProvidedInfo = `
User Provided Information:
- Product Name: ${body.productName}
- Material: ${body.material || 'Not specified'}
- Usage: ${body.usage || 'Not specified'}
- Target Market: ${body.targetMarket || 'Not specified'}
- Advantages: ${body.advantages || 'Not specified'}
- Tone: ${body.tone || 'Professional'}
- Specifications/Dimensions: ${body.specifications || 'Not provided'}
- Capacity/Weight: ${body.capacity || 'Not provided'}
- Custom Logo: ${body.customLogo || 'Not specified'}
- Packaging: ${body.packaging || 'Not provided'}
- MOQ: ${body.moq || 'Not provided'}
- Lead Time: ${body.leadTime || 'Not provided'}
- Certifications: ${body.certifications || 'Not provided'}
- Target Platform: ${body.targetPlatform || 'Not specified'}
`.trim()

    const prompt = `You are a professional B2B copywriter for international trade platforms.

${userProvidedInfo}

CRITICAL ANTI-FABRICATION RULES:

You MUST NOT generate the following information unless the user EXPLICITLY provided it:

CERTIFICATIONS (NEVER fabricate):
- FDA, CE, RoHS, FCC, LFGB, BPA Free, MagSafe certified, GS certified, ANSI, DIN

PARAMETERS (NEVER fabricate):
- Specific dimensions, weight, capacity, power, lumens, battery capacity, battery life
- Waterproof rating, load-bearing capacity, magnetic strength

TRADE INFO (NEVER fabricate):
- MOQ, lead time, delivery time, stock, free sample, warranty

FEATURES (NEVER fabricate):
- waterproof, dishwasher safe, rechargeable, USB-C, wireless charging
- fast charging, 360-degree rotation, heavy-duty, industrial grade, professional grade

If user did NOT provide these, put them in missing_info as suggestions. NEVER include them in titles, bullet points, description, or SEO keywords.

OUTPUT FORMAT (strict JSON):

{
  "titles": {
    "b2b_title": "",
    "retail_title": ""
  },
  "bullet_points": [],
  "description": {
    "product_overview": "",
    "key_features": [],
    "applications": "",
    "customization": "",
    "packaging_wholesale_notes": ""
  },
  "seo_keywords": [],
  "platform_suggestion": {
    "recommended_platforms": [],
    "reasons": [],
    "notices": []
  },
  "missing_info": {
    "completeness_score": 0,
    "specification": [],
    "trade": [],
    "certification": [],
    "packaging": [],
    "customization": []
  }
}

GENERATION RULES:

1. TITLES:

b2b_title (for Alibaba.com, Global Sources, Made-in-China):
- Search-oriented, wholesale-focused format
- Include: Wholesale + Material + Product Name + Core Feature + Usage Scene
- No exaggerated marketing words
- Example: "Wholesale Food Grade Silicone Collapsible Pet Bowl Portable Foldable Dog Water Bowl for Travel Camping Outdoor Use"

retail_title (for Amazon, Shopify):
- More natural, readable for end consumers
- Not too long
- Example: "Collapsible Silicone Dog Bowl for Travel, Camping and Outdoor Feeding"

2. BULLET POINTS (5 points):
- Must be based ONLY on user input
- Focus on material, design, functionality, application
- No vague claims like "high quality"

3. DESCRIPTION:

product_overview:
- Brief introduction: what product is, who it's for, what scenario

key_features:
- 4-6 items, MUST be based on user input only

applications:
- Usage scenarios: home use, outdoor use, travel, camping, warehouse, retail, etc.

customization:
- If user says supports Logo/custom: "Custom logo or branding options are available based on supplier capabilities."
- If user did NOT specify: "Customization options should be confirmed with the supplier."

packaging_wholesale_notes:
- If user provided packaging/MOQ/lead time: include specific info
- If NOT provided: "Packaging, MOQ, and lead time should be confirmed based on supplier details."

4. PLATFORM SUGGESTION:

recommended_platforms: Array of 2-3 platforms based on product and target market
reasons: Array format, NOT paragraph
notices: Remind user about B2C platform requirements (images, specs, packaging, pricing)

5. MISSING INFO:

completeness_score: 0-100 based on info completeness
- Basic fields filled but advanced missing: ~50-70
- If dimensions, weight, packaging, MOQ, lead time, certifications all missing: don't give high score

specification: Missing technical specs
trade: Missing trade info
certification: Missing certifications
packaging: Missing packaging details
customization: Missing customization options

6. SEO KEYWORDS:
- 8-10 keywords
- Include product core terms, material terms, usage terms, market terms
- Only use terms from user input

OUTPUT ONLY VALID JSON. NO MARKDOWN. NO EXTRA TEXT.`

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 3000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('DeepSeek API error:', errorData)
      return NextResponse.json(
        { error: 'AI 服务调用失败，请稍后重试' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: 'AI 服务返回空内容' },
        { status: 500 }
      )
    }

    // 解析 JSON 响应
    let generatedContent
    try {
      generatedContent = JSON.parse(content)
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        generatedContent = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('无法解析 AI 响应')
      }
    }

    // 验证并规范化数据结构
    // 确保 titles 存在
    if (!generatedContent.titles) {
      generatedContent.titles = {
        b2b_title: generatedContent.title || body.productName,
        retail_title: generatedContent.title || body.productName
      }
    }

    // 确保 description 是结构化的
    if (typeof generatedContent.description === 'string') {
      generatedContent.description = {
        product_overview: generatedContent.description,
        key_features: [],
        applications: '',
        customization: 'Customization options should be confirmed with the supplier.',
        packaging_wholesale_notes: 'Packaging, MOQ, and lead time should be confirmed based on supplier details.'
      }
    }

    // 确保 description 子字段存在
    if (!generatedContent.description.product_overview) {
      generatedContent.description.product_overview = ''
    }
    if (!Array.isArray(generatedContent.description.key_features)) {
      generatedContent.description.key_features = []
    }
    if (!generatedContent.description.applications) {
      generatedContent.description.applications = ''
    }
    if (!generatedContent.description.customization) {
      generatedContent.description.customization = body.customLogo
        ? 'Custom logo or branding options are available based on supplier capabilities.'
        : 'Customization options should be confirmed with the supplier.'
    }
    if (!generatedContent.description.packaging_wholesale_notes) {
      generatedContent.description.packaging_wholesale_notes = (body.packaging || body.moq || body.leadTime)
        ? `Packaging: ${body.packaging || 'Standard export packaging'}. MOQ: ${body.moq || 'To be confirmed'}. Lead Time: ${body.leadTime || 'To be confirmed'}.`
        : 'Packaging, MOQ, and lead time should be confirmed based on supplier details.'
    }

    // 确保 platform_suggestion 是结构化的
    if (typeof generatedContent.platform_suggestion === 'string') {
      generatedContent.platform_suggestion = {
        recommended_platforms: ['Alibaba.com'],
        reasons: [generatedContent.platform_suggestion],
        notices: ['For B2C platforms like Amazon or Shopify, retail-style titles and lifestyle images may be needed.']
      }
    }

    if (!Array.isArray(generatedContent.platform_suggestion.recommended_platforms)) {
      generatedContent.platform_suggestion.recommended_platforms = ['Alibaba.com']
    }
    if (!Array.isArray(generatedContent.platform_suggestion.reasons)) {
      generatedContent.platform_suggestion.reasons = []
    }
    if (!Array.isArray(generatedContent.platform_suggestion.notices)) {
      generatedContent.platform_suggestion.notices = ['For B2C platforms, additional product images and detailed specifications may be required.']
    }

    // 确保 missing_info 是结构化的
    if (!generatedContent.missing_info || typeof generatedContent.missing_info === 'string' || Array.isArray(generatedContent.missing_info)) {
      generatedContent.missing_info = {
        completeness_score: 50,
        specification: [],
        trade: [],
        certification: [],
        packaging: [],
        customization: []
      }
    }

    // 确保 missing_info 子字段存在
    const missingInfo = generatedContent.missing_info
    if (typeof missingInfo.completeness_score !== 'number') {
      missingInfo.completeness_score = 50
    }
    if (!Array.isArray(missingInfo.specification)) missingInfo.specification = []
    if (!Array.isArray(missingInfo.trade)) missingInfo.trade = []
    if (!Array.isArray(missingInfo.certification)) missingInfo.certification = []
    if (!Array.isArray(missingInfo.packaging)) missingInfo.packaging = []
    if (!Array.isArray(missingInfo.customization)) missingInfo.customization = []

    // 确保其他字段存在
    if (!Array.isArray(generatedContent.bullet_points)) {
      generatedContent.bullet_points = []
    }
    if (!Array.isArray(generatedContent.seo_keywords)) {
      generatedContent.seo_keywords = []
    }

    return NextResponse.json(generatedContent)
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json(
      { error: '生成失败，请稍后重试' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'

const MAX_INPUT_LENGTH = 2000

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json(
        { error: '请输入产品信息' },
        { status: 400 }
      )
    }

    // 检查输入长度
    if (text.length > MAX_INPUT_LENGTH) {
      return NextResponse.json(
        { error: `输入内容过长，请控制在 ${MAX_INPUT_LENGTH} 字符以内` },
        { status: 400 }
      )
    }

    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API 密钥未配置，请联系管理员' },
        { status: 500 }
      )
    }

    const prompt = `请从以下中文产品描述中提取产品信息，并以JSON格式返回。

产品描述：
${text}

请仔细阅读产品描述，提取以下信息：

1. productName（产品中文名称）：提取产品的核心名称。这是最重要的字段，必须提取。
   - 通常是描述中提到的第一个具体物品
   - 例如："可折叠宠物碗"、"蓝牙耳机"、"不锈钢保温杯"、"无线充电器"
   - 注意提取完整的名称，包括修饰词，如"可折叠宠物碗"而不是"碗"

2. material（产品材质）：提取产品使用的材料，如"塑料"、"金属"、"硅胶"、"不锈钢"等。
3. usage（产品用途）：提取产品的使用场景或用途，如"音乐播放"、"户外遛狗"、"办公"等。
4. targetMarket（目标市场）：提取产品面向的市场或人群，如"欧美"、"东南亚"、"年轻用户"等。
5. advantages（产品优势）：提取产品的主要卖点或优势，如"续航时间长"、"轻便可折叠"、"防水"等。

重要提示：
- productName 是最重要的字段，必须从描述中提取出完整的产品名称
- 如果某个信息没有明确提到，返回空字符串
- 只返回JSON，不要其他内容

返回格式：
{
  "productName": "完整的产品名称",
  "material": "材质",
  "usage": "用途",
  "targetMarket": "目标市场",
  "advantages": "优势"
}`

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
        temperature: 0.3,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: '解析失败，请稍后重试' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: '解析失败' },
        { status: 500 }
      )
    }

    let parsedData
    try {
      parsedData = JSON.parse(content)
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('无法解析响应')
      }
    }

    return NextResponse.json(parsedData)
  } catch (error) {
    console.error('Parse error:', error)
    return NextResponse.json(
      { error: '解析失败，请稍后重试' },
      { status: 500 }
    )
  }
}
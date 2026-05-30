'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ProductFormData, GeneratedContent } from '../../../types'

interface HistoryRecord {
  id: string
  timestamp: number
  productName: string
  formData: ProductFormData
  result: GeneratedContent
}

const HISTORY_KEY = 'product_copy_history'
const MAX_HISTORY = 10
const USAGE_KEY = 'product_copy_usage'
const MAX_DAILY_USAGE = 5

// 获取今日使用次数
const getTodayUsage = (): { count: number; date: string } => {
  try {
    const saved = localStorage.getItem(USAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      const today = new Date().toISOString().split('T')[0]
      if (data.date === today) {
        return data
      }
    }
  } catch {
    // 忽略错误
  }
  return { count: 0, date: new Date().toISOString().split('T')[0] }
}

// 增加使用次数
const incrementUsage = (): number => {
  const today = new Date().toISOString().split('T')[0]
  const usage = getTodayUsage()
  const newCount = usage.date === today ? usage.count + 1 : 1
  localStorage.setItem(USAGE_KEY, JSON.stringify({ count: newCount, date: today }))
  return newCount
}

export default function ProductCopyPage() {
  const [formData, setFormData] = useState<ProductFormData>({
    productName: '',
    material: '',
    usage: '',
    targetMarket: '',
    advantages: '',
    tone: '专业',
    specifications: '',
    capacity: '',
    customLogo: '',
    packaging: '',
    moq: '',
    leadTime: '',
    certifications: '',
    targetPlatform: ''
  })
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)
  const [rawText, setRawText] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [dailyUsage, setDailyUsage] = useState(0)

  // 加载历史记录和使用次数
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY)
      if (saved) {
        setHistory(JSON.parse(saved))
      }
      const usage = getTodayUsage()
      setDailyUsage(usage.count)
    } catch {
      // 忽略解析错误
    }
  }, [])

  // 保存历史记录
  const saveToHistory = useCallback((formData: ProductFormData, result: GeneratedContent) => {
    try {
      const record: HistoryRecord = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        productName: formData.productName,
        formData,
        result
      }
      const updated = [record, ...history].slice(0, MAX_HISTORY)
      setHistory(updated)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
    } catch {
      // 忽略存储错误
    }
  }, [history])

  // 删除单条记录
  const deleteRecord = (id: string) => {
    const updated = history.filter(r => r.id !== id)
    setHistory(updated)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  }

  // 清空全部记录
  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem(HISTORY_KEY)
  }

  // 恢复记录
  const restoreRecord = (record: HistoryRecord) => {
    setFormData(record.formData)
    setGeneratedContent(record.result)
    setShowHistory(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins} 分钟前`
    if (diffHours < 24) return `${diffHours} 小时前`
    if (diffDays < 7) return `${diffDays} 天前`
    return date.toLocaleDateString('zh-CN')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleParse = async () => {
    if (!rawText.trim()) {
      setError('请输入产品信息')
      return
    }
    setIsParsing(true)
    setError(null)
    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText }),
      })
      if (!response.ok) throw new Error('解析失败')
      const data = await response.json()
      setFormData(prev => ({
        ...prev,
        productName: data.productName || prev.productName,
        material: data.material || prev.material,
        usage: data.usage || prev.usage,
        targetMarket: data.targetMarket || prev.targetMarket,
        advantages: data.advantages || prev.advantages,
      }))
      setRawText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '解析失败，请稍后重试')
    } finally {
      setIsParsing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent, style?: string) => {
    e.preventDefault()

    // 检查每日使用次数
    const usage = getTodayUsage()
    if (usage.count >= MAX_DAILY_USAGE) {
      setError('今日免费次数已用完，请明天再试或联系获取更多次数')
      return
    }

    setIsLoading(true)
    setError(null)
    setGeneratedContent(null)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, style }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || '生成失败')
      }
      const data = await response.json()
      setGeneratedContent(data)
      saveToHistory(formData, data)
      const newCount = incrementUsage()
      setDailyUsage(newCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(label)
      setTimeout(() => setCopySuccess(null), 2000)
    } catch {
      setError('复制失败')
    }
  }

  const copyAllContent = () => {
    if (!generatedContent) return
    const titles = getTitles()
    const desc = getDescription()
    const platform = getPlatformSuggestion()
    const missing = getMissingInfo()

    const content = `【B2B 平台标题】
${titles.b2b}

【零售平台标题】
${titles.retail}

【五点卖点】
${generatedContent.bullet_points.map((p, i) => `${i + 1}. ${p}`).join('\n')}

【产品详情】
Product Overview:
${desc.product_overview}

Key Features:
${desc.key_features.map(f => `- ${f}`).join('\n')}

Applications:
${desc.applications}

Customization:
${desc.customization}

Packaging & Wholesale Notes:
${desc.packaging_wholesale_notes}

【SEO 关键词】
${generatedContent.seo_keywords.join(', ')}

【平台建议】
推荐平台: ${platform.recommended_platforms.join(', ')}
推荐原因:
${platform.reasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}
注意事项:
${platform.notices.map((n, i) => `${i + 1}. ${n}`).join('\n')}

【建议补充信息】
完整度: ${missing.completeness_score}%
规格参数: ${missing.specification.join(', ') || '无'}
贸易信息: ${missing.trade.join(', ') || '无'}
认证信息: ${missing.certification.join(', ') || '无'}
包装信息: ${missing.packaging.join(', ') || '无'}
定制信息: ${missing.customization.join(', ') || '无'}`

    copyToClipboard(content, '全部内容')
  }

  const getTitles = () => {
    if (!generatedContent) return { b2b: '', retail: '' }
    if (generatedContent.titles) {
      return { b2b: generatedContent.titles.b2b_title, retail: generatedContent.titles.retail_title }
    }
    const legacyTitle = generatedContent.title || ''
    return { b2b: legacyTitle, retail: legacyTitle }
  }

  const getDescription = () => {
    if (!generatedContent) return {
      product_overview: '', key_features: [] as string[], applications: '', customization: '', packaging_wholesale_notes: ''
    }
    if (typeof generatedContent.description === 'object' && generatedContent.description.product_overview !== undefined) {
      return generatedContent.description
    }
    return {
      product_overview: typeof generatedContent.description === 'string' ? generatedContent.description : '',
      key_features: [] as string[], applications: '',
      customization: 'Customization options should be confirmed with the supplier.',
      packaging_wholesale_notes: 'Packaging, MOQ, and lead time should be confirmed based on supplier details.'
    }
  }

  const getPlatformSuggestion = () => {
    if (!generatedContent) return { recommended_platforms: [] as string[], reasons: [] as string[], notices: [] as string[] }
    if (typeof generatedContent.platform_suggestion === 'object' && generatedContent.platform_suggestion.recommended_platforms !== undefined) {
      return generatedContent.platform_suggestion
    }
    return {
      recommended_platforms: ['Alibaba.com'],
      reasons: [typeof generatedContent.platform_suggestion === 'string' ? generatedContent.platform_suggestion : ''],
      notices: ['For B2C platforms, additional product images and detailed specifications may be required.']
    }
  }

  const getMissingInfo = () => {
    if (!generatedContent) return {
      completeness_score: 0, specification: [] as string[], trade: [] as string[], certification: [] as string[], packaging: [] as string[], customization: [] as string[]
    }
    if (generatedContent.missing_info && typeof generatedContent.missing_info === 'object' && generatedContent.missing_info.completeness_score !== undefined) {
      return generatedContent.missing_info
    }
    if (Array.isArray(generatedContent.missing_info)) {
      return {
        completeness_score: 50, specification: generatedContent.missing_info as string[],
        trade: [] as string[], certification: [] as string[], packaging: [] as string[], customization: [] as string[]
      }
    }
    return {
      completeness_score: 50, specification: [] as string[], trade: [] as string[], certification: [] as string[], packaging: [] as string[], customization: [] as string[]
    }
  }

  const calculateCompleteness = () => {
    const requiredFields = ['productName', 'material', 'usage', 'targetMarket', 'advantages']
    const optionalFields = ['specifications', 'capacity', 'customLogo', 'packaging', 'moq', 'leadTime', 'certifications', 'targetPlatform']
    let filledRequired = 0, filledOptional = 0
    requiredFields.forEach(field => { if (formData[field as keyof ProductFormData]) filledRequired++ })
    optionalFields.forEach(field => { if (formData[field as keyof ProductFormData]) filledOptional++ })
    return Math.round((filledRequired / requiredFields.length) * 60 + (filledOptional / optionalFields.length) * 40)
  }

  const completeness = calculateCompleteness()

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* 头部导航 */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">外贸助手</span>
            </a>
            {/* 历史记录按钮 */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">生成记录</span>
              {history.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">{history.length}</span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* 历史记录面板 */}
        {showHistory && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                最近生成记录
              </h2>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                >
                  清空全部
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p>暂无生成记录</p>
                <p className="text-sm mt-1">生成文案后会自动保存到这里</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {history.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                  >
                    <div
                      className="flex-1 cursor-pointer mr-4"
                      onClick={() => restoreRecord(record)}
                    >
                      <div className="flex items-center mb-1">
                        <span className="font-medium text-gray-900">{record.productName || '未命名产品'}</span>
                        <span className="ml-2 text-xs text-gray-500">{formatTime(record.timestamp)}</span>
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {record.formData.material && <span className="mr-3">材质: {record.formData.material}</span>}
                        {record.formData.usage && <span className="mr-3">用途: {record.formData.usage}</span>}
                        {record.formData.targetMarket && <span>市场: {record.formData.targetMarket}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => restoreRecord(record)}
                        className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        恢复
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteRecord(record.id)
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 页面标题 */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">商品文案生成</h1>
          <p className="text-lg text-gray-600">输入产品信息，AI 自动生成专业外贸英文文案</p>
          <div className="mt-3 inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
            <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-gray-600">
              今日剩余次数：
              <span className={`font-semibold ${MAX_DAILY_USAGE - dailyUsage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {MAX_DAILY_USAGE - dailyUsage}
              </span>
              /{MAX_DAILY_USAGE}
            </span>
          </div>
        </div>

        {/* 使用提示 */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">使用提示</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>输入越完整，生成结果越准确</li>
                  <li>未提供的认证、尺寸、重量、MOQ 等信息，AI 不会自动编造</li>
                  <li>可先粘贴一段中文产品资料，让 AI 自动填写表单</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 快速粘贴产品资料 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">快速粘贴产品资料</h2>
              <p className="text-sm text-gray-500">粘贴一段中文产品介绍，AI 将自动提取产品名称、材质、用途、优势和目标市场。</p>
            </div>
          </div>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            placeholder="粘贴产品信息到这里，例如：可折叠宠物碗，食品级硅胶，适合户外遛狗、旅行、露营，轻便可折叠，支持定制 Logo..."
          />
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleParse}
              disabled={isParsing}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isParsing ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  解析中...
                </span>
              ) : 'AI 自动填写表单'}
            </button>
          </div>
        </div>

        {/* 表单区域 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">产品信息</h2>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">资料完整度</span>
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${completeness >= 80 ? 'bg-green-500' : completeness >= 60 ? 'bg-blue-500' : completeness >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${completeness}%` }} />
              </div>
              <span className="text-sm font-medium text-gray-700 ml-2">{completeness}%</span>
            </div>
          </div>

          <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">产品中文名称 <span className="text-red-500">*</span></label>
                <input type="text" id="productName" name="productName" value={formData.productName} onChange={handleInputChange} required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="例如：蓝牙耳机" />
              </div>
              <div>
                <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-2">产品材质</label>
                <input type="text" id="material" name="material" value={formData.material} onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="例如：塑料、金属、硅胶" />
              </div>
              <div>
                <label htmlFor="usage" className="block text-sm font-medium text-gray-700 mb-2">产品用途</label>
                <input type="text" id="usage" name="usage" value={formData.usage} onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="例如：音乐播放、通话、运动" />
              </div>
              <div>
                <label htmlFor="targetMarket" className="block text-sm font-medium text-gray-700 mb-2">目标市场</label>
                <input type="text" id="targetMarket" name="targetMarket" value={formData.targetMarket} onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="例如：欧美、东南亚、中东" />
              </div>
            </div>

            <div>
              <label htmlFor="advantages" className="block text-sm font-medium text-gray-700 mb-2">产品优势</label>
              <textarea id="advantages" name="advantages" value={formData.advantages} onChange={handleInputChange} rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all" placeholder="例如：续航8小时、IPX5防水、支持快充、重量仅50g" />
            </div>

            <div>
              <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">语气风格</label>
              <select id="tone" name="tone" value={formData.tone} onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white">
                <option value="专业">专业</option>
                <option value="亲切">亲切</option>
                <option value="简洁">简洁</option>
                <option value="详细">详细</option>
              </select>
            </div>

            {/* 高级信息折叠区域 */}
            <div className="border-t border-gray-200 pt-6">
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors">
                <svg className={`w-4 h-4 mr-2 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {showAdvanced ? '收起高级信息' : '展开高级信息'}
              </button>

              {showAdvanced && (
                <div className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="specifications" className="block text-sm font-medium text-gray-700 mb-2">产品规格/尺寸</label>
                      <input type="text" id="specifications" name="specifications" value={formData.specifications} onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="例如：10cm x 5cm x 3cm" />
                    </div>
                    <div>
                      <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">容量/重量</label>
                      <input type="text" id="capacity" name="capacity" value={formData.capacity} onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="例如：500ml、200g" />
                    </div>
                    <div>
                      <label htmlFor="customLogo" className="block text-sm font-medium text-gray-700 mb-2">是否支持定制 Logo</label>
                      <select id="customLogo" name="customLogo" value={formData.customLogo} onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white">
                        <option value="">请选择</option>
                        <option value="支持">支持</option>
                        <option value="不支持">不支持</option>
                        <option value="视数量而定">视数量而定</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="packaging" className="block text-sm font-medium text-gray-700 mb-2">包装方式</label>
                      <input type="text" id="packaging" name="packaging" value={formData.packaging} onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="例如：彩盒包装、OPP袋" />
                    </div>
                    <div>
                      <label htmlFor="moq" className="block text-sm font-medium text-gray-700 mb-2">MOQ（最小起订量）</label>
                      <input type="text" id="moq" name="moq" value={formData.moq} onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="例如：100件" />
                    </div>
                    <div>
                      <label htmlFor="leadTime" className="block text-sm font-medium text-gray-700 mb-2">交期</label>
                      <input type="text" id="leadTime" name="leadTime" value={formData.leadTime} onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="例如：7-15天" />
                    </div>
                    <div>
                      <label htmlFor="certifications" className="block text-sm font-medium text-gray-700 mb-2">认证/检测报告</label>
                      <input type="text" id="certifications" name="certifications" value={formData.certifications} onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="例如：CE、FDA、RoHS" />
                    </div>
                    <div>
                      <label htmlFor="targetPlatform" className="block text-sm font-medium text-gray-700 mb-2">目标平台</label>
                      <select id="targetPlatform" name="targetPlatform" value={formData.targetPlatform} onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white">
                        <option value="">请选择</option>
                        <option value="Alibaba">Alibaba.com</option>
                        <option value="Global Sources">Global Sources</option>
                        <option value="Made-in-China">Made-in-China</option>
                        <option value="Amazon">Amazon</option>
                        <option value="Shopify">Shopify</option>
                        <option value="其他">其他</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center pt-4">
              <button type="submit" disabled={isLoading}
                className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    生成中...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    生成文案
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 复制成功提示 */}
        {copySuccess && (
          <div className="fixed top-20 right-4 z-50 animate-slide-in">
            <div className="bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {copySuccess} 已复制
            </div>
          </div>
        )}

        {/* 生成结果 */}
        {generatedContent && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            {/* 结果区标题和快捷操作 */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">生成结果</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    信息完整度: <span className={`font-semibold ${getMissingInfo().completeness_score >= 80 ? 'text-green-600' : getMissingInfo().completeness_score >= 60 ? 'text-blue-600' : 'text-amber-600'}`}>{getMissingInfo().completeness_score}%</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={(e) => handleSubmit(e)} disabled={isLoading} className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">重新生成</button>
                <button onClick={(e) => handleSubmit(e, 'professional')} disabled={isLoading} className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50">更专业</button>
                <button onClick={(e) => handleSubmit(e, 'concise')} disabled={isLoading} className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50">更简洁</button>
                <button onClick={(e) => handleSubmit(e, 'alibaba')} disabled={isLoading} className="px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50">Alibaba 风格</button>
                <button onClick={(e) => handleSubmit(e, 'amazon')} disabled={isLoading} className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50">Amazon 风格</button>
              </div>
            </div>

            {/* 一键复制全部 */}
            <div className="flex justify-end mb-6">
              <button onClick={copyAllContent} className="px-5 py-2.5 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-medium rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                一键复制全部
              </button>
            </div>

            <div className="space-y-6">
              {/* 商品标题 - 双版本 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wider mb-4">商品标题</h3>
                <div className="mb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-md mr-2">B2B 平台</span>
                        <span className="text-xs text-gray-500">Alibaba.com / Global Sources / Made-in-China</span>
                      </div>
                      <p className="text-lg text-gray-900 font-medium">{getTitles().b2b}</p>
                    </div>
                    <button onClick={() => copyToClipboard(getTitles().b2b, 'B2B 标题')} className="ml-4 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      复制
                    </button>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-md mr-2">零售平台</span>
                        <span className="text-xs text-gray-500">Amazon / Shopify</span>
                      </div>
                      <p className="text-lg text-gray-900 font-medium">{getTitles().retail}</p>
                    </div>
                    <button onClick={() => copyToClipboard(getTitles().retail, '零售标题')} className="ml-4 px-3 py-1.5 text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition-all flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      复制
                    </button>
                  </div>
                </div>
              </div>

              {/* 五点卖点 */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-3">五点卖点</h3>
                    <ul className="space-y-3">
                      {generatedContent.bullet_points.map((point, index) => (
                        <li key={index} className="flex items-start">
                          <span className="flex-shrink-0 w-6 h-6 bg-green-200 text-green-800 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">{index + 1}</span>
                          <span className="text-gray-800">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button onClick={() => copyToClipboard(generatedContent.bullet_points.join('\n'), '卖点')} className="ml-4 px-3 py-1.5 text-sm text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-all flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    复制
                  </button>
                </div>
              </div>

              {/* 产品详情 */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wider mb-4">产品详情</h3>
                    <div className="space-y-5">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>Product Overview</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">{getDescription().product_overview}</p>
                      </div>
                      {getDescription().key_features.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>Key Features</h4>
                          <ul className="space-y-2">
                            {getDescription().key_features.map((feature, index) => (
                              <li key={index} className="flex items-start">
                                <svg className="w-4 h-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                <span className="text-gray-700 text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>Applications</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">{getDescription().applications}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>Customization</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">{getDescription().customization}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>Packaging & Wholesale Notes</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">{getDescription().packaging_wholesale_notes}</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => {
                    const desc = getDescription()
                    const text = `Product Overview:\n${desc.product_overview}\n\nKey Features:\n${desc.key_features.map(f => `- ${f}`).join('\n')}\n\nApplications:\n${desc.applications}\n\nCustomization:\n${desc.customization}\n\nPackaging & Wholesale Notes:\n${desc.packaging_wholesale_notes}`
                    copyToClipboard(text, '详情')
                  }} className="ml-4 px-3 py-1.5 text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition-all flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    复制
                  </button>
                </div>
              </div>

              {/* SEO 关键词 */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-orange-700 uppercase tracking-wider mb-3">SEO 关键词</h3>
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.seo_keywords.map((keyword, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">{keyword}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => copyToClipboard(generatedContent.seo_keywords.join(', '), '关键词')} className="ml-4 px-3 py-1.5 text-sm text-orange-600 hover:text-orange-800 hover:bg-orange-100 rounded-lg transition-all flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    复制
                  </button>
                </div>
              </div>

              {/* 平台建议 */}
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-5">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-cyan-700 uppercase tracking-wider mb-4">平台建议</h3>
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-gray-600 mb-2">推荐平台</h4>
                      <div className="flex flex-wrap gap-2">
                        {getPlatformSuggestion().recommended_platforms.map((platform, index) => (
                          <span key={index} className="px-3 py-1.5 bg-cyan-100 text-cyan-800 rounded-lg text-sm font-medium">{platform}</span>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-gray-600 mb-2">推荐原因</h4>
                      <ul className="space-y-2">
                        {getPlatformSuggestion().reasons.map((reason, index) => (
                          <li key={index} className="flex items-start">
                            <svg className="w-4 h-4 text-cyan-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="text-gray-700 text-sm">{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {getPlatformSuggestion().notices.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-600 mb-2">使用提醒</h4>
                        <ul className="space-y-2">
                          {getPlatformSuggestion().notices.map((notice, index) => (
                            <li key={index} className="flex items-start">
                              <svg className="w-4 h-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                              <span className="text-gray-700 text-sm">{notice}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <button onClick={() => {
                    const platform = getPlatformSuggestion()
                    const text = `推荐平台: ${platform.recommended_platforms.join(', ')}\n\n推荐原因:\n${platform.reasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\n注意事项:\n${platform.notices.map((n, i) => `${i + 1}. ${n}`).join('\n')}`
                    copyToClipboard(text, '平台建议')
                  }} className="ml-4 px-3 py-1.5 text-sm text-cyan-600 hover:text-cyan-800 hover:bg-cyan-100 rounded-lg transition-all flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    复制
                  </button>
                </div>
              </div>

              {/* 建议补充信息 */}
              {(() => {
                const missing = getMissingInfo()
                const totalMissing = missing.specification.length + missing.trade.length + missing.certification.length + missing.packaging.length + missing.customization.length
                if (totalMissing === 0) return null

                const groupColors: { [key: string]: { bg: string; text: string } } = {
                  specification: { bg: 'bg-blue-100', text: 'text-blue-800' },
                  trade: { bg: 'bg-green-100', text: 'text-green-800' },
                  certification: { bg: 'bg-purple-100', text: 'text-purple-800' },
                  packaging: { bg: 'bg-orange-100', text: 'text-orange-800' },
                  customization: { bg: 'bg-pink-100', text: 'text-pink-800' }
                }
                const groupTitles: { [key: string]: string } = {
                  specification: '规格参数', trade: '贸易信息', certification: '认证信息', packaging: '包装信息', customization: '定制信息'
                }

                return (
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-5">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-2">建议补充信息</h3>
                        <p className="text-xs text-amber-600 mb-4">补充以下信息可以让文案更精准、更专业：</p>
                        <div className="space-y-4">
                          {Object.entries(missing)
                            .filter(([key, items]) => key !== 'completeness_score' && Array.isArray(items) && items.length > 0)
                            .map(([key, items]) => {
                              const colors = groupColors[key] || { bg: 'bg-gray-100', text: 'text-gray-800' }
                              return (
                                <div key={key}>
                                  <h4 className="text-xs font-semibold text-gray-700 mb-2">{groupTitles[key] || key}</h4>
                                  <ul className="space-y-1.5">
                                    {(items as string[]).map((info, index) => (
                                      <li key={index} className="flex items-start">
                                        <span className={`flex-shrink-0 w-4 h-4 ${colors.bg} ${colors.text} rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5`}>+</span>
                                        <span className="text-gray-800 text-sm">{info}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )
                            })}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </main>
  )
}

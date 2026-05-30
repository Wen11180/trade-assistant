'use client'

import { useState, useEffect } from 'react'
import type { Lead, LeadStatus } from '../../types/growth'

// 常量
const LEADS_KEY = 'growth_leads'
const TASKS_KEY = 'growth_tasks'

// 渠道列表
const CHANNELS = ['小红书', '抖音', '视频号', '微信群', '朋友圈', 'LinkedIn']

// 内容类型
const CONTENT_TYPES = ['产品测试案例', '外贸文案避坑', '免费内测邀请', '用户反馈复盘', '功能介绍', '对比普通 ChatGPT']

// 产品类别
const PRODUCT_CATEGORIES = ['宠物用品', '家居收纳', '手机配件', '五金工具', '户外用品', '自定义']

// 线索状态
const LEAD_STATUSES: LeadStatus[] = ['未联系', '已私信', '已回复', '已发产品', '已试用', '有兴趣', '无兴趣']

// 私信话术库
const MESSAGE_TEMPLATES = [
  {
    id: '1',
    title: '小红书外贸用户私信',
    content: '你好～看到你也是做外贸的，我最近在用一个 AI 工具生成英文商品文案，效果还不错。如果你有产品需要写英文描述，我可以免费帮你生成一版试试，你看方便吗？'
  },
  {
    id: '2',
    title: '微信群试用邀请',
    content: '大家好！我最近发现一个 AI 外贸文案生成工具，试了一下效果不错。如果有朋友需要写产品英文描述，可以发我产品信息，我免费帮你生成一份～'
  },
  {
    id: '3',
    title: '工厂/厂家私信',
    content: '您好！我是做外贸的，最近在用一个 AI 工具生成产品英文文案。如果您有新产品需要英文描述，我可以免费帮您生成一版，看看效果再决定是否合作。'
  },
  {
    id: '4',
    title: 'LinkedIn 英文私信',
    content: 'Hi! I\'ve been using an AI tool to generate product descriptions for international trade platforms. If you need English product copy for Alibaba or Amazon, I\'d be happy to help generate a sample for free. Would you be interested?'
  },
  {
    id: '5',
    title: '用户回复后的跟进话术',
    content: '太好了！你把产品信息发给我就行，包括产品名称、材质、用途、优势这些。我用 AI 工具帮你生成一版英文文案，大概 30 秒就能出结果。'
  }
]

export default function GrowthPage() {
  const [activeTab, setActiveTab] = useState('tasks')
  const [leads, setLeads] = useState<Lead[]>([])
  const [showAddLead, setShowAddLead] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [filterChannel, setFilterChannel] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [tasks, setTasks] = useState<Record<string, boolean>>({})

  // 内容生成状态
  const [contentChannel, setContentChannel] = useState('小红书')
  const [contentType, setContentType] = useState('产品测试案例')
  const [productCategory, setProductCategory] = useState('宠物用品')
  const [productInfo, setProductInfo] = useState('')
  const [generatedContent, setGeneratedContent] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // 测试案例状态
  const [testCaseInfo, setTestCaseInfo] = useState('')
  const [testCaseResult, setTestCaseResult] = useState('')
  const [testCaseScore, setTestCaseScore] = useState(8)
  const [testCaseIssues, setTestCaseIssues] = useState('')
  const [testCaseContent, setTestCaseContent] = useState<any>(null)

  // 加载数据
  useEffect(() => {
    try {
      const savedLeads = localStorage.getItem(LEADS_KEY)
      if (savedLeads) setLeads(JSON.parse(savedLeads))

      const savedTasks = localStorage.getItem(TASKS_KEY)
      if (savedTasks) {
        const taskData = JSON.parse(savedTasks)
        const today = new Date().toISOString().split('T')[0]
        if (taskData.date === today) {
          setTasks(taskData.tasks)
        }
      }
    } catch {
      // 忽略错误
    }
  }, [])

  // 保存线索
  const saveLeads = (newLeads: Lead[]) => {
    setLeads(newLeads)
    localStorage.setItem(LEADS_KEY, JSON.stringify(newLeads))
  }

  // 保存任务状态
  const saveTasks = (newTasks: Record<string, boolean>) => {
    setTasks(newTasks)
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(TASKS_KEY, JSON.stringify({ date: today, tasks: newTasks }))
  }

  // 切换任务完成状态
  const toggleTask = (taskId: string) => {
    const newTasks = { ...tasks, [taskId]: !tasks[taskId] }
    saveTasks(newTasks)
  }

  // 添加线索
  const addLead = (lead: Omit<Lead, 'id' | 'date'>) => {
    const newLead: Lead = {
      ...lead,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0]
    }
    saveLeads([...leads, newLead])
    setShowAddLead(false)
  }

  // 更新线索
  const updateLead = (updatedLead: Lead) => {
    const newLeads = leads.map(l => l.id === updatedLead.id ? updatedLead : l)
    saveLeads(newLeads)
    setEditingLead(null)
  }

  // 删除线索
  const deleteLead = (id: string) => {
    saveLeads(leads.filter(l => l.id !== id))
  }

  // 筛选线索
  const filteredLeads = leads.filter(lead => {
    if (filterChannel && lead.channel !== filterChannel) return false
    if (filterStatus && lead.status !== filterStatus) return false
    return true
  })

  // 计算统计数据
  const getStats = () => {
    const stats: Record<string, { total: number; contacted: number; replied: number; tried: number; interested: number }> = {}

    CHANNELS.forEach(channel => {
      stats[channel] = { total: 0, contacted: 0, replied: 0, tried: 0, interested: 0 }
    })

    leads.forEach(lead => {
      const channel = lead.channel
      if (!stats[channel]) stats[channel] = { total: 0, contacted: 0, replied: 0, tried: 0, interested: 0 }

      stats[channel].total++
      if (lead.status === '已私信' || lead.status === '已回复' || lead.status === '已发产品' || lead.status === '已试用' || lead.status === '有兴趣') {
        stats[channel].contacted++
      }
      if (lead.status === '已回复' || lead.status === '已发产品' || lead.status === '已试用' || lead.status === '有兴趣') {
        stats[channel].replied++
      }
      if (lead.status === '已试用') {
        stats[channel].tried++
      }
      if (lead.status === '有兴趣') {
        stats[channel].interested++
      }
    })

    return stats
  }

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('已复制')
    } catch {
      alert('复制失败')
    }
  }

  // 生成推广内容
  const generateContent = async () => {
    setIsGenerating(true)
    try {
      // 模拟生成内容
      const content = generateMockContent(contentChannel, contentType, productCategory, productInfo)
      setGeneratedContent(content)
    } catch {
      alert('生成失败')
    } finally {
      setIsGenerating(false)
    }
  }

  // 模拟内容生成
  const generateMockContent = (channel: string, type: string, category: string, info: string) => {
    const productName = info || category

    if (channel === '小红书') {
      return {
        title_options: [
          `外贸人必备！AI 帮你写英文文案，亲测好用`,
          `做外贸 5 年，终于找到好用的文案工具了`,
          `免费分享！AI 自动生成 Alibaba 商品文案`
        ],
        body: `姐妹们！发现一个超好用的 AI 外贸文案工具！\n\n我是做${productName}的，之前写英文描述真的头大，找翻译又贵又慢。\n\n现在用这个 AI 工具，30 秒就能生成专业英文文案，而且：\n\n✅ 不会乱写认证（CE、FDA 这些）\n✅ 不会乱写尺寸重量\n✅ 标题格式像 Alibaba 风格\n✅ 支持一键复制\n\n关键是完全免费！\n\n我已经用它生成了好几个产品的文案，直接就能用，省了好多时间。`,
        hashtags: ['#外贸工具', '#跨境电商', '#AI工具', '#阿里巴巴国际站', '#外贸人的一天'],
        comment_cta: '评论「外贸助手」，我发你免费测试入口'
      }
    }

    if (channel === '抖音' || channel === '视频号') {
      return {
        hook: '做外贸的注意了！这个 AI 工具 30 秒就能写出专业英文文案',
        script: `【开头】\n做外贸的朋友，你还在为写英文产品描述发愁吗？\n\n【痛点】\n找翻译？贵！自己写？不专业！用 ChatGPT？它会乱写认证乱写参数！\n\n【解决方案】\n今天给大家分享一个专门做外贸文案的 AI 工具，它有三个特点：\n第一，不会乱写 CE、FDA 这些认证\n第二，不会乱写尺寸重量这些参数\n第三，标题格式专门针对 Alibaba 平台优化\n\n【演示】\n你看，我输入产品信息，30 秒就生成了完整的英文文案\n\n【结尾】\n关键是完全免费！评论区扣"外贸"，我免费帮你生成一版`,
        shot_list: ['展示产品输入界面', '点击生成按钮', '展示生成结果', '展示一键复制'],
        caption: '外贸人必备工具！AI 生成专业英文文案 #外贸 #AI工具 #跨境电商',
        comment_cta: '评论「外贸」，我免费帮你生成'
      }
    }

    if (channel === '微信群' || channel === '朋友圈') {
      return {
        message: `分享一个自用的 AI 外贸文案生成工具，效果不错：\n\n1. 输入中文产品描述\n2. 30 秒生成专业英文文案\n3. 支持 Alibaba/Amazon 平台\n4. 完全免费\n\n我用它生成了几个${productName}的文案，直接就能用。`,
        soft_cta: '有需要的可以发我一个产品，我免费帮你生成一版'
      }
    }

    if (channel === 'LinkedIn') {
      return {
        post: `I've been testing an AI tool for generating product descriptions for international trade platforms like Alibaba and Amazon.\n\nHere's what I found:\n\n✅ It doesn't fabricate certifications (CE, FDA, etc.)\n✅ It doesn't invent dimensions or weight\n✅ Titles are optimized for B2B platforms\n✅ It's completely free to use\n\nIf you need English product copy for your business, I'd be happy to help generate a sample for free.\n\nJust send me your product details and I'll create a professional listing for you.\n\n#InternationalTrade #B2B #AI #ProductDescription #Alibaba`,
        dm_template: `Hi [Name],\n\nI noticed you're in the [product] business. I've been using an AI tool to generate product descriptions for platforms like Alibaba and Amazon.\n\nWould you be interested in a free sample? Just send me your product details and I'll create a professional English listing for you.\n\nNo strings attached - just looking for feedback on the tool.`
      }
    }

    return { message: '请先填写产品信息' }
  }

  // 生成测试案例
  const generateTestCase = () => {
    if (!testCaseInfo || !testCaseResult) {
      alert('请填写产品信息和生成结果')
      return
    }

    setTestCaseContent({
      xiaohongshu: `【测试案例】我拿${testCaseInfo}测试了 AI 外贸文案工具\n\n测试结果：${testCaseScore}分\n\n优点：\n✅ 不会乱写认证\n✅ 不会乱写参数\n✅ 标题格式专业\n\n${testCaseIssues ? `问题：${testCaseIssues}` : '整体效果不错，推荐外贸朋友试试'}`,
      朋友圈: `测试了一下 AI 外贸文案工具，用${testCaseInfo}测试，效果还不错。${testCaseIssues ? `有些小问题：${testCaseIssues}` : '推荐外贸朋友试试'}`,
      shortVideo: `【开头】测试 AI 外贸文案工具\n【产品】${testCaseInfo}\n【评分】${testCaseScore}分\n【问题】${testCaseIssues || '无'}\n【结论】推荐试用`
    })
  }

  const stats = getStats()

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
            <a href="/tools/product-copy" className="text-sm text-gray-600 hover:text-gray-900">文案生成</a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">推广工作台</h1>
          <p className="text-gray-600">管理推广任务、生成内容、记录线索</p>
        </div>

        {/* 标签页导航 */}
        <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'tasks', label: '今日任务' },
            { id: 'content', label: '内容生成' },
            { id: 'templates', label: '话术库' },
            { id: 'leads', label: '线索管理' },
            { id: 'cases', label: '案例生成' },
            { id: 'stats', label: '效果统计' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 今日任务 */}
        {activeTab === 'tasks' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">今日推广任务</h2>
            <div className="space-y-4">
              {[
                { id: 'xiaohongshu', title: '小红书发布 1 篇笔记' },
                { id: 'video', title: '抖音/视频号发布 1 条短视频脚本' },
                { id: 'dm', title: '私信 20 个目标用户' },
                { id: 'test', title: '找 3 个真实产品做免费生成' },
                { id: 'feedback', title: '记录 5 条用户反馈' }
              ].map(task => (
                <div key={task.id} className="flex items-center p-4 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    checked={tasks[task.id] || false}
                    onChange={() => toggleTask(task.id)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className={`ml-3 ${tasks[task.id] ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {task.title}
                  </span>
                  {tasks[task.id] && (
                    <span className="ml-auto text-sm text-green-600">✓ 完成</span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <span className="text-sm text-gray-500">
                完成进度：{Object.values(tasks).filter(Boolean).length} / 5
              </span>
            </div>
          </div>
        )}

        {/* 内容生成 */}
        {activeTab === 'content' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">生成推广内容</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">渠道</label>
                  <select
                    value={contentChannel}
                    onChange={(e) => setContentChannel(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CHANNELS.map(ch => (
                      <option key={ch} value={ch}>{ch}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">内容类型</label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CONTENT_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">产品类别</label>
                  <select
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PRODUCT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">产品信息（可选）</label>
                  <textarea
                    value={productInfo}
                    onChange={(e) => setProductInfo(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="输入具体产品信息..."
                  />
                </div>
                <button
                  onClick={generateContent}
                  disabled={isGenerating}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {isGenerating ? '生成中...' : '生成推广内容'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">生成结果</h2>
              {generatedContent ? (
                <div className="space-y-4">
                  {contentChannel === '小红书' && (
                    <>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">标题选项</h3>
                        {(generatedContent as any).title_options?.map((title: string, i: number) => (
                          <p key={i} className="text-sm text-gray-600 mb-1">{i + 1}. {title}</p>
                        ))}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">正文</h3>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{(generatedContent as any).body}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">标签</h3>
                        <div className="flex flex-wrap gap-2">
                          {(generatedContent as any).hashtags?.map((tag: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">评论引导</h3>
                        <p className="text-sm text-gray-600">{(generatedContent as any).comment_cta}</p>
                      </div>
                    </>
                  )}

                  {(contentChannel === '抖音' || contentChannel === '视频号') && (
                    <>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">开头钩子</h3>
                        <p className="text-sm text-gray-600">{(generatedContent as any).hook}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">口播脚本</h3>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{(generatedContent as any).script}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">镜头列表</h3>
                        {(generatedContent as any).shot_list?.map((shot: string, i: number) => (
                          <p key={i} className="text-sm text-gray-600">{i + 1}. {shot}</p>
                        ))}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">视频文案</h3>
                        <p className="text-sm text-gray-600">{(generatedContent as any).caption}</p>
                      </div>
                    </>
                  )}

                  {(contentChannel === '微信群' || contentChannel === '朋友圈') && (
                    <>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">文案</h3>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{(generatedContent as any).message}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">软性 CTA</h3>
                        <p className="text-sm text-gray-600">{(generatedContent as any).soft_cta}</p>
                      </div>
                    </>
                  )}

                  {contentChannel === 'LinkedIn' && (
                    <>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">LinkedIn 帖子</h3>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{(generatedContent as any).post}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">私信模板</h3>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{(generatedContent as any).dm_template}</p>
                      </div>
                    </>
                  )}

                  <button
                    onClick={() => copyToClipboard(JSON.stringify(generatedContent, null, 2))}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    复制全部内容
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p>选择渠道和类型，点击生成</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 话术库 */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            {MESSAGE_TEMPLATES.map(template => (
              <div key={template.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{template.title}</h3>
                  <button
                    onClick={() => copyToClipboard(template.content)}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                  >
                    复制
                  </button>
                </div>
                <p className="text-gray-600 whitespace-pre-line">{template.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* 线索管理 */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            {/* 筛选和新增 */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-4">
                  <select
                    value={filterChannel}
                    onChange={(e) => setFilterChannel(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">所有渠道</option>
                    {CHANNELS.map(ch => (
                      <option key={ch} value={ch}>{ch}</option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">所有状态</option>
                    {LEAD_STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setShowAddLead(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + 新增线索
                </button>
              </div>
            </div>

            {/* 统计卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">总线索</p>
                <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">已私信</p>
                <p className="text-2xl font-bold text-blue-600">{leads.filter(l => l.status !== '未联系').length}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">已回复</p>
                <p className="text-2xl font-bold text-green-600">{leads.filter(l => ['已回复', '已发产品', '已试用', '有兴趣'].includes(l.status)).length}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">已试用</p>
                <p className="text-2xl font-bold text-purple-600">{leads.filter(l => l.status === '已试用').length}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">有兴趣</p>
                <p className="text-2xl font-bold text-orange-600">{leads.filter(l => l.status === '有兴趣').length}</p>
              </div>
            </div>

            {/* 线索列表 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">日期</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">渠道</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">昵称/公司</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">产品类别</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">状态</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">备注</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLeads.map(lead => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-600">{lead.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{lead.channel}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{lead.nickname}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{lead.productCategory}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            lead.status === '未联系' ? 'bg-gray-100 text-gray-600' :
                            lead.status === '已私信' ? 'bg-blue-100 text-blue-600' :
                            lead.status === '已回复' ? 'bg-green-100 text-green-600' :
                            lead.status === '已试用' ? 'bg-purple-100 text-purple-600' :
                            lead.status === '有兴趣' ? 'bg-orange-100 text-orange-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">{lead.notes}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingLead(lead)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => deleteLead(lead.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredLeads.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p>暂无线索</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 案例生成 */}
        {activeTab === 'cases' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">测试案例生成器</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">产品中文信息</label>
                  <textarea
                    value={testCaseInfo}
                    onChange={(e) => setTestCaseInfo(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="例如：可折叠宠物碗，食品级硅胶"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">AI 生成的英文结果</label>
                  <textarea
                    value={testCaseResult}
                    onChange={(e) => setTestCaseResult(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="粘贴 AI 生成的英文文案..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">人工评分（1-10）</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={testCaseScore}
                    onChange={(e) => setTestCaseScore(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">问题点（可选）</label>
                  <textarea
                    value={testCaseIssues}
                    onChange={(e) => setTestCaseIssues(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="例如：标题太长、关键词不够..."
                  />
                </div>
                <button
                  onClick={generateTestCase}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  生成案例文案
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">案例文案</h2>
              {testCaseContent ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">小红书文案</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-line bg-gray-50 p-4 rounded-lg">{testCaseContent.xiaohongshu}</p>
                    <button
                      onClick={() => copyToClipboard(testCaseContent.xiaohongshu)}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      复制
                    </button>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">朋友圈文案</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-line bg-gray-50 p-4 rounded-lg">{testCaseContent.朋友圈}</p>
                    <button
                      onClick={() => copyToClipboard(testCaseContent.朋友圈)}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      复制
                    </button>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">短视频脚本</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-line bg-gray-50 p-4 rounded-lg">{testCaseContent.shortVideo}</p>
                    <button
                      onClick={() => copyToClipboard(testCaseContent.shortVideo)}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      复制
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p>填写测试信息，生成案例文案</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 效果统计 */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CHANNELS.map(channel => {
                const channelStats = stats[channel]
                return (
                  <div key={channel} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{channel}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">总联系</span>
                        <span className="text-sm font-medium text-gray-900">{channelStats.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">已私信</span>
                        <span className="text-sm font-medium text-blue-600">{channelStats.contacted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">已回复</span>
                        <span className="text-sm font-medium text-green-600">{channelStats.replied}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">已试用</span>
                        <span className="text-sm font-medium text-purple-600">{channelStats.tried}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">有兴趣</span>
                        <span className="text-sm font-medium text-orange-600">{channelStats.interested}</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">回复率</span>
                          <span className="text-sm font-medium text-gray-900">
                            {channelStats.contacted > 0 ? Math.round((channelStats.replied / channelStats.contacted) * 100) : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">试用率</span>
                          <span className="text-sm font-medium text-gray-900">
                            {channelStats.contacted > 0 ? Math.round((channelStats.tried / channelStats.contacted) * 100) : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">兴趣率</span>
                          <span className="text-sm font-medium text-gray-900">
                            {channelStats.contacted > 0 ? Math.round((channelStats.interested / channelStats.contacted) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* 新增/编辑线索弹窗 */}
      {(showAddLead || editingLead) && (
        <LeadModal
          lead={editingLead}
          onSave={editingLead ? updateLead : addLead}
          onClose={() => {
            setShowAddLead(false)
            setEditingLead(null)
          }}
        />
      )}
    </main>
  )
}

// 线线索弹窗组件
function LeadModal({ lead, onSave, onClose }: {
  lead: Lead | null
  onSave: (lead: any) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    channel: lead?.channel || '小红书',
    nickname: lead?.nickname || '',
    contact: lead?.contact || '',
    productCategory: lead?.productCategory || '',
    status: lead?.status || '未联系' as LeadStatus,
    notes: lead?.notes || '',
    nextFollowDate: lead?.nextFollowDate || ''
  })

  const handleSubmit = () => {
    if (!formData.nickname) {
      alert('请填写昵称')
      return
    }
    onSave(lead ? { ...lead, ...formData } : formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {lead ? '编辑线索' : '新增线索'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">渠道</label>
              <select
                value={formData.channel}
                onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CHANNELS.map(ch => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">昵称/公司 *</label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入昵称或公司名"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">联系方式/主页</label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="微信号、小红书主页等"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">产品类别</label>
              <input
                type="text"
                value={formData.productCategory}
                onChange={(e) => setFormData({ ...formData, productCategory: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如：宠物用品"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {LEAD_STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="添加备注..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">下次跟进日期</label>
              <input
                type="date"
                value={formData.nextFollowDate}
                onChange={(e) => setFormData({ ...formData, nextFollowDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              {lead ? '保存' : '添加'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

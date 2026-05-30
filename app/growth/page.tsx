'use client'

import { useState, useEffect } from 'react'
import type { Lead, LeadStatus } from '../../types/growth'

// 常量
const LEADS_KEY = 'growth_leads'
const TASKS_KEY = 'growth_tasks'

// 渠道列表
const CHANNELS = ['小红书', '抖音', '视频号', '微信群', '朋友圈', 'LinkedIn']

// 内容类型
const CONTENT_TYPES = [
  '产品测试案例',
  '外贸文案避坑指南',
  '免费内测邀请',
  '用户反馈复盘',
  '功能介绍',
  '对比 ChatGPT',
  '新手入门教程',
  '行业痛点分析',
  '成功案例分享',
  '限时福利活动',
  '干货知识科普',
  '工具使用技巧'
]

// 产品类别
const PRODUCT_CATEGORIES = [
  '宠物用品',
  '家居收纳',
  '手机配件',
  '五金工具',
  '户外用品',
  '厨房用品',
  '美妆个护',
  '母婴用品',
  '汽车配件',
  '办公用品',
  '服装辅料',
  '电子数码',
  '自定义'
]

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

    // 小红书内容模板
    const xiaohongshuTemplates: Record<string, any> = {
      '产品测试案例': {
        title_options: [
          `亲测！AI 帮我写${category}英文文案，效果惊人`,
          `做了 5 年外贸，终于找到好用的 AI 文案工具`,
          `免费分享！AI 自动生成 Alibaba 商品文案`
        ],
        body: `姐妹们！发现一个超好用的 AI 外贸文案工具！\n\n我是做${productName}的，之前写英文描述真的头大，找翻译又贵又慢。\n\n现在用这个 AI 工具，30 秒就能生成专业英文文案，而且：\n\n✅ 不会乱写认证（CE、FDA 这些）\n✅ 不会乱写尺寸重量\n✅ 标题格式像 Alibaba 风格\n✅ 支持一键复制\n\n关键是完全免费！\n\n我已经用它生成了好几个产品的文案，直接就能用，省了好多时间。`,
        hashtags: ['#外贸工具', '#跨境电商', '#AI工具', '#阿里巴巴国际站', '#外贸人的一天'],
        comment_cta: '评论「外贸助手」，我发你免费测试入口'
      },
      '外贸文案避坑指南': {
        title_options: [
          `外贸文案避坑！这 5 个错误千万别犯`,
          `血泪教训！我踩过的外贸文案坑`,
          `新手必看！外贸英文文案常见错误`
        ],
        body: `做外贸的朋友注意了！\n\n写英文产品描述时，这几个坑千万别踩：\n\n❌ 乱写认证\n\n很多人为了显得专业，随便写 CE、FDA，结果被客户发现没有，直接丢单。\n\n❌ 乱写参数\n\n重量、尺寸、容量这些，没有确认就不要写，写错了更麻烦。\n\n❌ 标题太营销\n\nBest、Perfect、Guaranteed 这些词，B2B 平台不喜欢。\n\n✅ 正确做法：\n\n用 AI 工具生成，它会自动规避这些问题，只用你提供的信息。`,
        hashtags: ['#外贸避坑', '#外贸新手', '#阿里巴巴国际站', '#外贸文案', '#跨境电商'],
        comment_cta: '评论「避坑」，我发你外贸文案模板'
      },
      '免费内测邀请': {
        title_options: [
          `免费福利！AI 外贸文案工具找内测用户`,
          `限时免费！帮你写英文产品描述`,
          `找 10 个外贸朋友试用新工具`
        ],
        body: `外贸朋友们！\n\n我最近发现一个 AI 外贸文案生成工具，现在在找内测用户。\n\n功能：\n✅ 输入中文产品描述\n✅ 自动生成专业英文文案\n✅ 支持 Alibaba/Amazon 平台\n✅ 30 秒出结果\n\n现在完全免费，想找几个朋友试用，给点反馈。\n\n如果你需要写产品英文描述，评论区扣"试用"，我私信你入口。`,
        hashtags: ['#外贸工具', '#免费试用', '#AI外贸', '#内测邀请', '#跨境电商'],
        comment_cta: '评论「试用」，我私信你入口'
      },
      '用户反馈复盘': {
        title_options: [
          `用了 1 周 AI 外贸工具，说说真实感受`,
          `AI 外贸文案工具测评，优缺点都说`,
          `亲测！这个外贸工具到底好不好用`
        ],
        body: `之前分享了 AI 外贸文案工具，很多朋友试用了，今天做个复盘：\n\n👍 优点：\n- 生成速度快，30 秒左右\n- 不会乱写认证和参数\n- 标题格式专业\n- 完全免费\n\n👎 需要改进：\n- 有时候生成的内容需要微调\n- 复杂产品需要更多信息\n- 偶尔会有小错误\n\n总体来说，对于节省时间很有帮助，特别是需要批量生成文案的时候。`,
        hashtags: ['#工具测评', '#外贸工具', '#AI工具', '#真实反馈', '#外贸经验'],
        comment_cta: '评论「工具」，我发你试用链接'
      },
      '功能介绍': {
        title_options: [
          `外贸人必备！这个 AI 工具太好用了`,
          `30 秒生成专业英文文案，外贸人福音`,
          `AI 外贸文案工具，功能全解析`
        ],
        body: `今天详细介绍一下这个 AI 外贸文案工具的功能：\n\n📝 标题生成\n- B2B 平台标题（Alibaba/Global Sources）\n- 零售平台标题（Amazon/Shopify）\n\n📋 五点卖点\n- 自动生成 5 个核心卖点\n- 基于产品信息，不乱编\n\n📄 产品详情\n- Product Overview\n- Key Features\n- Applications\n\n🔍 SEO 关键词\n- 自动生成 8-10 个关键词\n\n📊 平台建议\n- 推荐适合的平台\n- 注意事项提醒`,
        hashtags: ['#外贸工具', '#功能介绍', '#AI外贸', '#产品文案', '#跨境电商'],
        comment_cta: '评论「功能」，我发你试用链接'
      },
      '对比 ChatGPT': {
        title_options: [
          `AI 外贸工具 vs ChatGPT，哪个更好用？`,
          `别再用 ChatGPT 写外贸文案了！`,
          `亲测对比！外贸文案生成谁更强`
        ],
        body: `很多人问我，为什么不直接用 ChatGPT 写外贸文案？\n\n今天做个对比：\n\n❌ ChatGPT 的问题：\n- 会乱写认证（CE、FDA）\n- 会乱写参数（尺寸、重量）\n- 标题格式不符合 B2B 平台\n- 需要复杂的 prompt\n\n✅ 专业外贸工具：\n- 不会乱写，只用你提供的信息\n- 标题专门针对 Alibaba 优化\n- 30 秒出结果\n- 完全免费\n\n结论：专业的事交给专业的工具。`,
        hashtags: ['#ChatGPT', '#AI对比', '#外贸工具', '#外贸文案', '#跨境电商'],
        comment_cta: '评论「对比」，我发你工具链接'
      },
      '新手入门教程': {
        title_options: [
          `外贸新手必看！英文文案怎么写`,
          `0 基础写外贸英文文案，看这篇就够了`,
          `外贸新手入门：产品描述写作指南`
        ],
        body: `外贸新手朋友们！\n\n写英文产品描述是不是很头疼？\n\n今天教大家一个简单方法：\n\n第一步：准备产品信息\n- 产品名称\n- 材质\n- 用途\n- 优势\n\n第二步：用 AI 工具生成\n- 把信息输入工具\n- 点击生成\n- 30 秒出结果\n\n第三步：复制使用\n- 直接复制到 Alibaba\n- 或者 Amazon\n\n就这么简单！`,
        hashtags: ['#外贸新手', '#入门教程', '#外贸文案', '#新手指南', '#跨境电商'],
        comment_cta: '评论「教程」，我发你工具和模板'
      },
      '行业痛点分析': {
        title_options: [
          `外贸人的痛，你中了几个？`,
          `做外贸最难的是什么？`,
          `外贸行业痛点，你感同身受吗`
        ],
        body: `做外贸的朋友，这些痛点你中了几个？\n\n😩 痛点 1：英文文案\n- 找翻译太贵\n- 自己写不专业\n- 用 ChatGPT 乱写\n\n😩 痛点 2：平台规则\n- Alibaba 标题有格式要求\n- Amazon 关键词很重要\n- 不同平台风格不同\n\n😩 痛点 3：时间成本\n- 一个产品文案要写半天\n- 批量上架更痛苦\n- 还要反复修改\n\n💡 解决方案：\n用 AI 工具，30 秒生成，直接用。`,
        hashtags: ['#外贸痛点', '#行业分析', '#外贸人', '#跨境电商', '#外贸经验'],
        comment_cta: '评论「痛点」，我发你解决方案'
      },
      '成功案例分享': {
        title_options: [
          `用 AI 工具后，我的询盘多了 30%`,
          `这个外贸工具帮我节省了 80% 时间`,
          `真实案例！AI 外贸工具效果惊人`
        ],
        body: `分享一个真实案例：\n\n我朋友做${category}的，之前上架一个产品要 2 小时。\n\n用了 AI 外贸文案工具后：\n\n📊 数据对比：\n- 之前：2 小时/产品\n- 现在：10 分钟/产品\n- 效率提升：90%\n\n📈 效果：\n- 询盘量增加 30%\n- 客户反馈更好\n- 上架速度更快\n\n他说这个工具是今年用过最值的。`,
        hashtags: ['#成功案例', '#外贸工具', '#效率提升', '#真实案例', '#跨境电商'],
        comment_cta: '评论「案例」，我发你工具链接'
      },
      '限时福利活动': {
        title_options: [
          `限时福利！免费 AI 外贸文案生成`,
          `最后 10 个名额！免费外贸工具`,
          `抓紧！外贸 AI 工具免费用`
        ],
        body: `外贸朋友们！\n\n限时福利来了！\n\n🎁 福利内容：\n- AI 外贸文案生成工具\n- 完全免费使用\n- 不限次数\n\n⏰ 活动时间：\n- 本周内有效\n- 名额有限\n\n📝 如何获取：\n- 评论区扣"福利"\n- 我私信你入口\n\n先到先得！`,
        hashtags: ['#限时福利', '#免费工具', '#外贸福利', '#AI外贸', '#跨境电商'],
        comment_cta: '评论「福利」，我私信你入口'
      },
      '干货知识科普': {
        title_options: [
          `干货！Alibaba 标题怎么写`,
          `外贸知识：产品描述写作技巧`,
          `科普：B2B 平台文案要点`
        ],
        body: `今天分享外贸文案干货：\n\n📝 Alibaba 标题写法：\n\n格式：产品类型 + 主要特点 + 材质 + 用途\n\n✅ 好标题：\n"Wholesale Silicone Pet Bowl - Collapsible - for Travel"\n\n❌ 坏标题：\n"Best Quality Pet Bowl Guaranteed"\n\n📋 五点卖点要点：\n1. 具体、可验证\n2. 基于产品信息\n3. 不夸大\n4. 突出优势\n5. 适合目标市场\n\n🔍 SEO 关键词：\n- 产品核心词\n- 材质词\n- 用途词\n- 目标市场词`,
        hashtags: ['#外贸干货', '#文案技巧', '#Alibaba', '#外贸知识', '#跨境电商'],
        comment_cta: '评论「干货」，我发你更多模板'
      },
      '工具使用技巧': {
        title_options: [
          `外贸工具使用技巧，你不知道的功能`,
          `这样用 AI 工具，效果翻倍`,
          `外贸老手都在用的工具技巧`
        ],
        body: `分享几个 AI 外贸工具的使用技巧：\n\n💡 技巧 1：信息越详细越好\n- 产品名称\n- 材质\n- 用途\n- 优势\n- 目标市场\n\n💡 技巧 2：利用高级选项\n- 填写规格尺寸\n- 填写包装方式\n- 填写是否支持定制\n\n💡 技巧 3：多次生成对比\n- 每次生成结果不同\n- 选择最好的版本\n\n💡 技巧 4：结合人工修改\n- AI 生成是基础\n- 根据实际情况微调`,
        hashtags: ['#工具技巧', '#使用教程', '#外贸工具', '#效率提升', '#跨境电商'],
        comment_cta: '评论「技巧」，我发你更多教程'
      }
    }

    // 抖音/视频号内容模板
    const videoTemplates: Record<string, any> = {
      '产品测试案例': {
        hook: `做${category}的注意了！这个 AI 工具 30 秒就能写出专业英文文案`,
        script: `【开头】\n做${category}的朋友，你还在为写英文产品描述发愁吗？\n\n【痛点】\n找翻译？贵！自己写？不专业！用 ChatGPT？它会乱写认证乱写参数！\n\n【解决方案】\n今天给大家分享一个专门做外贸文案的 AI 工具，它有三个特点：\n第一，不会乱写 CE、FDA 这些认证\n第二，不会乱写尺寸重量这些参数\n第三，标题格式专门针对 Alibaba 平台优化\n\n【演示】\n你看，我输入${category}的信息，30 秒就生成了完整的英文文案\n\n【结尾】\n关键是完全免费！评论区扣"外贸"，我免费帮你生成一版`,
        shot_list: ['展示产品输入界面', '点击生成按钮', '展示生成结果', '展示一键复制'],
        caption: `${category}外贸必备工具！AI 生成专业英文文案 #外贸 #AI工具 #跨境电商`,
        comment_cta: '评论「外贸」，我免费帮你生成'
      },
      '外贸文案避坑指南': {
        hook: `外贸人注意！这 5 个文案错误千万别犯`,
        script: `【开头】\n做外贸的朋友，你写的英文文案有没有这些问题？\n\n【痛点 1】\n第一个坑：乱写认证。很多人为了显得专业，随便写 CE、FDA，结果被客户发现没有，直接丢单。\n\n【痛点 2】\n第二个坑：乱写参数。重量、尺寸、容量这些，没有确认就不要写，写错了更麻烦。\n\n【痛点 3】\n第三个坑：标题太营销。Best、Perfect、Guaranteed 这些词，B2B 平台不喜欢。\n\n【解决方案】\n用 AI 工具生成，它会自动规避这些问题，只用你提供的信息。\n\n【结尾】\n评论区扣"避坑"，我发你外贸文案模板`,
        shot_list: ['展示错误文案案例', '展示正确文案案例', '展示 AI 工具界面', '展示生成结果'],
        caption: '外贸文案避坑指南！这 5 个错误千万别犯 #外贸避坑 #外贸新手 #跨境电商',
        comment_cta: '评论「避坑」，我发你外贸文案模板'
      },
      '免费内测邀请': {
        hook: `免费福利！找 10 个外贸朋友试用新工具`,
        script: `【开头】\n外贸朋友们！我有个免费福利要分享\n\n【介绍】\n我最近发现一个 AI 外贸文案生成工具，现在在找内测用户。\n\n【功能】\n它能做什么？\n输入中文产品描述，30 秒生成专业英文文案\n支持 Alibaba、Amazon 平台\n完全免费\n\n【邀请】\n现在想找几个朋友试用，给点反馈\n\n【结尾】\n如果你需要写产品英文描述，评论区扣"试用"，我私信你入口`,
        shot_list: ['展示工具功能', '展示生成结果', '展示免费信息', '引导评论'],
        caption: '免费福利！AI 外贸文案工具找内测用户 #外贸工具 #免费试用 #AI外贸',
        comment_cta: '评论「试用」，我私信你入口'
      },
      '用户反馈复盘': {
        hook: `用了 1 周 AI 外贸工具，说说真实感受`,
        script: `【开头】\n之前分享了 AI 外贸工具，很多朋友试用了，今天做个复盘\n\n【优点】\n先说优点：\n第一，生成速度快，30 秒左右\n第二，不会乱写认证和参数\n第三，标题格式专业\n第四，完全免费\n\n【缺点】\n再说需要改进的地方：\n有时候生成的内容需要微调\n复杂产品需要更多信息\n偶尔会有小错误\n\n【总结】\n总体来说，对于节省时间很有帮助\n\n【结尾】\n评论区扣"工具"，我发你试用链接`,
        shot_list: ['展示用户反馈', '展示优点', '展示缺点', '展示总结'],
        caption: 'AI 外贸工具真实测评，优缺点都说 #工具测评 #外贸工具 #AI工具',
        comment_cta: '评论「工具」，我发你试用链接'
      },
      '功能介绍': {
        hook: `30 秒生成专业英文文案，外贸人福音`,
        script: `【开头】\n今天详细介绍一下这个 AI 外贸文案工具\n\n【标题生成】\n第一个功能：标题生成\n支持 B2B 平台和零售平台\n标题格式专业\n\n【五点卖点】\n第二个功能：五点卖点\n自动生成 5 个核心卖点\n基于产品信息，不乱编\n\n【产品详情】\n第三个功能：产品详情\n包含 Product Overview\nKey Features\nApplications\n\n【SEO 关键词】\n第四个功能：SEO 关键词\n自动生成 8-10 个关键词\n\n【结尾】\n评论区扣"功能"，我发你试用链接`,
        shot_list: ['展示标题生成功能', '展示卖点生成功能', '展示详情生成功能', '展示关键词功能'],
        caption: 'AI 外贸文案工具功能全解析 #外贸工具 #功能介绍 #AI外贸',
        comment_cta: '评论「功能」，我发你试用链接'
      },
      '对比 ChatGPT': {
        hook: `别再用 ChatGPT 写外贸文案了！`,
        script: `【开头】\n很多人问我，为什么不直接用 ChatGPT 写外贸文案？\n\n【ChatGPT 问题】\n第一，会乱写认证，CE、FDA 随便写\n第二，会乱写参数，尺寸、重量随便编\n第三，标题格式不符合 B2B 平台\n第四，需要复杂的 prompt\n\n【专业工具】\n专业外贸工具就不一样：\n不会乱写，只用你提供的信息\n标题专门针对 Alibaba 优化\n30 秒出结果\n完全免费\n\n【结论】\n专业的事交给专业的工具\n\n【结尾】\n评论区扣"对比"，我发你工具链接`,
        shot_list: ['展示 ChatGPT 问题', '展示专业工具优势', '展示对比结果', '引导评论'],
        caption: 'AI 外贸工具 vs ChatGPT，哪个更好用？ #ChatGPT #AI对比 #外贸工具',
        comment_cta: '评论「对比」，我发你工具链接'
      },
      '新手入门教程': {
        hook: `外贸新手必看！英文文案怎么写`,
        script: `【开头】\n外贸新手朋友们！写英文产品描述是不是很头疼？\n\n【步骤 1】\n今天教大家一个简单方法\n第一步：准备产品信息\n产品名称、材质、用途、优势\n\n【步骤 2】\n第二步：用 AI 工具生成\n把信息输入工具\n点击生成\n30 秒出结果\n\n【步骤 3】\n第三步：复制使用\n直接复制到 Alibaba 或者 Amazon\n\n【总结】\n就这么简单！\n\n【结尾】\n评论区扣"教程"，我发你工具和模板`,
        shot_list: ['展示准备信息', '展示生成过程', '展示复制使用', '展示最终结果'],
        caption: '外贸新手入门：产品描述写作指南 #外贸新手 #入门教程 #外贸文案',
        comment_cta: '评论「教程」，我发你工具和模板'
      },
      '行业痛点分析': {
        hook: `外贸人的痛，你中了几个？`,
        script: `【开头】\n做外贸的朋友，这些痛点你中了几个？\n\n【痛点 1】\n第一个痛点：英文文案\n找翻译太贵\n自己写不专业\n用 ChatGPT 乱写\n\n【痛点 2】\n第二个痛点：平台规则\nAlibaba 标题有格式要求\nAmazon 关键词很重要\n不同平台风格不同\n\n【痛点 3】\n第三个痛点：时间成本\n一个产品文案要写半天\n批量上架更痛苦\n还要反复修改\n\n【解决方案】\n用 AI 工具，30 秒生成，直接用\n\n【结尾】\n评论区扣"痛点"，我发你解决方案`,
        shot_list: ['展示痛点 1', '展示痛点 2', '展示痛点 3', '展示解决方案'],
        caption: '外贸行业痛点，你感同身受吗？ #外贸痛点 #行业分析 #外贸人',
        comment_cta: '评论「痛点」，我发你解决方案'
      },
      '成功案例分享': {
        hook: `用 AI 工具后，我的询盘多了 30%`,
        script: `【开头】\n分享一个真实案例\n\n【背景】\n我朋友做${category}的，之前上架一个产品要 2 小时\n\n【使用后】\n用了 AI 外贸文案工具后\n之前：2 小时/产品\n现在：10 分钟/产品\n效率提升：90%\n\n【效果】\n询盘量增加 30%\n客户反馈更好\n上架速度更快\n\n【总结】\n他说这个工具是今年用过最值的\n\n【结尾】\n评论区扣"案例"，我发你工具链接`,
        shot_list: ['展示背景', '展示数据对比', '展示效果', '引导评论'],
        caption: '真实案例！AI 外贸工具效果惊人 #成功案例 #外贸工具 #效率提升',
        comment_cta: '评论「案例」，我发你工具链接'
      },
      '限时福利活动': {
        hook: `限时福利！免费 AI 外贸文案生成`,
        script: `【开头】\n外贸朋友们！限时福利来了！\n\n【福利内容】\n福利内容：\nAI 外贸文案生成工具\n完全免费使用\n不限次数\n\n【活动时间】\n活动时间：\n本周内有效\n名额有限\n\n【如何获取】\n如何获取：\n评论区扣"福利"\n我私信你入口\n\n【结尾】\n先到先得！`,
        shot_list: ['展示福利内容', '展示活动时间', '展示获取方式', '引导评论'],
        caption: '限时福利！免费 AI 外贸文案生成 #限时福利 #免费工具 #外贸福利',
        comment_cta: '评论「福利」，我私信你入口'
      },
      '干货知识科普': {
        hook: `干货！Alibaba 标题怎么写`,
        script: `【开头】\n今天分享外贸文案干货\n\n【标题写法】\nAlibaba 标题写法：\n格式：产品类型 + 主要特点 + 材质 + 用途\n\n好标题：\n"Wholesale Silicone Pet Bowl - Collapsible - for Travel"\n\n坏标题：\n"Best Quality Pet Bowl Guaranteed"\n\n【五点卖点】\n五点卖点要点：\n具体、可验证\n基于产品信息\n不夸大\n突出优势\n适合目标市场\n\n【SEO 关键词】\nSEO 关键词：\n产品核心词\n材质词\n用途词\n目标市场词\n\n【结尾】\n评论区扣"干货"，我发你更多模板`,
        shot_list: ['展示标题写法', '展示卖点要点', '展示关键词要点', '引导评论'],
        caption: '干货！Alibaba 标题怎么写 #外贸干货 #文案技巧 #Alibaba',
        comment_cta: '评论「干货」，我发你更多模板'
      },
      '工具使用技巧': {
        hook: `这样用 AI 工具，效果翻倍`,
        script: `【开头】\n分享几个 AI 外贸工具的使用技巧\n\n【技巧 1】\n技巧 1：信息越详细越好\n产品名称、材质、用途、优势、目标市场\n\n【技巧 2】\n技巧 2：利用高级选项\n填写规格尺寸\n填写包装方式\n填写是否支持定制\n\n【技巧 3】\n技巧 3：多次生成对比\n每次生成结果不同\n选择最好的版本\n\n【技巧 4】\n技巧 4：结合人工修改\nAI 生成是基础\n根据实际情况微调\n\n【结尾】\n评论区扣"技巧"，我发你更多教程`,
        shot_list: ['展示技巧 1', '展示技巧 2', '展示技巧 3', '展示技巧 4'],
        caption: '外贸工具使用技巧，你不知道的功能 #工具技巧 #使用教程 #外贸工具',
        comment_cta: '评论「技巧」，我发你更多教程'
      }
    }

    // 微信/朋友圈内容模板
    const wechatTemplates: Record<string, any> = {
      '产品测试案例': {
        message: `分享一个自用的 AI 外贸文案生成工具，效果不错：\n\n1. 输入中文产品描述\n2. 30 秒生成专业英文文案\n3. 支持 Alibaba/Amazon 平台\n4. 完全免费\n\n我用它生成了几个${category}的文案，直接就能用。`,
        soft_cta: '有需要的可以发我一个产品，我免费帮你生成一版'
      },
      '外贸文案避坑指南': {
        message: `外贸文案避坑！\n\n写英文产品描述时，这几个坑千万别踩：\n\n❌ 乱写认证（CE、FDA）\n❌ 乱写参数（尺寸、重量）\n❌ 标题太营销\n\n正确做法：用 AI 工具生成，它会自动规避这些问题。`,
        soft_cta: '需要外贸文案模板的可以找我'
      },
      '免费内测邀请': {
        message: `找几个外贸朋友试用新工具：\n\n功能：输入中文产品描述，30 秒生成专业英文文案\n平台：支持 Alibaba/Amazon\n费用：完全免费\n\n想找几个人试用，给点反馈。`,
        soft_cta: '有兴趣的可以私信我'
      },
      '用户反馈复盘': {
        message: `AI 外贸工具用了 1 周，说说感受：\n\n👍 优点：\n- 生成速度快\n- 不会乱写认证\n- 标题格式专业\n- 免费\n\n👎 需要改进：\n- 偶尔需要微调\n- 复杂产品需要更多信息\n\n总体来说，省时间。`,
        soft_cta: '需要工具链接的可以找我'
      },
      '功能介绍': {
        message: `介绍一个 AI 外贸文案工具的功能：\n\n✅ 标题生成（B2B + 零售）\n✅ 五点卖点\n✅ 产品详情\n✅ SEO 关键词\n✅ 平台建议\n\n30 秒出结果，完全免费。`,
        soft_cta: '有需要的可以发我产品信息，我帮你生成'
      },
      '对比 ChatGPT': {
        message: `为什么不直接用 ChatGPT 写外贸文案？\n\n❌ ChatGPT 问题：\n- 会乱写认证\n- 会乱写参数\n- 标题格式不对\n\n✅ 专业工具：\n- 不会乱写\n- 标题针对 Alibaba 优化\n- 30 秒出结果\n\n专业的事交给专业的工具。`,
        soft_cta: '需要工具链接的可以找我'
      },
      '新手入门教程': {
        message: `外贸新手入门：英文文案怎么写\n\n第一步：准备产品信息\n第二步：用 AI 工具生成\n第三步：复制使用\n\n就这么简单！`,
        soft_cta: '需要工具和模板的可以找我'
      },
      '行业痛点分析': {
        message: `外贸人的痛：\n\n1. 英文文案：找翻译贵，自己写不专业\n2. 平台规则：不同平台格式不同\n3. 时间成本：一个产品文案要写半天\n\n解决方案：用 AI 工具，30 秒生成。`,
        soft_cta: '需要解决方案的可以找我'
      },
      '成功案例分享': {
        message: `分享一个案例：\n\n朋友做${category}的，之前上架一个产品要 2 小时。\n\n用了 AI 工具后：10 分钟/产品\n效率提升：90%\n询盘量增加：30%\n\n他说这个工具是今年用过最值的。`,
        soft_cta: '需要工具链接的可以找我'
      },
      '限时福利活动': {
        message: `限时福利！\n\nAI 外贸文案生成工具\n完全免费使用\n不限次数\n\n本周内有效，名额有限。\n\n需要的可以私信我。`,
        soft_cta: '先到先得！'
      },
      '干货知识科普': {
        message: `外贸文案干货：\n\n📝 Alibaba 标题写法：\n产品类型 + 主要特点 + 材质 + 用途\n\n📋 五点卖点要点：\n具体、可验证、不夸大\n\n🔍 SEO 关键词：\n产品核心词 + 材质词 + 用途词`,
        soft_cta: '需要更多模板的可以找我'
      },
      '工具使用技巧': {
        message: `AI 外贸工具使用技巧：\n\n💡 信息越详细越好\n💡 利用高级选项\n💡 多次生成对比\n💡 结合人工修改\n\n掌握这些技巧，效果翻倍。`,
        soft_cta: '需要更多教程的可以找我'
      }
    }

    // LinkedIn 内容模板
    const linkedinTemplates: Record<string, any> = {
      '产品测试案例': {
        post: `I've been testing an AI tool for generating product descriptions for international trade platforms like Alibaba and Amazon.\n\nHere's what I found:\n\n✅ It doesn't fabricate certifications (CE, FDA, etc.)\n✅ It doesn't invent dimensions or weight\n✅ Titles are optimized for B2B platforms\n✅ It's completely free to use\n\nIf you need English product copy for your business, I'd be happy to help generate a sample for free.\n\nJust send me your product details and I'll create a professional listing for you.\n\n#InternationalTrade #B2B #AI #ProductDescription #Alibaba`,
        dm_template: `Hi [Name],\n\nI noticed you're in the [product] business. I've been using an AI tool to generate product descriptions for platforms like Alibaba and Amazon.\n\nWould you be interested in a free sample? Just send me your product details and I'll create a professional English listing for you.\n\nNo strings attached - just looking for feedback on the tool.`
      },
      '外贸文案避坑指南': {
        post: `5 Common Mistakes in B2B Product Descriptions (And How to Avoid Them)\n\n1. Fabricating certifications\nDon't claim CE, FDA, or other certifications unless you actually have them.\n\n2. Inventing parameters\nNever make up dimensions, weight, or capacity. If you don't have exact specs, use general terms.\n\n3. Overly promotional language\nAvoid words like "best", "perfect", "guaranteed" in B2B contexts.\n\n4. Ignoring platform requirements\nAlibaba titles have specific format requirements. Amazon needs SEO keywords.\n\n5. Not providing enough details\nThe more information you provide, the better the AI can generate accurate descriptions.\n\n#B2B #ProductDescription #InternationalTrade #Alibaba #Amazon`,
        dm_template: `Hi [Name],\n\nI noticed you're selling products internationally. I wanted to share some tips on writing effective B2B product descriptions.\n\nWould you be interested in a free AI-generated sample for your products? I'd be happy to help.\n\nBest regards`
      },
      '免费内测邀请': {
        post: `Looking for beta testers!\n\nI've been using an AI tool that generates professional product descriptions for B2B platforms like Alibaba and Amazon.\n\nKey features:\n- No fabricated certifications or parameters\n- Optimized for B2B platforms\n- 30-second generation\n- Completely free\n\nIf you're in international trade and need English product copy, I'd love to get your feedback.\n\nJust send me your product details and I'll generate a professional listing for you.\n\n#BetaTesting #B2B #AI #InternationalTrade #Free`,
        dm_template: `Hi [Name],\n\nI'm looking for beta testers for an AI product description tool. Would you be interested in trying it out for free?\n\nJust send me your product details and I'll generate a professional English listing for you.\n\nLooking forward to your feedback!`
      },
      '用户反馈复盘': {
        post: `After 1 week of using an AI tool for product descriptions, here's my honest review:\n\nPros:\n✅ Fast generation (30 seconds)\n✅ No fabricated certifications\n✅ Professional B2B format\n✅ Free to use\n\nCons:\n⚠️ Sometimes needs minor adjustments\n⚠️ Complex products need more details\n⚠️ Occasional small errors\n\nOverall: Great time-saver for generating product listings.\n\n#ToolReview #B2B #AI #ProductDescription #InternationalTrade`,
        dm_template: `Hi [Name],\n\nI've been testing an AI tool for product descriptions. Would you like to try it out?\n\nI can generate a free sample for your products. Just send me the details.\n\nBest regards`
      },
      '功能介绍': {
        post: `Introducing an AI tool for B2B product descriptions:\n\nFeatures:\n📝 Title generation (B2B + Retail)\n📋 5 bullet points\n📄 Product overview, features, applications\n🔍 8-10 SEO keywords\n📊 Platform recommendations\n\nThe tool ensures:\n- No fabricated certifications\n- No invented parameters\n- Professional B2B format\n\n30-second generation, completely free.\n\n#B2B #ProductDescription #AI #InternationalTrade #Alibaba`,
        dm_template: `Hi [Name],\n\nI'd like to introduce you to an AI tool that generates professional product descriptions for B2B platforms.\n\nWould you be interested in a free sample? Just send me your product details.\n\nBest regards`
      },
      '对比 ChatGPT': {
        post: `AI Tool vs ChatGPT for B2B Product Descriptions:\n\n❌ ChatGPT issues:\n- Fabricates certifications\n- Invent parameters\n- Wrong title format for B2B\n- Needs complex prompts\n\n✅ Specialized tool:\n- Only uses provided information\n- Alibaba-optimized titles\n- 30-second generation\n- Free to use\n\nFor B2B product descriptions, use specialized tools.\n\n#ChatGPT #AI #B2B #ProductDescription #Comparison`,
        dm_template: `Hi [Name],\n\nI noticed you're using AI for product descriptions. Have you tried specialized B2B tools?\n\nThey're often better than ChatGPT for international trade platforms.\n\nWould you like to try a free sample?\n\nBest regards`
      },
      '新手入门教程': {
        post: `Beginner's Guide to B2B Product Descriptions:\n\nStep 1: Prepare product information\n- Product name\n- Material\n- Usage\n- Advantages\n\nStep 2: Use AI tool\n- Input information\n- Click generate\n- Get results in 30 seconds\n\nStep 3: Copy and use\n- Copy to Alibaba\n- Or Amazon\n\nIt's that simple!\n\n#BeginnerGuide #B2B #ProductDescription #InternationalTrade #Tutorial`,
        dm_template: `Hi [Name],\n\nI noticed you're new to international trade. I'd be happy to help you create professional product descriptions.\n\nWould you like a free AI-generated sample for your products?\n\nBest regards`
      },
      '行业痛点分析': {
        post: `Common Pain Points in International Trade:\n\n😩 Product descriptions\n- Expensive translators\n- Unprofessional self-writing\n- AI tools fabricate information\n\n😩 Platform rules\n- Alibaba has specific format\n- Amazon needs SEO keywords\n- Different platforms, different styles\n\n😩 Time costs\n- 2 hours per product\n- Batch uploads are painful\n- Constant revisions\n\nSolution: AI tool generates in 30 seconds.\n\n#PainPoints #B2B #InternationalTrade #Solutions #AI`,
        dm_template: `Hi [Name],\n\nI understand the challenges of writing product descriptions for international trade.\n\nI've been using an AI tool that helps solve this problem. Would you like to try it?\n\nBest regards`
      },
      '成功案例分享': {
        post: `Success Story: How AI Improved Our Product Listings\n\nBefore:\n- 2 hours per product\n- Expensive translations\n- Inconsistent quality\n\nAfter using AI tool:\n- 10 minutes per product\n- 90% time saved\n- 30% more inquiries\n- Consistent quality\n\nThe tool is free and easy to use.\n\n#SuccessStory #B2B #AI #ProductDescription #Efficiency`,
        dm_template: `Hi [Name],\n\nI'd like to share a success story about using AI for product descriptions.\n\nWould you be interested in trying it for your products? I can generate a free sample.\n\nBest regards`
      },
      '限时福利活动': {
        post: `Limited Time Offer!\n\nFree AI tool for B2B product descriptions:\n- Professional format\n- No fabricated information\n- 30-second generation\n- Unlimited use\n\nValid this week only.\n\nSend me your product details for a free sample.\n\n#LimitedOffer #Free #B2B #AI #ProductDescription`,
        dm_template: `Hi [Name],\n\nI have a limited-time offer for you: free AI-generated product descriptions.\n\nWould you like to try it? Just send me your product details.\n\nBest regards`
      },
      '干货知识科普': {
        post: `B2B Product Description Tips:\n\n📝 Alibaba Title Format:\nProduct Type + Key Feature + Material + Usage\n\n✅ Good: "Wholesale Silicone Pet Bowl - Collapsible - for Travel"\n❌ Bad: "Best Quality Pet Bowl Guaranteed"\n\n📋 Bullet Points:\n- Specific and verifiable\n- Based on product information\n- No exaggeration\n\n🔍 SEO Keywords:\n- Product core terms\n- Material terms\n- Usage terms\n- Target market terms\n\n#Tips #B2B #ProductDescription #Alibaba #Knowledge`,
        dm_template: `Hi [Name],\n\nI wanted to share some tips on writing effective B2B product descriptions.\n\nWould you like me to generate a free sample for your products?\n\nBest regards`
      },
      '工具使用技巧': {
        post: `Tips for Using AI Product Description Tools:\n\n💡 Be detailed with product information\n💡 Use advanced options\n💡 Generate multiple versions\n💡 Combine with manual adjustments\n\nThe more information you provide, the better the results.\n\n#Tips #AI #B2B #ProductDescription #BestPractices`,
        dm_template: `Hi [Name],\n\nI'd like to share some tips on using AI for product descriptions.\n\nWould you like to try it for your products? I can generate a free sample.\n\nBest regards`
      }
    }

    // 根据渠道返回对应内容
    if (channel === '小红书') {
      return xiaohongshuTemplates[type] || xiaohongshuTemplates['产品测试案例']
    }

    if (channel === '抖音' || channel === '视频号') {
      return videoTemplates[type] || videoTemplates['产品测试案例']
    }

    if (channel === '微信群' || channel === '朋友圈') {
      return wechatTemplates[type] || wechatTemplates['产品测试案例']
    }

    if (channel === 'LinkedIn') {
      return linkedinTemplates[type] || linkedinTemplates['产品测试案例']
    }

    return { message: '请选择渠道和内容类型' }
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

// 推广工作台类型定义

// 今日任务
export interface DailyTask {
  id: string
  title: string
  completed: boolean
}

// 线索状态
export type LeadStatus = '未联系' | '已私信' | '已回复' | '已发产品' | '已试用' | '有兴趣' | '无兴趣'

// 线索记录
export interface Lead {
  id: string
  date: string
  channel: string
  nickname: string
  contact: string
  productCategory: string
  status: LeadStatus
  notes: string
  nextFollowDate: string
}

// 内容生成请求
export interface ContentRequest {
  channel: string
  contentType: string
  productCategory: string
  productInfo: string
}

// 小红书内容
export interface XiaohongshuContent {
  title_options: string[]
  body: string
  hashtags: string[]
  comment_cta: string
}

// 抖音内容
export interface DouyinContent {
  hook: string
  script: string
  shot_list: string[]
  caption: string
  comment_cta: string
}

// 微信内容
export interface WechatContent {
  message: string
  soft_cta: string
}

// LinkedIn 内容
export interface LinkedInContent {
  post: string
  dm_template: string
}

// 生成的内容
export type GeneratedContent = XiaohongshuContent | DouyinContent | WechatContent | LinkedInContent

// 测试案例请求
export interface TestCaseRequest {
  productInfo: string
  generatedResult: string
  score: number
  issues: string
}

// 测试案例内容
export interface TestCaseContent {
  xiaohongshu: string
 朋友圈: string
  shortVideo: string
}

// 渠道统计
export interface ChannelStats {
  channel: string
  total: number
  contacted: number
  replied: number
  tried: number
  interested: number
  replyRate: number
  trialRate: number
  interestRate: number
}

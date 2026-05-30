// 产品表单数据
export interface ProductFormData {
  productName: string
  material: string
  usage: string
  targetMarket: string
  advantages: string
  tone: string
  // 高级信息
  specifications: string
  capacity: string
  customLogo: string
  packaging: string
  moq: string
  leadTime: string
  certifications: string
  targetPlatform: string
}

// 生成结果 - 新结构化格式
export interface GeneratedContent {
  titles: {
    b2b_title: string
    retail_title: string
  }
  bullet_points: string[]
  description: {
    product_overview: string
    key_features: string[]
    applications: string
    customization: string
    packaging_wholesale_notes: string
  }
  seo_keywords: string[]
  platform_suggestion: {
    recommended_platforms: string[]
    reasons: string[]
    notices: string[]
  }
  missing_info: {
    completeness_score: number
    specification: string[]
    trade: string[]
    certification: string[]
    packaging: string[]
    customization: string[]
  }
  // 兼容旧格式
  title?: string
  description_legacy?: string
  platform_suggestion_legacy?: string
}

// 解析结果
export interface ParsedProductData {
  productName: string
  material: string
  usage: string
  targetMarket: string
  advantages: string
}

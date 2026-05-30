# 外贸助手

AI 外贸助手 MVP，基于 Next.js App Router + TypeScript + Tailwind CSS + DeepSeek API。

## 功能

- **专业首页**：
  - Hero 区域突出核心价值：30 秒生成专业外贸英文商品文案
  - 顶部导航：功能、示例、价格、开始使用
  - 功能卡片展示核心能力
  - 实际示例展示生成效果
  - 免费内测标签
  - 当前免费试用价格展示
- **商品文案生成**：
  - 英文商品标题、五点卖点、详情页、SEO 关键词
  - 快速粘贴产品资料：AI 自动提取填写表单
  - 高级信息折叠区域：规格尺寸、容量重量、定制 Logo、包装方式、MOQ、交期、认证、目标平台
  - 资料完整度显示
  - 一键复制结果
  - 移动端适配
- **结构化输出**：
  - 双版本标题：B2B 平台标题 + 零售平台标题
  - 结构化产品详情：Product Overview、Key Features、Applications、Customization、Packaging & Wholesale Notes
  - 结构化平台建议：推荐平台、推荐原因、注意事项
  - 结构化缺失信息：规格参数、贸易信息、认证信息、包装信息、定制信息
  - 信息完整度评分（0-100%）
  - 快捷操作按钮：重新生成、更专业、更简洁、Alibaba 风格、Amazon 风格
  - 复制按钮带文字说明
- **专业 B2B 文案优化**：
  - 标题符合 Alibaba.com / Global Sources 格式
  - 卖点具体、可验证
  - 详情页适合外贸采购商阅读
  - SEO 关键词包含产品核心词、材质词、用途词、目标市场词
  - 避免夸张词汇（best、perfect、guaranteed、100%）
- **智能信息管理**：
  - AI 只使用用户明确提供的信息
  - 不会编造认证（如 CE、FDA、RoHS、LFGB、BPA Free）
  - 不会编造具体参数（如重量、尺寸、容量、材质比例）
  - 使用保守表达（如 "lightweight design" 代替具体重量）
  - 生成结果包含"建议补充信息"，提示用户提供更多细节

## 技术栈

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- DeepSeek API

## 快速开始

1. 克隆项目
2. 安装依赖：
   ```bash
   npm install
   ```
3. 配置环境变量：
   ```bash
   cp .env.example .env.local
   ```
   编辑 `.env.local`，填入你的 DeepSeek API Key。

4. 启动开发服务器：
   ```bash
   npm run dev
   ```
   访问 http://localhost:3005

5. 构建生产版本：
   ```bash
   npm run build
   npm start
   ```
   访问 http://localhost:3005

## 项目结构

```
├── app/
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页
│   └── tools/
│       └── product-copy/
│           └── page.tsx    # 商品文案生成页
│   └── api/
│       ├── generate/
│       │   └── route.ts   # 文案生成 API
│       └── parse/
│           └── route.ts   # 智能解析 API
├── types/
│   └── index.ts           # TypeScript 类型定义
├── .env.example           # 环境变量示例
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 环境变量

- `DEEPSEEK_API_KEY`: DeepSeek API 密钥

## 许可证

MIT
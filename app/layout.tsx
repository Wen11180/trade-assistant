import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: '外贸助手 - AI 商品文案生成',
    template: '%s | 外贸助手',
  },
  description: '使用 AI 技术快速生成专业的外贸商品英文文案，支持 Alibaba.com、Amazon、Shopify 等平台',
  keywords: ['外贸', 'AI', '文案生成', '商品描述', '英文文案', 'B2B', '跨境电商'],
  authors: [{ name: '外贸助手' }],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    title: '外贸助手 - AI 商品文案生成',
    description: '使用 AI 技术快速生成专业的外贸商品英文文案',
    siteName: '外贸助手',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={inter.className}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* 背景装饰光斑 */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>

      {/* 顶部导航 */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 左侧 Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI 外贸助手
              </span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                免费内测
              </span>
            </div>

            {/* 右侧导航 */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">功能</a>
              <a href="#example" className="text-gray-600 hover:text-gray-900 transition-colors">示例</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">价格</a>
              <Link
                href="/tools/product-copy"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                开始使用
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero 区域 */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center relative z-10">
          {/* 标签 */}
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI 驱动 · 专业外贸文案
          </div>

          {/* 主标题 */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              30 秒生成专业外贸
            </span>
            <br />
            <span className="text-gray-900">英文商品文案</span>
          </h1>

          {/* 副标题 */}
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            输入中文产品信息，自动生成英文标题、五点卖点、产品详情页和 SEO 关键词，
            <br className="hidden md:block" />
            适合商品上架、询盘回复和平台运营使用。
          </p>

          {/* CTA 按钮 */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link
              href="/tools/product-copy"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              立即生成英文文案
            </Link>
            <a
              href="#example"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-gray-300 transform hover:-translate-y-1 transition-all duration-300"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              查看生成示例
            </a>
          </div>

          {/* 支持的平台 */}
          <div className="flex flex-wrap justify-center gap-3">
            {['Alibaba.com', 'Global Sources', 'Made-in-China', 'Amazon', 'Shopify'].map((platform) => (
              <span
                key={platform}
                className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm text-gray-600 border border-gray-200 shadow-sm"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 功能卡片区域 */}
      <section id="features" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">核心功能</h2>
          <p className="text-lg text-gray-600">简单三步，生成专业外贸文案</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* 功能卡片 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">中文输入</h3>
            <p className="text-gray-600 text-center leading-relaxed">
              粘贴中文产品信息，AI 自动整理材质、用途、卖点和目标市场
            </p>
          </div>

          {/* 功能卡片 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">英文上架文案</h3>
            <p className="text-gray-600 text-center leading-relaxed">
              生成商品标题、五点卖点、详情页、SEO 关键词
            </p>
          </div>

          {/* 功能卡片 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">适配外贸平台</h3>
            <p className="text-gray-600 text-center leading-relaxed">
              支持 Alibaba、Global Sources、Made-in-China、Amazon、Shopify
            </p>
          </div>
        </div>
      </section>

      {/* 示例展示区 */}
      <section id="example" className="relative bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">看看实际效果</h2>
            <p className="text-lg text-gray-600">输入中文产品信息，即可生成专业的英文商品文案</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* 左侧：中文输入 */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">中文输入</h3>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <p className="text-gray-800 leading-relaxed">
                  可折叠宠物碗，食品级硅胶，适合户外遛狗、旅行、露营，轻便可折叠，支持定制 Logo。
                </p>
              </div>
            </div>

            {/* 右侧：英文生成结果 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">英文生成结果</h3>
              </div>
              <div className="space-y-6">
                {/* 标题 */}
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">商品标题</p>
                  <p className="text-gray-800 font-medium text-base md:text-lg leading-relaxed">Wholesale Collapsible Silicone Pet Bowl Portable Foldable Dog Water Bowl for Travel Camping Outdoor Feeding</p>
                </div>
                {/* 卖点 */}
                <div>
                  <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-3">五点卖点</p>
                  <ul className="space-y-3">
                    <li className="text-gray-700 text-sm md:text-base flex items-start leading-relaxed">
                      <span className="w-5 h-5 bg-green-200 text-green-800 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">1</span>
                      Made from food-grade silicone suitable for pet food and water.
                    </li>
                    <li className="text-gray-700 text-sm md:text-base flex items-start leading-relaxed">
                      <span className="w-5 h-5 bg-green-200 text-green-800 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">2</span>
                      Collapsible design helps save space during travel and outdoor use.
                    </li>
                    <li className="text-gray-700 text-sm md:text-base flex items-start leading-relaxed">
                      <span className="w-5 h-5 bg-green-200 text-green-800 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">3</span>
                      Lightweight structure is convenient for walking, camping, and hiking.
                    </li>
                    <li className="text-gray-700 text-sm md:text-base flex items-start leading-relaxed">
                      <span className="w-5 h-5 bg-green-200 text-green-800 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">4</span>
                      Easy-to-clean silicone surface supports repeated daily use.
                    </li>
                    <li className="text-gray-700 text-sm md:text-base flex items-start leading-relaxed">
                      <span className="w-5 h-5 bg-green-200 text-green-800 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">5</span>
                      Custom logo options are available for brands, retailers, and wholesalers.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 示例按钮 */}
          <div className="text-center mt-12">
            <Link
              href="/tools/product-copy"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              用这个示例试试
            </Link>
          </div>
        </div>
      </section>

      {/* 价格区域 */}
      <section id="pricing" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">当前免费试用</h2>
          <p className="text-lg text-gray-600 mb-12">MVP 内测阶段，开放免费体验</p>
          <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <div className="text-center">
              <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                内测版
              </div>
              <div className="text-5xl font-bold text-blue-600 mb-2">¥0</div>
              <p className="text-gray-600 mb-6">限时免费体验</p>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  商品英文文案生成
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  SEO 关键词生成
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  平台适配建议
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  一键复制结果
                </li>
              </ul>
              <Link
                href="/tools/product-copy"
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                开始免费试用
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>AI 外贸助手 - 让外贸英文文案生成更快、更专业</p>
        </div>
      </footer>
    </main>
  )
}
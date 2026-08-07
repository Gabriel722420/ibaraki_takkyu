const SECTIONS: { title: string; placeholder: string }[] = [
  {
    title: '会長挨拶',
    placeholder: '準備中（連盟提供の素材を反映予定）',
  },
  {
    title: '組織・役員',
    placeholder: '準備中（連盟提供の素材を反映予定）',
  },
  {
    title: '沿革',
    placeholder: '準備中（連盟提供の素材を反映予定）',
  },
  {
    title: '規約・ダウンロード',
    placeholder: '準備中（連盟提供の素材を反映予定）',
  },
]

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 border-l-4 border-primary pl-2 text-2xl font-bold">
        連盟情報
      </h1>

      {SECTIONS.map((s) => (
        <section key={s.title} className="mb-8">
          <h2 className="mb-2 text-xl font-bold">{s.title}</h2>
          <p className="leading-relaxed text-gray-600">{s.placeholder}</p>
        </section>
      ))}

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-bold">連絡先</h2>
        {/* TODO: 連絡先はここに追記できます（フッターと同様、後から反映）
            <address className="not-italic leading-relaxed text-gray-800">
              一般社団法人茨城県卓球連盟<br />
              〒310-0000 茨城県水戸市○○ ○-○-○<br />
              TEL: 000-000-0000 ／ Email: info@example.jp
            </address>
        */}
        <p className="leading-relaxed text-gray-600">
          準備中（連盟提供の素材を反映予定）
        </p>
      </section>
    </main>
  )
}

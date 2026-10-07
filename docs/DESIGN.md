# DESIGN.md — 公開側デザインシステム（茨城県卓球連盟）

> 由来: refero.design の **Airbnb** スタイルをベースに、ブランド値へ全面置換。
> Airbnb の規律（モノクロ + 1アクセント・値差分離・tracking・影の節制）を踏襲し、
> 色は #0049a2、フォントはオープンフォント（Noto Sans JP / Inter）へ翻訳。
> **矛盾が出たら本 Tokens セクションを正とする**（Agent Prompt 側ではなく）。
> 適用範囲は **公開側のみ**（`app/(public)/*` と SiteHeader/Footer/Nav）。管理画面(shadcn)は不可侵。

---

## Tokens（正）

### Colors — モノクロ + #0049a2 の1アクセントのみ（他の色相を足さない）
| 役割 | 値 | 用途 |
|---|---|---|
| accent | `#0049a2` | 主アクセント。リンク/現在地/塗りバッジ/強調。これ以外の色相は使わない |
| accent-hover | `#003a82` | アクセントの濃色（ホバー/押下） |
| text | `#222222` | 本文・見出し既定色 |
| muted | `#6a6a6a` | 補助テキスト（日付・メタ・説明） |
| disabled | `#c1c1c1` | 無効・最弱 |
| hairline | `#ebebeb` | 境界線（カード枠・区切り） |
| muted-surface | `#dddddd` | 中立の面（neutralバッジ等） |
| canvas | `#f7f7f7` | ページ背景（オフ白） |
| card | `#ffffff` | カード面（純白） |

> **分離は影でなく値差で作る**：canvas(#f7f7f7) と card(#fff) の差 + hairline。
> 影は overlay / dropdown / sheet 等「浮く要素」のみ。カードに線+影の両掛けは禁止。

### Typography — Airbnb比率を維持、サイズは高齢者UDへ引き上げ
- 和文 **Noto Sans JP** / 欧文・数字 **Inter**（両方オープン・next/font でセルフホスト）。weight 400/500/600/700。
- すべて rem 基準（html 17px + 文字サイズ切替に追従）。下表の px は base=17px 時の目安。

| 役割 | size | weight | tracking | 備考 |
|---|---|---|---|---|
| body | 17px (1rem) | 400 | — | **17px 死守**。これより小さくしない |
| ui | 18px | 500 | — | ナビ/ボタン/リンク |
| subheading | 22px | 600 | — | セクション小見出し |
| heading-sm | 24px | 500 | -0.02em | ページ見出し（詳細/一覧） |
| heading | 30px | 700 | -0.02em | ヒーロー大見出し |

- **太字700は大見出しのみ**。本文・メタ・カードタイトルに 700 を使わない（500/600で階層を作る）。

### Spacing / Shape
- base 4px。element-gap 12px。card-padding 16px（最小12px）。section-gap 48px（縦 `py-12 md:py-16`）。
- radius: **cards `rounded-xl`(12px) / inputs・buttons `rounded-lg`(8px) / pill(バッジ・チップ) `rounded-full`**。角丸をバラつかせない。
- 幅: 一覧/TOP は `max-w-6xl`、長文（本文・挨拶・ポリシー）は `max-w-3xl`〜`max-w-prose` で可読幅を保つ。

---

## States（破綻ゼロの要件）

- **hover（カード/リンク）**: hairline → `border-primary/40` + `bg-primary/[0.03]`、chevron は `translate-x-0.5`。**影は足さない**。150–200ms・`transition-colors`中心。
- **focus-visible**: `.site` 配下の a / button に `outline: 2px solid #0049a2; outline-offset: 2px`。キーボード可視を全要素で担保。
- **active**: `bg-primary/5`（タップ即応）。タップ領域は最小 44px。
- **empty**: 破線 hairline の枠 + muted テキスト（`EmptyCard`）。中央寄せ・余白確保でスカスカに見せない。
- **disabled**: `text-[#c1c1c1]`、ボーダー hairline、hover無効。

---

## Components

- **Header**: #0049a2 帯（ロゴ枠=白地カード + BrandMark）+ 文字サイズ切替（白地）。下に白ナビ（現在地=`bg-primary/10` + 下線 border-primary + 太字 primary）。影でなく hairline で区切る。
- **Hero（TOP）**: 卓球マクロ写真（人物なし・AI生成しない・CC0 を public/ に配置）を `#0049a2` オーバーレイで敷く設計。**画像未配置のため、差し替え1箇所（`<img>` のコメント解除）で有効化**できる構造。既定は solid #0049a2 + 微グラデ + BrandMark のプレースホルダ。
- **Card**: `bg-card border border-hairline rounded-xl p-4`。影なし。見出し 500/600、メタ muted。
- **Badge/Chip**: pill。状態は **mono+accent** で表現（下記）。
- **StatusBadge（大会状態）**:
  - 予定(upcoming) = outline accent（`border-primary/40 text-primary bg-primary/5`）
  - 結果待ち(awaiting) = neutral（`bg-[#f0f0f0] text-muted`）
  - 結果掲載済み(published) = solid accent（`bg-primary text-white`）
- **SectionHeading**: `border-l-4 border-primary` + subheading + 右に「一覧へ」導線（primary・chevron）。

---

## Do / Don't

**Do**
- アクセントは **#0049a2 だけ**。状態表現も mono+accent の濃淡で作る。
- 見出しは tracking `-0.02em`。canvas(#f7f7f7) と card(#fff) の**値差**で分離。
- 余白のリズムを一定に（section `py-12 md:py-16`、card `p-4`、gap 12px）。
- 数字・英字は Inter、和文は Noto Sans JP（font-family 先頭に Inter → Noto へフォールバック）。

**Don't**
- #0049a2 以外の色相を足さない（緑/黄/赤の状態色も使わない）。
- 本文を 17px より小さくしない。
- 角丸をバラつかせない（card=xl / input=lg / pill=full の3種のみ）。
- カードに線+影を両掛けしない。影は overlay 類のみ。
- 700 を本文・メタに使わない。

---

## 不可侵（既存制約）

- 公開 `@theme` の `--color-primary: #0049a2` と文字サイズ切替（html rem）を壊さない。
- shadcn は `.admin-shell` スコープのみ。公開トークンへ侵入させない。
- `lib/queries` / `lib/sanitize`（server専用）をクライアントに巻き込まない。

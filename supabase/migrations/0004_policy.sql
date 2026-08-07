-- サイトポリシー(/policy) の DB 化：本文4種(settings) と 個人情報保護PDF(resources) を追加。
-- 既存テーブルは変更しない。データ投入も本マイグレーション内で行う（db push で本番反映）。

insert into settings (key, value) values
  ('policy_copyright', to_jsonb($c$一般社団法人茨城県卓球連盟オフィシャルサイト（以下、「当ウェブサイト」といいます。）に掲載されている内容に関する著作権およびその他全ての権利は、当ウェブサイト「takkyu.ibaraki.jp」運営事務局（以下、「当事務局」といいます。）に使用を認めた権利者に帰属します。これらの著作権は、各国の著作権法、各種条約、その他の法律で保護されており、私的利用など法律によって認められる範囲を超えて、当ウェブサイトに掲載されている内容を使用（複製、改ざん、頒布などを含む。）することはできません。
また、当事務局からお客様にお送りした電子メールの内容に関する著作権は全て当事務局に帰属しており、当事務局に無断で転用・転載することはできません。$c$::text)),
  ('policy_trademark', to_jsonb($t$当ウェブサイトに掲載されている会社名・サービス名・商品名等は、各社の登録商標または商標です。これら商標等の複製・転用を禁じます。$t$::text)),
  ('policy_disclaimer', to_jsonb($d$当ウェブサイトに掲載されている内容に関して、いかなる保証をするものではなく、それに誤りがあった場合、または当ウェブサイトのご利用に際して生じたお客様と第三者との間のトラブルについては、一切責任を負いかねます。また、当ウェブサイトのご利用に起因するソフトウェア、ハードウェア上の事故その他の損害についても、一切責任を負いかねます。なお、当ウェブサイトに掲載されている情報、ファイル名等は、予告なく変更されることがありますので、あらかじめご了承ください。$d$::text)),
  ('policy_contact', to_jsonb($p$茨城県卓球連盟 運営事務局
〒309-1712 茨城県笠間市長兎路696
茨城県卓球連盟 事務局長 野口 文男$p$::text))
on conflict (key) do nothing;

-- ── 個人情報保護（resources / category='個人情報保護'）──
-- PDFは public/policy/ 配置のため external_url に相対パスを入れて resolveDocUrl で解決。
insert into resources (category, title, external_url, sort_order, is_published)
select '個人情報保護', '個人情報保護方針', '/policy/privacy_policy.pdf', 10, true
where not exists (select 1 from resources where title = '個人情報保護方針');

insert into resources (category, title, external_url, sort_order, is_published)
select '個人情報保護', '個人情報保護規程', '/policy/privacy_rules.pdf', 20, true
where not exists (select 1 from resources where title = '個人情報保護規程');

insert into resources (category, title, external_url, sort_order, is_published)
select '個人情報保護', '個人情報保護運用規程', '/policy/privacy_kitei.pdf', 30, true
where not exists (select 1 from resources where title = '個人情報保護運用規程');

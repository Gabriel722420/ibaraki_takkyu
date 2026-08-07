-- 連盟情報(/about) の DB 化：役員テーブル・会長挨拶(settings)・規程(resources) を追加。
-- 既存テーブルは変更しない。データ投入も本マイグレーション内で行う（db push で本番反映）。

-- ── 役員 ────────────────────────────
create table officers (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  name text not null,
  note text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
create index on officers (sort_order);

alter table officers enable row level security;
create policy pub_read_officers on officers for select using (is_published);
create policy auth_all_officers on officers
  for all to authenticated using (true) with check (true);

-- ── 会長挨拶ほか（settings） ──────────
insert into settings (key, value) values
  ('about_greeting_sign',
    to_jsonb('2026年4月 一般社団法人茨城県卓球連盟会長 小林 博史'::text)),
  ('about_greeting_image',
    to_jsonb('/about/kobayashi.png'::text))
on conflict (key) do nothing;

insert into settings (key, value) values
  ('about_greeting', to_jsonb($g$このたび、一般社団法人茨城県卓球連盟会長に就任いたしました小林博史です。
前川田会長のもと、2015年（平成27年）から理事長として、2021年（令和3年）からは副会長兼理事長として務めさせていただきました。
この間の最大の思い出としては、2019年（令和元年）日立市池の川さくらアリーナにて開催された「天皇陛下御即位記念第74回国民体育大会」に携われたことです。
日立市と連盟役員が一体となって成し遂げた一大イベントでした。
また、2022年（令和3年）より法人化し「一般社団法人茨城県卓球連盟」を設立したことは、組織の確立と各役員間をより強固なものとしました。
2026年度の役員改選により新たな体制でスタートいたしました。
連盟設立の目的である「茨城県内における卓球を統括し代表する団体」として、（1）卓球の普及並びに発展（2）体力の増進（3）スポーツマン精神の涵養を持って会員相互の親睦、融和に努めてまいります。
今年度は、将来の茨城・日本を担う中学生の重要な課題である「地域移行」という難題に取り組んでいきたいと思います。現時点で、各市町村の対応がまちまちであり的確な情報を収集して、子供たちが将来にわたって卓球ができる環境を模索してまいります。
その他の課題につきましても、できることから着実に取り組んでいく所存です。
何よりも会員の皆様方と卓球ができる喜びを共有し、共に発展していきたいと思います。
ご協力とご支援を賜りますよう、心よりお願い申し上げます。$g$::text))
on conflict (key) do nothing;

-- ── 役員データ（sort_order 10刻み・初回のみ投入） ──
insert into officers (role, name, note, sort_order)
select role, name, note, sort_order from (values
  ('名誉会長','川田進',null,10),
  ('名誉副会長','照沼鎮夫',null,20),
  ('名誉副会長','綱川正',null,30),
  ('名誉副会長','村山正毅',null,40),
  ('最高顧問','中川靖雄',null,50),
  ('顧問','長谷川訓也',null,60),
  ('顧問','佐々木重彰',null,70),
  ('顧問','冨士原行彦',null,80),
  ('会長','小林博史',null,90),
  ('副会長','芦間恒夫',null,100),
  ('副会長','阿久津しげ子',null,110),
  ('理事長','野口文男',null,120),
  ('事務局長','島根久','登録主任',130),
  ('副理事長','中川清','強化部長',140),
  ('副理事長','永田裕','ラージボール部長',150),
  ('副理事長','荒木美輪子','レディース部長',160),
  ('副理事長','澁谷敏夫','ジュニア部長・高体連委員長',170),
  ('副理事長','星大輔','カデット部長・中体連委員長',180),
  ('副理事長','久保宮光夫','ホープス部長',190),
  ('副理事長','関川治郎','審判部長・強化',200),
  ('副理事長','川田裕士','一般',210),
  ('副理事長','渡邉久之','一般',220),
  ('副理事長','藤井佳子','一般・クラブ長',230),
  ('副理事長','佐藤悦子','会計長',240),
  ('常任理事','綿引重夫','事務局・総務',250),
  ('常任理事','渡辺進','一般',260),
  ('常任理事','上野俊一','一般',270),
  ('常任理事','北林妙子','審判部副部長・総務',280),
  ('常任理事','村岡智廣','一般',290),
  ('常任理事','後藤圭一','カデット部',300),
  ('常任理事','原田政和','一般',310),
  ('常任理事','吉岡道予','障害者スポーツ主任',320),
  ('常任理事','渡邉栄子','一般・記録主任',330),
  ('理事','安藤真太郎','大学・強化',340),
  ('理事','海野利子','レディース部',350),
  ('理事','中川智恵','審判部事務局',360),
  ('理事','中野敏','障害者スポーツ担当',370),
  ('理事','亀井雅宏','県教職員担当',380),
  ('理事','竹内知子','一般・記録担当',390),
  ('理事','芦間春乃','一般・障害者スポーツ担当',400),
  ('理事','野上謙三','一般',410),
  ('理事','桐花一彦','一般',420),
  ('理事','菊地文子','一般',430),
  ('理事','松下英司','一般・実業団',440),
  ('理事','佐藤博美','一般',450),
  ('理事','木村里司','ラージボール部',460),
  ('理事','田中幹彦','ラージボール部',470),
  ('理事','沼口匡','カデット部',480),
  ('理事','飯村博之','ホープス部',490),
  ('理事','仁平雅巳','ホープス部',500),
  ('監事','根本滋',null,510),
  ('監事','吉岡浩',null,520)
) as v(role, name, note, sort_order)
where not exists (select 1 from officers);

-- ── 規程（resources / category='規程'）──
-- about 配下PDFは public/ 配置のため external_url に相対パスを入れて resolveDocUrl で解決。
insert into resources (category, title, external_url, sort_order, is_published)
select '規程', '（一社）茨城県卓球連盟定款', '/about/teikan2022.pdf', 10, true
where not exists (select 1 from resources where title = '（一社）茨城県卓球連盟定款');

insert into resources (category, title, external_url, sort_order, is_published)
select '規程', '（一社）茨城県卓球連盟規約', '/about/kiyaku2026.pdf', 20, true
where not exists (select 1 from resources where title = '（一社）茨城県卓球連盟規約');

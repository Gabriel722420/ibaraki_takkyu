-- 連絡先(policy_contact) を正規の表記（住所・氏名の全角スペース）に更新。
-- /about と /policy の共通連絡先として参照される。値の正規化のみ（構造変更なし）。
update settings
set value = to_jsonb($p$茨城県卓球連盟 運営事務局
〒309-1712　茨城県笠間市長兎路696
茨城県卓球連盟 事務局長 野口　文男$p$::text)
where key = 'policy_contact';

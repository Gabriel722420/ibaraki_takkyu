-- tournaments を games へ全面リネーム（可読性向上）。
-- データは保持する（alter ... rename のみ／drop・recreate はしない）。
-- 表示ラベル（日本語「大会」等）は不変。ここではDB識別子のみ games 化する。

-- ── テーブル／カラム／enum のリネーム ──
alter table tournaments rename to games;
alter table tournament_documents rename to game_documents;
alter table game_documents rename column tournament_id to game_id;
alter type tournament_doc_type rename to game_doc_type;

-- ── 主キー制約名の整合（機能不変・任意）──
alter table games rename constraint tournaments_pkey to games_pkey;
alter table game_documents rename constraint tournament_documents_pkey to game_documents_pkey;

-- ── インデックス名の整合（tournament* → game*）──
-- create index on ... の自動命名分をまとめて改名（機能不変）。
do $$
declare r record;
begin
  for r in
    select indexname from pg_indexes
    where schemaname = 'public' and indexname like 'tournament%'
  loop
    execute format(
      'alter index %I rename to %I',
      r.indexname,
      replace(r.indexname, 'tournament', 'game')
    );
  end loop;
end $$;

-- ── トリガ名の整合 ──
alter trigger trg_tournaments_updated on games rename to trg_games_updated;

-- ── RLS ポリシー名の整合（内容は不変）──
alter policy pub_read_tourn  on games          rename to pub_read_games;
alter policy pub_read_tdoc   on game_documents rename to pub_read_gdoc;
alter policy auth_all_tourn  on games          rename to auth_all_games;
alter policy auth_all_tdoc   on game_documents rename to auth_all_gdoc;

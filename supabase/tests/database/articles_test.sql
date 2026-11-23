BEGIN;

SELECT plan(21);

SELECT has_table(
  'public',
  'articles',
  'public.articles table should exist'
);

SELECT columns_are(
  'public',
  'articles',
  ARRAY['id', 'title', 'body', 'created_at', 'updated_at'],
  'articles should contain only the expected columns'
);

SELECT col_is_pk(
  'public',
  'articles',
  'id',
  'articles.id should be the primary key'
);

SELECT col_type_is('public', 'articles', 'id', 'uuid', 'articles.id should be uuid');
SELECT col_type_is('public', 'articles', 'title', 'text', 'articles.title should be text');
SELECT col_type_is('public', 'articles', 'body', 'text', 'articles.body should be text');
SELECT col_type_is('public', 'articles', 'created_at', 'timestamp with time zone', 'articles.created_at should be timestamptz');
SELECT col_type_is('public', 'articles', 'updated_at', 'timestamp with time zone', 'articles.updated_at should be timestamptz');

SELECT col_not_null('public', 'articles', 'title', 'articles.title should be required');
SELECT col_not_null('public', 'articles', 'body', 'articles.body should be required');
SELECT col_not_null('public', 'articles', 'created_at', 'articles.created_at should be required');
SELECT col_not_null('public', 'articles', 'updated_at', 'articles.updated_at should be required');

SELECT col_has_default('public', 'articles', 'id', 'articles.id should have a default');
SELECT col_has_default('public', 'articles', 'created_at', 'articles.created_at should have a default');
SELECT col_has_default('public', 'articles', 'updated_at', 'articles.updated_at should have a default');

SELECT is(
  (
    SELECT relrowsecurity
    FROM pg_catalog.pg_class
    WHERE oid = 'public.articles'::regclass
  ),
  true,
  'articles should have row level security enabled'
);

SELECT policies_are(
  'public',
  'articles',
  ARRAY[]::text[],
  'articles should not expose rows through RLS policies yet'
);

SELECT throws_ok(
  $$INSERT INTO public.articles (title, body) VALUES ('   ', 'Body')$$,
  '23514',
  'new row for relation "articles" violates check constraint "articles_title_check"',
  'articles should reject a blank title'
);

SELECT throws_ok(
  $$INSERT INTO public.articles (title, body) VALUES ('Title', E'\n\t ')$$,
  '23514',
  'new row for relation "articles" violates check constraint "articles_body_check"',
  'articles should reject a blank body'
);

SELECT throws_ok(
  format(
    'INSERT INTO public.articles (title, body) VALUES (%L, %L)',
    repeat('x', 201),
    'Body'
  ),
  '23514',
  'new row for relation "articles" violates check constraint "articles_title_check"',
  'articles should reject a title longer than 200 characters'
);

INSERT INTO public.articles (
  id,
  title,
  body,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Original title',
  'Body',
  '2020-01-01 00:00:00+00',
  '2020-01-01 00:00:00+00'
);

UPDATE public.articles
SET title = 'Updated title'
WHERE id = '00000000-0000-0000-0000-000000000001';

SELECT cmp_ok(
  (
    SELECT updated_at
    FROM public.articles
    WHERE id = '00000000-0000-0000-0000-000000000001'
  ),
  '>',
  '2020-01-01 00:00:00+00'::timestamp with time zone,
  'updating an article should refresh updated_at'
);

SELECT * FROM finish();

ROLLBACK;

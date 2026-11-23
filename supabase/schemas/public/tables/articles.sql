CREATE TABLE "public"."articles"
(
    "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
    "title"      text                     NOT NULL,
    "body"       text                     NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),

    CONSTRAINT "articles_pkey"
        PRIMARY KEY ("id"),

    CONSTRAINT "articles_title_check"
        CHECK (
            char_length("title") BETWEEN 1 AND 200
            AND "title" ~ '[^[:space:]]'
            ),

    CONSTRAINT "articles_body_check"
        CHECK (
            "body" ~ '[^[:space:]]'
            )
);

ALTER TABLE "public"."articles"
    ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER "set_articles_updated_at"
    BEFORE UPDATE
    ON "public"."articles"
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

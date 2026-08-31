-- Configurable external product import sources.
-- NOTE: api_key is admin-only and should be kept out of customer-facing queries.
CREATE TABLE IF NOT EXISTS import_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  website_url text NOT NULL,
  logo text,
  method text NOT NULL DEFAULT 'scraper',
  api_endpoint text,
  api_key text,
  selectors jsonb NOT NULL DEFAULT '{}'::jsonb,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_import_sources_enabled ON import_sources(enabled);

ALTER TABLE import_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage import sources" ON import_sources;
CREATE POLICY "Admins can manage import sources"
  ON import_sources
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

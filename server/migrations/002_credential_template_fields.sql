-- Add image and field placement support to credential templates
ALTER TABLE credential_templates ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE credential_templates ADD COLUMN IF NOT EXISTS field_placements JSONB DEFAULT '[]';

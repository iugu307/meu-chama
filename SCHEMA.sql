-- Config table (1 row)
CREATE TABLE config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instagram_token TEXT NOT NULL,
  instagram_user_id TEXT NOT NULL UNIQUE,
  instagram_username TEXT NOT NULL,
  profile_picture_url TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "config_disabled" ON config USING (FALSE) WITH CHECK (FALSE);

-- Automations table
CREATE TABLE automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  triggers TEXT[] NOT NULL DEFAULT ARRAY['comment', 'dm'],
  keywords TEXT[] NOT NULL,
  match_type TEXT DEFAULT 'contains' CHECK (match_type IN ('contains', 'exact', 'any')),
  post_id TEXT,
  public_reply_variations TEXT[] DEFAULT ARRAY[]::TEXT[],
  welcome_dm TEXT NOT NULL,
  quick_reply_button BOOLEAN DEFAULT FALSE,
  link_text TEXT,
  button_label TEXT,
  link_url TEXT,
  reminder_enabled BOOLEAN DEFAULT FALSE,
  reminder_text TEXT,
  reminder_delay_hours INTEGER DEFAULT 24,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "automations_disabled" ON automations USING (FALSE) WITH CHECK (FALSE);

-- Follow-ups table
CREATE TABLE followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('dm', 'reminder')),
  "order" INTEGER NOT NULL,
  delay_minutes INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE followups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "followups_disabled" ON followups USING (FALSE) WITH CHECK (FALSE);

-- Contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instagram_id TEXT NOT NULL UNIQUE,
  instagram_username TEXT NOT NULL,
  first_contact_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_response_at TIMESTAMP WITH TIME ZONE,
  last_automation_id UUID REFERENCES automations(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contacts_disabled" ON contacts USING (FALSE) WITH CHECK (FALSE);

CREATE INDEX contacts_instagram_id_idx ON contacts(instagram_id);

-- Queue table
CREATE TABLE queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  followup_id UUID REFERENCES followups(id) ON DELETE SET NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('welcome', 'followup', 'reminder')),
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('user', 'comment')),
  recipient_id TEXT NOT NULL,
  comment_id TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'skipped')),
  claimed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "queue_disabled" ON queue USING (FALSE) WITH CHECK (FALSE);

CREATE INDEX queue_status_claimed_idx ON queue(status, claimed_at) WHERE status = 'pending';
CREATE INDEX queue_contact_id_idx ON queue(contact_id);

-- Events table (audit log)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  raw_payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_disabled" ON events USING (FALSE) WITH CHECK (FALSE);

CREATE INDEX events_created_at_idx ON events(created_at DESC);

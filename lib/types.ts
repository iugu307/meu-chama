export interface Config {
  id: string;
  instagram_token: string;
  instagram_user_id: string;
  instagram_username: string;
  profile_picture_url: string | null;
  token_expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface Automation {
  id: string;
  name: string;
  active: boolean;
  triggers: ("comment" | "story" | "dm")[];
  keywords: string[];
  match_type: "contains" | "exact" | "any";
  post_id?: string | null;
  public_reply_variations: string[];
  welcome_dm: string;
  quick_reply_button: boolean;
  link_text: string;
  button_label: string;
  link_url: string;
  reminder_enabled: boolean;
  reminder_text?: string;
  reminder_delay_hours: number;
  created_at: string;
  updated_at: string;
}

export interface FollowUp {
  id: string;
  automation_id: string;
  type: "dm" | "reminder";
  order: number;
  delay_minutes: number;
  content: string;
  created_at: string;
}

export interface Contact {
  id: string;
  instagram_id: string;
  instagram_username: string;
  first_contact_at: string;
  last_response_at?: string | null;
  last_automation_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface QueueItem {
  id: string;
  contact_id: string;
  automation_id: string;
  followup_id?: string | null;
  message_type: "welcome" | "followup" | "reminder";
  recipient_type: "user" | "comment";
  recipient_id: string;
  comment_id?: string | null;
  content: string;
  status: "pending" | "sending" | "sent" | "failed" | "skipped";
  claimed_at?: string | null;
  error_message?: string | null;
  attempts: number;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  event_type: string;
  raw_payload: Record<string, any>;
  processed: boolean;
  created_at: string;
}

export interface WebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    time: number;
    changes: Array<{
      value: {
        from?: { id: string; username: string };
        message?: string;
        comment_id?: string;
        post_id?: string;
        recipient?: { id: string; username: string };
        reply_to?: { story?: boolean };
      };
      field: string;
    }>;
  }>;
}

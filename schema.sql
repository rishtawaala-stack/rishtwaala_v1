-- rishtawaala.com database schema
-- Target: PostgreSQL 15+ / Supabase
-- This script creates the full application schema described in the project PDF.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text not null unique,
  email text unique,
  phone_verified boolean not null default false,
  email_verified boolean not null default false,
  verified_level smallint not null default 0 check (verified_level between 0 and 3),
  is_active boolean not null default true,
  is_blocked boolean not null default false,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  last_seen_at timestamp without time zone
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  profile_for text not null check (profile_for in ('self', 'son', 'daughter', 'brother', 'sister')),
  full_name text not null,
  dob date not null,
  age smallint check (age between 18 and 100),
  gender text not null check (gender in ('male', 'female', 'other')),
  height_cm smallint check (height_cm between 90 and 250),
  weight_kg smallint check (weight_kg between 20 and 300),
  complexion text check (complexion in ('fair', 'wheatish', 'dusky', 'dark')),
  blood_group text,
  differently_abled boolean not null default false,
  religion text not null,
  caste text not null,
  sub_caste text,
  gotra text,
  manglik text check (manglik in ('yes', 'no', 'partial')),
  mother_tongue text not null,
  marital_status text not null check (marital_status in ('never_married', 'divorced', 'widowed')),
  children_count smallint not null default 0 check (children_count >= 0),
  children_living_with text check (children_living_with in ('self', 'ex', 'none')),
  current_city text not null,
  current_state text not null,
  current_country text not null default 'India',
  nationality text not null default 'Indian',
  grew_up_in text,
  is_nri boolean not null default false,
  nri_country text,
  nri_since_year smallint check (nri_since_year between 1900 and 2100),
  nri_visa_status text check (nri_visa_status in ('citizen', 'pr', 'work_visa', 'student')),
  nri_city text,
  open_to_relocate_india boolean,
  visit_frequency text check (visit_frequency in ('annually', 'rarely', 'never')),
  education_level text not null,
  education_field text,
  institution text,
  occupation_type text check (occupation_type in ('private', 'govt', 'business', 'defence')),
  occupation_detail text,
  employer text,
  annual_income_range text not null,
  currency text not null default 'INR' check (currency in ('INR', 'USD')),
  diet text check (diet in ('veg', 'nonveg', 'eggetarian', 'jain')),
  smoking text check (smoking in ('no', 'occasionally', 'yes')),
  drinking text check (drinking in ('no', 'occasionally', 'yes')),
  hobbies text[] not null default '{}',
  interests text[] not null default '{}',
  bio text check (char_length(coalesce(bio, '')) <= 500),
  profile_photo_url text,
  profile_complete_pct smallint not null default 0 check (profile_complete_pct between 0 and 100),
  profile_score double precision not null default 0,
  is_premium boolean not null default false,
  is_featured boolean not null default false,
  is_verified boolean not null default false,
  is_visible boolean not null default true,
  is_active boolean not null default true,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now()
);

create table if not exists public.family_details (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  father_name text,
  father_status text check (father_status in ('alive', 'deceased')),
  father_occupation text,
  mother_name text,
  mother_status text check (mother_status in ('alive', 'deceased')),
  mother_occupation text,
  siblings_count smallint check (siblings_count >= 0),
  siblings_married smallint check (siblings_married >= 0),
  family_type text check (family_type in ('nuclear', 'joint', 'extended')),
  family_values text check (family_values in ('orthodox', 'traditional', 'moderate', 'liberal')),
  family_affluence text check (family_affluence in ('middle', 'upper_middle', 'rich')),
  native_place text,
  native_state text,
  about_family text check (char_length(coalesce(about_family, '')) <= 300)
);

create table if not exists public.horoscope_details (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  birth_date date,
  birth_time time without time zone,
  birth_city text,
  birth_state text,
  birth_country text,
  rashi text,
  nakshatra text,
  nakshatra_pada smallint check (nakshatra_pada between 1 and 4),
  lagna text,
  gotra text,
  mangal_dosha boolean,
  mangal_dosha_type text check (mangal_dosha_type in ('partial', 'full')),
  nadi_dosha boolean,
  kaal_sarp_dosha boolean,
  guna_score smallint check (guna_score between 0 and 36),
  kundali_pdf_url text,
  horoscope_visible_to text check (horoscope_visible_to in ('all', 'premium', 'accepted_only'))
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  url text not null,
  storage_path text not null,
  type text not null check (type in ('photo', 'video', 'horoscope_doc', 'kyc_doc')),
  "order" smallint check ("order" >= 1),
  is_verified boolean not null default false,
  is_primary boolean not null default false,
  uploaded_at timestamp without time zone not null default now()
);

create table if not exists public.partner_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  age_min smallint check (age_min between 18 and 100),
  age_max smallint check (age_max between 18 and 100),
  height_min_cm smallint check (height_min_cm between 90 and 250),
  height_max_cm smallint check (height_max_cm between 90 and 250),
  marital_status text[] not null default '{}',
  religion text[] not null default '{}',
  caste text[] not null default '{}',
  sub_caste text[] not null default '{}',
  mother_tongue text[] not null default '{}',
  education_level text[] not null default '{}',
  occupation_type text[] not null default '{}',
  income_range_min text,
  diet text[] not null default '{}',
  smoking_acceptable boolean,
  drinking_acceptable boolean,
  manglik_preference text check (manglik_preference in ('any', 'no', 'yes', 'partial')),
  country text[] not null default '{}',
  state text[] not null default '{}',
  city text[] not null default '{}',
  is_nri_preferred boolean,
  differently_abled_acceptable boolean,
  about_partner text,
  check (age_min is null or age_max is null or age_min <= age_max),
  check (height_min_cm is null or height_max_cm is null or height_min_cm <= height_max_cm)
);

create table if not exists public.privacy_settings (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  photo_visible_to text not null default 'all' check (photo_visible_to in ('all', 'premium', 'accepted_only', 'none')),
  contact_visible_to text not null default 'accepted_only' check (contact_visible_to in ('all', 'premium', 'accepted_only', 'none')),
  horoscope_visible_to text not null default 'all' check (horoscope_visible_to in ('all', 'premium', 'accepted_only', 'none')),
  income_visible_to text not null default 'premium' check (income_visible_to in ('all', 'premium', 'accepted_only', 'none')),
  last_seen_visible_to text not null default 'all' check (last_seen_visible_to in ('all', 'premium', 'accepted_only', 'none')),
  online_status_visible boolean not null default true,
  incognito_mode boolean not null default false,
  searchable boolean not null default true,
  hide_from_ids uuid[] not null default '{}'
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  profile_a uuid not null references public.profiles(id) on delete cascade,
  profile_b uuid not null references public.profiles(id) on delete cascade,
  match_score double precision not null check (match_score between 0 and 100),
  match_type text not null check (match_type in ('preferred', 'broader', 'reverse', 'kundali', 'ai')),
  is_mutual boolean not null default false,
  signals text,
  created_at timestamp without time zone not null default now(),
  unique (profile_a, profile_b),
  check (profile_a <> profile_b)
);

create table if not exists public.kundali_match_scores (
  id uuid primary key default gen_random_uuid(),
  profile_a uuid not null references public.profiles(id) on delete cascade,
  profile_b uuid not null references public.profiles(id) on delete cascade,
  varna smallint check (varna between 0 and 1),
  vashya smallint check (vashya between 0 and 2),
  tara smallint check (tara between 0 and 3),
  yoni smallint check (yoni between 0 and 4),
  graha_maitri smallint check (graha_maitri between 0 and 5),
  gana smallint check (gana between 0 and 6),
  bhakoot smallint check (bhakoot between 0 and 7),
  nadi smallint check (nadi between 0 and 8),
  total_score smallint check (total_score between 0 and 36),
  computed_at timestamp without time zone not null default now(),
  unique (profile_a, profile_b),
  check (profile_a <> profile_b)
);

create table if not exists public.interests (
  id uuid primary key default gen_random_uuid(),
  from_profile uuid not null references public.profiles(id) on delete cascade,
  to_profile uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('like', 'shortlist', 'block', 'ignore', 'accepted', 'declined')),
  message text,
  expires_at timestamp without time zone,
  created_at timestamp without time zone not null default now(),
  updated_at timestamp without time zone not null default now(),
  unique (from_profile, to_profile),
  check (from_profile <> to_profile)
);

create table if not exists public.match_feedback (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  match_profile_id uuid not null references public.profiles(id) on delete cascade,
  action text not null check (action in ('ignored', 'declined', 'reported')),
  reason text not null check (reason in ('age', 'location', 'caste', 'income', 'photo', 'other')),
  created_at timestamp without time zone not null default now(),
  check (profile_id <> match_profile_id)
);

create table if not exists public.profile_views (
  viewer_id uuid not null references public.profiles(id) on delete cascade,
  viewed_id uuid not null references public.profiles(id) on delete cascade,
  viewed_at timestamp without time zone not null default now(),
  primary key (viewer_id, viewed_id, viewed_at),
  check (viewer_id <> viewed_id)
);

create table if not exists public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  age_min smallint check (age_min between 18 and 100),
  age_max smallint check (age_max between 18 and 100),
  height_min smallint check (height_min between 90 and 250),
  height_max smallint check (height_max between 90 and 250),
  religion text[] not null default '{}',
  caste text[] not null default '{}',
  city text[] not null default '{}',
  state text[] not null default '{}',
  country text[] not null default '{}',
  education text[] not null default '{}',
  income_range text[] not null default '{}',
  alert_enabled boolean not null default false,
  alert_frequency text check (alert_frequency in ('daily', 'weekly')),
  last_alerted_at timestamp without time zone,
  created_at timestamp without time zone not null default now(),
  check (age_min is null or age_max is null or age_min <= age_max),
  check (height_min is null or height_max is null or height_min <= height_max)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  profile_a uuid not null references public.profiles(id) on delete cascade,
  profile_b uuid not null references public.profiles(id) on delete cascade,
  initiated_by uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'archived', 'blocked')),
  created_at timestamp without time zone not null default now(),
  last_message_at timestamp without time zone,
  unique (profile_a, profile_b),
  check (profile_a <> profile_b),
  check (initiated_by in (profile_a, profile_b))
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  type text not null default 'text' check (type in ('text', 'image', 'contact_share')),
  is_read boolean not null default false,
  sent_at timestamp without time zone not null default now(),
  read_at timestamp without time zone
);

create table if not exists public.contact_unlocks (
  id uuid primary key default gen_random_uuid(),
  unlocked_by uuid not null references public.profiles(id) on delete cascade,
  unlocked_profile uuid not null references public.profiles(id) on delete cascade,
  unlocked_at timestamp without time zone not null default now(),
  check (unlocked_by <> unlocked_profile)
);

create table if not exists public.secure_connect_sessions (
  id uuid primary key default gen_random_uuid(),
  caller_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  masked_number text,
  status text not null check (status in ('requested', 'active', 'ended', 'declined')),
  started_at timestamp without time zone,
  ended_at timestamp without time zone,
  duration_sec integer check (duration_sec >= 0),
  check (caller_id <> receiver_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('new_interest', 'message', 'profile_view', 'match', 'subscription', 'boost')),
  title text not null,
  body text not null,
  is_read boolean not null default false,
  ref_id uuid,
  created_at timestamp without time zone not null default now()
);

create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  plan_code text not null check (plan_code in ('free', 'gold', 'platinum')),
  plan_name text not null,
  duration_days integer not null check (duration_days >= 0),
  price_inr numeric(10,2) not null check (price_inr >= 0),
  price_usd numeric(10,2) not null check (price_usd >= 0),
  is_active boolean not null default true,
  sort_order smallint not null check (sort_order >= 1),
  unique (plan_code, duration_days)
);

create table if not exists public.subscription_plan_features (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.subscription_plans(id) on delete cascade,
  feature_key text not null,
  feature_value text not null,
  display_label text not null,
  unique (plan_id, feature_key)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid references public.subscription_plans(id) on delete set null,
  gateway text not null check (gateway in ('razorpay', 'stripe', 'upi')),
  gateway_txn_id text unique,
  amount numeric(10,2) not null check (amount >= 0),
  currency text not null check (currency in ('INR', 'USD')),
  status text not null check (status in ('pending', 'success', 'failed', 'refunded')),
  failure_reason text,
  refund_amount numeric(10,2) check (refund_amount >= 0),
  refund_at timestamp without time zone,
  created_at timestamp without time zone not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.subscription_plans(id) on delete restrict,
  started_at timestamp without time zone not null,
  expires_at timestamp without time zone not null,
  is_active boolean not null default true,
  payment_id uuid references public.payments(id) on delete set null,
  auto_renew boolean not null default false,
  cancelled_at timestamp without time zone,
  check (expires_at >= started_at)
);

create table if not exists public.profile_boosts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  boost_type text not null check (boost_type in ('standard', 'super', 'featured')),
  started_at timestamp without time zone not null,
  expires_at timestamp without time zone not null,
  impressions_count integer not null default 0 check (impressions_count >= 0),
  clicks_count integer not null default 0 check (clicks_count >= 0),
  source text not null check (source in ('manual', 'plan', 'purchased')),
  check (expires_at >= started_at)
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  referred_phone text not null,
  referred_user_id uuid references public.users(id) on delete set null,
  status text not null check (status in ('pending', 'joined', 'rewarded')),
  reward_amount numeric(10,2) not null default 0 check (reward_amount >= 0),
  rewarded_at timestamp without time zone,
  created_at timestamp without time zone not null default now(),
  unique (referrer_id, referred_phone)
);

create table if not exists public.relationship_managers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique,
  phone text,
  is_active boolean not null default true,
  max_clients integer not null default 50 check (max_clients >= 0)
);

create table if not exists public.rm_assignments (
  id uuid primary key default gen_random_uuid(),
  rm_id uuid not null references public.relationship_managers(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  assigned_at timestamp without time zone not null default now(),
  last_called_at timestamp without time zone,
  call_count integer not null default 0 check (call_count >= 0),
  notes text,
  unique (rm_id, profile_id),
  unique (profile_id)
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role text not null check (role in ('superadmin', 'moderator', 'rm_manager', 'support')),
  is_active boolean not null default true,
  created_at timestamp without time zone not null default now()
);

create table if not exists public.screening_queue (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  trigger text not null check (trigger in ('new_registration', 'edited', 'reported')),
  status text not null check (status in ('pending', 'approved', 'rejected')),
  reviewer_id uuid references public.admin_users(id) on delete set null,
  reviewed_at timestamp without time zone,
  rejection_reason text,
  created_at timestamp without time zone not null default now()
);

create table if not exists public.profile_verifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('phone', 'email', 'photo', 'government_id', 'income', 'education')),
  status text not null check (status in ('pending', 'approved', 'rejected')),
  doc_url text,
  verified_by uuid references public.admin_users(id) on delete set null,
  verified_at timestamp without time zone,
  rejection_reason text,
  created_at timestamp without time zone not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (reason in ('fake_profile', 'abuse', 'harassment', 'spam', 'fraud', 'other')),
  description text,
  status text not null check (status in ('pending', 'reviewed', 'action_taken', 'dismissed')),
  created_at timestamp without time zone not null default now(),
  reviewed_at timestamp without time zone,
  reviewed_by uuid references public.admin_users(id) on delete set null,
  check (reporter_id <> reported_id)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null check (action in ('create', 'update', 'delete', 'approve', 'reject', 'block')),
  table_name text not null,
  record_id uuid,
  old_values text,
  new_values text,
  ip_address text,
  created_at timestamp without time zone not null default now()
);

create table if not exists public.success_stories (
  id uuid primary key default gen_random_uuid(),
  profile_a uuid not null references public.profiles(id) on delete cascade,
  profile_b uuid not null references public.profiles(id) on delete cascade,
  story text not null,
  married_on date,
  photo_url text,
  is_published boolean not null default false,
  created_at timestamp without time zone not null default now(),
  check (profile_a <> profile_b)
);

create index if not exists idx_profiles_search
  on public.profiles (religion, caste, gender, current_state, is_active, is_visible);

create index if not exists idx_profiles_age
  on public.profiles (age, height_cm, annual_income_range);

create index if not exists idx_profiles_nri
  on public.profiles (is_nri, nri_country) where is_nri = true;

create index if not exists idx_profiles_premium
  on public.profiles (is_premium, is_featured);

create index if not exists idx_profiles_mother_tongue on public.profiles (mother_tongue);
create index if not exists idx_profiles_marital_status on public.profiles (marital_status);
create index if not exists idx_profiles_city on public.profiles (current_city);
create index if not exists idx_profiles_country on public.profiles (current_country);
create index if not exists idx_profiles_education on public.profiles (education_level);
create index if not exists idx_profiles_diet on public.profiles (diet);

create index if not exists idx_media_profile on public.media (profile_id, type, uploaded_at desc);
create unique index if not exists idx_media_primary_photo
  on public.media (profile_id)
  where is_primary = true;

create index if not exists idx_matches_score on public.matches (profile_a, match_score desc);
create index if not exists idx_matches_profile_b on public.matches (profile_b, match_score desc);
create index if not exists idx_kundali_pairs on public.kundali_match_scores (profile_a, profile_b);
create index if not exists idx_interests_from on public.interests (from_profile, type, created_at);
create index if not exists idx_interests_to on public.interests (to_profile, type, created_at);
create index if not exists idx_profile_views on public.profile_views (viewed_id, viewed_at desc);
create index if not exists idx_saved_searches_profile on public.saved_searches (profile_id, created_at desc);

create index if not exists idx_conversations_a on public.conversations (profile_a, last_message_at desc);
create index if not exists idx_conversations_b on public.conversations (profile_b, last_message_at desc);
create index if not exists idx_messages_conv on public.messages (conversation_id, sent_at desc);
create index if not exists idx_messages_sender on public.messages (sender_id, sent_at desc);
create index if not exists idx_contact_unlocks_profile on public.contact_unlocks (unlocked_by, unlocked_at desc);
create index if not exists idx_secure_connect_caller on public.secure_connect_sessions (caller_id, started_at desc);
create index if not exists idx_notifications_profile on public.notifications (profile_id, is_read, created_at desc);

create index if not exists idx_plan_features_plan on public.subscription_plan_features (plan_id, feature_key);
create index if not exists idx_payments_profile on public.payments (profile_id, created_at desc);
create index if not exists idx_subscriptions_profile on public.subscriptions (profile_id, is_active, expires_at desc);
create index if not exists idx_boosts_profile on public.profile_boosts (profile_id, expires_at desc);
create index if not exists idx_referrals_referrer on public.referrals (referrer_id, status, created_at desc);

create index if not exists idx_rm_assignments_rm on public.rm_assignments (rm_id, assigned_at desc);
create index if not exists idx_screening_status on public.screening_queue (status, created_at);
create index if not exists idx_profile_verifications_profile on public.profile_verifications (profile_id, status, created_at desc);
create index if not exists idx_reports_status on public.reports (status, created_at);
create index if not exists idx_audit_logs_table_record on public.audit_logs (table_name, record_id, created_at desc);
create index if not exists idx_success_stories_published on public.success_stories (is_published, created_at desc);

create index if not exists idx_profiles_hobbies_gin on public.profiles using gin (hobbies);
create index if not exists idx_profiles_interests_gin on public.profiles using gin (interests);
create index if not exists idx_privacy_hide_from_ids_gin on public.privacy_settings using gin (hide_from_ids);
create index if not exists idx_partner_preferences_religion_gin on public.partner_preferences using gin (religion);
create index if not exists idx_partner_preferences_caste_gin on public.partner_preferences using gin (caste);
create index if not exists idx_partner_preferences_city_gin on public.partner_preferences using gin (city);

insert into public.subscription_plans (plan_code, plan_name, duration_days, price_inr, price_usd, sort_order)
values
  ('free', 'Free', 0, 0, 0, 1),
  ('gold', 'Gold 3 Months', 90, 1999, 24, 2),
  ('gold', 'Gold 6 Months', 180, 3499, 42, 2),
  ('gold', 'Gold 12 Months', 365, 5999, 72, 2),
  ('platinum', 'Platinum 3 Months', 90, 3999, 48, 3),
  ('platinum', 'Platinum 6 Months', 180, 6999, 84, 3),
  ('platinum', 'Platinum 12 Months', 365, 11999, 144, 3)
on conflict (plan_code, duration_days) do nothing;

create trigger trg_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

<<<<<<< HEAD
-- RLS Policies for Interests
alter table if exists public.interests enable row level security;
create policy "Users can insert their own interests" on public.interests for insert with check (true);
create policy "Users can view their own interests" on public.interests for select using (true);
create policy "Users can update their own interests" on public.interests for update using (true);

-- RLS Policies for Notifications
alter table if exists public.notifications enable row level security;
create policy "Users can view their own notifications" on public.notifications for select using (auth.uid() = profile_id or true);
create policy "Service role can managing notifications" on public.notifications for all using (true);

-- RLS Policies for Profiles (Unified Table)
alter table if exists public.user_information enable row level security;
create policy "Allow all authenticated for now" on public.user_information for all using (true) with check (true);

-- Trigger for updated_at in interests
=======
>>>>>>> 549676388e320add1edf0a91752e90f28fdc56d4
create trigger trg_interests_updated_at
before update on public.interests
for each row execute function public.set_updated_at();

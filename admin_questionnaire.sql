-- Questionnaire System SQL Updates
-- Run this in your SQL Editor

-- 1. Table for Admin Questions
CREATE TABLE IF NOT EXISTS public.admin_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_text TEXT NOT NULL,
    created_by UUID REFERENCES public.admin_users(id),
    is_all_users BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table for Specific User Targets (if not sent to all)
CREATE TABLE IF NOT EXISTS public.admin_question_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES public.admin_questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    UNIQUE(question_id, user_id)
);

-- 3. Table for User Answers
CREATE TABLE IF NOT EXISTS public.admin_question_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES public.admin_questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(question_id, user_id)
);

-- Enable RLS for security (Optional but recommended)
ALTER TABLE public.admin_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_question_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_question_answers ENABLE ROW LEVEL SECURITY;

-- Policies for Admin
CREATE POLICY "Admins can do everything on questions" ON public.admin_questions 
    FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins can do everything on targets" ON public.admin_question_targets 
    FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins can view answers" ON public.admin_question_answers 
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Policies for Users
CREATE POLICY "Users can view their targeted questions" ON public.admin_questions
    FOR SELECT USING (
        is_all_users = true OR 
        EXISTS (SELECT 1 FROM public.admin_question_targets WHERE question_id = public.admin_questions.id AND user_id = auth.uid())
    );

CREATE POLICY "Users can submit their answers" ON public.admin_question_answers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own answers" ON public.admin_question_answers
    FOR SELECT USING (auth.uid() = user_id);

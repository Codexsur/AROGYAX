-- AROGYAX Supabase Database Schema
-- Run this SQL in your Supabase SQL editor to create the database structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    google_id TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    location JSONB DEFAULT '{}',
    medical_history JSONB DEFAULT '[]',
    allergies TEXT[] DEFAULT '{}',
    medications JSONB DEFAULT '[]',
    emergency_contacts JSONB DEFAULT '[]',
    health_metrics JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{"language": "english", "notifications": true, "dataSharing": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Health records table
CREATE TABLE health_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('symptom', 'diagnosis', 'prescription', 'lab_result', 'vital_signs', 'appointment', 'emergency')),
    data JSONB NOT NULL DEFAULT '{}',
    attachments TEXT[] DEFAULT '{}',
    provider_id TEXT,
    appointment_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Symptom logs table
CREATE TABLE symptom_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    symptoms JSONB NOT NULL DEFAULT '[]',
    overall_severity INTEGER CHECK (overall_severity >= 1 AND overall_severity <= 10),
    triggers TEXT[] DEFAULT '{}',
    medications TEXT[] DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider_id TEXT,
    provider_name TEXT,
    specialty TEXT,
    type TEXT DEFAULT 'video' CHECK (type IN ('video', 'phone', 'in-person')),
    scheduled_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER DEFAULT 30,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled')),
    meeting_link TEXT,
    notes TEXT,
    prescription TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat history table
CREATE TABLE chat_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    ai_model TEXT DEFAULT 'gemini-1.5-flash',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health metrics table
CREATE TABLE health_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL,
    value NUMERIC NOT NULL,
    unit TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    device_type TEXT,
    notes TEXT
);

-- Emergency contacts table
CREATE TABLE emergency_contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vaccination records table
CREATE TABLE vaccination_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    vaccine_name TEXT NOT NULL,
    dose_number INTEGER,
    administered_date DATE,
    next_due_date DATE,
    provider_name TEXT,
    batch_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health goals table
CREATE TABLE health_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    goal_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_value NUMERIC,
    current_value NUMERIC DEFAULT 0,
    unit TEXT,
    target_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_health_records_user_id ON health_records(user_id);
CREATE INDEX idx_health_records_type ON health_records(type);
CREATE INDEX idx_health_records_created_at ON health_records(created_at);
CREATE INDEX idx_symptom_logs_user_id ON symptom_logs(user_id);
CREATE INDEX idx_symptom_logs_timestamp ON symptom_logs(timestamp);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_scheduled_time ON appointments(scheduled_time);
CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX idx_chat_history_timestamp ON chat_history(timestamp);
CREATE INDEX idx_health_metrics_user_id ON health_metrics(user_id);
CREATE INDEX idx_health_metrics_recorded_at ON health_metrics(recorded_at);
CREATE INDEX idx_emergency_contacts_user_id ON emergency_contacts(user_id);
CREATE INDEX idx_vaccination_records_user_id ON vaccination_records(user_id);
CREATE INDEX idx_health_goals_user_id ON health_goals(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccination_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Health records policies
CREATE POLICY "Users can view own health records" ON health_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own health records" ON health_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own health records" ON health_records FOR UPDATE USING (auth.uid() = user_id);

-- Symptom logs policies
CREATE POLICY "Users can view own symptom logs" ON symptom_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own symptom logs" ON symptom_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Appointments policies
CREATE POLICY "Users can view own appointments" ON appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own appointments" ON appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own appointments" ON appointments FOR UPDATE USING (auth.uid() = user_id);

-- Chat history policies
CREATE POLICY "Users can view own chat history" ON chat_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat history" ON chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Health metrics policies
CREATE POLICY "Users can view own health metrics" ON health_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own health metrics" ON health_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Emergency contacts policies
CREATE POLICY "Users can view own emergency contacts" ON emergency_contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own emergency contacts" ON emergency_contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own emergency contacts" ON emergency_contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own emergency contacts" ON emergency_contacts FOR DELETE USING (auth.uid() = user_id);

-- Vaccination records policies
CREATE POLICY "Users can view own vaccination records" ON vaccination_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vaccination records" ON vaccination_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vaccination records" ON vaccination_records FOR UPDATE USING (auth.uid() = user_id);

-- Health goals policies
CREATE POLICY "Users can view own health goals" ON health_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own health goals" ON health_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own health goals" ON health_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own health goals" ON health_goals FOR DELETE USING (auth.uid() = user_id);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_health_records_updated_at BEFORE UPDATE ON health_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_goals_updated_at BEFORE UPDATE ON health_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
-- INSERT INTO users (email, name) VALUES ('test@example.com', 'Test User');

-- Create a view for user health summary
CREATE VIEW user_health_summary AS
SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(DISTINCT hr.id) as total_health_records,
    COUNT(DISTINCT sl.id) as total_symptom_logs,
    COUNT(DISTINCT a.id) as total_appointments,
    MAX(hr.created_at) as last_health_record,
    MAX(sl.timestamp) as last_symptom_log,
    MAX(a.scheduled_time) as next_appointment
FROM users u
LEFT JOIN health_records hr ON u.id = hr.user_id
LEFT JOIN symptom_logs sl ON u.id = sl.user_id
LEFT JOIN appointments a ON u.id = a.user_id AND a.scheduled_time > NOW()
GROUP BY u.id, u.name, u.email;

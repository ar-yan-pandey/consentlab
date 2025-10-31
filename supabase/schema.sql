-- ConsentLab Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Hospital Users Table
CREATE TABLE hospital_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) CHECK (role IN ('admin', 'doctor', 'consent_officer')) NOT NULL,
  hospital_name VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  specialization VARCHAR(255),
  hospital_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample doctors
INSERT INTO doctors (name, specialization, hospital_name) VALUES
('Dr. Sarah Johnson', 'General Surgery', 'City General Hospital'),
('Dr. Rajesh Kumar', 'Oncology', 'City General Hospital'),
('Dr. Priya Menon', 'Obstetrics & Gynecology', 'City General Hospital'),
('Dr. Amit Patel', 'Cardiology', 'City General Hospital'),
('Dr. Lakshmi Iyer', 'Pediatrics', 'City General Hospital'),
('Dr. Mohammed Ali', 'Orthopedics', 'City General Hospital'),
('Dr. Anita Desai', 'Internal Medicine', 'City General Hospital'),
('Dr. Vikram Singh', 'Neurology', 'City General Hospital');

-- Patients Table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id VARCHAR(20) UNIQUE NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL,
  gender VARCHAR(50) NOT NULL,
  disease TEXT NOT NULL,
  doctor_assigned VARCHAR(255) NOT NULL,
  treatment_course TEXT NOT NULL,
  admission_date DATE NOT NULL,
  expected_discharge_date DATE,
  notes TEXT,
  hospital_user_id UUID REFERENCES hospital_users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consent Forms Table
CREATE TABLE consent_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id VARCHAR(20) REFERENCES patients(patient_id) ON DELETE CASCADE,
  form_type VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high')),
  risk_factors TEXT[],
  doctor_signature TEXT NOT NULL,
  patient_signature TEXT,
  signed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consent Templates Table
CREATE TABLE consent_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_name VARCHAR(255) NOT NULL,
  procedure_type VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_patients_patient_id ON patients(patient_id);
CREATE INDEX idx_patients_hospital_user ON patients(hospital_user_id);
CREATE INDEX idx_consent_forms_patient_id ON consent_forms(patient_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consent_forms_updated_at BEFORE UPDATE ON consent_forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample consent templates
INSERT INTO consent_templates (template_name, procedure_type, content, risk_level) VALUES
('General Surgery Consent', 'Surgery', 'I hereby consent to undergo the surgical procedure as explained to me by Dr. [Doctor Name]. I understand the nature of the procedure, its risks, benefits, and alternatives. Risks include but are not limited to: infection, bleeding, adverse reaction to anesthesia, and potential complications specific to the procedure.', 'medium'),
('Blood Transfusion Consent', 'Transfusion', 'I consent to receive blood or blood products as deemed necessary by my healthcare provider. I understand the risks including allergic reactions, infections, and transfusion reactions.', 'low'),
('Chemotherapy Consent', 'Chemotherapy', 'I consent to receive chemotherapy treatment as prescribed. I understand the potential side effects including nausea, hair loss, fatigue, increased infection risk, and organ damage.', 'high'),
('Diagnostic Procedure Consent', 'Diagnostic', 'I consent to undergo the diagnostic procedure as explained. I understand there may be minimal risks including discomfort, bruising, or rare complications.', 'low');

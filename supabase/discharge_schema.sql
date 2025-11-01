-- Discharge Management Schema
-- Run this in your Supabase SQL Editor after the main schema

-- Discharge Summary Templates Table
CREATE TABLE IF NOT EXISTS discharge_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_name VARCHAR(255) NOT NULL,
  disease_category VARCHAR(255) NOT NULL,
  discharge_instructions TEXT NOT NULL,
  follow_up_instructions TEXT NOT NULL,
  precautions TEXT NOT NULL,
  diet_instructions TEXT,
  medication_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discharge Summaries Table
CREATE TABLE IF NOT EXISTS discharge_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id VARCHAR(20) REFERENCES patients(patient_id) ON DELETE CASCADE,
  discharge_date DATE NOT NULL,
  diagnosis TEXT NOT NULL,
  treatment_given TEXT NOT NULL,
  discharge_condition VARCHAR(100) NOT NULL,
  follow_up_date DATE,
  follow_up_instructions TEXT NOT NULL,
  precautions TEXT NOT NULL,
  diet_instructions TEXT,
  medication_instructions TEXT,
  further_care TEXT,
  created_by UUID REFERENCES hospital_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing Expenses Table
CREATE TABLE IF NOT EXISTS billing_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discharge_summary_id UUID REFERENCES discharge_summaries(id) ON DELETE CASCADE,
  expense_category VARCHAR(100) NOT NULL,
  expense_description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discharge Bills Table
CREATE TABLE IF NOT EXISTS discharge_bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discharge_summary_id UUID REFERENCES discharge_summaries(id) ON DELETE CASCADE,
  patient_id VARCHAR(20) REFERENCES patients(patient_id) ON DELETE CASCADE,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(50) CHECK (payment_status IN ('pending', 'paid', 'partially_paid', 'cancelled')) DEFAULT 'pending',
  payment_method VARCHAR(100),
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_discharge_summaries_patient_id ON discharge_summaries(patient_id);
CREATE INDEX idx_billing_expenses_discharge_id ON billing_expenses(discharge_summary_id);
CREATE INDEX idx_discharge_bills_patient_id ON discharge_bills(patient_id);
CREATE INDEX idx_discharge_bills_payment_status ON discharge_bills(payment_status);

-- Add triggers for updated_at
CREATE TRIGGER update_discharge_summaries_updated_at BEFORE UPDATE ON discharge_summaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discharge_bills_updated_at BEFORE UPDATE ON discharge_bills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discharge_templates_updated_at BEFORE UPDATE ON discharge_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add discharge_status to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS discharge_status VARCHAR(50) CHECK (discharge_status IN ('admitted', 'ready_for_discharge', 'discharged')) DEFAULT 'admitted';

-- Insert sample discharge templates
INSERT INTO discharge_templates (template_name, disease_category, discharge_instructions, follow_up_instructions, precautions) VALUES
(
  'General Surgery Discharge',
  'Surgery',
  'Patient is being discharged in stable condition following successful surgery. Wound care has been explained. Pain management plan provided.',
  'Follow up with surgeon in 7-10 days for wound check and suture removal. Contact immediately if fever, increased pain, or wound discharge occurs.',
  '1. Keep surgical site clean and dry
2. Avoid heavy lifting for 4-6 weeks
3. Take prescribed medications as directed
4. Watch for signs of infection (redness, swelling, fever)
5. Gradually resume normal activities as tolerated'
),
(
  'Cardiac Care Discharge',
  'Cardiology',
  'Patient is being discharged with improved cardiac function. Medications adjusted. Lifestyle modifications discussed.',
  'Follow up with cardiologist in 2 weeks. Regular monitoring of blood pressure and heart rate required. Cardiac rehabilitation program recommended.',
  '1. Take all cardiac medications as prescribed
2. Monitor blood pressure daily
3. Follow low-sodium, heart-healthy diet
4. Avoid strenuous activities initially
5. Report chest pain, shortness of breath, or irregular heartbeat immediately'
),
(
  'Diabetes Management Discharge',
  'Endocrinology',
  'Patient discharged with controlled blood sugar levels. Diabetes education provided. Self-monitoring plan established.',
  'Follow up with endocrinologist in 2 weeks with blood sugar log. HbA1c test in 3 months. Annual eye and foot examination recommended.',
  '1. Monitor blood sugar levels as directed
2. Follow prescribed diabetic diet plan
3. Take medications/insulin as scheduled
4. Exercise regularly as advised
5. Inspect feet daily for any injuries or changes'
),
(
  'Maternity Discharge',
  'Obstetrics',
  'Mother and baby discharged in good health. Breastfeeding guidance provided. Postpartum care instructions given.',
  'Follow up with obstetrician in 6 weeks for postpartum check. Pediatric appointment for baby in 3-5 days. Lactation consultant available if needed.',
  '1. Rest adequately and accept help
2. Monitor for signs of postpartum complications
3. Continue prenatal vitamins
4. Pelvic rest for 6 weeks
5. Watch for baby feeding and diaper output'
),
(
  'Orthopedic Discharge',
  'Orthopedics',
  'Patient discharged following orthopedic procedure. Mobility aids provided. Physical therapy plan initiated.',
  'Follow up with orthopedic surgeon in 10-14 days. X-rays as scheduled. Physical therapy sessions as prescribed.',
  '1. Use mobility aids as instructed
2. Perform prescribed exercises
3. Ice and elevate affected area
4. Avoid weight-bearing as directed
5. Watch for signs of DVT (swelling, warmth, pain in calf)'
);

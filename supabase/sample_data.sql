-- Sample Data for ConsentLab
-- Run this AFTER running schema.sql to populate your database with test data

-- Insert sample hospital users
INSERT INTO hospital_users (email, password_hash, role, hospital_name, full_name) VALUES
('admin@hospital.com', 'password123', 'admin', 'City General Hospital', 'Dr. Admin User'),
('doctor1@hospital.com', 'password123', 'doctor', 'City General Hospital', 'Dr. Sarah Johnson'),
('doctor2@hospital.com', 'password123', 'doctor', 'City General Hospital', 'Dr. Rajesh Kumar'),
('officer@hospital.com', 'password123', 'consent_officer', 'City General Hospital', 'Ms. Priya Sharma');

-- Note: In production, use proper password hashing with bcrypt or similar

-- Insert sample patients (you'll need to replace the hospital_user_id with actual IDs from your database)
-- First, get the ID of a hospital user:
-- SELECT id FROM hospital_users WHERE email = 'doctor1@hospital.com';

-- Example patients (replace 'USER_ID_HERE' with actual UUID from hospital_users table)
/*
INSERT INTO patients (patient_id, patient_name, age, gender, disease, doctor_assigned, treatment_course, admission_date, expected_discharge_date, notes, hospital_user_id) VALUES
('CNLB-A1B2C3D4', 'Ramesh Patel', 45, 'Male', 'Appendicitis', 'Dr. Sarah Johnson', 'Emergency appendectomy surgery followed by 3-day observation and antibiotic treatment', '2024-01-15', '2024-01-20', 'Patient has mild diabetes, monitoring blood sugar levels', 'USER_ID_HERE'),
('CNLB-E5F6G7H8', 'Anita Desai', 32, 'Female', 'Breast Cancer', 'Dr. Rajesh Kumar', 'Chemotherapy - 6 cycles over 18 weeks, followed by radiation therapy', '2024-01-10', '2024-07-10', 'Family history of cancer, patient is responding well to treatment', 'USER_ID_HERE'),
('CNLB-I9J0K1L2', 'Mohammed Ali', 58, 'Male', 'Coronary Artery Disease', 'Dr. Sarah Johnson', 'Coronary angioplasty with stent placement, followed by cardiac rehabilitation', '2024-01-18', '2024-01-25', 'Previous heart attack 2 years ago, on blood thinners', 'USER_ID_HERE'),
('CNLB-M3N4O5P6', 'Lakshmi Iyer', 28, 'Female', 'Pregnancy - High Risk', 'Dr. Priya Menon', 'Prenatal care with close monitoring, planned C-section at 38 weeks', '2024-01-05', '2024-03-15', 'Gestational diabetes, twins pregnancy', 'USER_ID_HERE');
*/

-- Sample consent forms (replace patient_id with actual patient IDs from your database)
/*
INSERT INTO consent_forms (patient_id, form_type, content, summary, risk_level, risk_factors, doctor_signature) VALUES
(
  'CNLB-A1B2C3D4',
  'Emergency Appendectomy Consent',
  'I hereby consent to undergo emergency appendectomy surgery. I understand that this procedure involves the surgical removal of my appendix through a small incision in my abdomen. The procedure will be performed under general anesthesia. I have been informed of the nature of the procedure, its risks, benefits, and alternatives.',
  'You are consenting to emergency surgery to remove your appendix. The surgery will be done under general anesthesia through a small cut in your abdomen. Your doctor has explained the procedure and answered your questions.',
  'medium',
  ARRAY['Infection at surgical site', 'Bleeding during or after surgery', 'Adverse reaction to anesthesia', 'Injury to nearby organs', 'Blood clots'],
  'DR_SARAH_JOHNSON_20240115'
),
(
  'CNLB-E5F6G7H8',
  'Chemotherapy Treatment Consent',
  'I consent to receive chemotherapy treatment for breast cancer. I understand that chemotherapy involves the use of powerful drugs to kill cancer cells. The treatment will be administered intravenously over multiple sessions. I have been informed about potential side effects including nausea, hair loss, fatigue, increased infection risk, and potential long-term effects.',
  'You are agreeing to chemotherapy treatment for breast cancer. The medicine will be given through an IV over several sessions. Side effects may include feeling sick, losing hair, feeling very tired, and being more likely to get infections.',
  'high',
  ARRAY['Severe nausea and vomiting', 'Hair loss', 'Increased risk of infections', 'Fatigue and weakness', 'Potential organ damage', 'Fertility issues', 'Allergic reactions'],
  'DR_RAJESH_KUMAR_20240110'
);
*/

-- Additional consent templates (these are already in schema.sql, but here are more examples)
INSERT INTO consent_templates (template_name, procedure_type, content, risk_level) VALUES
(
  'MRI Scan Consent',
  'Diagnostic Imaging',
  'I consent to undergo Magnetic Resonance Imaging (MRI) scan. I understand that this is a non-invasive diagnostic procedure that uses magnetic fields and radio waves to create detailed images of my body. I have removed all metal objects and informed the staff of any implants or devices.',
  'low'
),
(
  'Cardiac Catheterization Consent',
  'Cardiac Procedure',
  'I consent to cardiac catheterization procedure. I understand that a thin tube will be inserted through a blood vessel in my groin or arm and guided to my heart. This procedure helps diagnose and sometimes treat heart conditions. I have been informed of the risks including bleeding, infection, heart attack, stroke, and allergic reactions to contrast dye.',
  'high'
),
(
  'Dental Extraction Consent',
  'Dental Surgery',
  'I consent to tooth extraction. I understand that this procedure involves the removal of one or more teeth. Local anesthesia will be used to numb the area. I have been informed about post-operative care and potential complications.',
  'low'
),
(
  'Endoscopy Consent',
  'Diagnostic Procedure',
  'I consent to undergo endoscopy examination. I understand that a flexible tube with a camera will be inserted through my mouth to examine my digestive system. Sedation will be provided for comfort. I have been informed about the risks including bleeding, perforation, and reaction to sedation.',
  'medium'
);

-- To use this file:
-- 1. First run schema.sql to create all tables
-- 2. Then run this file to insert sample data
-- 3. Update the USER_ID_HERE placeholders with actual UUIDs from your hospital_users table
-- 4. Update patient_id references in consent_forms with actual patient IDs

-- Query to get hospital user IDs (run this first):
-- SELECT id, email, full_name FROM hospital_users;

-- Query to get patient IDs (run this after inserting patients):
-- SELECT patient_id, patient_name FROM patients;

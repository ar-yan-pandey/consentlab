# Discharge Management System

## Overview
Complete discharge management system with billing, payment integration, and discharge summaries for ConsentLab.

---

## Features Implemented

### 🏥 **Hospital Portal**

#### 1. Discharge Patient Modal
- **Location:** `components/hospital/DischargePatientModal.tsx`
- **Access:** Discharge button (LogOut icon) in patient list
- **Features:**
  - Template-based or custom discharge summaries
  - Pre-existing templates for common conditions
  - Comprehensive discharge details form
  - Expense tracking with categories
  - Automatic bill calculation with tax and discount
  - Real-time total calculation

#### 2. Discharge Templates
- General Surgery Discharge
- Cardiac Care Discharge
- Diabetes Management Discharge
- Maternity Discharge
- Orthopedic Discharge

#### 3. Expense Categories
- Room Charges
- Doctor Consultation
- Nursing Care
- Medicines
- Laboratory Tests
- Radiology/Imaging
- Surgery/Procedure
- Medical Supplies
- Physiotherapy
- Other Services

#### 4. Discharge Form Fields
**Basic Information:**
- Discharge Date
- Discharge Condition (Stable, Improved, Recovered, Against Medical Advice)
- Diagnosis
- Treatment Given
- Follow-up Date

**Instructions:**
- Follow-up Instructions
- Precautions
- Diet Instructions
- Medication Instructions
- Further Course of Care

**Billing:**
- Multiple expenses with quantity
- Tax percentage (default 5%)
- Discount amount
- Automatic subtotal and total calculation

---

### 👤 **Patient Portal**

#### 1. Discharge View
- **Location:** `components/patient/DischargeView.tsx`
- **Access:** "View & Pay" button when discharge is ready
- **Features:**
  - Complete discharge summary display
  - Medical information with color-coded sections
  - Detailed billing breakdown
  - Razorpay payment integration
  - Download discharge summary
  - Payment status tracking

#### 2. Discharge Alert
- Prominent alert banner when discharge is ready
- Quick access to discharge summary
- Payment status indicator

#### 3. Payment Integration
- **Gateway:** Razorpay
- **Features:**
  - Secure payment processing
  - Payment ID tracking
  - Automatic status update
  - Patient discharge status change to "discharged"

---

## Database Schema

### Tables Created

#### 1. `discharge_templates`
```sql
- id (UUID, Primary Key)
- template_name (VARCHAR)
- disease_category (VARCHAR)
- discharge_instructions (TEXT)
- follow_up_instructions (TEXT)
- precautions (TEXT)
- diet_instructions (TEXT)
- medication_instructions (TEXT)
- created_at, updated_at (TIMESTAMP)
```

#### 2. `discharge_summaries`
```sql
- id (UUID, Primary Key)
- patient_id (VARCHAR, Foreign Key)
- discharge_date (DATE)
- diagnosis (TEXT)
- treatment_given (TEXT)
- discharge_condition (VARCHAR)
- follow_up_date (DATE)
- follow_up_instructions (TEXT)
- precautions (TEXT)
- diet_instructions (TEXT)
- medication_instructions (TEXT)
- further_care (TEXT)
- created_by (UUID, Foreign Key to hospital_users)
- created_at, updated_at (TIMESTAMP)
```

#### 3. `billing_expenses`
```sql
- id (UUID, Primary Key)
- discharge_summary_id (UUID, Foreign Key)
- expense_category (VARCHAR)
- expense_description (TEXT)
- amount (DECIMAL)
- quantity (INTEGER)
- created_at (TIMESTAMP)
```

#### 4. `discharge_bills`
```sql
- id (UUID, Primary Key)
- discharge_summary_id (UUID, Foreign Key)
- patient_id (VARCHAR, Foreign Key)
- subtotal (DECIMAL)
- tax_amount (DECIMAL)
- discount_amount (DECIMAL)
- total_amount (DECIMAL)
- payment_status (VARCHAR: pending, paid, partially_paid, cancelled)
- payment_method (VARCHAR)
- razorpay_order_id (VARCHAR)
- razorpay_payment_id (VARCHAR)
- paid_at (TIMESTAMP)
- created_at, updated_at (TIMESTAMP)
```

#### 5. Updated `patients` table
```sql
- discharge_status (VARCHAR: admitted, ready_for_discharge, discharged)
```

---

## Setup Instructions

### 1. Database Setup
Run the SQL schema in your Supabase SQL Editor:
```bash
# Run this file in Supabase SQL Editor
supabase/discharge_schema.sql
```

### 2. Environment Variables
Add Razorpay credentials to `.env.local`:
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 3. Razorpay Setup
1. Sign up at [Razorpay](https://razorpay.com/)
2. Get your API keys from Dashboard
3. Add keys to environment variables
4. Test with test mode keys first

---

## User Workflows

### Hospital Staff Workflow

1. **View Patient List**
   - Navigate to Hospital Dashboard
   - See all admitted patients

2. **Initiate Discharge**
   - Click discharge button (LogOut icon) for a patient
   - Discharge modal opens

3. **Select Template or Create New**
   - Choose from pre-existing templates
   - Or create custom discharge summary

4. **Fill Discharge Details**
   - Enter discharge date and condition
   - Add diagnosis and treatment details
   - Provide follow-up instructions
   - Add precautions and care instructions

5. **Add Billing Expenses**
   - Click "Add Expense" to add items
   - Select category and enter details
   - Specify quantity and amount
   - Add tax and discount if applicable

6. **Submit Discharge**
   - Review all information
   - Click "Create Discharge Summary"
   - Patient status changes to "ready_for_discharge"

### Patient Workflow

1. **Connect to Hospital**
   - Enter Patient ID
   - View patient profile

2. **See Discharge Alert**
   - Prominent banner appears when discharge is ready
   - Shows "Discharge Process Ready" message

3. **View Discharge Summary**
   - Click "View & Pay" button
   - Review complete discharge summary
   - See all medical instructions
   - View billing breakdown

4. **Make Payment**
   - Click "Pay ₹X,XXX.XX" button
   - Razorpay payment gateway opens
   - Complete payment securely
   - Receive confirmation

5. **Download Summary**
   - After payment, download button appears
   - Download discharge summary as text file
   - Keep for records

---

## Payment Flow

### Razorpay Integration

1. **Payment Initiation**
   - Patient clicks "Pay" button
   - Razorpay script loads dynamically
   - Payment modal opens

2. **Payment Processing**
   - Patient enters payment details
   - Razorpay processes payment
   - Returns payment ID on success

3. **Status Update**
   - Payment status updated to "paid"
   - Payment ID and timestamp recorded
   - Patient discharge status → "discharged"

4. **Confirmation**
   - Success toast notification
   - Payment details displayed
   - Download option enabled

---

## Security Features

### Data Protection
- Patient data encrypted in transit
- Secure payment gateway integration
- No card details stored locally

### Access Control
- Hospital staff can only discharge their patients
- Patients can only view their own discharge
- Payment verification through Razorpay

### Payment Security
- PCI DSS compliant (via Razorpay)
- Secure payment ID tracking
- Transaction verification

---

## UI/UX Features

### Modern Medical Theme
- Emerald/teal gradient accents
- Glass-morphism effects
- Medical pattern overlays
- Smooth animations
- Responsive design

### User-Friendly Interface
- Clear visual hierarchy
- Color-coded sections
- Icon-rich interface
- Loading states
- Error handling

### Accessibility
- WCAG AA compliant
- Keyboard navigation
- Screen reader support
- High contrast ratios

---

## Testing Checklist

### Hospital Portal
- [ ] Create discharge with template
- [ ] Create discharge without template
- [ ] Add multiple expenses
- [ ] Calculate tax and discount correctly
- [ ] Submit discharge successfully
- [ ] Verify patient status change

### Patient Portal
- [ ] See discharge alert
- [ ] View discharge summary
- [ ] See all medical details
- [ ] View billing breakdown
- [ ] Initiate payment
- [ ] Complete payment (test mode)
- [ ] Download summary

### Payment Integration
- [ ] Razorpay script loads
- [ ] Payment modal opens
- [ ] Test payment succeeds
- [ ] Status updates correctly
- [ ] Payment ID recorded
- [ ] Discharge status changes

---

## Customization Options

### Templates
Add more templates in `discharge_schema.sql`:
```sql
INSERT INTO discharge_templates (...) VALUES (...);
```

### Expense Categories
Modify `EXPENSE_CATEGORIES` array in `DischargePatientModal.tsx`

### Tax Rates
Change default tax percentage in modal state

### Payment Gateway
Replace Razorpay with other gateways by modifying `DischargeView.tsx`

---

## Troubleshooting

### Common Issues

**1. Discharge button not showing**
- Check if patient exists in database
- Verify hospital user permissions

**2. Payment not processing**
- Verify Razorpay keys in .env.local
- Check Razorpay dashboard for errors
- Ensure test mode is enabled for testing

**3. Discharge summary not loading**
- Check database connection
- Verify patient_id matches
- Check browser console for errors

**4. Download not working**
- Check browser popup blocker
- Verify file permissions
- Try different browser

---

## Future Enhancements

### Planned Features
- [ ] Email discharge summary to patient
- [ ] SMS notifications for discharge
- [ ] Multiple payment methods
- [ ] Partial payment support
- [ ] Insurance claim integration
- [ ] Prescription generation
- [ ] Follow-up appointment booking
- [ ] Discharge certificate PDF generation
- [ ] Multi-language support for summaries
- [ ] Analytics dashboard for discharge metrics

### API Integrations
- [ ] DigiLocker for document storage
- [ ] ABDM (Ayushman Bharat Digital Mission)
- [ ] Insurance provider APIs
- [ ] Pharmacy integration for medicines
- [ ] Lab report integration

---

## Support

For issues or questions:
1. Check this documentation
2. Review console errors
3. Check Supabase logs
4. Verify Razorpay dashboard
5. Contact development team

---

## Version History

### v1.0.0 (Current)
- Initial discharge management system
- Template-based discharge summaries
- Expense tracking and billing
- Razorpay payment integration
- Patient discharge view
- Download functionality

---

**Built with ❤️ for ConsentLab**

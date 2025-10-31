# ConsentLab 🏥

**Tagline:** "Understand. Trust. Consent."

A digital bridge that simplifies, secures, and personalizes medical consent for every Indian patient.

## 🌟 Features

### Patient Portal (/)
- **Upload Consent Forms**: Upload PDF or image files for AI-powered analysis
- **Scan Documents**: Use your camera to scan physical consent forms
- **Connect to Hospital**: Enter patient ID to access hospital records
- **Multi-Language Support**: Available in all major Indian languages
- **AI-Powered Analysis**: Automatic summarization and risk assessment
- **Interactive Chat**: Ask questions about consent forms in your language
- **Digital Signature**: Sign consent forms using DigiLocker integration

### Hospital Portal (/hospital)
- **Role-Based Access**: Admin, Doctor, and Consent Officer roles
- **Patient Management**: Full CRUD operations for patient records
- **Unique Patient IDs**: Auto-generated 8-digit alphanumeric IDs (CNLB-XXXXXXXX)
- **QR Code Generation**: Easy patient record sharing
- **Consent Management**: Create and manage consent forms
- **Template Library**: Pre-stored consent templates for common procedures
- **Real-time Dashboard**: Track patients, pending, and signed consents

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL)
- **AI**: Google Gemini 2.0 Flash
- **OCR**: Tesseract.js + Gemini Vision
- **UI Components**: Custom components with Lucide icons
- **State Management**: Zustand
- **QR Codes**: react-qr-code

## 📦 Installation

1. **Clone the repository**
   ```bash
   cd c:/Users/aryan/Desktop/Aryan/consent-lab
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase/schema.sql` in your Supabase SQL Editor
   - Get your project URL and anon key

4. **Configure environment variables**
   - Copy `.env.local.example` to `.env.local`
   - Fill in your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```

5. **Get Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env.local` file

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   - Patient Portal: [http://localhost:3000](http://localhost:3000)
   - Hospital Portal: [http://localhost:3000/hospital](http://localhost:3000/hospital)

## 🗄️ Database Setup

The database schema includes:
- `hospital_users` - Hospital staff authentication
- `patients` - Patient records with unique IDs
- `consent_forms` - Digital consent forms with AI analysis
- `consent_templates` - Pre-defined consent templates

Sample templates are automatically inserted for:
- General Surgery Consent
- Blood Transfusion Consent
- Chemotherapy Consent
- Diagnostic Procedure Consent

## 👥 Creating Hospital Users

To create a hospital user, run this SQL in your Supabase SQL Editor:

```sql
INSERT INTO hospital_users (email, password_hash, role, hospital_name, full_name)
VALUES (
  'doctor@hospital.com',
  'hashed_password_here', -- In production, use proper password hashing
  'doctor',
  'City General Hospital',
  'Dr. John Smith'
);
```

## 🎯 Usage Guide

### For Patients

1. **Upload a Consent Form**
   - Click "Upload Consent"
   - Drag & drop or select a PDF/image file
   - Wait for AI analysis
   - View simplified summary and risk assessment
   - Select your preferred language
   - Ask questions via chat assistant

2. **Scan a Physical Form**
   - Click "Scan Document"
   - Allow camera access
   - Position the document in frame
   - Capture and analyze

3. **Connect to Hospital**
   - Click "Connect Hospital"
   - Enter your patient ID (provided by hospital)
   - View your complete medical records
   - Access all consent forms
   - Sign forms digitally

### For Hospital Staff

1. **Login**
   - Navigate to `/hospital`
   - Enter credentials
   - Access dashboard

2. **Add Patient**
   - Click "Add New Patient"
   - Fill in patient details
   - System generates unique patient ID
   - Copy ID or generate QR code to share

3. **Manage Consent Forms**
   - View patient details
   - Click "Add Consent"
   - Use template or create custom form
   - AI automatically analyzes risk level
   - Share with patient via their ID

## 🌐 Supported Languages

- English
- Hindi (हिंदी)
- Bengali (বাংলা)
- Telugu (తెలుగు)
- Marathi (मराठी)
- Tamil (தமிழ்)
- Gujarati (ગુજરાતી)
- Kannada (ಕನ್ನಡ)
- Malayalam (മലയാളം)
- Punjabi (ਪੰਜਾਬੀ)
- Odia (ଓଡ଼ିଆ)
- Assamese (অসমীয়া)

## 🔒 Security Features

- Role-based access control
- Secure patient ID generation
- Encrypted data storage via Supabase
- Digital signature verification
- HIPAA-compliant data handling

## 🤖 AI Features

- **OCR Text Extraction**: Extract text from images and PDFs
- **Intelligent Summarization**: Convert complex medical terms to plain language
- **Risk Assessment**: Automatic risk level detection (Low/Medium/High)
- **Risk Factor Identification**: Highlight key risks and complications
- **Multi-Language Translation**: Real-time translation to Indian languages
- **Interactive Q&A**: Context-aware chatbot for patient questions

## 📱 Responsive Design

ConsentLab is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🛠️ Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 📄 License

This project is built for educational and healthcare purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📞 Support

For support and queries, please contact your system administrator.

---

**Built with ❤️ for better healthcare consent management in India**

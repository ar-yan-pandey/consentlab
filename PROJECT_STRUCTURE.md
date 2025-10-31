# ConsentLab - Project Structure

## 📁 Directory Structure

```
consent-lab/
├── app/                          # Next.js App Router
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Patient home page (/)
│   └── hospital/                # Hospital portal routes
│       ├── page.tsx             # Hospital login (/hospital)
│       └── dashboard/
│           └── page.tsx         # Hospital dashboard (/hospital/dashboard)
│
├── components/                   # React components
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.tsx           # Button component
│   │   ├── Input.tsx            # Input component
│   │   ├── Card.tsx             # Card component
│   │   └── Modal.tsx            # Modal component
│   │
│   ├── patient/                 # Patient portal components
│   │   ├── UploadConsent.tsx   # Upload consent form
│   │   ├── ScanConsent.tsx     # Scan with camera
│   │   ├── ConnectHospital.tsx # Connect via patient ID
│   │   └── ConsentViewer.tsx   # View and interact with consent
│   │
│   └── hospital/                # Hospital portal components
│       ├── PatientList.tsx      # List all patients
│       ├── AddPatientModal.tsx  # Add new patient
│       ├── EditPatientModal.tsx # Edit patient details
│       ├── PatientDetailsModal.tsx # View patient details
│       └── AddConsentModal.tsx  # Create consent form
│
├── lib/                         # Utility libraries
│   ├── supabase.ts             # Supabase client & types
│   ├── gemini.ts               # Gemini AI functions
│   ├── utils.ts                # Helper functions
│   └── store.ts                # Zustand state management
│
├── supabase/                    # Database files
│   ├── schema.sql              # Database schema
│   └── sample_data.sql         # Sample test data
│
├── .env.local.example          # Environment variables template
├── .gitignore                  # Git ignore rules
├── next.config.mjs             # Next.js configuration
├── package.json                # Dependencies
├── postcss.config.mjs          # PostCSS configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── README.md                   # Project documentation
├── SETUP_GUIDE.md              # Setup instructions
└── PROJECT_STRUCTURE.md        # This file
```

## 🔑 Key Files Explained

### Configuration Files

- **`package.json`**: Lists all npm dependencies and scripts
- **`tsconfig.json`**: TypeScript compiler configuration
- **`tailwind.config.ts`**: Tailwind CSS theme and customization
- **`next.config.mjs`**: Next.js framework configuration
- **`.env.local`**: Environment variables (create from .env.local.example)

### Core Application Files

#### App Router (`app/`)
- **`layout.tsx`**: Root layout wrapper for all pages
- **`page.tsx`**: Patient portal home page
- **`hospital/page.tsx`**: Hospital login page
- **`hospital/dashboard/page.tsx`**: Hospital dashboard

#### UI Components (`components/ui/`)
- **`Button.tsx`**: Reusable button with variants (primary, secondary, outline, danger)
- **`Input.tsx`**: Form input with label and error handling
- **`Card.tsx`**: Container component with shadow and hover effects
- **`Modal.tsx`**: Overlay modal dialog

#### Patient Components (`components/patient/`)
- **`UploadConsent.tsx`**: Drag-and-drop file upload with AI analysis
- **`ScanConsent.tsx`**: Webcam integration for document scanning
- **`ConnectHospital.tsx`**: Patient ID entry and record retrieval
- **`ConsentViewer.tsx`**: Display consent with translation, chat, and signing

#### Hospital Components (`components/hospital/`)
- **`PatientList.tsx`**: Searchable table of patients with actions
- **`AddPatientModal.tsx`**: Form to create new patient records
- **`EditPatientModal.tsx`**: Form to update patient information
- **`PatientDetailsModal.tsx`**: View patient profile and consent forms
- **`AddConsentModal.tsx`**: Create consent forms with templates

### Library Files (`lib/`)

#### `supabase.ts`
- Supabase client initialization
- TypeScript database types
- Table definitions for type safety

#### `gemini.ts`
- **`extractTextFromImage()`**: OCR from images using Gemini Vision
- **`summarizeConsent()`**: AI-powered consent summarization
- **`translateText()`**: Multi-language translation
- **`answerConsentQuestion()`**: Interactive Q&A chatbot

#### `utils.ts`
- **`generatePatientId()`**: Creates unique CNLB-XXXXXXXX IDs
- **`formatDate()`**: Date formatting for Indian locale
- **`getRiskColor()`**: Color coding for risk levels
- **`INDIAN_LANGUAGES`**: List of supported languages

#### `store.ts`
- **`useHospitalStore`**: Hospital user authentication state
- **`usePatientStore`**: Patient consent data and language preference

### Database Files (`supabase/`)

#### `schema.sql`
Creates four main tables:
1. **`hospital_users`**: Hospital staff accounts
2. **`patients`**: Patient records with unique IDs
3. **`consent_forms`**: Digital consent forms with AI analysis
4. **`consent_templates`**: Pre-defined consent templates

#### `sample_data.sql`
- Sample hospital users
- Example patients
- Test consent forms
- Additional templates

## 🎨 Styling

- **TailwindCSS**: Utility-first CSS framework
- **Custom Colors**: Primary blue theme with variants
- **Responsive Design**: Mobile-first approach
- **Dark Mode Ready**: CSS variables for theme switching

## 🔐 Authentication Flow

### Hospital Portal
1. User enters email/password at `/hospital`
2. Credentials verified against `hospital_users` table
3. User data stored in Zustand store
4. Redirected to `/hospital/dashboard`
5. Protected routes check for user in store

### Patient Portal
- No authentication required
- Direct access to all features
- Patient ID acts as access key for records

## 🤖 AI Integration Points

### Gemini 2.0 Flash API
1. **Image OCR**: Extract text from uploaded/scanned documents
2. **Content Analysis**: Summarize consent forms in plain language
3. **Risk Assessment**: Determine risk level (low/medium/high)
4. **Risk Identification**: Extract key risk factors
5. **Translation**: Convert to 12 Indian languages
6. **Q&A Chat**: Answer patient questions contextually

## 📊 Data Flow

### Patient Uploads Consent
```
Upload File → Extract Text (Gemini) → Summarize (Gemini) 
→ Display Summary → Translate (optional) → Chat Q&A → Sign
```

### Hospital Creates Consent
```
Select Patient → Choose Template/Create New → AI Analysis 
→ Store in Database → Generate Patient ID/QR → Share with Patient
```

### Patient Connects to Hospital
```
Enter Patient ID → Fetch from Database → Display Profile 
→ Show Consent Forms → View/Translate/Sign
```

## 🔄 State Management

### Zustand Stores

**Hospital Store:**
- Current logged-in user
- Role and permissions
- Logout function

**Patient Store:**
- Current consent data
- Selected language
- Translation cache

## 🚀 API Routes

This project uses Supabase for backend, so no custom API routes needed.

All database operations are done via Supabase client:
- `supabase.from('table').select()`
- `supabase.from('table').insert()`
- `supabase.from('table').update()`
- `supabase.from('table').delete()`

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

All components are responsive using Tailwind's breakpoint prefixes:
- `sm:` - Small screens and up
- `md:` - Medium screens and up
- `lg:` - Large screens and up

## 🧪 Testing Checklist

### Patient Portal
- [ ] Upload PDF consent form
- [ ] Upload image consent form
- [ ] Scan document with webcam
- [ ] Connect using patient ID
- [ ] View patient profile
- [ ] Translate to different languages
- [ ] Ask questions via chat
- [ ] Sign consent digitally

### Hospital Portal
- [ ] Login with credentials
- [ ] View dashboard statistics
- [ ] Add new patient
- [ ] Edit patient details
- [ ] Delete patient
- [ ] Generate patient ID
- [ ] Generate QR code
- [ ] Create consent form
- [ ] Use consent template
- [ ] Search patients

## 🔧 Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=          # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Your Supabase anon key
NEXT_PUBLIC_GEMINI_API_KEY=        # Your Gemini API key
```

## 📦 Dependencies Overview

### Core
- `next`: React framework
- `react`: UI library
- `typescript`: Type safety

### Backend
- `@supabase/supabase-js`: Database client

### AI
- `@google/generative-ai`: Gemini API
- `tesseract.js`: OCR fallback

### UI
- `tailwindcss`: Styling
- `lucide-react`: Icons
- `react-qr-code`: QR generation
- `react-dropzone`: File upload
- `react-webcam`: Camera access

### State
- `zustand`: State management

### Utilities
- `date-fns`: Date formatting
- `clsx` + `tailwind-merge`: Class management

## 🎯 Next Steps for Production

1. **Security**
   - Implement proper password hashing (bcrypt)
   - Add JWT authentication
   - Enable Row Level Security in Supabase
   - Add CSRF protection

2. **Features**
   - Email notifications
   - SMS alerts
   - PDF generation
   - Audit logs
   - Analytics dashboard

3. **Integration**
   - Real DigiLocker API
   - Payment gateway
   - Hospital management systems
   - Insurance providers

4. **Performance**
   - Image optimization
   - Lazy loading
   - Caching strategy
   - CDN for static assets

5. **Compliance**
   - HIPAA compliance
   - GDPR compliance
   - Data encryption
   - Backup strategy

---

**Project Status**: ✅ Complete and Ready for Development

# ConsentLab - Quick Setup Guide

## Step-by-Step Setup Instructions

### 1. Install Dependencies

Open PowerShell in the project directory and run:

```powershell
npm install
```

### 2. Set Up Supabase

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new account (if you don't have one)
3. Click "New Project"
4. Fill in project details:
   - Name: ConsentLab
   - Database Password: (create a strong password)
   - Region: Choose closest to India
5. Wait for project to be created (~2 minutes)

### 3. Run Database Schema

1. In your Supabase project, click on "SQL Editor" in the left sidebar
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into the SQL editor
5. Click "Run" (or press Ctrl+Enter)
6. You should see "Success. No rows returned"

### 4. Get Your Supabase Credentials

1. In Supabase, click on "Settings" (gear icon) in the left sidebar
2. Click on "API" under Project Settings
3. Copy the following:
   - **Project URL** (under Project URL)
   - **anon public** key (under Project API keys)

### 5. Get Gemini API Key

1. Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Select "Create API key in new project" or choose existing project
5. Copy the generated API key

### 6. Configure Environment Variables

1. In the project root, create a file named `.env.local`
2. Copy the following and replace with your actual values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Gemini AI Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# DigiLocker Configuration (Optional - for future use)
NEXT_PUBLIC_DIGILOCKER_CLIENT_ID=
NEXT_PUBLIC_DIGILOCKER_CLIENT_SECRET=
```

### 7. Create a Test Hospital User

Run this SQL in Supabase SQL Editor:

```sql
INSERT INTO hospital_users (email, password_hash, role, hospital_name, full_name)
VALUES (
  'admin@hospital.com',
  'password123',  -- In production, use proper password hashing
  'admin',
  'City General Hospital',
  'Dr. Admin User'
);
```

### 8. Start the Development Server

```powershell
npm run dev
```

### 9. Access the Application

- **Patient Portal**: [http://localhost:3000](http://localhost:3000)
- **Hospital Portal**: [http://localhost:3000/hospital](http://localhost:3000/hospital)

### 10. Test the Hospital Portal

1. Go to [http://localhost:3000/hospital](http://localhost:3000/hospital)
2. Login with:
   - Email: `admin@hospital.com`
   - Password: `password123`
3. Add a test patient
4. Copy the generated Patient ID
5. Create a consent form for the patient

### 11. Test the Patient Portal

1. Go to [http://localhost:3000](http://localhost:3000)
2. Try all three options:
   - **Upload**: Upload a sample consent form image/PDF
   - **Scan**: Use your webcam to scan a document
   - **Connect**: Enter the Patient ID from step 10

## Troubleshooting

### Issue: "npm install" fails
**Solution**: Make sure you have Node.js 18+ installed. Download from [nodejs.org](https://nodejs.org)

### Issue: Supabase connection error
**Solution**: 
- Check your `.env.local` file has correct credentials
- Ensure there are no extra spaces in the values
- Restart the dev server after changing `.env.local`

### Issue: Gemini API error
**Solution**:
- Verify your API key is correct
- Check you have API quota remaining
- Ensure the API key has Gemini API enabled

### Issue: Camera not working for scan
**Solution**:
- Allow camera permissions in your browser
- Use HTTPS or localhost (required for camera access)
- Check if another app is using the camera

### Issue: "Module not found" errors
**Solution**:
```powershell
rm -r node_modules
rm package-lock.json
npm install
```

## Production Deployment

### Build for Production

```powershell
npm run build
npm start
```

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy!

### Important for Production

1. **Password Hashing**: Implement proper password hashing (bcrypt)
2. **Authentication**: Add JWT tokens or Supabase Auth
3. **Rate Limiting**: Add rate limiting for API calls
4. **Error Handling**: Implement comprehensive error handling
5. **Logging**: Add proper logging for debugging
6. **HTTPS**: Always use HTTPS in production
7. **CORS**: Configure CORS properly
8. **DigiLocker**: Integrate actual DigiLocker API for signatures

## Features to Test

### Patient Side
- ✅ Upload PDF consent form
- ✅ Upload image consent form
- ✅ Scan physical document with camera
- ✅ Connect using Patient ID
- ✅ View patient profile
- ✅ View consent forms
- ✅ Translate to different languages
- ✅ Ask questions via chat
- ✅ Sign consent digitally

### Hospital Side
- ✅ Login to hospital portal
- ✅ View dashboard with statistics
- ✅ Add new patient
- ✅ Edit patient details
- ✅ Delete patient
- ✅ Generate Patient ID
- ✅ Generate QR code
- ✅ Copy Patient ID
- ✅ Create consent form
- ✅ Use consent template
- ✅ View consent details
- ✅ Search patients

## Support

If you encounter any issues:
1. Check the browser console for errors (F12)
2. Check the terminal for server errors
3. Verify all environment variables are set
4. Ensure Supabase database is running
5. Check Gemini API quota

## Next Steps

1. Customize the UI with your branding
2. Add more consent templates
3. Implement proper authentication
4. Add email notifications
5. Integrate DigiLocker for legal signatures
6. Add analytics and reporting
7. Implement audit logs
8. Add patient consent history

---

**Happy Coding! 🚀**

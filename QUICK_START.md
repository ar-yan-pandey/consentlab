# ConsentLab - Quick Start Guide 🚀

Get ConsentLab running in **5 minutes**!

## Step 1: Install Dependencies (1 min)

```powershell
npm install
```

## Step 2: Set Up Supabase (2 min)

1. Go to [supabase.com](https://supabase.com) → Create account → New Project
2. In SQL Editor, paste contents of `supabase/schema.sql` → Run
3. Go to Settings → API → Copy **Project URL** and **anon key**

## Step 3: Get Gemini API Key (1 min)

1. Visit [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Create API Key → Copy it

## Step 4: Configure Environment (30 sec)

Create `.env.local` file in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key_here
```

## Step 5: Create Test User (30 sec)

In Supabase SQL Editor, run:

```sql
INSERT INTO hospital_users (email, password_hash, role, hospital_name, full_name)
VALUES ('admin@hospital.com', 'password123', 'admin', 'Test Hospital', 'Admin User');
```

## Step 6: Start the App! 🎉

```powershell
npm run dev
```

**Open in browser:**
- Patient Portal: http://localhost:3000
- Hospital Portal: http://localhost:3000/hospital (login: admin@hospital.com / password123)

---

## 🎯 What to Try First

### As Hospital Staff:
1. Login at `/hospital`
2. Click "Add New Patient"
3. Fill details → Copy the generated Patient ID
4. Click on patient → "Add Consent"
5. Use a template or write custom consent

### As Patient:
1. Go to home page `/`
2. Click "Connect Hospital"
3. Enter the Patient ID from above
4. View your profile and consent forms
5. Try translating to Hindi or other languages
6. Ask questions via chat

---

## 📚 Need More Help?

- **Full Setup**: See `SETUP_GUIDE.md`
- **Project Structure**: See `PROJECT_STRUCTURE.md`
- **Deployment**: See `DEPLOYMENT_CHECKLIST.md`
- **General Info**: See `README.md`

---

## 🐛 Common Issues

**"Module not found" errors?**
```powershell
rm -r node_modules
npm install
```

**Supabase connection error?**
- Check `.env.local` has correct values
- Restart dev server: Ctrl+C then `npm run dev`

**Gemini API error?**
- Verify API key is correct
- Check you have quota remaining

---

## 🎊 You're All Set!

ConsentLab is now running. Start exploring the features!

**Questions?** Check the other documentation files in this project.

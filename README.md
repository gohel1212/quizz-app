# 🎓 Career Decision Quiz — Lead Generation Platform

A complete quiz platform to generate qualified leads from LinkedIn, with certificates, admin CMS, and one-click Vercel deployment.

---

## ✅ Features

- **Lead capture form** (Name, College, Mobile, Email)
- **10 MCQ career quiz** with 5-minute timer
- **Pass/Fail logic** (default: 7/10 to pass)
- **One attempt only** — blocked by email + mobile
- **Participation certificate** with auto-injected student name (SVG)
- **Free demo link** shown only to students who pass
- **Admin CMS panel** — manage questions, view leads, export CSV, update settings
- **Vercel-ready** — deploys in minutes

---

## 🚀 Deploy to Vercel — Step-by-Step

### Step 1: Set Up Database (Supabase — Free)

1. Go to **supabase.com** → Create a new project
2. Note your project name (you'll need it)
3. Go to **Settings → Database → Connection String (URI)**
4. Copy the URI — it looks like:
   ```
   postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres
   ```

### Step 2: Push This Code to GitHub

```bash
cd quiz-app
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/career-quiz.git
git push -u origin main
```

### Step 3: Deploy on Vercel

1. Go to **vercel.com** → Sign in with GitHub
2. Click **"Add New Project"**
3. Select your `career-quiz` repository → click **Import**
4. Under **Environment Variables**, add these:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Supabase connection string |
| `ADMIN_PASSWORD` | Your chosen admin password |
| `JWT_SECRET` | Any random 32-char string |
| `NEXT_PUBLIC_APP_URL` | Will be your Vercel URL (add after first deploy) |

5. Click **Deploy** → Wait ~2 minutes → 🎉 Your site is live!

### Step 4: Set Up Database Tables

After deploying, run database migrations:

**Option A — Via Vercel CLI:**
```bash
npm install -g vercel
vercel env pull .env.local
npx prisma db push
node prisma/seed.js
```

**Option B — Via Supabase SQL Editor:**
Copy the SQL from `prisma/schema.prisma` and run the equivalent CREATE TABLE statements.

### Step 5: Add Certificate Template

Upload your `Seminar_Certificate_Demo__1_.svg` file to the `/public/` folder and rename it to:
```
public/certificate-template.svg
```

### Step 6: Update Demo Link

1. Go to `yoursite.vercel.app/admin`
2. Login with username `admin` and your `ADMIN_PASSWORD`
3. Click **Settings** → paste your demo link → Save

---

## 📁 Project Structure

```
quiz-app/
├── app/
│   ├── page.js              ← Landing + Lead Form
│   ├── quiz/page.js         ← Quiz (10 MCQ)
│   ├── result/page.js       ← Result + Certificate download
│   ├── admin/
│   │   ├── page.js          ← Admin Login
│   │   └── dashboard/page.js ← CMS Dashboard
│   └── api/
│       ├── submit-form/     ← Create lead
│       ├── questions/       ← Fetch questions (no answers!)
│       ├── submit-quiz/     ← Score & save attempt
│       ├── certificate/     ← Generate SVG with name
│       └── admin/           ← Protected admin APIs
├── lib/
│   ├── prisma.js            ← DB client
│   └── adminAuth.js         ← JWT verification
├── prisma/
│   ├── schema.prisma        ← Database schema
│   └── seed.js              ← 10 sample questions + admin
└── public/
    └── certificate-template.svg  ← YOUR certificate file
```

---

## 🔗 LinkedIn Strategy

1. **Post publicly**: "Test your career readiness! Take my 10-question quiz and earn a certificate 🎓 → [your-link]"
2. **Send personally**: DM the link to target students/freshers
3. **Track**: Every person who fills the form = a lead in your admin panel
4. **Follow up**: Export CSV from admin → contact qualified leads (passed) about your course/service

---

## 🔐 Admin Panel

URL: `yoursite.vercel.app/admin`
- Default username: `admin`
- Password: whatever you set in `ADMIN_PASSWORD`

**Features:**
- View all leads with pass/fail status
- Filter by: All / Attempted / Passed / Failed
- Export CSV for follow-up outreach
- Add/Edit/Delete quiz questions
- Set pass threshold and demo link

---

## 🛠 Local Development

```bash
npm install
cp .env.example .env.local
# Fill in your DATABASE_URL and other vars

npx prisma db push
node prisma/seed.js

npm run dev
# Open http://localhost:3000
```

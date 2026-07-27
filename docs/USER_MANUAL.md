# User Manual

**Product:** AI Personalized Learning System (AI Learning Companion)  
**Document Type:** Final Year Project (FYP) – User Manual  
**Audience:** Students (end users) and Administrators

---

## 1. Introduction

AI Personalized Learning System is a web application that helps students improve weak topics by:

1. Uploading a scanned/photographed exam paper  
2. Analyzing answers using AI (OCR + evaluation)  
3. Receiving personalized tutoring  
4. Taking a practice quiz  
5. Viewing performance insights over time  

The system works on **desktop and mobile browsers**.

---

## 2. System Requirements

| Item | Recommendation |
|------|----------------|
| Browser | Chrome, Edge, Firefox, or Safari (latest version) |
| Internet | Stable connection required (AI analysis may take 1–3 minutes) |
| Device | Desktop, laptop, tablet, or mobile phone |
| Image format | JPG / JPEG / PNG |
| Image quality | Clear, well-lit photo of the exam paper |

---

## 3. Getting Started

### 3.1 Open the application

Open the deployed URL in your browser (VM IP, domain, or ngrok HTTPS link provided by the project team).

### 3.2 Create an account (Register)

1. Go to the **Register** page.  
2. Enter your **Name**, **Email**, and **Password**.  
3. (Optional) Upload a profile picture.  
4. Submit the form.  
5. Enter the **OTP** sent to your email to verify the account.  
6. After verification, you can log in.

**Password tip:** Use a strong password (upper/lowercase letters, number, and special character).

### 3.3 Login

You can sign in using either method:

#### Option A – Email & password
1. Open the **Login** page.  
2. Enter email and password.  
3. Click **Login**.

#### Option B – Google Login
1. Click **Sign in with Google**.  
2. Choose your Google account.  
3. Allow access when prompted.  
4. You will be redirected back into the app.

### 3.4 Forgot password

1. On the Login page, click **Forgot Password**.  
2. Enter your registered email.  
3. Open the reset link from your email.  
4. Set a new password and save.

### 3.5 Auto logout

For security, the system may log you out after **15 minutes of inactivity**. Simply log in again to continue.

---

## 4. Main Navigation

After login, use the top menu:

| Menu item | Purpose |
|-----------|---------|
| **Dashboard** | View profile and overview |
| **Upload** | Upload exam paper, analyze, learn, take quiz |
| **Insights** | View performance statistics and AI feedback |
| **About** | Project / team information |
| **Contact** | Send a message to the team |
| **Logout** | Sign out and clear session |

On **mobile**, open the **hamburger menu (☰)** to access the same links.

---

## 5. Dashboard

The Dashboard shows:

- Your **profile picture**, name, and student role  
- Option to **Edit** profile  
- Learning progress / feedback cards (overview area)

### Edit profile

1. Click **Edit**.  
2. Update your name.  
3. (Optional) Change password (current + new password).  
4. (Optional) Change profile image.  
5. Save changes.

---

## 6. Upload & Analyze Exam Paper (Core Feature)

This is the main learning workflow.

### Step 1 – Upload image

1. Open **Upload** from the menu.  
2. Drag and drop an exam image, or click to select a file.  
3. Preview the image if shown.  
4. Click **Analyze** (or the equivalent analyze button).

**Tips for best results**

- Use a clear photo (no blur)  
- Capture the full question area  
- Prefer good lighting and high contrast  
- Avoid heavy shadows or tilted pages  

### Step 2 – Wait for AI analysis

The system will:

1. Upload the image to the backend  
2. Send it to the Python AI service  
3. Detect question regions (YOLO)  
4. Read text (OCR)  
5. Evaluate answers using AI  
6. Identify weak topics  

This process can take **about 1–3 minutes**. Do not close the browser tab while it is running.

### Step 3 – Review results

After analysis you may see:

- Summary cards (overall result indicators)  
- **Weak topics** list  
- AI **recommendations** for what to study next  

### Step 4 – Start personalized teaching

1. Click **Start Teaching** / Teach button (if shown).  
2. The AI Tutor panel opens.  
3. Read the explanation for your weak topics.  
4. Ask follow-up questions in the chat box.  
5. Continue until you understand the topic.

### Step 5 – Take a practice quiz

1. From the tutor panel, click **Start Quiz**.  
2. Answer each multiple-choice question.  
3. Use Next / Previous if available.  
4. Submit the quiz when finished.  
5. Review your score, mistakes, and final tutor notes.

---

## 7. Insights

Open **Insights** to view learning progress based on your quiz history, such as:

- Performance level  
- Average / latest / best scores  
- Improvement trend  
- Weak topics summary  
- AI-generated insights and advice  

If no quizzes are submitted yet, the page may show “No Data”. Complete at least one quiz after analysis to populate insights.

---

## 8. Contact

1. Open **Contact**.  
2. Fill in Name, Email, Subject, and Message.  
3. Click Send.  
4. Wait for confirmation that the message was submitted.

Administrators can later view these messages in the Admin panel.

---

## 9. About

The **About** page provides information about the project mission and team. No action is required here; it is informational.

---

## 10. Administrator Guide

Admin features are available at:

`/admin/login`

### 10.1 Admin login

1. Open `/admin/login`.  
2. Enter admin email and password.  
3. Access the admin dashboard.

### 10.2 Admin Dashboard

Shows high-level statistics (for example users and messages).

### 10.3 Manage Users (`/admin/users`)

Admins can:

- View all users  
- Filter by role / status (All, Active, Inactive)  
- Add a new user  
- Edit user details  
- Update user status  
- Delete users (as configured)

### 10.4 Manage Contacts (`/admin/contacts`)

Admins can:

- View messages submitted from the Contact page  
- Review sender details and message content  
- Delete messages if needed  

On mobile, the admin table can be scrolled horizontally.

---

## 11. Mobile Usage

The application is responsive and can be used on phones:

1. Open the site URL in your mobile browser.  
2. Tap the **menu icon (☰)** to navigate.  
3. Upload an exam photo taken from your camera gallery.  
4. Continue tutor chat and quiz as on desktop.

For AI analysis on mobile, keep the screen on and wait until processing finishes.

---

## 12. Troubleshooting

| Problem | What to try |
|---------|-------------|
| Cannot login | Check email/password; try Forgot Password; verify OTP if newly registered |
| Google login fails | Ensure you are using the official deployed/ngrok URL; ask admin to verify OAuth redirect settings |
| OTP email not received | Check spam/junk folder; wait 1–2 minutes; request OTP again if available |
| Analyze fails / timeout | Use a clearer/smaller image; wait longer; check internet; ask admin if AI service is running |
| Image not uploading | Use JPG/PNG; keep file size reasonable; retry |
| Blank Insights page | Complete at least one quiz first |
| Session ended suddenly | Auto-logout after inactivity — log in again |
| Page looks broken on phone | Refresh; use latest Chrome/Safari; open hamburger menu for navigation |

---

## 13. Typical Student Workflow (Quick Checklist)

1. Register → verify OTP → Login  
2. Go to **Upload**  
3. Upload exam image → **Analyze**  
4. Review weak topics  
5. Start **AI Tutor** and ask questions  
6. Take **Quiz** and check score  
7. Open **Insights** to track improvement  
8. Logout when finished  

---

## 14. Privacy & Safety Notes

- Keep your login credentials private.  
- Do not share OTP codes.  
- Upload only your own exam material for learning purposes.  
- Log out on shared/public devices.

---

## 15. Support

If you face issues during demonstration or daily use:

1. Use the in-app **Contact** form, or  
2. Contact the project team / supervisor channel provided by your institution.

---

*End of User Manual*

# PerplexitySchool - Product Roadmap

**Last Updated:** 2025-10-23

---

## 📊 RELEASE STATUS

### ✅ COMPLETED
- [x] i18n support (7 languages: EN, RU, PL, UK, ES, FR, DE)
- [x] Language switcher in burger menu
- [x] Favicon updated
- [x] Basic auth & registration flow
- [x] Dashboard structure
- [x] Admin panel (basic)

### 🔄 IN PROGRESS
- [ ] Admin access control & security
- [ ] Registration UX improvements

### ⏳ PLANNED
See phases below

---

## 🎯 PHASE 1: MVP - PRE-LAUNCH (CRITICAL)
**Goal:** Secure, functional platform ready for first users
**Timeline:** Before first release

### 🔴 PRIORITY 1 - Security & Access Control

#### Task #2: Admin Panel Protection
**Status:** ❌ Not Started  
**Priority:** CRITICAL ⚡  
**Complexity:** Medium

**Requirements:**
1. Check user role on login (if role === 'admin', show Admin button in header)
2. Protect `/admin` route - redirect non-admins to dashboard
3. Add middleware/route guard to prevent URL manipulation
4. Admin can promote any user to admin role from admin panel

**Technical approach:**
```typescript
// middleware/auth.ts
- checkUserRole() before rendering admin routes
- useEffect in AdminPanel: verify role, redirect if not admin

// Header.tsx  
- Show "Admin" button only if user.role === 'admin'

// AdminPanel.tsx
- Add "Promote to Admin" button for each user
```

**Security considerations:**
- Never trust client-side role checks alone
- Supabase RLS policies must enforce role-based access
- API calls should validate role server-side

---

### 🟡 PRIORITY 2 - UX Improvements

#### Task #1: Registration Success Feedback
**Status:** ❌ Not Started  
**Priority:** High  
**Complexity:** Low

**Problem:** Users miss confirmation email notice

**Solution:**
- After registration, show prominent modal/alert:
  - "✅ Registration successful!"  
  - "📧 Check your email for confirmation link"  
  - "⚠️ Link expires in 24 hours"  
- Use bright color (green), large text, auto-focus
- Don't allow dismissal for 3-5 seconds

**Files to modify:**
- `src/pages/Auth.tsx` - add success state & modal
- `src/locales/*/translation.json` - add keys:
  - `registration.success.title`
  - `registration.success.checkEmail`
  - `registration.success.expiresIn`

---

#### Task #8: Navigation - Back Button
**Status:** ❌ Not Started  
**Priority:** High  
**Complexity:** Low

**Problem:** No way to go back from Lessons → Dashboard (except browser back)

**Solution:**
- Add "← Back" button in:
  - Lessons page (top-left)
  - Individual Lesson view  
  - Any deep nested page
- Use `useNavigate()` from react-router-dom
- Styled consistently across all pages

**Files to create:**
- `src/components/BackButton.tsx` - reusable component

**Files to modify:**
- `src/pages/Lessons.tsx`
- Future: LessonView, PerplexityPro, etc.

---

#### Task #7: Remove Home Link from Dashboard
**Status:** ❌ Not Started  
**Priority:** Medium  
**Complexity:** Very Low

**Requirement:**  
Once logged in, user cannot return to landing page except via Logout

**Solution:**
- Remove any "Home" / "Main Page" links from authenticated views
- Header should only show: Dashboard, Lessons, Profile, Logout
- Landing page (/) should redirect to /dashboard if authenticated

**Files to modify:**
- `src/components/Header.tsx` - remove home link for auth users
- `src/pages/Index.tsx` - add redirect if authenticated

---

### 🟢 PRIORITY 3 - Polish & Branding

#### Task #14: Language Selector with Flags
**Status:** 🔄 Partially Done (i18n works, need UI)  
**Priority:** Medium  
**Complexity:** Low

**Current state:** Language switching works, but UI is text-based

**Enhancement:**
- Replace text dropdown with circular flag icons
- Flags: 🇬🇧 EN | 🇵🇱 PL | 🇷🇺 RU | 🇺🇦 UK | 🇩🇪 DE | 🇪🇸 ES | 🇫🇷 FR
- Tooltip on hover showing language name
- Smooth transition animation

**Implementation:**
- Use flag icons from: `country-flag-icons` npm package
- Or custom SVG flags in `/public/flags/`

**Files to modify:**
- `src/components/BurgerMenu.tsx` - replace language selector UI
- Add CSS for circular flag buttons

---

#### Task #4: Custom Email Domain
**Status:** ❌ Not Started  
**Priority:** Medium (Important for trust)  
**Complexity:** Medium

**Goal:** Emails sent from `noreply@perplexityschool.pl` instead of Supabase default

**Steps:**
1. Configure DNS records for `perplexityschool.pl`:
   - Add SPF record
   - Add DKIM record  
   - Add DMARC record
2. In Supabase dashboard:
   - Settings → Auth → SMTP Settings  
   - Configure custom SMTP (can use SendGrid, Mailgun, or custom)
3. Test email delivery

**Resources:**
- Supabase SMTP docs: https://supabase.com/docs/guides/auth/auth-smtp
- SendGrid/Mailgun free tier should be enough initially

**Note:** This improves deliverability and trust significantly

---

## 🎨 PHASE 2: CONTENT & CORE FEATURES
**Goal:** Functional learning platform with content
**Timeline:** Post-MVP, pre-marketing

### Task #10: Intro Lesson - "What is AI?"
**Status:** ❌ Not Started  
**Priority:** High  
**Complexity:** Medium (content creation)

**Content:**
- Lesson 0 (prerequisite for all others)
- Covers: What is AI, why learn it, how Perplexity helps
- Duration: 5-10 minutes
- Available in all 7 languages

**Deliverables:**
1. Script (Russian first)
2. Video recording (screencast style)
3. Translations (see Task #5 for approach)
4. Upload to hosting (YouTube private/unlisted or self-hosted)

---

### Task #5: Multi-language Video Strategy
**Status:** ❌ Not Started  
**Priority:** High  
**Complexity:** High

**Original idea:** Record video + dub audio for all 7 languages

**⚠️ PROBLEM ANALYSIS:**
- Full dubbing for 7 languages = expensive & time-consuming
- Lip-sync impossible for screencasts anyway
- Maintenance nightmare (updating one video = redo 7 versions)

**✅ RECOMMENDED APPROACH:**

**Option A: Subtitles-first (RECOMMENDED for MVP)**
1. Record video in Russian with clear voiceover
2. Generate transcript → translate to 6 languages  
3. Add SRT subtitles (YouTube supports multi-language subs)
4. Users select language in video player

**Pros:** Fast, cheap, easy to update, industry standard  
**Cons:** Requires reading (but target audience = educated users)

**Option B: Russian + Polish audio (compromise)**
1. Record Russian version
2. Use ElevenLabs to clone your voice → generate Polish audio
3. Other 5 languages: subtitles only
4. Rationale: Polish market = primary target (per your analysis)

**Pros:** Polish users get native audio, lower cost than full dubbing  
**Cons:** Still 2x video maintenance

**Option C: Silent screencasts + on-screen text (unique approach)**
1. No voiceover at all
2. Text annotations in video editor → translate text overlays
3. Background music
4. Forces concise, visual learning

**Pros:** Truly language-agnostic, easier for hearing-impaired  
**Cons:** Higher production effort (more editing)

**💡 MY RECOMMENDATION:**  
Start with **Option A** (subtitles). If Polish market responds well, add Polish audio later (Option B) only for top-performing lessons.

**Tools:**
- Transcription: Whisper AI (free, open-source)
- Translation: DeepL API (better than Google for PL/RU)
- Subtitles: Subtitle Edit (free software)
- Hosting: YouTube (unlisted) or Vimeo Pro

---

### Task #16: Lesson Tests & Progression
**Status:** ❌ Not Started  
**Priority: High  
**Complexity:** High

**Requirements:**
- After each lesson, user takes a test
- Must score 90%+ to unlock next lesson
- Unlimited retries allowed
- Questions must require specific knowledge (not guessable from logic)

**Technical implementation:**
```typescript
// Database schema
table: lesson_tests
- lesson_id
- question_text
- answer_options (JSON array)
- correct_answer_index
- explanation (shown after answer)

table: user_test_results
- user_id
- lesson_id  
- score
- attempts
- passed (boolean)
- timestamp
```

**UI Flow:**
1. Finish lesson video → "Take Test" button appears
2. Test page: 10 questions, multiple choice
3. Submit → show score + explanations
4. If <90%: "Try again" button
5. If ≥90%: "✅ Passed! Next Lesson Unlocked"

**Files to create:**
- `src/pages/LessonTest.tsx`
- `src/components/TestQuestion.tsx`

---

### Task #15: Lesson Page Split-Screen (Modified)
**Status:** ❌ Not Started  
**Priority:** Medium  
**Complexity:** High

**Original idea:** Video left, Perplexity embed right

**⚠️ PROBLEM:** Perplexity likely doesn't allow iframe embedding

**✅ ALTERNATIVE SOLUTION:**

**Option A: Copy Prompts Feature (RECOMMENDED)**
- Video player (left/top)
- Below video: collapsible "📋 Prompts from this lesson" section
- Each prompt has "Copy" button → copies to clipboard
- Toast notification: "Prompt copied! Open Perplexity in new tab"
- Button: "Open Perplexity" (opens in new tab)

**Option B: Picture-in-Picture**
- Use browser's native PiP API
- Button: "Pop out video" → video floats while user uses Perplexity in another tab
- Works automatically in modern browsers

**Option C: Custom AI Chat (if budget allows)**
- Integrate Perplexity API (if they offer it) or OpenAI API
- Build own chat interface on right side
- Con: Expensive API costs, not "real" Perplexity experience

**💡 MY RECOMMENDATION:**  
Combine **Option A + B**: Prompts list with copy buttons + PiP support.

**Implementation:**
```typescript
// LessonPage.tsx structure:
<VideoPlayer src={lesson.videoUrl} enablePiP />
<PromptsList prompts={lesson.prompts} />
<NotesSection lessonId={lesson.id} userId={user.id} />
```

---

### Task #17: Lesson Transcript & Notes (Simplified)
**Status:** ❌ Not Started  
**Priority:** Low  
**Complexity:** Medium → Low (simplified)

**Original idea:** Transcript with highlighting, bookmarks, color coding

**⚠️ PROBLEM:** Building a text editor = huge feature, not MVP-critical

**✅ SIMPLIFIED VERSION:**

**Features:**
1. **Read-only transcript** under video (collapsible)
2. **Separate "My Notes" text area**
   - Plain text input (textarea)
   - Auto-saves to database every 5 seconds
   - Persists per-lesson per-user
   - No formatting needed for MVP

**Future enhancements (post-MVP):**
- Rich text editor (Quill.js, TipTap)
- Sync timestamp with video (click transcript → jump to that moment)
- Export notes as PDF

**Database schema:**
```sql
table: lesson_notes
- user_id
- lesson_id
- notes_text
- updated_at
```

**Implementation:**
```typescript
<Transcript text={lesson.transcript} />
<NotesEditor 
  lessonId={lesson.id} 
  userId={user.id}
  autoSave={true}
/>
```

---

## 💰 PHASE 3: MONETIZATION & COMMUNITY
**Goal:** Revenue stream & user engagement
**Timeline:** After content is live

### Task #13: Perplexity Pro Access (LEGAL REVIEW NEEDED)
**Status:** ❌ Not Started  
**Priority:** High (but risky!)  
**Complexity:** Medium + Legal

**Original plan:** Resell cheap Pro accounts with course

**⚠️ CRITICAL LEGAL WARNING:**
- Reselling Perplexity Pro accounts likely violates their Terms of Service
- Risk: Account bans, legal action, reputation damage
- Perplexity may not allow bulk/resale licenses

**✅ SAFE ALTERNATIVES:**

**Option A: Partnership/Affiliate (RECOMMENDED)**
1. Contact Perplexity business team
2. Ask about:
   - Educational partnership program
   - Bulk licensing for students
   - Affiliate/referral commission
3. Offer: We drive Pro subscriptions, they give discount code or revenue share

**Option B: Bundle with Course (NO direct account transfer)**
1. User buys your course
2. Course includes: "Guide to getting Perplexity Pro 50% off"
3. You provide generic tips (student discounts, yearly vs monthly, etc.)
4. Legally safe - you're not reselling, just educating

**Option C: Your Promo Code System (Modified)**
- Keep the 8-digit token system
- But token grants: "Access to Pro Tips course" NOT actual Pro account
- Pro Tips course teaches how to maximize free Perplexity + advanced techniques
- Separate paid upgrade: "Get our curated list of discount sources"

**💡 MY STRONG RECOMMENDATION:**  
Pursue **Option A** first. If rejected, use **Option B**. Avoid direct account resale.

**Why:** Long-term business sustainability > short-term profit. Partnership makes you legitimate.

---

### Task #6: Perplexity Pro Access Method
**Status:** ❌ Not Started (blocked by Task #13 legal decision)  
**Priority:** Medium  
**Complexity:** Depends on approach

**Question:** "Give access on my email or theirs?"

**Analysis:**
- **Their email:** More professional, users keep access after course
- **Your email:** More control, but users lose access if they leave course

**💡 RECOMMENDATION:** Their email + partnership model (if possible)

**If going with promo code approach:**
1. User registers with their email
2. Generate unique 8-char token
3. Email sent with:
   - Token
   - Instructions: "Use this code on [partner site/Perplexity student portal]"
4. User activates on their own account

**Security:**
- Store tokens in database with expiry (30 days?)
- Mark as "used" once activated
- Prevent reuse

---

### Task #12: Telegram Community Integration
**Status:** ❌ Not Started  
**Priority:** Medium  
**Complexity:** Low

**Goal:** Private Telegram group for students

**Implementation plan:**
1. Create private Telegram group
2. Generate invite link with approval required
3. In Dashboard: "Join Community" button
4. Click → modal with instructions:
   - "Click 'Join Telegram'"
   - "Send message: /verify [YOUR_EMAIL]"
   - Bot verifies email in database
   - Auto-approves if user registered

**Technical:**
- Use Telegram Bot API
- Create verification bot (@PerplexitySchoolBot)
- Bot commands:
   - `/verify email@example.com` → checks Supabase for active user
   - Auto-removes users who unsubscribe from course

**Files to create:**
- `telegram-bot/` folder (separate Node.js bot)
- Or use Supabase Edge Functions

**Libraries:**
- `node-telegram-bot-api` or `telegraf`

**Future enhancement:**
- Bot sends lesson reminders
- Bot shares daily AI news/tips
- Gamification: Bot announces top students

---

## 🎨 PHASE 4: ENHANCEMENTS & POLISH
**Goal:** Premium experience
**Timeline:** Post-launch, based on user feedback

### Task #3: Background Image Update
**Status:** ❌ Not Started  
**Priority:** Low  
**Complexity:** Very Low

**Note:** "Do later if it won't be much harder" - it won't! Always easy to change.

**Files to modify:**
- `src/index.css` or page-specific CSS
- Replace `background-image: url(...)` or `<img>` tag

**No technical blocker - purely design decision.**

---

### Task #9: AI Models Showcase Page (BACKLOG)
**Status:** ❌ Not Started  
**Priority:** Low (nice-to-have)  
**Complexity:** Very High

**Vision:** 
- Page listing Perplexity's models (GPT-4, Claude, Sonar, etc.)
- Each model as character ("Arcane" art style)
- Expandable cards with:
   - Character illustration
   - Model strengths
   - Best use cases
   - Example prompts

**⚠️ REALITY CHECK:**
- Custom "Arcane-style" illustrations = $$$ (commission artists)
- Or: AI-generate with Midjourney/DALL-E (risk: inconsistent style)
- High maintenance (models change frequently)

**✅ MVP ALTERNATIVE:**
- Simple grid layout
- Stock icons or model logos
- Text descriptions
- Add fancy art later if budget allows

**Phase:** Definitely post-launch. Focus on core learning first.

---

## 📋 TASK SUMMARY BY STATUS

### ✅ DONE (6 tasks)
1. i18n implementation (7 languages)
2. Language switcher (functionality)
3. Favicon
4. Basic auth flow
5. Dashboard structure
6. Admin panel (basic structure)

### 🔄 IN PROGRESS (0 tasks)
- (Start with Task #2 - Admin Protection)

### ❌ TODO - CRITICAL (Phase 1) (7 tasks)
1. **#2** - Admin panel security ⚡
2. **#1** - Registration UX
3. **#8** - Back button navigation
4. **#7** - Remove home link
5. **#14** - Flag icons for languages
6. **#4** - Custom email domain
7. **#10** - Intro lesson content

### ❌ TODO - IMPORTANT (Phase 2) (5 tasks)
8. **#5** - Video translation strategy
9. **#16** - Lesson tests
10. **#15** - Lesson prompts feature
11. **#17** - Notes & transcript
12. **#13** - Perplexity Pro (legal review)

### ❌ TODO - NICE-TO-HAVE (Phase 3-4) (3 tasks)
13. **#6** - Pro access method (depends on #13)
14. **#12** - Telegram bot
15. **#3** - Background image

### 🗑️ BACKLOG (1 task)
16. **#9** - Models showcase page (complex, low priority)

---

## 🚀 RECOMMENDED START ORDER

**Week 1: Security & Core UX**
1. Task #2 - Admin protection (CRITICAL)
2. Task #7 - Remove home link
3. Task #8 - Back button
4. Task #1 - Registration feedback

**Week 2: Content Foundation**
5. Task #5 - Decide video strategy
6. Task #10 - Create first lesson
7. Task #14 - Polish language selector

**Week 3: Learning Features**
8. Task #16 - Build test system
9. Task #15 - Prompts feature
10. Task #17 - Notes system

**Week 4: Business & Community**
11. Task #13 - Legal review for Pro access
12. Task #4 - Email domain setup
13. Task #12 - Telegram bot

**Post-MVP:**
14. Task #3, #6, #9 as time allows

---

## 💭 STRATEGIC NOTES

### Lessons Learned (from your feedback):
1. **Think before acting** (favicon example)
2. **Question assumptions** ("is this the simplest way?")
3. **Propose alternatives** (don't follow blindly)
4. **Preserve critical info** (this TODO!)

### Decision Framework:
Before implementing anything, ask:
1. **Is this MVP-critical?** (If no → backlog)
2. **Is there a simpler way?** (e.g., favicon.ico vs code change)
3. **What's the maintenance cost?** (e.g., 7-language videos)
4. **Is it legal/safe?** (e.g., reselling accounts)

### Success Metrics (define before launch):
- User registration rate
- Email confirmation rate (Task #1 should improve)
- Lesson completion rate
- Test pass rate (adjust difficulty if too hard/easy)
- Telegram group engagement
- Pro conversion rate (if applicable)

---

**END OF ROADMAP**

*This document is the single source of truth for project planning.*  
*Update statuses as tasks progress.*  
*Add new tasks at the bottom of their phase section.*

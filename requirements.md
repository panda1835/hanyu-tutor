### **Chinese Vocabulary Learning App (Flashcards \+ Spaced Repetition)**

## **🎯 Goal**

Build a **Chinese vocabulary learning web app** focused on flashcards and spaced repetition, inspired by Anki but simpler, goal-driven, and beginner-friendly.

This is an **MVP**, optimized for clarity and correctness over feature breadth.

## **🧱 Tech Stack & Constraints**

* Framework: **Next.js (App Router)**  
* Styling: **Tailwind CSS**  
* Backend & Authentication: **Supabase**  
  * Email/password authentication  
  * Postgres database  
* Vocabulary source: **local JSON file at `lib/vocabulary.json`**  
* No offline mode required  
* PWA support  
* Assume **single-user activity per account per day** (no concurrency conflict handling needed)  
* Support **light & dark mode**

---

## **📁 Vocabulary Data**

Vocabulary is read **read-only** from `lib/vocabulary.json`.

Each word contains:

{  
  "character": string,  
  "pinyin": string,  
  "definition": string,  
  "level": string,   
  "category": string     
}

Vocabulary content itself is never modified; all learning data is user-specific and stored in Supabase.

## **👤 User System**

Each authenticated user has:

* Per-word learning progress  
* Review scheduling data  
* Bookmark list  
* Daily goals  
* Streak tracking

## **📚 Learning Modes**

### **1️⃣ Learn New Words**

**Purpose:** Introduce new vocabulary that the user has never learned.

#### **Filtering**

Users can filter new words by:

* **Level**  
* **Category**

Only words that:

* Match selected filters  
* Have **no existing learning record for the user** are shown.

#### **Flashcard UI**

* Front: **Chinese character \+ pinyin**  
* Back: **English definition**  
* Card flip animation  
* ⭐ **Bookmark**

#### **Actions**

* ❌ **Don’t know**  
* ✅ **I know this**

#### **Behavior**

When the user clicks:

* A learning record is created (if not existing)  
* Review scheduling is initialized  
* Progress is saved to Supabase

Binary feedback only (no Easy/Hard/Good distinctions in MVP).

### **2️⃣ Review Mode (Spaced Repetition)**

**Purpose:** Reinforce learned words using a predictable review schedule.

#### **Review Logic**

* Only words **due for review today or overdue** are shown  
* Uses a **Fibonacci-based interval system**

Intervals: \[1, 2, 3, 5, 8, 13, 21, 34, 55\]

Rules:

* First review starts at **1 day**  
* If user answers **correctly**:  
  * Advance to the next interval  
* If user answers **incorrectly**:  
  * Reset interval index back to **1**  
* Review date \= today \+ interval (days)

#### **Flashcard UI**

Same as Learn mode:

* Front: character \+ pinyin  
* Back: definition  
* Bookmark button available

## **📈 Word Lifecycle & Mastery Rules**

Each word for a user exists in one of three states:

### **1\. Learning**

* Word has been introduced

### **2\. Reviewing**

* Word has at least one successful review  
* Scheduled for future reviews

### **3\. Mastered**

A word is considered **mastered** when:

* The user successfully reaches the **last Fibonacci interval (55 days)**

Once mastered:

* It still appears in daily reviews  
* It still appears in bookmarks (if bookmarked)  
* Mastery status is stored persistently

## **🔖 Bookmarks**

* Displays all bookmarked words  
* Uses the same flashcard UI  
* Bookmarking does **not** affect review scheduling  
* Bookmarks are user-specific

## **📊 Stats Dashboard**

Display the following metrics clearly:

### **Daily Progress**

* New words learned today / daily goal  
* Reviews completed today / daily goal

### **Streak**

* Streak counts **consecutive days** where the user completes **at least one learning or review action**

### **Totals**

* Words currently learning (all learnt words)  
* Words scheduled for review  
* Words mastered

---

## **⚙️ Settings**

Users can configure:

* Daily **new word goal**  
* Daily **review goal**

Settings are stored per user in Supabase and used to compute progress indicators in Stats.

---

## **🌗 UI & UX**

* Mobile-friendly layout  
* Flashcard flip animation  
* Dark mode toggle (system-aware \+ manual)  
* About the style. Make sure you add this style in the globals.css file so that it can be referred everywhere:

Paper & Ink (Sinological / Scholarly)

**Best for:** Cultural / academic positioning, heritage learners  
	**Vibe:** Dictionary, manuscript, library

Color

* Background: `#F5F3EF` (paper)  
* Ink: `#1F2937`  
* Accent: `#92400E` (seal red / brown)  
* Dark mode: deep ink \+ parchment contrast  
  Typography  
* **Chinese:** `Source Han Serif SC`  
* **Latin:** `Source Serif 4`  
* Pinyin smaller, lightly spaced  
  Flashcard  
* Thin border instead of shadow  
* Paper texture background (very subtle)  
* Bookmark icon styled like a folded page

## **🧠 Non-Goals (Explicitly Out of Scope for MVP)**

* Audio pronunciation  
* Offline usage  
* Multi-device conflict resolution  
* Difficulty grading beyond binary feedback  
* Notifications or reminders

## **📦 Expected Deliverables**

* Supabase SQL schema  
* Authentication flow  
* Spaced repetition logic (clearly commented)  
* Core pages:  
  * Auth (login / register)  
  * Learn & Review  
  * Bookmarks  
  * Stats  
  * Settings  
* Clean, maintainable component structure
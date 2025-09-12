# Chinese Vocabulary Learning App - Design Guidelines

## Design Approach
**Reference-Based Approach** - Drawing inspiration from Anki and Duolingo's clean, focused learning interfaces that prioritize content readability and distraction-free studying. This utility-focused educational app requires efficiency and learnability over visual flourishes.

## Core Design Elements

### A. Color Palette
**Light Mode:**
- Primary: 220 85% 25% (deep blue for trust and focus)
- Background: 0 0% 98% (soft white)
- Card backgrounds: 0 0% 100% (pure white)
- Text: 220 15% 15% (dark charcoal)
- Success: 142 76% 36% (green for correct answers)
- Warning: 38 92% 50% (orange for review items)

**Dark Mode:**
- Primary: 220 85% 65% (lighter blue for contrast)
- Background: 220 15% 8% (dark navy)
- Card backgrounds: 220 15% 12% (elevated dark)
- Text: 0 0% 95% (near white)
- Success: 142 76% 50% (brighter green)
- Warning: 38 92% 65% (brighter orange)

### B. Typography
- **Primary Font**: Inter (Latin text) - clean, highly readable
- **CJK Font**: Noto Sans CJK SC (Chinese characters) - optimized for character clarity
- **Hierarchy**: 
  - H1: 2rem (32px) - section headers
  - Character display: 3rem (48px) - flashcard Chinese characters
  - Body: 1rem (16px) - definitions and UI text
  - Small: 0.875rem (14px) - metadata and stats

### C. Layout System
**Spacing Units**: Consistent use of 4, 8, 16, 20px (Tailwind: 1, 2, 4, 5)
- Card padding: 20px
- Section spacing: 20px vertical gaps
- Component margins: 16px
- Button padding: 8px horizontal, 4px vertical

### D. Component Library

**Navigation**
- Top navigation bar with mode toggle (Learn/Review)
- Progress indicators showing daily completion
- Settings icon for filters and preferences

**Flashcards**
- Large centered cards (max-width: 400px)
- Character side: Centered Chinese character with large typography
- Definition side: English definition with pronunciation guide
- Card flip animation on tap/click
- Action buttons below card (Know/Don't Know, Easy/Hard)

**Filters & Controls**
- Level selector (HSK 1-6, beginner/intermediate/advanced)
- Category dropdown (nouns, verbs, adjectives, etc.)
- Daily limit slider (10-100 words)
- Review batch size indicator

**Progress Tracking**
- Daily streak counter
- Words learned today/total
- Review queue size
- Visual progress bars for completion

**Data Display**
- Clean list views for vocabulary browsing
- Character + pinyin + definition format
- Review schedule indicators (due today, overdue, upcoming)

### E. Interaction Design
- **Card Interactions**: Tap to flip, swipe gestures for mobile
- **Button States**: Clear hover/focus states with subtle animations
- **Loading States**: Skeleton screens for data loading
- **Empty States**: Encouraging messages for completed sessions

## Layout Philosophy
- **Mobile-First**: Optimized for smartphone learning sessions
- **Card-Centric**: Content contained in well-defined card boundaries
- **Minimal Distractions**: Clean interface focusing attention on characters
- **Thumb-Friendly**: Important actions within easy reach on mobile

## Visual Hierarchy
1. **Chinese Characters**: Largest, most prominent elements
2. **Action Buttons**: Clear, accessible secondary focus
3. **Progress Indicators**: Subtle but informative
4. **Navigation**: Present but unobtrusive

This design prioritizes learning effectiveness over visual flair, ensuring users can focus on vocabulary acquisition without interface distractions while maintaining modern, polished aesthetics.
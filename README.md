# HanyuTutor - Chinese Vocabulary Learning App

A modern, efficient Chinese vocabulary learning application built with React and TypeScript. Features spaced repetition, daily learning goals, and an intuitive flashcard interface designed for effective language learning.

## 🌟 Features

### Core Learning Features
- **Spaced Repetition System**: Uses Fibonacci intervals (1, 3, 4, 7, 11, 18, 29 days) for optimal retention
- **Daily Learning Batches**: Consistent word sets for each day with date-based seeding
- **Dual Study Modes**: Learn new words and review previously learned vocabulary
- **Progress Tracking**: Comprehensive statistics including streak tracking and mastery levels
- **Smart Filtering**: Filter by HSK level and category for targeted learning

### User Experience
- **Clean Flashcard Interface**: Distraction-free learning with large, readable Chinese characters
- **Intuitive Controls**: Click cards to flip, simple "I Know" / "Don't Know" buttons
- **Bookmark System**: Save difficult words for later review
- **Daily Goals**: Configurable learning targets with progress visualization
- **Dark/Light Mode**: Comfortable studying in any lighting condition

### Technical Features
- **Client-Side Only**: Pure frontend app with no backend required
- **Local Storage**: All progress and settings saved in browser storage
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Progress**: Live updates of learning statistics and completion status
- **Data Persistence**: Progress saved automatically with no data loss
- **Easy Deployment**: Deploy anywhere as a static site

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HanyuTutor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (Vite dev server)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **React Query** - Powerful data fetching and caching
- **Wouter** - Lightweight routing

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **Vite** - Development server and bundling

## 🎯 How It Works

### Learning Algorithm
HanyuTutor uses a **spaced repetition system** based on the Fibonacci sequence to optimize memory retention:

1. **New Words**: Introduced immediately
2. **Review Intervals**: 1, 3, 4, 7, 11, 18, 29 days
3. **Adaptive Difficulty**: Incorrect answers reset the interval
4. **Mastery**: Words graduate after multiple successful reviews

### Daily Batches
- **Consistent Sets**: Same words appear each day using date-based seeding
- **Re-study Option**: Continue learning even after daily goals are met
- **Progress Tracking**: Clear visualization of daily and overall progress

### Data Management
- **Local Storage**: Progress saved in browser for offline use
- **Vocabulary Database**: HSK-level Chinese words with pinyin and definitions
- **Smart Filtering**: Study specific levels or categories as needed

## 🎨 Design Philosophy

Inspired by Anki and Duolingo, HanyuTutor prioritizes:
- **Learnability**: Intuitive, distraction-free interface
- **Efficiency**: Fast, focused learning sessions
- **Accessibility**: High contrast, readable typography
- **Consistency**: Predictable interactions and visual design

### Typography
- **Latin Text**: Inter font for optimal readability
- **Chinese Characters**: Noto Sans CJK SC for character clarity
- **Hierarchy**: Clear information architecture with appropriate sizing

### Color System
- **Trust & Focus**: Deep blue primary color
- **Success States**: Green for correct answers
- **Warning States**: Orange for items needing review
- **Dark Mode**: Carefully calibrated for comfortable night studying

## 📊 Learning Statistics

Track your progress with comprehensive metrics:
- **Words Learned Today**: Daily learning count
- **Review Completion**: Daily review progress
- **Current Streak**: Consecutive study days
- **Total Words Learned**: Overall vocabulary mastery
- **Mastered Words**: Fully learned vocabulary

## 🔧 Configuration

### Learning Settings
- **Daily Goal**: Target number of new words per day (default: 20)
- **Review Limit**: Maximum reviews per day (default: 50)
- **Sound Settings**: Audio pronunciation preferences
- **Notification Settings**: Study reminders

### Filters
- **HSK Levels**: Study specific difficulty levels
- **Categories**: Focus on particular word types
- **Due Words**: Prioritize words ready for review

### Development Guidelines
- Use TypeScript for all new code
- Follow existing component patterns
- Add tests for new features
- Update documentation as needed

---

**Happy Learning!** 📚

Master Chinese vocabulary with HanyuTutor's scientifically-backed spaced repetition system.

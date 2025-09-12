# Overview

This is a Chinese vocabulary learning application that helps users learn and review Chinese characters through a flashcard-based system. The app is designed with inspiration from Anki and Duolingo's clean, focused learning interfaces that prioritize content readability and distraction-free studying. It features two main study modes: learning new words and reviewing previously studied words, with a spaced repetition system using Fibonacci intervals for optimal retention.

The application allows users to import vocabulary data from CSV files and track their learning progress with daily goals, streaks, and comprehensive statistics. The interface supports both light and dark themes and is built with accessibility and mobile responsiveness in mind.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The application uses a **React-based single-page application** built with **Vite** for fast development and optimized builds. The frontend follows a component-based architecture with the main App component managing global state for theme, navigation, study modes, and user preferences.

**Component Structure:**
- Main navigation handles page routing between home, study, and statistics views
- Study session components manage flashcard interactions and progress tracking
- Filter and settings panels provide user customization options
- Progress tracking components display daily goals and learning statistics

**State Management:**
- Uses React's built-in state management with hooks for local component state
- TanStack Query for server state management and caching
- Local storage for persisting user preferences, settings, and progress data

**Styling System:**
- Tailwind CSS for utility-first styling with custom design system
- shadcn/ui component library for consistent, accessible UI components
- Custom CSS variables for theme switching between light and dark modes
- Typography optimized for Chinese characters using Noto Sans CJK SC

## Backend Architecture

The backend uses an **Express.js REST API** architecture with a modular route structure. Currently implements a simple in-memory storage system but is designed to be easily extended with database integration.

**API Structure:**
- RESTful endpoints with `/api` prefix for all application routes
- Modular route handlers organized in separate files
- Error handling middleware for consistent error responses
- CORS and security middleware for production deployment

**Data Management:**
- Abstract storage interface allows switching between different storage backends
- Currently uses in-memory storage for development and testing
- Prepared for PostgreSQL integration with Drizzle ORM

## Data Storage Solutions

**Database Schema (Prepared):**
- `users` table for authentication and user management
- `vocabulary_words` table storing Chinese characters with metadata (level, category, pinyin, definition)
- `user_progress` table tracking learning progress with spaced repetition intervals

**Spaced Repetition System:**
- Implements Fibonacci sequence intervals (1, 3, 4, 7, 11, 18, 29 days)
- Tracks review status: learning, reviewing, mastered
- Maintains correct/incorrect answer counts and next review dates

**CSV Import System:**
- Supports bulk vocabulary import from structured CSV files
- Generates stable IDs using character, pinyin, and definition hashing
- Validates data format and provides import feedback

## Study System Architecture

**Learning Flow:**
- Two distinct study modes: learning new words vs. reviewing due words
- Flashcard-based interface with character-to-definition testing
- Session management with progress tracking and completion statistics
- Audio pronunciation support using Web Speech API

**Progress Tracking:**
- Daily learning goals and streak tracking
- Session results with response time measurement
- Statistical analysis of learning patterns and retention rates

# External Dependencies

## Core Framework Dependencies

- **React 18** - Frontend framework with hooks and modern patterns
- **Vite** - Build tool and development server for fast compilation
- **Express.js** - Backend web server framework
- **TypeScript** - Type safety across frontend and backend

## UI and Styling

- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Radix UI** - Accessible component primitives for complex UI elements
- **Lucide React** - Icon library for consistent iconography
- **class-variance-authority** - Type-safe CSS class variant management

## Database and Data Management

- **Drizzle ORM** - Type-safe database toolkit prepared for PostgreSQL
- **Neon Database** - Serverless PostgreSQL provider for production deployment
- **Papa Parse** - CSV parsing library for vocabulary data import
- **Zod** - Runtime validation for API requests and data schemas

## Development and Deployment

- **TanStack Query** - Server state management and caching
- **date-fns** - Date manipulation utilities for progress tracking
- **nanoid** - Unique ID generation for entities
- **esbuild** - Fast JavaScript bundler for production builds

## Authentication and Session Management

- **connect-pg-simple** - PostgreSQL session store for Express sessions
- **React Hook Form** - Form handling with validation support
- **@hookform/resolvers** - Integration between React Hook Form and validation libraries

The application is configured for deployment on platforms like Replit with automatic database provisioning and environment variable management. The modular architecture allows for easy scaling and feature additions while maintaining code organization and type safety throughout the application.
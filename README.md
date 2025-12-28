# GymPepz

**GymPepz** is a comprehensive fitness tracking and workout management application built with the T3 Stack. Track your workouts, analyze your progress, find nearby gyms, and achieve your fitness goals with intelligent training and personalized workout plans powered by AI.

## ✨ Features

- 🏋️ **Active Workout Mode** - Log every set, rep, and weight in real-time with granular tracking
- 📊 **Progress Analytics** - Visualize strength gains and body composition changes with interactive charts
- 📅 **Smart Scheduling** - Organize training with custom plans and never miss a workout
- 🤖 **AI Workout Planner** - Get personalized workout plans based on your goals and fitness level
- 🗺️ **Gym Finder** - Discover nearby gyms and fitness centers using location-based search
- 📱 **Mobile-First Design** - Fully responsive interface optimized for all devices
- 🔒 **Secure Authentication** - Email/password and Google OAuth integration with NextAuth

## 🛠️ Tech Stack

This project is built with the [T3 Stack](https://create.t3.gg/):

- [Next.js](https://nextjs.org) 15 - React framework with App Router
- [NextAuth.js](https://next-auth.js.org) - Authentication
- [Prisma](https://prisma.io) - Database ORM
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [tRPC](https://trpc.io) - Type-safe API layer
- [OpenAI](https://openai.com) - AI-powered workout planning
- [Mapbox](https://mapbox.com) - Location services and gym search

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Environment variables (see `.env.example`)

### Installation

```bash
# Install dependencies
pnpm install

# Set up your environment variables
cp .env.example .env

# Run database migrations
pnpm db:generate

# Seed exercise database (optional)
pnpm db:seed:exercises

# Start development server
pnpm dev
```

Visit `http://localhost:3000` to see your application.

## 📝 Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format:write` - Format code with Prettier
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:push` - Push schema changes to database

## 🗄️ Database

The application uses PostgreSQL with Prisma ORM. Key models include:

- User authentication and profiles
- Workout plans and exercises
- Workout logs and progress tracking
- Exercise library (528+ exercises)
- Location data for gym search

## 🔐 Authentication

Supports multiple authentication methods:

- Email/Password with OTP verification
- Google OAuth
- Secure session management
- Password reset functionality

## 📚 Learn More

To learn more about the T3 Stack:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available)
- [T3 Stack GitHub](https://github.com/t3-oss/create-t3-app)

## 🚢 Deployment

Deploy to your preferred platform:

- [Vercel](https://create.t3.gg/en/deployment/vercel) (Recommended)
- [Netlify](https://create.t3.gg/en/deployment/netlify)
- [Docker](https://create.t3.gg/en/deployment/docker)

---

Built with ❤️ using the T3 Stack

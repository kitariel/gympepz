# Landing Page Prompt for Lovable.dev AI

## Project Overview

**GymPepz** is a comprehensive fitness tracking and workout management application. You need to create a stunning, conversion-optimized landing page that showcases the app's features and drives user sign-ups.

---

## 🎯 Project Context

### Application Purpose
GymPepz is a fitness tracking platform designed for serious athletes and fitness enthusiasts who want:
- Granular workout tracking (set-by-set logging)
- AI-powered workout plan generation
- Progress analytics and visualization
- Weekly workout scheduling with drag-and-drop
- Exercise library with 500+ exercises
- Personal record tracking and streaks

### Target Audience
- **Primary**: Serious gym-goers, athletes, bodybuilders (18-45 years old)
- **Secondary**: Beginners looking to start structured training
- **Pain Points**: Manual tracking, no progress visibility, lack of structure

---

## 🛠️ Tech Stack (MUST USE)

- **Framework**: Next.js 15 with App Router (React 19)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui components (Card, Button, Badge, Dialog, etc.)
- **Icons**: Lucide React (`lucide-react`)
- **Animations**: Custom animations using Framer Motion (already implemented)
- **Authentication**: NextAuth v5 (redirects to `/login`)

### Existing Components Available
- `@/components/ui/*` - All shadcn/ui components
- Custom animations: `FadeIn`, `ScaleIn`, `StaggerContainer`, `StaggerItem`
- Located in `@/components/animations`

---

## 📐 Current Landing Page Structure

The current landing page (`src/app/page.tsx`) includes:

1. **Header/Navigation**
   - Logo: GymPepz with Dumbbell icon
   - Conditional navigation (logged in → "Go to Portal", logged out → "Sign In" / "Get Started")
   - Sticky header with backdrop blur

2. **Hero Section**
   - Large headline: "Master Your Fitness Journey"
   - Subheadline about tracking and analytics
   - Two CTAs: "Start Training" and "Learn more"
   - Decorative background gradient blob

3. **Features Section**
   - Title: "Built for Progressive Overload"
   - 3 feature cards:
     - Active Workout Mode (Zap icon)
     - Progress Analytics (LineChart icon)
     - Smart Scheduling (Calendar icon)

4. **Bento Grid Section**
   - "Data-Driven Training" title
   - 4-card grid with features:
     - Volume Analysis (2-column span)
     - Injury Prevention
     - Exercise Library

5. **CTA Section**
   - Large primary CTA card with gradient background
   - "Ready to transform your physique?" headline
   - "Get Started for Free" button

6. **Footer**
   - Copyright notice
   - Terms and Privacy links

---

## 🎨 Design Requirements

### Visual Style
- **Modern & Professional**: Clean, minimalist design with subtle gradients
- **Fitness-Focused**: Athletic, energetic feel without being gimmicky
- **Dark Mode Support**: Must work in both light and dark themes
- **Mobile-First**: Fully responsive (mobile, tablet, desktop)

### Color Palette
- **Primary**: Use theme colors (`bg-primary`, `text-primary`, etc.)
- **Gradients**: Subtle gradient backgrounds (`bg-gradient-to-br`, etc.)
- **Accents**: Use `bg-muted/50`, `bg-card` for contrast
- **Text**: Use semantic colors (`text-foreground`, `text-muted-foreground`)

### Typography
- **Headings**: Bold, tracking-tight (use `font-bold tracking-tight`)
- **Body**: Standard text sizes with proper line-height
- **Hierarchy**: Clear visual hierarchy with size variations

### Spacing
- **Sections**: `py-24 sm:py-32` for major sections
- **Container**: `container mx-auto px-4 sm:px-8`
- **Gaps**: Use consistent gap spacing (gap-4, gap-6, gap-8)

---

## ✨ Enhanced Features to Include

### 1. Hero Section (Enhanced)
**Requirements:**
- Large, impactful headline with gradient text
- Compelling value proposition (2-3 sentences)
- Primary CTA: "Start Training Free" / "Get Started"
- Secondary CTA: "Watch Demo" or "Learn More"
- Animated background elements (blob gradients)
- Optional: Hero image or illustration placeholder

**Copy Suggestions:**
- Headline: "Transform Your Training with AI-Powered Workout Plans"
- Subheadline: "Track every set, analyze your progress, and achieve your goals with intelligent workout planning designed for serious athletes."
- CTA Primary: "Start Training Free"
- CTA Secondary: "See How It Works"

### 2. Features Section (Enhanced)
**Show 4-6 Key Features:**

1. **AI Workout Planner** 🤖
   - "Get personalized workout plans tailored to your goals, experience, and equipment"
   - Icon: Sparkles

2. **Granular Tracking** 📝
   - "Log every set, rep, and weight. Track RPE, rest times, and volume for complete analysis"
   - Icon: Dumbbell

3. **Progress Analytics** 📊
   - "Visualize your strength gains with interactive charts. See volume trends, PRs, and body composition changes"
   - Icon: LineChart or BarChart3

4. **Weekly Planning** 📅
   - "Organize your training with drag-and-drop weekly schedules. Never wonder what to train"
   - Icon: Calendar

5. **Exercise Library** 💪
   - "Access 500+ exercises with instructions, muscle groups, and equipment filters"
   - Icon: Dumbbell or Target

6. **Smart Insights** 🧠
   - "Automatic PR detection, streak tracking, and personalized recommendations"
   - Icon: Award or TrendingUp

**Layout:** Grid of feature cards (2 columns on mobile, 3 on desktop)

### 3. How It Works Section (NEW)
**3-Step Process:**
1. **Sign Up** - Quick registration (email or Google)
2. **Create Your Plan** - Use AI or build manually
3. **Track & Improve** - Log workouts and watch progress

Use numbered steps or icons.

### 4. Social Proof Section (NEW)
**Include:**
- Testimonials (3 testimonials in a carousel or grid)
- Stats: "Join 1,000+ athletes" or similar
- Feature badges: "AI-Powered", "Privacy-Focused", "100% Free"

**Placeholder Testimonials:**
- "Finally, a tracker that understands progressive overload. My strength gains are visible and motivating!" - Alex, Bodybuilder
- "The AI planner created the perfect 4-day split for my goals. Game changer!" - Sarah, Athlete
- "Best workout tracking app I've used. The analytics help me optimize my training." - Mike, Trainer

### 5. Screenshots/Demo Section (NEW)
**Requirements:**
- Placeholder image sections showing:
  - Dashboard view
  - Weekly schedule board (the Jira-style board)
  - Workout logging interface
  - Analytics/Progress charts
- Add subtle hover effects or animations
- Use rounded corners and shadows

**Image Placeholders:**
```tsx
<div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl border p-8">
  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
    <span className="text-muted-foreground">Dashboard Preview</span>
  </div>
</div>
```

### 6. Pricing Section (Optional)
**Simple Pricing:**
- **Free Tier**: Core features, unlimited workouts, basic analytics
- **Pro Tier** (Future): Advanced analytics, meal planning, AI coaching
- For now, emphasize "100% Free" or "Free Forever"

### 7. FAQ Section (NEW)
**Common Questions:**
- "Is GymPepz free?"
- "Do I need a gym membership?"
- "How does AI workout planning work?"
- "Can I export my data?"
- "Is my data private?"

Use Accordion/Collapsible components from shadcn/ui.

---

## 🎬 Animation Requirements

### Use Existing Animation Components:
```tsx
import {
  FadeIn,
  ScaleIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/animations";
```

**Animation Pattern:**
- Hero: FadeIn with staggered delays (0.1s, 0.3s, 0.5s)
- Features: StaggerContainer with StaggerItem children
- CTA: ScaleIn for emphasis
- Sections: FadeIn on scroll (if possible)

### Animation Guidelines:
- **Subtle, not distracting**: Smooth transitions, no jarring movements
- **Performance**: Use transform and opacity for animations
- **Progressive enhancement**: Animations should enhance, not block content

---

## 📱 Responsive Design

### Breakpoints:
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (sm to lg)
- **Desktop**: > 1024px (lg+)

### Mobile Considerations:
- Stack sections vertically
- Full-width CTAs on mobile
- Reduce padding: `py-16 sm:py-24`
- Single column feature grid
- Hamburger menu for navigation (if needed)

### Desktop Enhancements:
- Multi-column layouts
- Larger hero text: `text-4xl sm:text-6xl md:text-7xl`
- Hover effects on cards
- More spacing and breathing room

---

## 🔗 Navigation & Links

### Header Navigation:
- **Logo**: Link to `/` (home)
- **Logged Out**: "Sign In" → `/login`, "Get Started" → `/login`
- **Logged In**: "Go to Portal" → `/portal`

### Footer Links:
- Terms (placeholder: `#`)
- Privacy (placeholder: `#`)
- Contact (optional)
- Blog/Resources (optional)

### Internal Links:
- "Learn more" button → `#features` (anchor link)
- All CTAs → `/login` (for sign-up)

---

## 🎨 Component Usage Examples

### Feature Card:
```tsx
<StaggerItem className="bg-card flex flex-col rounded-2xl border p-8 shadow-sm transition-all hover:shadow-md">
  <div className="bg-primary/10 mb-6 flex h-10 w-10 items-center justify-center rounded-lg">
    <Sparkles className="text-primary h-6 w-6" />
  </div>
  <h3 className="text-lg leading-8 font-semibold">
    AI Workout Planner
  </h3>
  <p className="text-muted-foreground mt-4 flex-auto text-base leading-7">
    Get personalized workout plans tailored to your goals...
  </p>
</StaggerItem>
```

### CTA Button:
```tsx
<Link href="/login">
  <Button size="lg" className="h-12 px-8 text-base">
    Start Training Free <ArrowRight className="ml-2 h-4 w-4" />
  </Button>
</Link>
```

### Section Container:
```tsx
<section className="py-24 sm:py-32">
  <div className="container mx-auto px-4 sm:px-8">
    {/* Content */}
  </div>
</section>
```

---

## 📋 Page Structure (Final Layout)

```
1. Sticky Header
   - Logo + Navigation

2. Hero Section
   - Large headline with gradient
   - Value proposition
   - Primary + Secondary CTAs
   - Decorative background

3. Features Section (6 cards)
   - Grid layout
   - Icons + titles + descriptions
   - Hover effects

4. How It Works (3 steps)
   - Step-by-step process
   - Visual indicators

5. Screenshots/Demo Section
   - App preview images
   - Feature highlights

6. Social Proof
   - Testimonials
   - Stats/badges

7. FAQ Section
   - Common questions
   - Collapsible answers

8. Final CTA Section
   - Large prominent CTA
   - Gradient background
   - "Get Started for Free" button

9. Footer
   - Logo
   - Links
   - Copyright
```

---

## 🚀 Implementation Guidelines

### File Location:
- Main landing page: `src/app/page.tsx`
- Keep it server component (async/await for auth check)
- Use `Link` from `next/link` for navigation
- Use `auth()` from `@/server/auth` for session check

### Code Patterns:
```tsx
import { auth } from "@/server/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";

export default async function Home() {
  const session = await auth();
  
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      {/* Header */}
      {/* Hero */}
      {/* Features */}
      {/* ... */}
      {/* Footer */}
    </div>
  );
}
```

### Performance:
- Use Next.js Image component for any images
- Lazy load animations
- Optimize font loading
- Minimize JavaScript bundle

---

## 🎯 Conversion Optimization

### CTA Strategy:
- **Above the fold**: Primary CTA visible without scrolling
- **Multiple CTAs**: Include CTAs in hero, features, and bottom
- **Clear messaging**: Action-oriented button text
- **Color contrast**: Use primary button style for main CTAs

### Trust Signals:
- "Free Forever" badge
- "No Credit Card Required"
- Privacy-focused messaging
- Security badges/icons

### Urgency/Scarcity (Optional):
- "Join 1,000+ athletes" (social proof)
- "Start your free account today"

---

## 📸 Image Requirements

### Hero Section:
- Option 1: Large gradient blob (current approach)
- Option 2: Abstract fitness illustration
- Option 3: App screenshot mockup

### Feature Icons:
- Use Lucide React icons (already available)
- Consistent icon size: `h-6 w-6` in containers
- Icon containers: `bg-primary/10` with `rounded-lg`

### Screenshot Placeholders:
- Dashboard: Show stats cards and charts
- Weekly Schedule: Show the Jira-style board
- Workout Log: Show set-by-set tracking interface

**Note**: Use placeholder divs with gradients for now if actual screenshots aren't available.

---

## ✨ Special Requirements

1. **Brand Consistency**: Use "GymPepz" branding throughout
2. **Tone**: Professional, motivational, but not cheesy
3. **Accessibility**: Proper ARIA labels, keyboard navigation, color contrast
4. **SEO**: Semantic HTML, proper headings hierarchy
5. **Performance**: Fast load times, optimized assets

---

## 🔄 Integration Points

### Authentication Check:
```tsx
const session = await auth();
// Show different CTAs based on session state
```

### Navigation:
- Logged out → `/login` for sign-up
- Logged in → `/portal` for dashboard
- Use Next.js `Link` component for client-side navigation

### Theme Support:
- Must work in light and dark mode
- Use semantic color tokens (`bg-background`, `text-foreground`)
- Test both themes

---

## 📝 Content Guidelines

### Headlines:
- **Hero**: Attention-grabbing, benefit-focused
- **Section**: Clear, descriptive
- **Features**: Action-oriented, benefit-driven

### Body Text:
- Concise (2-3 sentences max per section)
- Focus on benefits, not features
- Use active voice
- Avoid jargon

### CTAs:
- Action verbs: "Start", "Get", "Join", "Try"
- Clear value: "Start Training Free", "Get Your Plan"
- Urgency (optional): "Start Today", "Begin Now"

---

## 🎨 Design Inspiration

### Style References:
- Modern SaaS landing pages (Linear, Vercel, Stripe)
- Fitness apps (Strong, Jefit, MyFitnessPal) - but more premium
- Clean, minimalist aesthetic
- Generous whitespace
- Subtle animations

### Color Usage:
- Primary: For CTAs and accents
- Muted: For backgrounds and subtle elements
- Gradient: For hero and CTA sections
- Cards: Use `bg-card` with borders and shadows

---

## ✅ Quality Checklist

Before considering the landing page complete, ensure:

- [ ] Fully responsive (mobile, tablet, desktop)
- [ ] Dark mode compatible
- [ ] Smooth animations (not jarring)
- [ ] Clear CTAs visible above the fold
- [ ] All links work correctly
- [ ] Fast load times
- [ ] Accessible (keyboard navigation, screen readers)
- [ ] SEO-friendly (semantic HTML, meta tags)
- [ ] Brand-consistent (GymPepz styling)
- [ ] Error-free (no console errors)

---

## 🚀 Launch Requirements

The landing page should:
1. **Convert visitors** to sign up
2. **Communicate value** clearly and quickly
3. **Build trust** with professional design
4. **Guide users** through the sign-up flow
5. **Highlight key features** that differentiate from competitors

---

## 📌 Additional Notes

- The application already has authentication in place
- Users will be redirected to `/login` for sign-up
- After login, users go to `/portal` (dashboard)
- The app is fully functional - this landing page should showcase it
- Emphasize the AI-powered planning as a key differentiator
- Highlight granular tracking for serious athletes

---

## 🎯 Success Metrics to Consider

The landing page should aim for:
- **Clear value proposition** within 3 seconds of landing
- **Multiple conversion points** throughout the page
- **Mobile-optimized** (majority of traffic may be mobile)
- **Fast performance** (< 3s load time)
- **Engaging visuals** that represent the app accurately

---

**Start building this landing page now, ensuring it's modern, conversion-optimized, and showcases GymPepz as the premier fitness tracking platform for serious athletes.**

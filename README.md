# 🎓 Premium LMS SaaS Platform

A state-of-the-art, scalable, and feature-rich Learning Management System built with the modern Next.js 16+ stack. This platform delivers a premium, high-performance experience for Administrators, Instructors, and Students alike.

---

## ✨ Key Features

### 🛡️ Admin Powerhouse
- **Real-time Notifications**: Instant system-wide notifications for new registrations, enrollments, and updates, synchronized across the dashboard.
- **Dynamic System Settings**: Global branding management including site name, logo, and contact email with real-time synchronization.
- **Multilingual Currency Converter**: Integrated exchange rate API support with dynamic site-wide currency switching and base currency management.
- **Dynamic Dashboard**: Real-time analytics on platform growth, revenue, and engagement with interactive charts.
- **Granular User Management**: Full control over users, roles, and permissions.
- **System Activity Logs**: Audit-ready tracking of all major platform events.

### 👨‍🏫 Instructor Excellence
- **Intuitive Course Builder**: Drag-and-drop hierarchy for sections (Lessons) and content (Topics).
- **Revenue Normalization**: Earnings tracked and normalized across multiple currencies for accurate financial reporting.
- **Rich Media Support**: Integrate Videos, PDFs, and interactive Text lessons.
- **Advanced Quizzing**: Comprehensive quiz engine with multiple question types, automated grading, and real-time performance tracking.
- **Student Progress Tracking**: Monitor individual and group learning paths in real-time.

### 📝 Student Experience
- **Sleek Learning Interface**: Distraction-free content delivery with progress persistence and Search UI enhancements.
- **Premium Checkout Flow**: Fully integrated Stripe checkout and dedicated pages for a professional, distraction-free enrollment experience.
- **Billing Details Modal**: Large, centered modal for Cash on Delivery (COD) orders with intelligent grid-aligned form fields.
- **Guest Checkout**: Seamless enrollment process for non-registered users via secure guest flows.
- **Gamification**: Earn achievements and track learning milestones.
- **Interactive Discussions**: Peer-to-peer and instructor engagement within lessons.
- **Certificate Generation**: Automated, premium certificates upon course completion.

---

## 🚀 Tech Stack

- **Core Framework**: [Next.js 16.x](https://nextjs.org/) (App Router, Turbopack)
- **UI Library**: [React 19](https://react.dev/)
- **Styling Engine**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Database ORM**: [Prisma 7.3](https://www.prisma.io/)
- **File Storage**: [UploadThing](https://uploadthing.com/)
- **Database**: PostgreSQL (Supabase / Local)
- **Authentication**: [NextAuth.js v5](https://authjs.dev/)
- **Payment Processing**: [Stripe API](https://stripe.com/) (Checkout & Webhooks) & **Cash on Delivery (COD)**
- **Currency Sync**: [ExchangeRate-API](https://www.exchangerate-api.com/) Integration
- **Icons**: [Lucide React](https://lucide.dev/)
- **State & Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: 20.x or higher
- **PackageManager**: `npm`, `yarn`, or `pnpm`
- **Database**: A running PostgreSQL instance

### 1. Installation
```bash
git clone https://github.com/HassanGilani11/lms-saas.git
cd lms-saas
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root and add the following:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/lms_db"

# Auth (NextAuth)
AUTH_SECRET="your-auth-secret" # Generate with `npx auth secret`
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Stripe
STRIPE_API_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# UploadThing
UPLOADTHING_TOKEN="ey..."

# Optional: Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### 3. Database Initialization
```bash
npx prisma db push
npx prisma generate
```

### 4. Launch
```bash
npm run dev
```

---

## 🏗️ Project Architecture

```text
src/
├── actions/      # Type-safe Server Actions (DB Logic, Auth, Settings, Notifications)
├── app/          # Next.js App Router (Layouts & Page Views)
├── components/   # Atomic UI Components & Providers (Consolidated Provider Layer)
├── hooks/        # Custom React Hooks
├── lib/          # Core utilities (Prisma client, Stripe, Events, Mail)
└── prisma/       # Database Schema & Migrations
```

---

## 🗺️ Roadmap
- [x] Core LMS Architecture & Multi-role Auth
- [x] Course & Lesson Management (Default Publishing)
- [x] Global Branding & System Settings
- [x] Payment Gateway Integration (**Stripe Integration Complete**)
- [x] **Multilingual Currency Converter** (Dynamic rates & site-wide display)
- [x] **Premium UI/UX Enhancements** (Checkout flows, Modals, & Dark Mode)
- [x] Student Module & Guest Checkout
- [x] Advanced Quiz Module & Grading
- [x] Real-time Admin Notifications
- [x] Architecture Stability (Consolidated Providers & Hydration Fixes)
- [ ] Mobile-First Progressive Web App (PWA)
- [ ] AI-Powered Course Recommendations
- [ ] Live Video Streaming Sessions


---

## 📄 License
This project is proprietary. All rights reserved.

---
*Developed with focus on Performance, Scalability, and User Experience.*

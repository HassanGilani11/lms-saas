# Premium LMS SaaS Platform

A modern, scalable, and feature-rich Learning Management System developed with the latest web technologies. This platform is designed to provide a premium experience for Administrators, Instructors, and Learners.

## 🚀 Key Features

### 🛠️ Admin Dashboard
- **Comprehensive Analytics**: Monitor platform performance at a glance.
- **Advanced Management**: Dedicated modules for Users, Roles, and Contacts.
- **Premium UI**: Smooth transitions, glassmorphism aesthetics, and a fully responsive layout.

### 📚 Course & Content Management
- **Full CRUD Support**: Effortlessly create, edit, and manage courses.
- **Dynamic Tagging & Categorization**: Organize content with a robust tags and categories system.
- **Interactive Forms**: Premium form designs for content creation and editing.

### 👥 Group Collaboration
- **Group Management**: Create and manage user groups with ease.
- **Hierarchical Structure**: Organize groups into categories and apply specific tags.
- **Member Tracking**: Real-time tracking of users and learning paths within groups.

### 🍱 User Experience Enhancements
- **Collapsible Sidebar**: Maximize your workspace with a smooth, context-aware toggle.
- **Intelligent Navigation**: Quick access to profiles and global settings.
- **"Coming Soon" Modules**: Professional placeholders for upcoming features like Payment Gateway, Branches, and Reports.

## 💻 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database**: PostgreSQL / Supabase
- **Payments**: Stripe (Integration in progress)

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm / yarn / pnpm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/lms-saas.git
   cd lms-saas
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory and add your credentials:
   ```env
   DATABASE_URL="your-postgresql-url"
   NEXTAUTH_SECRET="your-secret"
   STRIPE_API_KEY="your-stripe-key"
   ```

4. **Database Sync**:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🏗️ Project Structure
```text
src/
├── actions/      # Server Actions (CRUD, Logic)
├── app/          # Next.js App Router (Routes & Layouts)
├── components/   # Reusable UI Components
├── hooks/        # Custom React Hooks (Context, State)
├── lib/          # Utilities & Config (Prisma, Auth)
└── prisma/       # Database Schema
```

## 📄 License
This project is proprietary and for demonstration purposes.

---
*Built with ❤️ for High-Performance Learning.*

# CafePos - Modern Cafe Point of Sale System

## Overview

CafePos is a full-stack web application designed as a modern point-of-sale (POS) system for cafes and restaurants. The system provides a complete solution for order management, menu organization, transaction processing, and sales reporting. Built with a React frontend and Express.js backend, it features role-based access control with separate interfaces for cashiers and administrators.

The application supports both dine-in and takeaway orders, provides real-time transaction processing with receipt generation, and includes comprehensive reporting capabilities for business analytics. The system is designed to be user-friendly for cashiers while providing detailed insights for business owners and managers.

## User Preferences

Preferred communication style: Simple, everyday language.
Preferred language: Indonesian (Bahasa Indonesia)

## Recent Updates (January 2025)

### Authentication System
- Sistema menggunakan Replit OAuth untuk autentikasi
- User login dengan akun Replit mereka yang terdaftar
- Role ditentukan secara otomatis (admin untuk pemilik workspace, kasir untuk user lain)
- Session disimpan di PostgreSQL untuk keamanan dan persistensi

### Menu Management System Completed
- ✓ Halaman manajemen menu lengkap dengan CRUD operations
- ✓ Form untuk menambah/edit kategori dan menu item
- ✓ Validasi data menggunakan Zod schema
- ✓ Interface yang user-friendly dengan design coffee-themed
- ✓ Role-based access control (hanya admin yang bisa akses)

## System Architecture

### Frontend Architecture
The client-side is built using **React with TypeScript**, utilizing modern React patterns with hooks for state management. The application uses **Vite** as the build tool for fast development and optimized production builds. Component architecture follows a modular design with reusable UI components from the **shadcn/ui** library built on top of **Radix UI** primitives.

Key frontend design decisions:
- **React Query (@tanstack/react-query)** for server state management and caching, providing automatic background updates and optimistic UI updates
- **Wouter** for lightweight client-side routing instead of React Router to minimize bundle size
- **Tailwind CSS** with CSS variables for theming and responsive design
- Component-based architecture with clear separation between UI components, business logic components, and pages
- Custom hooks for authentication state management and API interactions

### Backend Architecture
The server-side follows a **REST API architecture** built with **Express.js** and TypeScript. The backend implements a layered architecture with clear separation of concerns between routing, business logic, and data access.

Core backend components:
- **Express.js** server with middleware for request logging, error handling, and CORS
- **Storage layer abstraction** using an interface-based design pattern for database operations
- **Authentication middleware** integrated with Replit's OAuth system
- **Session management** using PostgreSQL-backed sessions for security and persistence
- **Database migrations** handled by Drizzle Kit for schema versioning

### Database Design
The system uses **PostgreSQL** as the primary database with **Drizzle ORM** for type-safe database operations and schema management. The database schema supports multi-tenant concepts with user roles and comprehensive transaction tracking.

Schema design includes:
- **Users table** with role-based access control (admin/kasir)
- **Categories and MenuItems** for product organization
- **Transactions and TransactionItems** for order tracking with detailed line items
- **Sessions table** for secure authentication state persistence
- **Enums for standardized data** (user roles, order types, payment status)

### Authentication & Authorization
The application implements **Replit-based OAuth authentication** with session-based authorization. Users authenticate through Replit's identity provider, and the system maintains sessions using PostgreSQL storage.

Authentication features:
- **OpenID Connect integration** with Replit's authentication service
- **Role-based authorization** with admin and cashier roles
- **Session persistence** across browser restarts
- **Automatic token refresh** and session management
- **Unauthorized request handling** with automatic redirect to login

### Real-time Features & State Management
The frontend implements optimistic UI updates and real-time data synchronization using React Query's intelligent caching system. The application provides immediate feedback for user actions while ensuring data consistency with the backend.

State management approach:
- **React Query for server state** with automatic background refetching
- **Local component state** for UI interactions and form management
- **Context providers** for global application state (authentication, theming)
- **Optimistic updates** for immediate user feedback during API operations

## External Dependencies

### Core Framework Dependencies
- **React 18** - Frontend framework with modern hooks and concurrent features
- **Express.js** - Backend web framework for REST API development
- **TypeScript** - Type safety across the entire application stack
- **Vite** - Development server and build tool for optimized bundling

### Database & ORM
- **PostgreSQL** - Primary relational database for data persistence
- **Drizzle ORM** - Type-safe database toolkit with automatic migrations
- **@neondatabase/serverless** - Serverless PostgreSQL driver for Neon database hosting
- **connect-pg-simple** - PostgreSQL session store for Express sessions

### Authentication & Security
- **openid-client** - OpenID Connect client for Replit OAuth integration
- **passport** - Authentication middleware for Express
- **express-session** - Session management with PostgreSQL backing store

### UI & Styling
- **shadcn/ui** - Pre-built accessible component library
- **Radix UI** - Headless UI primitives for complex components
- **Tailwind CSS** - Utility-first CSS framework with design system
- **Lucide React** - Icon library for consistent iconography
- **class-variance-authority** - Utility for managing component style variants

### Data Management & Validation
- **@tanstack/react-query** - Server state management with caching and synchronization
- **React Hook Form** - Form state management with validation
- **Zod** - Runtime type validation and schema parsing
- **drizzle-zod** - Integration between Drizzle schemas and Zod validation

### Development & Build Tools
- **tsx** - TypeScript execution for development server
- **esbuild** - Fast JavaScript bundler for production builds
- **PostCSS** - CSS processing with Tailwind integration
- **@replit/vite-plugin-runtime-error-modal** - Development error overlay for Replit environment

### Database
- **npx drizzle-kit generate** - npx drizzle-kit generate
- **npx drizzle-kit push** -npx drizzle-kit push

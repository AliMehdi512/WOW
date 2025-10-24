# Energetic AI - Business-Class AI Chatbot Platform

## Overview

Energetic AI is a sophisticated, business-class AI chatbot platform that provides an elegant interface for dynamic, responsive AI interactions. The application combines modern design aesthetics with advanced AI capabilities, featuring both "Energetic AI" (dynamic, responsive interactions) and "Agentic AI" (autonomous decision-making) modes. The platform emphasizes premium visual design with glassmorphism, gradient treatments, and smooth micro-interactions to communicate enterprise-grade quality.

The application is built as a full-stack TypeScript application with a React frontend and Express backend, designed to provide real-time streaming chat responses with visual indicators for AI processing states and capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript and Vite as the build tool

**Routing**: Wouter for lightweight client-side routing

**UI Component System**: 
- **Design Foundation**: Hybrid approach combining Material Design 3 principles with custom premium elements
- **Component Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for business-class aesthetic
- **Theme System**: Dark mode by default with CSS custom properties for theming
- **Typography**: Inter (primary UI font) and Space Grotesk (accent font) loaded via Google Fonts

**Design Philosophy**:
- Futuristic glassmorphism aesthetic with backdrop blur effects
- Dynamic gradient treatments for AI capability visualization
- Premium sophistication through refined minimalism
- Visual feedback systems that reveal AI processing states
- Distinction between Energetic AI and Agentic AI modes through visual language

**State Management**:
- TanStack Query (React Query) for server state management and caching
- Local React hooks for component-level state
- Optimistic updates for immediate user feedback during chat interactions

**Key Features**:
- Real-time streaming chat responses with custom hook (`useStreamingChat`)
- Visual processing indicators and typing animations
- Energy meter visualization for system activity
- Agentic AI badge system for autonomous actions
- Suggestion chips for guided interactions
- Message bubble system with glassmorphic styling and avatars

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js

**API Structure**: RESTful endpoints with streaming support
- `GET /api/messages` - Retrieve all chat messages
- `POST /api/chat` - Send messages and receive AI responses (supports streaming)

**Request Processing**:
- JSON body parsing with raw body preservation for webhook verification
- Request/response logging middleware with performance timing
- Server-Sent Events (SSE) for streaming AI responses

**AI Integration**:
- External AI API integration via MLVO API (`MLVO_API_URL` environment variable)
- Support for both streaming and non-streaming response modes
- Response metadata tracking (response time, agentic actions)

**Development Features**:
- Vite middleware integration in development mode
- Hot module replacement (HMR) support
- Runtime error overlay for development debugging
- Replit-specific plugins for enhanced development experience

### Data Storage Solutions

**Current Implementation**: In-memory storage via `MemStorage` class
- Messages stored in Map data structure with UUID keys
- User data management (though authentication not currently implemented)
- Designed with interface (`IStorage`) for easy database migration

**Database Schema** (Drizzle ORM - PostgreSQL ready):
- **messages table**: 
  - id (UUID primary key)
  - role (enum: "user" | "assistant")
  - content (text)
  - timestamp (timestamp with default)
  - responseTime (integer, nullable)
  - agenticActions (text array, nullable)
  
- **users table**:
  - id (UUID primary key)
  - username (text, unique)
  - password (text)

**Migration Path**: The application uses Drizzle Kit for database migrations with PostgreSQL dialect configured. The schema is defined but currently using in-memory storage. To enable persistent storage, provision a PostgreSQL database and set the `DATABASE_URL` environment variable.

### Authentication and Authorization

**Current State**: User schema exists but authentication is not implemented. The system is currently open for all users without authentication requirements.

**Prepared Infrastructure**: User management functions exist in storage layer, suggesting future authentication implementation.

### External Dependencies

**Third-Party Services**:
- **MLVO AI API**: External AI service for generating chat responses
  - Endpoint configurable via `MLVO_API_URL` environment variable
  - Supports streaming and non-streaming modes
  - Default: `https://api.mlvo.ai/v1/chat/completions`

**Database**:
- **Neon Database**: Serverless PostgreSQL solution (`@neondatabase/serverless`)
- Currently not active but configured for future use
- Connection via `DATABASE_URL` environment variable

**UI Component Libraries**:
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **shadcn/ui**: Pre-styled components built on Radix UI
- **Lucide React**: Icon library for consistent iconography

**Development Tools**:
- **Replit Plugins**: Development banner, cartographer, and runtime error modal
- **Vite**: Build tool and development server
- **esbuild**: Production bundler for server code

**Styling and Utilities**:
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx/tailwind-merge**: Conditional className utilities

**Form Management**:
- **React Hook Form**: Form state and validation
- **Zod**: Schema validation with Drizzle integration
- **@hookform/resolvers**: Zod resolver for React Hook Form

**Date Handling**:
- **date-fns**: Modern date utility library

**Additional Libraries**:
- **embla-carousel-react**: Carousel functionality
- **cmdk**: Command menu component
- **vaul**: Drawer component primitive
- **react-day-picker**: Date picker component
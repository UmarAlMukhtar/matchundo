# MatchUndo Architecture v1

## Architecture Principles

* Monolith first
* Single deployment unit
* Single PostgreSQL database
* Simplicity over scalability
* Optimize for learning and maintainability

---

# System Architecture

```text
Browser
    │
    ▼
Next.js Application
    │
    ├── App Router
    ├── Server Actions
    ├── API Routes
    ├── Authentication
    │
    ▼
Prisma ORM
    │
    ▼
PostgreSQL
```

---

# Frontend Architecture

## Framework

* Next.js App Router
* TypeScript
* TailwindCSS
* shadcn/ui

## Routes

```text
/

/explore

/events/[id]

/create

/dashboard

/dashboard/events

/dashboard/requests

/admin

/auth/signin
```

---

# Backend Architecture

## API Modules

### Authentication

```text
/auth/*
```

Responsibilities:

* Login
* Session management
* User creation

---

### Matches

```text
/api/matches
```

Responsibilities:

* List matches
* Admin creates matches
* Admin updates matches

---

### Events

```text
/api/events
```

Responsibilities:

* Create event
* Update event
* Delete event
* Browse events

---

### Join Requests

```text
/api/requests
```

Responsibilities:

* Create request
* Approve request
* Reject request

---

# Database Relationships

```text
User
 ├── Events
 └── JoinRequests

Competition
 └── Matches

Match
 └── Events

Event
 ├── Host
 └── JoinRequests
```

---

# Folder Structure

```text
src/

├── app/
│
├── components/
│
├── features/
│   ├── auth/
│   ├── matches/
│   ├── events/
│   ├── requests/
│   └── dashboard/
│
├── lib/
│   ├── prisma/
│   ├── auth/
│   └── utils/
│
├── server/
│
├── hooks/
│
└── types/
```

---

# Authentication

Provider:

* Google OAuth

Session Strategy:

* JWT

User Creation:

* Automatic on first login

Roles:

```text
USER
ADMIN
```

---

# Event Status

```text
DRAFT

PUBLISHED

CANCELLED

COMPLETED
```

---

# Request Status

```text
PENDING

APPROVED

REJECTED
```

---

# Approval Modes

```text
AUTO

MANUAL
```

---

# Contact Methods

```text
PHONE

WHATSAPP
```

---

# Venue Types

```text
PUBLIC

HOME
```

---

# Deployment Architecture

```text
Internet
    │
    ▼
Nginx
    │
    ▼
Next.js Container
    │
    ▼
PostgreSQL Container
```

---

# Environment Variables

```env
DATABASE_URL=

NEXTAUTH_URL=

NEXTAUTH_SECRET=

GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=
```

---

# CI/CD

GitHub
↓
GitHub Actions
↓
Build
↓
Docker Image
↓
Deploy VPS

---

# Monitoring (Later)

* Uptime Monitoring
* Error Tracking
* Application Logs
* Database Health

---

# Security

V1 Requirements:

* Auth required for create event
* Auth required for join event
* Host-only event editing
* Admin-only match management
* Input validation on all forms

Avoid:

* Custom auth systems
* Complex permissions
* RBAC frameworks

# MatchUndo PRD v1

## Overview

MatchUndo is a platform that helps people discover and host watch parties for live events.

The initial launch focuses on FIFA World Cup watch parties in Kerala, while the platform architecture should support future expansion to other sports and live events.

Examples:

* FIFA World Cup
* ICC Cricket World Cup
* IPL
* Formula 1
* UFC
* Esports
* Movie screenings

---

# Problem

People often want to watch major sporting events with others but do not know where public screenings, watch parties, or community gatherings are happening.

Hosts also have no simple way to announce and manage small watch parties.

Current solutions rely on WhatsApp groups, Instagram stories, and word-of-mouth.

---

# Goals

## User Goals

* Discover nearby watch parties
* Join existing events
* Host and manage watch parties
* Connect with other fans around live events

## Business Goals

* Become the default discovery platform for watch parties in Kerala
* Validate demand before expanding to other regions and event categories

---

# Non-Goals (V1)

The following are explicitly excluded:

* Payments
* Ratings and reviews
* In-app chat
* Social feed
* Following users
* Communities
* AI recommendations
* Government ID verification
* Push notifications
* Ticketing

---

# User Types

## Host

Can:

* Create events
* Manage requests
* Approve or reject users
* Cancel events

## Joiner

Can:

* Browse events
* Request to join
* View approved events
* Access host contact information after approval

## Admin

Can:

* Create matches
* Edit matches
* Remove events
* Moderate content

---

# User Flow

## Host Flow

Login
→ Create Event
→ Select Match
→ Add Venue
→ Configure Event
→ Publish
→ Manage Requests

## Joiner Flow

Login
→ Browse Events
→ Open Event
→ Request Join
→ Approval
→ Access Contact Information

---

# Event Types

## Venue Type

* Public Venue
* Private Home

## Approval Mode

* Auto Approve
* Manual Approve

## Contact Method

* Phone Number
* WhatsApp Invite Link

---

# Core Features

## Authentication

* Google Login

---

## Match Management

Admin creates matches.

Fields:

* Sport
* Competition
* Home Team
* Away Team
* Start Time

Hosts select existing matches when creating events.

---

## Event Creation

Host can:

* Select Match
* Add Venue Name
* Choose Venue Type
* Add Description
* Set Maximum Seats
* Select Approval Mode
* Select Contact Method
* Set Location

---

## Event Discovery

### List View

Users can:

* Search
* Filter
* Sort

### Map View

Users can:

* View nearby events
* Open event details

---

## Join Requests

Users can request to join.

Statuses:

* Pending
* Approved
* Rejected

---

## Dashboard

### Host Dashboard

* Created Events
* Pending Requests
* Approved Members

### User Dashboard

* Joined Events
* Pending Requests

---

# Location System

Platform operates across Kerala.

Users may:

* Use current location
* Select a custom location

Events store:

* Latitude
* Longitude

Distance-based search should be supported.

---

# Database Entities

## User

* id
* name
* email
* image
* role
* createdAt
* updatedAt

---

## Sport

* id
* name

Examples:

* Football
* Cricket
* Formula 1

---

## Competition

* id
* sportId
* name

Examples:

* FIFA World Cup
* IPL
* ICC World Cup

---

## Match

* id
* competitionId
* homeTeam
* awayTeam
* startTime
* status

---

## Event

* id

* hostId

* matchId

* title

* description

* venueName

* venueType

* latitude

* longitude

* maxSeats

* approvalMode

* contactMethod

* contactValue

* status

* createdAt

* updatedAt

---

## JoinRequest

* id
* eventId
* userId
* status
* createdAt

---

# Technology Stack

Frontend:

* Next.js
* TypeScript
* TailwindCSS
* shadcn/ui

Backend:

* Next.js API Routes

Database:

* PostgreSQL
* Prisma ORM

Authentication:

* NextAuth

Maps:

* MapLibre

Infrastructure:

* Docker
* Ubuntu VPS
* Nginx

CI/CD:

* GitHub Actions

---

# Success Criteria

A user can:

1. Login
2. Discover events
3. Create an event
4. Request to join
5. Get approved
6. Contact the host

without leaving the platform except for final coordination through phone or WhatsApp.

---

# Milestone 1

Deliver:

* Authentication
* Database
* Match Management
* Event Creation
* Event Discovery (List View)

---

# Milestone 2

Deliver:

* Join Requests
* Approval System
* Dashboards

---

# Milestone 3

Deliver:

* Map View
* Location Search
* Distance Filtering

---

# Milestone 4

Deliver:

* Docker
* VPS Deployment
* HTTPS
* GitHub Actions
* Monitoring

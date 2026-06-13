# MatchUndo UI Specification v1

## Design Principles

* Mobile first
* Fast event discovery
* Minimal friction
* No social-media style feed

---

# Landing Page

URL:

```text
/
```

Sections:

## Hero

Headline:

Find people to watch the game with.

Subheadline:

Discover and host watch parties across Kerala.

Buttons:

* Explore Events
* Host an Event

---

## Upcoming Matches

Horizontal cards.

Example:

```text
Argentina vs Algeria

World Cup

16 Jun
```

---

## Featured Events

Event cards.

---

# Explore Page

URL:

```text
/explore
```

Tabs:

```text
List
Map
```

---

## Filters

Search

Competition

Sport

Date

Venue Type

Distance

---

## Event Card

Display:

```text
Match

Venue

Distance

Seats Left

Date

Venue Type
```

Button:

```text
View Event
```

---

# Event Detail Page

URL:

```text
/events/[id]
```

Sections:

## Event Header

Match

Competition

Date

---

## Host Information

Profile Picture

Host Name

---

## Venue Information

Venue Name

Venue Type

Map

---

## Event Information

Description

Seats Available

Approval Mode

---

## CTA

Request Join

---

# Create Event

URL:

```text
/create
```

Multi-Step Form

---

## Step 1

Select Match

Dropdown Search

---

## Step 2

Venue

Venue Name

Venue Type

Location Picker

---

## Step 3

Configuration

Max Seats

Approval Mode

Contact Method

---

## Step 4

Description

Event Description

---

## Step 5

Review

Publish Event

---

# User Dashboard

URL:

```text
/dashboard
```

Tabs:

## Joined Events

List of approved events.

---

## Pending Requests

Pending approvals.

---

# Host Dashboard

URL:

```text
/dashboard/events
```

Event List

Each card shows:

* Requests
* Approved Users
* Seats Remaining

Actions:

* Edit
* Cancel
* View Requests

---

# Request Management

URL:

```text
/dashboard/requests
```

Request Card:

User Name

Profile Photo

Request Date

Buttons:

Approve

Reject

---

# Admin Dashboard

URL:

```text
/admin
```

Sections:

## Matches

Create Match

Edit Match

Delete Match

---

## Events

Remove Event

Moderate Event

---

# Empty States

No Events:

```text
No watch parties found nearby.
Try expanding your search area.
```

---

# Loading States

Skeleton loaders for:

* Event cards
* Match cards
* Dashboard

---

# Mobile Navigation

Bottom Navigation

```text
Home

Explore

Create

Dashboard

Profile
```

---

# Desktop Navigation

Top Navigation

```text
Logo

Explore

Create

Dashboard

Profile
```

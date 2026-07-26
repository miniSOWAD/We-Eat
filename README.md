<!--
  WE EAT — GITHUB README
  Replace before publishing:
  YOUR_GITHUB_USERNAME
  YOUR_REPOSITORY_NAME
  YOUR_NETLIFY_URL
  YOUR_FASTAPI_URL
  YOUR_CONTACT_EMAIL
-->

<div align="center">

<img src="./frontend/public/logo.svg" alt="We Eat logo" width="190" />

We Eat

Share surplus food. Rescue good meals. Build local trust.

<img
src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=22&pause=1000&color=8CA9FF&center=true&vCenter=true&width=800&lines=Free%2C+discounted+and+exchange+food+sharing;Private+pickup+and+controlled+handover+workflows;Reputation%2C+moderation+and+completion-based+reviews;A+mobile-first+community+marketplace"
alt="Animated We Eat feature summary"
/>

<p>
  <a href="YOUR_NETLIFY_URL"><strong>Live Application</strong></a>
  ·
  <a href="YOUR_FASTAPI_URL/health"><strong>API Health</strong></a>
  ·
  <a href="YOUR_FASTAPI_URL/docs"><strong>API Documentation</strong></a>
  ·
  <a href="#-local-development"><strong>Run Locally</strong></a>
</p>

<p>
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql" alt="Neon PostgreSQL" />
  <img src="https://img.shields.io/badge/Cloudinary-Media-3448C5?style=for-the-badge&logo=cloudinary" alt="Cloudinary" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
</p>

<p>
  <img src="https://img.shields.io/badge/Authentication-OTP%20%2B%20JWT-8CA9FF?style=flat-square" alt="OTP and JWT" />
  <img src="https://img.shields.io/badge/Passwords-Argon2-FFF2C6?style=flat-square&labelColor=1A2235" alt="Argon2" />
  <img src="https://img.shields.io/badge/Design-Mobile%20First-AAC4F5?style=flat-square&labelColor=1A2235" alt="Mobile first" />
  <img src="https://img.shields.io/badge/Status-Production%20Oriented-success?style=flat-square" alt="Production oriented" />
</p>

</div>

Contents

Overview

The problem

The solution

Core capabilities

Trust and fraud prevention

Handover workflow

User roles

Architecture

Technology stack

Database

Repository structure

Local development

Environment variables

Deployment

Security model

Screenshots

Roadmap

Contributing

License

🌍 Overview

We Eat is a mobile-first food-sharing marketplace that helps individuals, families, restaurants and community organizations redistribute usable food before it becomes waste.

The platform supports three listing models:

Listing type

Purpose

Free

Give surplus food without payment

Discounted

Sell usable surplus below its original price

Exchange

Trade one food item for another

We Eat is not a basic classified-ad board. It combines identity verification, private handover details, proposal tracking, reputation points, cancellation accountability, moderation and two-party completion confirmation.

The platform cannot guarantee that fraud will never occur. Its purpose is to reduce abuse, preserve evidence, expose reliability signals and give the community practical tools to make safer decisions.

❗ The problem

Edible food is often discarded because:

households prepare more than they can consume;

restaurants and shops have safe surplus near closing time;

people nearby do not know that food is available;

ordinary marketplaces expose too much private information;

informal handovers lack structured accountability;

users may accept food and disappear without explanation;

reviews can be manipulated when they are not tied to completed transactions.

At the same time, people facing financial pressure or temporary food insecurity may be only a short distance away.

💡 The solution

We Eat creates a structured local marketplace where food can move from a potential waste stream to another table.

The application combines:

local discovery by city, area, category and arrangement;

email OTP registration;

username or email login;

owner-controlled proposal lists;

pickup or delivery scheduling;

private pickup information;

live proposal and handover status;

provider and receiver confirmation;

positive and negative reputation points;

cancellation explanations;

completion-based reviews;

reporting, moderation and audit history.

✨ Core capabilities

Food discovery

Users can narrow listings by:

keyword;

city;

area;

category;

free, discounted or exchange arrangement.

Exact pickup information remains private until the authorized workflow stage.

Food listing management

A provider can:

upload images;

create free, discounted or exchange listings;

set quantity and unit;

add preparation and expiry information;

define city and area;

identify allergens;

add protected pickup details;

update, reserve, complete or remove a listing.

Private proposal list

Only the listing owner can see requester identities, messages and offers.

The owner can:

inspect requester reputation;

review requests or exchange offers;

accept one proposal;

reject proposals;

choose pickup or delivery;

schedule the handover;

add handover notes.

Other visitors see only the proposal count.

Proposal status dock

A requester receives a floating status control showing whether the proposal is:

pending;

waiting while another handover is active;

accepted;

rejected;

cancelled;

completed;

delivered to someone else.

Controlled completion

A transaction cannot be completed by one party alone.

Requester confirms received
            ↓
Provider confirms delivered
            ↓
Transaction completes
            ↓
Reviews and positive points unlock

Reputation

Every account exposes:

+ Positive points
- Negative points

Positive points are awarded after a completed handover.

Negative points may be applied when an accepted participant cancels and the affected party chooses to mark the cancellation after reading the required explanation.

Role-specific dashboards

User

My listed food

Completed deals

Saved food

Settings

Submit a report

Moderator

Reports

Users

Listings

Audit history

Settings

Suspend or restore basic users

Administrator

Users

Moderators

Reports

Listings

Audit history

Role and account management

🛡️ Trust and fraud prevention

We Eat uses layered controls instead of relying on a single trust signal.

Layer

Protection

Verified registration

Email OTP is required before account creation

Password protection

Passwords are stored as Argon2 hashes

Session protection

JWT is stored in an HTTP-only cookie

Live role validation

Protected actions check current database role and account status

Pickup privacy

Exact pickup information is excluded from public listing responses

Proposal privacy

Only the provider can view the full proposal list

Two-party completion

Provider cannot finish a deal before receiver confirmation

Transaction reviews

Reviews unlock only after a completed order or exchange

Reputation points

Reliability is visible near user identities

Cancellation accountability

Accepted cancellations require an explanation

Moderation

Reports, suspension and listing removal are supported

Audit trail

Administrative actions are recorded

Media validation

Images are checked before Cloudinary upload

🔄 Handover workflow

sequenceDiagram
    actor Provider
    actor Requester
    participant Web as Next.js
    participant API as FastAPI
    participant DB as Neon PostgreSQL

    Provider->>Web: Publish food listing
    Web->>API: Create listing
    API->>DB: Save public and private details

    Requester->>Web: Submit proposal
    Web->>API: Create order or exchange request
    API->>DB: Save pending proposal

    Provider->>Web: Review private proposal list
    Provider->>Web: Accept and schedule handover
    Web->>API: Accept selected proposal
    API->>DB: Reserve listing

    Requester->>Web: Open active handover
    Requester->>API: Confirm received
    API->>DB: Save receiver confirmation

    Provider->>API: Confirm delivered
    API->>DB: Complete transaction and award points

    API-->>Web: Unlock review workflow

👥 User roles

Capability

Anonymous

User

Moderator

Admin

Browse food

✅

✅

✅

✅

Create listings

❌

✅

✅

✅

Submit proposals

❌

✅

✅

✅

View full proposal list

❌

Owner only

Owner only

Owner only

Manage own listings

❌

✅

✅

✅

Submit reports

❌

✅

✅

✅

Suspend basic users

❌

❌

✅

✅

Manage reports

❌

❌

✅

✅

Promote moderators

❌

❌

❌

✅

Revoke moderators

❌

❌

❌

✅

View audit history

❌

❌

✅

✅

🏗️ Architecture

flowchart TD
    U[Mobile or Desktop Browser]
    N[Next.js Frontend]
    P[Next.js API Proxy]
    F[FastAPI Backend]
    D[(Neon PostgreSQL)]
    C[Cloudinary]
    E[SMTP Email Provider]

    U --> N
    N --> P
    P -->|HTTP-only session and API calls| F
    F --> D
    F --> C
    F --> E

React component
      ↓
Next.js route handler
      ↓
HTTP-only session
      ↓
FastAPI route
      ↓
Pydantic validation
      ↓
Authorization and business rules
      ↓
SQLAlchemy async session
      ↓
Neon PostgreSQL

🧰 Technology stack

Frontend

Next.js 16

React

TypeScript

App Router

CSS Modules

GSAP

Framer Motion

Lucide icons

Mobile bottom navigation

Light and dark themes

Backend

FastAPI

Pydantic

SQLAlchemy Async

asyncpg

Alembic

Argon2

JWT

SMTP OTP delivery

Cloudinary SDK

Infrastructure

Neon PostgreSQL

Cloudinary media storage

FastAPI Cloud or compatible ASGI hosting

Netlify-compatible Next.js deployment

🗄️ Database

Current compatibility target:

We Eat backend v1.4.1+
Alembic head: 20260726_0005

Table

Purpose

users

Accounts, roles, profiles and reputation

otp_codes

Registration and password-reset OTP

listings

Public food listings

listing_images

Cloudinary listing media

listing_private_details

Protected pickup data

favorites

Saved listings

comments

Listing discussions

orders

Free and discounted proposals

exchange_requests

Exchange proposals

reviews

Completed-transaction reviews

reports

Community reports

audit_logs

Administrative history

point_notifications

Persistent reputation notices

A portable complete Neon schema is included in the repository database folder.

🔌 API areas

/api/v1/auth
/api/v1/users
/api/v1/listings
/api/v1/favorites
/api/v1/comments
/api/v1/orders
/api/v1/exchanges
/api/v1/reviews
/api/v1/reports
/api/v1/moderation
/api/v1/admin
/api/v1/notifications

Health endpoints:

GET /health
GET /ready

📁 Repository structure

We Eat/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   ├── package.json
│   └── next.config.ts
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   ├── alembic/
│   ├── scripts/
│   ├── tests/
│   ├── requirements.txt
│   └── pyproject.toml
│
├── database/
├── netlify.toml
└── README.md

🚀 Local development

Requirements

Node.js 20.9+

npm

Python 3.12+

Neon PostgreSQL

Cloudinary

SMTP account or Gmail App Password

Clone

git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git
cd YOUR_REPOSITORY_NAME

Backend

cd backend

py -3.13 -m venv .venv

.\.venv\Scripts\python.exe -m pip install --upgrade pip setuptools wheel

.\.venv\Scripts\python.exe -m pip install -e .

.\.venv\Scripts\python.exe -m alembic upgrade head

.\.venv\Scripts\python.exe -m uvicorn app.main:app `
  --reload `
  --host 127.0.0.1 `
  --port 8000

Backend:

http://127.0.0.1:8000/health
http://127.0.0.1:8000/ready
http://127.0.0.1:8000/docs

Frontend

cd frontend

npm install
npm run dev

Frontend:

http://localhost:3000

Validation

cd frontend

npm run check
npm run build

cd backend

.\.venv\Scripts\python.exe -m pytest

🔐 Environment variables

Never commit real .env files.

Backend .env

APP_ENV=development
APP_DEBUG=false

DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
DATABASE_SSL_MODE=require

JWT_SECRET=GENERATE_A_LONG_RANDOM_SECRET
OTP_PEPPER=GENERATE_A_DIFFERENT_RANDOM_SECRET

CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

EMAIL_MODE=smtp
SMTP_PROVIDER=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-google-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=We Eat
SMTP_START_TLS=true
SMTP_USE_TLS=false

CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
CLOUDINARY_FOLDER=we-eat

Frontend .env.local

BACKEND_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SESSION_COOKIE_NAME=we_eat_session

Do not append /api/v1 to BACKEND_API_URL.

☁️ Deployment

FastAPI backend

uvicorn app.main:app --host 0.0.0.0 --port $PORT

Verify:

https://YOUR_FASTAPI_URL/health
https://YOUR_FASTAPI_URL/ready

Netlify frontend

Root netlify.toml:

[build]
  base = "frontend"
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

Netlify variables:

BACKEND_API_URL=https://YOUR_FASTAPI_URL
NEXT_PUBLIC_SITE_URL=https://YOUR_NETLIFY_URL
SESSION_COOKIE_NAME=we_eat_session

🔒 Security model

Authentication

OTP-verified registration

username or email login

Argon2 password hashing

signed JWT access token

HTTP-only cookie

account token versioning

suspended-account blocking

Authorization

backend-enforced permissions

live database role checks

owner-only listing management

private proposal endpoints

moderator and administrator separation

Abuse resistance

proposal ownership checks

completion sequencing

duplicate review prevention

duplicate reputation prevention

one-time cancellation review

report investigation

account suspension

role-change session invalidation

📸 Screenshots

Create docs/screenshots/ and add your final screenshots using these names.

<div align="center">

Home

Find Food





Listing and Proposals

Dashboard





Mobile Navigation

Dark Mode





</div>

🗺️ Roadmap

Push notifications

Map-based local discovery

Bangla and English interfaces

Restaurant and organization verification

Food-safety expiry reminders

Moderation analytics

Accessibility audit

Android and iOS wrappers

Trusted community pickup locations

Advanced rate limiting and anti-spam controls

🤝 Contributing

Fork the repository.

Create a feature branch.

git checkout -b feature/your-feature

Commit and push.

git commit -m "Add your feature"
git push origin feature/your-feature

Open a pull request.

Preserve the architecture:

Next.js frontend
→ Next.js API proxy
→ FastAPI backend
→ Neon PostgreSQL and Cloudinary

Do not bypass backend authorization or expose private pickup data.

⚠️ Responsible-use notice

We Eat helps communities coordinate food sharing, but software cannot independently certify food safety.

Providers must describe food honestly. Receivers must use personal judgment. A public launch should include local food-safety guidance, community rules, a privacy policy and terms of use.

📄 License

Add a license before public distribution.

Example:

MIT License
Copyright (c) 2026 YOUR_NAME

<div align="center">

Built to move good food—not waste—from one table to another.

<img
src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=18&pause=1200&color=AAC4F5&center=true&vCenter=true&width=700&lines=Share+responsibly.;Coordinate+safely.;Build+community+trust."
alt="Animated closing message"
/>

We Eat

<a href="YOUR_NETLIFY_URL">Live application</a>·<a href="mailto:YOUR_CONTACT_EMAIL">Contact</a>

</div>

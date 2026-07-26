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
  <a href="we-eat-live.netlify.app"><strong>Live Application</strong></a>
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

🌍 Project at a glance

<table>
  <tr>
    <td align="center" width="25%">
      <strong>3</strong><br />
      <sub>listing models</sub>
    </td>
    <td align="center" width="25%">
      <strong>2-party</strong><br />
      <sub>completion confirmation</sub>
    </td>
    <td align="center" width="25%">
      <strong>Private</strong><br />
      <sub>pickup and proposals</sub>
    </td>
    <td align="center" width="25%">
      <strong>Role-based</strong><br />
      <sub>moderation</sub>
    </td>
  </tr>
</table>

We Eat is a mobile-first food-sharing marketplace that helps households, individuals, restaurants and community groups move usable surplus food to people nearby before it becomes waste.

It supports:

<p align="center">
  <img src="https://img.shields.io/badge/FREE-Give%20without%20payment-52B788?style=for-the-badge" alt="Free listing" />
  <img src="https://img.shields.io/badge/DISCOUNTED-Sell%20below%20original%20price-F4B942?style=for-the-badge" alt="Discounted listing" />
  <img src="https://img.shields.io/badge/EXCHANGE-Trade%20food%20for%20food-8CA9FF?style=for-the-badge" alt="Exchange listing" />
</p>

We Eat is not just a listing board. It combines verified accounts, private proposals, scheduled handovers, reputation, cancellation accountability, reports and completion-based reviews.

🎯 Why We Eat

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>❗ The problem</h3>
      <ul>
        <li>Usable food is discarded because nearby demand is invisible.</li>
        <li>Informal handovers expose personal information.</li>
        <li>Accepted participants may disappear without explanation.</li>
        <li>Ordinary reviews are easy to manipulate.</li>
        <li>Providers and receivers lack a shared accountability trail.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>💡 The response</h3>
      <ul>
        <li>Search by city, area, category and arrangement.</li>
        <li>Keep exact pickup details private.</li>
        <li>Let owners review proposals before accepting.</li>
        <li>Require both parties to confirm completion.</li>
        <li>Connect reputation and reviews to real handovers.</li>
      </ul>
    </td>
  </tr>
</table>

⚡ What the platform offers

<table>
  <tr>
    <td width="33%" valign="top">
      <h3>🔎 Local discovery</h3>
      Search by keyword, city, area, food category and listing type.
    </td>
    <td width="33%" valign="top">
      <h3>🥘 Flexible sharing</h3>
      Publish free, discounted or exchange listings with quantities and expiry details.
    </td>
    <td width="33%" valign="top">
      <h3>🗂 Private proposals</h3>
      The provider sees full proposals; other visitors see only the proposal count.
    </td>
  </tr>
  <tr>
    <td width="33%" valign="top">
      <h3>📍 Controlled handover</h3>
      Choose pickup or delivery, set a time and share protected instructions.
    </td>
    <td width="33%" valign="top">
      <h3>🟢 Reputation</h3>
      Positive and negative point totals appear beside user identities.
    </td>
    <td width="33%" valign="top">
      <h3>🛡 Moderation</h3>
      Reports, suspension, listing review and administrative audit history.
    </td>
  </tr>
</table>

<details>
<summary><strong>See the complete feature set</strong></summary>

<br />

Provider tools

Upload listing images through Cloudinary

Add preparation time, expiry, quantity, allergens, city and area

Store pickup details separately from public listing data

Review private proposals

Accept, reject or schedule a handover

Confirm delivery only after receiver confirmation

Remove or complete listings

Receiver tools

Save listings

Submit a free, discounted or exchange proposal

Follow proposal status through a floating status dock

View accepted handover time and instructions

Confirm receipt

Review the provider after completion

Account tools

Email OTP registration

Username or email login

Profile photo upload

Dark mode

User, moderator and administrator dashboards

Persistent reputation notifications

Report submission

</details>

🛡 Trust & fraud resistance

The platform does not claim that software can eliminate fraud. It reduces risk by creating friction, evidence and visible accountability.

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>🔐 Identity & access</h3>
      <ul>
        <li>Email OTP before registration</li>
        <li>Argon2 password hashing</li>
        <li>JWT in an HTTP-only cookie</li>
        <li>Current database role and account-status checks</li>
        <li>Session invalidation after role or status changes</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>🙈 Privacy by design</h3>
      <ul>
        <li>Exact pickup details are not public</li>
        <li>Only owners see full proposal information</li>
        <li>No direct browser-to-database access</li>
        <li>Secrets remain in environment variables</li>
        <li>Media is stored outside PostgreSQL</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>🤝 Transaction accountability</h3>
      <ul>
        <li>Receiver confirms first</li>
        <li>Provider confirms second</li>
        <li>Reviews unlock after completion</li>
        <li>Duplicate points and reviews are blocked</li>
        <li>Accepted cancellation requires an explanation</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>🚨 Community protection</h3>
      <ul>
        <li>Visible reputation totals</li>
        <li>Cancellation marking</li>
        <li>Report investigation</li>
        <li>User suspension</li>
        <li>Recorded administrative actions</li>
      </ul>
    </td>
  </tr>
</table>

Important: reputation is a decision-support signal, not proof of identity, food safety or future behavior.

🔄 How a handover works

sequenceDiagram
    actor P as Provider
    actor R as Receiver
    participant W as We Eat
    participant D as Database

    P->>W: Publish food
    W->>D: Save public + private details
    R->>W: Submit proposal
    W->>D: Save pending proposal
    P->>W: Review and accept
    W->>D: Reserve listing + schedule handover
    R->>W: Confirm received
    W->>D: Record receiver confirmation
    P->>W: Confirm delivered
    W->>D: Complete deal + award points
    W-->>P: Review unlocked
    W-->>R: Review unlocked

<p align="center">
  <strong>Request → Review → Accept → Schedule → Receive → Deliver → Review</strong>
</p>

👥 Role model

Capability

Visitor

User

Moderator

Admin

Browse listings

✅

✅

✅

✅

Create listings and proposals

—

✅

✅

✅

Manage own food and deals

—

✅

✅

✅

Submit reports

—

✅

✅

✅

Suspend basic users

—

—

✅

✅

Review reports and listings

—

—

✅

✅

Promote or revoke moderators

—

—

—

✅

View administrative audit history

—

—

✅

✅

🏗 System design

flowchart LR
    Browser["Mobile / Desktop Browser"]
    Next["Next.js Frontend"]
    Proxy["Next.js API Proxy"]
    API["FastAPI Backend"]
    DB[("Neon PostgreSQL")]
    Media["Cloudinary"]
    Mail["SMTP Email"]

    Browser --> Next
    Next --> Proxy
    Proxy --> API
    API --> DB
    API --> Media
    API --> Mail

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>Frontend</h3>
      <code>Next.js 16</code><br />
      <code>React</code><br />
      <code>TypeScript</code><br />
      <code>CSS Modules</code><br />
      <code>GSAP</code><br />
      <code>Framer Motion</code>
    </td>
    <td width="50%" valign="top">
      <h3>Backend & cloud</h3>
      <code>FastAPI</code><br />
      <code>SQLAlchemy Async</code><br />
      <code>asyncpg</code><br />
      <code>Alembic</code><br />
      <code>Neon PostgreSQL</code><br />
      <code>Cloudinary</code>
    </td>
  </tr>
</table>

🗄 Data model

<p align="center">
  <img src="https://img.shields.io/badge/13-Core%20Tables-14213D?style=for-the-badge" alt="Core tables" />
  <img src="https://img.shields.io/badge/Alembic-Versioned-8CA9FF?style=for-the-badge" alt="Alembic migrations" />
  <img src="https://img.shields.io/badge/Async-PostgreSQL-4169E1?style=for-the-badge" alt="Async PostgreSQL" />
</p>

Domain

Main tables

Identity

users, otp_codes

Food

listings, listing_images, listing_private_details

Community

favorites, comments, reports

Transactions

orders, exchange_requests, reviews

Accountability

audit_logs, point_notifications

<details>
<summary><strong>Database portability</strong></summary>

<br />

The repository includes:

a complete schema for a brand-new Neon database;

incremental Alembic migrations;

verification SQL;

indexes, foreign keys, enums and constraints.

A fresh database can be prepared and connected by updating only the backend DATABASE_URL.

Schema initialization creates an empty compatible database. Existing records require a PostgreSQL data export and import.

</details>

📸 Product preview

Add final screenshots under docs/screenshots/ using these filenames.

<table>
  <tr>
    <td align="center"><strong>Home</strong></td>
    <td align="center"><strong>Find food</strong></td>
  </tr>
  <tr>
    <td><img src="./docs/screenshots/home.png" alt="We Eat home page" /></td>
    <td><img src="./docs/screenshots/find-food.png" alt="We Eat food discovery" /></td>
  </tr>
  <tr>
    <td align="center"><strong>Proposal workflow</strong></td>
    <td align="center"><strong>Dashboard</strong></td>
  </tr>
  <tr>
    <td><img src="./docs/screenshots/proposals.png" alt="We Eat proposal workflow" /></td>
    <td><img src="./docs/screenshots/dashboard.png" alt="We Eat dashboard" /></td>
  </tr>
</table>

🚀 Quick start

<details open>
<summary><strong>1. Clone and prepare the project</strong></summary>

git clone https://github.com/miniSOWAD/We-Eat.git
cd We-Eat

Requirements:

Node.js 20.9+

npm

Python 3.12+

Neon PostgreSQL

Cloudinary

SMTP account or Gmail App Password

</details>

<details>
<summary><strong>2. Start the FastAPI backend</strong></summary>

cd backend

py -3.13 -m venv .venv

.\.venv\Scripts\python.exe -m pip install --upgrade pip setuptools wheel
.\.venv\Scripts\python.exe -m pip install -e .
.\.venv\Scripts\python.exe -m alembic upgrade head

.\.venv\Scripts\python.exe -m uvicorn app.main:app `
  --reload `
  --host 127.0.0.1 `
  --port 8000

API:   http://127.0.0.1:8000
Docs:  http://127.0.0.1:8000/docs
Ready: http://127.0.0.1:8000/ready

</details>

<details>
<summary><strong>3. Start the Next.js frontend</strong></summary>

cd frontend

npm install
npm run dev

http://localhost:3000

Production validation:

npm run check
npm run build

</details>

🔐 Configuration

<details>
<summary><strong>Backend environment</strong></summary>

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

</details>

<details>
<summary><strong>Frontend environment</strong></summary>

BACKEND_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SESSION_COOKIE_NAME=we_eat_session

Do not append /api/v1 to BACKEND_API_URL.

</details>

☁️ Deployment

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>FastAPI</h3>
      <pre><code>uvicorn app.main:app --host 0.0.0.0 --port $PORT</code></pre>
      Verify <code>/health</code> and <code>/ready</code>.
    </td>
    <td width="50%" valign="top">
      <h3>Netlify</h3>
      <pre><code>[build]
  base = "frontend"
  command = "npm run build"
  publish = ".next"</code></pre>
      Use Node.js 20 and the Next.js adapter.
    </td>
  </tr>
</table>

📁 Repository map

<details>
<summary><strong>Open project structure</strong></summary>

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
│   └── pyproject.toml
│
├── database/
├── netlify.toml
└── README.md

</details>

🗺 Roadmap

<table>
  <tr>
    <td>🔔 Push notifications</td>
    <td>🗺 Map-based discovery</td>
    <td>🌐 Bangla and English UI</td>
  </tr>
  <tr>
    <td>🏪 Organization verification</td>
    <td>⏳ Expiry reminders</td>
    <td>♿ Accessibility audit</td>
  </tr>
  <tr>
    <td>📱 Native app wrapper</td>
    <td>📍 Trusted pickup points</td>
    <td>🚦 Advanced anti-spam controls</td>
  </tr>
</table>

⚠️ Responsible use

We Eat helps people coordinate food sharing, but software cannot independently certify food safety.

Providers must describe food honestly. Receivers must use personal judgment. A public launch should include food-safety guidance, community rules, a privacy policy and terms of use.

🤝 Contributing

git checkout -b feature/your-feature
git commit -m "Add your feature"
git push origin feature/your-feature

Please preserve the architecture:

Next.js → Next.js API proxy → FastAPI → Neon PostgreSQL / Cloudinary

Do not bypass backend authorization or expose private pickup data.

👨‍💻 Author

<table>
  <tr>
    <td>
      <strong>Md Mahruf Alam</strong><br />
      Full-stack developer · System builder · Problem solver
    </td>
    <td>
      <a href="https://github.com/miniSOWAD">GitHub</a><br />
      <a href="https://www.linkedin.com/in/md-mahruf-alam-sowad-397aaa309/">LinkedIn</a><br />
      <a href="mailto:baisakh2015@gmail.com">Email</a>
    </td>
  </tr>
</table>

⭐ Support the project

If We Eat is useful:

star the repository;

share the project;

report bugs responsibly;

suggest practical features;

contribute improvements.

<p align="center">
  <strong>Good food deserves a second table.</strong>
</p>

<p align="center">
  <img
    src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=18&pause=1100&color=8CA9FF&center=true&vCenter=true&width=680&lines=Share+responsibly.;Coordinate+safely.;Build+community+trust."
    alt="Animated closing message"
  />
</p>


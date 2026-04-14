<div align="center">

<img src="public/logo.png" alt="Taskee Logo" width="80" height="80" />

**A modern, AI-powered project & task management platform**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

<br/>

> Manage your team, projects, and tasks smarter — with AI assistance built right in.

<br/>

[🚀 Live Demo](#taskee.codes) · [📖 Docs](#) · [🐛 Report Bug](../../issues) · [✨ Request Feature](../../issues)

</div>

---

---

## ✨ Features

### 🗂️ Task Management

- Create, assign, and track tasks through a full lifecycle: **Pending → Processing → In Review → Done**
- Set **priority levels**, **due dates**, **estimate & actual effort**
- Inline **to-do checklists**, **file attachments**, and **completion percentage**
- Assign both an **assignee** and a **reviewer** per task

### 📁 Project & Team Management

- Organize work inside **Projects** scoped to a **Team**
- Flexible **role system**: Owner · Admin · Lead · Member · QC · Viewer
- Per-team settings: working days, timezone, notification channel
- **Discord server integration** for team notifications

### 🤖 AI-Powered Assistance

- **Story Point Suggestion** — AI estimates effort based on task description _(implicit feedback)_
- **Task Generation** — AI drafts subtasks from a high-level description _(explicit feedback)_
- **Assignee Suggestion** — AI recommends the best developer for the job
- **Priority Suggestion** — AI infers priority from context
- Built-in 👍 / 👎 **feedback loop** to continuously improve AI quality

### 🛡️ Admin Panel

- Manage **users**, **teams**, and **projects** from a dedicated admin dashboard
- **AI Feedback Dashboard** — visualize AI suggestion quality over time
- Separate admin auth session

### 🎨 UI/UX

- Clean, responsive design powered by **shadcn/ui** + **Radix UI**
- **Drag & drop** task boards via `@dnd-kit`
- Dark / Light **theme toggle**
- Smooth animations with **AOS** and `tailwindcss-animate`

---

## 🛠️ Tech Stack

| Category               | Technology                          |
| ---------------------- | ----------------------------------- |
| **Framework**          | React 19, React Router 7            |
| **Language**           | TypeScript 5.7                      |
| **Build Tool**         | Vite 6                              |
| **Styling**            | TailwindCSS v4, SCSS, Less          |
| **UI Components**      | shadcn/ui, Radix UI, Ant Design     |
| **State Management**   | Redux Toolkit, TanStack React Query |
| **Forms & Validation** | React Hook Form, Zod                |
| **Drag & Drop**        | @dnd-kit                            |
| **Charts**             | Recharts                            |
| **HTTP Client**        | Axios                               |
| **Date Utilities**     | date-fns, Day.js, chrono-node       |
| **Icons**              | Lucide React, React Icons           |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** or **yarn** or **pnpm**

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/taskee.git
cd taskee

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be running at **http://localhost:5173**

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

---

## 📁 Project Structure

```
src/
├── ai/               # AI feedback interfaces & docs
├── api/              # Axios API layer (auth, tasks, projects, teams, AI...)
├── components/
│   ├── element/      # Reusable UI elements (buttons, inputs, dropdowns...)
│   ├── layout/       # Header, Sidebar, Breadcrumbs
│   ├── patterns/     # Higher-order patterns (containers, lists, modals)
│   └── ui/           # shadcn/ui component library
├── hooks/            # Custom hooks (data fetching, logic, theming)
├── pages/
│   ├── admin/        # Admin panel (users, teams, projects, AI dashboard)
│   ├── auth/         # Login & Register
│   ├── dashboard/    # User dashboard
│   ├── project/      # Project board
│   ├── task/         # Task detail & management
│   └── team/         # Team management
├── provider/         # React context providers (Auth, Alert, Workspace)
├── routes/           # Route definitions & guards
├── schema/           # Zod validation schemas
├── store/            # Redux store & slices
└── types/            # TypeScript type definitions
```

---

## 🤖 AI Feedback System

Taskee includes a built-in AI quality tracking system that learns from user behaviour:

```
AI suggests value
       │
       ▼
  [PENDING] ──── 👍/👎 explicit ──────► [RESOLVED]  source = explicit
       │
       ├──── implicit (form save) ─────► [RESOLVED]  source = implicit
       │         (compare suggested vs actual)
       │
       └──── 7 days no action ─────────► [EXPIRED]
```

Feedback data is surfaced in the **Admin AI Dashboard** to monitor and improve model accuracy over time.

---

## 🧑‍💻 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
# Open a Pull Request
```

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

Made with ❤️ by [doanngocnam](https://github.com/doanngocnam)

⭐ If you find this project useful, please consider giving it a star!

</div>

---

---

# 🖥️ Backend (API Server)

The backend is a **Node.js / Express** REST API written in **TypeScript**, using **TypeORM** with **PostgreSQL** as the primary database.

## 🛠️ Tech Stack

| Category          | Technology                        |
| ----------------- | --------------------------------- |
| **Runtime**       | Node.js 22                        |
| **Framework**     | Express 5                         |
| **Language**      | TypeScript                        |
| **ORM**           | TypeORM                           |
| **Database**      | PostgreSQL                        |
| **Auth**          | JWT (`jsonwebtoken`) + `bcryptjs` |
| **File Upload**   | Multer + Cloudinary               |
| **Notifications** | Discord.js                        |
| **Scheduler**     | node-cron                         |
| **Validation**    | Zod                               |
| **HTTP Client**   | Axios                             |
| **Dev Server**    | tsx + nodemon                     |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **PostgreSQL** (local or Docker)
- **npm** or **yarn** or **pnpm**

### Installation

```bash
# Clone the repository (if not already done)
git clone https://github.com/your-username/raise.git
cd raise

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file at the project root based on the variables below:

```env
# Database
DATABASE_URL=postgresql://root:passed@localhost:5432/taskmanager

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Cloudinary (file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Run in Development

```bash
npm run dev
```

The server starts at **http://localhost:3000**.  
Changes to `src/` and `.env` are hot-reloaded via **nodemon + tsx**.

### Seed the Database

```bash
# Seed base data (plans, roles, etc.)
npm run seed

# Seed AI feedback sample data
npm run seed:ai-feedback
```

### Build for Production

```bash
npm run build
```

Output is compiled to the `dist/` folder.

### Start Production Server

```bash
npm start
```

---

## 🐳 Run with Docker Compose

The easiest way to run the full stack (API + PostgreSQL) in production:

```bash
# Make sure .env.production exists at the project root, then:
docker compose up -d --build
```

This spins up:

- `raise_backend` — the API server on port **3000**
- `postgres_raise_db` — PostgreSQL with a persistent volume

To stop and remove containers:

```bash
docker compose down
```

---

## 📁 Project Structure

```
src/
├── config/         # Cloudinary, Multer configuration
├── constants/      # Shared query defaults
├── controllers/    # Route handler functions
├── db/             # TypeORM DataSource & seed files
├── middleware/     # Auth, validation middleware
├── model/          # TypeORM entities, DTOs, enums
├── repository/     # Data-access layer (per entity)
├── routes/         # Express router definitions
├── scripts/        # One-off seed scripts
├── services/       # Business logic
│   ├── ai/         # AI integration services
│   ├── chat/       # Chat/notification services
│   ├── cron/       # Scheduled jobs (AI sync, etc.)
│   ├── payment/    # Billing & subscription logic
│   └── upload/     # File upload helpers
├── types/          # Shared TypeScript type definitions
└── utils/          # Async handler, response helpers, auth utils
```

---

## 📜 Available Scripts

| Command                    | Description                      |
| -------------------------- | -------------------------------- |
| `npm run dev`              | Start dev server with hot reload |
| `npm run build`            | Compile TypeScript to `dist/`    |
| `npm start`                | Run compiled production build    |
| `npm run lint`             | Lint source files with ESLint    |
| `npm run lint:fix`         | Auto-fix lint issues             |
| `npm run seed`             | Seed base data into the database |
| `npm run seed:ai-feedback` | Seed AI feedback sample data     |

# 🤖 AI Service (Python)

The AI service is a standalone **FastAPI** microservice responsible for all AI-powered features — story point estimation, task generation, assignee suggestion, and conversational chat. It communicates with the main backend over HTTP.

## 🛠️ Tech Stack

| Category             | Technology                             |
| -------------------- | -------------------------------------- |
| **Framework**        | FastAPI                                |
| **Language**         | Python 3                               |
| **LLM Provider**     | Groq API (configurable model via env)  |
| **Embeddings**       | Sentence Transformers (CPU by default) |
| **Observability**    | LangSmith (request tracing)            |
| **Chat Storage**     | Upstash Redis                          |
| **Containerization** | Docker + Docker Compose                |

---

## 🚀 Getting Started

### Environment Variables

Create a `.env` file inside the `ai_service/` directory:

```env
# LLM — Get your key at https://console.groq.com
GROQ_API_KEY=your_groq_api_key

# Model name — see supported list at https://console.groq.com/docs/models
GROQ_MODEL_NAME=llama3-8b-8192

# LangSmith — request tracing (optional but recommended)
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langsmith_api_key

# Upstash — chat message history (https://console.upstash.com)
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

### Run with Docker (Recommended)

```bash
cd ai_service
docker compose up --build -d
```

> ⏳ **First build note:** Installing `requirements.txt` and loading the embedding model on first startup will take a few minutes since the service runs on **CPU** by default. CUDA support requires a much larger `torch` installation.

To stop the service:

```bash
docker compose down
```

### Disable Hot Reload (Production)

By default, the container runs with `--reload` enabled for development convenience. To prevent automatic restarts on file changes in production, remove the `--reload` flag from `docker-compose.yml` and restart the container manually after each update:

```bash
docker compose restart
```

---

## 📁 Project Structure

```
ai_service/
├── app/
│   ├── data/           # Training data & vector store
│   ├── models/         # Pydantic models / domain types
│   ├── routers/        # FastAPI route handlers
│   ├── schema/         # Request / response schemas
│   ├── services/       # Core AI logic (estimation, generation, chat...)
│   ├── utils/          # Shared helpers & utilities
│   ├── config.py       # App configuration (env loading)
│   └── main.py         # FastAPI app entry point
├── res/                # Resolved flow definitions & prompt resources
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── test_sync.py        # Sync integration test
```

# Arclight HR

Enterprise Human Resource and Employee Lifecycle Management System — PG mini project.

MERN stack: MongoDB, Express, React 19 (Vite), Node.js, Tailwind CSS v4.

## Product

Studio-grade people desk for a software company. Three roles:

| Role | Login (after seed) |
| --- | --- |
| Admin | `harbor.admin` / `Harbor#2026` |
| Team lead | `ira.mehta` / `Leader#2026` |
| Employee | `anika.shah` / `Employee#2026` |

Other seeded leads use `Leader#2026`. Other employees use `Employee#2026`.

## Stack

- **Client:** React 19, Vite, Tailwind v4 (`@tailwindcss/vite`, no `tailwind.config.js`), TanStack Query, Zustand, Framer Motion, Lucide, Lottie, React Hook Form
- **Server:** Express 5, Mongoose, JWT, bcrypt, Multer, express-validator
- **Auth:** JWT + RBAC middleware (`admin`, `team_leader`, `employee`)

## Run locally

Requires MongoDB on `127.0.0.1:27017`.

```bash
cd server
copy .env.example .env   # already present
npm install
npm run seed
npm run dev
```

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`. API is proxied to `http://localhost:5000`.

## Workflow (viva)

1. Admin creates departments, teams, leads, employees (`EMP00001`…).
2. Employee onboards (status `onboarding` → `active`).
3. Admin assigns a project to a team; lead splits work.
4. Employees update status, upload deliverables, file **2-hour reports** at 10:00, 12:00, 14:00, 16:00.
5. Lead reviews submissions.
6. Admin generates performance (attendance 20%, tasks 40%, reports 20%, productivity 20%).
7. Promotion / transfer / reward.
8. Resignation, notice, clearance, exit.

## Modules

Directory, org map, accounts, lifecycle, work board, 2-hour log, lead reviews, attendance + heatmap, leaves, performance, bulletin, document library, training, desk chat, notifications, command palette (`⌘K` / `Ctrl+K`), dark mode, PDF employee card.

## Folders

```
client/src   components, pages, layouts, hooks, services, store, utils
server/src   controllers, routes, middlewares, models, validators, repositories
```

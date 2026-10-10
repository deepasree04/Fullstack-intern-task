# Mini SaaS Template Store

Full Stack Web Developer Intern Assignment for **Gnxtace Technologies**.

**Repository**: `fullstack-intern-task`  
**Project**: Mini SaaS Template Store

A full-stack SaaS template marketplace where users can browse, search, and filter software templates, view deep-dive details, register and log in securely via JWT authentication, and manage their personal favorites collection with real-time state synchronization.

---

## Tech Stack

- **Frontend**: React.js (v19) with Vite, React Router DOM (v7), Axios, Lucide React icons, Vanilla CSS Design System.
- **Backend**: Node.js, Express.js (v5), Knex.js query builder, SQLite3 embedded database.
- **Authentication**: JWT (`jsonwebtoken`) and `bcryptjs` password hashing.
- **Version Control**: Git.

---

## Project Structure

```
fullstack-intern-task/
├── .gitignore
├── README.md
├── server/
│   ├── .env.example
│   ├── knexfile.js
│   ├── package.json
│   ├── test_api.js             # Automated API test suite (35 tests)
│   └── src/
│       ├── app.js              # Express app setup, CORS, and route mounting
│       ├── server.js           # Server entry point
│       ├── config.js           # Centralized configuration
│       ├── db.js               # Knex SQLite connection instance
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── templateController.js
│       │   └── favoriteController.js
│       ├── middleware/
│       │   ├── auth.js         # JWT Bearer token verification
│       │   └── errorHandler.js # Centralized error & 404 handlers
│       ├── migrations/
│       │   └── 20261010120000_create_initial_schema.js
│       ├── seeds/
│       │   └── 01_templates_seed.js
│       └── routes/
│           ├── authRoutes.js
│           ├── templateRoutes.js
│           └── favoriteRoutes.js
└── client/
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx             # React Router routing & layout
        ├── index.css           # Modern SaaS design system
        ├── api/
        │   └── axiosClient.js  # Axios instance with JWT interceptor
        ├── context/
        │   ├── AuthContext.jsx # Auth state, login/register/logout & token validation
        │   └── FavoritesContext.jsx # Synchronized favorites state
        ├── components/
        │   ├── Navbar.jsx
        │   ├── TemplateCard.jsx
        │   ├── TemplateModal.jsx
        │   ├── GuestPromptModal.jsx
        │   ├── ProtectedRoute.jsx
        │   └── UIState.jsx
        └── pages/
            ├── TemplatesPage.jsx
            ├── FavoritesPage.jsx
            ├── LoginPage.jsx
            └── RegisterPage.jsx
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` — Register a new account (`name`, `email`, `password`). Hashes password with bcrypt, normalizes email, returns JWT and user profile (never password hash).
- `POST /api/auth/login` — Log in existing user (`email`, `password`). Returns JWT and user profile.
- `GET /api/auth/me` — *(Protected)* Retrieve authenticated user profile from token.

### Templates
- `GET /api/templates` — Retrieve templates. Supports `?category=` filter and `?search=` keyword matching.
- `GET /api/templates/:id` — Retrieve a single template by ID (`404` if not found).

### Favorites
- `GET /api/favorites` — *(Protected)* Retrieve only the authenticated user's favorited templates.
- `POST /api/favorites/:templateId` — *(Protected)* Add template to authenticated user's favorites (`409` if duplicate).
- `DELETE /api/favorites/:templateId` — *(Protected)* Remove template from authenticated user's favorites.

---

## Getting Started Locally

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm

### 2. Single-Server Execution (Full Application at http://localhost:5000)

The easiest way to run the complete full-stack application (both frontend and backend) through a single origin:

1. Build the frontend assets:
   ```bash
   cd client
   npm install
   npm run build
   ```
2. Setup and run the server:
   ```bash
   cd ../server
   cp .env.example .env
   npm install
   npm run migrate
   npm run seed
   npm run dev
   ```
3. Open **`http://localhost:5000`** in your browser. The Express server serves both the React client interface and all `/api/*` endpoints.

---

### 3. Alternative: Standalone Frontend Dev Server (Vite)
If you prefer developing the frontend with Vite Hot Module Replacement (HMR):
1. In `server/`: `npm run dev` (starts API on `http://localhost:5000`)
2. In `client/`: `npm run dev` (starts Vite on `http://localhost:5173`)

---

## Security & Architectural Highlights
- **Password Protection**: Passwords hashed with `bcryptjs` (salt rounds 10) before database insertion. Password hashes are excluded from all query outputs and responses.
- **JWT Authentication**: Bearer tokens verified via auth middleware; protected operations exclusively rely on `req.user.id` extracted from the decoded token.
- **Database Constraints**: Composite unique constraint `[user_id, template_id]` prevents duplicate favorites. Foreign key enforcement enabled via SQLite PRAGMA hook.
- **Environment Separation**: Secrets, database files, and build outputs are strictly excluded via `.gitignore`.

# Mini SaaS Template Store

A full-stack SaaS template marketplace built as part of the **Full Stack Web Developer Intern Assignment for Gnxtace Technologies**.

Users can browse and search SaaS templates, filter them by category, view template details, register and log in securely, and manage a personal favorites collection.

## Features

### Authentication
- User registration and login.
- Secure password hashing with `bcryptjs`.
- JWT-based authentication.
- Protected routes for authenticated users.
- Persistent login state and logout functionality.
- Input validation and duplicate-email handling.

### Template Marketplace
- Browse seeded SaaS templates.
- Search templates by keyword.
- Filter templates by category.
- View detailed template information.
- Responsive template cards and detail modals.
- Loading, error, and empty states.

### Favorites
- Add templates to favorites.
- Remove templates from favorites.
- View a personal favorites collection.
- Persist favorites in the database across page refreshes and logins.
- Synchronize favorite state between the marketplace and favorites page.
- Prevent duplicate favorites and isolate favorites by user.

### Additional Features
- Single-server execution for the frontend and backend.
- RESTful API architecture.
- SQLite database with Knex migrations and seeds.
- Centralized error handling.
- Responsive interface with custom CSS and Lucide icons.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite |
| Routing | React Router DOM 7 |
| HTTP Client | Axios |
| Icons | Lucide React |
| Styling | CSS |
| Backend | Node.js, Express 5 |
| Database | SQLite 3 |
| Query Builder | Knex.js |
| Authentication | JSON Web Tokens (JWT) |
| Password Hashing | bcryptjs |
| Testing | Automated API test suite |
| Version Control | Git and GitHub |

## Project Structure

```text
fullstack-intern-task/
├── .gitignore
├── README.md
├── client/
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       ├── main.jsx
│       ├── api/
│       │   └── axiosClient.js
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── FavoritesContext.jsx
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── TemplateCard.jsx
│       │   ├── TemplateModal.jsx
│       │   ├── GuestPromptModal.jsx
│       │   ├── ProtectedRoute.jsx
│       │   └── UIState.jsx
│       └── pages/
│           ├── TemplatesPage.jsx
│           ├── FavoritesPage.jsx
│           ├── LoginPage.jsx
│           └── RegisterPage.jsx
└── server/
    ├── .env.example
    ├── knexfile.js
    ├── package.json
    ├── test_api.js
    ├── verify_single_server.js
    └── src/
        ├── app.js
        ├── server.js
        ├── config.js
        ├── db.js
        ├── controllers/
        │   ├── authController.js
        │   ├── templateController.js
        │   └── favoriteController.js
        ├── middleware/
        │   ├── auth.js
        │   └── errorHandler.js
        ├── migrations/
        │   └── 20261010120000_create_initial_schema.js
        ├── seeds/
        │   └── 01_templates_seed.js
        └── routes/
            ├── authRoutes.js
            ├── templateRoutes.js
            └── favoriteRoutes.js
```

## Getting Started

### Prerequisites

Install the following:

- Node.js 18 or later
- npm

Check your installation:

```powershell
node --version
npm --version
```

### 1. Clone the repository

```powershell
git clone https://github.com/deepasree04/fullstack-intern-task.git
cd fullstack-intern-task
```

### 2. Install frontend dependencies and build

```powershell
cd client
npm install
npm run build
```

The build generates the frontend production assets in `client/dist`.

### 3. Configure the backend

Open another terminal at the project root and run:

```powershell
cd server
```

Create a local `.env` file by copying the provided example:

```powershell
Copy-Item .env.example .env
```

Open `server/.env` and configure the variables required by `server/src/config.js`. Use a strong, private JWT secret for local development. Never commit real secrets.

### 4. Install backend dependencies

```powershell
npm install
```

### 5. Initialize the database

```powershell
npm run migrate
npm run seed
```

The migration creates the database schema, and the seed script populates the template catalog.

### 6. Start the application

```powershell
npm run dev
```

Open **http://localhost:5000** in your browser.

The Express server serves the React production build and the `/api/*` endpoints from the same origin.

> Run the frontend build again whenever you make frontend changes that need to appear in the single-server production build.

## Development Mode

For frontend development with Vite Hot Module Replacement (HMR), use two terminals.

**Terminal 1 — Backend**

```powershell
cd server
npm run dev
```

**Terminal 2 — Frontend**

```powershell
cd client
npm run dev
```

Open the development URL printed by Vite, usually `http://localhost:5173`.

Check `client/.env.example` for any frontend environment variables required for development.

## API Documentation

The API uses JSON request and response bodies.

### Authentication

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new account | Public |
| POST | `/api/auth/login` | Authenticate an existing user | Public |
| GET | `/api/auth/me` | Get the current user's profile | Protected |

Registration accepts `name`, `email`, and `password`. Login accepts `email` and `password`.

Successful authentication returns a JWT and user profile. Password hashes should never be exposed in API responses.

### Templates

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/templates` | Retrieve templates | Public |
| GET | `/api/templates/:id` | Retrieve a template by ID | Public |

Optional query parameters for `GET /api/templates`:

- `search` — search templates by keyword.
- `category` — filter templates by category.

Example:

```http
GET /api/templates?search=analytics
GET /api/templates?category=Analytics
```

### Favorites

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/favorites` | Retrieve the current user's favorites | Protected |
| POST | `/api/favorites/:templateId` | Add a template to favorites | Protected |
| DELETE | `/api/favorites/:templateId` | Remove a template from favorites | Protected |

Protected endpoints require a valid JWT bearer token:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Favorites are associated with the authenticated user. The server derives the user ID from the verified token rather than trusting a user ID supplied by the client.

## Database Design

The application uses SQLite with Knex.js migrations.

### Users
Stores account information, including the user's name, normalized email, password hash, and creation timestamp.

### Templates
Stores template information such as name, description, thumbnail URL, category, and creation timestamp.

### Favorites
Associates users with their favorited templates.

Database constraints help enforce:
- Unique user email addresses.
- Unique user-template favorite pairs.
- Foreign-key relationships between users, templates, and favorites.
- Cascading cleanup where configured by the schema.

## Security

- Passwords are hashed with `bcryptjs` before storage.
- JWT middleware protects user-specific endpoints.
- User identity is derived from the verified JWT.
- Input validation is applied to authentication and API operations.
- Duplicate favorites are prevented by database constraints.
- Password hashes are excluded from user-facing responses.
- Environment files, local databases, dependencies, and generated build assets are excluded from version control through Git ignore rules.

**Important:** `.env.example` should contain placeholders only. Configure actual secrets in your local `.env` file and never commit them.

## Testing

The backend includes an automated API test suite and a single-server verification script.

Run the backend tests from the `server` directory:

```powershell
npm test
```

Verify the single-server setup, if the corresponding script is available:

```powershell
npm run verify:server
```

Build the frontend:

```powershell
cd ../client
npm run build
```

Tests cover areas such as authentication, templates, favorites, and API behavior. Run the commands above to confirm the current results in your environment.

## Future Improvements

- Pagination for larger template catalogs.
- More advanced filtering and sorting.
- Template creation and management for authorized users.
- Automated frontend tests.
- Deployment to a cloud hosting platform.
- Improved accessibility and UI feedback.

## Assignment Information

**Company:** Gnxtace Technologies  
**Assignment:** Full Stack Web Developer Intern  
**Project:** Mini SaaS Template Store  
**Repository:** `fullstack-intern-task`

Built with React, Node.js, Express, SQLite, and JWT authentication.

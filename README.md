# ProxLock Admin Dashboard

A modern admin dashboard for managing ProxLock users and configurations. Built with React, TypeScript, and Vite.

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite&logoColor=white)

## Features

- **🔐 Secure Authentication** — Clerk-based authentication with admin-only access control
- **👥 User Management** — View, search, and paginate through all users
- **🔍 User Lookup** — Search for specific users by their Clerk ID
- **⚙️ Request Limits** — Set and manage per-user request limit overrides
- **📱 Responsive Design** — Desktop table view and mobile card layout

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 |
| Language | TypeScript |
| Build Tool | Vite 7 |
| Authentication | Clerk |
| HTTP Client | Axios |
| Icons | Lucide React |
| Routing | React Router DOM |
| Styling | Custom CSS |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Access to the ProxLock API

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/Admin-Dashboard.git
   cd Admin-Dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_key
   VITE_API_URL=https://api.proxlock.com
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── components/
│   ├── Sidebar.tsx           # Navigation sidebar
│   └── UserActionModal.tsx   # User edit modal
├── pages/
│   ├── UsersPage.tsx         # User list with pagination
│   └── LookupPage.tsx        # Individual user lookup
├── lib/
│   └── api.ts                # Axios client with Clerk auth
├── assets/                   # Static assets (logo, icons)
├── models.ts                 # TypeScript interfaces
├── App.tsx                   # Main app with routing & admin guard
├── App.css                   # Application styles
├── index.css                 # Global styles
└── main.tsx                  # Entry point
```

## Pages

### Users Page (`/users`)

Browse all registered users with:
- Paginated table view (desktop)
- Card-based view (mobile)
- Real-time search filtering
- Quick edit access for request limits

### Lookup Page (`/lookup`)

Look up individual users by Clerk ID:
- View user details and subscription status
- Check current request usage vs limits
- Set or remove request limit overrides
- View raw user data for debugging

## API Integration

The dashboard connects to the ProxLock API with automatic Clerk token injection:

```typescript
// All requests automatically include Authorization header
const res = await api.get('/admin/users?page=1&per=20');
```

### Key Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /me` | Verify admin status |
| `GET /admin/users` | Paginated user list |
| `GET /admin/{userId}/user` | Single user lookup |
| `POST /admin/{userId}/user/override-limit` | Set request limit override |

## Deployment

### Cloudflare Pages

This project includes Wrangler configuration for Cloudflare Pages deployment:

```bash
npm run build
npx wrangler pages deploy dist
```

## License

See [License](./License) for details.

# meditrust-backend

Backend APIs and database services.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set:

```env
PORT=8000
JWT_SECRET=your_jwt_secret
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

3. Run the Supabase SQL schema in `SUPABASE_SCHEMA.sql`.

4. Start the server:

```bash
npm run dev
```

The backend keeps the same API routes and response formats while using Supabase tables for persistence.

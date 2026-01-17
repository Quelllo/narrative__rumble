# Narrative Rumble

A hackathon project for narrative betting.

## Setup

1. Install dependencies:
```bash
npm run install:all
```

2. Create a `.env` file in the root directory with the following variables:
```
PEAR_API_BASE=https://api.pear.com
PEAR_CLIENT_ID=your_client_id_here
PEAR_ACCESS_TOKEN=your_access_token_here
PEAR_REFRESH_TOKEN=your_refresh_token_here
```

3. Run both frontend and backend:
```bash
npm run dev
```

Or run them separately:
```bash
npm run dev:backend  # Backend on http://localhost:3001
npm run dev:frontend # Frontend on http://localhost:3000
```

## Project Structure

- `backend/` - Express API server with TypeScript
- `frontend/` - React SPA with Vite

## API Endpoints

- `GET /api/themes` - Get list of narrative themes
- `GET /api/bets` - Get all bets
- `POST /api/bets` - Create a new bet (body: `{ themeId, side, stake }`)

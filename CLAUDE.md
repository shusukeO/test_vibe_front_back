# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack chat application with separated frontend and backend, designed as an educational project to demonstrate client-server architecture. The project uses vanilla technologies for simplicity and clarity.

## Architecture

```
├── backend/     - Node.js Express API server with NeDB database
└── frontend/    - Static vanilla HTML/CSS/JavaScript client
```

**Backend**: Express.js REST API that handles message storage/retrieval using NeDB (lightweight JSON database)
**Frontend**: Vanilla web client with modern UI that polls the backend API every 5 seconds

## Common Development Commands

### Backend Development
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Start development server with nodemon
npm start            # Start production server
```

### API Endpoints
- `GET /api/messages` - Retrieve all messages
- `POST /api/messages` - Create new message (expects JSON: {username, content})

## Environment Configuration

The application automatically detects environment:
- **Development**: Backend runs on `localhost:3000`, frontend connects to `http://localhost:3000/api`
- **Production**: Frontend connects to `https://vibe-chat-backend-3699.onrender.com/api`

Backend database path switches automatically:
- **Local**: `./messages.db`
- **Render**: `/tmp/messages.db`

## Key Implementation Details

- **No build system**: Uses vanilla frontend technologies
- **Database**: NeDB stores messages as JSON documents in a single file
- **CORS**: Enabled for cross-origin requests between frontend/backend
- **Security**: XSS protection through HTML escaping in frontend
- **Persistence**: Username stored in localStorage, messages in NeDB
- **Real-time feel**: Frontend polls backend every 5 seconds for updates

## Frontend Architecture

The frontend (`/frontend/script.js`) handles:
- Environment-aware API endpoint selection
- Message rendering with XSS protection
- User input validation and submission
- Auto-scrolling and loading states
- Username persistence via localStorage

## Backend Architecture

The backend (`/backend/server.js`) provides:
- Express server with CORS middleware
- NeDB database initialization and management
- RESTful API endpoints for message operations
- Environment-aware database path configuration

## Testing

Currently no automated tests. Manual testing involves:
1. Starting backend with `npm run dev`
2. Opening `frontend/index.html` in browser
3. Testing message sending/receiving functionality
4. Verifying cross-origin requests work properly

## Documentation

- `README.md` - Comprehensive project documentation (Japanese)
- `PROMPTS.md` - Complete development process and prompt history
- `LICENSE` - Personal/non-commercial use license
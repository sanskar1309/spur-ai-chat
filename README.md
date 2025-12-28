# Spur AI Chat - E-commerce Support Assistant

A full-stack AI chat application built with React, TypeScript, Express, and SQLite. The application provides an intelligent support agent for a small e-commerce store, capable of answering customer inquiries about products, orders, shipping, returns, and general support.

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript + SQLite
- **LLM Provider**: OpenRouter API (GPT-4o-mini)
- **Database**: SQLite3 with in-memory/file-based storage

### Project Structure
```
spur-ai-chat/
├── backend/
│   ├── src/
│   │   ├── db/           # Database initialization and schema
│   │   ├── routes/       # API route handlers
│   │   ├── services/     # Business logic (chat, LLM)
│   │   └── utils/        # Validation utilities
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/          # API client functions
│   │   ├── components/   # React components
│   │   └── App.tsx       # Main application
│   └── package.json
└── README.md
```

### System Flow
1. **User sends message** → Frontend (React)
2. **API request** → Backend (Express) `/chat/message`
3. **Message stored** → SQLite database
4. **Context retrieved** → Last 10 messages fetched
5. **LLM call** → OpenRouter API (GPT-4o-mini)
6. **Response stored** → SQLite database
7. **Response returned** → Frontend displays message

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm
- OpenRouter API key ([Get one here](https://openrouter.ai/))

### Step-by-Step Local Setup

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd spur-ai-chat
```

#### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
PORT=3001
NODE_ENV=development
```

Start the backend server:
```bash
npm run dev
```

The backend will:
- Initialize SQLite database (`chat.db`)
- Create tables (`conversations`, `messages`)
- Start server on `http://localhost:3001`
- Validate that `OPENROUTER_API_KEY` is set

#### 3. Frontend Setup

Open a new terminal:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory (optional for local development):
```env
VITE_API_BASE_URL=http://localhost:3001
```

Start the frontend development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:3004` (or the next available port).

#### 4. Access the Application

Open your browser and navigate to `http://localhost:3004`

## 🗄️ Database Setup

### Schema

The application uses SQLite with two main tables:

**conversations**
- `id` (TEXT PRIMARY KEY) - UUID session identifier
- `created_at` (TEXT) - ISO timestamp

**messages**
- `id` (TEXT PRIMARY KEY) - UUID message identifier
- `conversation_id` (TEXT) - Foreign key to conversations
- `sender` (TEXT) - Either "user" or "ai"
- `text` (TEXT) - Message content
- `created_at` (TEXT) - ISO timestamp

### Database Initialization

The database is automatically initialized on backend startup via `backend/src/db/index.ts`. Tables are created if they don't exist.

### Database Reset

To reset the database, simply delete `chat.db` and restart the backend. The tables will be automatically recreated on startup.

## 🔐 Environment Variables

### Backend (`.env` in `backend/`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENROUTER_API_KEY` | ✅ Yes | - | Your OpenRouter API key |
| `PORT` | No | `3001` | Backend server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `ALLOWED_ORIGINS` | No | `*` (dev) | Comma-separated list of allowed CORS origins |

### Frontend (`.env` in `frontend/`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | No | `http://localhost:3001` | Backend API base URL |

**Note**: Vite requires the `VITE_` prefix for environment variables to be exposed to the client.

## 🤖 LLM Provider: OpenRouter

### Why OpenRouter?

OpenRouter provides a unified API to access multiple LLM providers. This application uses GPT-4o-mini.

### Model Configuration

The application currently uses **GPT-4o-mini** as the primary model:
- Cost-effective for support use cases
- Fast response times
- Good balance of capability and cost

### API Configuration

- **Endpoint**: `https://openrouter.ai/api/v1/chat/completions`
- **Max Tokens**: 2000 (configurable in `llm.service.ts`)
- **Model**: GPT-4o-mini (single model, no fallback)

### Rate Limiting

OpenRouter has rate limits based on your API key tier. The application doesn't implement client-side rate limiting. Monitor usage in the OpenRouter dashboard and set appropriate `max_tokens` to control costs.

## 💬 Prompting Strategy

### System Prompt Design

The system prompt in `backend/src/services/llm.service.ts` defines the AI as a helpful e-commerce support agent with embedded store policies:

```
You are a helpful support agent for our small e-commerce store.
Your role is to assist customers with inquiries about products, orders, 
shipping, returns, and general support.

Store Policies:
- Shipping: We ship to India and the USA. Delivery typically takes 5–7 business days.
- Returns: We offer a 7-day return window. Items must be unused and in original packaging.
- Refunds: Refunds are processed within 5 business days after receiving the returned item.
- Support Hours: Our support team is available Monday to Friday, 9am–6pm IST.
```

### Context Management

- **History Window**: Last 10 messages are included in each LLM call
- **Message Format**: Messages are formatted as `{ role: "user" | "assistant", content: string }`
- **System Prompt**: Prepended to every conversation to maintain agent identity

### Why This Approach?

1. **No Database for FAQs**: Store policies are embedded in the system prompt, eliminating the need for a separate FAQ database
2. **Context-Aware**: Recent conversation history ensures continuity
3. **Consistent Identity**: System prompt ensures the AI always acts as a support agent

## ⚖️ Trade-offs & Design Decisions

### What We Chose

1. **SQLite**: 
   - ✅ Simple setup, no external dependencies
   - ✅ File-based, no separate database server needed

2. **OpenRouter over Direct OpenAI**:
   - ✅ Unified API, model flexibility
   - ✅ Access to multiple providers
   - ❌ Additional abstraction layer

3. **Embedded Policies vs Database**:
   - ✅ No FAQ database needed
   - ✅ Policies always available
   - ❌ Requires code changes to update policies

4. **Session Persistence**:
   - ✅ Fetches history from backend on page load
   - ✅ Falls back to localStorage if backend unavailable
   - ❌ Doesn't sync across devices

5. **Last 10 Messages Context**:
   - ✅ Balances context with token usage
   - ❌ May lose context in long conversations

### If I Had More Time...

1. **Database Improvements**:
   - Add database migrations system
   - Implement proper indexing for performance

2. **Session Management**:
   - Support multiple concurrent sessions

3. **Error Handling**:
   - Add retry logic for LLM API calls
   - Implement exponential backoff
   - Better error messages for users

4. **Rate Limiting**:
   - Add rate limiting middleware
   - Per-user rate limits
   - Token usage tracking

5. **Security**:
   - Input sanitization
   - API authentication/authorization

6. **Features**:
   - Message editing/deletion
   - Conversation export
   - Admin dashboard for viewing conversations

7. **Testing**:
   - Unit tests for services
   - Integration tests for API routes
   - E2E tests for frontend

8. **Performance**:
   - Implement caching for common queries
   - Optimize LLM response streaming

9. **Monitoring**:
   - Add logging service
   - Error tracking
   - Performance monitoring

10. **Documentation**:
    - API documentation (Swagger/OpenAPI)
    - Component documentation

## 🛠️ Development

### Available Scripts

**Backend**:
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production build
- `npm run type-check` - Type check without building

**Frontend**:
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Type Checking

Both frontend and backend use TypeScript with strict mode enabled. Run type checks:
```bash
# Backend
cd backend && npm run type-check

# Frontend
cd frontend && npm run build
```

## 🚀 Free Deployment Guide

This project can be deployed for free using Render (backend) and Vercel/Netlify (frontend). Here's how:

### Deployment Architecture

- **Backend**: Deploy to [Render](https://render.com) (free tier available)
- **Frontend**: Deploy to [Vercel](https://vercel.com) or [Netlify](https://netlify.com) (both free)

### Option 1: Render + Vercel (Recommended)

#### Step 1: Deploy Backend to Render

1. **Create a Render account** at [render.com](https://render.com) (free tier available)

2. **Create a new Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Use these settings:
     - **Name**: `spur-ai-chat-backend`
     - **Environment**: `Node`
     - **Root Directory**: `backend` ⚠️ **Important**: Set this to `backend`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Plan**: Free
   
   **Note**: By setting Root Directory to `backend`, all commands run from that directory, so you don't need `cd backend &&` in your commands.

3. **Set Environment Variables** in Render dashboard:
   - `OPENROUTER_API_KEY`: Your OpenRouter API key (required)
   - `NODE_ENV`: `production`
   - `ALLOWED_ORIGINS`: Leave empty for now (we'll set this after frontend deployment)

4. **Deploy**: Render will automatically deploy your backend

5. **Note your backend URL**: After deployment, you'll get a URL like `https://spur-ai-chat-backend.onrender.com`

#### Step 2: Update Backend CORS Settings

1. Go back to Render dashboard → Your backend service → Environment
2. Add/Update `ALLOWED_ORIGINS` with your frontend URL (we'll come back to this after deploying frontend)

#### Step 3: Deploy Frontend to Vercel

1. **Create a Vercel account** at [vercel.com](https://vercel.com) (free tier available)

2. **Import your repository**:
   - Click "New Project"
   - Import your GitHub repository

3. **Configure the project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (automatically detected)
   - **Output Directory**: `dist` (automatically detected)

4. **Set Environment Variable**:
   - Add `VITE_API_BASE_URL` with your Render backend URL (e.g., `https://spur-ai-chat-backend.onrender.com`)

5. **Deploy**: Vercel will automatically deploy your frontend

6. **Note your frontend URL**: After deployment, you'll get a URL like `https://spur-ai-chat.vercel.app`

#### Step 4: Update Backend CORS

1. Go back to Render dashboard → Your backend service → Environment
2. Update `ALLOWED_ORIGINS` with your Vercel frontend URL (e.g., `https://spur-ai-chat.vercel.app`)
3. Render will automatically redeploy with the new CORS settings

### Option 2: Render + Netlify

#### Frontend Deployment (Netlify)

1. **Create a Netlify account** at [netlify.com](https://netlify.com)

2. **Import your repository**:
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository

3. **Configure build settings**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

4. **Set Environment Variable**:
   - Site settings → Environment variables
   - Add `VITE_API_BASE_URL` with your Render backend URL

5. **Deploy**: Netlify will automatically deploy your frontend

6. **Update backend CORS** in Render dashboard with your Netlify frontend URL

### Option 3: Using render.yaml (Alternative Render Setup)

If you prefer using the `render.yaml` configuration file (Render Blueprint):

1. Push the `render.yaml` file to your repository root
2. In Render dashboard, create a new "Blueprint" instead of a Web Service
3. Connect your repository - Render will automatically detect and use `render.yaml`
4. **Do NOT set a Root Directory** in the dashboard when using render.yaml (the YAML handles this with `cd backend &&` commands)
5. Set the `OPENROUTER_API_KEY` environment variable in the dashboard
6. Deploy the frontend separately (Vercel/Netlify) and update `ALLOWED_ORIGINS`

**Important**: If using `render.yaml`, leave Root Directory **empty** in the dashboard. The YAML file uses `cd backend &&` commands to navigate to the backend directory.

### Important Notes for Free Deployment

#### Render Free Tier Limitations:
- Services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds (cold start)
- 750 hours/month free (enough for light usage)
- SQLite database files persist but may reset on redeploys

#### Vercel/Netlify Free Tier:
- Generous free tier for static sites
- Automatic HTTPS
- Global CDN
- No cold starts for frontend

#### Database Considerations:
- SQLite works on Render but has limitations (file-based, may reset on redeploy)
- For production use, consider upgrading to Render PostgreSQL (paid) or using an external database
- For demo/personal projects, SQLite on Render is perfectly fine

### Troubleshooting Deployment

#### Backend Issues:
- **Error: OPENROUTER_API_KEY not set**: Make sure you've added it in Render dashboard → Environment
- **Error: Root directory "cd backend" does not exist**: 
  - If using **manual dashboard setup**: Set Root Directory to `backend` (not `cd backend`) and use commands without `cd backend &&`
  - If using **render.yaml (Blueprint)**: Leave Root Directory **empty** in dashboard; the YAML handles navigation
- **CORS errors**: Ensure `ALLOWED_ORIGINS` includes your frontend URL (no trailing slash)
- **Database errors**: SQLite file is created automatically on first run

#### Frontend Issues:
- **API connection fails**: Check that `VITE_API_BASE_URL` is set correctly in Vercel/Netlify
- **Build fails**: Ensure all dependencies are in `package.json` (don't use global packages)

#### Environment Variables Checklist:

**Backend (Render)**:
- ✅ `OPENROUTER_API_KEY` (required)
- ✅ `NODE_ENV=production`
- ✅ `ALLOWED_ORIGINS` (your frontend URL, comma-separated for multiple)

**Frontend (Vercel/Netlify)**:
- ✅ `VITE_API_BASE_URL` (your Render backend URL, no trailing slash)

### Testing Your Deployment

1. Visit your frontend URL
2. Open browser console (F12) and check for errors
3. Send a test message in the chat
4. Check Render logs if backend requests fail

### Updating After Deployment

Both Render and Vercel/Netlify automatically redeploy when you push to your main branch. Just push your changes and wait for the deployment to complete!

---

**Note**: The free tiers are perfect for demos and personal projects. For production applications with high traffic, consider upgrading to paid tiers.

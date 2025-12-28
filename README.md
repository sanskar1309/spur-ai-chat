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

### Migrations & Seeding

Currently, the application uses a simple schema that's created automatically. For production, consider:

- **Migrations**: Use a tool like `knex.js` or `typeorm` for version-controlled schema changes
- **Seeding**: Add sample conversations for testing (not implemented currently)

To reset the database, simply delete `chat.db` and restart the backend.

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

OpenRouter provides a unified API to access multiple LLM providers, including:
- GPT-4o-mini (primary model)
- DeepSeek, Mistral, and other free models (commented out as fallbacks)

### Model Configuration

The application currently uses **GPT-4o-mini** as the primary model:
- Cost-effective for support use cases
- Fast response times
- Good balance of capability and cost

### API Configuration

- **Endpoint**: `https://openrouter.ai/api/v1/chat/completions`
- **Max Tokens**: 2000 (configurable in `llm.service.ts`)
- **Fallback Strategy**: If primary model fails, the system attempts other models (currently disabled)

### Rate Limiting

OpenRouter has rate limits based on your API key tier. The application doesn't implement client-side rate limiting, but you should:
- Monitor usage in OpenRouter dashboard
- Consider implementing rate limiting middleware for production
- Set appropriate `max_tokens` to control costs

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

1. **SQLite over PostgreSQL**: 
   - ✅ Simple setup, no external dependencies
   - ❌ Not ideal for high-concurrency production

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
   - Migrate to PostgreSQL for production
   - Add database migrations system
   - Implement proper indexing for performance

2. **Session Management**:
   - ✅ Fetch conversation history from backend on page load (implemented)
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
   - SQL injection prevention (already using parameterized queries)
   - API authentication/authorization
   - CORS restrictions in production

6. **Features**:
   - Message editing/deletion
   - Conversation export
   - Admin dashboard for viewing conversations
   - Analytics and metrics

7. **Testing**:
   - Unit tests for services
   - Integration tests for API routes
   - E2E tests for frontend

8. **Performance**:
   - Implement caching for common queries
   - Add database connection pooling
   - Optimize LLM response streaming

9. **Monitoring**:
   - Add logging service (Winston/Pino)
   - Error tracking (Sentry)
   - Performance monitoring

10. **Documentation**:
    - API documentation (Swagger/OpenAPI)
    - Component documentation
    - Deployment guides

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

# Quick Deployment Checklist

## ✅ Pre-Deployment Checklist

- [ ] OpenRouter API key ready
- [ ] GitHub repository pushed (if using Git-based deployment)
- [ ] Backend builds successfully: `cd backend && npm run build`
- [ ] Frontend builds successfully: `cd frontend && npm run build`

## 🚀 Backend Deployment (Render)

1. [ ] Create Render account at [render.com](https://render.com)
2. [ ] Create new Web Service
3. [ ] Connect GitHub repository
4. [ ] Configure:
   - Name: `spur-ai-chat-backend`
   - Environment: `Node`
   - **Root Directory**: `backend` ⚠️ **Important**: Set this!
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: `Free`
   
   **Note**: Setting Root Directory to `backend` means commands run from that folder, so don't include `cd backend &&`.
5. [ ] Add Environment Variables:
   - `OPENROUTER_API_KEY` = your API key
   - `NODE_ENV` = `production`
   - `ALLOWED_ORIGINS` = (leave empty for now)
6. [ ] Deploy and note backend URL (e.g., `https://spur-ai-chat-backend.onrender.com`)

## 🎨 Frontend Deployment (Vercel)

1. [ ] Create Vercel account at [vercel.com](https://vercel.com)
2. [ ] Import GitHub repository
3. [ ] Configure:
   - Root Directory: `frontend` (set in project settings)
   - Framework: `Vite` (auto-detected)
4. [ ] Add Environment Variable:
   - `VITE_API_BASE_URL` = your Render backend URL (no trailing slash)
5. [ ] Deploy and note frontend URL (e.g., `https://spur-ai-chat.vercel.app`)

## 🔄 Final Steps

1. [ ] Update Render backend `ALLOWED_ORIGINS` with frontend URL
2. [ ] Test frontend at your Vercel URL
3. [ ] Send a test message in the chat
4. [ ] Check Render logs if there are any errors

## 🐛 Troubleshooting

- **Backend won't start**: Check Render logs, verify `OPENROUTER_API_KEY` is set
- **Error: Root directory "cd backend" does not exist**: 
  - **Fix**: In Render dashboard → Settings → General, set Root Directory to `backend` (just the word "backend", not "cd backend")
  - **OR**: Leave Root Directory empty and use `cd backend && npm install && npm run build` in Build Command
- **CORS errors**: Verify `ALLOWED_ORIGINS` includes your frontend URL
- **Frontend can't connect**: Check `VITE_API_BASE_URL` in Vercel environment variables
- **Database errors**: SQLite file is created automatically on first run

## 📝 Environment Variables Summary

### Backend (Render)
```
OPENROUTER_API_KEY=your_key_here
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### Frontend (Vercel/Netlify)
```
VITE_API_BASE_URL=https://your-backend.onrender.com
```

---

**Tip**: Both platforms auto-deploy on git push. Just push to your main branch after making changes!


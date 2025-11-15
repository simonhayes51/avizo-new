# Quick Deploy to Railway - Cheat Sheet

## 🚀 Fastest Way to Deploy (5 minutes)

### 1. Prerequisites
- [ ] Railway account ([railway.app](https://railway.app))
- [ ] GitHub repo connected
- [ ] Code pushed to GitHub

### 2. Deploy Backend + Database

**In Railway Dashboard:**

1. **New Project** → **Deploy from GitHub** → Select `avizo-new`
2. **Add Database**: Click "+ New" → "Database" → "PostgreSQL"
3. **Configure Backend Service**:
   - Root Directory: `server`
   - Build: `npm install && npm run build`
   - Start: `npm start`
4. **Add Variables** (Backend Service):
   ```env
   NODE_ENV=production
   DB_HOST=${{Postgres.PGHOST}}
   DB_PORT=${{Postgres.PGPORT}}
   DB_NAME=${{Postgres.PGDATABASE}}
   DB_USER=${{Postgres.PGUSER}}
   DB_PASSWORD=${{Postgres.PGPASSWORD}}
   JWT_SECRET=CHANGE_ME_TO_RANDOM_SECRET
   CLIENT_URL=https://YOUR_FRONTEND_URL.railway.app
   ```
5. **Generate Domain** for backend → Copy URL

### 3. Deploy Frontend

1. **+ New** → **GitHub Repo** → Select `avizo-new` again
2. **Configure Frontend**:
   - Root Directory: `.` (leave empty)
   - Build: `npm install && npm run build`
   - Start: `npx serve -s dist -l $PORT`
3. **Add Variable**:
   ```env
   VITE_API_URL=https://YOUR_BACKEND_URL.railway.app/api
   ```
4. **Generate Domain** → Copy frontend URL
5. **Update Backend** `CLIENT_URL` to frontend URL
6. **Redeploy Backend**

### 4. Run Migrations

**Option A - Railway CLI:**
```bash
npm i -g @railway/cli
railway login
railway link
railway run --service backend npm run db:migrate
```

**Option B - SSH into service:**
```bash
railway run bash
cd server && npm run db:migrate
```

### 5. Test Deployment

Visit your frontend URL:
- [ ] Landing page loads
- [ ] Click "Try Demo" - creates demo account
- [ ] See demo data in dashboard
- [ ] Test navigation between pages

## 📋 Environment Variables Quick Reference

### Backend
```env
NODE_ENV=production
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
JWT_SECRET=<generate-random-secret>
CLIENT_URL=<your-frontend-url>
PORT=3000
```

### Frontend
```env
VITE_API_URL=<your-backend-url>/api
```

## 🔑 Generate JWT Secret

```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

## 🔍 Common URLs

- **Backend Health**: `https://your-backend.railway.app/api/health`
- **Frontend**: `https://your-frontend.railway.app`
- **Database**: Available via Railway dashboard

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check logs in Railway dashboard |
| 502 Bad Gateway | Verify backend is listening on `process.env.PORT` |
| CORS errors | Update `CLIENT_URL` to match frontend domain exactly |
| Can't connect to DB | Verify Postgres reference variables `${{Postgres.*}}` |
| Tables don't exist | Run database migrations |
| 404 on frontend routes | Make sure using `serve -s` for SPA routing |

## 📊 Service Health Checks

### Backend
```bash
curl https://your-backend.railway.app/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Frontend
```bash
curl -I https://your-frontend.railway.app
# Should return: 200 OK
```

### Database
```bash
railway run psql $DATABASE_URL
# Should connect to PostgreSQL
```

## 💰 Estimated Costs

- **Free Tier**: $5/month credits (good for development)
- **Pro Plan**: $20/month + usage
- **Typical usage**: 2 services + database ≈ $10-15/month

## 🎯 Pro Tips

1. **Auto-deploy**: Railway auto-deploys on git push to main
2. **Logs**: Use `railway logs` or dashboard to view real-time logs
3. **Rollback**: Click "Deployments" → select previous version → "Redeploy"
4. **Env changes**: Require redeploy to take effect
5. **Cost saving**: Use sleep mode for staging environments

## 📖 Full Documentation

For detailed instructions, troubleshooting, and advanced configuration:
👉 See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)

---

**Need help?**
- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)

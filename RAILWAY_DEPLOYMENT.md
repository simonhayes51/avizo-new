# Deploying Avizo to Railway

This guide will walk you through deploying the Avizo application to Railway, including the PostgreSQL database, backend API, and frontend.

## Prerequisites

- Railway account (sign up at [railway.app](https://railway.app))
- GitHub repository connected to Railway
- Railway CLI (optional but recommended)

## Deployment Architecture

Railway will host:
1. **PostgreSQL Database** - Managed database service
2. **Backend API** - Node.js/Express server
3. **Frontend** - Static React app served via the backend or separate service

## Option 1: Deploy Backend and Frontend Separately (Recommended)

### Step 1: Create a New Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `avizo-new` repository
5. Railway will detect your app automatically

### Step 2: Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will provision a PostgreSQL instance
4. Note: Connection details are automatically available as environment variables

### Step 3: Deploy the Backend API

1. In your project, click "+ New" → "GitHub Repo" → Select your repo
2. Configure the backend service:

   **Root Directory:** `server`

   **Build Command:** `npm install && npm run build`

   **Start Command:** `npm start`

3. Add Environment Variables (in Railway dashboard):
   ```
   NODE_ENV=production
   PORT=3000
   DB_HOST=${{Postgres.PGHOST}}
   DB_PORT=${{Postgres.PGPORT}}
   DB_NAME=${{Postgres.PGDATABASE}}
   DB_USER=${{Postgres.PGUSER}}
   DB_PASSWORD=${{Postgres.PGPASSWORD}}
   JWT_SECRET=your_super_secret_jwt_key_here_change_me
   CLIENT_URL=https://your-frontend-url.up.railway.app
   ```

   **Important:** Railway automatically provides Postgres environment variables. Use the `${{Postgres.VARIABLE}}` syntax to reference them.

4. Generate a Domain:
   - Go to Settings → Networking → Generate Domain
   - Note this URL (e.g., `https://your-backend.up.railway.app`)

### Step 4: Run Database Migrations

You have two options:

**Option A: Using Railway CLI**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run npm run db:migrate
```

**Option B: One-time deployment job**
```bash
# Add a migration script to server/package.json
"scripts": {
  "start": "npm run migrate:prod && node dist/index.js",
  "migrate:prod": "node dist/db/migrate.js"
}
```

### Step 5: Deploy the Frontend

1. In your Railway project, click "+ New" → "GitHub Repo" → Select your repo again
2. Configure the frontend service:

   **Root Directory:** `.` (root)

   **Build Command:** `npm install && npm run build`

   **Start Command:** `npx serve -s dist -l $PORT`

3. Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend.up.railway.app/api
   ```

4. Install `serve` as a dependency:
   ```bash
   # Add to your package.json
   npm install --save serve
   ```

5. Generate a Domain for frontend:
   - Go to Settings → Networking → Generate Domain
   - This will be your app URL (e.g., `https://avizo.up.railway.app`)

### Step 6: Update Backend CORS

Update your backend's `CLIENT_URL` environment variable to match your frontend URL:
```
CLIENT_URL=https://your-frontend.up.railway.app
```

## Option 2: Single Service Deployment (Backend serves Frontend)

This option is simpler but requires building the frontend and serving it from the backend.

### Step 1: Modify Backend to Serve Static Files

Update `server/src/index.ts`:

```typescript
import path from 'path';

// ... existing imports ...

// Serve static files from React app (add before routes)
const frontendPath = path.join(__dirname, '../../dist');
app.use(express.static(frontendPath));

// ... existing routes ...

// Serve React app for any other route (add at the end, before error handler)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});
```

### Step 2: Create a Build Script

Add to root `package.json`:
```json
{
  "scripts": {
    "build:all": "npm run build && cd server && npm run build",
    "start:prod": "cd server && npm start"
  }
}
```

### Step 3: Create Railway Configuration

Create `railway.json` in the root:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build:all"
  },
  "deploy": {
    "startCommand": "cd server && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Step 4: Deploy to Railway

1. Create a new project on Railway
2. Add PostgreSQL database
3. Connect your GitHub repo
4. Add environment variables:
   ```
   NODE_ENV=production
   DB_HOST=${{Postgres.PGHOST}}
   DB_PORT=${{Postgres.PGPORT}}
   DB_NAME=${{Postgres.PGDATABASE}}
   DB_USER=${{Postgres.PGUSER}}
   DB_PASSWORD=${{Postgres.PGPASSWORD}}
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   CLIENT_URL=${{RAILWAY_PUBLIC_DOMAIN}}
   PORT=3000
   ```
5. Generate a domain
6. Deploy!

## Post-Deployment Checklist

- [ ] Database is provisioned and accessible
- [ ] Database migrations have run successfully
- [ ] Backend is deployed and responding at `/api/health`
- [ ] Frontend is deployed and accessible
- [ ] Environment variables are set correctly
- [ ] CORS is configured properly
- [ ] JWT secret is set to a secure value
- [ ] Test login/signup functionality
- [ ] Test demo account creation
- [ ] Verify all API endpoints are working

## Monitoring and Logs

### View Logs
```bash
# Using Railway CLI
railway logs

# Or view in Railway dashboard
# Click on your service → Deployments → View logs
```

### Check Database Connection
```bash
# Using Railway CLI
railway run psql $DATABASE_URL
```

## Troubleshooting

### Issue: "Cannot connect to database"
**Solution:** Verify that the database environment variables are correctly set using the Railway reference syntax `${{Postgres.VARIABLE}}`

### Issue: "CORS errors"
**Solution:** Make sure `CLIENT_URL` in backend matches your frontend domain exactly (including `https://`)

### Issue: "Environment variables not loading"
**Solution:** Railway requires rebuild after changing environment variables. Click "Deploy" → "Redeploy"

### Issue: "Database tables don't exist"
**Solution:** Migrations haven't run. Use Railway CLI to run migrations or add migration to start script

### Issue: "502 Bad Gateway"
**Solution:**
- Check that your backend is listening on `process.env.PORT`
- Verify build succeeded in Railway logs
- Check for TypeScript compilation errors

## Updating Your Deployment

### Auto-Deploy on Push
Railway automatically redeploys when you push to your connected branch (usually `main`).

### Manual Deploy
1. Go to your service in Railway dashboard
2. Click "Deploy" → "Redeploy"

### Database Migrations on Update
When you update the schema:

```bash
# Option 1: Run via CLI
railway run npm run db:migrate

# Option 2: Add to start script (runs on every deploy)
"start": "npm run migrate:prod && node dist/index.js"
```

## Cost Optimization

Railway offers:
- **Free Tier:** $5/month in credits
- **Pro Plan:** $20/month + usage

**Tips to reduce costs:**
1. Use Railway's sleep feature for non-production deployments
2. Optimize your database queries
3. Use connection pooling (already configured in the app)
4. Monitor resource usage in Railway dashboard

## Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use strong JWT secret** - Generate with: `openssl rand -base64 32`
3. **Enable HTTPS only** - Railway provides this automatically
4. **Set secure CORS origins** - Only allow your frontend domain
5. **Keep dependencies updated** - Run `npm audit` regularly

## Custom Domain (Optional)

1. Go to your service → Settings → Networking
2. Click "Custom Domain"
3. Add your domain (e.g., `app.yourdomain.com`)
4. Update your DNS records as instructed by Railway
5. Update environment variables to use new domain

## Support

- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Avizo Issues: Open an issue on GitHub

---

**Ready to deploy?** Follow the steps above and you'll have Avizo running on Railway in minutes!

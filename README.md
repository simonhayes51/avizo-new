# Avizo - Appointment Management Platform

A modern, full-featured appointment management platform for service professionals. Built with React, TypeScript, Node.js/Express, and PostgreSQL.

## Features

### Core Features
- **Smart Scheduling** - Intelligent appointment management with gap detection and filling
- **Client Management** - Complete CRUD operations for managing your client database
- **Calendar Views** - Month and week views to visualize your schedule
- **Messaging** - Integrated client communication system
- **Automations** - Automated reminders, follow-ups, and custom workflows
- **Analytics** - Business insights with detailed performance metrics
- **Demo Mode** - Try the platform instantly with pre-populated demo data

### Technical Features
- JWT-based authentication
- RESTful API architecture
- PostgreSQL database with proper indexing
- Responsive design with Tailwind CSS
- Modern gradient UI with smooth animations
- Type-safe with TypeScript throughout

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Lucide React** - Icon library
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **pg** - PostgreSQL client
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd avizo-new
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb avizo

   # Or using psql
   psql -U postgres
   CREATE DATABASE avizo;
   \q
   ```

5. **Configure environment variables**

   Create `server/.env`:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=avizo
   DB_USER=postgres
   DB_PASSWORD=your_password

   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_change_in_production

   # Frontend URL (for CORS)
   CLIENT_URL=http://localhost:5173
   ```

   Create `.env` in the root:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

6. **Run database migrations**
   ```bash
   cd server
   npm run db:migrate
   cd ..
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   Backend will run on http://localhost:3000

2. **Start the frontend dev server** (in a new terminal)
   ```bash
   npm run dev
   ```
   Frontend will run on http://localhost:5173

3. **Open your browser**
   Navigate to http://localhost:5173

## Project Structure

```
avizo-new/
├── src/                          # Frontend source
│   ├── components/              # React components
│   │   ├── LandingPage.tsx     # Landing page with auth
│   │   ├── Layout.tsx          # App layout with navigation
│   │   ├── Dashboard.tsx       # Today's appointments view
│   │   ├── Clients.tsx         # Client management
│   │   ├── CalendarView.tsx    # Calendar views
│   │   ├── Conversations.tsx   # Messaging interface
│   │   ├── Automations.tsx     # Automation rules
│   │   ├── Analytics.tsx       # Business analytics
│   │   ├── Settings.tsx        # User settings
│   │   └── GapFiller.tsx       # Gap filling modal
│   ├── lib/
│   │   └── api.ts              # API client
│   ├── App.tsx                 # Main app with routing
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── server/                      # Backend source
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts     # PostgreSQL connection
│   │   ├── controllers/        # Route controllers
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/             # API routes
│   │   ├── utils/              # Utility functions
│   │   ├── db/
│   │   │   ├── schema.sql      # Database schema
│   │   │   └── migrate.ts      # Migration script
│   │   └── index.ts            # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/demo` - Create demo account
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Clients
- `GET /api/clients` - List all clients
- `GET /api/clients/:id` - Get client details
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Appointments
- `GET /api/appointments` - List appointments (with date filters)
- `GET /api/appointments/:id` - Get appointment details
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Conversations
- `GET /api/conversations` - List conversations
- `POST /api/conversations` - Create conversation
- `GET /api/conversations/:id/messages` - Get messages
- `POST /api/conversations/:id/messages` - Send message

### Automations
- `GET /api/automations` - List automations
- `POST /api/automations` - Create automation
- `PUT /api/automations/:id` - Update automation
- `DELETE /api/automations/:id` - Delete automation
- `GET /api/automations/:id/logs` - Get execution logs

### Analytics
- `GET /api/analytics` - Get analytics data

### Demo
- `POST /api/demo/setup` - Populate demo data

## Database Schema

The application uses PostgreSQL with the following main tables:

- **users** - User accounts and authentication
- **profiles** - Business profiles
- **clients** - Client information
- **appointments** - Scheduled appointments and gaps
- **conversations** - Message threads
- **messages** - Individual messages
- **automations** - Automation rules
- **automation_logs** - Automation execution history
- **integrations** - Connected services

See `server/src/db/schema.sql` for complete schema.

## Development

### Frontend Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run typecheck    # Type checking
```

### Backend Development
```bash
cd server
npm run dev          # Start dev server with hot reload
npm run build        # Build TypeScript
npm run start        # Start production server
npm run db:migrate   # Run database migrations
```

## Production Deployment

### Deploy to Railway (Recommended)

Railway provides the easiest deployment experience with managed PostgreSQL, automatic HTTPS, and simple environment management.

**Quick Start:**
1. Sign up at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Add PostgreSQL database
4. Configure environment variables
5. Deploy!

**📖 Full Railway deployment guide:** See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for detailed step-by-step instructions.

### Manual Deployment

#### Frontend
1. Build the frontend:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)

#### Backend
1. Build the backend:
   ```bash
   cd server
   npm run build
   ```
2. Set up PostgreSQL database on your server
3. Configure environment variables
4. Run migrations
5. Start the server:
   ```bash
   npm start
   ```

## Security Notes

- **JWT Secret**: Change the default JWT secret in production
- **Database Password**: Use a strong database password
- **CORS**: Configure CORS for your production domain
- **HTTPS**: Always use HTTPS in production
- **Environment Variables**: Never commit `.env` files

## License

MIT

## Support

For issues, questions, or contributions, please open an issue on GitHub.

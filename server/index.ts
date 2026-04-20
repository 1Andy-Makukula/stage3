import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path'; // Needed for absolute pathing
import { fileURLToPath } from 'url';
import { logger } from './logger';
import { getOrExecute } from './idempotency';
import { recordHandshakeFailure, resetHandshakeFailures } from './rateLimitIp';

// Infrastructure & Jobs
import { initEscrowExpiryJob } from './jobs/escrowExpiry';

// API Handlers
import { handlePaymentsInitiate } from '../src/app/api/handlers/paymentsInitiate';
import { handleFlutterwaveWebhook } from '../src/app/api/handlers/flutterwaveWebhook';
import { handleHandshakeVerify } from '../src/app/api/handlers/handshakeVerify';
import { handleCartLine } from '../src/app/api/handlers/cartLine';
import { handleWishlistToggle } from '../src/app/api/handlers/wishlistToggle';

// 1. Initialize Environment (The Andy Plan Path Fix)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// server/index.ts
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// DEBUG LINE: This tells us if the file was actually found
console.log('--- Environment Check ---');
console.log('File Path:', path.resolve(__dirname, '../.env'));
console.log('Keys Found:', Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('VITE')).length);
console.log('-------------------------');

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

// 2. Safety Breaker: Validate Infrastructure
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  logger.fatal('❌ FATAL: Missing Supabase credentials in .env');
  process.exit(1); // Stop the engine before it crashes later
}

// Initialize Supabase Admin (Bypasses RLS for secure Handshake/Escrow logic)
export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

// 3. Middlewares
app.set('trust proxy', 1);

app.use(
  pinoHttp({
    logger,
    autoLogging: { ignore: (req) => req.url === '/api/health' },
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? true,
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));

// 4. Utility: Async Wrapper
function asyncHandler(
  fn: (req: Request, res: Response) => Promise<void>
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    fn(req, res).catch((err: unknown) => {
      const log = (req as any).log ?? logger;
      log.error({ err, path: req.path }, 'unhandled_route_error');
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      } else {
        next(err);
      }
    });
  };
}

const getReqLog = (req: Request) => (req as any).log ?? logger;

// 5. API Routes
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'kithly-api',
    engine: 'active',
    database: !!supabaseAdmin ? 'connected' : 'disconnected'
  });
});

app.post(
  '/api/payments/initiate',
  asyncHandler(async (req, res) => {
    await handlePaymentsInitiate(req, res, getReqLog(req), getOrExecute);
  })
);

app.post(
  '/api/webhooks/flutterwave',
  asyncHandler(async (req, res) => {
    await handleFlutterwaveWebhook(req, res, getReqLog(req));
  })
);

app.post(
  '/api/handshake/verify',
  asyncHandler(async (req, res) => {
    await handleHandshakeVerify(req, res, getReqLog(req), {
      recordHandshakeFailure,
      resetHandshakeFailures,
    });
  })
);

app.post('/api/cart/line', asyncHandler(async (req, res) => {
  await handleCartLine(req, res, getReqLog(req), getOrExecute);
}));

// Admin Middleware & Handlers
import { adminAuth } from './middleware/adminAuth';
import * as admin from './api/admin/adminHandlers';

app.post('/api/wishlist/toggle', asyncHandler(async (req, res) => {
  await handleWishlistToggle(req, res, getReqLog(req), getOrExecute);
}));

// --- KGCC: Global Control Console (RESTRICTED) ---
app.use('/api/admin', adminAuth);

app.get('/api/admin/nodes', asyncHandler(async (req, res) => {
  await admin.getAdminNodes(req, res, getReqLog(req));
}));

app.get('/api/admin/flows', asyncHandler(async (req, res) => {
  await admin.getAdminFlows(req, res, getReqLog(req));
}));

app.post('/api/admin/ghost-onboard', asyncHandler(async (req, res) => {
  await admin.handleGhostOnboard(req, res, getReqLog(req));
}));

app.post('/api/admin/maintenance/prune-mock', asyncHandler(async (req, res) => {
  await admin.handlePruneMock(req, res, getReqLog(req));
}));

app.post('/api/admin/emergency/override', asyncHandler(async (req, res) => {
  await admin.handleEmergencyOverride(req, res, getReqLog(req));
}));
// ------------------------------------------------

// 6. 404 Handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 7. Engine Startup
app.listen(PORT, () => {
  logger.info({
    port: PORT,
    env: process.env.NODE_ENV,
    project: 'KithLy'
  }, 'kithly_api_listening');

  // Start the background maintenance engine
  initEscrowExpiryJob();
  logger.info('escrow_expiry_job_initialized');
});
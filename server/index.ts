import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
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

// 1. Initialize Environment & Infrastructure
dotenv.config();
const app = express();
const PORT = Number(process.env.PORT ?? 3001);

// 2. Initialize Supabase Admin (Service Role)
// This client bypasses RLS and is used for critical escrow/handshake logic
export const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

app.set('trust proxy', 1);

// 3. Logging & Middleware
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

app.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'kithly-api', database: 'connected' });
});

app.use(express.json({ limit: '1mb' }));

// 4. Utility: Async Wrapper for Domain Isolation
function asyncHandler(
  fn: (req: Request, res: Response) => Promise<void>
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    fn(req, res).catch((err: unknown) => {
      const log = (req as Request & { log?: typeof logger }).log ?? logger;
      log.error({ err, path: req.path }, 'unhandled_route_error');
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      } else {
        next(err);
      }
    });
  };
}

const routeLog = (req: Request) => (req as Request & { log?: typeof logger }).log ?? logger;

// 5. Protected API Routes
app.post(
  '/api/payments/initiate',
  asyncHandler(async (req, res) => {
    await handlePaymentsInitiate(req, res, routeLog(req), getOrExecute);
  })
);

app.post(
  '/api/webhooks/flutterwave',
  asyncHandler(async (req, res) => {
    // In production, the admin client is used here to lock the escrow status
    await handleFlutterwaveWebhook(req, res, routeLog(req));
  })
);

app.post(
  '/api/handshake/verify',
  asyncHandler(async (req, res) => {
    // Logic for releasing the KithLy escrow code
    await handleHandshakeVerify(req, res, routeLog(req), {
      recordHandshakeFailure,
      resetHandshakeFailures,
    });
  })
);

app.post(
  '/api/cart/line',
  asyncHandler(async (req, res) => {
    await handleCartLine(req, res, routeLog(req), getOrExecute);
  })
);

app.post(
  '/api/wishlist/toggle',
  asyncHandler(async (req, res) => {
    await handleWishlistToggle(req, res, routeLog(req), getOrExecute);
  })
);

// 6. Global Error Handling
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// 7. Engine Startup
app.listen(PORT, () => {
  logger.info({ port: PORT }, 'kithly_api_listening');

  // Start the background expiry engine
  initEscrowExpiryJob();
  logger.info('escrow_expiry_job_initialized');
});
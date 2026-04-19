import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { logger } from './logger';
import { getOrExecute } from './idempotency';
import { recordHandshakeFailure, resetHandshakeFailures } from './rateLimitIp';
import { handlePaymentsInitiate } from '../src/app/api/handlers/paymentsInitiate';
import { handleFlutterwaveWebhook } from '../src/app/api/handlers/flutterwaveWebhook';
import { handleHandshakeVerify } from '../src/app/api/handlers/handshakeVerify';
import { handleCartLine } from '../src/app/api/handlers/cartLine';
import { handleWishlistToggle } from '../src/app/api/handlers/wishlistToggle';

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

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

app.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'kithly-api' });
});

app.use(express.json({ limit: '1mb' }));

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

app.post(
  '/api/payments/initiate',
  asyncHandler(async (req, res) => {
    await handlePaymentsInitiate(req, res, routeLog(req), getOrExecute);
  })
);

app.post(
  '/api/webhooks/flutterwave',
  asyncHandler(async (req, res) => {
    await handleFlutterwaveWebhook(req, res, routeLog(req));
  })
);

app.post(
  '/api/handshake/verify',
  asyncHandler(async (req, res) => {
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

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'kithly_api_listening');
});

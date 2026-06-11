import cors from 'cors';
import express from 'express';

const env = {
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
};

function errorHandler(
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  console.error(err);
  const status = (err && (err.status || err.statusCode)) || 500;
  res.status(status).json({ error: err?.message || 'Internal Server Error' });
}
// Inline routes to avoid requiring a missing './routes' module
const routes = (() => {
  const router = express.Router();

  // Health check
  router.get('/health', (_req: express.Request, res: express.Response) => {
    res.json({ status: 'ok' });
  });

  // Add other API routes here, for example:
  // router.use('/posts', postsRouter);

  return router;
})();

// Fallback handler for unmatched routes (replaces missing external middleware)
function notFoundHandler(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  res.status(404).json({ error: 'Not Found' });
}

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

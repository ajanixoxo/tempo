import { describe, it, expect } from 'vitest';
import http from 'http';
import next from 'next';

describe('Server & Routes Integration', () => {
  it('loads Next.js app and responds on /, /controller, /display', async () => {
    const app = next({ dev: false, dir: process.cwd() });
    await app.prepare();
    const handle = app.getRequestHandler();

    const server = http.createServer((req, res) => {
      handle(req, res);
    });

    await new Promise<void>((resolve) => server.listen(3001, resolve));

    const checkRoute = (path: string): Promise<number> => {
      return new Promise((resolve, reject) => {
        http
          .get(`http://localhost:3001${path}`, (res) => {
            resolve(res.statusCode || 0);
          })
          .on('error', reject);
      });
    };

    const statusHome = await checkRoute('/');
    const statusController = await checkRoute('/controller');
    const statusDisplay = await checkRoute('/display');

    await new Promise<void>((resolve) => server.close(() => resolve()));
    await app.close();

    expect(statusHome).toBe(200);
    expect(statusController).toBe(200);
    expect(statusDisplay).toBe(200);
  }, 30000);
});

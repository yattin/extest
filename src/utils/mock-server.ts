import express from 'express';
import { Server } from 'http';
import path from 'path';
import { MockServer } from '../core/types';

export class MockServerImpl implements MockServer {
  public port: number;
  public url: string;
  private server: Server;
  private app: express.Application;

  constructor(port = 0) {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    
    this.server = this.app.listen(port);
    this.port = (this.server.address() as any).port;
    this.url = `http://localhost:${this.port}`;
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '../../test/fixtures/test-pages')));
    
    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      next();
    });
  }

  private setupRoutes(): void {
    // 基础测试页面
    this.app.get('/test-page', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Test Page</title></head>
        <body>
          <h1>Test Page</h1>
          <div id="content">Hello World</div>
          <button id="test-button">Click Me</button>
        </body>
        </html>
      `);
    });

    // API Mock 端点
    this.app.get('/api/test', (req, res) => {
      res.json({ message: 'Test API Response', timestamp: Date.now() });
    });

    this.app.post('/api/data', (req, res) => {
      res.json({ received: req.body, success: true });
    });

    // 动态 Mock 路由
    this.app.all('/mock/*', (req, res) => {
      const mockData = (req as any).mockData || { default: true };
      res.json(mockData);
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => resolve());
    });
  }
}
import request from 'supertest';
import app from '../src/app';
import { describe, it, expect } from '@jest/globals';

describe('Health', () => {
  it('GET / should respond 200 and Hello World!', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Hello World');
  });
});

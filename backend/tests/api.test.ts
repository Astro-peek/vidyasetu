// @ts-nocheck
import request from 'supertest';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../src/repositories/db', async () => {
  const { schemes } = await import('../src/repositories/mockStore');
  return {
    getPublishedSchemes: async () => schemes.filter((scheme: any) => scheme.status === 'Published')
  };
});

import { app } from '../src/app';

describe('API Endpoints', () => {
  it('GET /api/v1/health should return ok', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('ok');
    expect(res.body.version).toBe('1.0.0-mvp');
  });

  it('GET /api/v1/schemes should return published schemes', async () => {
    const res = await request(app).get('/api/v1/schemes');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/applications should reject unauthenticated requests', async () => {
    const res = await request(app).get('/api/v1/applications');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('POST /api/v1/applications should reject unauthenticated requests', async () => {
    const payload = {
      schemeId: 'nfst',
      formData: {
        fullName: 'Test User',
        familyIncome: 50000
      },
      documents: []
    };
    const res = await request(app).post('/api/v1/applications').send(payload);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects malformed bearer credentials', async () => {
    const res = await request(app)
      .get('/api/v1/applications')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});

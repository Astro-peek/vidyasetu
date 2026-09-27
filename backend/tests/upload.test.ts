import request from 'supertest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { app } from '../src/app';

// 1. Mock DB and environment
vi.mock('../src/repositories/db', async () => ({
  isLive: false,
  getPublishedSchemes: async () => [],
}));

// mock Gemini to simulate timeout and failure
const mockExtractDocumentWithGemini = vi.fn();
vi.mock('../src/integrations/gemini', () => ({
  extractDocumentWithGemini: (...args: any[]) => mockExtractDocumentWithGemini(...args),
  geminiConfigured: true,
  generateAIAssistantResponse: async () => 'hello'
}));

// mock Supabase for auth
vi.mock('../src/config/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(async (token) => {
        if (token === 'valid-token') {
          return { data: { user: { id: 'test-user-id', app_metadata: { role: 'applicant' } } }, error: null };
        }
        return { data: null, error: new Error('Invalid token') };
      })
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(async () => {
            // return profile
            return { data: { role: 'applicant', full_name: 'Test', phone: '123', state: 'test', preferred_language: 'en' }, error: null };
          })
        }))
      }))
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(async () => ({ data: { path: 'fake-path.pdf' }, error: null }))
      }))
    }
  }
}));

describe('Document Upload Workflow & Gemini Timeout Tests', () => {

  beforeEach(() => {
    mockExtractDocumentWithGemini.mockReset();
  });

  it('should successfully upload a document and extract data', async () => {
    mockExtractDocumentWithGemini.mockResolvedValueOnce({
       docType: 'income_certificate',
       fields: { name: 'Test User' },
       confidence: { name: 0.99 },
       qualityFlags: []
    });

    const res = await request(app)
      .post('/api/v1/documents/upload')
      .set('Authorization', 'Bearer valid-token')
      .field('docType', 'income_certificate')
      .attach('file', Buffer.from('dummy file content'), 'test.pdf');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.type).toBe('income_certificate');
    expect(res.body.data.url).toMatch(/uploads\/test-user-id\/.*-test.pdf/);
    expect(res.body.data.extraction.fields.name).toBe('Test User');
  });

  it('should handle Gemini timeout gracefully with authorized credentials', async () => {
    // Simulate Gemini timeout
    mockExtractDocumentWithGemini.mockResolvedValueOnce({
      docType: 'default',
      fields: {},
      confidence: {},
      qualityFlags: ['extraction_failed'],
      error: 'Gemini request timed out'
    });

    const res = await request(app)
      .post('/api/v1/documents/upload')
      .set('Authorization', 'Bearer valid-token')
      .attach('file', Buffer.from('dummy timeout'), 'timeout.pdf');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.extraction.error).toBe('Gemini request timed out');
    expect(res.body.data.extraction.qualityFlags).toContain('extraction_failed');
  });

  it('should handle Gemini failure properly', async () => {
    // Simulate generic failure
    mockExtractDocumentWithGemini.mockResolvedValueOnce({
      docType: 'default',
      fields: {},
      confidence: {},
      qualityFlags: ['extraction_failed'],
      error: 'Malformed AI response'
    });

    const res = await request(app)
      .post('/api/v1/documents/upload')
      .set('Authorization', 'Bearer valid-token')
      .attach('file', Buffer.from('fail doc'), 'fail.pdf');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.extraction.error).toBe('Malformed AI response');
  });

});

import { createMocks, RequestMethod } from 'node-mocks-http';

import handler from '../create';
import testUser from '../../../../auth/test_user';
import type { APIRequest, APIResponse } from '../../../../testing/api_mocker';

import { prismaMock } from '../../../../testing/singleton';

jest.mock('../../../../firebase/admin', () => ({
  FIREBASE_ADMIN: {
    auth: () => ({
      verifyIdToken: (token: string) => Promise.resolve(token === 'test'),
    }),
    apps: [null],
  },
  getSession: (token: string) => Promise.resolve(token !== 'authorized' ? null : 'TestUser'),
}));

// jest.mock('../../../../prisma', () => ({
//   prisma: prismaMock,
// }))

const mockReq = (token: 'authorized' | 'unauthorized', method: RequestMethod = 'POST') => createMocks<APIRequest, APIResponse>({
  method,
  body: testUser,
  cookies: {
    token,
  }
})

describe('Testing userinfo/create API route handler', () => {
  it('Creates a userinfo entry no issue', async () => {
    const { req, res } = mockReq('authorized');

    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ result: 'success', value: testUser });
  });

  it('should return a 401 if the user is unauthorized', async () => {
    const { req, res } = mockReq('unauthorized');

    await handler(req, res);
    expect(res.statusCode).toBe(401);
    expect(res._getJSONData()).toEqual({ result: 'error', value: 'Must be logged in' });
  })

  it('should return a 405 if the HTTP method was unsupported', async () => {
    const { req, res } = mockReq('authorized');

    await handler(req, res);
    expect(res.statusCode).toBe(405);
    expect(res._getJSONData()).toEqual({ result: 'error', value: `Unsupported HTTP method: 'PUT'` });
  });

  it('should return 500 if the handler errors', async () => {
    const { req, res } = createMocks<APIRequest, APIResponse>({
      method: 'POST',
      body: {
        meme: true,
      },
      cookies: {
        token: 'authorized',
      }
    })


    await handler(req, res);
    expect(res.statusCode).toBe(500);
    // TODO changed this to the prisma error message
    expect(res._getJSONData()).toEqual({ result: 'error', value: `Unsupported HTTP method: 'PUT'` });
  })
})


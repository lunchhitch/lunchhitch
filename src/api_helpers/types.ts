import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Type returned by API routes
 */
export type APIResult<Result> = {
  result: 'success';
  value: Result;
} | {
  result: 'error';
  value: any;
}

/**
 * Configuration parameters for API route handlers.
 */
export type APIParams<T> = {
  params?: string[];
  handler: (args: {req: NextApiRequest, res: NextApiResponse, params: { [name: string]: string }}) => Promise<APIResult<T>>;
  errorHandler?: (error: any, res: NextApiResponse) => void;
}

import jwt from 'jsonwebtoken';
import config from '../config/app.config';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Generate an access token
 * @param payload - Token payload
 * @returns Access token
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  // @ts-ignore - Ignoring type issues with jsonwebtoken
  return jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: config.jwtAccessExpiration,
  });
};

/**
 * Generate a refresh token
 * @param payload - Token payload
 * @returns Refresh token
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  // @ts-ignore - Ignoring type issues with jsonwebtoken
  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiration,
  });
};

/**
 * Verify an access token
 * @param token - Access token
 * @returns Decoded token payload or null if invalid
 */
export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    // @ts-ignore - Ignoring type issues with jsonwebtoken
    return jwt.verify(token, config.jwtAccessSecret) as TokenPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Verify a refresh token
 * @param token - Refresh token
 * @returns Decoded token payload or null if invalid
 */
export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    // @ts-ignore - Ignoring type issues with jsonwebtoken
    return jwt.verify(token, config.jwtRefreshSecret) as TokenPayload;
  } catch (error) {
    return null;
  }
};
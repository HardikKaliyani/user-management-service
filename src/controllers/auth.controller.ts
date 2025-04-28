import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger.util';

/**
 * Authentication controller
 */
class AuthController {
  /**
   * Register a new user
   * 
   * @param req - Express request
   * @param res - Express response
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already exists') {
        res.status(409).json({
          status: 'error',
          message: 'Email already exists',
        });
      } else {
        logger.error('Registration error:', { error });
        res.status(500).json({
          status: 'error',
          message: 'An error occurred during registration',
        });
      }
    }
  }

  /**
   * Login a user
   * 
   * @param req - Express request
   * @param res - Express response
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid email or password') {
        res.status(401).json({
          status: 'error',
          message: 'Invalid email or password',
        });
      } else {
        logger.error('Login error:', { error });
        res.status(500).json({
          status: 'error',
          message: 'An error occurred during login',
        });
      }
    }
  }

  /**
   * Refresh access token
   * 
   * @param req - Express request
   * @param res - Express response
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.refreshToken(req.body);
      res.status(200).json({
        status: 'success',
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid refresh token') {
        res.status(401).json({
          status: 'error',
          message: 'Invalid refresh token',
        });
      } else {
        logger.error('Token refresh error:', { error });
        res.status(500).json({
          status: 'error',
          message: 'An error occurred during token refresh',
        });
      }
    }
  }

  /**
   * Logout a user
   * 
   * @param req - Express request
   * @param res - Express response
   */
  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({
          status: 'error',
          message: 'Unauthorized',
        });
        return;
      }

      await authService.logout(req.user.id);
      res.status(200).json({
        status: 'success',
        message: 'Logout successful',
      });
    } catch (error) {
      logger.error('Logout error:', { error });
      res.status(500).json({
        status: 'error',
        message: 'An error occurred during logout',
      });
    }
  }

  /**
   * Get current user information
   * 
   * @param req - Express request
   * @param res - Express response
   */
  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          status: 'error',
          message: 'Unauthorized',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        message: 'Current user retrieved',
        data: {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
        },
      });
    } catch (error) {
      logger.error('Get current user error:', { error });
      res.status(500).json({
        status: 'error',
        message: 'An error occurred',
      });
    }
  }
}

export default new AuthController();
import { User } from '@prisma/client';
import userRepository from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/password.util';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util';
import { ApiError } from '../middlewares/error.middleware';
import { AuthResponseDto, LoginDto, RefreshTokenDto, RegisterDto } from '../dtos/auth.dto';
import logger from '../utils/logger.util';

/**
 * Authentication service
 */
class AuthService {
  /**
   * Register a new user
   * 
   * @param userData - User registration data
   * @returns Authentication response with tokens and user info
   */
  async register(userData: RegisterDto): Promise<AuthResponseDto> {
    try {
      // Check if email already exists
      const existingUser = await userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new ApiError(409, 'Email already exists');
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);

      // Create user
      const user = await userRepository.create({
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        role: userData.role ? userData.role as any : undefined,
      });

      // Generate tokens
      const tokens = this.generateTokens(user);

      // Save refresh token
      await userRepository.updateRefreshToken(user.id, tokens.refreshToken);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      logger.error('User registration failed:', { error, email: userData.email });
      throw error;
    }
  }

  /**
   * Login a user
   * 
   * @param loginData - User login data
   * @returns Authentication response with tokens and user info
   */
  async login(loginData: LoginDto): Promise<AuthResponseDto> {
    try {
      // Find user by email
      const user = await userRepository.findByEmail(loginData.email);
      if (!user) {
        throw new ApiError(401, 'Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await comparePassword(loginData.password, user.password);
      if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid email or password');
      }

      // Generate tokens
      const tokens = this.generateTokens(user);

      // Save refresh token
      await userRepository.updateRefreshToken(user.id, tokens.refreshToken);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      logger.error('User login failed:', { error, email: loginData.email });
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   * 
   * @param refreshTokenData - Refresh token data
   * @returns New authentication tokens
   */
  async refreshToken(refreshTokenData: RefreshTokenDto): Promise<Omit<AuthResponseDto, 'user'>> {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshTokenData.refreshToken);
      if (!payload) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      // Find user by ID
      const user = await userRepository.findById(payload.userId);
      if (!user || user.refreshToken !== refreshTokenData.refreshToken) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      // Save new refresh token
      await userRepository.updateRefreshToken(user.id, tokens.refreshToken);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      logger.error('Token refresh failed:', { error });
      throw error;
    }
  }

  /**
   * Logout a user
   * 
   * @param userId - User ID
   */
  async logout(userId: string): Promise<void> {
    try {
      // Clear refresh token
      await userRepository.updateRefreshToken(userId, '');
    } catch (error) {
      logger.error('User logout failed:', { error, userId });
      throw error;
    }
  }

  /**
   * Generate access and refresh tokens for a user
   * 
   * @param user - User object
   * @returns Access and refresh tokens
   */
  private generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: generateAccessToken(tokenPayload),
      refreshToken: generateRefreshToken(tokenPayload),
    };
  }
}

export default new AuthService();
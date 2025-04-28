import { User } from '@prisma/client';
import userRepository from '../repositories/user.repository';
import { ChangePasswordDto, CreateUserDto, UpdateUserDto, UserFilterDto, UserListDto, UserResponseDto } from '../dtos/user.dto';
import { hashPassword, comparePassword } from '../utils/password.util';
import { ApiError } from '../middlewares/error.middleware';
import logger from '../utils/logger.util';

/**
 * User service for user management operations
 */
class UserService {
  /**
   * Create a new user
   * 
   * @param userData - User data
   * @returns User response
   */
  async createUser(userData: CreateUserDto): Promise<UserResponseDto> {
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
        role: userData.role,
      });

      return this.mapUserToResponse(user);
    } catch (error) {
      logger.error('User creation failed:', { error, email: userData.email });
      throw error;
    }
  }

  /**
   * Get a user by ID
   * 
   * @param userId - User ID
   * @returns User response
   */
  async getUserById(userId: string): Promise<UserResponseDto> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return this.mapUserToResponse(user);
  }

  /**
   * Update a user
   * 
   * @param userId - User ID
   * @param userData - User data to update
   * @returns Updated user response
   */
  async updateUser(userId: string, userData: UpdateUserDto): Promise<UserResponseDto> {
    try {
      // Check if user exists
      const existingUser = await userRepository.findById(userId);
      if (!existingUser) {
        throw new ApiError(404, 'User not found');
      }

      // Update user
      const updatedUser = await userRepository.update(userId, userData);

      return this.mapUserToResponse(updatedUser);
    } catch (error) {
      logger.error('User update failed:', { error, userId });
      throw error;
    }
  }

  /**
   * Change user password
   * 
   * @param userId - User ID
   * @param passwordData - Password change data
   */
  async changePassword(userId: string, passwordData: ChangePasswordDto): Promise<void> {
    try {
      // Check if user exists
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Verify current password
      const isPasswordValid = await comparePassword(passwordData.currentPassword, user.password);
      if (!isPasswordValid) {
        throw new ApiError(400, 'Current password is incorrect');
      }

      // Hash new password
      const hashedPassword = await hashPassword(passwordData.newPassword);

      // Update password
      await userRepository.updatePassword(userId, hashedPassword);
    } catch (error) {
      logger.error('Password change failed:', { error, userId });
      throw error;
    }
  }

/**
   * Soft delete a user
   * 
   * @param userId - User ID
   */
async softDeleteUser(userId: string): Promise<void> {
  try {
    // Check if user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Soft delete user
    await userRepository.softDelete(userId);
  } catch (error) {
    logger.error('User soft deletion failed:', { error, userId });
    throw error;
  }
}

/**
 * Hard delete a user (permanent deletion)
 * 
 * @param userId - User ID
 */
async hardDeleteUser(userId: string): Promise<void> {
  try {
    // Check if user exists
    const user = await userRepository.findById(userId, true); // Include deleted users
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Hard delete user
    await userRepository.hardDelete(userId);
  } catch (error) {
    logger.error('User hard deletion failed:', { error, userId });
    throw error;
  }
}

  /**
   * Get all users with filtering and pagination
   * 
   * @param filter - Filter options
   * @returns List of users
   */
  async getUsers(filter: UserFilterDto): Promise<UserListDto> {
    try {
      const { users, totalUsers } = await userRepository.findAll(filter);

      // Calculate total pages
      const limit = filter.limit || 10;
      const totalPages = Math.ceil(totalUsers / limit);

      return {
        users: users.map(this.mapUserToResponse),
        totalUsers,
        page: filter.page || 1,
        limit,
        totalPages,
      };
    } catch (error) {
      logger.error('Fetching users failed:', { error, filter });
      throw error;
    }
  }

  /**
   * Map user entity to response DTO
   * 
   * @param user - User entity
   * @returns User response
   */
  private mapUserToResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      deleted: user.deleted,
      deletedAt: user.deletedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export default new UserService();
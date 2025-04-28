import { Prisma, Role, User } from '@prisma/client';
import prisma from '../config/database.config';
import { UserFilterDto } from '../dtos/user.dto';
import { ApiError } from '../middlewares/error.middleware';

/**
 * User repository for database operations
 */
class UserRepository {
  /**
   * Create a new user
   * 
   * @param userData - User data to create
   * @returns Created user
   */
  async create(userData: {
    email: string;
    name: string;
    password: string;
    role?: Role;
  }): Promise<User> {
    try {
      return await prisma.user.create({
        data: userData,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ApiError(409, 'Email already exists');
      }
      throw error;
    }
  }

 /**
   * Find a user by email
   * 
   * @param email - User email
   * @param includeDeleted - Whether to include deleted users
   * @returns User or null if not found
   */
 async findByEmail(email: string, includeDeleted: boolean = false): Promise<User | null> {
  if (includeDeleted) {
    return prisma.user.findUnique({
      where: { email },
    });
  }
  
  return prisma.user.findFirst({
    where: { 
      email,
      deleted: false
    },
  });
}

 /**
   * Find a user by ID
   * 
   * @param id - User ID
   * @param includeDeleted - Whether to include deleted users
   * @returns User or null if not found
   */
 async findById(id: string, includeDeleted: boolean = false): Promise<User | null> {
  if (includeDeleted) {
    return prisma.user.findUnique({
      where: { id },
    });
  }
  
  return prisma.user.findFirst({
    where: { 
      id,
      deleted: false 
    },
  });
}
  /**
   * Update user refresh token
   * 
   * @param userId - User ID
   * @param refreshToken - New refresh token
   * @returns Updated user
   */
  async updateRefreshToken(userId: string, refreshToken: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  /**
   * Update user data
   * 
   * @param userId - User ID
   * @param userData - User data to update
   * @returns Updated user
   */
  async update(
    userId: string,
    userData: { name?: string; role?: Role }
  ): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: userData,
    });
  }

  /**
   * Update user password
   * 
   * @param userId - User ID
   * @param password - New password
   * @returns Updated user
   */
  async updatePassword(userId: string, password: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { password },
    });
  }


  /**
   * Soft delete a user
   * 
   * @param userId - User ID
   * @returns Soft deleted user
   */
  async softDelete(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { 
        deleted: true,
        deletedAt: new Date(),
      },
    });
  }
  
  /**
   * Hard delete a user (permanent deletion)
   * 
   * @param userId - User ID
   * @returns Deleted user
   */
  async hardDelete(userId: string): Promise<User> {
    return prisma.user.delete({
      where: { id: userId },
    });
  }


  /**
   * Find users with filtering, pagination, and sorting
   * 
   * @param filter - Filter and pagination options
   * @returns Users and count
   */
  async findAll(filter: UserFilterDto): Promise<{
    users: User[];
    totalUsers: number;
  }> {
    const {
      page = 1,
      limit = 10,
      role,
      email,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeDeleted = false
    } = filter;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Prepare filter conditions
    const where: Prisma.UserWhereInput = {};
    
    if (role) {
      where.role = role;
    }
    
    if (email) {
      where.email = {
        contains: email,
        mode: 'insensitive',
      };
    }

    // Prepare sort order
    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Execute query
    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, totalUsers };
  }
}

export default new UserRepository();
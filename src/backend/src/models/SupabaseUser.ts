import bcrypt from 'bcryptjs';
import { dbService, userService, Tables, Inserts, Updates, SupabaseError } from '../utils/supabaseDb';

// User roles
export enum UserRole {
    ADMIN = 'admin',
    QUALITY = 'quality',
    PRODUCTION = 'production',
    SUPPLIER = 'supplier',
    VIEWER = 'viewer'
}

// User type definitions based on Supabase schema
export type User = Tables<'users'>;
export type UserInsert = Inserts<'users'>;
export type UserUpdate = Updates<'users'>;

// User interface for API responses (without password)
export interface UserResponse extends Omit<User, 'password_hash'> {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    department: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// User creation data
export interface CreateUserData {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    department?: string;
}

// User update data
export interface UpdateUserData {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    department?: string;
    is_active?: boolean;
}

export class UserModel {
    // Create a new user
    static async create(userData: CreateUserData): Promise<UserResponse> {
        try {
            // Check if user already exists
            const existingUser = await userService.findByEmail(userData.email);
            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(userData.password, salt);

            // Prepare user data for insertion
            const userInsert: UserInsert = {
                name: userData.name.trim(),
                email: userData.email.toLowerCase().trim(),
                password_hash,
                role: userData.role || UserRole.VIEWER,
                department: userData.department?.trim() || null,
                is_active: true,
            };

            // Create user in database
            const newUser = await userService.createUser(userInsert);
            
            // Return user without password hash
            return this.toUserResponse(newUser);
        } catch (error) {
            if (error instanceof SupabaseError) {
                if (error.code === '23505') { // Unique constraint violation
                    throw new Error('User with this email already exists');
                }
            }
            throw error;
        }
    }

    // Find user by ID
    static async findById(id: string): Promise<UserResponse | null> {
        try {
            const user = await dbService.findById('users', id);
            return user ? this.toUserResponse(user) : null;
        } catch (error) {
            throw error;
        }
    }

    // Find user by email (with password for authentication)
    static async findByEmailWithPassword(email: string): Promise<User | null> {
        try {
            return await userService.findByEmail(email);
        } catch (error) {
            throw error;
        }
    }

    // Find user by email (without password)
    static async findByEmail(email: string): Promise<UserResponse | null> {
        try {
            const user = await userService.findByEmail(email);
            return user ? this.toUserResponse(user) : null;
        } catch (error) {
            throw error;
        }
    }

    // Update user
    static async update(id: string, updateData: UpdateUserData): Promise<UserResponse> {
        try {
            const updates: UserUpdate = {};

            // Prepare update data
            if (updateData.name !== undefined) {
                updates.name = updateData.name.trim();
            }
            if (updateData.email !== undefined) {
                updates.email = updateData.email.toLowerCase().trim();
            }
            if (updateData.role !== undefined) {
                updates.role = updateData.role;
            }
            if (updateData.department !== undefined) {
                updates.department = updateData.department?.trim() || null;
            }
            if (updateData.is_active !== undefined) {
                updates.is_active = updateData.is_active;
            }

            // Hash password if provided
            if (updateData.password) {
                const salt = await bcrypt.genSalt(10);
                updates.password_hash = await bcrypt.hash(updateData.password, salt);
            }

            // Update user in database
            const updatedUser = await userService.updateUser(id, updates);
            
            return this.toUserResponse(updatedUser);
        } catch (error) {
            if (error instanceof SupabaseError) {
                if (error.code === '23505') { // Unique constraint violation
                    throw new Error('User with this email already exists');
                }
            }
            throw error;
        }
    }

    // Delete user (soft delete by setting is_active to false)
    static async delete(id: string): Promise<void> {
        try {
            await this.update(id, { is_active: false });
        } catch (error) {
            throw error;
        }
    }

    // Get all active users
    static async findActive(): Promise<UserResponse[]> {
        try {
            const users = await userService.getActiveUsers();
            return users.map(user => this.toUserResponse(user));
        } catch (error) {
            throw error;
        }
    }

    // Get all users (including inactive)
    static async findAll(): Promise<UserResponse[]> {
        try {
            const users = await dbService.select('users', {
                orderBy: { column: 'name', ascending: true }
            });
            return users.map(user => this.toUserResponse(user));
        } catch (error) {
            throw error;
        }
    }

    // Get users by role
    static async findByRole(role: UserRole): Promise<UserResponse[]> {
        try {
            const users = await dbService.select('users', {
                filters: { role, is_active: true },
                orderBy: { column: 'name', ascending: true }
            });
            return users.map(user => this.toUserResponse(user));
        } catch (error) {
            throw error;
        }
    }

    // Search users
    static async search(searchTerm: string): Promise<UserResponse[]> {
        try {
            const users = await dbService.search('users', 'name', searchTerm, {
                limit: 50
            });
            return users
                .filter(user => user.is_active)
                .map(user => this.toUserResponse(user));
        } catch (error) {
            throw error;
        }
    }

    // Compare password for authentication
    static async comparePassword(user: User, candidatePassword: string): Promise<boolean> {
        try {
            return await bcrypt.compare(candidatePassword, user.password_hash);
        } catch (error) {
            throw error;
        }
    }

    // Count users
    static async count(filters?: { role?: UserRole; is_active?: boolean }): Promise<number> {
        try {
            return await dbService.count('users', filters);
        } catch (error) {
            throw error;
        }
    }

    // Convert User to UserResponse (remove sensitive data)
    private static toUserResponse(user: User): UserResponse {
        const { password_hash, ...userResponse } = user;
        return userResponse as UserResponse;
    }

    // Check if user exists
    static async exists(id: string): Promise<boolean> {
        try {
            const user = await this.findById(id);
            return user !== null;
        } catch (error) {
            return false;
        }
    }

    // Activate user
    static async activate(id: string): Promise<UserResponse> {
        return await this.update(id, { is_active: true });
    }

    // Deactivate user
    static async deactivate(id: string): Promise<UserResponse> {
        return await this.update(id, { is_active: false });
    }

    // Change user role
    static async changeRole(id: string, role: UserRole): Promise<UserResponse> {
        return await this.update(id, { role });
    }

    // Change password
    static async changePassword(id: string, newPassword: string): Promise<UserResponse> {
        return await this.update(id, { password: newPassword });
    }
}

export default UserModel;

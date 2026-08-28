import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signAdminToken, AdminJwtPayload } from '@/lib/auth';
import { LoginInput } from '@/lib/validators/auth.schema';

export class AuthService {
  /**
   * Authenticates an administrator by email and password
   */
  static async login(input: LoginInput): Promise<{ token: string; user: AdminJwtPayload }> {
    const admin = await prisma.admin.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });

    if (!admin) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(input.password, admin.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const userPayload: AdminJwtPayload = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };

    const token = await signAdminToken(userPayload);

    return {
      token,
      user: userPayload,
    };
  }

  /**
   * Retrieves admin profile by ID
   */
  static async getAdminById(id: string) {
    return prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }
}

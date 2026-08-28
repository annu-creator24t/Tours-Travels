import prisma from '@/lib/db';
import { DriverStatus } from '@prisma/client';
import { CreateDriverInput, UpdateDriverInput } from '@/lib/validators/driver.schema';

export class DriverService {
  /**
   * Lists all drivers with assigned bookings
   */
  static async getAllDrivers() {
    return prisma.driver.findMany({
      include: {
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Fetches available drivers for trip assignment
   */
  static async getAvailableDrivers() {
    return prisma.driver.findMany({
      where: { status: DriverStatus.AVAILABLE },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Creates a new driver profile
   */
  static async createDriver(input: CreateDriverInput) {
    return prisma.driver.create({
      data: input,
    });
  }

  /**
   * Updates driver details
   */
  static async updateDriver(id: string, input: UpdateDriverInput) {
    return prisma.driver.update({
      where: { id },
      data: input,
    });
  }

  /**
   * Updates driver status (e.g. AVAILABLE / ON_TRIP / OFF_DUTY)
   */
  static async updateDriverStatus(id: string, status: DriverStatus) {
    return prisma.driver.update({
      where: { id },
      data: { status },
    });
  }
}

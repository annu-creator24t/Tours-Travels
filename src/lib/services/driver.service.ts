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
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Fetches a driver by ID
   */
  static async getDriverById(id: string) {
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        _count: {
          select: { bookings: true },
        },
        bookings: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            bookingRef: true,
            customerName: true,
            status: true,
            pickupDatetime: true,
          },
        },
      },
    });

    if (!driver) {
      throw new Error('Driver not found');
    }

    return driver;
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
   * Creates a new driver profile with duplicate checks
   */
  static async createDriver(input: CreateDriverInput) {
    const existingPhone = await prisma.driver.findUnique({
      where: { phone: input.phone },
    });
    if (existingPhone) {
      throw new Error(`A driver with phone number ${input.phone} already exists`);
    }

    const existingLicense = await prisma.driver.findFirst({
      where: { licenseNumber: input.licenseNumber },
    });
    if (existingLicense) {
      throw new Error(`A driver with license number ${input.licenseNumber} already exists`);
    }

    return prisma.driver.create({
      data: {
        name: input.name.trim(),
        phone: input.phone.trim(),
        licenseNumber: input.licenseNumber.trim(),
        experienceYears: input.experienceYears,
        status: input.status || DriverStatus.AVAILABLE,
      },
    });
  }

  /**
   * Updates driver details with duplicate checks
   */
  static async updateDriver(id: string, input: UpdateDriverInput) {
    const driver = await prisma.driver.findUnique({ where: { id } });
    if (!driver) {
      throw new Error('Driver not found');
    }

    if (input.phone && input.phone !== driver.phone) {
      const existingPhone = await prisma.driver.findUnique({
        where: { phone: input.phone },
      });
      if (existingPhone && existingPhone.id !== id) {
        throw new Error(`A driver with phone number ${input.phone} already exists`);
      }
    }

    if (input.licenseNumber && input.licenseNumber !== driver.licenseNumber) {
      const existingLicense = await prisma.driver.findFirst({
        where: { licenseNumber: input.licenseNumber },
      });
      if (existingLicense && existingLicense.id !== id) {
        throw new Error(`A driver with license number ${input.licenseNumber} already exists`);
      }
    }

    return prisma.driver.update({
      where: { id },
      data: {
        name: input.name?.trim(),
        phone: input.phone?.trim(),
        licenseNumber: input.licenseNumber?.trim(),
        experienceYears: input.experienceYears,
        status: input.status,
      },
    });
  }

  /**
   * Updates driver status (e.g. AVAILABLE / ON_TRIP / OFF_DUTY / INACTIVE)
   */
  static async updateDriverStatus(id: string, status: DriverStatus) {
    const driver = await prisma.driver.findUnique({ where: { id } });
    if (!driver) {
      throw new Error('Driver not found');
    }

    return prisma.driver.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Deletes a driver
   */
  static async deleteDriver(id: string) {
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!driver) {
      throw new Error('Driver not found');
    }

    return prisma.driver.delete({
      where: { id },
    });
  }
}

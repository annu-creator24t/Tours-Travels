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
   * Fetches available drivers for trip assignment, optionally filtering by schedule conflict
   */
  static async getAvailableDrivers(
    pickupDatetime?: Date | string,
    returnDatetime?: Date | string | null,
    excludeBookingId?: string
  ) {
    const activeDrivers = await prisma.driver.findMany({
      where: {
        status: { in: [DriverStatus.AVAILABLE, DriverStatus.ON_TRIP] },
      },
      orderBy: { name: 'asc' },
    });

    if (!pickupDatetime) {
      return activeDrivers.filter((d) => d.status === DriverStatus.AVAILABLE);
    }

    const start = new Date(pickupDatetime);
    const end = returnDatetime
      ? new Date(returnDatetime)
      : new Date(start.getTime() + 24 * 60 * 60 * 1000);

    const conflictingBookings = await prisma.booking.findMany({
      where: {
        driverId: { in: activeDrivers.map((d) => d.id) },
        status: 'CONFIRMED',
        ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
        pickupDatetime: { lte: end },
      },
      select: {
        driverId: true,
        pickupDatetime: true,
        returnDatetime: true,
      },
    });

    const busyDriverIds = new Set<string>();
    for (const b of conflictingBookings) {
      if (!b.driverId) continue;
      const bStart = new Date(b.pickupDatetime);
      const bEnd = b.returnDatetime
        ? new Date(b.returnDatetime)
        : new Date(bStart.getTime() + 24 * 60 * 60 * 1000);
      if (bStart <= end && bEnd >= start) {
        busyDriverIds.add(b.driverId);
      }
    }

    return activeDrivers.filter(
      (d) =>
        d.status !== DriverStatus.INACTIVE &&
        d.status !== DriverStatus.OFF_DUTY &&
        !busyDriverIds.has(d.id)
    );
  }

  /**
   * Atomic concurrency check: Verifies if a driver is free from active/confirmed overlapping bookings.
   * Accepts an optional Prisma transaction client for atomic execution.
   */
  static async isDriverAvailable(
    driverId: string,
    pickupDatetime: Date,
    returnDatetime?: Date | null,
    excludeBookingId?: string,
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0] = prisma
  ): Promise<{ available: boolean; reason?: string }> {
    const start = new Date(pickupDatetime);
    const end = returnDatetime
      ? new Date(returnDatetime)
      : new Date(start.getTime() + 24 * 60 * 60 * 1000);

    // 1. Check driver operational status
    const driver = await tx.driver.findUnique({
      where: { id: driverId },
      select: { status: true, name: true },
    });

    if (!driver) {
      return { available: false, reason: 'Driver record not found' };
    }

    if (driver.status === DriverStatus.INACTIVE) {
      return {
        available: false,
        reason: `Driver ${driver.name} is currently inactive and cannot be assigned to trips`,
      };
    }

    if (driver.status === DriverStatus.OFF_DUTY) {
      return {
        available: false,
        reason: `Driver ${driver.name} is currently off-duty and cannot be assigned to trips`,
      };
    }

    // 2. Check overlapping CONFIRMED bookings in database
    const potentialBookings = await tx.booking.findMany({
      where: {
        driverId,
        status: 'CONFIRMED',
        ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
        pickupDatetime: { lte: end },
      },
      select: {
        bookingRef: true,
        pickupDatetime: true,
        returnDatetime: true,
      },
    });

    const overlappingBooking = potentialBookings.find((b) => {
      const bStart = new Date(b.pickupDatetime);
      const bEnd = b.returnDatetime
        ? new Date(b.returnDatetime)
        : new Date(bStart.getTime() + 24 * 60 * 60 * 1000);
      return bStart <= end && bEnd >= start;
    });

    if (overlappingBooking) {
      return {
        available: false,
        reason: `Driver ${driver.name} has a confirmed booking (#${overlappingBooking.bookingRef}) overlapping this schedule.`,
      };
    }

    return { available: true };
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

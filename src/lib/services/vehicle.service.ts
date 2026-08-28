import prisma from '@/lib/db';
import { VehicleStatus, Prisma } from '@prisma/client';
import { CreateVehicleInput, UpdateVehicleInput } from '@/lib/validators/vehicle.schema';

export class VehicleService {
  /**
   * Generates a URL-safe slug from vehicle name and brand
   */
  static generateSlug(name: string, brand: string): string {
    const raw = `${brand}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return raw;
  }

  /**
   * Fetches public active vehicles with optional filtering
   */
  static async getPublicVehicles(filters?: {
    vehicleType?: string;
    seatingCapacity?: number;
    hasAc?: boolean;
    isFeatured?: boolean;
  }) {
    const where: Prisma.VehicleWhereInput = {
      status: { notIn: [VehicleStatus.INACTIVE, VehicleStatus.MAINTENANCE] },
    };

    if (filters?.vehicleType) {
      where.vehicleType = { equals: filters.vehicleType, mode: 'insensitive' };
    }
    if (filters?.seatingCapacity) {
      where.seatingCapacity = { gte: filters.seatingCapacity };
    }
    if (filters?.hasAc !== undefined) {
      where.hasAc = filters.hasAc;
    }
    if (filters?.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    return prisma.vehicle.findMany({
      where,
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: [{ isFeatured: 'desc' }, { perKmRate: 'asc' }],
    });
  }

  /**
   * Fetches a single vehicle by slug with approved reviews
   */
  static async getVehicleBySlug(slug: string) {
    return prisma.vehicle.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        reviews: {
          where: { isApproved: true },
          orderBy: { reviewDate: 'desc' },
        },
      },
    });
  }

  /**
   * Fetches a vehicle by primary ID
   */
  static async getVehicleById(id: string) {
    return prisma.vehicle.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        availabilityBlocks: {
          orderBy: { startDatetime: 'asc' },
        },
      },
    });
  }

  /**
   * Atomic concurrency check: Verifies if a vehicle is free from confirmed bookings and maintenance blocks.
   * Accepts an optional Prisma transaction client for atomic execution.
   */
  static async isVehicleAvailable(
    vehicleId: string,
    pickupDatetime: Date,
    returnDatetime?: Date | null,
    excludeBookingId?: string,
    tx: Prisma.TransactionClient = prisma
  ): Promise<{ available: boolean; reason?: string }> {
    const start = new Date(pickupDatetime);
    const end = returnDatetime
      ? new Date(returnDatetime)
      : new Date(start.getTime() + 24 * 60 * 60 * 1000); // 24h default for one-way

    // 1. Check vehicle operational status
    const vehicle = await tx.vehicle.findUnique({
      where: { id: vehicleId },
      select: { status: true, name: true },
    });

    if (!vehicle) {
      return { available: false, reason: 'Vehicle does not exist in inventory' };
    }

    if (vehicle.status === VehicleStatus.INACTIVE) {
      return { available: false, reason: 'Vehicle is currently inactive/decommissioned' };
    }

    if (vehicle.status === VehicleStatus.MAINTENANCE) {
      return { available: false, reason: 'Vehicle is currently undergoing maintenance' };
    }

    // 2. Check overlapping CONFIRMED bookings in database
    const overlappingBooking = await tx.booking.findFirst({
      where: {
        vehicleId,
        status: 'CONFIRMED',
        ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
        AND: [
          { pickupDatetime: { lte: end } },
          {
            OR: [
              { returnDatetime: { gte: start } },
              { returnDatetime: null, pickupDatetime: { gte: start } },
            ],
          },
        ],
      },
      select: {
        bookingRef: true,
        pickupDatetime: true,
        returnDatetime: true,
      },
    });

    if (overlappingBooking) {
      return {
        available: false,
        reason: `Vehicle has a confirmed booking (#${overlappingBooking.bookingRef}) overlapping this schedule.`,
      };
    }

    // 3. Check overlapping Availability / Maintenance Blocks
    const overlappingBlock = await tx.availabilityBlock.findFirst({
      where: {
        vehicleId,
        startDatetime: { lte: end },
        endDatetime: { gte: start },
      },
      select: {
        reason: true,
        startDatetime: true,
        endDatetime: true,
      },
    });

    if (overlappingBlock) {
      return {
        available: false,
        reason: `Vehicle is blocked during this period (${overlappingBlock.reason}).`,
      };
    }

    return { available: true };
  }

  /**
   * Admin: Creates a new vehicle record
   */
  static async createVehicle(input: CreateVehicleInput) {
    const slugBase = this.generateSlug(input.name, input.brand);
    const existing = await prisma.vehicle.findUnique({ where: { slug: slugBase } });
    const slug = existing ? `${slugBase}-${Date.now().toString().slice(-4)}` : slugBase;

    const { imageUrls, ...data } = input;

    return prisma.vehicle.create({
      data: {
        ...data,
        slug,
        images: imageUrls && imageUrls.length > 0
          ? {
              create: imageUrls.map((url, index) => ({
                imageUrl: url,
                isPrimary: index === 0,
                displayOrder: index + 1,
              })),
            }
          : undefined,
      },
      include: { images: true },
    });
  }

  /**
   * Admin: Updates an existing vehicle
   */
  static async updateVehicle(id: string, input: UpdateVehicleInput) {
    const { imageUrls, ...data } = input;

    return prisma.vehicle.update({
      where: { id },
      data: {
        ...data,
      },
      include: { images: true },
    });
  }

  /**
   * Admin: Lists all vehicles with booking counts
   */
  static async getAllVehiclesAdmin() {
    return prisma.vehicle.findMany({
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        _count: {
          select: { bookings: true, reviews: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

import prisma from '@/lib/db';
import { BookingStatus, TripType } from '@prisma/client';
import { CreateBookingInput, UpdateBookingStatusInput } from '@/lib/validators/booking.schema';
import { VehicleService } from './vehicle.service';

export class BookingService {
  /**
   * Generates a unique user-friendly booking reference: TT-YYYY-XXXX
   */
  static generateBookingRef(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TT-${year}-${random}`;
  }

  /**
   * Submits a new customer booking request
   */
  static async createBookingRequest(input: CreateBookingInput) {
    let bookingRef = this.generateBookingRef();
    let existing = await prisma.booking.findUnique({ where: { bookingRef } });
    while (existing) {
      bookingRef = this.generateBookingRef();
      existing = await prisma.booking.findUnique({ where: { bookingRef } });
    }

    // Calculate baseline estimated price if vehicle is selected
    let estimatedPrice = 2500;
    if (input.vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: input.vehicleId } });
      if (vehicle) {
        estimatedPrice = Number(vehicle.baseDayRate);
      }
    }

    return prisma.booking.create({
      data: {
        bookingRef,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail,
        pickupLocation: input.pickupLocation,
        dropLocation: input.dropLocation,
        pickupDatetime: new Date(input.pickupDatetime),
        returnDatetime: input.returnDatetime ? new Date(input.returnDatetime) : null,
        tripType: input.tripType as TripType,
        passengerCount: input.passengerCount,
        vehicleId: input.vehicleId,
        estimatedPrice,
        customerNotes: input.customerNotes,
        status: BookingStatus.PENDING,
      },
      include: {
        vehicle: {
          include: { images: true },
        },
      },
    });
  }

  /**
   * Retrieves booking tracking details by booking reference
   */
  static async getBookingByRef(bookingRef: string) {
    return prisma.booking.findUnique({
      where: { bookingRef },
      include: {
        vehicle: {
          include: { images: true },
        },
        driver: {
          select: {
            name: true,
            phone: true,
            experienceYears: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Admin: Retrieves all bookings with optional status filters
   */
  static async getAllBookings(statusFilter?: BookingStatus) {
    return prisma.booking.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      include: {
        vehicle: true,
        driver: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin: Confirms booking with quote or updates status
   */
  static async updateBookingStatus(
    id: string,
    input: UpdateBookingStatusInput,
    adminId?: string
  ) {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Concurrency / Double booking check if status is transitioning to CONFIRMED
    const vehicleId = input.vehicleId || booking.vehicleId;
    if (input.status === BookingStatus.CONFIRMED && vehicleId) {
      const isAvailable = await VehicleService.isVehicleAvailable(
        vehicleId,
        booking.pickupDatetime,
        booking.returnDatetime
      );

      if (!isAvailable) {
        throw new Error(
          'Selected vehicle has an overlapping confirmed booking or maintenance block.'
        );
      }
    }

    return prisma.booking.update({
      where: { id },
      data: {
        status: input.status,
        vehicleId: input.vehicleId,
        driverId: input.driverId,
        finalPrice: input.finalPrice !== undefined ? input.finalPrice : undefined,
        advanceAmount: input.advanceAmount !== undefined ? input.advanceAmount : undefined,
        balanceAmount: input.balanceAmount !== undefined ? input.balanceAmount : undefined,
        adminNotes: input.adminNotes,
        managedByAdminId: adminId,
      },
      include: {
        vehicle: true,
        driver: true,
        payments: true,
      },
    });
  }
}

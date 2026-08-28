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

    // Calculate baseline estimated price and validate vehicle status if vehicle is selected
    let estimatedPrice = 2500;
    if (input.vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: input.vehicleId } });
      if (!vehicle) {
        throw new Error('Selected vehicle does not exist in inventory');
      }
      if (vehicle.status === 'INACTIVE' || vehicle.status === 'MAINTENANCE') {
        throw new Error(
          `Vehicle ${vehicle.name} is currently unavailable for bookings (${vehicle.status.toLowerCase()}). Please choose an alternative vehicle.`
        );
      }
      estimatedPrice = Number(vehicle.baseDayRate);
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
   * Admin: Atomic confirmation / status update with strict transaction isolation
   * and double-booking concurrency protection.
   */
  static async updateBookingStatus(
    id: string,
    input: UpdateBookingStatusInput,
    adminId?: string
  ) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({ where: { id } });
      if (!booking) {
        throw new Error('Booking record not found');
      }

      const vehicleId = input.vehicleId !== undefined ? input.vehicleId : booking.vehicleId;

      // Validate vehicle and driver existence if specified
      if (input.vehicleId) {
        const vehicle = await tx.vehicle.findUnique({ where: { id: input.vehicleId } });
        if (!vehicle) {
          throw new Error('Assigned vehicle not found in inventory');
        }
        if (vehicle.status === 'INACTIVE') {
          throw new Error(`Cannot assign inactive vehicle (${vehicle.name})`);
        }
      }

      if (input.driverId) {
        const driver = await tx.driver.findUnique({ where: { id: input.driverId } });
        if (!driver) {
          throw new Error('Assigned driver not found in records');
        }
      }

      // When transitioning to or maintaining CONFIRMED status with an assigned vehicle:
      if (input.status === BookingStatus.CONFIRMED && vehicleId) {
        const availability = await VehicleService.isVehicleAvailable(
          vehicleId,
          booking.pickupDatetime,
          booking.returnDatetime,
          booking.id, // Exclude this booking so re-saving its own quote doesn't self-conflict
          tx
        );

        if (!availability.available) {
          throw new Error(
            `Double-booking conflict prevented: ${availability.reason || 'Vehicle is not available for these dates.'}`
          );
        }
      }


      return tx.booking.update({
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
    });
  }
}

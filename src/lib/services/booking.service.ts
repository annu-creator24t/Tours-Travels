import prisma from '@/lib/db';
import { BookingStatus, TripType } from '@prisma/client';
import { CreateBookingInput, UpdateBookingStatusInput } from '@/lib/validators/booking.schema';
import { VehicleService } from './vehicle.service';
import { DriverService } from './driver.service';
import { EmailService } from './email.service';

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
    const pickupDate = new Date(input.pickupDatetime);
    if (isNaN(pickupDate.getTime())) {
      throw new Error('Invalid pickup date and time format');
    }

    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (pickupDate.getTime() < fiveMinutesAgo) {
      throw new Error('Pickup date and time cannot be in the past');
    }

    const returnDate = input.returnDatetime ? new Date(input.returnDatetime) : null;
    if (returnDate && isNaN(returnDate.getTime())) {
      throw new Error('Invalid return date and time format');
    }

    if (input.tripType === TripType.ROUND_TRIP && !returnDate) {
      throw new Error('Return date and time is required for round trips');
    }

    if (returnDate && returnDate.getTime() < pickupDate.getTime()) {
      throw new Error('Return date and time must be after or equal to pickup date and time');
    }

    if (!input.pickupLocation || input.pickupLocation.trim().length < 3) {
      throw new Error('Pickup location must be at least 3 characters');
    }

    if (!input.dropLocation || input.dropLocation.trim().length < 3) {
      throw new Error('Drop location/destination must be at least 3 characters');
    }

    if (!input.passengerCount || input.passengerCount < 1) {
      throw new Error('Passenger count must be at least 1');
    }

    let bookingRef = this.generateBookingRef();
    let existing = await prisma.booking.findUnique({ where: { bookingRef } });
    while (existing) {
      bookingRef = this.generateBookingRef();
      existing = await prisma.booking.findUnique({ where: { bookingRef } });
    }

    // Calculate baseline estimated price and validate vehicle status & availability if vehicle is selected
    let durationDays = 1;
    if (returnDate) {
      const diffMs = returnDate.getTime() - pickupDate.getTime();
      durationDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    let estimatedPrice = 2500 * durationDays;

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

      // Check passenger capacity against vehicle capacity
      if (input.passengerCount > vehicle.seatingCapacity) {
        throw new Error(
          `Passenger count (${input.passengerCount}) exceeds the seating capacity of ${vehicle.name} (${vehicle.seatingCapacity} seats). Please select a larger vehicle.`
        );
      }

      // Check real-time vehicle availability for requested trip period
      const availability = await VehicleService.isVehicleAvailable(
        vehicle.id,
        pickupDate,
        returnDate
      );

      if (!availability.available) {
        throw new Error(
          `Vehicle ${vehicle.name} is not available for the requested trip schedule: ${availability.reason || 'Scheduling conflict'}`
        );
      }

      estimatedPrice = Math.max(0, Number(vehicle.baseDayRate) * durationDays);
    }

    return prisma.booking.create({
      data: {
        bookingRef,
        customerName: input.customerName.trim(),
        customerPhone: input.customerPhone.trim(),
        customerEmail: input.customerEmail?.trim() || null,
        pickupLocation: input.pickupLocation.trim(),
        dropLocation: input.dropLocation.trim(),
        pickupDatetime: pickupDate,
        returnDatetime: returnDate,
        tripType: input.tripType as TripType,
        passengerCount: input.passengerCount,
        vehicleId: input.vehicleId || null,
        estimatedPrice,
        customerNotes: input.customerNotes?.trim() || null,
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
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin: Atomic confirmation / status update with strict transaction isolation,
   * authoritative quote pricing, balance synchronization, and double-booking concurrency protection.
   */
  static async updateBookingStatus(
    id: string,
    input: UpdateBookingStatusInput,
    adminId?: string
  ) {
    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id },
        include: { payments: true },
      });
      if (!booking) {
        throw new Error('Booking record not found');
      }

      const targetStatus = input.status !== undefined ? input.status : booking.status;

      const vehicleId =
        input.vehicleId !== undefined
          ? input.vehicleId && input.vehicleId.trim() !== ''
            ? input.vehicleId
            : null
          : booking.vehicleId;

      // Validate vehicle existence and operational status if specified
      if (vehicleId) {
        const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId } });
        if (!vehicle) {
          throw new Error('Assigned vehicle not found in inventory');
        }
        if (vehicle.status === 'INACTIVE') {
          throw new Error(`Cannot assign inactive vehicle (${vehicle.name})`);
        }
        if (vehicle.status === 'MAINTENANCE') {
          throw new Error(`Cannot assign vehicle under maintenance (${vehicle.name})`);
        }
        if (booking.passengerCount > vehicle.seatingCapacity) {
          throw new Error(
            `Passenger count (${booking.passengerCount}) exceeds assigned vehicle capacity (${vehicle.seatingCapacity} seats)`
          );
        }
      }

      const driverId =
        input.driverId !== undefined
          ? input.driverId && input.driverId.trim() !== ''
            ? input.driverId
            : null
          : booking.driverId;

      if (driverId) {
        const driver = await tx.driver.findUnique({ where: { id: driverId } });
        if (!driver) {
          throw new Error('Assigned driver not found in records');
        }
        if (driver.status === 'INACTIVE') {
          throw new Error(`Cannot assign inactive driver (${driver.name})`);
        }
        if (driver.status === 'OFF_DUTY') {
          throw new Error(`Cannot assign off-duty driver (${driver.name})`);
        }
      }

      // When transitioning to or maintaining CONFIRMED status with an assigned vehicle:
      if (targetStatus === BookingStatus.CONFIRMED && vehicleId) {
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

      // When transitioning to or maintaining CONFIRMED status with an assigned driver:
      if (targetStatus === BookingStatus.CONFIRMED && driverId) {
        const driverAvailability = await DriverService.isDriverAvailable(
          driverId,
          booking.pickupDatetime,
          booking.returnDatetime,
          booking.id, // Exclude this booking so re-saving its own quote doesn't self-conflict
          tx
        );

        if (!driverAvailability.available) {
          throw new Error(
            `Driver assignment conflict: ${driverAvailability.reason || 'Driver is not available for these dates.'}`
          );
        }
      }

      // Status transition validation
      if (booking.status === BookingStatus.COMPLETED && input.status !== BookingStatus.COMPLETED) {
        throw new Error('Completed bookings cannot be cancelled or modified');
      }

      // Financial calculations and validation
      // 1. Authoritative Final Quote
      let finalPriceToSet: number | null | undefined = undefined;
      if (input.finalPrice !== undefined) {
        if (input.finalPrice !== null) {
          if (input.finalPrice < 0) {
            throw new Error('Final quote price cannot be negative');
          }
          finalPriceToSet = input.finalPrice;
        } else {
          finalPriceToSet = null;
        }
      }

      const effectiveFinalPrice =
        finalPriceToSet !== undefined
          ? finalPriceToSet !== null
            ? finalPriceToSet
            : Number(booking.estimatedPrice)
          : booking.finalPrice !== null
          ? Number(booking.finalPrice)
          : Number(booking.estimatedPrice);

      if (effectiveFinalPrice < 0) {
        throw new Error('Final quote price cannot be negative');
      }

      // 2. Validate Advance Amount
      let advanceAmountToSet: number | null | undefined = undefined;
      if (input.advanceAmount !== undefined) {
        if (input.advanceAmount !== null) {
          if (input.advanceAmount < 0) {
            throw new Error('Advance amount cannot be negative');
          }
          if (input.advanceAmount > effectiveFinalPrice) {
            throw new Error(
              `Advance amount (₹${input.advanceAmount}) cannot exceed the final quote price (₹${effectiveFinalPrice})`
            );
          }
          advanceAmountToSet = input.advanceAmount;
        } else {
          advanceAmountToSet = null;
        }
      } else if (booking.advanceAmount !== null) {
        const existingAdvance = Number(booking.advanceAmount);
        if (existingAdvance > effectiveFinalPrice) {
          throw new Error(
            `Existing advance amount (₹${existingAdvance}) cannot exceed the updated final quote (₹${effectiveFinalPrice})`
          );
        }
      }

      // 3. Remaining Balance must always equal: final quote - total paid (non-negative)
      const totalPaidSum = booking.payments
        .filter((p) => p.status === 'PAID')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const calculatedBalance = Math.max(0, effectiveFinalPrice - totalPaidSum);

      const updated = await tx.booking.update({
        where: { id },
        data: {
          status: input.status,
          vehicleId,
          driverId,
          finalPrice: finalPriceToSet,
          advanceAmount: advanceAmountToSet,
          balanceAmount: calculatedBalance,
          adminNotes: input.adminNotes !== undefined ? input.adminNotes || null : undefined,
          managedByAdminId: adminId,
        },
        include: {
          vehicle: true,
          driver: true,
          payments: true,
        },
      });

      return {
        ...updated,
        _previousStatus: booking.status,
      };
    });

    // Send non-blocking email notification on status change (avoiding duplicate emails)
    const previousStatus = (result as { _previousStatus?: BookingStatus })._previousStatus;
    const newStatus = result.status;

    if (previousStatus && previousStatus !== newStatus) {
      const isAdvancePaid = result.payments?.some(
        (p) => p.paymentType === 'ADVANCE' && p.status === 'PAID'
      );

      const emailPayload = {
        bookingRef: result.bookingRef,
        customerName: result.customerName,
        customerEmail: result.customerEmail,
        customerPhone: result.customerPhone,
        vehicleName: result.vehicle?.name,
        vehicleType: result.vehicle?.vehicleType,
        pickupLocation: result.pickupLocation,
        dropLocation: result.dropLocation,
        pickupDatetime: result.pickupDatetime,
        returnDatetime: result.returnDatetime,
        status: result.status,
        finalPrice: result.finalPrice || result.estimatedPrice,
        advanceAmount: result.advanceAmount,
        balanceAmount: result.balanceAmount,
        isAdvancePaid,
      };

      if (newStatus === BookingStatus.CONFIRMED) {
        EmailService.sendBookingConfirmation(emailPayload).catch((err) => {
          console.error('[BookingService] Failed to dispatch confirmation email:', err);
        });
      } else if (newStatus === BookingStatus.CANCELLED) {
        EmailService.sendBookingCancellation(emailPayload).catch((err) => {
          console.error('[BookingService] Failed to dispatch cancellation email:', err);
        });
      } else if (newStatus === BookingStatus.COMPLETED) {
        EmailService.sendBookingCompletion(emailPayload).catch((err) => {
          console.error('[BookingService] Failed to dispatch completion email:', err);
        });
      }
    }

    return result;
  }

  /**
   * Customer: Allows a customer to securely cancel their own booking request using phone verification.
   * Preserves all history, database records, and immediately unblocks vehicle schedules.
   */
  static async cancelBookingByCustomer(
    bookingRef: string,
    input: { customerPhone: string; reason?: string | null }
  ) {
    const booking = await prisma.booking.findUnique({
      where: { bookingRef },
      include: { payments: true, vehicle: true, driver: true },
    });

    if (!booking) {
      throw new Error(`Booking #${bookingRef} not found`);
    }

    // 1. Phone number verification
    const normDbPhone = booking.customerPhone.replace(/\D/g, '');
    const normInputPhone = input.customerPhone.replace(/\D/g, '');
    const dbLast10 = normDbPhone.slice(-10);
    const inputLast10 = normInputPhone.slice(-10);

    if (normDbPhone !== normInputPhone && (!dbLast10 || dbLast10 !== inputLast10)) {
      throw new Error('Unauthorized: Verification phone number does not match this booking');
    }

    // 2. Prevent cancellation of completed trips
    if (booking.status === BookingStatus.COMPLETED) {
      throw new Error('Completed bookings cannot be cancelled');
    }

    // 3. Handle already cancelled bookings safely
    if (booking.status === BookingStatus.CANCELLED) {
      return {
        ...booking,
        alreadyCancelled: true,
      };
    }

    // 4. Update status to CANCELLED and preserve complete history
    let updatedCustomerNotes = booking.customerNotes;
    if (input.reason && input.reason.trim()) {
      const reasonEntry = `[Customer Cancellation Reason]: ${input.reason.trim()}`;
      updatedCustomerNotes = booking.customerNotes
        ? `${booking.customerNotes}\n${reasonEntry}`
        : reasonEntry;
    }

    const cancelledBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CANCELLED,
        customerNotes: updatedCustomerNotes,
      },
      include: {
        vehicle: true,
        driver: true,
        payments: true,
      },
    });

    const isAdvancePaid = cancelledBooking.payments?.some(
      (p) => p.paymentType === 'ADVANCE' && p.status === 'PAID'
    );

    // Send non-blocking cancellation email
    EmailService.sendBookingCancellation({
      bookingRef: cancelledBooking.bookingRef,
      customerName: cancelledBooking.customerName,
      customerEmail: cancelledBooking.customerEmail,
      customerPhone: cancelledBooking.customerPhone,
      vehicleName: cancelledBooking.vehicle?.name,
      vehicleType: cancelledBooking.vehicle?.vehicleType,
      pickupLocation: cancelledBooking.pickupLocation,
      dropLocation: cancelledBooking.dropLocation,
      pickupDatetime: cancelledBooking.pickupDatetime,
      returnDatetime: cancelledBooking.returnDatetime,
      status: cancelledBooking.status,
      finalPrice: cancelledBooking.finalPrice || cancelledBooking.estimatedPrice,
      advanceAmount: cancelledBooking.advanceAmount,
      balanceAmount: cancelledBooking.balanceAmount,
      isAdvancePaid,
      cancellationReason: input.reason?.trim() || null,
    }).catch((err) => {
      console.error('[BookingService] Failed to dispatch customer cancellation email:', err);
    });

    return cancelledBooking;
  }
}

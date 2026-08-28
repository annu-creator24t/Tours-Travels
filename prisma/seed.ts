import {
  PrismaClient,
  AdminRole,
  VehicleStatus,
  DriverStatus,
  BookingStatus,
  TripType,
  PaymentStatus,
  PaymentType,
  ReviewSource,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting development database seed...');

  // 1. Seed Development Administrator
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@tourstravels.com';
  const adminRawPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'AdminDev@2026!';
  const passwordHash = await bcrypt.hash(adminRawPassword, 10);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      name: 'System Administrator (Dev)',
      passwordHash,
      role: AdminRole.SUPERADMIN,
    },
    create: {
      email: adminEmail,
      name: 'System Administrator (Dev)',
      passwordHash,
      role: AdminRole.SUPERADMIN,
    },
  });
  console.log(`✅ Admin user seeded: ${admin.email}`);

  // 2. Seed Fleet Vehicles (4–6 realistic vehicles)
  const vehiclesData = [
    {
      slug: 'maruti-swift-dzire',
      name: 'Maruti Suzuki Dzire',
      brand: 'Maruti Suzuki',
      vehicleType: 'Sedan',
      seatingCapacity: 4,
      luggageCapacity: 2,
      hasAc: true,
      fuelType: 'Petrol',
      transmission: 'Manual',
      perKmRate: 12.0,
      baseDayRate: 2500.0,
      status: VehicleStatus.AVAILABLE,
      isFeatured: true,
      images: [
        {
          imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80',
          isPrimary: true,
          displayOrder: 1,
        },
      ],
    },
    {
      slug: 'toyota-etios',
      name: 'Toyota Etios',
      brand: 'Toyota',
      vehicleType: 'Sedan',
      seatingCapacity: 4,
      luggageCapacity: 3,
      hasAc: true,
      fuelType: 'Diesel',
      transmission: 'Manual',
      perKmRate: 13.0,
      baseDayRate: 2600.0,
      status: VehicleStatus.AVAILABLE,
      isFeatured: false,
      images: [
        {
          imageUrl: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1000&q=80',
          isPrimary: true,
          displayOrder: 1,
        },
      ],
    },
    {
      slug: 'maruti-ertiga',
      name: 'Maruti Suzuki Ertiga',
      brand: 'Maruti Suzuki',
      vehicleType: 'MUV',
      seatingCapacity: 6,
      luggageCapacity: 3,
      hasAc: true,
      fuelType: 'Petrol/CNG',
      transmission: 'Manual',
      perKmRate: 15.0,
      baseDayRate: 3200.0,
      status: VehicleStatus.AVAILABLE,
      isFeatured: true,
      images: [
        {
          imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1000&q=80',
          isPrimary: true,
          displayOrder: 1,
        },
      ],
    },
    {
      slug: 'toyota-innova-crysta',
      name: 'Toyota Innova Crysta',
      brand: 'Toyota',
      vehicleType: 'Premium SUV',
      seatingCapacity: 7,
      luggageCapacity: 4,
      hasAc: true,
      fuelType: 'Diesel',
      transmission: 'Manual',
      perKmRate: 18.0,
      baseDayRate: 4000.0,
      status: VehicleStatus.AVAILABLE,
      isFeatured: true,
      images: [
        {
          imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
          isPrimary: true,
          displayOrder: 1,
        },
      ],
    },
    {
      slug: 'force-urbania-12',
      name: 'Force Urbania Luxury',
      brand: 'Force Motors',
      vehicleType: 'Luxury Van',
      seatingCapacity: 12,
      luggageCapacity: 8,
      hasAc: true,
      fuelType: 'Diesel',
      transmission: 'Manual',
      perKmRate: 25.0,
      baseDayRate: 6500.0,
      status: VehicleStatus.AVAILABLE,
      isFeatured: true,
      images: [
        {
          imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1000&q=80',
          isPrimary: true,
          displayOrder: 1,
        },
      ],
    },
    {
      slug: 'force-tempo-traveller-17',
      name: 'Force Tempo Traveller 17 Seater',
      brand: 'Force Motors',
      vehicleType: 'Tempo Traveller',
      seatingCapacity: 17,
      luggageCapacity: 12,
      hasAc: true,
      fuelType: 'Diesel',
      transmission: 'Manual',
      perKmRate: 28.0,
      baseDayRate: 7500.0,
      status: VehicleStatus.AVAILABLE,
      isFeatured: false,
      images: [
        {
          imageUrl: 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?auto=format&fit=crop&w=1000&q=80',
          isPrimary: true,
          displayOrder: 1,
        },
      ],
    },
  ];

  const createdVehicles: Record<string, string> = {};

  for (const v of vehiclesData) {
    const { images, ...vehicleFields } = v;
    const vehicle = await prisma.vehicle.upsert({
      where: { slug: v.slug },
      update: vehicleFields,
      create: {
        ...vehicleFields,
        images: {
          create: images,
        },
      },
    });
    createdVehicles[v.slug] = vehicle.id;
  }
  console.log(`✅ Seeded ${vehiclesData.length} fleet vehicles with gallery images.`);

  // 3. Seed Sample Drivers (2–3 drivers)
  const driversData = [
    {
      name: 'Rajesh Kumar (Sample Driver)',
      phone: '+919811122233',
      licenseNumber: 'DL-0420180019283',
      experienceYears: 12,
      status: DriverStatus.AVAILABLE,
    },
    {
      name: 'Suresh Yadav (Sample Driver)',
      phone: '+919822233344',
      licenseNumber: 'DL-1220150098472',
      experienceYears: 9,
      status: DriverStatus.AVAILABLE,
    },
    {
      name: 'Vikram Singh (Sample Driver)',
      phone: '+919833344455',
      licenseNumber: 'UP-1420120038291',
      experienceYears: 15,
      status: DriverStatus.ON_TRIP,
    },
  ];

  const createdDrivers: Record<string, string> = {};
  for (const d of driversData) {
    const driver = await prisma.driver.upsert({
      where: { phone: d.phone },
      update: d,
      create: d,
    });
    createdDrivers[d.phone] = driver.id;
  }
  console.log(`✅ Seeded ${driversData.length} sample drivers.`);

  // 4. Seed Sample Reviews (Justdial & Verified Customers)
  const sampleReviews = [
    {
      vehicleId: createdVehicles['toyota-innova-crysta'],
      authorName: 'Rohan D. (Sample Reviewer)',
      rating: 5,
      reviewText:
        '[Sample Review] Hired the Innova Crysta for our family trip to Agra and Jaipur. The car was spotless, AC was perfect, and driver was courteous and punctual. Transparent billing with no hidden tolls!',
      source: ReviewSource.JUSTDIAL,
      sourceUrl: 'https://www.justdial.com',
      isApproved: true,
    },
    {
      vehicleId: createdVehicles['maruti-swift-dzire'],
      authorName: 'Priya N. (Sample Reviewer)',
      rating: 5,
      reviewText:
        '[Sample Review] Best outstation cab service in town. Booked a Dzire for an urgent same-day round trip. The booking was confirmed in minutes and driver reached 15 mins ahead of pickup time.',
      source: ReviewSource.VERIFIED_CUSTOMER,
      isApproved: true,
    },
    {
      vehicleId: createdVehicles['force-tempo-traveller-17'],
      authorName: 'Aditya M. (Sample Reviewer)',
      rating: 5,
      reviewText:
        '[Sample Review] Booked the 17-seater Tempo Traveller for our office retreat. Very comfortable pushback seats, great sound system, and smooth driving on highway routes.',
      source: ReviewSource.JUSTDIAL,
      sourceUrl: 'https://www.justdial.com',
      isApproved: true,
    },
    {
      vehicleId: createdVehicles['maruti-ertiga'],
      authorName: 'Dr. S. K. Gupta (Sample Reviewer)',
      rating: 4,
      reviewText:
        '[Sample Review] Comfortable ride and clean vehicle. The quote was reasonable and the advance payment process was quick and secure.',
      source: ReviewSource.VERIFIED_CUSTOMER,
      isApproved: true,
    },
  ];

  for (const r of sampleReviews) {
    const existing = await prisma.review.findFirst({
      where: { authorName: r.authorName, vehicleId: r.vehicleId },
    });
    if (!existing) {
      await prisma.review.create({ data: r });
    }
  }
  console.log(`✅ Seeded ${sampleReviews.length} sample reviews.`);

  // 5. Seed Several Availability Blocks
  const availabilityBlocksData = [
    {
      vehicleId: createdVehicles['toyota-etios'],
      startDatetime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      endDatetime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      reason: '[DEV SAMPLE] Scheduled Routine Engine Maintenance & Alignment',
    },
    {
      vehicleId: createdVehicles['force-urbania-12'],
      startDatetime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      endDatetime: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      reason: '[DEV SAMPLE] Reserved for Annual Fleet Inspection',
    },
  ];

  for (const block of availabilityBlocksData) {
    const existing = await prisma.availabilityBlock.findFirst({
      where: { vehicleId: block.vehicleId, reason: block.reason },
    });
    if (!existing) {
      await prisma.availabilityBlock.create({ data: block });
    }
  }
  console.log(`✅ Seeded ${availabilityBlocksData.length} sample availability blocks.`);

  // 6. Seed Sample Bookings (Covering different statuses)
  // 6a. PENDING Booking
  await prisma.booking.upsert({
    where: { bookingRef: 'TT-2026-1001' },
    update: {},
    create: {
      bookingRef: 'TT-2026-1001',
      customerName: 'Sample Customer (Anil V.)',
      customerPhone: '+919876500001',
      customerEmail: 'sample.customer1@example.com',
      pickupLocation: 'Sample Pickup Location, Terminal 3',
      dropLocation: 'Sample Drop Location, Haridwar',
      pickupDatetime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      tripType: TripType.ONE_WAY,
      passengerCount: 3,
      vehicleId: createdVehicles['maruti-swift-dzire'],
      status: BookingStatus.PENDING,
      estimatedPrice: 3800.0,
      customerNotes: '[SAMPLE] Require infant seat if possible.',
    },
  });

  // 6b. CONFIRMED Booking with Advance Payment
  await prisma.booking.upsert({
    where: { bookingRef: 'TT-2026-1002' },
    update: {},
    create: {
      bookingRef: 'TT-2026-1002',
      customerName: 'Sample Customer (Meera N.)',
      customerPhone: '+919876500002',
      customerEmail: 'sample.customer2@example.com',
      pickupLocation: 'Sample Connaught Place, New Delhi',
      dropLocation: 'Sample Shimla & Manali (Round Trip)',
      pickupDatetime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      returnDatetime: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      tripType: TripType.ROUND_TRIP,
      passengerCount: 5,
      vehicleId: createdVehicles['toyota-innova-crysta'],
      driverId: createdDrivers['+919811122233'],
      managedByAdminId: admin.id,
      status: BookingStatus.CONFIRMED,
      estimatedPrice: 28000.0,
      finalPrice: 27500.0,
      advanceAmount: 5000.0,
      balanceAmount: 22500.0,
      customerNotes: '[SAMPLE] Luggage: 4 medium bags.',
      adminNotes: '[SAMPLE] Confirmed quote. 5000 advance received via UPI.',
      payments: {
        create: {
          transactionRef: 'PAY-UPI-20260828-9841',
          gatewayName: 'MANUAL_UPI',
          amount: 5000.0,
          paymentType: PaymentType.ADVANCE,
          status: PaymentStatus.PAID,
          gatewayResponse: {
            method: 'UPI',
            bankRef: 'SAMPLE-REF-2808129038',
          },
        },
      },
    },
  });

  // 6c. COMPLETED Booking with Full Payments Reconciled
  await prisma.booking.upsert({
    where: { bookingRef: 'TT-2026-1003' },
    update: {},
    create: {
      bookingRef: 'TT-2026-1003',
      customerName: 'Sample Customer (Ramesh K.)',
      customerPhone: '+919876500003',
      customerEmail: 'sample.customer3@example.com',
      pickupLocation: 'Sample Airport T1',
      dropLocation: 'Sample Gurgaon City Center',
      pickupDatetime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      tripType: TripType.LOCAL_RENTAL,
      passengerCount: 2,
      vehicleId: createdVehicles['maruti-ertiga'],
      driverId: createdDrivers['+919822233344'],
      managedByAdminId: admin.id,
      status: BookingStatus.COMPLETED,
      estimatedPrice: 3200.0,
      finalPrice: 3200.0,
      advanceAmount: 1000.0,
      balanceAmount: 0.0,
      customerNotes: '[SAMPLE] 8 hours local tour.',
      adminNotes: '[SAMPLE] Trip completed smoothly, full balance collected by driver.',
      payments: {
        create: [
          {
            transactionRef: 'PAY-UPI-20260825-1101',
            gatewayName: 'MANUAL_UPI',
            amount: 1000.0,
            paymentType: PaymentType.ADVANCE,
            status: PaymentStatus.PAID,
          },
          {
            transactionRef: 'PAY-CASH-20260825-1102',
            gatewayName: 'CASH',
            amount: 2200.0,
            paymentType: PaymentType.BALANCE,
            status: PaymentStatus.PAID,
          },
        ],
      },
    },
  });

  // 6d. CANCELLED Booking
  await prisma.booking.upsert({
    where: { bookingRef: 'TT-2026-1004' },
    update: {},
    create: {
      bookingRef: 'TT-2026-1004',
      customerName: 'Sample Customer (Kavita S.)',
      customerPhone: '+919876500004',
      customerEmail: 'sample.customer4@example.com',
      pickupLocation: 'Sample Noida Sector 62',
      dropLocation: 'Sample Agra Day Trip',
      pickupDatetime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      tripType: TripType.ROUND_TRIP,
      passengerCount: 4,
      vehicleId: createdVehicles['toyota-etios'],
      status: BookingStatus.CANCELLED,
      estimatedPrice: 4500.0,
      customerNotes: '[SAMPLE] Family trip cancelled due to weather.',
      adminNotes: '[SAMPLE] Cancelled on customer phone request.',
    },
  });

  console.log('✅ Seeded 4 sample bookings covering PENDING, CONFIRMED, COMPLETED, and CANCELLED statuses.');
  console.log('✨ Development database seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

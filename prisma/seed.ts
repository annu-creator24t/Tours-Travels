import { PrismaClient, AdminRole, VehicleStatus, DriverStatus, BookingStatus, TripType, PaymentStatus, PaymentType, ReviewSource } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Admin User
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@tourstravels.com';
  const adminRawPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'AdminDev@2026!';
  const passwordHash = await bcrypt.hash(adminRawPassword, 10);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      name: 'System Administrator',
      passwordHash,
      role: AdminRole.SUPERADMIN,
    },
    create: {
      email: adminEmail,
      name: 'System Administrator',
      passwordHash,
      role: AdminRole.SUPERADMIN,
    },
  });
  console.log(`✅ Admin user seeded: ${admin.email}`);

  // 2. Seed Fleet Vehicles
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
  console.log(`✅ Seeded ${vehiclesData.length} fleet vehicles with primary images.`);

  // 3. Seed Drivers
  const driversData = [
    {
      name: 'Rajesh Kumar',
      phone: '+919811122233',
      licenseNumber: 'DL-0420180019283',
      experienceYears: 12,
      status: DriverStatus.AVAILABLE,
    },
    {
      name: 'Suresh Yadav',
      phone: '+919822233344',
      licenseNumber: 'DL-1220150098472',
      experienceYears: 9,
      status: DriverStatus.AVAILABLE,
    },
    {
      name: 'Vikram Singh',
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
  console.log(`✅ Seeded ${driversData.length} drivers.`);

  // 4. Seed Reviews (Justdial & Verified Customers)
  const reviewsData = [
    {
      vehicleId: createdVehicles['toyota-innova-crysta'],
      authorName: 'Rohan Deshmukh',
      rating: 5,
      reviewText:
        'Hired the Innova Crysta for our family trip to Agra and Jaipur. The car was spotless, AC was perfect, and driver Rajesh was courteous and punctual. Transparent billing with no hidden tolls!',
      source: ReviewSource.JUSTDIAL,
      sourceUrl: 'https://www.justdial.com',
      isApproved: true,
    },
    {
      vehicleId: createdVehicles['maruti-swift-dzire'],
      authorName: 'Priya Narang',
      rating: 5,
      reviewText:
        'Best outstation cab service in town. Booked a Dzire for an urgent same-day round trip. The booking was confirmed in minutes and driver Suresh reached 15 mins ahead of pickup time.',
      source: ReviewSource.VERIFIED_CUSTOMER,
      isApproved: true,
    },
    {
      vehicleId: createdVehicles['force-tempo-traveller-17'],
      authorName: 'Aditya Mathur',
      rating: 5,
      reviewText:
        'Booked the 17-seater Tempo Traveller for our office retreat. Very comfortable pushback seats, great sound system, and smooth driving on highway routes.',
      source: ReviewSource.JUSTDIAL,
      sourceUrl: 'https://www.justdial.com',
      isApproved: true,
    },
    {
      vehicleId: createdVehicles['maruti-ertiga'],
      authorName: 'Dr. S. K. Gupta',
      rating: 4,
      reviewText:
        'Comfortable ride and clean vehicle. The quote was reasonable and the advance payment process was quick and secure.',
      source: ReviewSource.VERIFIED_CUSTOMER,
      isApproved: true,
    },
  ];

  for (const r of reviewsData) {
    await prisma.review.create({
      data: r,
    });
  }
  console.log(`✅ Seeded ${reviewsData.length} customer and Justdial reviews.`);

  // 5. Seed Availability Block (Sample maintenance window)
  await prisma.availabilityBlock.create({
    data: {
      vehicleId: createdVehicles['toyota-etios'],
      startDatetime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      endDatetime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      reason: 'Scheduled Routine Engine Maintenance and Tire Alignment',
    },
  });
  console.log('✅ Seeded sample vehicle availability block.');

  // 6. Seed Sample Bookings (Covering different statuses)
  // 6a. Pending Booking
  await prisma.booking.upsert({
    where: { bookingRef: 'TT-2026-1001' },
    update: {},
    create: {
      bookingRef: 'TT-2026-1001',
      customerName: 'Anil Verma',
      customerPhone: '+919876500001',
      customerEmail: 'anil.verma@example.com',
      pickupLocation: 'Delhi Airport Terminal 3',
      dropLocation: 'Haridwar, Uttarakhand',
      pickupDatetime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      tripType: TripType.ONE_WAY,
      passengerCount: 3,
      vehicleId: createdVehicles['maruti-swift-dzire'],
      status: BookingStatus.PENDING,
      estimatedPrice: 3800.0,
      customerNotes: 'Require infant seat if possible.',
    },
  });

  // 6b. Confirmed Booking with Advance Payment
  const confirmedBooking = await prisma.booking.upsert({
    where: { bookingRef: 'TT-2026-1002' },
    update: {},
    create: {
      bookingRef: 'TT-2026-1002',
      customerName: 'Meera Nambiar',
      customerPhone: '+919876500002',
      customerEmail: 'meera.n@example.com',
      pickupLocation: 'Connaught Place, New Delhi',
      dropLocation: 'Shimla & Manali (Round Trip)',
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
      customerNotes: 'Luggage: 4 medium trolley bags.',
      adminNotes: 'Confirmed by phone. 5000 advance received via UPI.',
      payments: {
        create: {
          transactionRef: 'PAY-UPI-20260828-9841',
          gatewayName: 'MANUAL_UPI',
          amount: 5000.0,
          paymentType: PaymentType.ADVANCE,
          status: PaymentStatus.PAID,
          gatewayResponse: {
            method: 'UPI',
            vpa: 'customer@okaxis',
            bankRef: '2808129038',
          },
        },
      },
    },
  });
  console.log(`✅ Seeded sample bookings with advance payment records (${confirmedBooking.bookingRef}).`);

  console.log('✨ Seed database completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

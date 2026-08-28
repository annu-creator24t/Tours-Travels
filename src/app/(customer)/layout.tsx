import React from 'react';
import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import WhatsAppFloatingBtn from '@/components/customer/WhatsAppFloatingBtn';

export const metadata = {
  title: 'Jay Maa Sheetala Tours & Travel — Outstation Car Rental & Tours',
  description:
    'Book clean, verified vehicles for outstation trips, local tours, and airport transfers with Jay Maa Sheetala Tours & Travel.',
};

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <WhatsAppFloatingBtn />
    </div>
  );
}

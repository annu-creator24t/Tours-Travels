/**
 * Central Company Configuration for Jay Maa Sheetala Tours & Travel
 * All business details and public contact points are maintained here to avoid hard-coding.
 */

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  googleMaps?: string;
}

export interface ContactChannel {
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  whatsappDisplay: string;
  telUrl: string;
  whatsappUrl: string;
  label?: string;
}

export interface CompanyConfig {
  name: string;
  shortName: string;
  logoUrl: string;
  tagline: string;
  description: string;
  phone: string;
  phoneDisplay: string;
  phone2: string;
  phone2Display: string;
  whatsapp: string;
  whatsappDisplay: string;
  whatsapp2: string;
  whatsapp2Display: string;
  contacts: ContactChannel[];
  email: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    fullAddress: string;
  };
  justdialUrl?: string;
  socialLinks: SocialLinks;
  rating: {
    average: number;
    totalReviews: number;
    ratingScale: number;
  };
}

const PRIMARY_PHONE = process.env.NEXT_PUBLIC_COMPANY_PHONE || '+919919379147';
const PRIMARY_PHONE_DISPLAY = process.env.NEXT_PUBLIC_COMPANY_PHONE_DISPLAY || '+91 99193 79147';
const SECONDARY_PHONE = process.env.NEXT_PUBLIC_COMPANY_PHONE_2 || '+919919379147';
const SECONDARY_PHONE_DISPLAY = process.env.NEXT_PUBLIC_COMPANY_PHONE_2_DISPLAY || '+91 99193 79147';

const PRIMARY_WHATSAPP = process.env.NEXT_PUBLIC_COMPANY_WHATSAPP || '+919919379147';
const PRIMARY_WHATSAPP_DISPLAY = process.env.NEXT_PUBLIC_COMPANY_WHATSAPP_DISPLAY || '+91 99193 79147';
const SECONDARY_WHATSAPP = process.env.NEXT_PUBLIC_COMPANY_WHATSAPP_2 || '+919919379147';
const SECONDARY_WHATSAPP_DISPLAY = process.env.NEXT_PUBLIC_COMPANY_WHATSAPP_2_DISPLAY || '+91 99193 79147';

const cleanPrimary = PRIMARY_WHATSAPP.replace(/[^0-9]/g, '');
const cleanSecondary = SECONDARY_WHATSAPP.replace(/[^0-9]/g, '');

export const companyConfig: CompanyConfig = {
  name: 'Jay Maa Sheetala Tours & Travel',
  shortName: 'JMSTT',
  logoUrl: '/images/logo.png',
  tagline: 'Reliable Fleet & Outstation Travel Services',
  description:
    'Safe, dependable, and comfortable vehicle rentals for outstation trips, family vacations, airport transfers, and customized tour packages.',

  // Primary Contact Number (9919379147)
  phone: PRIMARY_PHONE,
  phoneDisplay: PRIMARY_PHONE_DISPLAY,
  whatsapp: PRIMARY_WHATSAPP,
  whatsappDisplay: PRIMARY_WHATSAPP_DISPLAY,

  // Fallback Secondary Contact fields (mapped to active 9919379147)
  phone2: SECONDARY_PHONE,
  phone2Display: SECONDARY_PHONE_DISPLAY,
  whatsapp2: SECONDARY_WHATSAPP,
  whatsapp2Display: SECONDARY_WHATSAPP_DISPLAY,

  // Structured contact list
  contacts: [
    {
      phone: PRIMARY_PHONE,
      phoneDisplay: PRIMARY_PHONE_DISPLAY,
      whatsapp: PRIMARY_WHATSAPP,
      whatsappDisplay: PRIMARY_WHATSAPP_DISPLAY,
      telUrl: `tel:${PRIMARY_PHONE}`,
      whatsappUrl: `https://wa.me/${cleanPrimary}`,
      label: 'Main Desk',
    },
  ],

  email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'itskingofficial4@gmail.com',

  address: {
    street: process.env.NEXT_PUBLIC_COMPANY_STREET || '',
    city: process.env.NEXT_PUBLIC_COMPANY_CITY || '',
    state: process.env.NEXT_PUBLIC_COMPANY_STATE || '',
    pincode: process.env.NEXT_PUBLIC_COMPANY_PINCODE || '',
    fullAddress: process.env.NEXT_PUBLIC_COMPANY_FULL_ADDRESS || '',
  },

  justdialUrl:
    process.env.NEXT_PUBLIC_JUSTDIAL_URL ||
    'https://www.justdial.com/Ballia/Jay-Maa-Sheetala-Tours-Travel-Near-Airtel-Tower-Tikhampur-Roopnagar-Tikhampur/9999P5494-5494-250525091822-J4B5_BZDET?auto=1&trkid=9991292519&term=',

  socialLinks: {
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || '',
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || '',
    twitter: process.env.NEXT_PUBLIC_TWITTER_URL || '',
    googleMaps: process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL || '',
  },

  rating: {
    average: 4.9,
    totalReviews: 120,
    ratingScale: 5.0,
  },
};

export default companyConfig;

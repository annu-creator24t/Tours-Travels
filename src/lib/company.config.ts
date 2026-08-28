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

export interface CompanyConfig {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  whatsappDisplay: string;
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

export const companyConfig: CompanyConfig = {
  name: 'Jay Maa Sheetala Tours & Travel',
  shortName: 'JMSTT',
  tagline: 'Reliable Fleet & Outstation Travel Services',
  description:
    'Safe, dependable, and comfortable vehicle rentals for outstation trips, family vacations, airport transfers, and customized tour packages.',
  
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || '+919876543210',
  phoneDisplay: process.env.NEXT_PUBLIC_COMPANY_PHONE_DISPLAY || '+91 98765 43210',
  
  whatsapp: process.env.NEXT_PUBLIC_COMPANY_WHATSAPP || '+919876543210',
  whatsappDisplay: process.env.NEXT_PUBLIC_COMPANY_WHATSAPP_DISPLAY || '+91 98765 43210',
  
  email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'contact@jaymaasheetalatours.com',
  
  address: {
    street: process.env.NEXT_PUBLIC_COMPANY_STREET || 'Main Office',
    city: process.env.NEXT_PUBLIC_COMPANY_CITY || '',
    state: process.env.NEXT_PUBLIC_COMPANY_STATE || '',
    pincode: process.env.NEXT_PUBLIC_COMPANY_PINCODE || '',
    fullAddress: process.env.NEXT_PUBLIC_COMPANY_FULL_ADDRESS || 'Main Office, City Center',
  },
  
  justdialUrl: process.env.NEXT_PUBLIC_JUSTDIAL_URL || '',
  
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

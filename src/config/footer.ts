// Footer Configuration - Edit this file to customize footer links and social media

export interface SocialLink {
  name: string;
  url: string;
  icon: string; // lucide-react icon name
}

export interface FooterSection {
  title: string;
  links: Array<{
    label: string;
    url: string;
  }>;
}

export const footerConfig = {
  // Brand Information
  brand: {
    name: 'AUREN',
    description: 'Premium fashion & apparel for the modern wardrobe. Shop the latest trends with Cash on Delivery across India.',
    tagline: 'Fashion & Apparel'
  },

  // Social Media Links - Add your actual social media URLs here
  socialLinks: [
    {
      name: 'Instagram',
      url: 'https://instagram.com/yourusername', // Replace with your Instagram URL
      icon: 'Instagram'
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/yourusername', // Replace with your Twitter URL
      icon: 'Twitter'
    },
    {
      name: 'Facebook',
      url: 'https://facebook.com/yourusername', // Replace with your Facebook URL
      icon: 'Facebook'
    },
    {
      name: 'YouTube',
      url: 'https://youtube.com/@yourusername', // Replace with your YouTube URL
      icon: 'Youtube'
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/company/yourcompany', // Replace with your LinkedIn URL
      icon: 'Linkedin'
    }
  ],

  // Footer Sections
  sections: [
    {
      title: 'Shop',
      links: [
        { label: 'All Products', url: '#shop' },
        { label: 'Men', url: '#shop?category=Men' },
        { label: 'Women', url: '#shop?category=Women' },
        { label: 'Trendy', url: '#shop?category=Trendy' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Contact Us', url: '#contact' },
        { label: 'Shipping Info', url: '#shipping' },
        { label: 'Returns', url: '#returns' },
        { label: 'FAQs', url: '#faq' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', url: '#about' },
        { label: 'Careers', url: '#careers' },
        { label: 'Privacy Policy', url: '#privacy' },
        { label: 'Terms of Service', url: '#terms' }
      ]
    }
  ],

  // Contact Information (optional, can be displayed in footer)
  contact: {
    email: 'support@auren.com',
    phone: '+91 98765 43210',
    address: 'Mumbai, Maharashtra, India'
  },

  // Copyright information
  copyright: {
    showYear: true,
    text: 'AUREN. All rights reserved.'
  }
};

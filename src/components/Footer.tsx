import { ShoppingBag, Lock, Instagram, Twitter, Facebook, Youtube, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { footerConfig } from '@/config/footer';

interface FooterProps {
  onAdminClick: () => void;
}

// Icon mapping for social media
const iconMap: Record<string, any> = {
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Linkedin
};

export function Footer({ onAdminClick }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ink-900 text-ink-300 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                <ShoppingBag className="h-5 w-5 text-brand-300" />
              </div>
              <span className="font-display text-2xl font-semibold text-white">
                {footerConfig.brand.name}
              </span>
            </div>
            <p className="text-sm text-ink-400 max-w-sm mb-2">
              {footerConfig.brand.description}
            </p>
            <p className="text-xs text-ink-500 mb-5">
              {footerConfig.brand.tagline}
            </p>

            {/* Social Media Links */}
            <div className="flex items-center gap-3 mb-6">
              {footerConfig.socialLinks.map((social, i) => {
                const Icon = iconMap[social.icon];
                if (!Icon) return null;
                return (
                  <a
                    key={i}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-ink-400 transition-all hover:bg-white/10 hover:text-white hover:scale-110"
                    aria-label={social.name}
                    title={social.name}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>

            {/* Contact Information */}
            <div className="space-y-2 text-sm">
              {footerConfig.contact.email && (
                <div className="flex items-center gap-2 text-ink-400">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${footerConfig.contact.email}`} className="hover:text-white transition-colors">
                    {footerConfig.contact.email}
                  </a>
                </div>
              )}
              {footerConfig.contact.phone && (
                <div className="flex items-center gap-2 text-ink-400">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${footerConfig.contact.phone}`} className="hover:text-white transition-colors">
                    {footerConfig.contact.phone}
                  </a>
                </div>
              )}
              {footerConfig.contact.address && (
                <div className="flex items-center gap-2 text-ink-400">
                  <MapPin className="h-4 w-4" />
                  <span>{footerConfig.contact.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Footer Sections */}
          {footerConfig.sections.map((section, index) => (
            <div key={index}>
              <h4 className="text-sm font-semibold text-white mb-3">{section.title}</h4>
              <ul className="space-y-2 text-sm">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.url}
                      className="hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-ink-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ink-500">
            {footerConfig.copyright.showYear && `© ${currentYear} `}{footerConfig.copyright.text}
          </p>
          <button
            onClick={onAdminClick}
            className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-white transition-colors"
          >
            <Lock className="h-3.5 w-3.5" />
            Admin
          </button>
        </div>
      </div>
    </footer>
  );
}

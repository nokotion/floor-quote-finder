
import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

interface Footer7Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  sections?: Array<{
    title: string;
    links: Array<{ name: string; href: string }>;
  }>;
  description?: string;
  socialLinks?: Array<{
    icon: React.ReactElement;
    href: string;
    label: string;
  }>;
  copyright?: string;
  legalLinks?: Array<{
    name: string;
    href: string;
  }>;
}

const defaultSections = [
  {
    title: "Services",
    links: [
      { name: "Get Quote", href: "/quote" },
      { name: "Browse Brands", href: "/browse" },
      { name: "Flooring Types", href: "#" },
      { name: "Installation", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "#" },
      { name: "How It Works", href: "#" },
      { name: "Partners", href: "#" },
      { name: "Retailer Login", href: "/retailer/login" },
      { name: "Admin Login", href: "/admin/login" },
      { name: "Apply to Join Network", href: "/retailer/apply" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Help Center", href: "#" },
      { name: "Contact Us", href: "#" },
      { name: "FAQ", href: "#" },
      { name: "Reviews", href: "#" },
    ],
  },
];

const defaultSocialLinks = [
  { icon: <FaInstagram className="size-5" />, href: "#", label: "Instagram" },
  { icon: <FaFacebook className="size-5" />, href: "#", label: "Facebook" },
  { icon: <FaTwitter className="size-5" />, href: "#", label: "Twitter" },
  { icon: <FaLinkedin className="size-5" />, href: "#", label: "LinkedIn" },
];

const defaultLegalLinks = [
  { name: "Terms and Conditions", href: "#" },
  { name: "Privacy Policy", href: "#" },
];

export const Footer7 = ({
  logo = {
    url: "/",
    src: "https://syjxtyvsencbmhuprnyu.supabase.co/storage/v1/object/public/pricemyfloor-files//pricemyfloor%20_logo.png",
    alt: "Price My Floor Logo",
    title: "Price My Floor",
  },
  sections = defaultSections,
  description = "Connecting Canadian homeowners with trusted flooring professionals. Get competitive quotes from verified retailers across Canada.",
  socialLinks = defaultSocialLinks,
  copyright = "© 2024 Price My Floor. All rights reserved.",
  legalLinks = defaultLegalLinks,
}: Footer7Props) => {
  return (
    <section className="py-32 bg-white text-gray-900">
      <div className="container mx-auto">
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left">
          <div className="flex w-full flex-col justify-between gap-6 lg:items-start">
            {/* Logo */}
            <div className="flex items-center gap-2 lg:justify-start">
              <Link to={logo.url}>
                <img
                  src={logo.src}
                  alt={logo.alt}
                  title={logo.title}
                  className="h-12 md:h-14 w-auto"
                />
              </Link>
            </div>
            <p className="max-w-[70%] text-sm text-gray-600">
              {description}
            </p>
            <ul className="flex items-center space-x-6 text-gray-600">
              {socialLinks.map((social, idx) => (
                <li key={idx} className="font-medium hover:text-gray-900 transition-colors">
                  <a href={social.href} aria-label={social.label}>
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid w-full gap-6 md:grid-cols-3 lg:gap-20">
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-4 font-bold text-gray-900">{section.title}</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="font-medium hover:text-gray-900 transition-colors"
                    >
                      {link.href.startsWith('#') ? (
                        <a href={link.href}>{link.name}</a>
                      ) : (
                        <Link to={link.href}>{link.name}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-col justify-between gap-4 border-t border-gray-200 py-8 text-xs font-medium text-gray-600 md:flex-row md:items-center md:text-left">
          <p className="order-2 lg:order-1">{copyright}</p>
          <ul className="order-1 flex flex-col gap-2 md:order-2 md:flex-row">
            {legalLinks.map((link, idx) => (
              <li key={idx} className="hover:text-gray-900 transition-colors">
                {link.href.startsWith('#') ? (
                  <a href={link.href}> {link.name}</a>
                ) : (
                  <Link to={link.href}> {link.name}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

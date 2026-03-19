/**
 * Store Configuration Utility
 * Centralized configuration for store name, email, and other store-specific settings
 * All values can be overridden via environment variables
 */

export const getStoreConfig = () => {
  return {
    // Store Information
    storeName: process.env.STORE_NAME || "Aashey",
    storeEmail: process.env.STORE_EMAIL || "info@aashey.com",
    storePhone: process.env.STORE_PHONE || "+91 89990 46484",
    storeAddress:
      process.env.STORE_ADDRESS ||
      "Village — Takali, Shiv Shakti Nagar, Chalisgaon, Dist — Jalgaon, Maharashtra — 424102",

    // Store Description/Tagline
    storeTagline: process.env.STORE_TAGLINE || "Pure A2 Bilona Ghee",
    storeDescription:
      process.env.STORE_DESCRIPTION ||
      "Your trusted source for pure A2 Bilona ghee",

    // Email Configuration
    fromName: process.env.FROM_NAME || process.env.STORE_NAME || "Aashey",
    fromEmail:
      process.env.FROM_EMAIL ||
      process.env.STORE_EMAIL ||
      process.env.SMTP_USER ||
      "info@aashey.com",

    // Website Information
    websiteUrl: process.env.WEBSITE_URL || "https://aashey.com",
    supportEmail:
      process.env.SUPPORT_EMAIL ||
      process.env.STORE_EMAIL ||
      "info@aashey.com",

    // Social Media (optional)
    socialFacebook: process.env.SOCIAL_FACEBOOK || "",
    socialTwitter: process.env.SOCIAL_TWITTER || "",
    socialInstagram: process.env.SOCIAL_INSTAGRAM || "",
    socialYoutube: process.env.SOCIAL_YOUTUBE || "",
  };
};

/**
 * Get store name
 */
export const getStoreName = () => {
  return getStoreConfig().storeName;
};

/**
 * Get store email
 */
export const getStoreEmail = () => {
  return getStoreConfig().storeEmail;
};

/**
 * Get from name for emails
 */
export const getFromName = () => {
  return getStoreConfig().fromName;
};

/**
 * Get from email for emails
 */
export const getFromEmail = () => {
  return getStoreConfig().fromEmail;
};

/**
 * Get full store information object
 */
export const getFullStoreInfo = () => {
  const config = getStoreConfig();
  return {
    name: config.storeName,
    email: config.storeEmail,
    phone: config.storePhone,
    address: config.storeAddress,
    tagline: config.storeTagline,
    description: config.storeDescription,
    websiteUrl: config.websiteUrl,
    supportEmail: config.supportEmail,
    fromName: config.fromName,
    fromEmail: config.fromEmail,
    social: {
      facebook: config.socialFacebook,
      twitter: config.socialTwitter,
      instagram: config.socialInstagram,
      youtube: config.socialYoutube,
    },
  };
};

export default getStoreConfig;

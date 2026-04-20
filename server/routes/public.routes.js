import express from "express";
import {
  getAllCategories,
  getProductsByCategory,
  getCategoriesWithSubCategories,
} from "../controllers/category.controller.js";
import {
  subscribeNewsletter,
  unsubscribeNewsletter,
} from "../controllers/newsletter.controller.js";
import {
  getAllProducts,
  getProductBySlug,
  getProductVariant,
  getProductVariantById,
  getMaxPrice,
  getProductsByType,
} from "../controllers/product.controller.js";
import { trackProductView } from "../middlewares/tracking.middleware.js";
import {
  getBrandsByTag,
  getBrandBySlug,
  getFilterAttributes,
  getPriceVisibilitySettings,
} from "../controllers/public.controller.js";
import { getPublishedBanners } from "../controllers/admin.banner.controller.js";
import { getActiveFlashSales, getActiveProductSections } from "../controllers/public.controller.js";

const router = express.Router();

// Categories
router.get("/categories", getAllCategories);
router.get("/categories-with-subcategories", getCategoriesWithSubCategories);
router.get("/categories/:slug/products", getProductsByCategory);

// Products
router.get("/products", getAllProducts);
router.get("/products/max-price", getMaxPrice);
router.get("/products/type/:productType", getProductsByType);
router.get("/products/:slug", trackProductView, getProductBySlug);
router.get("/product-variant", getProductVariant);
router.get("/products/variants/:id", getProductVariantById);

// Brands
router.get("/brands-by-tag", getBrandsByTag);
router.get("/brand/:slug", getBrandBySlug);

// Banners
router.get("/banners", getPublishedBanners);

// Flash Sales
router.get("/flash-sales", getActiveFlashSales);

// Product Sections
router.get("/product-sections", getActiveProductSections);

// Filter Attributes (Colors and Sizes)
router.get("/filter-attributes", getFilterAttributes);

// Price Visibility Settings
router.get("/price-visibility-settings", getPriceVisibilitySettings);

// Newsletter
router.post("/newsletter/subscribe", subscribeNewsletter);
router.post("/newsletter/unsubscribe", unsubscribeNewsletter);

import { getActiveAnnouncements } from "../controllers/announcement.controller.js";
router.get("/announcements", getActiveAnnouncements);

export default router;

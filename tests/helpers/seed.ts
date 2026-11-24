import User from "../../dataLayer/schema/User";
import Product from "../../dataLayer/schema/Product";
import Review from "../../dataLayer/schema/Review";
import WishList from "../../dataLayer/schema/WishList";
import Order from "../../dataLayer/schema/Order";

export async function seedAdmin() {
  return User.create({
    firstName: "Admin",
    lastName: "One",
    email: process.env.ADMIN_EMAIL as string,
    password: "admin-seed-password",
    role: "admin",
  });
}

export interface SeedUserOptions {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: "admin" | "customer";
  registeredDate?: Date;
}

export async function seedUser(options: SeedUserOptions = {}) {
  return User.create({
    firstName: options.firstName ?? "Seed",
    lastName: options.lastName ?? "User",
    email: options.email ?? "seed.user@example.com",
    password: options.password ?? "SeedPass123!",
    role: options.role ?? "customer",
    ...(options.registeredDate ? { registeredDate: options.registeredDate } : {}),
  });
}

export interface SeedProductOptions {
  title?: string;
  slug?: string;
  description?: string;
  price?: number;
  quantity?: number;
  sku?: string;
  category?: string;
  stockStatus?: boolean;
  featured?: boolean;
  sizes?: string[];
  colors?: string[];
  imgs?: { url: string }[];
}

export async function seedProduct(options: SeedProductOptions = {}) {
  return Product.create({
    title: options.title ?? "Classic Tee",
    slug: options.slug ?? "classic-tee",
    description: options.description ?? "A comfortable cotton tee.",
    price: options.price ?? 25,
    quantity: options.quantity ?? 100,
    sku: options.sku ?? "TEE-001",
    category: options.category ?? "apparel",
    stockStatus: options.stockStatus ?? true,
    featured: options.featured ?? false,
    sizes: options.sizes ?? ["S", "M", "L"],
    colors: options.colors ?? ["BLACK", "WHITE"],
    imgs: options.imgs ?? [{ url: "https://example.com/tee.jpg" }],
  });
}

export interface SeedOrderOptions {
  userId: string;
  productId: string;
  status?: string;
  orderNumber?: string;
  subTotal?: number;
  tax?: number;
  total?: number;
  quantity?: number;
  unitPrice?: number;
}

export async function seedOrder(options: SeedOrderOptions) {
  return Order.create({
    orderNumber: options.orderNumber ?? `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: options.userId,
    customer: {
      email: "customer@example.com",
      firstName: "Jane",
      lastName: "Doe",
    },
    status: options.status ?? "PENDING",
    currency: "AUD",
    subTotal: options.subTotal ?? 100,
    tax: options.tax ?? 10,
    total: options.total ?? 110,
    items: [
      {
        productId: options.productId,
        color: "BLACK",
        quantity: options.quantity ?? 2,
        size: "M",
        unitPrice: options.unitPrice ?? 50,
      },
    ],
    shippingAddress: {
      label: "home",
      street: "1 Test Street",
      city: "Sydney",
      state: "NSW",
      postcode: "2000",
      country: "AU",
      setAsDefault: true,
    },
  });
}

export interface SeedReviewOptions {
  userId: string;
  productId: string;
  rating?: number;
  review?: string;
}

export async function seedReview(options: SeedReviewOptions) {
  return Review.create({
    userId: options.userId,
    productId: options.productId,
    rating: options.rating ?? 5,
    review: options.review ?? "Great product.",
  });
}

export interface SeedWishListOptions {
  userId: string;
  productId: string;
}

export async function seedWishList(options: SeedWishListOptions) {
  return WishList.create({
    userId: options.userId,
    products: [{ id: options.productId }],
  });
}

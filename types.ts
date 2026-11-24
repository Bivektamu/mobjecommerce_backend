import { JwtPayload } from "jsonwebtoken";
import mongoose, { Document, ObjectId } from "mongoose";
import { Request, Response } from "express";

export type Address = {
  label: string;
  street: string;
  building?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  setAsDefault: boolean;
};
export interface AddressInput {
  input: Address & { id?: string };
}

export enum UserRole {
  ADMIN = "admin",
  CUSTOMER = "customer",
}

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  googleId?: string;
};

export interface LoginInput {
  input: {
    email: string;
    password: string;
  };
}

export interface InputId {
  id: string;
}

export interface CustomJwtPayload extends JwtPayload {
  role: UserRole;
  id: string;
  iat?: number;
  exp?: number;
}

export interface verifiedUser {
  role: UserRole;
  id: string;
}

export interface MyContext {
  req: Request;
  res: Response;
  auth: verifiedUser | null;
}

export interface inputProductImg {
  img: any;
}

export interface ProductImage {
  _id: ObjectId;
  url: string;
}

export interface FormError {
  [key: string]: string;
}

export interface ValidateSchema<T> {
  name: string;
  type: string;
  value: T;
  msg?: string;
  required?: boolean;
}

export interface ReviewType {
  id: string;
  customerId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  stars: number;
  review: string;
}

export interface CustomError extends Error {
  code: ErrorCode;
}

export enum ErrorCode {
  USER_NOT_FOUND = "USER_NOT_FOUND",
  ALREADY_EXISTS = "ALREADY_EXISTS",
  BAD_CREDENTIALS = "BAD_CREDENTIALS",
  SHIPPING_ADDRESS_ERROR = "SHIPPING_ADDRESS_ERROR",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  NOT_AUTHENTICATED = "NOT_AUTHENTICATED",
  WRONG_USER_TYPE = "WRONG_USER_TYPE",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INPUT_ERROR = "INPUT_ERROR",
  NOT_FOUND = "NOT_FOUND",
  JWT_TOKEN_EXPIRED = "JWT_TOKEN_EXPIRED",
  JWT_TOKEN_INVALID = "JWT_TOKEN_INVALID",
  JWT_TOKEN_MISSING = "JWT_TOKEN_MISSING",
  GOOGLE_ERROR = "GOOGLE_ERROR",
  TOKEN_REVOKED = "TOKEN_REVOKED",
}

export enum OrderStatus {
  CREATED = "CREATED",
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  PROCESSING = "PROCESSING",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
  SHIPPED = "SHIPPED",
  REFUNDED = "REFUNDED",
}

export interface OrderItemPopulated {
  productId: ProductRef;
}
export interface ProductRef {
  _id: ObjectId;
  category: string;
}

export interface unknownShape {
  [key: string]: number;
}

export interface CompletedOrder {
  _id: ObjectId;
  items: OrderItemPopulated[];
}

export type OrderItemsCategoryCounter = {
  category: string;
  count: number;
};

export interface OrderItem {
  productId: mongoose.Types.ObjectId;
  color: Color;
  quantity: number;
  size: Size;
  unitPrice: number;
}

export interface RefundSchema {
  refundId: string;
  amount: number;
  createdAd: Date;
}

export interface CreateOrder {
  input: {
    items: OrderItem[];
    shippingAddress: Address;
    billingAddress: Omit<Address, "label" | "setAsDefault">;
    email?: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  email?: string;
  status: OrderStatus;
  currency: string;
  subTotal: number;
  tax: number;
  total: number;
  stripePaymentIntentId?: string;
  stripePaymentId?: string;
  items: [OrderItem];
  refunds?: [RefundSchema];
  customer?: Pick<User, "firstName" | "lastName" | "email">;
  shippingAddress: Address;
  billingAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum Color {
  BLACK = "BLACK",
  RED = "RED",
  GRAY = "GRAY",
  WHITE = "WHITE",
  AMBER = "AMBER",
}
export enum Size {
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
}

export interface GoogleUserInfo {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}

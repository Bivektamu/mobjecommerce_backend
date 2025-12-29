import { JwtPayload } from "jsonwebtoken"
import mongoose, { ObjectId } from "mongoose"
import { Request, Response } from 'express'

export type Address = {
    street: String,
    city: String,
    state: String,
    postcode: String,
    country: String,
}

export enum UserRole {
    ADMIN = 'admin',
    CUSTOMER = 'customer',
}

export type User = {
    id: String
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    role: UserRole
    googleId?: String
}

export interface LoginInput {
    input: {
        email: String,
        password: String
    }
}

export interface CustomJwtPayload extends JwtPayload {
    role: UserRole,
    id: string,
    iat?: number,
    exp?: number
}

export interface verifiedUser {
    role: UserRole,
    id: string
}

export interface MyContext {
    req: Request,
    res: Response,
    auth: verifiedUser | null
}


export interface inputProductImg {
    img: any
}

export interface ProductImage {
    _id: ObjectId,
    url: string,
}

export interface FormError {
    [key: string]: string
}

export interface ValidateSchema<T> {
    name: string,
    type: string,
    value: T,
    msg?: string,
    required?: boolean
}

export interface ReviewType {
    id: String,
    customerId: mongoose.Types.ObjectId,
    productId: mongoose.Types.ObjectId,
    stars: Number,
    review: String
}

export interface CustomError extends Error {
    code: ErrorCode
}

export enum ErrorCode {
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    ALREADY_EXISTS = 'ALREADY_EXISTS',
    BAD_CREDENTIALS = 'BAD_CREDENTIALS',
    SHIPPING_ADDRESS_ERROR = 'SHIPPING_ADDRESS_ERROR',
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
    NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
    WRONG_USER_TYPE = 'WRONG_USER_TYPE',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    INPUT_ERROR = 'INPUT_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    JWT_TOKEN_EXPIRED = 'JWT_TOKEN_EXPIRED',
    JWT_TOKEN_INVALID = 'JWT_TOKEN_INVALID',
    JWT_TOKEN_MISSING = 'JWT_TOKEN_MISSING',
    GOOGLE_ERROR = 'GOOGLE_ERROR',
    TOKEN_REVOKED = 'TOKEN_REVOKED'
}

export enum OrderStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    PROCESSING = "PROCESSING",
    CANCELLED = "CANCELLED",
    FAILED = "FAILED",
    SHIPPED = "SHIPPED",
    REFUNDED = "REFUNDED",
}



export interface OrderItemPopulated {
    productId: ProductRef
}
export interface ProductRef {
    _id: ObjectId,
    category: string
}

export interface unknownShape {
    [key: string]: number
}

export interface CompletedOrder {
    _id: ObjectId,
    items: OrderItemPopulated[]
}

export type OrderItemsCategoryCounter = {
    category: string,
    count: number
}

export enum Color {
    BLACK = 'BLACK',
    RED = 'RED',
    GRAY = 'GRAY',
    WHITE = 'WHITE',
    AMBER = 'AMBER'
}
export enum Size {
    S = 'S',
    M = 'M',
    L = 'L',
    XL = 'XL'
}
export type OrderedProduct = {
    productId: string,
    color: Color,
    quantity: number,
    size: Size,
    price: number,
    imgUrl: string
}
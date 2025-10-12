# 🛍️ Mobje Commerce — Backend

**Mobje Commerce** is a full-featured e-commerce built with a modern MERN  and TypeScript-based stack.  
This repo is backend which powers the Mobje Commerce platform, handling user authentication, product management, order processing, and more — all through a secure and performant GraphQL API.

---

## 🚀 Overview

This backend serves as the core engine of the Mobje Commerce application.  
It provides APIs for managing users, products, categories, orders, reviews, and file uploads — designed with scalability and maintainability in mind.

The backend is built with **TypeScript**, **Apollo Server**, and **Express**, leveraging **MongoDB** for data persistence and **AWS S3** for image storage.

---

## 🧠 Key Features

- **GraphQL API (Apollo Server)** — Efficient and flexible data fetching with type safety.  
- **JWT Authentication** — Secure user login and access management.  
- **File Uploads with graphql-upload-ts** — Supports product image uploads to AWS S3.  
- **Role-based Access Control** — Differentiates between admin and user permissions.  
- **Order Management System** — Tracks order creation, status updates, and sales analytics.  
- **Product & Category Management** — CRUD operations with image handling and stock tracking.  
- **Review System** — Users can post and manage product reviews with populated relations.  
- **Sales & Analytics** — Aggregation pipelines for business insights such as sales by date and category.  
- **Scalable Modular Architecture** — Organized code structure for maintainability and extensibility.  
- **Error Handling & Validation** — Centralized custom error responses and input validation.

---

## 🧩 Tech Stack

| Category | Technology |
|-----------|-------------|
| **Language** | TypeScript |
| **Framework** | Express.js |
| **API** | Apollo Server (GraphQL) |
| **Database** | MongoDB (Mongoose ORM) |
| **Authentication** | JSON Web Tokens (JWT) |
| **File Uploads** | graphql-upload-ts |
| **Cloud Storage** | AWS S3 |
| **Hosting** | Vercel |
| **Others** | bcrypt, dotenv, cors, helmet, compression |
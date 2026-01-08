# 🛍️ Mobje Commerce — Backend

**Mobje Commerce** is a full-featured e-commerce built with a modern MERN  and TypeScript-based stack.  
This repo is backend which powers the Mobje Commerce platform, handling user authentication, product management, order processing, payments, and more — all through a secure and performant GraphQL API.

---

## 🚀 Overview

This backend serves as the core engine of the Mobje Commerce application.  
It provides APIs for managing users, products, categories, orders, reviews, payments, and file uploads — designed with scalability and maintainability in mind.

The backend is built with **TypeScript**, **Apollo Server**, and **Express**, leveraging **MongoDB** for data persistence and **AWS S3** for image storage, and integrates **Stripe** for payment processing.

---

## 🧠 Key Features

- **GraphQL API (Apollo Server)** — Efficient and flexible data fetching with type safety.  
- **Secure JWT Authentication** — Implements access + refresh token (token rotation) strategy for user login and session management.
- **OAuth Login** — Supports Google OAuth for fast, seamless and secure authentication.
- **Stripe Payment Integration** — Handles payment processing and order completion.
- **File Uploads** — Product images uploaded to AWS S3 via graphql-upload-ts.  
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
| **Authentication** | JWT (Access + Refresh Tokens), Google OAuth |
| **Payments** | Stripe |
| **File Uploads** | graphql-upload-ts |
| **Cloud Storage** | AWS S3 |
| **Hosting** | Vercel |
| **Others** | bcrypt, dotenv, cors |

---

## 🌐 Deployment

- **Backend**: Hosted on **Vercel**  
- **Database**: MongoDB Atlas  
- **Payments**: Stripe  
- **Authentication**: JWT (Access + Refresh Tokens) + Google OAuth
- **Storage**: AWS S3 (for product images)

---

## 🧾 Example Entities

- **User** — registration, authentication, profile management, OAuth login
- **Product** — title, SKU, price, category, images, stock tracking
- **Order** — user details, items, order number, total price, payment & order status  
- **Review** — linked with user and product via population  
- **Category** — product classification for frontend filtering and analytics  

---

## 🎯 Highlights

- Implemented secure authentication system using JWT access + refresh tokens and Google OAuth.
- Integrated Stripe for seamless payment processing.
- Designed efficient data aggregation pipelines for reporting (sales by month, category).  
- Integrated AWS S3 for image storage and retrieval.  
- Applied strong typing across backend logic with TypeScript.  
- Built modular and clean GraphQL schema for maintainable API development.  
- Optimized MongoDB queries using indexes and projections.  
- Deployed and maintained serverless GraphQL API on Vercel.

---

## 🧑‍💻 Author

**Bivek Jang Gurung**  
Front-End Developer | React Specialist  
📍 Sydney, Australia  
🌐 [bivekgurung.com](https://bivekgurung.com)  
💼 [LinkedIn](https://www.linkedin.com/in/bivek-gurung-b4602a62/)

---

## 📄 License

This project is licensed under the **MIT License** — feel free to explore and learn from it.
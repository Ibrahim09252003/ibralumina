# IbraLumina — Full-Stack E-Commerce

A role-based e-commerce web application built with **React + Vite** on the frontend and **Node.js + Express + MongoDB** on the backend, as a final project for **ITE387 — Advance Database 1**.

---

## 📖 Overview

IbraLumina is a curated tech & lifestyle storefront with three user roles — **Administrator**, **Manager**, and **Buyer** — each with a dedicated dashboard and permission scope. It demonstrates end-to-end full-stack development: React SPA routing, Express REST API, MongoDB CRUD, JWT authentication, role-based access control, responsive UI, and live API integration.

---

## ✨ Features

### 🔐 Authentication & Authorization
- Buyer self-registration with field-level validation
- JWT-based session, `bcryptjs`-hashed passwords
- Three role tiers: `admin`, `manager`, `buyer`
- Protected routes with `ProtectedRoute`
- Password change from Profile (admins rotate their own password here)
- Account deletion (self-service for buyers/managers)

### 🛍️ Buyer
- Shop catalog with search, category filter, sort (price, rating)
- Product detail page with ratings and reviews
- Shopping cart with quantity controls, stock check, checkout
- Order history with status tracking (Pending → Shipped → Delivered)
- Order cancellation (restores stock)
- Rate delivered products (1–5 stars + comment)
- Direct messaging with managers

### 🧑‍💼 Manager
- Inventory view (read + edit + delete products)
- Order management across all buyers
- Messaging: with buyers and admins

### 🛡️ Administrator
- Full CRUD on products (create, edit, delete)
- Order oversight
- Account management: create users, reset passwords (managers/buyers only), delete accounts (managers/buyers only)
- Messaging: with managers and other admins

### 🎨 Shared UX
- 5 selectable themes (Lumina, Ocean, Forest, Sunset, Midnight) — persisted per browser
- Avatar system: default initial, 12 emoji presets, or uploaded photo
- Rule-based chatbot ("Lumi") on every page
- SweetAlert2 confirmations and toasts
- Fully responsive — desktop, tablet, mobile
- Global image fallback for broken URLs

---

## 🧰 Tech Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Build tool | Vite 8 |
| Routing | React Router DOM 7 |
| Styling | Custom CSS (design tokens, CSS variables, no framework) |
| HTTP | Native `fetch` API (wrapped in `services/api.js`) |
| Alerts | SweetAlert2 |
| State | React Context API (Auth, Cart, Product, Rating, Message, Theme) |
| Persistence | MongoDB (primary) + `localStorage` (cart cache, ratings, messages, theme) |

### Backend
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js 4 |
| Database | MongoDB (via Mongoose 8) |
| Auth | JWT + bcryptjs |
| Config | dotenv |

### Database
- **MongoDB Atlas** (cloud) or local MongoDB
- Collections: `users`, `products`, `orders`

---

## 📁 Project Structure
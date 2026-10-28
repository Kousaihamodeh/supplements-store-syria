# SUPPLEMENTS STORE - Production E-Commerce Platform

> **Brand**: SUPPLEMENTS STORE (@supplement_store_syria)  
> **Location**: Damascus – Jaramana – Al-Karama Square – opposite MTN  
> **Contact / WhatsApp**: 0938229497  

Complete, high-end e-commerce website built for **SUPPLEMENTS STORE** featuring full bilingual support (Arabic & English), RTL/LTR dynamic layout, responsive mobile navigation, custom product gallery, mobile-first Syrian governorates shipping checkout, floating WhatsApp integration, dynamic Google Maps store location manager, and a real Admin Dashboard with **1-Click Product Duplication** and multi-image drag-and-drop uploader.

---

## 🚫 ZERO DOCKER REQUIREMENT

This project is built to run **100% locally directly in VS Code** using Node.js.

- ❌ NO Docker required
- ❌ NO Dockerfiles required
- ❌ NO docker-compose required
- ❌ NO Docker Desktop required
- ❌ NO containers required

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Dark Luxury theme with Neon Lime `#84cc16` accents) + Cairo Font
- **Database & ORM**: SQLite via **Prisma ORM** (File-based database `prisma/dev.db` for 0-install local execution)
- **Authentication**: JWT Cookie Session for Admin Panel (`bcryptjs`)
- **i18n / Bilingual**: React Context LanguageProvider (Arabic default RTL | English LTR)
- **Cart Management**: React Context CartProvider with local persistence

---

## 📋 Prerequisites & Node.js Version

- **Node.js**: `v18.0.0` or higher (Tested & confirmed on Node `v24.18.0` and `v20.x`)
- **npm**: `v9.0.0` or higher (Tested on npm `v11.16.0`)
- **VS Code**: Recommended IDE

---

## 🚀 Quick Setup & Installation Guide

Follow these simple steps to set up and run the project locally in VS Code:

### 1. Open Project in VS Code

Open VS Code and navigate to the project directory:

```bash
cd supplements-store-syria
```

### 2. Environment Variables Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Or make sure `.env` contains:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="supplement_store_syria_jwt_secret_key_2026_super_secure"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Install Dependencies

Run standard npm install:

```bash
npm install
```

### 4. Initialize Database & Seed Demo Data

Run the database setup script. This creates the SQLite database file (`prisma/dev.db`), pushes the schema, and populates initial categories, brands, Syrian governorate shipping fees, default store settings, admin account, and sample products:

```bash
npm run db:setup
```

*(Alternatively, you can run `npx prisma db push` followed by `npm run seed`)*

---

## 🔑 Initial Admin Credentials

Upon running `npm run db:setup`, the initial administrator account is automatically created:

- **Login URL**: `http://localhost:3000/admin/login`
- **Email**: `admin@supplementstore.sy`
- **Password**: `admin123`

You can log in, manage products, upload images, duplicate products, edit shipping fees, and update the Google Maps URL dynamically from the dashboard.

---

## 💻 Running the Development Server

Start the Next.js local development server:

```bash
npm run dev
```

Open your browser and visit:  
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🏗️ Production Build & Local Execution

To test the optimized production build locally:

### 1. Build for Production

```bash
npm run build
```

### 2. Start Production Server

```bash
npm run start
```

Visit:  
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📍 Google Maps & Store Settings Management

The Google Maps location section ("زورونا في متجرنا" / "Visit Our Store") is fully dynamic.

To change the Google Maps URL or store address:
1. Log in to the Admin Dashboard (`/admin/login`).
2. Go to **إعدادات المتجر & الخريطة** (`/admin/settings`).
3. Update the **Google Maps Share URL**, Arabic/English Address, or phone numbers.
4. Click **حفظ التغييرات**. The website will instantly reflect the new Google Maps URL without any code changes!

---

## 📱 Features Summary

1. **Bilingual System (AR / EN)**:
   - 1-click header toggle ("العربية | English")
   - Full RTL for Arabic and LTR for English
   - Bilingual product names, descriptions, categories, brands, and checkout fields
2. **Product Duplication**:
   - 1-click **Duplicate Product** button in Admin table (`/admin/products`) to clone any product with its variants and images instantly.
3. **Multi-Image Uploader**:
   - Drag & Drop multi-file batch upload saving images directly to `public/uploads/` with main image selection.
4. **Mobile Checkout & WhatsApp Order Summary**:
   - Form for Syrian governorates with live shipping fee calculation
   - Automatic pre-formatted WhatsApp order summary forwarding to `0938229497`.

---

## 📄 License & Ownership

Built exclusively for **SUPPLEMENTS STORE** (@supplement_store_syria). All rights reserved 2026.

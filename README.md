# AuthShield &bull; Enterprise Authentication System

[![Node.js](https://img.shields.io/badge/Node.js-v18+-68a063?style=flat-square&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47a248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Dual_Token-000000?style=flat-square&logo=json-web-tokens)](https://jwt.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

A modern, production-grade **Full-Stack Authentication and Session Management System** built with **Node.js, Express, MongoDB, React, Vite, and GSAP**.

Featuring dual-token JWTs with HTTP-only cookies, silent background token rotation, real 6-digit email OTP password recovery via Gmail SMTP, and multi-device session tracking with global device revocation.

---

## Key Features

- **Dual-Token Authentication (JWT)**:
  - **Access Token**: Short-lived (10 minutes) for high-security API route protection.
  - **Refresh Token**: Long-lived (7 days) stored securely in `httpOnly`, `SameSite` cookies to prevent XSS-based token theft.
- **Silent Background Token Rotation**:
  - Axios response interceptor catches `401 Unauthorized` responses and automatically requests a fresh token pair without interrupting user activity.
- **Email OTP Password Reset**:
  - 6-digit one-time passcode generated and delivered via Gmail SMTP (Nodemailer).
  - 10-minute OTP expiration window enforced in MongoDB.
- **Multi-Device Session Tracking**:
  - Every login tracks IP address, user-agent, device type (Desktop/Mobile), and timestamps in MongoDB.
  - Real-time active devices view with live status (`Active` / `Revoked`).
  - Cap of up to 10 concurrent active sessions per user account.
- **Granular Session Revocation**:
  - **Current Device Logout**: Clears browser cookies and marks the current session as revoked.
  - **Logout All Devices**: Instantly wipes all refresh tokens in the database, immediately disconnecting all other active browser and mobile sessions.
- **Modern UI / UX**:
  - Built with React, Vite, Tailwind CSS, Lucide icons, and GSAP animations.
  - Dark / Light mode toggle with persistent state.
  - Password strength estimator and real-time form validation.

---

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Security**: JWT (`jsonwebtoken`), SHA-256 password hashing, `cookie-parser`, `cors`
- **Email Service**: Nodemailer (Gmail SMTP, IPv4 forced for reliability)

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Animations**: GSAP (GreenSock Animation Platform)
- **Icons**: Lucide React
- **HTTP Client**: Axios with automatic retry queues and response interceptors
- **Routing**: React Router DOM v6

---

## Project Structure

```text
├── Backend/
│   ├── src/
│   │   ├── config/          # Environment configuration
│   │   ├── controllers/     # Authentication & device controllers
│   │   ├── middlewares/     # JWT authentication middleware
│   │   ├── models/          # Mongoose UserModel & SessionModel
│   │   ├── routes/          # API route definitions (/api/auth)
│   │   ├── services/        # Email & Nodemailer SMTP service
│   │   └── app.js           # Express app setup & middleware
│   ├── server.js            # Server entrypoint (Port 5000)
│   ├── package.json
│   ├── .env.example
│   └── Complete_Authentication_System.postman_collection.json
│
├── Frontend/
│   ├── src/
│   │   ├── api/             # Axios instance & interceptors
│   │   ├── components/      # UI components, modals, auth cards
│   │   ├── context/         # AuthContext provider
│   │   ├── hooks/           # useAuth, useToast
│   │   ├── layouts/         # AuthLayout, DashboardLayout
│   │   ├── pages/           # Login, Register, ForgotPassword, VerifyOTP, ResetPassword, Dashboard, Profile
│   │   └── utils/           # Date formatters, strength checker
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── .gitignore
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas or local MongoDB instance
- Gmail account with an [App Password](https://myaccount.google.com/apppasswords) (for sending OTP emails)

---

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/authenticationDB
   JWT_SECRET=your_super_secret_jwt_key
   REFRESH_TOKEN_SECRET=your_super_secret_refresh_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_16_char_gmail_app_password
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   ```

5. Start the backend server:
   ```bash
   npm run dev
   # or
   node server.js
   ```

---

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd ../Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite dev server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user & issue cookies | No |
| `POST` | `/api/auth/login` | Authenticate user & track session | No |
| `GET` | `/api/auth/get-me` | Get current user profile | Yes (Access Token) |
| `POST` | `/api/auth/refresh-token` | Exchange refresh token for new access token | No (Refresh Cookie) |
| `POST` | `/api/auth/logout` | Revoke current device session & clear cookies | No (Cookie) |
| `POST` | `/api/auth/logout-all` | Revoke all device sessions everywhere | Yes (Access Token) |
| `GET` | `/api/auth/get-devices` | List active sessions & device history | Yes (Access Token) |
| `POST` | `/api/auth/send-otp` | Send 6-digit OTP code to registered email | No |
| `POST` | `/api/auth/verify-otp` | Validate 6-digit OTP code | No |
| `POST` | `/api/auth/reset-password` | Update password & invalidate previous sessions | No |

---

## Postman Collection

A complete Postman collection is included in the root of the backend folder:
`Backend/Complete_Authentication_System.postman_collection.json`

Import this file directly into Postman to test all endpoints with pre-configured variables.

---

## Author

**Anis Khan Niazi**
- GitHub: [@AnisKhanN](https://github.com/AnisKhanN)
- Repository: [Complete-Authentication-System](https://github.com/AnisKhanN/Complete-Authentication-System)

---

## License

This project is licensed under the MIT License.

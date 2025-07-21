<p align="center">
  <img src="https://github.com/user-attachments/assets/484aac42-a787-4d8d-8ee2-6c2e7d08b6e0" alt="Gradient Generator Logo" width="150">
</p>

<h1 align="center">🚚 Universal Shipping Tracker</h1>

<p align="center">
A full-stack application built with Next.js 14 App Router, Prisma, and PostgreSQL, designed to unify shipment tracking data from major US carriers into a single interface.
</p>

<p align="center">
  <a href="{here the link}" target="_blank">
    <img src="https://img.shields.io/badge/Live_Demo-View_Here-blue?style=for-the-badge&logo=vercel" alt="Live Demo">
  </a>
  <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge" alt="Project Status">
</p>

---


## 1. 🚧 Project Overview & Architecture

The Universal Shipping Tracker allows users to track shipments from various US carriers using a single interface. It auto-detects the carrier based on the tracking number, fetches (mock) data, and displays it in a unified format. Users can register, log in, and save their tracking history.

### 🧩 Architecture

- **Frontend:** Built with **Next.js 14 (App Router)**, **React**, **TypeScript**, and **Tailwind CSS**.
- **State Management:** Authentication handled via **React Context**.
- **Backend (API):** Uses **Next.js API Routes** for RESTful endpoints.
- **Database:** **PostgreSQL** managed with **Prisma ORM**.
- **Authentication:** JWT-based with **bcryptjs** password hashing.
- **Carrier Detection:** Regex-based logic.
- **Carrier Integration:** Currently simulated with mocked data.
- **Caching:** Tracking data is cached to minimize external API calls.

### ✨ Design Principles

- **Separation of Concerns:** Frontend, backend, database, auth, and carrier utilities are modular.
- **Scalability:**
  - SSR & SSG via App Router.
  - Prisma offers efficient DB pooling.
  - JWT enables horizontal scaling.
  - Cached tracking improves performance.

- **SOLID Principles:**
  - **SRP:** Each module serves a focused purpose.
  - **OCP:** Easily extendable carrier logic without changing existing endpoint logic.

- **🔢 Big O Efficiency:**
  - Prisma queries on indexed fields: `O(logN)` for lookups, `O(1)` for writes.
  - bcrypt hashing: `O(1)` complexity but CPU-intensive.
  - Carrier detection via regex: `O(L)` (fast).
  - Polling: `O(1)` per client per interval; future WebSocket support will optimize server usage.

        
## 2. Setup & Installation ⚙️🚀

Follow these steps to set up and run the project locally:

### Prerequisites 📋

- 🔹 **Node.js** (v18.x or higher)  
- 🔹 **npm** (v8.x or higher)  
- 🔹 **PostgreSQL** (installed locally or accessible via Docker)  

### Installation Steps 🛠️

1. **Clone the repo and enter the folder**  
   ```bash
   git clone <repo-url>
   cd tracking-system
   ```

2. **Install dependencies**  
   ```bash
   npm install
   ```

3. **Set environment variables**  
   Create a `.env` file or export the following:  
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
   JWT_SECRET="YOUR_VERY_STRONG_RANDOM_SECRET_KEY_HERE"
   ```
   > ⚠️ Replace `USER`, `PASSWORD`, `HOST`, `PORT`, and `DATABASE` with your PostgreSQL credentials.  
   > 🔐 For `JWT_SECRET`, generate a long and secure random string.

4. **Configure PostgreSQL Database**  
   - Make sure your PostgreSQL server is running.  
   - Create an empty database with the name you set in `DATABASE` (e.g., `tracking_db`). You can use tools like pgAdmin or the `psql` client.  
   - Run Prisma migrations:  
     ```bash
     npx prisma migrate dev --name initial_setup
     ```
     This will create the tables: `User`, `TrackingHistory`, and `SavedTracking`.

5. **Generate Prisma Client**  
   ```bash
   npx prisma generate
   ```
   This keeps your Prisma client synced with your database schema.

6. **Start the development server**  
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

---

## 3. Database Schema (Prisma) 🗄️📊

The database schema is defined in `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // Or "sqlite" for simple local development
  url      = env("DATABASE_URL")
}

model User {
  id              String          @id @default(uuid())
  email           String          @unique
  name            String
  password        String
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  trackingHistory TrackingHistory[]
  savedTracking   SavedTracking[]

  @@map("users")
}

model TrackingHistory {
  id             String     @id @default(uuid())
  trackingNumber String
  carrier        String
  status         String
  location       String?
  timestamp      DateTime
  description    String?
  userId         String?    // Optional for guest users
  user           User?      @relation(fields: [userId], references: [id])
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  @@index([trackingNumber])  // Fast lookup by tracking number
  @@index([userId])          // Fast lookup by user
  @@map("tracking_history")
}

model SavedTracking {
  id             String   @id @default(uuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  trackingNumber String
  carrier        String
  alias          String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([userId, trackingNumber])  // Prevent duplicate saved tracking per user
  @@index([userId])                    // Fast lookup by user
  @@map("saved_trackings")
}
```

### Database Design Decisions 💡

- 🔹 **UUIDs for IDs:** Using UUIDs (`@default(uuid())`) helps avoid concurrency issues and is ideal for distributed systems.  
- 🔹 **TrackingHistory:** Stores every tracking event queried. `userId` is optional to allow guest users or general analytics. Indexes on `trackingNumber` and `userId` ensure efficient queries (O(log N)).  
- 🔹 **SavedTracking:** Allows authenticated users to save tracking numbers with optional aliases. The unique constraint on `[userId, trackingNumber]` prevents saving duplicates.
    

# 4. API Documentation 📡🛠️

API routes are located in `src/app/api`. All JSON responses include a `message` field and, if applicable, a `data` field.

### Authentication 🔐

- **POST /api/auth/register**  
  - **Description:** Registers a new user in the system.  
  - **Request Body:**  
    ```json
    { "name": "John Doe", "email": "john.doe@example.com", "password": "securepassword123" }
    ```  
  - **Success Response:**  
    ```json
    { "message": "User registered successfully", "token": "eyJhbGciOiJIUzI1Ni...", "userId": "user-uuid" }
    ```  
  - **Validation Error:**  
    ```json
    { "message": "Validation Error", "errors": [ { "code": "invalid_string", "message": "Invalid email format", "path": ["email"] } ] }
    ```  
  - **Duplicate User:**  
    ```json
    { "message": "User with this email already exists" }
    ```

- **POST /api/auth/login**  
  - **Description:** Authenticates a user and returns a JWT token.  
  - **Request Body:**  
    ```json
    { "email": "john.doe@example.com", "password": "securepassword123" }
    ```  
  - **Success Response:**  
    ```json
    { "message": "Login successful", "token": "eyJhbGciOiJIUzI1Ni...", "userId": "user-uuid", "userName": "John Doe" }
    ```  
  - **Invalid Credentials:**  
    ```json
    { "message": "Invalid credentials" }
    ```

---

### Tracking (Core Feature) 📦

- **POST /api/track**  
  - **Description:** Universal endpoint to track any tracking number. Automatically detects carrier and returns unified info. If authenticated and alias is provided, tracking is saved.  
  - **Headers:**  
    - `Content-Type: application/json`  
    - `Authorization: Bearer <token>` (Optional)  
  - **Request Body:**  
    ```json
    { "trackingNumber": "1Z9999999999999999", "alias": "My UPS Package" } // alias optional
    ```  
  - **Success Response:**  
    ```json
    {
      "message": "Tracking information retrieved successfully",
      "data": {
        "trackingNumber": "1Z9999999999999999",
        "carrier": "UPS",
        "currentStatus": "Delivered",
        "estimatedDelivery": "2025-07-19T10:00:00.000Z",
        "trackingEvents": [
          { "status": "Delivered", "location": "Santo Domingo, DO", "timestamp": "2025-07-19T10:00:00.000Z" }
          // ... more events
        ],
        "lastUpdated": "2025-07-20T10:00:00.000Z",
        "isDelivered": true
      }
    }
    ```  
  - **Validation Error:**  
    ```json
    { "message": "Validation Error", "errors": [ { "code": "too_small", "message": "Tracking number is required", "path": ["trackingNumber"] } ] }
    ```  
  - **Unknown Carrier:**  
    ```json
    { "message": "Unknown carrier for this tracking number format." }
    ```  
  - **Not Found for FedEx:**  
    ```json
    { "message": "Tracking number not found for FedEx.", "carrier": "FedEx", "trackingNumber": "INVALIDFEDEX123" }
    ```  
  - **Internal Server Error:**  
    ```json
    { "message": "Internal server error" }
    ```

- **GET /api/track/:trackingNumber**  
  - **Description:** Retrieves the most recent cached tracking info for a given number.  
  - **Response (200):** Same format as POST `/api/track` data object.  
  - **Not Found:**  
    ```json
    { "message": "No cached tracking information found for this number." }
    ```

- **GET /api/track/history/:trackingNumber**  
  - **Description:** Retrieves full cached tracking event history for a given number.  
  - **Success:**  
    ```json
    {
      "message": "Tracking history retrieved successfully",
      "data": [
        { "status": "Origin Scan", "location": "Atlanta, GA", "timestamp": "2025-07-17T10:00:00.000Z" },
        { "status": "In Transit", "location": "Miami, FL", "timestamp": "2025-07-18T10:00:00.000Z" }
      ]
    }
    ```  
  - **Not Found:**  
    ```json
    { "message": "No tracking history found for this number." }
    ```

---

### Saved Trackings Management ⭐

- **GET /api/saved-trackings**  
  - **Description:** Retrieves all saved trackings for authenticated user.  
  - **Headers:**  
    - `Authorization: Bearer <token>` (Required)  
  - **Success:**  
    ```json
    {
      "message": "Saved trackings retrieved successfully",
      "data": [
        { "id": "saved-tracking-uuid-1", "trackingNumber": "1Z9999999999999999", "carrier": "UPS", "alias": "My UPS Package", "createdAt": "2025-07-20T10:00:00.000Z" },
        { "id": "saved-tracking-uuid-2", "trackingNumber": "9400100000000000000000", "carrier": "USPS", "alias": "Important Letter", "createdAt": "2025-07-19T15:30:00.000Z" }
      ]
    }
    ```  
  - **Errors:**  
    ```json
    { "message": "Authorization header missing" }
    ```  
    ```json
    { "message": "Invalid or expired token" }
    ```

- **DELETE /api/saved-trackings/:id**  
  - **Description:** Deletes a saved tracking by ID. Tracking must belong to authenticated user.  
  - **Headers:**  
    - `Authorization: Bearer <token>` (Required)  
  - **Success:**  
    ```json
    { "message": "Saved tracking deleted successfully" }
    ```  
  - **Errors:**  
    ```json
    { "message": "Tracking ID is required" }
    ```  
    ```json
    { "message": "Unauthorized: You do not own this saved tracking" }
    ```  
    ```json
    { "message": "Saved tracking not found" }
    ```

---

# 5. Carrier Detection Logic 🚚🔍

Located in `src/app/api/utils/carriers.ts`. Uses regular expressions to identify carriers based on tracking number format. More specific patterns take priority.

**Implemented Patterns:**

| Carrier           | Regex Pattern                                             |
|-------------------|-----------------------------------------------------------|
| **UPS**           | `^1Z[0-9A-Z]{16}$`                                       |
| **FedEx**         | `^(\d{12}|\d{14}|\d{20}|\d{22}|\d{34})$`                 |
| **USPS**          | `^(9400|9205|9361)\d{18}$|^[A-Z]{2}\d{9}[A-Z]{2}$|^420\d{27,30}$` |
| **DHL**           | `^(3S|JV|JD)?\d{8,9}$|^\d{10,11}$`                       |
| **Amazon Logistics** | `^TBA\d{12}$`                                           |
| **OnTrac**        | `^C\d{8}$`                                               |

Spaces in tracking numbers are removed before validation.

---

# 6. Implementation Status & Requirements ✅

### Backend/API

- ✅ JWT authentication implemented (`src/app/api/utils/auth.ts`).  
- ✅ Carrier detection logic implemented (`src/app/api/utils/carriers.ts`).  
- ✅ Integration with multiple carriers via mocked data (`src/app/api/utils/mockCarriers.ts`).  
- ✅ Unified response format (`UnifiedTrackingInfo` interface).  
- ✅ Caching tracking info to reduce API calls (`TrackingHistory` table and relevant endpoints).  
- ✅ Input validation and sanitization with Zod.  
- ✅ Error handling middleware with carrier-specific messages.  
- ✅ Prisma used for DB operations.  
- ✅ Full saved tracking CRUD: GET & DELETE implemented; creation handled on POST /api/track.

### Frontend

- ✅ Next.js App Router used.  
- ✅ Client-side auth state management with React Context & localStorage.  
- ✅ Reusable tracking components for carriers.  
- ✅ Real-time tracking updates via polling every 60 seconds.  
- ✅ Loading states and carrier-specific error handling.  
- ✅ Full TypeScript usage with types.  
- ✅ Form validation on tracking number format with regex and Zod.  
- ✅ Handling various tracking statuses (In Transit, Delivered, Exception, etc.).

---

# 7. Known Limitations & Design Decisions ⚠️

- Mock data used instead of real carrier APIs due to access limitations.  
- Polling chosen over WebSockets for simplicity; WebSockets recommended for production.  
- POST /api/track allows unauthenticated tracking but saving requires authentication.  
- Frontend format validation complements backend authoritative validation.  
- No global error middleware; per-route try/catch used.

---

# 8. Future Improvements 🚀

- Integrate with real carrier APIs (UPS, FedEx, USPS, DHL, Amazon, OnTrac).  
- Switch to WebSockets for real-time updates.  
- Add email/SMS notifications for status changes.  
- Dockerize frontend, backend, and DB.  
- CI/CD pipelines for testing and deployment.  
- Advanced error logging and APM integration.  
- Granular authorization policies.  
- DB optimization with additional indexes.  
- Distributed caching (e.g., Redis).  
- Expanded unit and E2E testing (Cypress, Playwright).  
- UI/UX improvements (filters, search, pagination).  
- Internationalization (i18n) support.

---

# 9. Testing 🧪

Unit and integration tests included for backend logic.

- Jest configured for Next.js and TypeScript (`jest.config.js`, `jest.setup.js`).  
- Carrier detection tests in `src/app/api/utils/__tests__/carriers.test.ts`.  
- Universal tracking endpoint tests in `src/app/api/track/__tests__/route.test.ts`.

**Run tests:**  
```bash
npm test
```

---

# 10. Deliverables 📦

- This complete README.md file.  
- `.env.example` file for environment variables (create `.env` with your own values).  
- (Bonus) Deployment configuration (not included here).

---

# 11. Bonus Points ⭐

- ✅ Advanced features (real-time updates via polling).  
- ✅ Initial comprehensive backend test coverage.  
- ✅ Frontend form validation with tracking number format checks.

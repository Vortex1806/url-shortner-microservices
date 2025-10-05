# **Lyncut \- A High-Performance URL Shortener Microservice 🚀**

Lyncut is a robust and scalable URL shortening service built with a microservices architecture. It provides a simple way to create, manage, and track short links, designed for high availability and performance.

## **System Architecture**

Lyncut is decomposed into four main services, an API Gateway, and two data stores, ensuring separation of concerns, scalability, and resilience.

### **Architecture Diagram**

<img width="3840" height="1575" alt="Untitled diagram _ Mermaid Chart-2025-10-05-124751" src="https://github.com/user-attachments/assets/0a5db8f1-8d22-416d-b35e-86810f6e28dc" />

### **Microservices**

* **API Gateway**: The single entry point for all client requests. It routes traffic to the appropriate downstream service (Shortener or Redirect) based on the request path.  
* **Shortener Service**: Handles all business logic related to users and URLs. This includes user authentication (signup, login), and CRUD operations for URLs (create, view, delete).  
* **Redirect Service**: Its sole purpose is to handle incoming short links and redirect users to the target URL with maximum speed. It heavily utilizes Redis for caching to minimize database lookups.  
* **Analytics Service**: An asynchronous service responsible for processing URL visit counts. It listens to events from the Redirect Service via Redis Streams and periodically flushes aggregated data to the PostgreSQL database. This decouples analytics from the critical redirect path, ensuring redirects remain fast.

## **Tech Stack 💻**

* **Backend**: Node.js, Express.js  
* **Database**: PostgreSQL  
* **ORM**: Drizzle ORM  
* **Caching & Messaging**: Redis (used for caching redirects and as a message broker with Redis Streams)  
* **Containerization**: Docker, Docker Compose  
* **Validation**: Zod  
* **Authentication**: JSON Web Tokens (JWT)

## **Database Schema**

The database consists of two primary tables: users and urls.

### **users Table**

Stores user information, including credentials for authentication.

// Drizzle ORM Schema: users  
export const userTable \= pgTable("users", {  
  id: uuid("id").primaryKey().defaultRandom(),  
  firstName: varchar("first\_name", { length: 55 }).notNull(),  
  lastName: varchar("last\_name", { length: 55 }),  
  email: varchar("email", { length: 255 }).notNull().unique(),  
  password: text("password").notNull(),  
  salt: text("salt").notNull(),  
  createdAt: timestamp("created\_at").defaultNow().notNull(),  
  updatedAt: timestamp("updated\_at").$onUpdate(() \=\> new Date()),  
});

### **urls Table**

Stores the short codes, their target URLs, and associated metadata.

// Drizzle ORM Schema: urls  
export const urlsTable \= pgTable("urls", {  
  id: uuid("id").primaryKey().defaultRandom(),  
  shortCode: varchar("short\_code", { length: 155 }).notNull().unique(),  
  targetUrl: text("target\_url").notNull(),  
  userId: uuid("user\_id").references(() \=\> userTable.id).notNull(),  
  visitCount: integer("visit\_count").notNull().default(0),  
  createdAt: timestamp("created\_at").notNull().defaultNow(),  
  updatedAt: timestamp("updated\_at").$onUpdate(() \=\> new Date()),  
});

## **🛣️ API Endpoints**

All API routes are accessed through the API Gateway.

### **🔐 Authentication (/api/users)**

#### **📝 Sign Up**

**Endpoint**: POST /api/users/signup

Registers a new user.  
Request:  
{  
  "firstName": "John",  
  "lastName": "Doe",  
  "email": "john.doe@example.com",  
  "password": "strongpassword123"  
}

**Response (201 Created)**:

{  
  "data": { "userId": "a1b2c3d4-e5f6-..." }  
}

#### **🔑 Log In**

**Endpoint**: POST /api/users/login

Authenticates a user and returns a JWT.  
Request:  
{  
  "email": "john.doe@example.com",  
  "password": "strongpassword123"  
}

**Response (200 OK)**:

{  
  "success": "User logged in successfully",  
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  
}

### **🔗 URL Management (/api/urls)**

Requires a valid JWT in the Authorization: Bearer \<token\> header.

#### **✨ Create a Short URL**

Endpoint: POST /api/urls/shorten  
Request:  
{  
  "url": "\[https://github.com/google/gemini-api\](https://github.com/google/gemini-api)",  
  "code": "gemini-api"  
}

**Response (201 Created)**:

{  
  "id": "f1e2d3c4-...",  
  "shortCode": "gemini-api",  
  "targetUrl": "\[https://github.com/google/gemini-api\](https://github.com/google/gemini-api)"  
}

#### **📜 Get User's Short URLs**

Endpoint: GET /api/urls/codes  
Response (200 OK):  
{  
  "codes": \[  
    {  
      "id": "f1e2d3c4-...",  
      "shortCode": "gemini-api",  
      "targetUrl": "\[https://github.com/google/gemini-api\](https://github.com/google/gemini-api)",  
      "userId": "a1b2c3d4-...",  
      "visitCount": 15,  
      "createdAt": "2025-10-05T12:00:00.000Z",  
      "updatedAt": null  
    }  
  \]  
}

#### **🗑️ Delete a Short URL**

Endpoint: DELETE /api/urls/:id  
Response (200 OK):  
{ "deleted": true }

### **🚦 Redirection**

**Endpoint**: GET /:shortCode

Redirects the user to the target URL.  
Response: 301 Moved Permanently  
Error (404):  
{ "error": "Short URL does not exist" }

## **📊 Asynchronous Analytics Pipeline**

To ensure high redirect performance, Lyncut employs an asynchronous analytics system using Redis Streams.

* **🔁 Publish**: Redirect Service publishes url\_visits events with the shortCode.  
* **🧮 Ingest & Batch**: Analytics Service listens to the stream and aggregates counts in Redis Hashes.  
* **💾 Flush**: A background loop periodically bulk-updates PostgreSQL with aggregated counts, then clears Redis.

This ensures fault tolerance and high throughput even under heavy load.

## **⚙️ Local Setup & Installation**

### **🧱 Prerequisites**

* Docker & Docker Compose  
* Git

### **🧰 Steps**

1. git clone \<your-repository-url\>  
   cd lyncut-project

2. cp .env.example .env  
   \# Edit .env and set POSTGRES\_PASSWORD, JWT\_SECRET

3. docker-compose up \-d \--build

4. docker-compose ps

Access the API Gateway at:  
👉 http://localhost:3000

## **🚀 Future Roadmap**

* **🖥️ Frontend Application**: React/Vue/Svelte web client  
* **📈 Advanced Analytics**: Referrers, geo data, time-series  
* **🌐 Custom Domains**: Branded short links  
* **⚡ Rate Limiting**: Prevent API abuse  
* **☸️ Kubernetes Deployment**: Helm charts for production

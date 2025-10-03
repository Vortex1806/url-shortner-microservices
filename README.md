URL Shortener Microservices
This project is a URL shortener application built with a microservices architecture. It consists of:

API Gateway: The single entry point for all client requests. It routes traffic to the appropriate downstream service.

Shortener Service: Handles user authentication (signup/login) and the creation/management of shortened URLs.

Redirect Service: Handles the redirection from a short code to the original target URL. It uses a Redis cache to improve performance and reduce database load.

Architecture Overview

Licensed by Google
A user sends a request to the API Gateway.

The API Gateway, based on the URL path, proxies the request to either the shortener-service (for /api/... routes) or the redirect-service (for /:shortCode routes).

The Shortener Service interacts with the PostgreSQL database to manage user and URL data.

The Redirect Service first checks its Redis cache for the target URL. If it's a cache miss, it queries the PostgreSQL database, populates the cache, and then performs the redirect.

How to Run
Prerequisites
Docker and Docker Compose

Steps
Clone the repository and structure your files:
Make sure your directory structure looks like this:

.
├── docker-compose.yml
├── api-gateway/
│   ├── Dockerfile
│   ├── gateway.js
│   └── package.json
├── shortener-service/
│   ├── Dockerfile
│   ├── shortener.js
│   └── package.json
├── redirect-service/
│   ├── Dockerfile
│   ├── redirect.js
│   └── package.json
└── README.md

Run the application:
Open a terminal in the root directory of the project and run:

docker-compose up --build

This will build the Docker images for each service and start all the containers.

Run database migrations (First time setup):
After the services are running, you'll need to create the database tables. Open a new terminal and run:

docker-compose exec shortener_service npm run db:generate
docker-compose exec shortener_service npm run db:migrate

This executes the Drizzle Kit commands inside the shortener_service container to set up the database schema.

Access the services:

API Gateway: http://localhost:3000

Shorten a URL (POST): http://localhost:3000/api/urls/shorten

Redirect (GET): http://localhost:3000/{your-short-code}

Using the API
Sign up (POST http://localhost:3000/api/users/signup)

{
    "firstName": "John",
    "email": "john.doe@example.com",
    "password": "password123"
}

Login (POST http://localhost:3000/api/users/login)

{
    "email": "john.doe@example.com",
    "password": "password123"
}

This will return a JWT token.

Shorten a URL (POST http://localhost:3000/api/urls/shorten)
Include the JWT token in the Authorization header: Bearer <your_token>

{
    "url": "[https://www.google.com](https://www.google.com)"
}

Visit the short URL (GET http://localhost:3000/<short_code>)
This will redirect you to https://www.google.com. The first time will be a database hit, and subsequent requests will be served from the Redis cache.
import express from "express";
import proxy from "express-http-proxy";
import cors from "cors";

const app = express();

const SHORTENER_SERVICE_URL =
  process.env.SHORTENER_SERVICE_URL || "http://localhost:3001";
const REDIRECT_SERVICE_URL =
  process.env.REDIRECT_SERVICE_URL || "http://localhost:3002";

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Proxy users and urls, keep the path
app.use(
  "/api/users",
  proxy(SHORTENER_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/api/users${req.url}`,
  })
);

app.use(
  "/api/urls",
  proxy(SHORTENER_SERVICE_URL, {
    proxyReqPathResolver: (req) => `/api/urls${req.url}`,
  })
);

app.use(
  "/",
  proxy(REDIRECT_SERVICE_URL, {
    proxyReqPathResolver: (req) => req.url,
  })
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});

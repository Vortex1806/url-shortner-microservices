import express from "express";

import urlRouter from "./routes/url.router.js";
import authRouter from "./routes/auth.router.js";

const app = express();
app.use(express.json());

app.use("/api/users", authRouter);

app.use("/api/urls", urlRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Shortener service listening on port ${PORT}`);
});

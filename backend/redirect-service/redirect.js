import express from "express";
import { handleShortUrlRedirect } from "./services/url.service";
import "./services/redis.service.js"; //ensure redis connects first

const app = express();
const PORT = process.env.REDIRECT_SERVICE_PORT || 3002;

app.get("/:shortCode", async (req, res) => {
  const { shortCode } = req.params;
  await handleShortUrlRedirect(shortCode, res);
});

app.listen(PORT, () => {
  console.log(`Redirect service listening on port ${PORT}`);
});

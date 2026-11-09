const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { clientOrigin } = require("./config/env");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
app.use(helmet());
app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: "100kb" })); // submitted code is small; keep the cap low
app.use("/api", rateLimit({ windowMs: 60_000, limit: 120 })); // TODO: stricter limits on /auth and /submissions
app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;

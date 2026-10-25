require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const feedbackRoutes = require("./routes/feedback");

const app = express();

app.set("trust proxy", 1);

connectDB();

app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(mongoSanitize());
app.use(hpp());

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const vercelProjectSlug = process.env.ALLOWED_VERCEL_PROJECT; 
const vercelPreviewRegex = vercelProjectSlug
  ? new RegExp(`^https://${vercelProjectSlug}-[a-z0-9]+-[a-z0-9-]+\\.vercel\\.app$`)
  : null;

app.use(
  cors({
    origin(origin, callback) {
      
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (vercelPreviewRegex && vercelPreviewRegex.test(origin)) return callback(null, true);

      
      console.warn(`CORS blocked request from origin: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);


const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests from this IP, please try again later" },
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many submissions from this IP, please try again later" },
});


app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", service: "area51-feedback-backend" });
});

app.get("/api/health", (req, res) => {
  const dbState = require("mongoose").connection.readyState; 
  res.status(200).json({ status: "ok", dbConnected: dbState === 1 });
});

app.use("/api/feedback", (req, res, next) => {
  (req.method === "GET" ? readLimiter : writeLimiter)(req, res, next);
});
app.use("/api/feedback", feedbackRoutes);

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "Origin not allowed" });
  }
  const isProd = process.env.NODE_ENV === "production";
  res.status(err.status || 500).json({
    message: isProd ? "Internal server error" : err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

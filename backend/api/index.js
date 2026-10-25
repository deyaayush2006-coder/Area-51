// Vercel treats every file under /api as its own serverless function.
// This just re-exports the Express app from server.js — Vercel's Node runtime
// knows how to route incoming requests into an exported Express app.
module.exports = require("../server");

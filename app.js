const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const indexRoutes = require("./Routes/indexRoutes");
const userRoutes = require("./Routes/userRoutes");
const path = require('path');
const globalErrorHandler = require("./Controllers/errorControllers");

const app = express();
app.use(express.static(path.join(__dirname, 'public')));


// ===== Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// ======== Data sanitization against XSS (protection from malicious html) use pkg name exactly "xss-clean"
app.use(xssClean());
//  Set Security HTTP Headers======
app.use(helmet());

app.use(bodyParser.json());
app.use(morgan("dev"));

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
// Routes
app.use("/user", userRoutes);
app.get("/", (_, res) => res.json({}));
app.all(['/success', '/failure'], (req, res) => {
  const isSuccess = req.path === '/success';
  const fileName = isSuccess ? 'success.html' : 'failure.html';
  
  // Optional: Log the request method
  console.log(`Redirect to ${fileName} via ${req.method} request.`);

  res.sendFile(path.join(__dirname, 'public', fileName), (err) => {
    if (err) {
      console.error(`Error sending ${fileName}:`, err);
      res.status(500).send('Internal Server Error');
    }
  });
});

app.use("", indexRoutes);

// // Handling unhandled routes:
app.all("*", (req, res, next) => {
  return res.status(404).json({
    status: 404,
    success: false,
    message: `can't find ${req.originalUrl} on this server`,
    data: {},
  });
});

// Error handler middlware
app.use(globalErrorHandler);

module.exports = app;

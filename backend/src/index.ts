import { config } from "dotenv";
config();

import express from "express";
import cors from "cors";
import multer from "multer";
import { clerkMiddleware } from "@clerk/express";
import { authorize } from "./middleware/auth.middleware";

const PORT = process.env.PORT || 8080;
const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());

// Test route
app.use("/api/v1/test", (_, res) => {
  res.json({
    message: "Server is running",
    data: null,
    error: null,
  });
  return;
});

// Route imports
import mealRoute from "./routers/meal.route";
import clientRoute from "./routers/client.route";
import teamRoute from "./routers/team.route";
import userRoute from "./routers/user.route"

// routing based on the api endpoints
app.use(
  "/api/v1/meal",
  clerkMiddleware(),
  authorize(["admin", "team"]),
  upload.array("diet-images"),
  mealRoute
);

app.use(
  "/api/v1/client",
  clerkMiddleware(),
  clientRoute
);

app.use(
  "/api/v1/team",
  clerkMiddleware(),
  authorize(["admin", "team"]),
  teamRoute
);

app.use(
  "/api/v1/user",
  clerkMiddleware(),
  authorize(["admin"]),
  userRoute
);

// serving ther server on PORT
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

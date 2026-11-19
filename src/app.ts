import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import tutorRoutes from "./modules/tutor/tutor.routes";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/tutors", tutorRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Tuition Manager API!",
  });
});

export default app;
import express from "express";
import cors from "cors";
import helmet from "helmet";

import db from "./config/db.js";
db();

const app = express();
// Middleware
app.use(cors());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Import routes
import AuthRouter from "./routes/AuthRoutes.js";
import userVerificationRoutes from "./routes/userVerificationRoutes.js";
import userVerificationCartRoutes from "./routes/userVerificationCartRoutes.js";
import pdfRouter from "./routes/pdfRoutes.js";
import fieldsRouts from "./routes/additionalFieldsRoutes.js";
import walletRoute from "./routes/walletRoute.js";
import pacakageRoute from "./routes/pacakageRoute.js";
import companyPackageRoute from "./routes/companyPackageRoute.js";
import termsRoute from "./routes/termsRoutes.js"; 
import privacyRoute from "./routes/privacyPolicyRoute.js"; 
// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the back end of the Quikchek ");
});
app.use("/api/auth", AuthRouter);
app.use("/api/verify", userVerificationRoutes);
app.use("/api/usercart", userVerificationCartRoutes);
app.use("/api/pdf", pdfRouter);
app.use("/api/fields", fieldsRouts);
app.use("/api/wallet", walletRoute);
app.use("/api/pacakageRoute", pacakageRoute);
app.use("/api/companyPackageRoute", companyPackageRoute);
app.use("/api/terms", termsRoute);
app.use("/api/privacyRoute", privacyRoute);
app.use("/api/dashboard", dashboardRoute);

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

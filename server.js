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
import dashboardRoute from "./routes/dashboardRoute.js";
import InviteRouter from "./routes/inviteRoute.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import email_router from "./routes/emailRoute.js";
import MarqueeRouter from "./routes/MarqueeRoute.js";
import userSearch from "./routes/userDetailsBySearchRoute.js";
import ownerRouter from "./routes/ownerRoutes.js";
import ComplexRouter from "./routes/complexRoute.js";
import versionRouter from "./routes/versionRoute.js";
// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the back end of the Quikchek ");
});
app.use("/api/version", versionRouter);
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
app.use("/api/invite", InviteRouter);
app.use("/api/payment", paymentRoutes);
app.use("/api/email", email_router);
app.use("/api/marquee", MarqueeRouter);
app.use("/api/detailsBySearch", userSearch);
app.use("/api/ownerRoute", ownerRouter);
app.use("/api/complex", ComplexRouter);

// Start server
const PORT = process.env.PORT || 1001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

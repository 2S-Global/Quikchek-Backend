import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
export const inviteController = async (req, res) => {
  console.log("req.body", req.body);
  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ message: "email and name are required" });
  }

  // Check if email is valid
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }

  try {
    const emailContent = `
     <div style="text-align: center; margin-bottom: 20px;">
    <img src="https://res.cloudinary.com/da4unxero/image/upload/v1745565670/QuikChek%20images/New%20banner%20images/blpawxigmdssnw9y21ge.jpg" alt="Banner" style="width: 100%; height: auto;" />
  </div>
    
    <p>Dear <strong>${name}</strong>,</p>
    <p>In today's dynamic recruitment landscape, ensuring the authenticity of candidate KYC documents is paramount. As a standard practice, your organization likely collects PAN, Aadhaar/EPIC/Passport, and UAN details, primarily to establish employee identity and for emergency contact purposes. However, recent surveys indicate a concerning statistic: approximately <strong>7.6%</strong> of KYC documents submitted today are potentially fake. This alarming figure exposes your organization to significant risks throughout the employee lifecycle.</p>

    <p>The current recruitment process, while seemingly straightforward, carries inherent dangers when the authenticity of these crucial documents remains unverified. The implications of onboarding an employee with fraudulent credentials can be far-reaching, potentially leading to:</p>

    <ul>
      <li><strong>Financial Losses:</strong> Through fraudulent claims, theft, or other illicit activities.</li>
      <li><strong>Legal and Compliance Issues:</strong> Facing penalties for non-compliance or unknowingly employing individuals with questionable backgrounds.</li>
      <li><strong>Reputational Damage:</strong> Erosion of trust among stakeholders due to security breaches or unethical conduct.</li>
      <li><strong>Security Threats:</strong> Increased vulnerability to internal fraud and data breaches.</li>
      <li><strong>Increased Risk in Case of Emergencies:</strong> Difficulty in tracing the employee or their next of kin in genuine medical or other emergencies.</li>
    </ul>
    
    <p>We understand that the primary deterrent to thorough KYC verification isn't necessarily the cost,
     but rather the complexity and hassle of dealing with multiple verification agencies and processes. 
     Recognizing this critical need, <strong>Global Employability Information Services India Limited</strong> is proud to introduce <a href="https://www.quikchek.in" target="_blank">www.quikchek.in</a>, India's first comprehensive platform designed to streamline and simplify your KYC verification process.</p>
    
    <p><strong>Quikchek.in</strong> offers a single, unified platform to verify the authenticity of most standard KYC documents, including:</p>
    
    <ul>
      <li><strong>PAN:</strong> Ensuring the validity and genuineness of the Permanent Account Number.</li>
      <li><strong>Aadhaar:</strong> Confirming the authenticity of the unique identification number.</li>
      <li><strong>Driving License:</strong> Verifying the legitimacy of the driving credentials.</li>
      <li><strong>EPIC (Voter ID):</strong> Validating the authenticity of the Electoral Photo Identity Card.</li>
      <li><strong>Passport:</strong> Confirming the genuineness of the passport details.</li>
      <li><strong>UAN (Universal Account Number):</strong> Verifying the authenticity and transactional record of the Provident Fund account.</li>
    </ul>
    
    <p>By leveraging <strong>Quikchek.in</strong>, your organization can benefit from:</p>
    
    <ul>
      <li><strong>Reduced Risk:</strong> Significantly minimize the chances of onboarding individuals with fraudulent documents, safeguarding your company from potential financial, legal, and reputational damage.</li>
      <li><strong>Enhanced Efficiency:</strong> Eliminate the cumbersome process of dealing with multiple verification agencies. Our single platform provides quick and reliable results.</li>
      <li><strong>Cost-Effectiveness:</strong> While the hassle is removed, our platform is also designed to be economically viable, offering a cost-efficient solution for robust KYC verification.</li>
      <li><strong>Improved Compliance:</strong> Ensure adherence to regulatory requirements by implementing a thorough and documented verification process.</li>
      <li><strong>Faster Onboarding:</strong> Expedite the onboarding process with quick and accurate verification, improving the overall candidate experience.</li>
      <li><strong>Mitigation of Emergency Risks:</strong> Ensures that the company has access to verified information to help employees in case of medical or other emergencies.</li>
    </ul>
    
    <p>Don't let the complexities of KYC verification expose your organization to unnecessary risks. Embrace a smarter, safer, and more efficient approach with <strong>Quikchek</strong>.</p>
    
    <p>We invite you to explore our platform at <a href="https://www.quikchek.in" target="_blank">www.quikchek.in</a> to understand how we can help you fortify your recruitment process and protect your organization. For further information or a personalized demonstration, please feel free to contact us.</p>

    <p>Sincerely,<br/>
    The Team at <strong>Global Employability Information Services India Limited</strong><br/>
   Email: hello@geisil.com , <br/>
   Mobile: +91 9831823898
<br/>
    <a href="https://geisil.com/" target="_blank">www.geisil.com</a></p>    
    `;

    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Geisil Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject:
        "Mitigate Recruitment Risks with Quikchek: Verify KYC Authenticity Seamlessly",
      html: emailContent,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: "Email sent successfully!",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email. Please try again later.",
    });
  }
};

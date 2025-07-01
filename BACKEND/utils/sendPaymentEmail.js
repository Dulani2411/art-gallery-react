import nodemailer from "nodemailer";

export const sendPaymentEmail = async (to, paymentData) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
        from: `"Art Gallery" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Your Art Gallery Purchase Confirmation",
        html: `
          <h2>Thank you for your purchase!</h2>
          <p>Hello ${paymentData.name},</p>
          <p>Your payment of Rs. ${paymentData.totalAmount}.00 has been received.</p>
          <h4>Order Details:</h4>
          <ul>
            ${paymentData.artworks
              .map(
                (item) => `<li>Artwork ID: ${item.artworkId} | Quantity: ${item.quantity}</li>`
              )
              .join("")}
          </ul>
          <p><strong>Shipping to:</strong> ${paymentData.address}</p>
          <p>We will contact you shortly at ${to} or ${paymentData.contactNumber}.</p>
          <p>– Art Gallery Team</p>
        `,
      };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
  } catch (error) {
    console.error("❌ Error sending payment email:", error);
  }
};

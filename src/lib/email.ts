import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface SendOTPEmailParams {
  email: string;
  otp: string;
  purpose: 'registration' | 'login' | 'password-reset';
}

export async function sendOTPEmail({ email, otp, purpose }: SendOTPEmailParams): Promise<boolean> {
  try {
    let subject = '';
    let text = '';
    let html = '';

    switch (purpose) {
      case 'registration':
        subject = 'Verify Your Email - AOAC Registration';
        text = `Your OTP for registration is: ${otp}. This OTP will expire in 10 minutes.`;
        html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #168e2d; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0;">Allahabad Organic Agricultural Company</h1>
              </div>
              <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
                <h2 style="color: #168e2d;">Verify Your Email Address</h2>
                <p>Thank you for registering with AOAC! Please use the OTP below to complete your registration:</p>
                <div style="background-color: white; border: 2px solid #168e2d; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                  <p style="font-size: 14px; color: #666; margin: 0 0 10px;">Your Verification Code</p>
                  <p style="font-size: 32px; font-weight: bold; color: #168e2d; letter-spacing: 8px; margin: 0;">${otp}</p>
                </div>
                <p style="font-size: 14px; color: #666;">This OTP will expire in <strong>10 minutes</strong>.</p>
                <p style="font-size: 14px; color: #666; margin-top: 30px;">If you didn't request this code, please ignore this email.</p>
              </div>
              <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                <p>© ${new Date().getFullYear()} AOAC. All rights reserved.</p>
              </div>
            </body>
          </html>
        `;
        break;
      
      case 'login':
        subject = 'Your Login OTP - AOAC';
        text = `Your OTP for login is: ${otp}. This OTP will expire in 10 minutes.`;
        html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #168e2d; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0;">Allahabad Organic Agricultural Company</h1>
              </div>
              <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
                <h2 style="color: #168e2d;">Your Login Verification Code</h2>
                <p>You requested to login to your AOAC account. Please use the OTP below to complete your login:</p>
                <div style="background-color: white; border: 2px solid #168e2d; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                  <p style="font-size: 14px; color: #666; margin: 0 0 10px;">Your Verification Code</p>
                  <p style="font-size: 32px; font-weight: bold; color: #168e2d; letter-spacing: 8px; margin: 0;">${otp}</p>
                </div>
                <p style="font-size: 14px; color: #666;">This OTP will expire in <strong>10 minutes</strong>.</p>
                <p style="font-size: 14px; color: #666; margin-top: 30px;">If you didn't request this code, please ignore this email or contact support immediately.</p>
              </div>
              <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                <p>© ${new Date().getFullYear()} AOAC. All rights reserved.</p>
              </div>
            </body>
          </html>
        `;
        break;
      
      case 'password-reset':
        subject = 'Reset Your Password - AOAC';
        text = `Your OTP for password reset is: ${otp}. This OTP will expire in 10 minutes.`;
        html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #168e2d; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0;">Allahabad Organic Agricultural Company</h1>
              </div>
              <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
                <h2 style="color: #168e2d;">Reset Your Password</h2>
                <p>You requested to reset your password. Please use the OTP below to verify your identity:</p>
                <div style="background-color: white; border: 2px solid #168e2d; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                  <p style="font-size: 14px; color: #666; margin: 0 0 10px;">Your Verification Code</p>
                  <p style="font-size: 32px; font-weight: bold; color: #168e2d; letter-spacing: 8px; margin: 0;">${otp}</p>
                </div>
                <p style="font-size: 14px; color: #666;">This OTP will expire in <strong>10 minutes</strong>.</p>
                <p style="font-size: 14px; color: #666; margin-top: 30px;">If you didn't request this code, please ignore this email or contact support immediately.</p>
              </div>
              <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                <p>© ${new Date().getFullYear()} AOAC. All rights reserved.</p>
              </div>
            </body>
          </html>
        `;
        break;
    }

    await transporter.sendMail({
      from: `"AOAC" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      text,
      html,
    });

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

interface SendProfileChangeAlertParams {
  email: string;
  userName: string;
  changes: string[];
}

export async function sendProfileChangeAlert({ email, userName, changes }: SendProfileChangeAlertParams): Promise<boolean> {
  try {
    const subject = 'Profile Update Alert - AOAC';
    const changesList = changes.map(change => `<li style="margin: 8px 0;">${change}</li>`).join('');
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #168e2d; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Allahabad Organic Agricultural Company</h1>
          </div>
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #168e2d;">Profile Update Alert</h2>
            <p>Hello ${userName},</p>
            <p>We wanted to inform you that your profile information has been updated. Here are the changes made:</p>
            <div style="background-color: white; border-left: 4px solid #168e2d; padding: 15px; margin: 20px 0;">
              <ul style="margin: 0; padding-left: 20px;">
                ${changesList}
              </ul>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              <strong>If you did not make these changes, please contact our support team immediately.</strong>
            </p>
            <p style="font-size: 14px; color: #666;">Thank you for using AOAC services.</p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© ${new Date().getFullYear()} AOAC. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;

    const text = `Hello ${userName},\n\nYour profile information has been updated. Changes:\n${changes.join('\n')}\n\nIf you did not make these changes, please contact support immediately.\n\nThank you for using AOAC services.`;

    await transporter.sendMail({
      from: `"AOAC" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      text,
      html,
    });

    return true;
  } catch (error) {
    console.error('Error sending profile change alert:', error);
    return false;
  }
}

interface SendOrderConfirmationParams {
  email: string;
  userName: string;
  orderId: string;
  orderDate: string;
  totalAmount: number;
  discountAmount?: number;
  deliveryCharge?: number;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    name: string;
    phone: string;
    houseNo: string;
    line1: string;
    line2?: string | null;
    city: string;
    district: string;
    state: string;
    pincode: string;
  };
  paymentId?: string;
  courierName?: string;
  estimatedDeliveryDate?: string;
}

export async function sendOrderConfirmationEmail({
  email,
  userName,
  orderId,
  orderDate,
  totalAmount,
  discountAmount = 0,
  deliveryCharge = 0,
  orderItems,
  shippingAddress,
  paymentId,
  courierName,
  estimatedDeliveryDate,
}: SendOrderConfirmationParams): Promise<boolean> {
  try {
    const subject = `Order Confirmation - ${orderId} - AOAC`;
    
    const itemsHtml = orderItems
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `
      )
      .join('');

    const subtotal = totalAmount - deliveryCharge + discountAmount;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #168e2d; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">Allahabad Organic Agricultural Company</h1>
          </div>
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #168e2d;">Order Confirmation</h2>
            <p>Hello ${userName},</p>
            <p>Thank you for your order! We have received your order and it is being processed.</p>
            
            <div style="background-color: white; border: 2px solid #168e2d; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #168e2d; margin-top: 0;">Order Details</h3>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Order Date:</strong> ${new Date(orderDate).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}</p>
              ${paymentId ? `<p><strong>Payment ID:</strong> ${paymentId}</p>` : ''}
            </div>

            <div style="background-color: white; border: 2px solid #168e2d; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #168e2d; margin-top: 0;">Order Items</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f3f4f6;">
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #168e2d;">Item</th>
                    <th style="padding: 10px; text-align: center; border-bottom: 2px solid #168e2d;">Qty</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #168e2d;">Price</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #168e2d;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <div style="background-color: white; border: 2px solid #168e2d; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #168e2d; margin-top: 0;">Order Summary</h3>
              <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                <span>Subtotal:</span>
                <span>₹${subtotal.toFixed(2)}</span>
              </div>
              ${discountAmount > 0 ? `
              <div style="display: flex; justify-content: space-between; margin: 10px 0; color: #10b981;">
                <span>Discount:</span>
                <span>-₹${discountAmount.toFixed(2)}</span>
              </div>
              ` : ''}
              ${deliveryCharge > 0 ? `
              <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                <span>Shipping:</span>
                <span>₹${deliveryCharge.toFixed(2)}</span>
              </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; margin: 10px 0; padding-top: 10px; border-top: 2px solid #168e2d; font-size: 18px; font-weight: bold;">
                <span>Total:</span>
                <span style="color: #168e2d;">₹${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div style="background-color: white; border: 2px solid #168e2d; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #168e2d; margin-top: 0;">Shipping Address</h3>
              <p>${shippingAddress.name}</p>
              <p>${shippingAddress.phone}</p>
              <p>${shippingAddress.houseNo}, ${shippingAddress.line1}${shippingAddress.line2 ? `, ${shippingAddress.line2}` : ''}</p>
              <p>${shippingAddress.city}, ${shippingAddress.district}, ${shippingAddress.state} - ${shippingAddress.pincode}</p>
            </div>

            ${courierName ? `
            <div style="background-color: white; border: 2px solid #168e2d; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #168e2d; margin-top: 0;">Shipping Information</h3>
              <p><strong>Courier:</strong> ${courierName}</p>
              ${estimatedDeliveryDate ? `<p><strong>Estimated Delivery:</strong> ${estimatedDeliveryDate}</p>` : ''}
            </div>
            ` : ''}

            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              We will send you another email when your order ships. If you have any questions, please contact our support team.
            </p>
            <p style="font-size: 14px; color: #666;">Thank you for shopping with AOAC!</p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>© ${new Date().getFullYear()} AOAC. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;

    const text = `
Order Confirmation - ${orderId}

Hello ${userName},

Thank you for your order! We have received your order and it is being processed.

Order Details:
- Order ID: ${orderId}
- Order Date: ${new Date(orderDate).toLocaleDateString('en-IN')}
${paymentId ? `- Payment ID: ${paymentId}` : ''}

Order Items:
${orderItems.map(item => `- ${item.name} x ${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}`).join('\n')}

Order Summary:
- Subtotal: ₹${subtotal.toFixed(2)}
${discountAmount > 0 ? `- Discount: -₹${discountAmount.toFixed(2)}` : ''}
${deliveryCharge > 0 ? `- Shipping: ₹${deliveryCharge.toFixed(2)}` : ''}
- Total: ₹${totalAmount.toFixed(2)}

Shipping Address:
${shippingAddress.name}
${shippingAddress.phone}
${shippingAddress.houseNo}, ${shippingAddress.line1}${shippingAddress.line2 ? `, ${shippingAddress.line2}` : ''}
${shippingAddress.city}, ${shippingAddress.district}, ${shippingAddress.state} - ${shippingAddress.pincode}

${courierName ? `Shipping Information:\n- Courier: ${courierName}${estimatedDeliveryDate ? `\n- Estimated Delivery: ${estimatedDeliveryDate}` : ''}` : ''}

We will send you another email when your order ships. If you have any questions, please contact our support team.

Thank you for shopping with AOAC!
    `;

    await transporter.sendMail({
      from: `"AOAC" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      text,
      html,
    });

    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
}

// Verify email configuration
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
}


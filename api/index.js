const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = 3000;

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Seven Stitches API');
});

// Helper: Generate Coupon Code
function generateCouponCode() {
  return 'WELCOME-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Brevo Newsletter Subscription Endpoint
app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const apiKey = process.env.BREVO_API_KEY;
    const listId = 2; // Default list ID

    if (!apiKey) {
      console.error('BREVO_API_KEY missing');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // 0. Check for duplicate email
    const { data: existingUser } = await supabase
      .from('discount_codes')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'You have already joined the club!' });
    }

    // 1. Generate & Save Coupon
    const couponCode = generateCouponCode();
    const { error: dbError } = await supabase
      .from('discount_codes')
      .insert([{ email, code: couponCode, discount_percent: 15, is_used: false }]);

    if (dbError) {
      console.error('DB Error:', dbError);
      // We proceed even if DB fails, to ensure user gets acknowledged, 
      // though the coupon might not work or they might receive a code that isn't in DB.
      // In a strictly transactional system we might abort here.
    }

    // 2. Add to Contact List (Brevo)
    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({ email: email, listIds: [listId], updateEnabled: true })
    }).catch(e => console.warn('Brevo Contact Add Failed:', e));

    // 3. Send Transactional Email Directly
    let senderEmail = 'no-reply@sevenstitches.com';
    let senderName = 'Seven Stitches';

    // Attempt to fetch valid sender from Brevo to avoid sender errors
    try {
      const senderResponse = await fetch('https://api.brevo.com/v3/senders', {
        method: 'GET',
        headers: { 'api-key': apiKey }
      });
      const senderData = await senderResponse.json();
      if (senderData.senders && senderData.senders.length > 0) {
        const activeSender = senderData.senders.find(s => s.active) || senderData.senders[0];
        senderEmail = activeSender.email;
        senderName = 'Seven Stitches'; // Force display name
      }
    } catch (e) {
      console.warn('Could not fetch senders, using default');
    }

    const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: email }],
        subject: 'Welcome from Seven Stitches! Your Discount Inside',
        htmlContent: `
                <html>
                  <body style="font-family: sans-serif; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                      <h1 style="color: #2563eb; text-align: center;">Welcome to Seven Stitches!</h1>
                      <p>Hi there,</p>
                      <p>Thank you for joining our community! We're so excited to share our patterns with you.</p>
                      <div style="background-color: #f0f9ff; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                        <p style="margin: 0; font-weight: bold;">Here is your unique discount code:</p>
                        <h2 style="color: #2563eb; margin: 10px 0;">${couponCode}</h2>
                        <p style="margin: 0; font-size: 0.9em;">Use this at checkout for 15% off your first order.</p>
                      </div>
                      <p>Happy stitching!</p>
                      <p>- The Seven Stitches Team</p>
                    </div>
                  </body>
                </html>
            `
      })
    });

    if (!emailResponse.ok) {
      const err = await emailResponse.json();
      throw new Error(err.message || 'Email send failed');
    }

    return res.status(200).json({ message: 'Subscribed and email sent' });

  } catch (error) {
    console.error('Newsletter Error:', error);
    return res.status(500).json({ error: 'Process failed' });
  }
});

// Validate Coupon Endpoint
app.post('/api/validate-coupon', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ valid: false, message: 'Code required' });

  try {
    // Case insensitive search might require a change in DB or query
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code) // Exact match for now
      .single();

    if (error || !data) {
      return res.json({ valid: false, message: 'Invalid code' });
    }

    if (data.is_used) {
      return res.json({ valid: false, message: 'Code already used' });
    }

    return res.json({ valid: true, discountPercent: data.discount_percent, code: data.code });
  } catch (e) {
    console.error('Validation Error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Confirm Order Endpoint
app.post('/api/confirm-order', async (req, res) => {
  const { email, orderId, couponCode, totalAmount } = req.body;
  const apiKey = process.env.BREVO_API_KEY;

  try {
    // 1. Mark Coupon Used
    if (couponCode) {
      await supabase
        .from('discount_codes')
        .update({ is_used: true })
        .eq('code', couponCode);
    }

    // 2. Send Confirmation Email
    // Fetch sender logic again or reuse function if refactored
    let senderEmail = 'no-reply@sevenstitches.com';
    try {
      // For speed, just use the hardcoded one if it works, or fetch briefly
      // We can assume the same sender logic applies.
    } catch (e) { }

    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({
        sender: { name: 'Seven Stitches', email: senderEmail },
        to: [{ email: email }],
        subject: `Order Confirmation #${orderId?.slice(0, 8) || 'New'}`,
        htmlContent: `
                    <html>
                        <body style="font-family: sans-serif; color: #333;">
                            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
                                <h1 style="color: #10b981;">Order Confirmed!</h1>
                                <p>Thank you for your purchase. We are getting your patterns ready.</p>
                                <p><strong>Order Total:</strong> ₱${totalAmount}</p>
                                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                                <p>Follow us for more updates:</p>
                                <p>
                                    <a href="https://facebook.com/sevenstitches" style="color: #2563eb; text-decoration: none; margin-right: 15px;">Facebook</a> 
                                    <a href="https://instagram.com/sevenstitches" style="color: #e1306c; text-decoration: none; margin-right: 15px;">Instagram</a> 
                                    <a href="https://tiktok.com/@sevenstitches" style="color: #000000; text-decoration: none;">TikTok</a>
                                </p>
                            </div>
                        </body>
                    </html>
                `
      })
    });

    // 3. Send Admin Notification
    const adminEmail = 'claridadjulyfranz@gmail.com';
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({
        sender: { name: 'Seven Stitches System', email: senderEmail },
        to: [{ email: adminEmail }],
        subject: `[ADMIN] New Order: #${orderId?.slice(0, 8) || 'Check Dashboard'}`,
        htmlContent: `
            <html>
                <body style="font-family: sans-serif; color: #333;">
                    <h2>New Order Received!</h2>
                    <p>A new order has been placed on the shop.</p>
                    <ul>
                        <li><strong>Order ID:</strong> ${orderId}</li>
                        <li><strong>Customer Email:</strong> ${email}</li>
                        <li><strong>Total Amount:</strong> ₱${totalAmount}</li>
                        <li><strong>Coupon Used:</strong> ${couponCode || 'None'}</li>
                    </ul>
                    <p>Please check the admin dashboard for full details.</p>
                </body>
            </html>
        `
      })
    }).catch(e => console.error('Admin Notification Failed:', e));

    res.json({ success: true });
  } catch (e) {
    console.error('Confirm Order Error:', e);
    res.status(500).json({ error: 'Failed to confirm order' });
  }
});

// Export for Vercel
module.exports = app;

// Only listen if run directly (local development)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

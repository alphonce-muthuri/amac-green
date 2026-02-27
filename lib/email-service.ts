// Email configuration
const emailConfig = {
  host: process.env.BREVO_SMTP_SERVER || 'smtp-relay.brevo.com',
  port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.BREVO_SMTP_LOGIN || '',
    pass: process.env.BREVO_SMTP_PASSWORD || '',
  },
}

// Create transporter function that imports nodemailer dynamically (server-side only)
async function createTransporter() {
  if (typeof window !== 'undefined') {
    throw new Error('Email service can only be used on the server side')
  }
  
  const nodemailer = await import('nodemailer')
  return nodemailer.default.createTransport(emailConfig)
}

// Email templates
export const emailTemplates = {
  vendorApproval: {
    subject: '🎉 Your Vendor Application Has Been Approved!',
    html: (data: { name: string; companyName: string; loginUrl: string }) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Vendor Application Approved</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
            <p style="color: #f0f9ff; margin: 10px 0 0 0; font-size: 18px;">Your vendor application has been approved</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${data.name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Great news! Your vendor application for <strong>${data.companyName}</strong> has been approved by our admin team. 
              You can now start selling your renewable energy products on the EVEREADY ICEP platform.
            </p>
            
            <div style="background: #f0f9ff; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <h3 style="color: #16a34a; margin: 0 0 10px 0;">What's Next?</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Access your supplier dashboard</li>
                <li>Add your products and services</li>
                <li>Set up your pricing and inventory</li>
                <li>Start receiving orders from customers</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.loginUrl}" style="background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Access Supplier Dashboard
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              If you have any questions, please contact our support team at 
              <a href="mailto:support@evereadyea.co.ke" style="color: #16a34a;">support@evereadyea.co.ke</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              EVEREADY ICEP - Kenya's Leading Renewable Energy Marketplace<br>
              Nairobi, Kenya | www.evereadyea.co.ke
            </p>
          </div>
        </body>
      </html>
    `,
  },

  professionalApproval: {
    subject: '✅ Your Professional Application Has Been Approved!',
    html: (data: { name: string; companyName: string; loginUrl: string }) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Professional Application Approved</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ Welcome to Professional Tier!</h1>
            <p style="color: #dbeafe; margin: 10px 0 0 0; font-size: 18px;">Your professional application has been approved</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${data.name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Congratulations! Your professional application for <strong>${data.companyName}</strong> has been approved. 
              You now have access to professional-tier features including bulk pricing, priority support, and extended payment terms.
            </p>
            
            <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <h3 style="color: #2563eb; margin: 0 0 10px 0;">Professional Benefits:</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Bulk pricing and wholesale rates</li>
                <li>Priority customer support</li>
                <li>Advanced inventory management</li>
                <li>Extended payment terms</li>
                <li>Professional project management tools</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.loginUrl}" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Access Professional Dashboard
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              If you have any questions, please contact our support team at 
              <a href="mailto:support@evereadyea.co.ke" style="color: #2563eb;">support@evereadyea.co.ke</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              EVEREADY ICEP - Kenya's Leading Renewable Energy Marketplace<br>
              Nairobi, Kenya | www.evereadyea.co.ke
            </p>
          </div>
        </body>
      </html>
    `,
  },

  deliveryApproval: {
    subject: '🚚 Your Delivery Application Has Been Approved!',
    html: (data: { name: string; loginUrl: string }) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Delivery Application Approved</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🚚 Welcome to Our Delivery Team!</h1>
            <p style="color: #e9d5ff; margin: 10px 0 0 0; font-size: 18px;">Your delivery application has been approved</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${data.name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Excellent news! Your delivery partner application has been approved. 
              You can now start accepting delivery assignments and earning money by delivering renewable energy products to customers.
            </p>
            
            <div style="background: #faf5ff; border-left: 4px solid #7c3aed; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <h3 style="color: #7c3aed; margin: 0 0 10px 0;">Getting Started:</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Access your delivery dashboard</li>
                <li>Enable location tracking when ready to work</li>
                <li>Receive delivery assignments automatically</li>
                <li>Track your earnings and delivery history</li>
                <li>Get paid weekly for completed deliveries</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.loginUrl}" style="background: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Access Delivery Dashboard
              </a>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #92400e;">
                <strong>Important:</strong> Please ensure your vehicle documents and insurance are up to date before starting deliveries.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              If you have any questions, please contact our support team at 
              <a href="mailto:support@evereadyea.co.ke" style="color: #7c3aed;">support@evereadyea.co.ke</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              EVEREADY ICEP - Kenya's Leading Renewable Energy Marketplace<br>
              Nairobi, Kenya | www.evereadyea.co.ke
            </p>
          </div>
        </body>
      </html>
    `,
  },

  newInstallationJob: {
    subject: '🔨 New Installation Job Available - Bid Now!',
    html: (data: { 
      professionalName: string; 
      jobTitle: string; 
      location: string; 
      productCost: number; 
      urgency: string;
      jobUrl: string;
      description?: string;
    }) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Installation Job Available</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔨 New Job Alert!</h1>
            <p style="color: #fef3c7; margin: 10px 0 0 0; font-size: 18px;">A new installation opportunity is available</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${data.professionalName},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              A new installation job has been posted that matches your expertise. This is a great opportunity to expand your business!
            </p>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <h3 style="color: #92400e; margin: 0 0 15px 0;">Job Details</h3>
              <div style="margin-bottom: 10px;">
                <strong style="color: #92400e;">Project:</strong> ${data.jobTitle}
              </div>
              <div style="margin-bottom: 10px;">
                <strong style="color: #92400e;">Location:</strong> ${data.location}
              </div>
              <div style="margin-bottom: 10px;">
                <strong style="color: #92400e;">Product Value:</strong> KES ${data.productCost.toLocaleString()}
              </div>
              <div style="margin-bottom: 10px;">
                <strong style="color: #92400e;">Urgency:</strong> <span style="text-transform: capitalize;">${data.urgency}</span>
              </div>
              ${data.description ? `
                <div style="margin-top: 15px;">
                  <strong style="color: #92400e;">Description:</strong><br>
                  <span style="color: #78716c;">${data.description}</span>
                </div>
              ` : ''}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.jobUrl}" style="background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                View Job & Submit Bid
              </a>
            </div>
            
            <div style="background: #f0f9ff; border: 1px solid #3b82f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #1e40af;">
                <strong>💡 Tip:</strong> Submit competitive bids quickly to increase your chances of winning this project!
              </p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              Best regards,<br>
              The EVEREADY ICEP Team
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              EVEREADY ICEP - Kenya's Leading Renewable Energy Marketplace<br>
              Nairobi, Kenya | www.evereadyicep.co.ke
            </p>
          </div>
        </body>
      </html>
    `,
  },

  newBidReceived: {
    subject: '📋 New Bid Received for Your Installation Job',
    html: (data: { 
      customerName: string; 
      jobTitle: string; 
      bidAmount: number; 
      totalBids: number;
      jobUrl: string;
    }) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Bid Received</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📋 New Bid Alert!</h1>
            <p style="color: #dbeafe; margin: 10px 0 0 0; font-size: 18px;">A professional has submitted a bid for your job</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${data.customerName},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Great news! A professional has submitted a bid for your installation job. You now have more options to choose from for your project.
            </p>
            
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <h3 style="color: #1e40af; margin: 0 0 15px 0;">Bid Summary</h3>
              <div style="margin-bottom: 10px;">
                <strong style="color: #1e40af;">Project:</strong> ${data.jobTitle}
              </div>
              <div style="margin-bottom: 10px;">
                <strong style="color: #1e40af;">New Bid Amount:</strong> KES ${data.bidAmount.toLocaleString()}
              </div>
              <div style="margin-bottom: 10px;">
                <strong style="color: #1e40af;">Total Bids Received:</strong> ${data.totalBids}
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.jobUrl}" style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Review All Bids
              </a>
            </div>
            
            <div style="background: #f0fdf4; border: 1px solid #16a34a; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #15803d;">
                <strong>💡 Tip:</strong> Compare bids carefully - consider not just price, but also the professional's proposal and estimated timeline!
              </p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              Best regards,<br>
              The EVEREADY ICEP Team
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              EVEREADY ICEP - Kenya's Leading Renewable Energy Marketplace<br>
              Nairobi, Kenya | www.evereadyicep.co.ke
            </p>
          </div>
        </body>
      </html>
    `,
  },
}

// Email sending functions
export async function sendVendorApprovalEmail(
  email: string,
  name: string,
  companyName: string
) {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/vendor`
  
  const mailOptions = {
    from: `${process.env.BREVO_FROM_NAME} <${process.env.BREVO_FROM_EMAIL}>`,
    to: email,
    subject: emailTemplates.vendorApproval.subject,
    html: emailTemplates.vendorApproval.html({ name, companyName, loginUrl }),
  }

  try {
    console.log('[EMAIL] Sending vendor approval email to:', email)
    const transporter = await createTransporter()
    const result = await transporter.sendMail(mailOptions)
    console.log('[EMAIL] Vendor approval email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('[EMAIL] Error sending vendor approval email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function sendProfessionalApprovalEmail(
  email: string,
  name: string,
  companyName: string
) {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/professional`
  
  const mailOptions = {
    from: `${process.env.BREVO_FROM_NAME} <${process.env.BREVO_FROM_EMAIL}>`,
    to: email,
    subject: emailTemplates.professionalApproval.subject,
    html: emailTemplates.professionalApproval.html({ name, companyName, loginUrl }),
  }

  try {
    console.log('[EMAIL] Sending professional approval email to:', email)
    const transporter = await createTransporter()
    const result = await transporter.sendMail(mailOptions)
    console.log('[EMAIL] Professional approval email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('[EMAIL] Error sending professional approval email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function sendDeliveryApprovalEmail(
  email: string,
  name: string
) {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/delivery`
  
  const mailOptions = {
    from: `${process.env.BREVO_FROM_NAME} <${process.env.BREVO_FROM_EMAIL}>`,
    to: email,
    subject: emailTemplates.deliveryApproval.subject,
    html: emailTemplates.deliveryApproval.html({ name, loginUrl }),
  }

  try {
    console.log('[EMAIL] Sending delivery approval email to:', email)
    const transporter = await createTransporter()
    const result = await transporter.sendMail(mailOptions)
    console.log('[EMAIL] Delivery approval email sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('[EMAIL] Error sending delivery approval email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Installation job notification functions
export async function sendNewJobNotificationToProfessionals(jobData: {
  jobTitle: string;
  location: string;
  productCost: number;
  urgency: string;
  description?: string;
  jobId: string;
}) {
  try {
    // Get all approved professionals
    const { supabaseAdmin } = await import('@/lib/supabase-server')
    
    const { data: professionals, error } = await supabaseAdmin
      .from('professional_applications')
      .select('email, contact_person')
      .eq('status', 'approved')

    if (error) {
      console.error('[EMAIL] Error fetching professionals:', error)
      return { success: false, error: error.message }
    }

    if (!professionals || professionals.length === 0) {
      console.log('[EMAIL] No approved professionals found')
      return { success: true, message: 'No professionals to notify' }
    }

    const jobUrl = `${process.env.NEXT_PUBLIC_APP_URL}/professional`
    const results = []

    // Send email to each professional
    for (const professional of professionals) {
      const mailOptions = {
        from: `${process.env.BREVO_FROM_NAME} <${process.env.BREVO_FROM_EMAIL}>`,
        to: professional.email,
        subject: emailTemplates.newInstallationJob.subject,
        html: emailTemplates.newInstallationJob.html({
          professionalName: professional.contact_person || 'Professional',
          jobTitle: jobData.jobTitle,
          location: jobData.location,
          productCost: jobData.productCost,
          urgency: jobData.urgency,
          description: jobData.description,
          jobUrl: jobUrl
        }),
      }

      try {
        console.log('[EMAIL] Sending new job notification to:', professional.email)
        const transporter = await createTransporter()
        const result = await transporter.sendMail(mailOptions)
        results.push({ email: professional.email, success: true, messageId: result.messageId })
      } catch (emailError) {
        console.error('[EMAIL] Error sending to', professional.email, ':', emailError)
        results.push({ email: professional.email, success: false, error: emailError })
      }
    }

    const successCount = results.filter(r => r.success).length
    console.log(`[EMAIL] Sent new job notifications: ${successCount}/${professionals.length} successful`)
    
    return { 
      success: true, 
      message: `Notifications sent to ${successCount} professionals`,
      results 
    }
  } catch (error) {
    console.error('[EMAIL] Error in sendNewJobNotificationToProfessionals:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function sendNewBidNotificationToCustomer(bidData: {
  customerEmail: string;
  customerName: string;
  jobTitle: string;
  bidAmount: number;
  totalBids: number;
  jobId: string;
}) {
  const jobUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/installations`
  
  const mailOptions = {
    from: `${process.env.BREVO_FROM_NAME} <${process.env.BREVO_FROM_EMAIL}>`,
    to: bidData.customerEmail,
    subject: emailTemplates.newBidReceived.subject,
    html: emailTemplates.newBidReceived.html({
      customerName: bidData.customerName,
      jobTitle: bidData.jobTitle,
      bidAmount: bidData.bidAmount,
      totalBids: bidData.totalBids,
      jobUrl: jobUrl
    }),
  }

  try {
    console.log('[EMAIL] Sending new bid notification to:', bidData.customerEmail)
    const transporter = await createTransporter()
    const result = await transporter.sendMail(mailOptions)
    console.log('[EMAIL] New bid notification sent successfully:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('[EMAIL] Error sending new bid notification:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Test email function
export async function sendTestEmail(email: string) {
  const mailOptions = {
    from: `${process.env.BREVO_FROM_NAME} <${process.env.BREVO_FROM_EMAIL}>`,
    to: email,
    subject: 'Test Email from EVEREADY ICEP',
    html: `
      <h1>Test Email</h1>
      <p>This is a test email from EVEREADY ICEP to verify email configuration.</p>
      <p>If you received this email, the email service is working correctly!</p>
    `,
  }

  try {
    const transporter = await createTransporter()
    const result = await transporter.sendMail(mailOptions)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
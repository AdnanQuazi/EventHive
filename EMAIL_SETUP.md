# Email Configuration Guide

## Overview
After successful event registration, attendees receive a confirmation email with their QR code for check-in.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install nodemailer
npm install -D @types/nodemailer
```

### 2. Configure Email Service

Add these environment variables to your `.env.local` file:

```env
# Gmail/SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
```

**Note**: The `SMTP_PASSWORD` should be your 16-character **App Password** (not your regular Gmail password)

### 3. Gmail App Password

Since you're using Gmail, you need an **App Password** (the one you already have):

- ✅ **SMTP_PASSWORD**: `wymm jlao lutl zfkn` (use exactly as provided)
- ✅ **SMTP_USER**: `pawarathrava24@gmail.com`
- ✅ **SMTP_HOST**: `smtp.gmail.com`
- ✅ **SMTP_PORT**: `587`

These settings are already configured in your `.env.local` file.

## Files Created/Modified

### New Files:
- **`lib/services/email.ts`** - Email service with nodemailer configuration
  - `sendRegistrationEmail()` - Sends confirmation with QR code
  - `sendTestEmail()` - Test endpoint for debugging

### Modified Files:
- **`lib/actions/registrations.ts`** - Updated to send email after registration
  - Imports the email service
  - Fetches event and user details
  - Sends email with QR code inline attachment

## Email Features

✅ **QR Code Attachment** - Embedded as inline image in email  
✅ **Event Details** - Shows event title, date, venue  
✅ **Responsive HTML** - Works on mobile and desktop  
✅ **Professional Design** - Branded with company colors  
✅ **Check-in Instructions** - Guides attendees how to use QR code  

## Testing

### Send a Test Email
You can test email configuration by calling this function directly (create an admin endpoint or use a test script):

```typescript
import { sendTestEmail } from "@/lib/services/email";

const result = await sendTestEmail("your-test-email@example.com");
```

### Troubleshooting

**Email not sending?**
- Check console logs for error messages
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are correct
- Ensure environment variables are loaded (restart dev server)
- Check email provider's security settings

**QR code not appearing in email?**
- Verify QR code generation is working
- Some email clients may block inline images by default
- QR code is also available in user's profile dashboard as fallback

**Registration succeeds but email fails?**
- This is intentional - registration completes successfully even if email fails
- Users can still access QR code from their profile
- Check logs and attempt to resend if needed

## Future Enhancements

- [ ] Resend email functionality
- [ ] Email templates in database
- [ ] Multiple recipient types (organizers, volunteers)
- [ ] Email scheduling
- [ ] Unsubscribe management
- [ ] Email analytics tracking

## Security Notes

- Never commit `.env.local` with real credentials
- Use `.env.example` for documenting required variables
- Consider using environment management tools for production
- Rotate email passwords regularly
- Use separate email accounts for different environments (dev/staging/prod)

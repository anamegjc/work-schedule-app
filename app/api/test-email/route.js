import { sendScheduleRequestEmail } from '@/utils/sendgrid';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await sendScheduleRequestEmail(
      process.env.SENDGRID_FROM_EMAIL, // sending to yourself for testing
      'Test Manager',
      'Test Office'
    );
    
    return NextResponse.json({ 
      message: 'Test email sent successfully' 
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { 
      status: 500 
    });
  }
}
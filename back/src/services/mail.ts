interface SendVerificationEmailOptions {
  email: string
  token: string
}

export async function sendVerificationEmail({
  email,
  token,
}: SendVerificationEmailOptions): Promise<void> {
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000'

  const verificationUrl = `${frontendUrl}/#/verify-email?token=${encodeURIComponent(token)}`

  console.log('\n========================================')
  console.log('📧 Mock Email Verification')
  console.log(`To: ${email}`)
  console.log(`Verification URL:`)
  console.log(verificationUrl)
  console.log('========================================\n')
}

interface SendVerificationEmailOptions {
  email: string
  token: string
}

interface SendPasswordResetEmailOptions {
  email: string
  token: string
}

function getFrontendUrl(): string {
  return process.env.FRONTEND_URL ?? 'http://localhost:3000'
}

export async function sendVerificationEmail({
  email,
  token,
}: SendVerificationEmailOptions): Promise<void> {
  const frontendUrl = getFrontendUrl()

  const verificationUrl = `${frontendUrl}/#/verify-email?token=${encodeURIComponent(token)}`

  console.log('\n========================================')
  console.log('📧 Mock Email Verification')
  console.log(`To: ${email}`)
  console.log('Verification URL:')
  console.log(verificationUrl)
  console.log('========================================\n')
}

export async function sendPasswordResetEmail({
  email,
  token,
}: SendPasswordResetEmailOptions): Promise<void> {
  const frontendUrl = getFrontendUrl()

  const resetUrl = `${frontendUrl}/#/reset-password?token=${encodeURIComponent(token)}`

  console.log('\n========================================')
  console.log('🔐 Mock Password Reset Email')
  console.log(`To: ${email}`)
  console.log('Reset Password URL:')
  console.log(resetUrl)
  console.log('========================================\n')
}

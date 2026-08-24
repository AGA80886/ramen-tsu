# Future Enhancements

以下功能刻意不納入目前 MVP Release 範圍。

## 1. Payment

目前已完成 Order Foundation：

```text
status = pending
paymentStatus = unpaid
```

未來規劃：

- Credit Card
- Bank Transfer
- Third-party Payment Gateway
- Payment Callback / Webhook
- Payment failure / retry
- **付款成功後才正式成立訂單**

## 2. Inventory / Stock Management

- Product stock
- Stock reservation
- Overselling prevention
- Low-stock notification
- Inventory history
- Order cancellation stock recovery

## 3. Real Member Email Verification

目前完成的是 **Email Verification Foundation**。

既有基礎包含 Token / Verification URL / API / Status flow；實際正式會員驗證信寄送仍未納入目前 MVP。

未來規劃：

- SMTP / Mail Service
- Production mail provider
- Real verification email delivery
- Send failure handling
- Resend verification email
- Token expiration
- Email template
- Production domain verification URL

## 4. Admin Safety

- Prevent final administrator removal
- Prevent unsafe self-demotion
- Member suspension / reactivation
- Advanced member status

## 5. Testing / CI

- Unit testing
- Integration testing
- E2E testing
- Automated security scanning
- Deployment verification
- Staging environment

## 6. Performance

- Frontend code splitting
- Lazy loading
- Bundle optimization
- Image optimization
- API caching
- CDN / custom domain

## 7. Observability

- Structured logging
- Sentry / Error tracking
- Uptime monitoring
- Audit logs
- Admin action history

## 8. Product / Community Features

- Advanced search / filtering
- Notifications
- Recommendation system
- More advanced map filters
- Enhanced member reputation / community system

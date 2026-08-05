import { Schema, model, Types } from 'mongoose'

export interface EmailVerificationTokenDocument {
  user: Types.ObjectId
  tokenHash: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

const emailVerificationTokenSchema = new Schema<EmailVerificationTokenDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: {
        expires: 0,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

export default model<EmailVerificationTokenDocument>(
  'emailVerificationTokens',
  emailVerificationTokenSchema,
)

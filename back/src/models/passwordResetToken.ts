import { Schema, model, Types } from 'mongoose'

export interface PasswordResetTokenDocument {
  user: Types.ObjectId
  tokenHash: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

const passwordResetTokenSchema = new Schema<PasswordResetTokenDocument>(
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

export default model<PasswordResetTokenDocument>('passwordResetTokens', passwordResetTokenSchema)

import mongoose, { Schema, Model } from "mongoose";

export type PaymentStatus =
  | "pending"
  | "success"
  | "failed"
  | "cancelled";

export interface IPayment {
  user: mongoose.Types.ObjectId;
  tutor: mongoose.Types.ObjectId;

  amount: number;
  currency: string;

  transactionId: string;
  gatewayTransactionId?: string;

  paymentStatus: PaymentStatus;

  subscriptionDuration: number;

  createdAt?: Date;
  updatedAt?: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tutor: {
      type: Schema.Types.ObjectId,
      ref: "Tutor",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      default: 500,
    },

    currency: {
      type: String,
      default: "BDT",
    },

    transactionId: {
      type: String,
      required: true,
      unique: true,
    },

    gatewayTransactionId: String,

    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed", "cancelled"],
      default: "pending",
    },

    subscriptionDuration: {
      type: Number,
      default: 30,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Payment: Model<IPayment> =
  mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;
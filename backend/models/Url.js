const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
  {
    visitedAt: {
      type: Date,
      default: Date.now,
    },
    browser: {
      type: String,
      default: "Unknown",
    },
    os: {
      type: String,
      default: "Unknown",
    },
    deviceType: {
      type: String,
      default: "Desktop",
    },
    referrer: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const urlSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalUrl: {
      type: String,
      required: true,
      trim: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    lastVisitedAt: {
      type: Date,
      default: null,
    },
    visits: {
      type: [visitSchema],
      default: [],
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    expirationDays: {
      type: Number,
      default: null,
    },
    isExpired: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Url", urlSchema);

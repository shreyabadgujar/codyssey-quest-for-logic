const { Schema, model } = require("mongoose");
// The built-in unique _id serializes requests across API processes, not just one Node worker.
module.exports = model("SubmissionLease", new Schema({
  _id: { type: Schema.Types.ObjectId, ref: "User" },
  owner: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}));

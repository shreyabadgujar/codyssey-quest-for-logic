const { Schema, model } = require("mongoose");

const testCase = new Schema({ input: String, expectedOutput: String, explanation: String }, { _id: false });

const missionSchema = new Schema({
  island: { type: Schema.Types.ObjectId, ref: "Island", required: true },
  level: { type: Number, required: true, min: 1 }, // contiguous from 1 within an island
  title: { type: String, required: true },
  slug: { type: String, index: true },
  stage: String,
  introduction: String,
  inputFormat: String,
  outputFormat: String,
  constraints: String,
  hints: [String],
  editorial: { type: new Schema({ explanation: String, timeComplexity: String, spaceComplexity: String }, { _id: false }), select: false },
  difficulty: { type: String, enum: ["apprentice", "journeyman", "master"], required: true },
  description: { type: String, required: true }, // mystery + problem statement
  starterCode: { c: String, cpp: String, python: String, java: String },
  sampleTestCases: [testCase],
  // Hidden tests must never be returned to clients.
  hiddenTestCases: { type: [testCase], select: false },
  storyClue: { type: String, required: true, select: false }, // revealed only after completion
  hiddenObject: { type: new Schema({ name: String, asset: String, position: { x: Number, y: Number } }, { _id: false }), select: false },
  validator: { type: String, enum: ["exact", "unorderedLines"], default: "exact", select: false },
  executionLimits: { type: new Schema({ cpu: Number, wall: Number, memory: Number }, { _id: false }), select: false },
  referenceSolutions: { type: new Schema({ c: String, cpp: String, python: String, java: String }, { _id: false }), select: false },
  validation: { type: new Schema({ fingerprint: String, languages: [String], validatedAt: Date }, { _id: false }), select: false },
  xpReward: { type: Number, required: true, min: 0 },
  coinReward: { type: Number, required: true, min: 0 },
});
missionSchema.index({ island: 1, level: 1 }, { unique: true });

module.exports = model("Mission", missionSchema);

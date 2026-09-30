const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: '',
    },

    topics: {
      type: [String],
      default: [],
    },

    date: {
      type: Date,
      required: true,
    },

    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    status: {
      type: String,
      enum: ['upcoming', 'completed'],
      default: 'upcoming',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Exam', examSchema);
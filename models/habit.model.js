// models/habit.model.js
const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  name: String,
  tracking: [{
    day: { type: Date, default: Date.now },
    status: { type: String, enum: ['Done', 'Not done', 'None'], default: 'None' },
  }],
});

habitSchema.methods.updateStatusForDay = function (day, status) {
  const trackingEntry = this.tracking.find(entry => entry.day.toDateString() === day.toDateString());
  if (trackingEntry) {
    trackingEntry.status = status;
  } else {
    this.tracking.push({ day, status });
  }
};

const Habit = mongoose.model('Habit', habitSchema);

module.exports = Habit;

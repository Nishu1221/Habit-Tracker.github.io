const express = require('express');
const mongoose = require('mongoose');
const Habit = require('./models/habit.model');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost/habit-tracker', { useNewUrlParser: true, useUnifiedTopology: true });

// Homepage route
app.get('/', async (req, res) => {
  try {
    const habits = await Habit.find();
    res.render('index', { habits });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching habits');
  }
});

// Add Habit routes
app.get('/habits/add', (req, res) => {
  res.render('add-habit');
});

app.post('/habits/add', async (req, res) => {
  const { habitName } = req.body;

  try {
    const newHabit = new Habit({ name: habitName });
    await newHabit.save();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding habit');
  }
});

// Track Habit status route for today
app.post('/habits/track/:habitId', async (req, res) => {
  const { habitId } = req.params;
  const { status } = req.body;

  try {
    const habit = await Habit.findById(habitId);
    if (habit) {
      habit.updateStatusForDay(new Date(), status);
      await habit.save();
      res.redirect('/');
    } else {
      res.status(404).send('Habit not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error tracking habit status');
  }
});

// Track Habit status for a specific day route
app.post('/habits/track/:habitId/:day', async (req, res) => {
  const { habitId, day } = req.params;
  const { status } = req.body;

  try {
    const habit = await Habit.findById(habitId);
    if (habit) {
      const selectedDay = new Date(day);
      habit.updateStatusForDay(selectedDay, status);
      await habit.save();
      res.redirect('/');
    } else {
      res.status(404).send('Habit not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error tracking habit status for a specific day');
  }
});

// Delete Habit route
app.post('/habits/delete/:habitId', async (req, res) => {
  const { habitId } = req.params;

  try {
    await Habit.findByIdAndDelete(habitId);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting habit');
  }
});

// Week View for a specific habit
app.get('/habits/week-view/:habitId', async (req, res) => {
  const { habitId } = req.params;

  try {
    const habit = await Habit.findById(habitId);
    if (habit) {
      res.render('week-view', { habit });
    } else {
      res.status(404).send('Habit not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching habit for week view');
  }
});

// 404 Route
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

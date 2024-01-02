require('dotenv').config()


const mongoose = require("mongoose");
const findOrCreate = require('mongoose-findorcreate');
const passportLocalMongoose = require('passport-local-mongoose');


const mongopw = process.env.MONGOPW;

mongoose.connect(`mongodb+srv://sbiswas7:${mongopw}@cluster0.mtk5ama.mongodb.net/userDB`, { useNewUrlParser: true });

const db = mongoose.connection;



db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("MongoDB database connection established successfully");
});

const userSchema = new mongoose.Schema({
    // email: {type: String, unique: true, sparse: true},
    password: String,
    name: String,
    age: Number,
    height: Number,
    weight: Number,
    allergy: [String],
    activity: String,
    gender: String,
    googleId: String,
    preference: String,
    goal: String,
    maintenance: Number,
    recipeHistory: {
      type: [[String]],
      default: []
    },
    favorites: {
      type: [[String]],
      default: []
    },
    weightUnit: {
      type: String,
      default: "lbs"
    }
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model('User', userSchema);

module.exports = {User};
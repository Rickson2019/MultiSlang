const mongoose = require('mongoose');

//creates a UserSchema for mongoDB using mongoose
const UserSchema = mongoose.Schema({
  //for login purposes
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },

  //user info (optional)
  firstname: String,
  lastname: String,
  phoneno: String,

  // default: defaultUserTask
  announcer: { type: String, required: true, default: "thomas" },
  
  //The words the user has passed
  passed: { type: [String], default: [] },
  favorite: { type: [String], default: [] },
  
  tracker:{ type: Object, default: {essential_french:0}}
 
});


// UserSchema.index({username: 1, email: 1}, {unique: true, sparse: true})

//MAKE USER GLOBAL
var User = mongoose.model('User', UserSchema);
module.exports = User;

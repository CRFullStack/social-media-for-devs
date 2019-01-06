const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

// Load input validation
const validateRegisterInput = require("../../validation/register");

// Load user model
const User = require("../../models/User");

router.get("/test", (req, res) =>
  res.json({
    msg: "Users Works"
  })
);
//@route Get ap/users/register
//@desc sign up user if email doens't exist
//@access Public

router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  //check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = "Email already exist";
      return res.status(400).json({ errors });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200",
        r: "pg",
        d: "mm"
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar: avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

//@route Get api/users/login
//@desc Login User / return JWT
//@access Public

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email }).then(user => {
    // Check for user
    if (!user) {
      return res.status(404).json({ email: "User not found" });
    }
    // Check password
    bcrypt
      .compare(password, user.password)
      // isMatch returns true/false
      .then(isMatch => {
        if (isMatch) {
          // User Matched

          // JWT payload
          const payload = {
            id: user.id,
            name: user.name,
            avatar: user.avatar
          };
          // Sign token
          jwt.sign(
            payload,
            keys.secretOrKey,
            { expiresIn: 3600 },
            //callback function
            (err, token) => {
              res.json({
                success: true,
                resToken: "Bearer " + token // <-- token from cb function
              });
            }
          );
        } else {
          res.status(404).json({ password: "Password incorrect" });
        }
      });
  });
});

//@route Get api/users/current
//@desc return current user
//@access Private

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json(req.user);
  }
);

module.exports = router;

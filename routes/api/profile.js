const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load profile model
const Profile = require("../../models/Profile");
// Load user model
const Users = require("../../models/User");

router.get("/test", (req, res) =>
  res.json({
    msg: "Profile Works"
  })
);

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // if we can't find the user, send the errors
        if (!profile) {
          errors.noprofile = "Can't find this profile";
          return res.status(400).json(errors);
        }

        // if user is found, respond with the profile
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

module.exports = router;

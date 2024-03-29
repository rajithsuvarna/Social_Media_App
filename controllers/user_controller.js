const user = require("../models/user");
const fs = require("fs");
const path = require("path");
module.exports.profile = function (req, res) {
  user.findById(req.params.id).then((user) => {
    return res.render("userprofile", {
      title: "User Profile",
      profile_user: user,
    });
  });
};
module.exports.update = async function (req, res) {
  /*if (req.params.id == req.user.id) {
    user.findByIdAndUpdate(req.params.id, req.body).then(() => {
      req.flash("success", "Profile updated");
      return res.redirect("back");
    });
  } else {
    req.flash("error", "unauthorized");
    return res.status(404).send("unauthorized");
  }
};*/
  if (req.params.id == req.user.id) {
    try {
      let User = await user.findById(req.params.id);
      user.uploadedAvatar(req, res, function (err) {
        if (err) {
          console.log("*****multer Error:", err);
        }
        User.name = req.body.name;
        User.email = req.body.email;

        if (req.file) {
          if (User.avatar) {
            fs.unlinkSync(path.join(__dirname, "..", User.avatar));
          }
          User.avatar = user.avatarPath + "/" + req.file.filename;
        }
        User.save();
        return res.redirect("back");
      });
    } catch (err) {
      req.flash("error", err);
      return res.redirect("back");
    }
  } else {
    req.flash("error", "unauthorized");
    return res.status(401).send("unauthorized");
  }
};

module.exports.signUp = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/profile");
  }
  return res.render("user_signUp", { title: "Codial:SignUP" });
};

module.exports.signIn = function (req, res) {
  return res.render("user_signIn", { title: "Codial:SignIn" });
};

module.exports.Create = function (req, res) {
  if (req.body.password != req.body.confirmpassword) {
    req.flash("error", "Password mismatch");
    return res.redirect("back");
  }
  user
    .findOne({ email: req.body.email })
    .then((newUser) => {
      if (!newUser) {
        user
          .create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
          })
          .then(() => {
            req.flash("success", "Signup successful");
            return res.redirect("/users/signin");
          })
          .catch((err) => {
            req.flash("error", err);
            console.log("Error: while creating user", err);
            return;
          });
      } else {
        req.flash("error", "User already exist");
        return res.redirect("back");
      }
    })
    .catch((err) => {
      if (err) {
        req.flash("error", err);
        console.log("Error:", err);
        return;
      }
    });
};
module.exports.createSession = function (req, res) {
  req.flash("success", "Logged in Successfully");
  return res.redirect("/");
};

module.exports.destroySession = function (req, res) {
  req.logout(function (err) {
    if (err) {
      req.flash("error", err);
      console.log("Error:while signout ");
      return;
    }
    req.flash("success", "Logged out Successfully");
    return res.redirect("/");
  });
};

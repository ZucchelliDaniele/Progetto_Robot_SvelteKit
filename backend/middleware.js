const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const app = express();

class Code {
  #hashedcode;
  constructor(hashedcode) {
    this.#hashedcode = hashedcode;
  }
  get hashedcode() {
    return this.#hashedcode;
  }
}

let users = [];

// Function to load users from hashedToken.json file
function loadUsers() {
    fs.readFile("hashedToken.json", "utf8", (err, data) => {
      if (err) {
        console.error("Error reading hashedToken.json:", err);
        return;
      }
  
      try {
        const userData = JSON.parse(data);
        if (!Array.isArray(userData)) {
          throw new Error("Invalid data format: Not an array");
        }
        users = userData.map((item) => new Code(item.hashedToken));
        console.log("Users reloaded:", users);
      } catch (error) {
        console.error("Error parsing hashedToken.json:", error);
      }
    });
  }
  

// Initial load of users
loadUsers();

// Watch for changes in hashedToken.json file
fs.watch("hashedToken.json", (eventType, filename) => {
  console.log(`File ${filename} changed. Reloading users...`);
  loadUsers();
});

// Middleware setup
app.use(
  session({
    secret: "ambarabaccicicicoco",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(cookieParser());

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.hashedcode) {
    next();
  } else {
    res.redirect("/pair");
  }
};

function isUserExist(hashedcode) {
  for (let i = 0; i < users.length; i++) {
    if (users[i].hashedcode === hashedcode) {
      return true;
    }
  }
  return false;
}

app.post("/pair", express.urlencoded({ extended: true }), (req, res) => {
  const { hashedcode } = req.body;
  console.log(hashedcode)
  // Check if the provided credentials are valid
  if (isUserExist(hashedcode)) {
    // Store user data in the session
    req.session.hashedcode = hashedcode;
    res.cookie("sessionId", req.sessionID);
    res.redirect("http://192.168.1.14:5173");
  } else {
    res.send("Invalid credentials. Please try again.");
  }
});

app.get("/profile", isAuthenticated, (req, res) => {
  // Retrieve user data from the session
  console.log(req.session);
  const userData = req.session;
  res.send(`Welcome, ${userData.hashedcode}!
<a href="/logout">Logout</a>`);
});

app.get("/logout", (req, res) => {
  // Destroy the session and redirect to the login page
  req.session.destroy(() => {
    res.clearCookie("sessionId");
    res.redirect("/");
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

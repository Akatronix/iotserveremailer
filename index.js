// Import necessary modules
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS

// Server port
const port = process.env.PORT || 8000;

// Initialize variables
let gasValue = 0;
let toggle = "OFF";
let emailSent = false;
let emailHolder="no email yet";

/**
 * Send an email using Nodemailer
 * @param {string} to - Recipient's email address
 * @param {string} subject - Subject of the email
 * @param {string} text - Plain text body of the email
 * @param {string} [html] - HTML body of the email (optional)
 * @returns {Promise} - A Promise that resolves if the email is sent successfully, and rejects otherwise
 */
function sendEmail(to, subject, text, html = "") {
  return new Promise((resolve, reject) => {
    // Create a transporter object
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user:"yemitella32@gmail.com",
        pass: "efotyasyuvpetysa",
      },
    });

    // Define email options
    const mailOptions = {
      from: "yemitella32@gmail.com",
      to: to,
      subject: subject,
      text: text,
      html: html,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        emailHolder=`Error sending email ${error}`;
        console.error("Error occurred:", error);
        reject(error); // Reject the promise if there's an error
      } else {
        emailHolder="Email sent 200k";
        console.log("Email sent:", info.response);
        resolve(info); // Resolve the promise if email is sent successfully
      }
    });
  });
}

/**
 * Try to send an email, retrying if it fails
 * @param {string} to - Recipient's email address
 * @param {string} subject - Subject of the email
 * @param {string} text - Plain text body of the email
 * @param {string} [html] - HTML body of the email (optional)
 */
async function trySendEmail(to, subject, text, html = "") {
  let retries = 3;
  while (retries > 0) {
    try {
      await sendEmail(to, subject, text, html);
      emailSent = true;
      break; // Exit the loop if email is sent successfully
    } catch (error) {
      retries -= 1;
      console.error(`Retrying... (${3 - retries} attempt(s) failed)`);
      if (retries === 0) {
        console.error("Failed to send email after 3 attempts.");
      }
    }
  }
}

// Routes

// Home route
app.get("/", (req, res) => {
  res.status(200).send("<h1>Welcome to Ak@tronix</h1>");
});

// Handle incoming gas readings
app.post("/message", (req, res) => {
  const { gas } = req.body;
  gasValue = gas;

  // Check if gas level is below 500 and reset the emailSent flag
  if (gasValue <= 500) {
    emailSent = false;
  }

  // Check if gas level exceeds 500 and if email hasn't been sent yet
  if (gasValue > 500 && !emailSent) {
    trySendEmail(
      "yemiabisoye00@gmail.com", // Replace with recipient's email
      "Gas Level Alert",
      `Alert: The Gas Level Has Exceeded 500. Current Gas Level: ${gasValue}`
    );
  }

  res.status(200).json({ gas: gasValue, toggle: toggle,email:emailHolder});
});

// Return current gas level and toggle state
app.get("/message", (req, res) => {
  res.status(200).json({ gas: gasValue, toggle: toggle });
});

// Control the toggle state
app.post("/control", (req, res) => {
  const { control } = req.body;

  if (control === "OFF") {
    toggle = "OFF";
  } else if (control === "ON") {
    toggle = "ON";
  }

  res.status(200).json({ gas: gasValue, toggle: toggle });
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}...`);
});

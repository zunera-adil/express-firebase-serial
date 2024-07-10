const express = require("express");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const admin = require("firebase-admin");
const serviceAccount = require("./google-service"); // Path to your Firebase Admin SDK JSON
const morgan = require("morgan");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Initialize Firestore (or other Firebase services as needed)
const db = admin.firestore();

// Create Express app
const app = express();
const port = 3000; // Choose your desired port number

// Serial Port configuration
const serialPort = new SerialPort({
  path: "/dev/tty.usbserial-14130",
  baudRate: 115200,
});
const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\r\n" }));

const sensorId = "latest";

const minOriginal = 400;
const maxOriginal = 4050;
const minScaled = 0;
const maxScaled = 100;

function scaleValue(originalValue) {
  // Scale the original value to a 0-100 range
  const scaledValue =
    maxScaled -
    ((originalValue - minOriginal) / (maxOriginal - minOriginal)) * maxScaled;

  return scaledValue;
}

// Function to send push notification
const sendPushNotification = async (message, token) => {
  const notification = {
    notification: {
      title: "Moisture Alert",
      body: message,
    },
    token: token, // Use the device token
  };

  try {
    const response = await admin.messaging().send(notification);
    console.log("Successfully sent message:", response);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

// Variable to track the time of the last notification
let lastNotificationTime = 0;

// Handle incoming data from Arduino
parser.on("data", async (data) => {
  const trimmedData = data.trim();
  const sensorValue = parseInt((trimmedData.match(/\d+/) || [NaN])[0], 10);

  // Filter to skip unwanted strings and process only numeric values
  if (!isNaN(sensorValue) && sensorValue !== "") {
    const scaledValue = scaleValue(sensorValue);
    try {
      const docRef = db.collection("sensorData").doc(sensorId); // Use a fixed document ID to update the same document
      await docRef.set({
        value: scaledValue,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(
        "Sensor data updated in Firestore, sensor-id: ",
        sensorId,
        " scaled value: ",
        scaledValue,
        " sensor value: ",
        sensorValue
      );

      // Send push notification if moisture level is below 50% and if 30 minutes have passed since the last notification
      const currentTime = Date.now();
      if (
        scaledValue < 50 &&
        currentTime - lastNotificationTime > 30 * 60 * 1000
      ) {
        const tokenDoc = await db.collection("tokens").doc("deviceToken").get();
        const token = tokenDoc.data().token;
        await sendPushNotification(
          `Moisture level is down to ${scaledValue}%.`,
          token
        );
        lastNotificationTime = currentTime; // Update the last notification time
      }
    } catch (error) {
      console.error("Error saving to Firestore:", error);
    }
  }
});

// Error handling for serial port
serialPort.on("error", (err) => {
  console.error("Error with serial port:", err.message);
});

// Middleware to parse JSON bodies
app.use(express.json());
app.use(morgan("tiny"));

// Route to save the device token
app.post("/api/saveToken", async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }
  try {
    await db.collection("tokens").doc("deviceToken").set({ token });
    res.status(200).json({ message: "Token saved successfully" });
  } catch (error) {
    console.error("Error saving token:", error);
    res.status(500).json({ error: "Failed to save token" });
  }
});

// Route to get the latest sensor data
app.get("/api/sensorData", async (req, res) => {
  try {
    const doc = await db.collection("sensorData").doc("latest").get();
    if (!doc.exists) {
      return res.status(404).json({ error: "No sensor data found" });
    }
    res.json(doc.data());
  } catch (error) {
    console.error("Error retrieving sensor data:", error);
    res.status(500).json({ error: "Failed to retrieve sensor data" });
  }
});

// Example route to verify server is running
app.get("/", (req, res) => {
  res.send("Hello World! This is your Express server.");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

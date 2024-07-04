const express = require("express");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const admin = require("firebase-admin");
const serviceAccount = require("./google-service"); // Path to your Firebase Admin SDK JSON
var morgan = require("morgan");
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
const serialPort = new SerialPort({ path: "/dev/tty.usbserial-14130", baudRate: 115200 });
const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\r\n" }));

const sensorId = "latest"

const minOriginal = 400
const maxOriginal = 4050
const minScaled = 0
const maxScaled = 100

function scaleValue(originalValue) {
  // Scale the original value to a 0-100 range
  const scaledValue =
     maxScaled -
     ((originalValue - minOriginal) / (maxOriginal - minOriginal)) * maxScaled

  return scaledValue
}

// Handle incoming data from Arduino
parser.on("data", async (data) => {
  const trimmedData = data.trim();
  // console.log("Received from Arduino:", trimmedData);
  const sensorValue = parseInt((trimmedData.match(/\d+/) || [NaN])[0], 10);
  

  // Filter to skip unwanted strings and process only numeric values
  if (!isNaN(sensorValue) && sensorValue !== "") {
    const scaledValue = scaleValue(sensorValue)
    try {
      const docRef = db.collection("sensorData").doc(sensorId); // Use a fixed document ID to update the same document
      await docRef.set({
        value: scaledValue,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log("Sensor data updated in Firestore, sensor-id: ", sensorId, " scaled value: ", scaledValue, " sensor value: ", sensorValue);
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

# Moisture Sensor Monitoring with Firebase Push Notifications

This project monitors soil moisture levels using an ESP32 connected to a moisture sensor. The sensor data is read by an Express server and stored in Firebase Firestore. If the moisture level falls below a defined threshold, a push notification is sent to the user.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [License](#license)

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed
- Firebase account with a project set up
- Firebase Admin SDK JSON file
- ESP32 with a moisture sensor connected

## Installation

1. Clone the repository:

```bash
git clone https://github.com/umerrauf6/express-firebase-serial
cd express-firebase-serial
```

2. Install the dependencies:

```bash
npm install
```

3. Create a `.env` file to store environment variables (optional):

```bash
touch .env
```

4. Add the following content to `.env` (if using environment variables):

```plaintext
FIREBASE_ADMIN_SDK_PATH=./path-to-your-firebase-adminsdk.json
SERIAL_PORT=/dev/tty.usbserial-14130
BAUD_RATE=115200
```

## Configuration

1. Place your Firebase Admin SDK JSON file in the project directory and update the path in the code:

```javascript
const serviceAccount = require("./google-service.json"); // Update the path as needed
```

2. Update the serial port path and baud rate in the code if necessary:

```javascript
const serialPort = new SerialPort({
  path: "/dev/tty.usbserial-14130",
  baudRate: 115200,
});
```

3. Update the Firebase configuration in your client application (web, Android, or iOS) with your project's details.

## Usage

1. Start the Express server:

```bash
nodemon start
```

2. The server will start running on `http://localhost:3000`.

3. Connect your ESP32 to the moisture sensor and ensure it is correctly sending data to the serial port.

4. Open your client application (web, Android, or iOS) to get the device token and send it to the server.

## API Endpoints

### Save Device Token

- **URL**: `/api/saveToken`
- **Method**: `POST`
- **Description**: Saves the device token for push notifications.
- **Body**:
  ```json
  {
    "token": "device-token"
  }
  ```

### Get Latest Sensor Data

- **URL**: `/api/sensorData`
- **Method**: `GET`
- **Description**: Retrieves the latest sensor data from Firestore.

### Example Route

- **URL**: `/`
- **Method**: `GET`
- **Description**: Example route to verify the server is running.

## How It Works

1. The ESP32 reads the soil moisture level and sends the data to the serial port.
2. The Express server reads the data from the serial port, scales it to a percentage, and stores it in Firebase Firestore.
3. If the moisture level falls below 50%, the server sends a push notification to the user's device using Firebase Cloud Messaging (FCM).

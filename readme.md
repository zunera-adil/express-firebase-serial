# Soil Moisture Sensor with Firebase and Express

This project connects a soil moisture sensor to an Arduino, reads data from the sensor, and sends it to a Firebase Firestore database using an Express server. The server provides an API to retrieve the latest sensor data.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [License](#license)

## Installation

### Prerequisites

- Node.js and npm installed
- Arduino with a soil moisture sensor connected
- CH340 driver installed (if your Arduino uses the CH340 USB-to-serial chip). You can download and install the driver from [here](https://learn.sparkfun.com/tutorials/how-to-install-ch340-drivers/all).
- Firebase project setup with Firestore enabled
- Firebase Admin SDK JSON file for your Firebase project

### Steps

1. Clone this repository:

   ```bash
   git clone https://github.com/your-repo/soil-moisture-sensor.git
   cd soil-moisture-sensor
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Place your Firebase Admin SDK JSON file in the project directory and update the path in the code:
   ```javascript
   const serviceAccount = require("./path-to-your-firebase-adminsdk.json");
   ```

## Configuration

### Firebase

Make sure you have a Firebase project set up with Firestore enabled. Download the Admin SDK JSON file from your Firebase project settings and place it in the project directory.

### Arduino

Ensure that your Arduino is connected to the soil moisture sensor and that it is sending data to the specified serial port (e.g., `COM3`) at the baud rate of `115200`.

## Running the Application

1. Connect your Arduino to your computer.

2. Start the Express server:

   ```bash
   nodemon start
   ```

3. The server will be running at `http://localhost:3000`.

## API Endpoints

### Get Latest Sensor Data

- **Endpoint**: `/api/sensorData`
- **Method**: GET
- **Description**: Retrieves the latest sensor data from Firestore.
- **Response**:
  ```json
  {
    "value": 1217,
    "timestamp": "2023-06-25T13:30:00Z"
  }
  ```

## License

This project is licensed under the MIT License.

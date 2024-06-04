// real-time button
function fetchLatestFileAndFolder() {
    fetch("/latestFileInLatestFolder") // Endpoint to fetch the latest file and folder from the server
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Handle the response from the server
        console.log("Received data from server:", data); // Log the received data
        update_map_real_time(data);
      })
      .catch((error) => {
        console.error("Error fetching latest file and folder:", error);
      });
  }

  // Fetch the latest time stamp from the file

  function fetchLatestTimeStamp() {
    fetch("/latestFile") // Endpoint to fetch the latest file and folder from the server
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((data) => {
        // Handle the response from the server
        console.log("Received data from server!!!!:", data); // Log the received data
        updateDate(data);
      })
      .catch((error) => {
        console.error("Error fetching latest file and folder:", error);
      });
  }

  // fetchLatestFileAndFolder();

  function updateDate(timestamp) {
    const currentDateElement = document.getElementById("currentDate");
    currentDateElement.textContent =
      "Semi-Real-Time Traffic : " + timestamp;
  }

  let intervalId; // Variable to store the interval ID

  // startPythonScript.js

document.addEventListener('DOMContentLoaded', function() {
  fetch('/start-python-script', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      // No need to send any data in the request body
  })
  .then(response => {
      if (response.ok) {
          console.log('Python script started successfully!!!!!');
      } else {
          console.error('Failed to start Python script:', response.statusText);
      }
  })
  .catch(error => {
      console.error('Error starting Python script:', error);
  });
});



  //initial fetch of the latest file
  fetchLatestFileAndFolder();
  setInterval(fetchLatestFileAndFolder, 2 * 60 * 1000); // 5 minutes in milliseconds

  //initial call for the date container
  const currentDate = new Date();
  const options = { year: "numeric", month: "long", day: "numeric" };
  const formattedDate = currentDate.toLocaleDateString("en-US", options);
  updateDate(formattedDate);

  setInterval(fetchLatestTimeStamp, 2 * 60 * 1000); //for updating the date container

  // Function to update the map with GeoJSON data
  function update_map_real_time(geojsonData) {
    console.log("$$$", geojsonData);
    if (!map.getSource("traffic_data")) {
      map.addSource("traffic_data", {
        type: "geojson",
        data: geojsonData,
      });
      map.addLayer({
        id: "traffic_data",
        type: "line",
        source: "traffic_data",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": [
            "interpolate",
            ["linear"],
            ["get", "jam_factor"],
            0,
            "rgb(0, 128, 0)", // Green
            1,
            "rgb(255, 255, 0)", // Yellow
            2,
            "rgb(255, 210, 0)",
            3,
            "rgb(255, 165, 0)", // Orange
            4,
            "rgb(255, 100, 0)",
            5,
            "rgb(255, 0, 0)", // Red
            6,
            "rgb(200, 0, 0)",
            7,
            "rgb(150, 0, 0)",
            8,
            "rgb(128, 0, 0)", // Dark red
            9,
            "rgb(64, 0, 0)",
            10,
            "rgb(0, 0, 0)", // Black
          ],
          "line-width": 2.5,
        },
      });
      console.log("YESSIRR");
    } else {
      map.getSource("traffic_data").setData(geojsonData);
      console.log("$YESSIRR");
    }
  }
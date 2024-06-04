
function populateMonthsDropdown(selectedYear) {
    //console.log("selectedYear", selectedYear);
    fetch(`data/${selectedYear}/months`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((months) => {
        const monthDropdown = document.querySelector(".dropdown.month");
        monthDropdown.innerHTML = "";

        months.forEach((month) => {
          const option = document.createElement("option");
          option.value = month;
          option.textContent = month;
          monthDropdown.appendChild(option);
        });

        // After populating months dropdown, populate dates dropdown for the first month
        const selectedMonth = months[0]; // Assuming the first month is selected initially
        populateDatesDropdown(selectedYear, selectedMonth);
      })
      .catch((error) => {
        console.error("Error fetching months:", error);
      });
  }

  // Function to fetch and populate the dates dropdown based on the selected year and month
  function populateDatesDropdown(selectedYear, selectedMonth) {
    fetch(`data/${selectedYear}/${selectedMonth}/dates`)
      .then((response) => response.json())
      .then(async (dates) => {
        const dateDropdown = document.querySelector(".dropdown.date");
        dateDropdown.innerHTML = "";

        dates.forEach((date) => {
          const option = document.createElement("option");
          option.value = date;
          option.textContent = date;
          dateDropdown.appendChild(option);
        });

        // After populating dates dropdown, load time slot geojson for the first date
        const selectedDate = dates[0]; // Assuming the first date is selected initially
        loadTimeSlotGeojson(selectedYear, selectedMonth, selectedDate);

        //add line of code populate the title of the slider-bar
      })
      .catch((error) => {
        console.error("Error fetching dates:", error);
      });
  }

  var autoMoveInterval = null;
  var isAutoMoveRunning = true;
  // Function to load time slot geojson based on the selected year, month, and date
  function loadTimeSlotGeojson(selectedYear, selectedMonth, selectedDate) {
    const url = `/data/${selectedYear}/${selectedMonth}/${selectedDate}/geojson_list`;
    //console.log("URL", url);

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((geojsonFiles) => {
        console.log("Time Slots:", geojsonFiles);

        window.geojsonFiles = geojsonFiles;
        window.selected_date = selectedDate;
        window.selected_month = selectedMonth;
        window.selected_year = selectedYear;

        // map.on("load", function () {
        //   // Update slider options with new availableSlots
        //   // Call other functions that depend on availableSlots
        //   // For example:
        //   //updateMapData(0);
        //   //updateLegendColors();
        //   //updateSliderLabel(0);
        // });

        updateSliderOptions();
        //updateSliderLabel(0);
        updateTimeSliderLabel();
        updateMapData(0);
        updateChartData(0);
        updateSliderLabel_second(0); //new 4/25
        //autoMoveTimeSlider();
        // Clear previous interval if any
        clearInterval(autoMoveInterval);

        if (isAutoMoveRunning) {
          autoMoveInterval = setInterval(autoMoveTimeSlider, 3000);
        }

        //var isAutoMoveRunning = true;

        

        // Populate the list with GeoJSON filenames
        // const list = document.getElementById("geojson-list");
        // geojsonFiles.forEach((filename) => {
        //   const listItem = document.createElement("li");
        //   listItem.textContent = filename;
        //   list.appendChild(listItem);
        // });
      })
      .catch((error) => {
        console.error(
          "There was a problem with the fetch operation:",
          error
        );
      });
  }

  function toggleAutoMoveTimeSlider() {
    var button = document.getElementById("stop-auto-move-btn");
    
    if (isAutoMoveRunning) {
      button.textContent = "Start Auto Move"; // Change button text
      //stopAutoMoveTimeSlider(); // Stop the auto move
      clearInterval(autoMoveInterval)
      console.log("Infinity Wars") 
    } else {
      button.textContent = "Stop Auto Move"; // Change button text
      clearInterval(autoMoveInterval);
      autoMoveInterval = setInterval(autoMoveTimeSlider, 3000);
      console.log("ENDGAME");
    }
    isAutoMoveRunning = !isAutoMoveRunning; // Toggle the flag
    
  }
  
  document.getElementById("stop-auto-move-btn").addEventListener("click", toggleAutoMoveTimeSlider);

  // Initial population of year dropdown
  // Assuming the 'data' folder contains the years
  fetch("data")
    .then((response) => response.json())
    .then((years) => {
      const yearDropdown = document.querySelector(".dropdown.year");
      years.forEach((year) => {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearDropdown.appendChild(option);
      });

      // Trigger change event to populate months and subsequent dropdowns for the first year
      const firstYear = years[0]; // Assuming the first year is selected initially

      populateMonthsDropdown(firstYear);

      // Add event listener to update selectedYear when year dropdown value changes
      yearDropdown.addEventListener("change", function () {
        let selectedYear = yearDropdown.value;
        //console.log("change year", selectedYear);
        //resetTimeSlider();
        var timeSlider = document.getElementById("time-slider");
        timeSlider.value = 0;
        populateMonthsDropdown(selectedYear);
        //console.log("@Selected year changed to:", selected_Year);

        // Reset the time slider to the beginning
      });
    })
    .catch((error) => {
      console.error("Error fetching years:", error);
    });

  // Event listener for date dropdown change
  // added an async and the await before the function call
  const dateDropdown = document.querySelector(".dropdown.date");
  dateDropdown.addEventListener("change", async () => {
    const selectedDate = dateDropdown.value;
    const selectedMonth = document.querySelector(".dropdown.month").value;
    const selectedYear = document.querySelector(".dropdown.year").value;
    //console.log("change date", selectedDate);
    //console.log("@@@", selectedMonth);
    //resetTimeSlider();
    var timeSlider = document.getElementById("time-slider");
    timeSlider.value = 0;
    loadTimeSlotGeojson(selectedYear, selectedMonth, selectedDate);
    // Reset the time slider to the beginning

    //updateTimeSliderLabel();
    //updateSliderLabel(0);
  });

  // Event listener for month dropdown change
  const monthDropdown = document.querySelector(".dropdown.month");
  monthDropdown.addEventListener("change", () => {
    const selectedMonth = monthDropdown.value;
    const selectedYear = document.querySelector(".dropdown.year").value;
    //console.log("change month", selectedMonth);
    //resetTimeSlider();
    var timeSlider = document.getElementById("time-slider");
    timeSlider.value = 0;
    populateDatesDropdown(selectedYear, selectedMonth);
    // Reset the time slider to the beginning
  });

  //this is good
  function updateMapData(slotIndex) {
    var timeSlot = getTimeSlot(slotIndex);
    //var timeSlot = window.geojsonFiles[slotIndex]
    //console.log("slotIndex", slotIndex);
    //console.log("var_time_Slot: ", timeSlot);
    //console.log("geojson timeslots: ", window.geojsonFiles);
    var geojsonURL = `/data/${window.selected_year}/${window.selected_month}/${window.selected_date}/${window.selected_year}-${window.selected_month}-${window.selected_date}-${timeSlot}.geojson`;

    // Fetch geojson data
    fetch(geojsonURL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch");
        }
        return response.json();
      })
      .then((data) => {
        // Process fetched data
        // console.log("Data fetched successfully:", data);
      })
      .catch((error) => {
        console.error("Error fetching geojson:", error);
        // Handle the error (e.g., display a message to the user)
      });

    if (!map.getSource("traffic_data")) {
      map.addSource("traffic_data", {
        type: "geojson",
        data: geojsonURL,
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
    } else {
      map.getSource("traffic_data").setData(geojsonURL);
    }
  }
  
// Declare variables to store chart instances
var chart1, chart2;

function updateChartData(slotIndex) {
    var timeSlot = getTimeSlot(slotIndex);
    var geojsonURL = `/data/${window.selected_year}/${window.selected_month}/${window.selected_date}/${window.selected_year}-${window.selected_month}-${window.selected_date}-${timeSlot}.geojson`;

    // Fetch geojson data
    fetch(geojsonURL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch");
        }
        return response.json();
      })
      .then((data) => {
        // Process fetched data for chart 1
        var labels1 = [];
        for (var i = 0; i <= 10; i += 0.1) {
          labels1.push(i.toFixed(1));
        }

        var frequencyCounts = Array(labels1.length).fill(0);
        data.features.forEach(feature => {
          if (feature.properties && feature.properties.jam_factor) {
            var jamFactor = feature.properties.jam_factor;
            var index = Math.floor(jamFactor * 10);
            frequencyCounts[index]++;
          }
        });

        // Destroy existing chart 1 if it exists
        if (chart1) {
          chart1.destroy();
        }

        // Create chart 1
        var ctx1 = document.getElementById("distributionChart1").getContext("2d");
        chart1 = new Chart(ctx1, {
          type: "bar",
          data: {
            labels: labels1,
            datasets: [
              {
                label: "Frequency for Jam Factor",
                data: frequencyCounts,
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Jam Factor' // X-axis label
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Frequency' // Y-axis label
                    },
                    ticks: {
                        beginAtZero: true,
                    },
                },
            },
          },
        });

        // Process fetched data for chart 2
        var labels2 = [];
        for (var i = 0; i <= 35; i += 0.1) {
          labels2.push(i.toFixed(1));
        }

        var frequencyCountForSpeed = Array(labels2.length).fill(0);
        data.features.forEach(feature => {
          if (feature.properties && feature.properties.speed) {
            var speed = parseFloat(feature.properties.speed.toFixed(1)); // Round to nearest 0.1
            var index = Math.round(speed * 10);
            frequencyCountForSpeed[index]++;
          }
        });

        // Destroy existing chart 2 if it exists
        if (chart2) {
          chart2.destroy();
        }

        // Create chart 2
        var ctx2 = document.getElementById("distributionChart2").getContext("2d");
        chart2 = new Chart(ctx2, {
          type: "bar",
          data: {
            labels: labels2,
            datasets: [
              {
                label: "Frequency of Speed in mph",
                data: frequencyCountForSpeed,
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              x: {
                  title: {
                      display: true,
                      text: 'Speed (mph)' // X-axis label
                  }
              },
              y: {
                  title: {
                      display: true,
                      text: 'Frequency' // Y-axis label
                  },
                  ticks: {
                      beginAtZero: true,
                  },
              },
            },
          },
        });
      })
      .catch((error) => {
        console.error("Error fetching geojson:", error);
        // Handle the error (e.g., display a message to the user)
      });
}


  //this is good
  //need to add this function (call it basically)
  function updateSliderOptions() {
    var slider = document.getElementById("time-slider"); //time-slider-label //time-slider
    var timeSlotLabels = document.getElementById("time-slot-labels");

    slider.max = geojsonFiles.length - 1;
    //console.log("hello", slider.max);

    slider.innerHTML = "";
    //timeSlotLabels.innerHTML = "";

    window.geojsonFiles.forEach(function (slot, index) {
      var option = document.createElement("option");
      option.value = index;
      option.textContent = slot.replace(/-/g, ":");
      slider.appendChild(option);
    });
    
  }

  async function updateTimeSliderLabel() {
    var timeSlotLabels = document.getElementById("time-slot-labels");
    timeSlotLabels.innerHTML = "";

    // Get the first and last time slots based on the selected date
    var firstSlot = window.geojsonFiles[0].replace(/-/g, ":");
    var lastSlot = window.geojsonFiles[
      window.geojsonFiles.length - 1
    ].replace(/-/g, ":");

    // Create and append the first time slot label
    var firstSlotLabel = document.createElement("div");
    firstSlotLabel.classList.add("time-slot-label");
    firstSlotLabel.textContent = firstSlot;
    timeSlotLabels.appendChild(firstSlotLabel);

    // Create and append the last time slot label
    var lastSlotLabel = document.createElement("div");
    lastSlotLabel.classList.add("time-slot-label");
    lastSlotLabel.textContent = lastSlot;
    timeSlotLabels.appendChild(lastSlotLabel);
  }

  //var autoMoveInterval;

    function autoMoveTimeSlider() {
      var slider = document.getElementById("time-slider");
      var currentIndex = parseInt(slider.value);
      //var maxIndex = parseInt(slider.max);
      console.log("LLL", window.geojsonFiles);
      var maxIndex = window.geojsonFiles.length - 1;
    
      // Increment the slider value to move forward in time 
      var newIndex = currentIndex + 1;
    
      // If newIndex exceeds the maximum index, reset to 0
      if (newIndex > maxIndex) {
        newIndex = 0;
      }
    
      // Update the slider value
      slider.value = newIndex;
      console.log("whattt",slider.value)
    
      // Trigger the input event on the slider to update the UI
      slider.dispatchEvent(new Event('input'));
    
      console.log("lol");
    
      // If the slider reached the end, reset it to the beginning
      if (newIndex === 0) {
        clearInterval(autoMoveInterval); // Stop the current auto-move interval
        console.log("heeeee");
        autoMoveInterval = setInterval(autoMoveTimeSlider, 3000); // Start a new auto-move interval
      }
    }

    // Function to stop auto-moving the time slider
  function stopAutoMoveTimeSlider() {
    clearInterval(autoMoveInterval);
  }


  //document.getElementById("start-auto-move-btn").addEventListener("click", autoMoveTimeSlider);

  //document.getElementById("stop-auto-move-btn").addEventListener("click", toggleAutoMoveTimeSlider);

  document
    .getElementById("time-slider")
    .addEventListener("input", function (e) {
      var slotIndex = parseInt(e.target.value);
      updateMapData(slotIndex);
      updateChartData(slotIndex);
      updateTimeSliderLabel();
      //updateSliderLabel(slotIndex);
      updateSliderLabel_second(slotIndex); //new 4/25

      updateSliderOptions();
    });

    

  document
    .getElementById("time-slider")
    .addEventListener("change", function (e) {
      var slotIndex = parseInt(e.target.value);
      updateMapData(slotIndex);
      updateChartData(slotIndex);
      updateTimeSliderLabel();
      //updateSliderLabel(slotIndex);
      updateSliderLabel_second(slotIndex); //new 4/25

      updateSliderOptions();
    });

  async function updateTimeSliderLabel() {
    var timeSlotLabels = document.getElementById("time-slot-labels");
    timeSlotLabels.innerHTML = "";

    // Get the first and last time slots based on the selected date
    var firstSlot = window.geojsonFiles[0].replace(/-/g, ":");
    var lastSlot = window.geojsonFiles[
      window.geojsonFiles.length - 1
    ].replace(/-/g, ":");

    // Create and append the first time slot label
    var firstSlotLabel = document.createElement("div");
    firstSlotLabel.classList.add("time-slot-label");
    firstSlotLabel.textContent = firstSlot;
    timeSlotLabels.appendChild(firstSlotLabel);

    // Create and append the last time slot label
    var lastSlotLabel = document.createElement("div");
    lastSlotLabel.classList.add("time-slot-label");
    lastSlotLabel.textContent = lastSlot;
    timeSlotLabels.appendChild(lastSlotLabel);
  }

  //This is where you see the slider label being updated
  function updateSliderLabel(slotIndex) {
    var sliderLabel = document.querySelector(".slider-label"); //.slider-label //time-slider-label
    sliderLabel.textContent =
    window.selected_month + "/" + window.selected_date +
      "/" +
      window.selected_year +
      " Time of Day!: " +
      window.geojsonFiles[slotIndex].replace(/-/g, ":");
    }

    function updateSliderLabel_second(slotIndex) {
      var sliderLabel = document.getElementById("time-slider-label"); // Get the time-slider-label element
      if (sliderLabel) {
        sliderLabel.innerHTML =
          '<h2>' + window.selected_month + "/" +
          window.selected_date + "/" +
          window.selected_year +
          ' Time of Day: ' +
          window.geojsonFiles[slotIndex].replace(/-/g, ":") +
          '</h2>';
      }
    }
    

    //this is good too
    //triggered when you change the dropdown
    function getTimeSlot(slotIndex) {
      return window.geojsonFiles[slotIndex];
    }
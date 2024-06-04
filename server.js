const express = require('express');
const fs = require('fs');
const http = require('http'); // Import http module
const { spawn } = require('child_process');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

const server = http.createServer(app); // Create HTTP server

app.use(bodyParser.json()); // Middleware to parse JSON bodies


const baseDirectory = path.join(__dirname, "data"); // Replace this with the path to your base directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/data', express.static(path.join(__dirname, 'data')));

//endpoints for the dropdown menus

// Endpoint to fetch the list of years
app.get('/data', async (req, res) => {
  //console.log("list of years", path.join(__dirname, 'data'));

  try {
    const years = await fs.promises.readdir(path.join(__dirname, 'data'));
    res.json(years);
  } catch (error) {
    console.error('Error reading years:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint to fetch the list of months for a specific year
app.get('/data/:year/months', async (req, res) => {
  const year = req.params.year;

  //console.log("list of months", path.join(__dirname, 'data', year));

  try {
    const months = await fs.promises.readdir(path.join(__dirname, 'data', year));
    res.json(months);
  } catch (error) {
    console.error(`Error reading months for year ${year}:`, error);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint to fetch the list of dates for a specific year and month
app.get('/data/:year/:month/dates', async (req, res) => {
  const year = req.params.year;
  const month = req.params.month;

  //console.log("list of dates: ", path.join(__dirname, 'data', year, month));

  try {
    const dates = await fs.promises.readdir(path.join(__dirname, 'data', year, month));
    res.json(dates);
  } catch (error) {
    console.error(`Error reading dates for year ${year} and month ${month}:`, error);
    console.log("####ERRRORR###");
    res.status(500).send('Internal Server Error');
  }
});


app.get('/data/:year/:month/:date/geojson_list', async (req, res) => {
  const year = req.params.year;
  const month = req.params.month;
  const date = req.params.date;

  const directoryPath = path.join(__dirname, 'data', year, month, date);
  //console.log("geojsonlist: ", directoryPath);
  
  try {
    const files = await fs.promises.readdir(directoryPath);
    const geojsonFiles = files
      .filter(file => file.endsWith('.geojson'))
      .map(file => {
        const timeSlot = file.split('-').slice(3).join('-').replace('.geojson', '');
        return timeSlot;
      });    
    res.json(geojsonFiles);
  } catch (error) {
    console.log("you are error");
    console.error(`Error reading directory ${directoryPath}:`, error);
    res.status(500).send('Internal Server Error');
  }
});


//'collecting_traffic_data.py'
// Function to run the Python script
//C:\Users\Joe Mei\AppData\Local\Programs\Python\Python312\

// Store a reference to the Python process
let pythonProcess;

function runPythonScript() {

  const pythonPath = '/usr/bin/python3';
  //include pythonPath in the spawn function below
  const pythonProcess = spawn(pythonPath, ['collecting_traffic_data.py']);

  pythonProcess.stdout.on('data', (data) => {
      console.log(`Data received from Python script: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
      console.error(`Error from Python script: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python script exited with code ${code}`);
    // Respond to the client
    res.sendStatus(200);
});
}

//will use this endpoint later on
// Function to stop the Python script
function stopPythonScript() {
  if (pythonProcess) {
    pythonProcess.kill('SIGINT'); // Send SIGINT signal to terminate the process
    pythonProcess = null; // Clear the reference to the process
    console.log('Python script stopped');
  } else {
    console.log('Python script is not running');
  }
}

// Route for handling toggle switch change to run or stop the Python script
app.post('/toggle-python-script', (req, res) => {
  const switchState = req.body.switchState; // Assuming you send the switch state from client-side
  console.log("@@",switchState);
  if (switchState === 'true') {
    // Run the Python script
    runPythonScript();
    res.sendStatus(200); // Respond to the client
  } else if (switchState === 'false') {
    // Stop the Python script
    stopPythonScript();
    res.sendStatus(200); // Respond to the client
  } else {
    res.status(400).send('Invalid switch state'); // Respond with an error for invalid switch state
  }
});

// Route for starting the Python script
app.post('/start-python-script', (req, res) => {
  // Run the Python script
  runPythonScript();
  res.sendStatus(200); // Respond to the client
});


//added this endpoint 4/18/2024
// Define the endpoint to serve the most up-to-date file within the most up-to-date folder

app.get('/latestFileInLatestFolder', (req, res) => {
  const mainFolderPath = path.join(__dirname, 'data'); // Constructing the path dynamically

  // Read the contents of the main folder
  fs.readdir(mainFolderPath, (err, yearFolders) => {
      if (err) {
          console.error("Error reading main folder:", err);
          return res.status(500).json({ error: 'Internal Server Error' });
      }

      // Find the highest year folder within the main folder
      const sortedYearFolders = yearFolders.sort((a, b) => parseInt(b) - parseInt(a)); // Sort in descending order
      const latestYearFolder = sortedYearFolders[0];

      if (!latestYearFolder) {
          return res.status(404).json({ error: 'No year folders found in the main folder' });
      }

      // Read the contents of the most recent year folder
      const yearFolderPath = path.join(mainFolderPath, latestYearFolder);
      fs.readdir(yearFolderPath, (err, monthFolders) => {
          if (err) {
              console.error("Error reading year folder:", err);
              return res.status(500).json({ error: 'Internal Server Error' });
          }

          // Find the highest month folder within the most recent year folder
          const sortedMonthFolders = monthFolders.sort((a, b) => parseInt(b) - parseInt(a)); // Sort in descending order
          const latestMonthFolder = sortedMonthFolders[0];

          if (!latestMonthFolder) {
              return res.status(404).json({ error: 'No month folders found in the latest year folder' });
          }

          // Read the contents of the most recent month folder
          const monthFolderPath = path.join(yearFolderPath, latestMonthFolder);
          fs.readdir(monthFolderPath, (err, dateFolders) => {
              if (err) {
                  console.error("Error reading month folder:", err);
                  return res.status(500).json({ error: 'Internal Server Error' });
              }

              // Find the highest date folder within the most recent month folder
              const sortedDateFolders = dateFolders.sort((a, b) => parseInt(b) - parseInt(a)); // Sort in descending order
              const latestDateFolder = sortedDateFolders[0];

              if (!latestDateFolder) {
                  return res.status(404).json({ error: 'No date folders found in the latest month folder' });
              }

              // Read the contents of the most recent date folder
              const dateFolderPath = path.join(monthFolderPath, latestDateFolder);
              fs.readdir(dateFolderPath, (err, files) => {
                  if (err) {
                      console.error("Error reading date folder:", err);
                      return res.status(500).json({ error: 'Internal Server Error' });
                  }

                  // Find the geojson file with the latest modification time within the most recent date folder
                  const geojsonFiles = files.filter(fileName => fileName.endsWith('.geojson'));
                  if (geojsonFiles.length === 0) {
                      return res.status(404).json({ error: 'No geojson files found in the latest date folder' });
                  }

                  const latestFile = geojsonFiles.reduce((prevFile, currFile) => {
                      const prevFilePath = path.join(dateFolderPath, prevFile);
                      const currFilePath = path.join(dateFolderPath, currFile);
                      const prevStats = fs.statSync(prevFilePath);
                      const currStats = fs.statSync(currFilePath);
                      return currStats.mtime.getTime() > prevStats.mtime.getTime() ? currFile : prevFile;
                  });

                  // Log the full path of the latest file
                  const latestFilePath = path.join(dateFolderPath, latestFile);
                  console.log("Latest file path:", latestFilePath);

                  // Send the latest file as a response
                  res.sendFile(latestFilePath);
              });
          });
      });
  });
});


app.get('/latestFile', (req, res) => {
  const mainFolderPath = path.join(__dirname, 'data'); // Constructing the path dynamically

  // Read the contents of the main folder
  fs.readdir(mainFolderPath, (err, yearFolders) => {
      if (err) {
          console.error("Error reading main folder:", err);
          return res.status(500).json({ error: 'Internal Server Error' });
      }

      // Find the highest year folder within the main folder
      const sortedYearFolders = yearFolders.sort((a, b) => parseInt(b) - parseInt(a)); // Sort in descending order
      const latestYearFolder = sortedYearFolders[0];

      if (!latestYearFolder) {
          return res.status(404).json({ error: 'No year folders found in the main folder' });
      }

      // Read the contents of the most recent year folder
      const yearFolderPath = path.join(mainFolderPath, latestYearFolder);
      fs.readdir(yearFolderPath, (err, monthFolders) => {
          if (err) {
              console.error("Error reading year folder:", err);
              return res.status(500).json({ error: 'Internal Server Error' });
          }

          // Find the highest month folder within the most recent year folder
          const sortedMonthFolders = monthFolders.sort((a, b) => parseInt(b) - parseInt(a)); // Sort in descending order
          const latestMonthFolder = sortedMonthFolders[0];

          if (!latestMonthFolder) {
              return res.status(404).json({ error: 'No month folders found in the latest year folder' });
          }

          // Read the contents of the most recent month folder
          const monthFolderPath = path.join(yearFolderPath, latestMonthFolder);
          fs.readdir(monthFolderPath, (err, dateFolders) => {
              if (err) {
                  console.error("Error reading month folder:", err);
                  return res.status(500).json({ error: 'Internal Server Error' });
              }

              // Find the highest date folder within the most recent month folder
              const sortedDateFolders = dateFolders.sort((a, b) => parseInt(b) - parseInt(a)); // Sort in descending order
              const latestDateFolder = sortedDateFolders[0];

              if (!latestDateFolder) {
                  return res.status(404).json({ error: 'No date folders found in the latest month folder' });
              }

              // Read the contents of the most recent date folder
              const dateFolderPath = path.join(monthFolderPath, latestDateFolder);
              fs.readdir(dateFolderPath, (err, files) => {
                  if (err) {
                      console.error("Error reading date folder:", err);
                      return res.status(500).json({ error: 'Internal Server Error' });
                  }

                  // Find the geojson file with the latest modification time within the most recent date folder
                  const geojsonFiles = files.filter(fileName => fileName.endsWith('.geojson'));
                  if (geojsonFiles.length === 0) {
                      return res.status(404).json({ error: 'No geojson files found in the latest date folder' });
                  }

                  const latestFile = geojsonFiles.reduce((prevFile, currFile) => {
                      const prevFilePath = path.join(dateFolderPath, prevFile);
                      const currFilePath = path.join(dateFolderPath, currFile);
                      const prevStats = fs.statSync(prevFilePath);
                      const currStats = fs.statSync(currFilePath);
                      return currStats.mtime.getTime() > prevStats.mtime.getTime() ? currFile : prevFile;
                  });

                  // Log the full path of the latest file
                  const latestFilePath = path.join(dateFolderPath, latestFile);
                  console.log("Latest file path:", latestFilePath);

                  // Send the latest file as a response
                  // res.sendFile(latestFilePath);

                  let timestamp = latestFile.substring(0, latestFile.lastIndexOf('.'));

                  // Send the name of the latest file as a JSON response
                  //res.json({ latestFile, latestFolder });
                  res.send(timestamp);
              });
          });
      });
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port} and <a href="http://localhost:${port}/">localhost:${port}</a>`);
});

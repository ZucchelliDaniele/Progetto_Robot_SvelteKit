import express from 'express';
import bodyParser from 'body-parser';
import { randomBytes, createHash } from 'crypto';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import fs from 'fs';
import { createWriteStream } from 'fs';
import os from 'os';
import portscanner from 'portscanner';
import dns from 'dns';

const logFileStream = createWriteStream('session_logs.txt', { flags: 'a' });

var controllingDeviceHash = ""
var updatedControl = false
var controlUpdateCheck
var controlRequestHash = ""
var controlRequestDeviceIp = ""

// Function to log to console and file
const log = (message) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleString('it-IT', {
    timeZone: 'Europe/Rome', // Adjust time zone for Italy
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  logFileStream.write(`${formattedDate}: ${message}\n`);
};

// Function to get the local IP address of the machine
const getLocalIPAddress = () => {
  const interfaces = os.networkInterfaces();
  for (const interfaceName of Object.keys(interfaces)) {
    for (const iface of interfaces[interfaceName]) {
      if (!iface.internal && iface.family === 'IPv4') {
        return iface.address;
      }
    }
  }
  return null;
};

// Function to get the hostname of an IP address
const getHostname = async(ip) => {
  return new Promise((resolve, reject) => {
    dns.reverse(ip, (err, hostnames) => {
      if (err) {
        reject(err);
      } else {
        resolve(hostnames[0]); // Return the first hostname found
      }
    });
  });
};

const scanLocalNetwork = async (localIP) => {
  const hostname = os.hostname();
  const parts = localIP.split('.');
  if (parts.length !== 4) {
    log("Invalid local IP address")
    console.log("Invalid local IP address")
    throw new Error('Invalid local IP address');
  }

  const baseIP = parts.slice(0, 3).join('.');
  const results = [];
  log("scanning for: "+baseIP+".X-50")
  for (let i = 1; i <= 50; i++) {
    const ip = `${baseIP}.${i}`;
    console.log("scanning: "+ip)
    try {
      const status = await portscanner.checkPortStatus(portToCheck, ip);
      if (status === 'open') {
        const hostname = await getHostname(ip);
        results.push({ ip, hostname, port: portToCheck });
      }
    } catch (error) {
      logError(error)
      console.error(error);
    }
  }

  return results;
};

// Get the local IP address and start scanning the local network
const localIP = getLocalIPAddress();

const app = express();
const port = 3000;


const portToCheck = 80; // Example: port 80 for HTTP

function CheckCode(hashedcode) {
  if(currentHash != "" && currentHash == hashedcode) {
    return true
  }
  return false
}

let codeResetTimeout

// File path to store session data
const sessionFilePath = 'sessions.json';

// Middleware to generate random hash
let currentHash = ""
let currentCode = ""

function generateHash() {
  const randomBytesString = randomBytes(3).toString('hex');
  let randomBytesMixedCase = ''; // Initialize the mixed-case string
  
  // Iterate through each character of the original string
  for (let i = 0; i < randomBytesString.length; i++) {
    // Randomly choose whether to convert the character to uppercase
    if (Math.random() < 0.5) {
      randomBytesMixedCase += randomBytesString[i].toUpperCase();
    } else {
      randomBytesMixedCase += randomBytesString[i];
    }
  }
  log(randomBytesMixedCase)
  console.log(randomBytesMixedCase);
  log(randomBytesMixedCase);
  currentCode = randomBytesMixedCase
  return createHash('sha256').update(currentCode).digest('hex');
}

app.use(bodyParser.json());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // Allow requests from all origins while also allowing credentials
    callback(null, true);
  },
  credentials: true
}));

app.use(cookieParser());

// Pair endpoint to generate hash and store in session and json file
app.post('/pair', (req, res) => {
  if (CheckCode(req.body.hashedcode)) {
    clearTimeout(codeResetTimeout);
    const hash = currentHash; // Use the current hash
    const currentDate = new Date().toISOString();
    const sessionData = loadSessionData();

    // Add the new hash object to the session data
    sessionData.push({ hash, createdAt: currentDate });

    // Write the updated session data to the JSON file
    saveSessionData(sessionData);
    
    currentCode = "";
    currentHash = "";
    console.log("Host connected"+" required from: "+req.ip)
    console.log("Hash"+hash+" required from: "+req.ip)
    log("Host connected"+" required from: "+req.ip)
    log("Hash"+hash+" required from: "+req.ip)
    res.json({ hash });
  }
});

// Status endpoint to check login status
app.get('/status', (req, res) => {
  let isLoggedIn = false;
  let sessionData = loadSessionData();

  // Check if any of the stored hashes match the hash in the cookie
  isLoggedIn = sessionData.some(data => {
    if (data.hash === req.cookies.hash) {
      const createdAt = new Date(data.createdAt);
      const currentDate = new Date();
      const daysDifference = Math.ceil((currentDate - createdAt) / (1000 * 60 * 60 * 24));

      if (daysDifference < 7) {
        // If the hashed code was created less than 7 days ago, update the creation date
        data.createdAt = currentDate.toISOString();
        saveSessionData(sessionData);
        console.log("Hash "+data.hash+" Updated"+" required from: "+req.ip)
        log("Hash "+data.hash+" Updated"+" required from: "+req.ip)
        return true;
      } else {
        // If the hashed code is older than 7 days, remove it
        sessionData = sessionData.filter(data => data.hash !== req.cookies.hash);

        // Write the updated session data to the JSON file
        saveSessionData(sessionData);
        console.log("Hash "+data.hash+" Eliminated"+" required from: "+req.ip)
        log("Hash "+data.hash+" Eliminated"+" required from: "+req.ip)
        return false;
      }
    }
  });
  if ((req.ip === '::ffff:127.0.0.1' || req.ip === '::1') && req.cookies.websocket != "yes") {
    isLoggedIn = true
  }
  log("Login is "+isLoggedIn+" required from: "+req.ip)
  console.log("Login is "+isLoggedIn+" required from: "+req.ip)
  res.json({ loggedIn: isLoggedIn });
});

// Status endpoint to create the login code and reset it after 60 seconds
app.get('/code', (req, res) => {
  if (req.ip === '::ffff:127.0.0.1' || req.ip === '::1') {

    let exist = false;
    do{
      let sessionData = loadSessionData();
      currentHash = generateHash();
      // Check if any of the stored hashes match with the created hash
      exist = sessionData.some(data => {
        if (data.hash === currentHash) {
          const createdAt = new Date(data.createdAt);
          const currentDate = new Date();
          const daysDifference = Math.ceil((currentDate - createdAt) / (1000 * 60 * 60 * 24));

          if (daysDifference < 7) {
            // If the hashed code was created less than 7 days ago, update the creation date
            data.createdAt = currentDate.toISOString();
            saveSessionData(sessionData);
            console.log("Hash "+data.hash+" Updated"+" required from: "+req.ip)
            log("Hash "+data.hash+" Updated"+" required from: "+req.ip)
            return true;
          } else {
            // If the hashed code is older than 7 days, remove it
            sessionData = sessionData.filter(data => data.hash !== currentHash);
            console.log("Hash "+data.hash+" Eliminated"+" required from: "+req.ip)
            log("Hash "+data.hash+" Eliminated"+" required from: "+req.ip)
            // Write the updated session data to the JSON file
            saveSessionData(sessionData);
            return false;
          }
        }
  });
    }while(exist)
    console.log("code "+currentCode+" retrieved"+" required from: "+req.ip)
    log("code "+currentCode+" retrieved"+" required from: "+req.ip)
    res.json({ code: currentCode });

    // Clear any existing timeout
    clearTimeout(codeResetTimeout);

    // Reset the code after 31 seconds
    codeResetTimeout = setTimeout(() => {
      currentCode = '';
      currentHash = '';
      console.log('Code reset'+" required from: "+req.ip);
      log('Code reset'+" required from: "+req.ip);
    }, 31000); // 31 seconds in milliseconds
  }
  else {
    console.log("Not Allowed to get code"+" required from: "+req.ip)
    log("Not Allowed to get code"+" required from: "+req.ip)
    res.json({ error: "Not Allowed" });
  }

});

app.get('/controlPermission', (req, res)=> {
  let isLoggedIn = false;
  let sessionData = loadSessionData();
  let permission = false
  let isLocalHost = false
  if (req.ip === '::ffff:127.0.0.1' || req.ip === '::1') isLocalHost = true
  // Check if any of the stored hashes match the hash in the cookie
  isLoggedIn = sessionData.some(data => {
    if (data.hash === req.cookies.hash) {
      const createdAt = new Date(data.createdAt);
      const currentDate = new Date();
      const daysDifference = Math.ceil((currentDate - createdAt) / (1000 * 60 * 60 * 24));

      if (daysDifference < 7) {
        // If the hashed code was created less than 7 days ago, update the creation date
        data.createdAt = currentDate.toISOString();
        saveSessionData(sessionData);
        return true;
      } else {
        // If the hashed code is older than 7 days, remove it
        sessionData = sessionData.filter(data => data.hash !== req.cookies.hash);
        // Write the updated session data to the JSON file
        saveSessionData(sessionData);
        return false;
      }
    }
  });
  if (isLocalHost) isLoggedIn = true
  if(isLoggedIn) {
    if(controllingDeviceHash == "" && (!isLocalHost || req.cookies.websocket == "yes")) {
      controllingDeviceHash = req.cookies.hash
      permission = true
      console.log("Control changed To: "+controllingDeviceHash+" From: "+req.ip)
      log("Control changed To: "+controllingDeviceHash+" From: "+req.ip)
      controlUpdateCheck = setInterval(()=>{
        if(!updatedControl) {
          controllingDeviceHash = ""
          clearInterval(controlUpdateCheck)
          console.log("Control reset")
          log("Control reset")
        }else {
          console.log("Control passed")
        }
        updatedControl = false
      }, 10000)
    }
    else if(controllingDeviceHash == req.cookies.hash && (!isLocalHost || req.cookies.websocket == "yes")) {
      permission = true
    }
    if (isLocalHost && req.cookies.websocket != "yes") permission = true
    res.json({ control: permission });
  }else {
    res.send("Not Allowed")
  }
})

app.get('/updatePermission', (req, res) => {
  var isLocalHost = false
  if (req.ip === '::ffff:127.0.0.1' || req.ip === '::1') isLocalHost = true
  if (!isLocalHost && req.cookies.hash == controllingDeviceHash) {
    updatedControl = true
    res.send("Updated") // Response sent here
  } else {
    res.send("not controlling") // Response sent here
  }
})

app.get('/controlRequestedCheck', (req, res)=>{
  if(req.cookies.hash == controlRequestHash) {
    controlRequestHash = ""
    controlRequestDeviceIp = ""
    res.send("Control resetted")
  }
  else if(req.cookies.hash == controllingDeviceHash) {
    res.json({ device: controlRequestDeviceIp })
  }
  else res.send("Not allowed")
})

app.post('/controlRequestCheck', (req, res) => {
  // Check if the user is logged in
  let isLoggedIn = false;
  let sessionData = loadSessionData();
  if (req.ip === '::ffff:127.0.0.1' || req.ip === '::1') {
      isLocalHost = true;
  }
  isLoggedIn = sessionData.some(data => {
      if (data.hash === req.cookies.hash) {
          const createdAt = new Date(data.createdAt);
          const currentDate = new Date();
          const daysDifference = Math.ceil((currentDate - createdAt) / (1000 * 60 * 60 * 24));

          if (daysDifference < 7) {
              // If the hashed code was created less than 7 days ago, update the creation date
              data.createdAt = currentDate.toISOString();
              saveSessionData(sessionData);
              return true;
          } else {
              // If the hashed code is older than 7 days, remove it
              sessionData = sessionData.filter(data => data.hash !== req.cookies.hash);
              // Write the updated session data to the JSON file
              saveSessionData(sessionData);
              return false;
          }
      }
  });
  if (isLoggedIn) {
      // Log the request body
      console.log(req.body);
      // Send appropriate response based on the request body
      if (req.body.action == "accept") {
          controllingDeviceHash = controlRequestHash
          controlRequestHash = ""
          controlRequestDeviceIp = ""
      } else {
          controlRequestHash = ""
          controlRequestDeviceIp = ""
      }
      res.sendStatus(200); // Send success response
  } else {
      res.sendStatus(403); // Send forbidden response if user is not logged in or request body is invalid
  }
});




app.get('/controlRequest', (req,res)=>{
  var isLocalHost = false
  var isLoggedIn
  let sessionData = loadSessionData();
  if (req.ip === '::ffff:127.0.0.1' || req.ip === '::1') isLocalHost = true
  isLoggedIn = sessionData.some(data => {
    if (data.hash === req.cookies.hash) {
      const createdAt = new Date(data.createdAt);
      const currentDate = new Date();
      const daysDifference = Math.ceil((currentDate - createdAt) / (1000 * 60 * 60 * 24));

      if (daysDifference < 7) {
        // If the hashed code was created less than 7 days ago, update the creation date
        data.createdAt = currentDate.toISOString();
        saveSessionData(sessionData);
        return true;
      } else {
        // If the hashed code is older than 7 days, remove it
        sessionData = sessionData.filter(data => data.hash !== req.cookies.hash);
        // Write the updated session data to the JSON file
        saveSessionData(sessionData);
        return false;
      }
    }
  });
  if(!isLocalHost && isLoggedIn && req.cookies.hash != controllingDeviceHash) {
    controlRequestHash = req.cookies.hash
    controlRequestDeviceIp = (req.ip).replace("::ffff:", "")
    res.send("ControllRequestSended")
  }
  else res.send("Not allowed")
})



app.get('/getip', (req, res) => {
  if (req.ip === '::ffff:127.0.0.1' || req.ip === '::1') {
      // Get network interfaces
      const networkInterfaces = os.networkInterfaces();

      // Iterate over interfaces
      let privateIPs = [];
      Object.keys(networkInterfaces).forEach(interfaceName => {
          const interfaceData = networkInterfaces[interfaceName];

          // Filter out IPv4 addresses and non-internal interfaces
          const ipv4Addresses = interfaceData.filter(item =>
              item.family === 'IPv4' && !item.internal
          );

          // Collect the private IP addresses
          ipv4Addresses.forEach(address => {
              privateIPs.push(address.address);
          });
      });
      console.log("Ip found "+privateIPs+" required from: "+req.ip)
      log("Ip found "+privateIPs+" required from: "+req.ip)
      // Send the private IP addresses
      res.send(privateIPs);
  } else {
    console.log("Not Allowed to get ip"+" required from: "+req.ip)
    log("Not Allowed to get ip"+" required from: "+req.ip)
      res.send("Not Allowed");
  }
});

app.get('/find', (req, res) => {
  let isLoggedIn = false;
  let sessionData = loadSessionData();

  // Check if any of the stored hashes match the hash in the cookie
  isLoggedIn = sessionData.some(data => {
    if (data.hash === req.cookies.hash) {
      const createdAt = new Date(data.createdAt);
      const currentDate = new Date();
      const daysDifference = Math.ceil((currentDate - createdAt) / (1000 * 60 * 60 * 24));

      if (daysDifference < 7) {
        // If the hashed code was created less than 7 days ago, update the creation date
        data.createdAt = currentDate.toISOString();
        saveSessionData(sessionData);
        console.log("Hash "+data.hash+" Updated"+" required from: "+req.ip)
        log("Hash "+data.hash+" Updated"+" required from: "+req.ip)
        return true;
      } else {
        // If the hashed code is older than 7 days, remove it
        sessionData = sessionData.filter(data => data.hash !== req.cookies.hash);
        console.log("Hash "+data.hash+" Eliminated"+" required from: "+req.ip)
        log("Hash "+data.hash+" Eliminated"+" required from: "+req.ip)
        // Write the updated session data to the JSON file
        saveSessionData(sessionData);
        return false;
      }
    }
  });
  if (req.ip === '::ffff:127.0.0.1' || req.ip === '::1') isLoggedIn = true
  if (isLoggedIn) {
    if (localIP) {
      console.log(`Scanning local network from ${localIP}...`);
      log(`Scanning local network from ${localIP}...`)
      scanLocalNetwork(localIP)
        .then((results) => {
          console.log(JSON.stringify(results)+" required from: "+req.ip);
          log(JSON.stringify(results)+" required from: "+req.ip)
          res.json(JSON.stringify(results))
        })
        .catch((error) => {
          console.error(error+" required from: "+req.ip);
          log("server Error"+error+" required from: "+req.ip)
          res.send("server Error")
        });
    } else {
      console.error('Failed to get local IP address'+" required from: "+req.ip);
      log('Failed to get local IP address'+" required from: "+req.ip)
      res.send("Failed to get local IP address")
    }
  }else {
    console.error('Not Allowed to find'+" required from: "+req.ip);
    log('Not Allowed to find'+" required from: "+req.ip)
    res.send("Not Allowed")
  }
})



// Load session data from JSON file
function loadSessionData() {
  if (fs.existsSync(sessionFilePath)) {
    try {
      return JSON.parse(fs.readFileSync(sessionFilePath, 'utf-8'));
    } catch (error) {
      console.log('Error parsing session data');
      log('Error parsing session data');
      return [];
    }
  } else {
    return [];
  }
}

// Save session data to JSON file
function saveSessionData(sessionData) {
  fs.writeFileSync(sessionFilePath, JSON.stringify(sessionData, null, 2));
}



// Logout endpoint to remove user session
app.get('/logout', (req, res) => {
  let sessionData = loadSessionData();

  // Filter out the hash that matches the one in the cookie
  sessionData = sessionData.filter(data => data.hash !== req.cookies.hash);

  // Write the updated session data to the JSON file
  saveSessionData(sessionData);
  console.log("Logout successful"+" required from: "+req.ip)
  log("Logout successful"+" required from: "+req.ip)
  res.json({ message: 'Logout successful' });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  log(`Server running on port ${port}`);
});

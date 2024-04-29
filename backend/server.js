import express from 'express';
import bodyParser from 'body-parser';
import { randomBytes, createHash } from 'crypto';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import fs from 'fs';
import os from 'os';
import portscanner from 'portscanner';
import dns from 'dns';


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
    throw new Error('Invalid local IP address');
  }

  const baseIP = parts.slice(0, 3).join('.');
  const results = [];

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
      console.error(error);
    }
  }

  return results;
};

// Get the local IP address and start scanning the local network
const localIP = getLocalIPAddress();

const app = express();
const port = 3000;


const portToCheck = 5173; // Example: port 80 for HTTP

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
  console.log(randomBytesString);
  currentCode = randomBytesString
  return createHash('sha256').update(randomBytesString).digest('hex');
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
  if (req.ip === '::ffff:127.0.0.1' || req.ip === '::1') isLoggedIn = true
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
            return true;
          } else {
            // If the hashed code is older than 7 days, remove it
            sessionData = sessionData.filter(data => data.hash !== currentHash);

            // Write the updated session data to the JSON file
            saveSessionData(sessionData);
            return false;
          }
        }
  });
    }while(exist)

    res.json({ code: currentCode });

    // Clear any existing timeout
    clearTimeout(codeResetTimeout);

    // Reset the code after 31 seconds
    codeResetTimeout = setTimeout(() => {
      currentCode = '';
      currentHash = '';
      console.log('Code reset');
    }, 31000); // 31 seconds in milliseconds
  }
  else {
    res.json({ error: "Not Allowed" });
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
    if (localIP) {
      console.log(`Scanning local network from ${localIP}...`);
      scanLocalNetwork(localIP)
        .then((results) => {
          console.log(JSON.stringify(results));
          res.json(JSON.stringify(results))
        })
        .catch((error) => {
          console.error(error);
          res.send("server Error")
        });
    } else {
      console.error('Failed to get local IP address');
      res.send("Failed to get local IP address")
    }
  }else res.send("Not Allowed")
})



// Load session data from JSON file
function loadSessionData() {
  if (fs.existsSync(sessionFilePath)) {
    try {
      return JSON.parse(fs.readFileSync(sessionFilePath, 'utf-8'));
    } catch (error) {
      console.log('Error parsing session data');
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

  res.json({ message: 'Logout successful' });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

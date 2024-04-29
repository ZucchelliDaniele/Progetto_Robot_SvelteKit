import os from 'os';
import dns from 'dns';
import portscanner from 'portscanner';

const portToCheck = 80; // Example: port 80 for HTTP

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
const getHostname = (ip) => {
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

  for (let i = 1; i <= 254; i++) {
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

// Get the local IP address
const localIP = getLocalIPAddress();
if (localIP) {
  console.log(`Scanning local network from ${localIP}...`);
  scanLocalNetwork(localIP)
    .then((results) => {
      console.log(JSON.stringify(results));
    })
    .catch((error) => {
      console.error(error);
    });
} else {
  console.error('Failed to get local IP address');
}
<script lang="ts">
    "use strict";

    import { onMount } from 'svelte';

    var theme: string;
    var closed = true;
    var wifiRequestInterval: Number; // Variable to hold the interval for requesting WiFi signal
    var wifiSignalStrength = 0;
    var wifiSignalLevel: number  = -1; // -1 for no signal, 0 for very weak, 1 for weak, 2 for good, 3 for very good and 4 for excellent
    var wifiImage: HTMLImageElement;

    onMount(() => {
        if(localStorage.getItem("wifiSignal")) {
            wifiSignalLevel = localStorage.getItem("wifiSignal")
        }
        CurrentTheme()
        server();
    });
    
    function CurrentTheme() {
        setInterval(()=> {
            if (localStorage.theme === 'dark') {
                theme = "_wifi_white.png"
            } else {
                theme = "_wifi_black.png"
            }
            if(wifiImage != null) wifiImage.src = "images/"+wifiSignalLevel+theme
        })
    }

/*
-30 dBm	Amazing	Max achievable signal strength. The client can only be a few feet from the AP to achieve this. Not typical or desirable in the real world.	N/A
-67 dBm	Very Good	Minimum signal strength for applications that require very reliable, timely delivery of data packets.	VoIP/VoWi-Fi, streaming video
-70 dBm	Okay	Minimum signal strength for reliable packet delivery.	Email, web
-80 dBm	Not Good	Minimum signal strength for basic connectivity. Packet delivery may be unreliable.	N/A
-90 dBm	Unusable	Approaching or drowning in the noise floor. Any functionality is highly unlikely.	N/A
*/


function getUrlWithNoPort() {
  const url = window.location.href;

  const parsedUrl = new URL(url);
//   const baseUrl = `${parsedUrl.hostname}`;
const baseUrl = "raspberrypi.local"
  return baseUrl;
}

function sendWifiSignal(ws) {
  const wifiRequestData = {
    "request": "wifi_signal"
  };
  ws.send(JSON.stringify(wifiRequestData));
}

function wifiSignalLevelCalculation(signalStrength: number) {
  if (signalStrength >= -30) {
    return 4;
  } else if (signalStrength >= -67) {
    return 3;
  } else if (signalStrength >= -70) {
    return 2;
  } else if (signalStrength >= -80) {
    return 1;
  } else if (signalStrength >= -90) {
    return 0;
  } else {
    return -1;
  }
}

function server() {
  const retry = setInterval(() => {
    if(closed) {
      wifiSignalLevel = -1
      if(wifiImage != null) wifiImage.src = "images/"+wifiSignalLevel+theme
      const ws = new WebSocket('ws://'+getUrlWithNoPort()+':2604');
      console.clear()
      ws.addEventListener('open', (event) => {
        // Request WiFi signal every 10 seconds
        wifiRequestInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            sendWifiSignal(ws);
          }
        }, 5000); // Interval set to 10 seconds
        //console.log('Connected to WebSocket server');
        closed = false;
      });
      
      ws.addEventListener('message', (event) => {
        wifiSignalStrength = event.data;
        //{"wifi_signal_strength": -71} get only the number
        wifiSignalStrength = -wifiSignalStrength.replace(/\D/g,'');
        console.log(wifiSignalStrength);
        wifiSignalLevel = wifiSignalLevelCalculation(wifiSignalStrength);
        localStorage.setItem("wifiSignal", wifiSignalLevel)
        if(wifiImage != null) wifiImage.src = "images/"+wifiSignalLevel+theme
        // Handle received WiFi signal here if needed
      });
      
      ws.addEventListener('close', (event) => {
        //console.log('Connection closed');
        closed = true;
        server();
        wifiSignalLevel = -1;
        clearInterval(wifiRequestInterval); // Clear WiFi signal request interval on close
      });
      
      ws.addEventListener('error', (event) => {
        //console.error('WebSocket encountered an error:', event);
        closed = true;
        server();
        wifiSignalLevel = -1;
        clearInterval(wifiRequestInterval); // Clear WiFi signal request interval on error
      });
  
    } else {
      clearInterval(retry);
    }
  }, 2000);
}

</script>

<img class="h-7 my-1 mr-4" alt=" " bind:this={wifiImage}>
<script lang="ts">
    "use strict";
    let retrying = false;
    let connected = false;
    let messageReceived = false; 

    import { onMount } from 'svelte';
    import { Wifi } from 'svelte-bootstrap-icons';
    import { Wifi1 } from 'svelte-bootstrap-icons';
    import { Wifi2 } from 'svelte-bootstrap-icons';
    import { WifiOff } from 'svelte-bootstrap-icons';

    var closed = true;
    var wifiRequestInterval: number; // Variable to hold the interval for requesting WiFi signal
    var wifiSignalStrength = 0;
    var wifiSignalLevel: number | null  = -1; // -1 for no signal, 0 for very weak, 1 for weak, 2 for good, 3 for very good and 4 for excellent
    var retry: number
    var isMobileView: Boolean;

    function checkScreenSize() {
        isMobileView = window.matchMedia('(max-width: 1023px)').matches;
    }
    
    onMount(() => {
      window.addEventListener('resize', checkScreenSize);
      window.addEventListener('fullscreenchange', checkScreenSize);
      checkScreenSize()
      if (!window.matchMedia('(max-width: 1023px)').matches) {
          server();
      }
      let storagedWifiSignal = localStorage.getItem("wifiSignal")
        if(storagedWifiSignal !== null) {
            wifiSignalLevel = parseInt(storagedWifiSignal)
        }
    });

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

function sendWifiSignal(ws: WebSocket) {
  const wifiRequestData = {
    "request": "wifi_signal"
  };
  ws.send(JSON.stringify(wifiRequestData));
  setTimeout(() => {
    if (!messageReceived) {
      // No message received within the timeout period, close the connection
        ws.close();
        wifiSignalLevel = -1;
        clearInterval(wifiRequestInterval); // Clear WiFi signal request interval on close
        closed = true;
        retrying = false;
        connected = false; // Mark the WebSocket connection as closed
        clearInterval(retry);
        server();
      }
  }, 7000);
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
    // Track whether a retry attempt is in progress
    retrying = false;

    // Track whether the WebSocket connection is already established
    connected = false;
    retry = setInterval(() => {
        if (closed && !retrying && !connected) {
            wifiSignalLevel = -1;
            const ws = new WebSocket('ws://' + getUrlWithNoPort() + ':2604');
            retrying = true;

            ws.addEventListener('open', (event) => {
                // Request WiFi signal every 10 seconds
                wifiRequestInterval = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        if (!isMobileView) {
                            messageReceived = false;
                            sendWifiSignal(ws);
                        }
                    }
                }, 2000);
            });

            ws.addEventListener('message', (event) => {
                messageReceived = true; // Set the flag to true when a message is received
                wifiSignalStrength = event.data;
                //{"wifi_signal_strength": -71} get only the number
                wifiSignalStrength = -(wifiSignalStrength.toString()).replace(/\D/g, '');
                wifiSignalLevel = wifiSignalLevelCalculation(wifiSignalStrength);
                localStorage.setItem("wifiSignal", (wifiSignalLevel).toString());
            });

            ws.addEventListener('close', (event) => {
                ws.close();
                wifiSignalLevel = -1;
                clearInterval(wifiRequestInterval); // Clear WiFi signal request interval on close
                closed = true;
                retrying = false;
                connected = false; // Mark the WebSocket connection as closed
                clearInterval(retry);
                server();
            });

            ws.addEventListener('error', (event) => {
                //console.error('WebSocket encountered an error:', event);
                ws.close();
                console.clear()
                wifiSignalLevel = -1;
                clearInterval(wifiRequestInterval); // Clear WiFi signal request interval on error
                closed = true;
                retrying = false;
                connected = false;
                clearInterval(retry);
                server()
            });

        } else {
            clearInterval(retry);
        }
    }, 4000);
}



</script>
{#if (wifiSignalLevel==3 || wifiSignalLevel == 4)}
<Wifi class="h-8 w-8 mr-4"/>
{/if}
{#if (wifiSignalLevel==2)}
<Wifi2 class="h-8 w-8 mr-4"/>
{/if}
{#if (wifiSignalLevel==1 || wifiSignalLevel == 0)}
<Wifi1 class="h-8 w-8 mr-4"/>
{/if}
{#if (wifiSignalLevel==-1)}
<WifiOff class="h-8 w-8 mr-4"/>
{/if}
<!-- <img class="h-7 my-1 mr-4" alt=" " bind:this={wifiImage}> -->
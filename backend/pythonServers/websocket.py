import asyncio
import websockets
import json
import subprocess
from datetime import datetime, timedelta, timezone
import requests

Fr = 0.000
Fl = 0.000
Br = 0.000
Bl = 0.000


def UserControl(input_hash, ip):
    if ip == '127.0.0.1': 
        return True
    try:
        response = requests.get('http://localhost:3000/controlPermission', cookies={'hash': input_hash, 'websocket': 'yes'})
        response.raise_for_status()  # Raise an exception for 4xx or 5xx status codes
        return response.json().get('control')
        # Assuming checkPermission() is a function to handle the permission response
        # You can call it here or handle the permission response as needed
        # setTimeout(()=>{checkPermission()},5000) in JavaScript is equivalent to waiting for 5 seconds in Python
    except requests.exceptions.RequestException as e:
        # Handle exceptions such as network errors or invalid responses
        print("Error:", e)
        return False
    return False

def UserLogin(input_hash, ip):
    if ip == '127.0.0.1': 
        return True
    try:
        response = requests.get('http://localhost:3000/status', cookies={'hash': input_hash, 'websocket': 'yes'})
        response.raise_for_status()  # Raise an exception for 4xx or 5xx status codes
        return response.json().get('loggedIn')
        # Assuming checkPermission() is a function to handle the permission response
        # You can call it here or handle the permission response as needed
        # setTimeout(()=>{checkPermission()},5000) in JavaScript is equivalent to waiting for 5 seconds in Python
    except requests.exceptions.RequestException as e:
        # Handle exceptions such as network errors or invalid responses
        print("Error:", e)
        return False
    return False

def get_wifi_signal_strength(interface='wlan0'):
    try:
        result = subprocess.run(['iwconfig', interface], capture_output=True, text=True, check=True)
        output_lines = result.stdout.split('\n')
        for line in output_lines:
            if 'Signal level' in line:
                # Extracting the signal level value (in dBm) from the line
                signal_level = int(line.split('Signal level=')[1].split(' ')[0])
                return signal_level
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
    return None

async def handle_connection(websocket, path):
    print(f"Client connected from {websocket.remote_address}")
    try:
        while True:
            message = await websocket.recv()
            try:
                data = json.loads(message)
                # Check if the JSON contains specific keys
                if 'hash' in data:
                    if UserLogin(data["hash"], websocket.remote_address[0]):
                        if 'Fl' in data and 'Fr' in data and 'Bl' in data and 'Br' in data and UserControl(data["hash"], websocket.remote_address[0]):
                            # Print the values if keys are present
                            Fl = data['Fl']
                            Bl = data['Bl']
                            Fr = data['Fr']
                            Br = data['Br']
                            print(f"FL: {Fl}, FR: {Fr}, BL: {Bl}, BR: {Br}")
                        elif 'request' in data and data['request'] == 'wifi_signal':
                            # If the client requests wifi signal, send the signal strength
                            wifi_signal_strength = get_wifi_signal_strength('wlan0')
                            if wifi_signal_strength is not None:
                                response = {'wifi_signal_strength': wifi_signal_strength}
                                await websocket.send(json.dumps(response))
                            else:
                                await websocket.send(json.dumps({'error': 'Failed to fetch WiFi signal strength'}))
                        else:
                            print("User has no control or invalid request")
                    else:
                        print("User not exist or not autorized")
                        await websocket.close()
                else:
                    print("Hash not present")
                    await websocket.close()
            except json.JSONDecodeError:
                print("Invalid JSON format in received message")
                await websocket.close()

    except websockets.exceptions.ConnectionClosedError:
        print("Connection closed")

start_server = websockets.serve(handle_connection, "0.0.0.0", 2604)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()

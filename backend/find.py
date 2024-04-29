import socket
import json
from scapy.all import ARP, Ether, srp

port = 8096

def get_device_name(ip):
    try:
        return socket.gethostbyaddr(ip)[0]
    except socket.herror:
        return "Unknown"

def check_port(ip, port):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(1)  # Adjust the timeout as needed
    try:
        result = sock.connect_ex((ip, port))
        if result == 0:
            return "Open"
        else:
            return "Closed"
    except Exception as e:
        return "Error"
    finally:
        sock.close()

def scan_local_network(ip_range):
    arp_request = ARP(pdst=ip_range)
    ether = Ether(dst="ff:ff:ff:ff:ff:ff")
    packet = ether / arp_request
    result = srp(packet, timeout=3, verbose=False)[0]

    devices = []
    for sent, received in result:
        device_name = get_device_name(received.psrc)
        port_status = check_port(received.psrc, port)
        devices.append({'ip': received.psrc, 'mac': received.hwsrc, 'name': device_name, 'port_status': port_status})

    return devices

def main():
    ip_range = "192.168.1.0/24"  # Change this to match your network's IP range
    devices = scan_local_network(ip_range)
    print(json.dumps(devices))  # Output the results as a JSON string

main()

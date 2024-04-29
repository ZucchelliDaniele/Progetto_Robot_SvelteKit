<script lang="ts">
    import { onMount } from "svelte";
    import axios from 'axios';

    var loaded = false
    onMount(async () => {
        try {
            const response = await axios.get("http://192.168.1.14:3000/find", { withCredentials: true });
            const devicesData = JSON.parse(response.data);
            console.log(devicesData);
            const devices = [];
            if(devices.length != 0) loaded = true
            for (const device of devicesData) {
                devices.push(new Device(device.ip, device.hostname, device.port));
                devices.push(new Device("test", "test", "test"));
                devices.push(new Device("test", "test", "test"));
                devices.push(new Device("test", "test", "test"));
                devices.push(new Device("test", "test", "test"));
                devices.push(new Device("test", "test", "test"));
                devices.push(new Device("test", "test", "test"));
            }
            createCards(devices);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    });

    var isMobileView = window.matchMedia('(max-width: 1023px)').matches;
    var page: HTMLDivElement;

    class Device {
        constructor(public ip: string, public hostname: string, public port: string) {}
    }

    function createCards(devices: Device[]) {
        var rows = 0;
        page.innerHTML = "";
        devices.forEach((device, index) => { 
            var card = document.createElement("div");
            var title = document.createElement("h1");
            var description = document.createElement("p");
            title.innerHTML = removeSuffix(device.hostname);
            if (index % 2 == 0) {
                title.className = "text-2xl font-bold text-red m-2";
            } else {
                title.className = "text-2xl font-bold text-white-blue m-2";
            }
            card.appendChild(title);
            description.innerHTML = device.ip;
            description.className = "text-lg dark:text-white m-2";
            card.appendChild(description);
            card.className = "overflow-hidden m-6 rounded-lg text-center h-fit hover:cursor-pointer dark:ring-white ring-gray dark:ring-white ring bg-white-gray dark:bg-black-gray transition ease-in dark:ease-out duration-500";
            card.onclick = function() {
                window.location.href = `http://${device.ip}:${device.port}`;
            };
            page.appendChild(card);
            rows++;
        });
    }

    function removeSuffix(hostname: string): string {
        const parts = hostname.split('.');
        return parts[0];
    }
</script>

<div class="py-2 px-3 grid grid-cols-6 w-screen" bind:this={page}>
    {#if !loaded}
        <img src="./images/loading_circle.gif" class="absolute inset-0 m-auto">
    {/if}
</div>


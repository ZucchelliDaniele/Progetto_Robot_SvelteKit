<script lang="ts">
    "use strict";
    import { onMount } from 'svelte';
    import Chart, { type ChartConfiguration, type ChartTypeRegistry } from 'chart.js/auto';

    var hoursChart: Chart;
    var currentTheme: String;


    var days = ["18/12/2023", "19/12/2023", "20/12/2023", "21/12/2023", "22/12/2023", "23/12/2023", "24/12/2023"]

    let Canvas: HTMLCanvasElement;

    function updateColor() {
        setInterval(()=>{
            if(document.documentElement.classList.contains('dark') && currentTheme == "light") {
                currentTheme = "dark";
                hoursChart.destroy()
                createChart()
            }
            else if(!document.documentElement.classList.contains('dark') && currentTheme == "dark") {
                currentTheme = "light"
                hoursChart.destroy()
                createChart()
            }
        }, 100)
    }

    function createChart() {
        var ShowAnimation:boolean  = true 
        if (window.location.href.includes("localhost") || window.location.href.includes("127.0.0.1")) ShowAnimation = false 
        if (Canvas) {  // Ensure xy is not undefined before using it
            const config: ChartConfiguration = {
                type: 'bar',
                data: {
                labels: days,
                datasets: 
                    [{
                        label: 'Hours Standby',
                        data: [0,3,4,1,5,6,3],
                        borderWidth: 2,
                        borderRadius: 5,
                        borderSkipped: false,
                        // borderColor: '#36A2EB',
                        // backgroundColor: '#9BD0F5',
                    },
                    {
                        label: 'Hours Moving',
                        data: [1,2,5,2,4,7,2],
                        borderWidth: 2,
                        borderRadius: Number.MAX_VALUE,
                        borderSkipped: false,
                        // borderColor: '#36A2EB',
                        // backgroundColor: '#9BD0F5',
                    }
                    ]
                },
                options: {
                    animation: ShowAnimation,
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                            display: true,
                            labels: {
                                color: function() {
                                    if (currentTheme == "dark") {
                                        return '#ffffff';
                                    } else {
                                        return '#747473';
                                    }
                                },
                            },
                        },
                        title: {
                            display: true,
                            text: 'Hours per day',
                            color: function() {
                                if (currentTheme == "dark") {
                                    return '#ffffff';
                                } else {
                                    return '#666666';
                                }
                            },
                        }
                    },
                    scales: {
                        x: {
                        grid: {
                            color: function() {
                                if (currentTheme == "dark") {
                                    return '#707375';
                                } else {
                                    return '#C8C6C2';
                                }
                            },
                        }
                    },
                        y: {
                            min: 0,
                            max: 24,
                            grid: {
                                color: function() {
                                    if (currentTheme == "dark") {
                                        return '#707375';
                                    } else {
                                        return '#C8C6C2';
                                    }
                                },
                            }
                        },
                    }
                }
                // Add other configuration options as necessary
            };
            hoursChart = new Chart(Canvas, config);
        }
    }


    onMount(() => {
        createChart() 
        if (localStorage.theme) {
            currentTheme = localStorage.theme
        }
        updateColor()
        window.addEventListener('resize', ()=>{
            hoursChart.destroy()
            createChart()
        });
        window.addEventListener('fullscreenchange', ()=>{
            hoursChart.destroy()
            createChart()
        });
    });

</script>

<canvas bind:this={Canvas}></canvas>

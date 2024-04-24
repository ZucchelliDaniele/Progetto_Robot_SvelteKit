<script lang="ts">
    "use strict"
	var webcamJoystickDiv: HTMLDivElement
		import Webcam from './Webcam.svelte';
		import Joystick from './Joystick.svelte';
		export var X: number
		export var Y: number
		export var Fl: number
		export var Fr: number
		export var Bl: number
		export var Br: number

		// var class_name;
		// var isMobileView = window.matchMedia('(max-width: 1023px)').matches;
		// if(isMobileView) {
		// 	document.getElementById("webcamJoystickDiv").classList = "grid grid-rows-2 min-h-full min-w-full"
		// 	class_name= "mx-auto items-center align-center hover:cursor-pointer ring-2 ring-gray dark:ring-white-gray rounded-3xl"
		// 	document.getElementById("webcamDiv").classList ="items-center min-w-fit ring-2 rounded-xl my-4 mx-2 min-h-fit align-middle ring-gray dark:ring-white-gray rounded-3xl"
		// 	if (window.location.href.includes("localhost") || window.location.href.includes("127.0.0.1")) {
		// 		document.getElementById("webcamDiv").classList ="hidden items-center min-w-fit ring-2 rounded-xl ml-8 m-2 min-h-fit align-middle ring-gray dark:ring-white-gray rounded-3xl"
		// 		class_name = "float-right hover:cursor-pointer ring-2 ring-gray dark:ring-white-gray rounded-3xl my-4 mr-1"
		// 	}
		// }
		// else {
		// 	class_name = "float-right hover:cursor-pointer ring-2 ring-gray dark:ring-white-gray rounded-3xl my-4 mr-1" 
		// 	document.getElementById("webcamDiv").classList ="items-center min-w-fit ring-2 rounded-xl ml-8 m-2 min-h-fit align-middle ring-gray dark:ring-white-gray rounded-3xl"
		// 	if (window.location.href.includes("localhost") || window.location.href.includes("127.0.0.1")) {
		// 		document.getElementById("webcamDiv").classList ="hidden items-center min-w-fit ring-2 rounded-xl ml-8 m-2 min-h-fit align-middle ring-gray dark:ring-white-gray rounded-3xl"
		// 		class_name = "float-right hover:cursor-pointer ring-2 ring-gray dark:ring-white-gray rounded-3xl m-8" 
		// 		document.getElementById("webcamJoystickDiv").classList = "min-h-full min-w-full"
		// 	}
		// }
		// document.addEventListener("DOMContentLoaded", function () {
    	// 	createJoystick(class_name);
		// });
		// window.JoystickUpdate = function () {
		// 	document.getElementById("joy3Div").innerHTML = ""
    	// 	createJoystick(class_name)
		// }
</script>

<div bind:this = {webcamJoystickDiv} class="grid grid-cols-2 min-w-fit">
	<div class="items-center min-w-fit min-h-fit ring-2 ml-5 rounded-xl m-2 mr-6 p-4 mt-20 flex ring-gray dark:ring-white-gray rounded-3xl">
		<Webcam className=""/>
	</div>
	<div class="mt-16">
		<Joystick bind:X bind:Y bind:Fr bind:Fl bind:Br bind:Bl/>
	</div>
</div>
<script lang="ts">
    import { ArrowRightShort } from "svelte-bootstrap-icons";
    import Webcam from "$lib/components/Webcam.svelte";
</script>

<div class="py-2 px-3 grid gap-2 grid-cols-2">
    <div class="grid grid-rows-2">
        <div>
            <div class="items-center min-w-fit min-h-full p-4 ring-2 rounded-xl m-6 flex flex-col ring-gray dark:ring-white-gray rounded-3xl">
                <Webcam className="" />
                <div class="h-fit text-center dark:text-white mx-auto m-5 text-3xl font-bold">Line Follower</div>
            <div class="h-fit text-center dark:text-white mx-auto m-5 py-6 px-14 text-3xl font-bold ring-2 bg-green rounded-xl ring-green hover:cursor-pointer"
            onmousedown=""
            onmouseup=""
            onclick=""
            >Start</div>
            </div>
        </div>		
    </div>
    <div>
        <div class="overflow-hidden bg-gray dark:bg-black rounded-3xl ring-2 ring-black dark:ring-white flex-col items-center justify-center m-6 transition ease-in dark:ease-out duration-500">
            <!-- TITLE -->
            <div class="dark:text-white text-center text-2xl font-bold my-3">
                <span>Chat GPT-4 Turbo</span>
            </div>
            <!-- TEXT -->
            <div class="overflow-auto h-[70vh]" id="Chat">	
                <div class="dark:text-white mx-20 my-3 ring-2 rounded-3xl p-2 dark:ring-white ring-black">
                    <div>
                        <img class="h-8 inline-flex" src="./images/ai_white.png" id="Ai: 0">
                    <h1 class="inline-flex text-2xl ml-2">System</h1>
                    <h1 class="text-xl mt-3 ml-2">Insert password:</h1>
                    <div class="flex my-3 w-72 ml-2 relative">
                        <input 
                            type="password"
                            placeholder="Password..." 
                            class="bg-white-gray dark:bg-black-gray ring-2 dark:ring-white dark:text-white text-black ring-black rounded-xl placeholder-black dark:placeholder-white p-2 w-72 focus:outline-0 focus:ring pr-10"
                            id="PasswordInput"
                        >
                        <ArrowRightShort class="cursor-pointer absolute dark:text-white right-2 top-2 h-6 w-6 dark:hover:ring-white ring-2 active:ring rounded-lg hover:ring-black ring-white-gray dark:ring-black-gray"/>
                    </div>
                    <h1 class="text-xl mt-3 ml-2">Insert Code:</h1>
                    <div class="flex my-3 w-72 ml-2 relative">
                        <input 
                            type="password"
                            placeholder="Code..." 
                            class="bg-white-gray dark:bg-black-gray ring-2 dark:ring-white dark:text-white text-black ring-black rounded-xl placeholder-black dark:placeholder-white p-2 w-72 focus:outline-0 focus:ring pr-10"
                            id="CodeInput"
                        >
                        <ArrowRightShort class="cursor-pointer absolute dark:text-white right-2 top-2 h-6 w-6 dark:hover:ring-white ring-2 active:ring rounded-lg hover:ring-black ring-white-gray dark:ring-black-gray"/>
                    </div>
                    </div>
                </div>				
            </div>
            <!-- INPUT -->
            <div class="flex items-center justify-center my-3 w-72 mx-auto relative">
                <input 
                    type="text"
                    placeholder="Type here..." 
                    class="bg-white-gray dark:bg-black-gray ring-2 dark:ring-white dark:text-white text-black ring-black rounded-xl placeholder-black dark:placeholder-white p-2 w-72 focus:outline-0 focus:ring pr-10"
                    id="ChatInput"
                >
                <ArrowRightShort class="cursor-pointer absolute dark:text-white right-2 top-2 h-6 w-6 dark:hover:ring-white ring-2 active:ring rounded-lg hover:ring-black ring-white-gray dark:ring-black-gray"/>
            </div>                                     
        </div>
                                                                   
    </div>
</div>
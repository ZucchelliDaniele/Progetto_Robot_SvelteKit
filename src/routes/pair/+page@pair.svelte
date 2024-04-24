<script>
    import { ArrowRightShort } from "svelte-bootstrap-icons";
</script>

<div class="absolute left-1/2 transform -translate-x-1/2 mt-20">
    <span class="text-6xl text-black dark:text-white">Insert this code to pair:</span>
</div>
<div class="mx-auto h-screen flex items-center justify-center">
    <div class="flex items-center justify-center my-3 w-4/12 mx-auto relative">
        <input
            type="text"
            placeholder="Type here..."
            class="bg-white-gray dark:bg-black-gray ring-2 dark:ring-white dark:text-white text-black ring-black w-full rounded-xl placeholder-black dark:placeholder-white p-2 focus:outline-0 focus:ring pr-10"
            id="PairInput"
            name="hashedcode"
        >
        <ArrowRightShort class="cursor-pointer absolute dark:text-white right-2 top-2 h-6 w-6 dark:hover:ring-white ring-2 active:ring rounded-lg hover:ring-black ring-white-gray dark:ring-black-gray"/>
    </div>
</div>
<script lang="ts">
    import { onMount } from 'svelte';

    let theme_mode: HTMLImageElement;

    onMount(() => {
        if (localStorage.theme === 'dark') {
            theme_mode.src = "images/dark.png";
        } else {
            theme_mode.src = "images/light.png";
        }
    });

    function change_theme_color() {
        if (localStorage.theme === 'dark') {
            document.documentElement.classList.remove('dark')
            localStorage.setItem("theme", "light");
            theme_mode.src = "images/light.png"
        } else{
            localStorage.setItem("theme", "dark");
            document.documentElement.classList.add('dark')
            theme_mode.src = "images/dark.png"
        }
    }
</script>

<div class="flex lg:flex-1">
    <div class="-m-1.5 p-1.5">
        <span class="sr-only">Your Company</span>
        <button on:click={change_theme_color}>
            <img bind:this={theme_mode} class="h-7 w-auto flex-none items-center justify-center rounded-lg bg-gray-50 hover:cursor-pointer hover:ring-2 hover:ring-black dark:hover:ring-white" alt="">
        </button>
    </div>
</div>

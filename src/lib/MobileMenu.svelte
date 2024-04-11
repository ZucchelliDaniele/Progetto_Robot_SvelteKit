<script lang="ts">
    import Theme from "./Theme.svelte"
    import { sleep } from "./main.js"
    import { createEventDispatcher } from 'svelte';
  
    const dispatch = createEventDispatcher();

    let MobileMenuDropdown: HTMLDivElement;
    let stateDropDown= true;
    let MobileMenuArrow: SVGSVGElement;

    function DropDownMenu() {
        if(stateDropDown) {
            MobileMenuDropdown.classList.add('transition', 'ease-out','duration-200');
            MobileMenuDropdown.classList.remove('transition', 'ease-in','duration-150');
            MobileMenuDropdown.classList.remove('opacity-0', 'translate-y-1', 'hidden');
            MobileMenuDropdown.classList.add('opacity-100', 'translate-y-0');
            MobileMenuArrow.classList.add("rotate-180")
            stateDropDown = false
        }
        else {
            MobileMenuDropdown.classList.remove('transition', 'ease-out','duration-200');
            MobileMenuDropdown.classList.add('transition', 'ease-in','duration-150');
            MobileMenuDropdown.classList.remove('opacity-100', 'translate-y-0');
            MobileMenuDropdown.classList.add('opacity-0', 'translate-y-1');
            MobileMenuArrow.classList.remove("rotate-180")
            sleep(150).then(() => {
                MobileMenuDropdown.classList.add('hidden')
            });
            stateDropDown = true
            }
    }


    function CloseMobileMenu() {
        dispatch('open-mobile-menu', {
            value: false,
        });
        MobileMenuDropdown.classList.remove('transition', 'ease-out','duration-200');
        MobileMenuDropdown.classList.add('transition', 'ease-in','duration-150');
        MobileMenuDropdown.classList.remove('opacity-100', 'translate-y-0');
        MobileMenuDropdown.classList.add('opacity-0', 'translate-y-1');
        MobileMenuArrow.classList.remove("rotate-180")
        // make the transition finish (if fixed transition doesn't works, absolute does work)
        sleep(150).then(() => {
            MobileMenuDropdown.classList.add('hidden')
        });
        stateDropDown = true
    }
</script>

<!-- Background backdrop, show/hide based on slide-over state. -->
<div class="absolute inset-y-0 right-0 z-10 w-full bg-white-gray dark:bg-black-gray overflow-y-auto px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray dark:sm:ring-white transition ease-in dark:ease-out duration-1000">
    <div class="flex items-center justify-between">
        <Theme/>
        <button type="button" on:click={CloseMobileMenu} class="-m-2.5 rounded-lg p-2.5 ring-2 hover:ring-black dark:hover:ring-white dark:ring-black-gray ring-white-gray">
            <span class="sr-only dark:text-white">Close menu</span>
            <svg class="h-6 w-6 dark:text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </div>
    <div class="mt-6 flow-root">
        <div class="-my-6 divide-y divide-gray-500/10">
            <div class="space-y-2 py-6">
                <div class="-mx-3">
                    <button type="button" on:click={DropDownMenu} class="mx-3 flex items-center gap-x-1 text-base font-semibold leading-7 dark:text-white" aria-controls="disclosure-1" aria-expanded="false">
                        Robot
                        <!-- DropDownMenu('HeaderDropDownMenu', 'HeaderDropDownButton', 'fixed', 'absolute', false, 'MenuArrow' )
                        Expand/collapse icon, toggle classes based on menu open state.
            
                        Open: "rotate-180", Closed: ""
                        -->
                        <svg class="h-5 w-5 " viewBox="0 0 20 20" fill="currentColor" bind:this={MobileMenuArrow} aria-hidden="true"> <!-- rotate the ^ on the mobile menu -->
                            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                        </svg>
                    </button>
                    <!-- 'Robot' sub-menu, show/hide based on menu state. -->
                    <div class="mt-2 space-y-2 transition ease-out duration-200 opacity-0 translate-y-1 hidden" bind:this={MobileMenuDropdown}>
                        <a href="./index.html" class="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 dark:text-white hover:bg-gray-50">Analytics</a>
                        <a href="./camera.html" class="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 dark:text-white hover:bg-gray-50">Camera</a>
                        <a href="./security.html" class="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 dark:text-white hover:bg-gray-50">Security</a>
                        <a href="./integrations.html" class="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 dark:text-white hover:bg-gray-50">Integrations</a>
                        <a href="./automations.html" class="block inline-flex rounded-lg py-2 pl-6 text-sm font-semibold leading-7 dark:text-white hover:bg-gray-50">Automations +</a>
                        <a href="./automations.html" class="block inline-flex rounded-lg py-2 pr-3 text-sm mt-1 leading-7 dark:text-white hover:bg-gray-50">GPT-4 Turbo</a>
                        <a href="#" class="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 dark:text-white hover:bg-gray-50">Watch demo</a>
                        <a href="mailto:zucchelli.daniele.studente@itispaleocapa.it" class="block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 dark:text-white hover:bg-gray-50">Contact Us</a>
                    </div>
                </div>
                <a href="#" class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 dark:text-white hover:bg-gray-50">Features</a>
                <a href="#" class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 dark:text-white hover:bg-gray-50">Tutorials</a>
                <a href="#" class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 dark:text-white hover:bg-gray-50">Company</a>
            </div>
            <div class="py-6 dark:text-white">
                <a href="#" class="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 dark:text-white hover:bg-gray-50">Exit</a>
            </div>
        </div>
    </div>
</div>
<script lang="ts">
  import DropDownHeader from "./DropDownHeader.svelte"
  import WifiSignal from "./WifiSignal.svelte";
  import Theme from "./Theme.svelte"
  import Clock from "./Clock.svelte";
</script>

<Theme/>
<div class="hidden lg:flex lg:gap-x-12">
  <DropDownHeader/>
  <a href="#" class="text-sm font-semibold leading-6 dark:text-white">Features</a>
  <a href="#" class="text-sm font-semibold leading-6 dark:text-white">Tutorials</a>
  <a href="#" class="text-sm font-semibold leading-6 dark:text-white">Company</a>
  </div>
  <div class="hidden lg:flex lg:flex-1 lg:justify-end dark:text-white text-black"> 
    <WifiSignal/>
    <Clock/>
  </div>
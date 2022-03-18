<template>
  <div class="app-container relative h-full min-h-screen">
<!--    <TheNavBar />-->
    <div class="nav-links-wrapper pt-20 text-white">
      <div class="nav-links-item">
        <router-link class="nav-link" to="/manager">FARM MANAGER</router-link>
      </div>
      <router-link to="/" class="px-10 flex justify-center align-middle nav-link">
        <p class="text-4xl pt-3 px-1 mt-1 text-white">GEM</p>
        <img :width="50" :height="50" src="./assets/400x600.gif" />
        <p class="text-4xl pt-3 px-2 mt-1 text-white">FARM</p>
      </router-link>
      <div class="nav-links-item">
        <router-link class="nav-link" to="/farmer">FARMER</router-link>
      </div>
    </div>
    <div class="nav-links-underline-wrapper">
      <div class="nav-links-underline"></div>
    </div>
    <div class="nav-description italic mt-5 text-center text-white">by Gemworks</div>

    <div class="main-container-wrapper">
      <div class="py-10 main-container">
        <router-view />
      </div>
    </div>

    <div class="pt-10"></div>
    <TheCat />
    <TheFooter />
<!--    <video class="background-video" src="./assets/lava.mp4" loop muted autoplay></video>-->
  </div>
</template>

<script>
import TheNavBar from '@/components/TheNavBar';
import TheFooter from '@/components/gem-farm/TheFooter';
import TheCat from '@/components/gem-farm/TheCat';
export default {
  components: { TheCat, TheFooter, TheNavBar },
};
</script>

<style>
* {
  /*font-family: 'Press Start 2P', monospace;*/
}
input[type='radio']:checked + span {
  @apply text-black;
}
.app-container {
  background: url("./assets/logo_nft.png") no-repeat;
  background-position: center;
  background-size: cover;
}
.background-video {
  position: fixed;
  right: 0;
  bottom: 0;
  min-width: 100%;
  min-height: 100%;
  z-index: -1;
  object-fit: cover;
}
.nav-links-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-links-underline {
  width: 1024px;
  height: 4px;
  border-radius: 100%;
  background-color: #FEBD4D;
  box-shadow: 0 0 5px #FEBD4D;
}
.nav-links-underline-wrapper {
  display: flex;
  justify-content: center;
}
.nav-links-item {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 192px;
}
.nav-link {
  text-decoration: none !important;
  transition: all .5s ease;
  font-family: 'Press Start 2P', monospace;
}
.nav-description {
  font-family: 'Press Start 2P', monospace;
}
.nav-link:hover {
  color: white;
  text-shadow: 0 0 3px #FEBD4D;
}
.main-container {
  width: 1024px;
}
.main-container-wrapper {
  display: flex;
  justify-content: center;
}
</style>

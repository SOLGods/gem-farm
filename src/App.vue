<template>
  <div class="app-container relative h-full min-h-screen">
<!--    <TheNavBar />-->
    <div class="app-header">
      <div class="nav-links-wrapper pt-14 text-white">
        <h2 class="nav-title">The Temple</h2>
      </div>
      <div class="nav-links-underline-wrapper">
        <div class="nav-links-underline"></div>
      </div>
    </div>

    <div class="main-container-wrapper">
      <div class="py-10 main-container">
        <router-view />
      </div>
    </div>

    <div class="pt-10"></div>
  </div>
</template>

<script>
import TheNavBar from '@/components/TheNavBar';
import TheFooter from '@/components/gem-farm/TheFooter';
export default {
  components: { TheFooter, TheNavBar },
};
</script>

<style>
* {
  /*font-family: 'Press Start 2P', monospace;*/
  color: white;
}
input[type='radio']:checked + span {
  @apply text-black;
}
.app-container {
  background: url("./assets/logo_nft.png") no-repeat;
  background-position: center;
  background-size: cover;
  position: relative;
}
@media (max-width: 767px) {
  .app-container {
    background-image: url("./assets/logo_nft_mobile.png");
  }
}
.nav-title {
  text-align: center;
  color: white;
  font-size: 58px;
  font-weight: bold;
  font-family: 'Playfair Display', serif;
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
.app-header {
  position: relative;
  z-index: 2;
}
</style>

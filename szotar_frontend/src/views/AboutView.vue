
<template>
    <div class="max-w-7xl m-auto">
      <div class="home">
        <img alt="Vue logo" src="../assets/logo.png" />
        <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" />
      </div>
      <div class="about">
        <h1>This is an about page</h1>
      </div>
     

      <h1 class="text-3xl font-bold underline">
      Hello world!
    </h1>

    <label for="message" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your message</label>
    <textarea id="message" rows="4" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 resize-none" placeholder="Write your thoughts here..."></textarea>
  </div>
</template>

<script lang="ts" setup>

import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src
import { ref } from 'vue'

const isShowModal = ref(false)
function closeModal() {
  isShowModal.value = false
}
function showModal() {
  isShowModal.value = true
}
</script>
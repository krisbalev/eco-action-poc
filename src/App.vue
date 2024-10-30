<!-- src/App.vue -->
<template>
  <div class="container mx-auto px-4">
    <h1 class="text-4xl font-bold text-center my-8 text-gray-800">Community Tasks Map</h1>
    <div class="flex flex-col md:flex-row">
      <!-- Left Column: AddTaskForm and TaskList -->
      <div class="md:w-1/3 mb-4 md:mb-0 md:mr-4">
        <AddTaskForm />
        <TaskList />
      </div>
      <!-- Right Column: MapView -->
      <div class="md:w-2/3">
        <MapView />
      </div>
    </div>
  </div>
</template>

<script setup>
import AddTaskForm from './components/AddTaskForm.vue';
import MapView from './components/MapView.vue';
import TaskList from './components/TaskList.vue';
</script>

<style>
/* Add any global styles here */
</style>
  
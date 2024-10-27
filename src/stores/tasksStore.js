// src/stores/tasksStore.js
import { ref } from "vue";

export const tasks = ref([]);

// Function to add a new task
export const addTask = (task) => {
  tasks.value.push(task);
};

// Function to update a task by ID
export const updateTask = (updatedTask) => {
  const index = tasks.value.findIndex((task) => task.id === updatedTask.id);
  if (index !== -1) {
    tasks.value[index] = updatedTask;
  }
};

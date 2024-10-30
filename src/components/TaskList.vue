<!-- src/components/TaskList.vue -->
<template>
    <div class="bg-white p-4 rounded shadow-md mt-4">
      <h2 class="text-xl font-semibold mb-4">All Tasks</h2>
      <ul>
        <li v-for="task in tasksReversed" :key="task.id" class="mb-4">
          <div class="p-2 border rounded">
            <p><strong>Description:</strong> {{ task.description }}</p>
            <p><strong>Budget:</strong> ${{ task.budget }}</p>
            <p>
              <strong>Status:</strong>
              <span :class="task.status === 'completed' ? 'text-green-600' : 'text-yellow-600'">
                {{ task.status }}
              </span>
            </p>
            <p v-if="task.assignedTo">
              <strong>Completed By:</strong> {{ task.assignedTo }}
            </p>
            <div v-if="task.status === 'pending'" class="mt-2">
              <button
                @click="claimTask(task.id)"
                class="bg-green-500 text-white px-2 py-1 rounded"
              >
                Claim Task
              </button>
            </div>
            <p v-else class="text-green-600 font-semibold mt-2">Task Completed</p>
          </div>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import { tasks, updateTask } from '@/stores/tasksStore';
  
  const tasksReversed = computed(() => [...tasks.value].reverse());
  
  const claimTask = (taskId) => {
    const residentName = prompt('Enter your name to claim this task:');
    if (residentName) {
      const task = tasks.value.find((t) => t.id === taskId);
      if (task) {
        task.status = 'completed';
        task.assignedTo = residentName;
        updateTask(task);
        alert('Task claimed successfully!');
      }
    }
  };
  </script>
  
  <style scoped>
  /* Optional: Add component-specific styles */
  ul {
    list-style-type: none;
    padding: 0;
  }
  li {
    margin-bottom: 1rem;
  }
  </style>
  
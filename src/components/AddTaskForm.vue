<!-- src/components/AddTaskForm.vue -->
<template>
    <div class="bg-white p-4 rounded shadow-md">
        <h2 class="text-xl font-semibold mb-4">Add New Task</h2>
        <form @submit.prevent="handleSubmit">
            <div class="mb-4">
                <label class="block text-gray-700">Description</label>
                <textarea v-model="task.description" class="w-full border rounded p-2" required></textarea>
            </div>
            <div class="mb-4">
                <label class="block text-gray-700">Budget</label>
                <input type="number" v-model.number="task.budget" class="w-full border rounded p-2" required />
            </div>
            <div class="mb-4">
                <label class="block text-gray-700">Location</label>
                <p>Select a location on the map</p>
            </div>
            <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Add Task</button>
        </form>
    </div>
</template>

<script setup>
import { reactive } from 'vue';
import { addTask } from '@/stores/tasksStore';
import { selectedCoordinates } from '@/stores/mapStore'; // We'll create this store later

const task = reactive({
    description: '',
    budget: null,
    coordinates: null,
});

const handleSubmit = () => {
    if (task.description && task.budget && selectedCoordinates.value) {
        addTask({
            id: Date.now(),
            description: task.description,
            budget: task.budget,
            coordinates: selectedCoordinates.value,
            status: 'pending',
            assignedTo: null,
        });
        // Reset the form
        task.description = '';
        task.budget = null;
        selectedCoordinates.value = null;
        alert('Task added successfully!');
    } else {
        alert('Please fill in all fields and select a location on the map.');
    }
};
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
<!-- src/components/MapView.vue -->
<template>
    <div class="map-container">
        <div ref="mapContainer" class="map"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { tasks } from '@/stores/tasksStore';
import { selectedCoordinates } from '@/stores/mapStore';
import { updateTask } from '@/stores/tasksStore';


mapboxgl.accessToken = 'pk.eyJ1Ijoia2JhbGV2IiwiYSI6ImNtMnMwem82eDFqNGgyaXNmZ2E4Y21xdnQifQ.eDrINkb4a6AsJ8ZmyOcNbw'; // Replace with your token

const mapContainer = ref(null);
const map = ref(null);

onMounted(() => {
    map.value = new mapboxgl.Map({
        container: mapContainer.value,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [5.4697, 51.4416], // Eindhoven coordinates
        zoom: 12,
    });

    map.value.addControl(new mapboxgl.NavigationControl());

    map.value.on('load', () => {
        // Initialize tasks layer
        addTasksLayer();

        // Update tasks layer when tasks change
        watch(
            tasks,
            () => {
                updateTasksLayer();
            },
            { deep: true }
        );
    });

    // Handle map clicks for selecting task locations
    map.value.on('click', (e) => {
        // If the user is adding a task, set the selected coordinates
        selectedCoordinates.value = [e.lngLat.lng, e.lngLat.lat];
        alert('Location selected for the new task.');
    });
});

onBeforeUnmount(() => {
    if (map.value) {
        map.value.remove();
    }
});

// Function to add tasks layer
const addTasksLayer = () => {
    map.value.addSource('tasks', {
        type: 'geojson',
        data: getTasksGeoJSON(),
    });

    map.value.addLayer({
        id: 'tasks',
        type: 'symbol',
        source: 'tasks',
        layout: {
            'icon-image': [
                'case',
                ['==', ['get', 'status'], 'completed'],
                'marker-15',
                'rocket-15',
            ],
            'icon-size': 1.5,
            'text-field': ['get', 'description'],
            'text-offset': [0, 1.2],
            'text-anchor': 'top',
        },
    });

    // Add click event for tasks
    map.value.on('click', 'tasks', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const properties = e.features[0].properties;

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(getTaskPopupHTML(properties))
            .addTo(map.value);
    });

    // Change cursor on hover
    map.value.on('mouseenter', 'tasks', () => {
        map.value.getCanvas().style.cursor = 'pointer';
    });

    map.value.on('mouseleave', 'tasks', () => {
        map.value.getCanvas().style.cursor = '';
    });

    map.value.on('click', 'tasks', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const properties = e.features[0].properties;

        const popup = new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(getTaskPopupHTML(properties))
            .addTo(map.value);

        // Add event listener for "Claim Task" button
        if (properties.status === 'pending') {
            popup.on('open', () => {
                document.getElementById('claim-task').addEventListener('click', () => {
                    claimTask(properties.id);
                    popup.remove(); // Close the popup after claiming
                });
            });
        }
    });
};

// Function to update tasks layer
const updateTasksLayer = () => {
    const source = map.value.getSource('tasks');
    if (source) {
        source.setData(getTasksGeoJSON());
    }
};

// Function to claim a task
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

// Helper function to get tasks as GeoJSON
const getTasksGeoJSON = () => {
    return {
        type: 'FeatureCollection',
        features: tasks.value.map((task) => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: task.coordinates,
            },
            properties: {
                ...task,
            },
        })),
    };
};

// Helper function to generate task popup HTML
const getTaskPopupHTML = (properties) => {
    return `
      <div>
        <p><strong>Description:</strong> ${properties.description}</p>
        <p><strong>Budget:</strong> $${properties.budget}</p>
        <p><strong>Status:</strong> ${properties.status}</p>
        ${properties.status === 'pending'
            ? '<button id="claim-task" class="bg-green-500 text-white px-2 py-1 rounded mt-2">Claim Task</button>'
            : `<p><strong>Completed by:</strong> ${properties.assignedTo}</p>`
        }
      </div>
    `;
};
</script>

<style scoped>
.map-container {
    position: relative;
    width: 100%;
    height: 80vh;
}

.map {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
}
</style>
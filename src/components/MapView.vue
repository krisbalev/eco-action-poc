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
import { tasks, updateTask } from '@/stores/tasksStore';
import { selectedCoordinates } from '@/stores/mapStore';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN; // Replace with your token

const mapContainer = ref(null);
const map = ref(null);

onMounted(() => {
    map.value = new mapboxgl.Map({
        container: mapContainer.value,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [5.4697, 51.4416],
        zoom: 12,
    });

    map.value.addControl(new mapboxgl.NavigationControl());

    map.value.on('load', () => {
        addTasksLayer();

        // Watch for changes in tasks to update the map layers
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
        // Check if click is on a marker
        const features = map.value.queryRenderedFeatures(e.point, {
            layers: ['tasks'], // Ensure this matches your layer ID
        });

        if (features.length) {
            // Click was on a marker; do nothing
            return;
        }

        // Otherwise, select the location
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
                'marker-15', // Icon for completed tasks
                'embassy-15', // Icon for pending tasks
            ],
            'icon-size': 1.5,
            'text-field': ['get', 'description'],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 12,
            'text-offset': [0, 1.5],
            'text-anchor': 'top',
        },
        paint: {
            'text-color': '#000000',       // Text color (black)
            'text-halo-color': '#FFFFFF',  // Halo color (white)
            'text-halo-width': 2,          // Width of the halo
            'text-halo-blur': 0.5,         // Optional blur
        },
    });

    // Add click event for tasks
    map.value.on('click', 'tasks', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const properties = e.features[0].properties;

        // Create the popup content as DOM elements
        const popupContent = document.createElement('div');

        const description = document.createElement('p');
        description.innerHTML = `<strong>Description:</strong> ${properties.description}`;
        popupContent.appendChild(description);

        const budget = document.createElement('p');
        budget.innerHTML = `<strong>Budget:</strong> $${properties.budget}`;
        popupContent.appendChild(budget);

        const status = document.createElement('p');
        status.innerHTML = `<strong>Status:</strong> ${properties.status}`;
        popupContent.appendChild(status);

        if (properties.status === 'completed') {
            const assignedTo = document.createElement('p');
            assignedTo.innerHTML = `<strong>Completed By:</strong> ${properties.assignedTo}`;
            popupContent.appendChild(assignedTo);
        } else {
            const button = document.createElement('button');
            button.textContent = 'Claim Task';
            button.className = 'bg-green-500 text-white px-2 py-1 rounded mt-2';
            button.addEventListener('click', () => {
                claimTask(properties.id);
                popup.remove(); // Close the popup after claiming
            });
            popupContent.appendChild(button);
        }

        const popup = new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setDOMContent(popupContent)
            .addTo(map.value);
    });

    // Change cursor on hover
    map.value.on('mouseenter', 'tasks', () => {
        map.value.getCanvas().style.cursor = 'pointer';
    });

    map.value.on('mouseleave', 'tasks', () => {
        map.value.getCanvas().style.cursor = '';
    });
};

// Function to update tasks layer
const updateTasksLayer = () => {
    const source = map.value.getSource('tasks');
    if (source) {
        source.setData(getTasksGeoJSON());
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

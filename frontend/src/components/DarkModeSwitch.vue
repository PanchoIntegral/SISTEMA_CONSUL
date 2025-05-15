<template>
  <div class="flex items-center">
    <span class="text-xs mr-2 hidden sm:inline text-gray-300 dark:text-gray-400">Modo</span>
    <button 
      @click="toggleDarkMode" 
      class="flex items-center justify-between w-14 h-7 rounded-full px-1 transition-colors duration-300 ease-in-out"
      :class="{ 'bg-gradient-to-r from-secondary to-accent': !isDarkMode, 'bg-gradient-to-r from-primary-dark to-secondary-dark': isDarkMode }"
      aria-label="Toggle dark mode"
    >
      <div
        class="bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center"
        :class="{ 'translate-x-7': isDarkMode }"
      >
        <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-navy" viewBox="0 0 20 20" fill="currentColor">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-secondary" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
        </svg>
      </div>
    </button>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const isDarkMode = ref(false);

// Detectar preferencia del sistema al inicio
onMounted(() => {
  // Revisar si el usuario ya tiene una preferencia guardada
  const savedMode = localStorage.getItem('darkMode');
  
  if (savedMode !== null) {
    isDarkMode.value = savedMode === 'true';
  } else {
    // Si no hay preferencia guardada, usar la preferencia del sistema
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  
  applyDarkMode();
});

// Observe cambios en el modo oscuro
watch(isDarkMode, () => {
  applyDarkMode();
  localStorage.setItem('darkMode', isDarkMode.value);
});

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value;
}

function applyDarkMode() {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
</script>

<style scoped>
/* Añadimos efecto de hover */
button:hover {
  filter: brightness(1.1);
}

/* Efecto de pulsación */
button:active div {
  transform: scale(0.9) translateX(0);
}
button:active div.translate-x-7 {
  transform: scale(0.9) translateX(1.75rem);
}
</style> 
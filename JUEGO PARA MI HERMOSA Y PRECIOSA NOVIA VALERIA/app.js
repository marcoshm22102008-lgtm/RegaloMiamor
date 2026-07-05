/* ==========================================================================
   LÓGICA DE LA APLICACIÓN - "7 DÍAS CONTIGO"
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.querySelector('.app-container');
    const mainView = document.getElementById('main-view');
    const dayCards = document.querySelectorAll('.day-card');
    const backButtons = document.querySelectorAll('.btn-back');

    // Estado del juego / días
    // Aquí puedes guardar si los días están desbloqueados de forma permanente,
    // o añadir propiedades como el tipo de juego, contraseña, etc.
    const daysConfig = {
        1: { unlocked: false },
        2: { unlocked: false },
        3: { unlocked: false },
        4: { unlocked: false },
        5: { unlocked: false },
        6: { unlocked: false },
        7: { unlocked: false }
    };

    // SVGs para alternar estados del candado
    const heartIconSVG = `
        <svg viewBox="0 0 24 24" class="icon-lock pulse-heart" style="fill: var(--accent-red);">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
    `;

    // 1. Manejo del Click en Tarjetas de los Días
    dayCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const dayNumber = card.getAttribute('data-day');
            const targetViewId = `day-${dayNumber}`;
            const targetView = document.getElementById(targetViewId);

            if (!targetView) return;

            // Obtener coordenadas del click para la explosión de corazones
            const rect = card.getBoundingClientRect();
            // Si es un click táctil u originado por teclado, centramos
            const clickX = e.clientX || (rect.left + rect.width / 2);
            const clickY = e.clientY || (rect.top + rect.height / 2);

            // Efecto: Lluvia de partículas (corazones)
            createHeartBurst(clickX, clickY);

            // Desbloquear visualmente la tarjeta (si no lo estaba)
            if (!daysConfig[dayNumber].unlocked) {
                daysConfig[dayNumber].unlocked = true;
                card.classList.add('unlocked');
                
                // Animación y reemplazo del icono de candado por un corazón palpitante
                const indicator = card.querySelector('.lock-indicator');
                if (indicator) {
                    indicator.style.transform = 'scale(0)';
                    setTimeout(() => {
                        indicator.innerHTML = heartIconSVG;
                        indicator.style.transform = 'scale(1)';
                    }, 200);
                }
            }

            // Transición SPA: Desplazar menú e ingresar vista del día
            setTimeout(() => {
                mainView.classList.add('slide-out');
                mainView.classList.remove('active');
                
                targetView.classList.add('active');
            }, 150); // Ligero retraso para disfrutar de la animación táctil y los corazones
        });
    });

    // 2. Manejo del Click en Botones de Volver
    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentView = button.closest('.view');
            
            if (currentView) {
                // Sacar la vista del día actual
                currentView.classList.remove('active');
                
                // Regresar la vista principal al centro
                mainView.classList.remove('slide-out');
                mainView.classList.add('active');
            }
        });
    });

    // 3. Generador de Explosión de Corazones (Partículas)
    function createHeartBurst(x, y) {
        const heartEmojis = ['❤️', '💖', '💝', '💕', '💘', '✨', '🌸'];
        const particlesCount = 8;
        
        // El contenedor app-container debe ser relativo para posicionar
        const containerRect = appContainer.getBoundingClientRect();
        
        // Coordenadas locales dentro del contenedor app
        const localX = x - containerRect.left;
        const localY = y - containerRect.top;

        for (let i = 0; i < particlesCount; i++) {
            const particle = document.createElement('span');
            particle.classList.add('heart-particle');
            
            // Emoji aleatorio
            particle.innerText = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
            
            // Posición inicial
            particle.style.left = `${localX}px`;
            particle.style.top = `${localY}px`;
            
            // Dirección aleatoria de la explosión (CSS variables para el translate)
            const angle = Math.random() * Math.PI * 2;
            const distance = 40 + Math.random() * 60;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance - 20; // Sesgo hacia arriba
            
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            
            appContainer.appendChild(particle);
            
            // Eliminar elemento después de que termine la animación
            particle.addEventListener('animationend', () => {
                particle.remove();
            });
        }
    }
});

/* ==========================================================================
   LÓGICA DE LA APLICACIÓN - "7 DÍAS CONTIGO"
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');
    const mainView = document.getElementById('main-view');
    const dayCards = document.querySelectorAll('.day-card');
    const backButtons = document.querySelectorAll('.btn-back');
    const headerHeartTrigger = document.getElementById('header-heart-trigger');
    const floatingHeartsContainer = document.getElementById('floating-hearts-container');

    // ---------------------------------------------------------
    // 1. ESTADO DE LOS DÍAS (PERSISTENCIA CON LOCALSTORAGE)
    // ---------------------------------------------------------
    const STORAGE_KEY = '7dias_contigo_unlocked';
    
    // Por defecto, todos los días inician bloqueados (false)
    let unlockedState = {
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
        6: false,
        7: false
    };

    // Intentar cargar el estado previo guardado en el navegador
    try {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            unlockedState = JSON.parse(savedState);
        }
    } catch (e) {
        console.error('Error leyendo del localStorage:', e);
    }

    // El Día 1 siempre pide contraseña al abrir la web
    unlockedState[1] = false;

    // Icono de corazón palpitante que reemplaza al candado cuando el día está abierto
    const heartIconSVG = `
        <svg viewBox="0 0 24 24" class="icon-lock pulse-heart" style="fill: var(--accent-red);">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
    `;

    // Inicializar visualmente las tarjetas según el estado guardado
    function initializeCards() {
        dayCards.forEach(card => {
            const dayNum = card.getAttribute('data-day');
            const isUnlocked = unlockedState[dayNum];
            
            if (isUnlocked) {
                card.classList.add('unlocked');
                const lockIndicator = card.querySelector('.lock-indicator');
                if (lockIndicator) {
                    lockIndicator.innerHTML = heartIconSVG;
                }
            } else {
                card.classList.remove('unlocked');
                const lockIndicator = card.querySelector('.lock-indicator');
                if (lockIndicator) {
                    lockIndicator.innerHTML = `
                        <svg viewBox="0 0 24 24" class="icon-lock">
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                        </svg>
                    `;
                }
            }
        });
    }

    initializeCards();

    // Guardar el estado actual en LocalStorage
    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(unlockedState));
        } catch (e) {
            console.error('Error guardando en el localStorage:', e);
        }
    }

    // ---------------------------------------------------------
    // 2. CONTRASEÑAS SECRETAS POR DÍA
    // ---------------------------------------------------------
    // ⚠️ Cambia las contraseñas aquí abajo (en minúsculas para comparar sin distinción)
    const DAY_PASSWORDS = {
        1: 'valeriaguapa',
        2: 'adranposeido',
        3: 'pobrecitavero',
        4: 'inmabollos',
        5: 'juancarlos',
        6: 'vegoesunamor',
        7: 'teamo'
    };

    // Referencias al modal de contraseña
    const passwordOverlay = document.getElementById('password-overlay');
    const passwordModal = document.getElementById('password-modal');
    const passwordInput = document.getElementById('password-input');
    const passwordSubmit = document.getElementById('password-submit');
    const passwordClose = document.getElementById('password-close');
    const passwordError = document.getElementById('password-error');
    const passwordDayNumber = document.getElementById('password-day-number');
    const passwordToggle = document.getElementById('password-toggle');

    let currentPasswordDay = null; // Qué día se está intentando desbloquear
    let currentCard = null;        // Referencia a la tarjeta que se pulsó

    // Mostrar el modal de contraseña
    function showPasswordModal(dayNumber, card) {
        currentPasswordDay = dayNumber;
        currentCard = card;
        passwordDayNumber.textContent = dayNumber;
        passwordInput.value = '';
        passwordInput.classList.remove('error');
        passwordError.classList.remove('visible');
        passwordModal.classList.remove('success');
        passwordOverlay.classList.add('visible');
        
        // Enfocar el input tras la animación
        setTimeout(() => passwordInput.focus(), 350);
    }

    // Cerrar el modal
    function hidePasswordModal() {
        passwordOverlay.classList.remove('visible');
        currentPasswordDay = null;
        currentCard = null;
    }

    // Verificar la contraseña ingresada
    function attemptUnlock() {
        const enteredPassword = passwordInput.value.trim().toLowerCase();
        const correctPassword = DAY_PASSWORDS[currentPasswordDay];

        if (enteredPassword === correctPassword) {
            // ✅ ¡Contraseña correcta!
            passwordModal.classList.add('success');
            passwordInput.classList.remove('error');
            passwordError.classList.remove('visible');

            // Desbloquear el día
            unlockedState[currentPasswordDay] = true;
            saveState();

            // Actualizar la tarjeta visualmente
            if (currentCard) {
                currentCard.classList.add('unlocked');
                const indicator = currentCard.querySelector('.lock-indicator');
                if (indicator) {
                    indicator.style.transform = 'scale(0)';
                    setTimeout(() => {
                        indicator.innerHTML = heartIconSVG;
                        indicator.style.transform = 'scale(1)';
                    }, 200);
                }
            }

            // Crear explosión de corazones
            const rect = currentCard.getBoundingClientRect();
            createHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);

            // Cerrar modal y navegar al día después de un breve delay
            const dayNumber = currentPasswordDay;
            setTimeout(() => {
                hidePasswordModal();
                navigateToDay(dayNumber);
            }, 600);

        } else {
            // ❌ Contraseña incorrecta
            passwordInput.classList.add('error');
            passwordError.classList.add('visible');
            
            // Quitar el error visual tras la animación
            setTimeout(() => {
                passwordInput.classList.remove('error');
            }, 500);
        }
    }

    // Navegar hacia la vista de un día
    function navigateToDay(dayNumber) {
        const targetViewId = `day-${dayNumber}`;
        const targetView = document.getElementById(targetViewId);
        if (!targetView) return;

        mainView.classList.add('slide-out');
        mainView.classList.remove('active');
        targetView.classList.add('active');
    }

    // Navegar hacia la carta de un día
    function navigateToCarta(dayNumber) {
        const targetViewId = `carta-${dayNumber}`;
        const targetView = document.getElementById(targetViewId);
        const currentDay = document.getElementById(`day-${dayNumber}`);
        if (!targetView) return;

        if (currentDay) {
            currentDay.classList.remove('active');
        }
        mainView.classList.add('slide-out');
        mainView.classList.remove('active');
        targetView.classList.add('active');
    }

    function mostrarBotonCarta(dayNumber, referencia) {
        const btn = document.createElement('button');
        btn.className = 'btn-ver-carta';
        btn.textContent = '💌 Ver carta';
        btn.addEventListener('click', () => navigateToCarta(dayNumber));
        referencia.after(btn);
    }

    // Toggle mostrar/ocultar contraseña
    if (passwordToggle) {
        passwordToggle.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
        });
    }

    // Evento del botón "Desbloquear"
    if (passwordSubmit) {
        passwordSubmit.addEventListener('click', attemptUnlock);
    }

    // Evento del botón "Cerrar"
    if (passwordClose) {
        passwordClose.addEventListener('click', hidePasswordModal);
    }

    // Cerrar al pulsar fuera del modal
    if (passwordOverlay) {
        passwordOverlay.addEventListener('click', (e) => {
            if (e.target === passwordOverlay) hidePasswordModal();
        });
    }

    // Enviar con Enter
    if (passwordInput) {
        passwordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') attemptUnlock();
        });
    }

    // ---------------------------------------------------------
    // 3. NAVEGACIÓN SPA E INTERACTIVIDAD DE TARJETAS
    // ---------------------------------------------------------
    dayCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const dayNumber = card.getAttribute('data-day');
            const targetViewId = `day-${dayNumber}`;
            const targetView = document.getElementById(targetViewId);

            if (!targetView) return;

            // Crear explosión de corazones en el punto del clic
            const rect = card.getBoundingClientRect();
            const clickX = e.clientX || (rect.left + rect.width / 2);
            const clickY = e.clientY || (rect.top + rect.height / 2);
            createHeartBurst(clickX, clickY);

            // Si el día ya está desbloqueado, navegar directamente
            if (unlockedState[dayNumber]) {
                setTimeout(() => navigateToDay(dayNumber), 180);
                return;
            }

            // Si está bloqueado, mostrar el modal de contraseña
            showPasswordModal(dayNumber, card);
        });
    });

    // Manejo de clicks en botones de "Volver"
    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentView = button.closest('.view');
            
            if (currentView) {
                // Desactivar y deslizar hacia la derecha la vista del día
                currentView.classList.remove('active');
                
                // Devolver el menú principal al centro
                mainView.classList.remove('slide-out');
                mainView.classList.add('active');
            }
        });
    });

    // ---------------------------------------------------------
    // 4. GENERADOR DE CORAZONES FLOTANTES (FONDO AMBIENTE)
    // ---------------------------------------------------------
    function spawnFloatingHeart() {
        if (!floatingHeartsContainer) return;

        const heart = document.createElement('span');
        heart.classList.add('floating-heart');
        
        // Selección aleatoria de emojis de amor y brillos
        const heartTypes = ['💖', '💗', '💝', '💕', '💞', '🩷'];
        heart.innerText = heartTypes[Math.floor(Math.random() * heartTypes.length)];

        // Posición horizontal aleatoria
        const startX = Math.random() * 100; // porcentaje
        heart.style.left = `${startX}%`;

        // Tamaño aleatorio
        const scale = 0.6 + Math.random() * 0.8;
        heart.style.fontSize = `${scale * 16}px`;

        // Duración aleatoria para que floten a diferentes velocidades
        const duration = 6 + Math.random() * 6; // Entre 6 y 12 segundos
        heart.style.animationDuration = `${duration}s`;

        // Opacidad inicial aleatoria
        heart.style.opacity = `${0.3 + Math.random() * 0.5}`;

        floatingHeartsContainer.appendChild(heart);

        // Remover del DOM una vez termine la animación
        setTimeout(() => {
            heart.remove();
        }, duration * 1000);
    }

    // Iniciar lluvia suave y constante de corazones flotantes
    setInterval(spawnFloatingHeart, 1500);
    // Generar unos cuantos al inicio
    for (let i = 0; i < 5; i++) {
        setTimeout(spawnFloatingHeart, i * 400);
    }

    // ---------------------------------------------------------
    // 5. EXPLOSIÓN TÁCTIL (LLUVIA DE PARTÍCULAS AL PULSAR)
    // ---------------------------------------------------------
    function createHeartBurst(clientX, clientY) {
        const burstEmojis = ['💖', '💗', '💝', '💕', '💞', '🩷'];
        const particleCount = 10;
        
        const containerRect = appContainer.getBoundingClientRect();
        
        // Calcular posición relativa respecto al app-container
        const localX = clientX - containerRect.left;
        const localY = clientY - containerRect.top;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('span');
            particle.classList.add('heart-particle');
            
            // Emoji y color
            particle.innerText = burstEmojis[Math.floor(Math.random() * burstEmojis.length)];
            
            // Posicionar en el centro del click
            particle.style.left = `${localX}px`;
            particle.style.top = `${localY}px`;
            
            // Calcular dirección y velocidad aleatoria (CSS Variables)
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 70;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance - 25; // Ligero sesgo hacia arriba

            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            
            appContainer.appendChild(particle);
            
            // Remover después de que termine la animación
            particle.addEventListener('animationend', () => {
                particle.remove();
            });
        }
    }

    // ---------------------------------------------------------
    // 6. TRUCO DE DESARROLLADOR: RESTABLECER ESTADO
    // ---------------------------------------------------------
    // Si pulsas 5 veces el corazón del encabezado principal,
    // se restaurará el estado de los días para volver a bloquearlos.
    let devClicks = 0;
    if (headerHeartTrigger) {
        headerHeartTrigger.addEventListener('click', () => {
            devClicks++;
            
            // Pequeño guiño táctil al hacer click en el logo
            createHeartBurst(
                headerHeartTrigger.getBoundingClientRect().left + 29,
                headerHeartTrigger.getBoundingClientRect().top + 29
            );
            
            if (devClicks >= 5) {
                unlockedState = {
                    1: false,
                    2: false,
                    3: false,
                    4: false,
                    5: false,
                    6: false,
                    7: false
                };
                saveState();
                initializeCards();
                
                // Mostrar alerta visual sutil
                alert('❤️ ¡Todo el amor ha sido guardado bajo llave nuevamente! (Días restablecidos)');
                devClicks = 0;
            }
        });
    }

    // ---------------------------------------------------------
    // 7. CUESTIONARIO DEL DÍA 1
    // ---------------------------------------------------------
    const quizContainer = document.querySelector('#day-1 .custom-content');
    if (quizContainer) {
        const questions = quizContainer.querySelectorAll('.quiz-question');
        const mensaje = document.getElementById('quiz-mensaje');
        const correctAnswers = { 1: 'b', 2: 'b', 3: 'b' };
        let answeredCount = 0;

        questions.forEach(q => {
            const options = q.querySelectorAll('.quiz-option');
            options.forEach(opt => {
                opt.addEventListener('click', () => {
                    const qNum = parseInt(q.dataset.question);
                    const selected = opt.dataset.value;
                    const correct = correctAnswers[qNum];

                    options.forEach(o => o.disabled = true);

                    if (selected === correct) {
                        opt.classList.add('selected-correct');
                    } else {
                        opt.classList.add('selected-wrong');
                        options.forEach(o => {
                            if (o.dataset.value === correct) {
                                o.classList.add('show-correct');
                            }
                        });
                    }

                    answeredCount++;
                    if (answeredCount === 3) {
                        const allCorrect = Array.from(questions).every(q =>
                            q.querySelector('.quiz-option.selected-correct')
                        );
                        mensaje.textContent = allCorrect
                            ? 'Muy bien hecho amor'
                            : 'Casi, sigue intentando';
                        mensaje.classList.add('visible');
                        if (allCorrect) {
                            mostrarBotonCarta(1, mensaje);
                        }
                    }
                });
            });
        });
    }

    // ---------------------------------------------------------
    // 8. MINIJUEGO ATTRAPA CORAZONES - DÍA 2
    // ---------------------------------------------------------
    const gameArea = document.getElementById('game-area');
    if (gameArea) {
        const scoreDisplay = document.getElementById('game-score');
        const resultDisplay = document.getElementById('game-result');
        const startBtn = document.getElementById('game-start-btn');

        let score = 0;
        let running = false;
        let spawnTimeout = null;
        let activeHearts = [];
        const TARGET = 20;

        function getDelay() {
            if (score < 5) return 1000;
            if (score < 10) return 750;
            if (score < 15) return 550;
            return 380;
        }

        function getLifetime() {
            if (score < 5) return 2600;
            if (score < 10) return 2000;
            if (score < 15) return 1400;
            return 900;
        }

        function stopGame() {
            running = false;
            if (spawnTimeout) { clearTimeout(spawnTimeout); spawnTimeout = null; }
            activeHearts.forEach(h => { if (h.parentNode) h.remove(); });
            activeHearts = [];
        }

        function spawnHeart() {
            if (!running) return;

            const el = document.createElement('div');
            el.className = 'catch-heart';
            const lifetime = getLifetime();

            el.style.left = `${8 + Math.random() * 78}%`;
            el.style.top = `${8 + Math.random() * 72}%`;
            el.style.animationDuration = `${lifetime}ms`;

            const emojis = ['💖', '💗', '💝', '💕', '💞'];
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];
            el.innerHTML = `<span class="heart-emoji">${emoji}</span><div class="heart-timer" style="animation-duration:${lifetime}ms"></div>`;

            let caught = false;

            el.addEventListener('click', (e) => {
                e.stopPropagation();
                if (caught || !running) return;
                caught = true;
                el.classList.add('caught');
                score++;
                scoreDisplay.textContent = score;

                for (let i = 0; i < 5; i++) {
                    const p = document.createElement('span');
                    p.className = 'heart-particle-small';
                    p.textContent = '✨';
                    p.style.left = el.style.left;
                    p.style.top = el.style.top;
                    const angle = (i / 5) * Math.PI * 2;
                    const dist = 18 + Math.random() * 22;
                    p.style.setProperty('--sx', `${Math.cos(angle) * dist}px`);
                    p.style.setProperty('--sy', `${Math.sin(angle) * dist}px`);
                    gameArea.appendChild(p);
                    setTimeout(() => p.remove(), 700);
                }

                setTimeout(() => { if (el.parentNode) el.remove(); }, 400);
                activeHearts = activeHearts.filter(h => h !== el);

                if (score >= TARGET) endGame(true);
            });

            gameArea.appendChild(el);
            activeHearts.push(el);

            setTimeout(() => {
                if (caught) return;
                if (el.parentNode) {
                    el.classList.add('missed');
                    setTimeout(() => { if (el.parentNode) el.remove(); }, 300);
                }
                activeHearts = activeHearts.filter(h => h !== el);
            }, lifetime);
        }

        function scheduleNext() {
            if (!running) return;
            spawnTimeout = setTimeout(() => {
                if (!running) return;
                spawnHeart();
                scheduleNext();
            }, getDelay());
        }

        function endGame(won) {
            running = false;
            if (spawnTimeout) { clearTimeout(spawnTimeout); spawnTimeout = null; }
            activeHearts.forEach(h => { if (h.parentNode) h.remove(); });
            activeHearts = [];
            startBtn.disabled = false;
            startBtn.textContent = '¡Jugar otra vez! 💕';
            resultDisplay.textContent = won
                ? '🎉 Llegaste a 20, bien hecho amor'
                : '💪 Sigue intentando';
            resultDisplay.classList.add('visible');
            if (won) {
                mostrarBotonCarta(2, resultDisplay);
            }
        }

        startBtn.addEventListener('click', () => {
            stopGame();
            score = 0;
            running = true;
            activeHearts = [];
            gameArea.innerHTML = '';
            scoreDisplay.textContent = '0';
            resultDisplay.classList.remove('visible');
            startBtn.disabled = true;
            startBtn.textContent = 'Jugando... 💕';
            spawnHeart();
            scheduleNext();
        });

        const backBtn = document.querySelector('#day-2 .btn-back');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                stopGame();
                startBtn.disabled = false;
                startBtn.textContent = '¡Empezar! 💕';
            });
        }
    }

    // ---------------------------------------------------------
    // 9. CÓDIGO SECRETO - DÍA 3
    // ---------------------------------------------------------
    const codigoInput = document.getElementById('codigo-input');
    if (codigoInput) {
        const codigoBtn = document.getElementById('codigo-btn');
        const codigoFeedback = document.getElementById('codigo-feedback');
        const respuestaCorrecta = 'te amo mucho mi vida';

        function normalizar(str) {
            return str.toLowerCase().trim().replace(/\s+/g, ' ');
        }

        function verificarCodigo() {
            const valor = normalizar(codigoInput.value);
            if (!valor) return;

            if (valor === normalizar(respuestaCorrecta)) {
                codigoFeedback.textContent = '🎉 Muy bien hecho amor';
                codigoFeedback.className = 'codigo-feedback visible';
                codigoInput.disabled = true;
                codigoBtn.disabled = true;
                codigoBtn.textContent = '✅ Descifrado';
                mostrarBotonCarta(3, codigoFeedback);
            } else {
                codigoFeedback.textContent = '❌ No es correcto, intenta de nuevo';
                codigoFeedback.className = 'codigo-feedback visible error';
                codigoInput.value = '';
                codigoInput.focus();
                setTimeout(() => {
                    codigoFeedback.classList.remove('visible');
                }, 2000);
            }
        }

        codigoBtn.addEventListener('click', verificarCodigo);
        codigoInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') verificarCodigo();
        });

    }

    // ---------------------------------------------------------
    // 10. PUZZLE DE IMAGEN - DÍA 4
    // ---------------------------------------------------------
    const puzzleGrid = document.getElementById('puzzle-grid');
    if (puzzleGrid) {
        const PUZZLE_SIZE = 4;
        const TOTAL = PUZZLE_SIZE * PUZZLE_SIZE;
        const IMG = 'IMG-20260606-WA0017.jpg';

        let pieces = [];
        let selectedIdx = -1;
        let moves = 0;
        let solved = false;

        const movesEl = document.getElementById('puzzle-moves');
        const resetBtn = document.getElementById('puzzle-reset');
        const completeEl = document.getElementById('puzzle-complete');

        function initPuzzle() {
            pieces = Array.from({ length: TOTAL }, (_, i) => ({ id: i, pos: i }));

            for (let i = 0; i < 300; i++) {
                const a = Math.floor(Math.random() * TOTAL);
                const b = Math.floor(Math.random() * TOTAL);
                [pieces[a].pos, pieces[b].pos] = [pieces[b].pos, pieces[a].pos];
            }

            moves = 0;
            solved = false;
            selectedIdx = -1;
            movesEl.textContent = 'Movimientos: 0';
            completeEl.classList.remove('visible');
            render();
        }

        function render() {
            puzzleGrid.innerHTML = '';
            const sorted = [...pieces].sort((a, b) => a.pos - b.pos);

            sorted.forEach((piece, displayIdx) => {
                const div = document.createElement('div');
                div.className = 'puzzle-piece';
                div.dataset.displayIdx = displayIdx;
                div.dataset.pieceId = piece.id;

                const correctRow = Math.floor(piece.id / PUZZLE_SIZE);
                const correctCol = piece.id % PUZZLE_SIZE;
                div.style.backgroundImage = `url('${IMG}')`;
                div.style.backgroundSize = `${PUZZLE_SIZE * 100}%`;
                div.style.backgroundPosition = `${(correctCol / (PUZZLE_SIZE - 1)) * 100}% ${(correctRow / (PUZZLE_SIZE - 1)) * 100}%`;

                div.addEventListener('click', () => handleTap(displayIdx));
                puzzleGrid.appendChild(div);
            });
        }

        function handleTap(idx) {
            if (solved) return;

            const allPieces = puzzleGrid.querySelectorAll('.puzzle-piece');

            if (selectedIdx === -1) {
                selectedIdx = idx;
                allPieces[idx].classList.add('selected');
            } else if (selectedIdx === idx) {
                allPieces[idx].classList.remove('selected');
                selectedIdx = -1;
            } else {
                const pieceA = pieces.find(p => p.pos === selectedIdx);
                const pieceB = pieces.find(p => p.pos === idx);
                [pieceA.pos, pieceB.pos] = [pieceB.pos, pieceA.pos];

                allPieces.forEach(el => el.classList.remove('selected'));
                selectedIdx = -1;
                moves++;
                movesEl.textContent = `Movimientos: ${moves}`;
                render();
                checkSolved();
            }
        }

        function checkSolved() {
            solved = pieces.every(p => p.id === p.pos);
            if (solved) {
                completeEl.classList.add('visible');
                const rect = puzzleGrid.getBoundingClientRect();
                createHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
                mostrarBotonCarta(4, completeEl);
            }
        }

        // Cargar la imagen y ajustar la proporción del grid
        const img = new Image();
        img.onload = function () {
            puzzleGrid.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
            resetBtn.addEventListener('click', initPuzzle);
            initPuzzle();
        };
        img.src = IMG;
    }

    // ---------------------------------------------------------
    // 11. ACERTIJO - DÍA 5
    // ---------------------------------------------------------
    const acertijoInput = document.getElementById('acertijo-input');
    if (acertijoInput) {
        const acertijoBtn = document.getElementById('acertijo-btn');
        const acertijoFeedback = document.getElementById('acertijo-feedback');
        const acertijoPistaTexto = document.getElementById('acertijo-pista-texto');

        const pistas = [
            'No es un objeto.',
            'Se construye hablando, escuchando y siendo sinceros.',
            'Es una de las cosas que más orgulloso estoy de tener contigo.'
        ];

        document.querySelectorAll('.acertijo-pista-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const num = parseInt(btn.dataset.pista) - 1;
                acertijoPistaTexto.textContent = pistas[num];
                acertijoPistaTexto.classList.add('visible');
                btn.disabled = true;
            });
        });

        function verificarAcertijo() {
            const valor = acertijoInput.value.toLowerCase().trim();
            if (!valor) return;

            const tieneComunicacion = valor.includes('comunicación') || valor.includes('comunicacion');
            if (tieneComunicacion) {
                acertijoFeedback.textContent = 'Muy bien hecho amor';
                acertijoFeedback.className = 'acertijo-feedback visible';
                acertijoInput.disabled = true;
                acertijoBtn.disabled = true;
                acertijoBtn.textContent = '✅ Correcto';
                mostrarBotonCarta(5, acertijoFeedback);
            } else {
                acertijoFeedback.textContent = 'No es correcto, intenta de nuevo';
                acertijoFeedback.className = 'acertijo-feedback visible error';
                setTimeout(() => {
                    acertijoFeedback.classList.remove('visible');
                }, 2000);
            }
        }

        acertijoBtn.addEventListener('click', verificarAcertijo);
        acertijoInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') verificarAcertijo();
        });
    }

    // ---------------------------------------------------------
    // 12. VERDADERO O FALSO - DÍA 6
    // ---------------------------------------------------------
    const vfLista = document.getElementById('vf-lista');
    if (vfLista) {
        const preguntas = [
            { texto: 'Yo de pequeño dormía en el suelo porque no me gustaba la cama', respuesta: false },
            { texto: 'Prefiero estar con el ordenador a estar contigo', respuesta: false },
            { texto: 'Las nutrias se dan la mano cuando duermen para no separarse flotando', respuesta: true },
            { texto: 'Mi ídolo en el fútbol es Cristiano Ronaldo', respuesta: false },
            { texto: 'Después de verte me dan ganas de verte', respuesta: true }
        ];

        const resultadoEl = document.getElementById('vf-resultado');
        let respondidas = 0;
        let aciertos = 0;

        preguntas.forEach((p, idx) => {
            const div = document.createElement('div');
            div.className = 'vf-pregunta';
            div.id = `vf-p-${idx}`;

            const texto = document.createElement('div');
            texto.className = 'vf-texto';
            texto.textContent = `${idx + 1}. ${p.texto}`;

            const botones = document.createElement('div');
            botones.className = 'vf-botones';

            const btnV = document.createElement('button');
            btnV.className = 'vf-btn';
            btnV.textContent = 'V ✅';
            btnV.dataset.valor = 'true';

            const btnF = document.createElement('button');
            btnF.className = 'vf-btn';
            btnF.textContent = 'F ❌';
            btnF.dataset.valor = 'false';

            function responder(btn) {
                const elegido = btn.dataset.valor === 'true';
                const correcto = elegido === p.respuesta;

                if (correcto) {
                    btn.classList.add('correcto');
                    div.classList.add('correcta');
                    aciertos++;
                } else {
                    btn.classList.add('incorrecto');
                    div.classList.add('incorrecta');
                    const correctBtn = btnV.dataset.valor === String(p.respuesta) ? btnV : btnF;
                    correctBtn.classList.add('correcto');
                }

                btnV.disabled = true;
                btnF.disabled = true;
                respondidas++;

                if (respondidas === preguntas.length) {
                    const todas = aciertos === preguntas.length;
                    resultadoEl.textContent = todas
                        ? 'Muy bien hecho amor'
                        : `${aciertos}/${preguntas.length} bien hecho amor`;
                    resultadoEl.classList.add('visible');
                    if (todas) {
                        mostrarBotonCarta(6, resultadoEl);
                    }
                }
            }

            btnV.addEventListener('click', () => responder(btnV));
            btnF.addEventListener('click', () => responder(btnF));

            botones.appendChild(btnV);
            botones.appendChild(btnF);
            div.appendChild(texto);
            div.appendChild(botones);
            vfLista.appendChild(div);
        });
    }

    // ---------------------------------------------------------
    // 13. LABERINTO (CLÁSICO DE PAREDES) - DÍA 7
    // ---------------------------------------------------------
    const mazeGrid = document.getElementById('maze-grid');
    if (mazeGrid) {
        const resultadoEl = document.getElementById('maze-resultado');
        const reintentarBtn = document.getElementById('maze-reintentar');
        const btnUp = document.getElementById('maze-up');
        const btnDown = document.getElementById('maze-down');
        const btnLeft = document.getElementById('maze-left');
        const btnRight = document.getElementById('maze-right');

        const ROWS = 7;
        const COLS = 7;
        const H = 2 * ROWS + 1;
        const W = 2 * COLS + 1;

        let grid = [];
        let playerR, playerC;
        let terminado = false;

        const EXITS = {
            correcta: { r: 13, c: W - 1 },
            falsas: [{ r: 1, c: W - 1 }, { r: 7, c: W - 1 }]
        };

        function generarGrid() {
            grid = Array.from({ length: H }, () => Array(W).fill(1));
            const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));

            function carve(r, c) {
                const gr = 2 * r + 1;
                const gc = 2 * c + 1;
                visited[r][c] = true;
                grid[gr][gc] = 0;

                const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]].sort(() => Math.random() - 0.5);
                for (const [dr, dc] of dirs) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited[nr][nc]) {
                        grid[gr + dr][gc + dc] = 0;
                        carve(nr, nc);
                    }
                }
            }

            carve(0, 0);

            grid[EXITS.correcta.r][EXITS.correcta.c] = 0;
            EXITS.falsas.forEach(ex => { grid[ex.r][ex.c] = 0; });

            playerR = 1;
            playerC = 1;
            terminado = false;
        }

        function renderizar() {
            mazeGrid.innerHTML = '';
            mazeGrid.style.gridTemplateColumns = `repeat(${W}, 1fr)`;

            for (let r = 0; r < H; r++) {
                for (let c = 0; c < W; c++) {
                    const cell = document.createElement('div');
                    cell.className = 'maze-cell';

                    if (r === playerR && c === playerC) {
                        cell.classList.add('maze-player');
                    } else if (grid[r][c] === 1) {
                        cell.classList.add('maze-wall');
                    } else {
                        const esExit = EXITS.correcta.r === r && EXITS.correcta.c === c ||
                            EXITS.falsas.some(ex => ex.r === r && ex.c === c);
                        if (esExit) {
                            cell.classList.add('maze-exit');
                        } else {
                            cell.classList.add('maze-path');
                        }
                    }

                    mazeGrid.appendChild(cell);
                }
            }
        }

        function mover(dr, dc) {
            if (terminado) return;

            const nr = playerR + dr;
            const nc = playerC + dc;

            if (nr < 0 || nr >= H || nc < 0 || nc >= W) return;
            if (grid[nr][nc] === 1) return;

            playerR = nr;
            playerC = nc;
            renderizar();

            if (EXITS.correcta.r === nr && EXITS.correcta.c === nc) {
                terminado = true;
                desactivarControles();
                resultadoEl.textContent = 'Eres mi lugar favorito en el mundo entero';
                resultadoEl.className = 'maze-resultado visible';
                mostrarBotonCarta(7, resultadoEl);
            } else if (EXITS.falsas.some(ex => ex.r === nr && ex.c === nc)) {
                terminado = true;
                desactivarControles();
                resultadoEl.textContent = 'Camino equivocado';
                resultadoEl.className = 'maze-resultado visible error';
                reintentarBtn.classList.add('visible');
            }
        }

        function desactivarControles() {
            document.querySelectorAll('.maze-btn').forEach(b => b.disabled = true);
        }

        function activarControles() {
            document.querySelectorAll('.maze-btn').forEach(b => b.disabled = false);
        }

        function reiniciar() {
            generarGrid();
            renderizar();
            activarControles();
            resultadoEl.className = 'maze-resultado';
            resultadoEl.textContent = '';
            reintentarBtn.classList.remove('visible');
        }

        btnUp.addEventListener('click', () => mover(-1, 0));
        btnDown.addEventListener('click', () => mover(1, 0));
        btnLeft.addEventListener('click', () => mover(0, -1));
        btnRight.addEventListener('click', () => mover(0, 1));

        window.addEventListener('keydown', (e) => {
            if (!mazeGrid.closest('.view.active')) return;
            if (e.key === 'ArrowUp') { e.preventDefault(); mover(-1, 0); }
            if (e.key === 'ArrowDown') { e.preventDefault(); mover(1, 0); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); mover(0, -1); }
            if (e.key === 'ArrowRight') { e.preventDefault(); mover(0, 1); }
        });

        reintentarBtn.addEventListener('click', reiniciar);

        reiniciar();
    }
});

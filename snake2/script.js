document.addEventListener('DOMContentLoaded', () => {
    const gameArea = document.getElementById('gameArea');
    const menu = document.getElementById('menu');
    const playerNameInput = document.getElementById('playerName');
    const snakeColorInput = document.getElementById('snakeColor');  // Selección del color de la serpiente
    const startButton = document.getElementById('startButton');
    const restartButton = document.getElementById('restartButton');
    const scoreElement = document.getElementById('score');
    const scoreList = document.getElementById('scoreList');
    const themeSelector = document.getElementById('themeSelector');
    const snake = [];
    const obstacles = [];
    const snakeSize = 20;
    let direction = 'RIGHT';
    let newDirection = 'RIGHT';
    let food = { x: 0, y: 0 };
    let score = 0;
    let gameInterval;
    let playerName = '';
    let snakeColor = '#ff0000';  // Color por defecto de la serpiente
    let speed = 200;

    function createSnakeSegment(x, y, isHead = false) {
        const segment = document.createElement('div');
        segment.className = 'snake-segment';
        if (isHead) {
            segment.classList.add('snake-head');
        }
        segment.style.width = `${snakeSize}px`;
        segment.style.height = `${snakeSize}px`;
        segment.style.left = `${x}px`;
        segment.style.top = `${y}px`;
        segment.style.backgroundColor = snakeColor;  // Aplicar color seleccionado
        return segment;
    }

    function createObstacle(x, y) {
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        obstacle.style.width = `${snakeSize}px`;
        obstacle.style.height = `${snakeSize}px`;
        obstacle.style.left = `${x}px`;
        obstacle.style.top = `${y}px`;
        gameArea.appendChild(obstacle);
        obstacles.push(obstacle);
    }

    function getRandomPosition() {
        const maxX = Math.floor(gameArea.clientWidth / snakeSize);
        const maxY = Math.floor(gameArea.clientHeight / snakeSize);
        const x = Math.floor(Math.random() * maxX) * snakeSize;
        const y = Math.floor(Math.random() * maxY) * snakeSize;
        return { x, y };
    }

    function initializeGame() {
        snake.length = 0;
        score = 0;
        direction = 'RIGHT';
        newDirection = 'RIGHT';
        speed = 200;

        playerName = playerNameInput.value.trim();
        snakeColor = snakeColorInput.value;  // Obtener el color de la serpiente
        if (!playerName) {
            alert('Por favor, introduce tu nombre.');
            return;
        }

        gameArea.innerHTML = '';
        const initialSegment = createSnakeSegment(snakeSize, snakeSize, true);
        snake.push(initialSegment);
        gameArea.appendChild(initialSegment);

        placeFood();

        obstacles.length = 0;
        for (let i = 0; i < 3; i++) {  // Crear 3 obstáculos en posiciones aleatorias
            const pos = getRandomPosition();
            createObstacle(pos.x, pos.y);
        }

        scoreElement.innerText = `Puntuación: ${score}`;

        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(updateGame, speed);

        menu.style.display = 'none';
    }

    function placeFood() {
        const pos = getRandomPosition();
        food.x = pos.x;
        food.y = pos.y;

        const foodElement = document.getElementById('food');
        if (!foodElement) {
            const foodDiv = document.createElement('div');
            foodDiv.id = 'food';
            foodDiv.style.width = `${snakeSize}px`;
            foodDiv.style.height = `${snakeSize}px`;
            gameArea.appendChild(foodDiv);
        }
        const foodDiv = document.getElementById('food');
        foodDiv.style.left = `${food.x}px`;
        foodDiv.style.top = `${food.y}px`;
    }

    function updateGame() {
        let headX = parseInt(snake[0].style.left);
        let headY = parseInt(snake[0].style.top);

        switch (direction) {
            case 'UP':
                headY -= snakeSize;
                break;
            case 'DOWN':
                headY += snakeSize;
                break;
            case 'LEFT':
                headX -= snakeSize;
                break;
            case 'RIGHT':
                headX += snakeSize;
                break;
        }

        if (headX < 0 || headX >= gameArea.clientWidth || headY < 0 || headY >= gameArea.clientHeight) {
            endGame();
            return;
        }

        for (let i = 0; i < snake.length; i++) {
            if (parseInt(snake[i].style.left) === headX && parseInt(snake[i].style.top) === headY) {
                endGame();
                return;
            }
        }

        for (let i = 0; i < obstacles.length; i++) {
            if (parseInt(obstacles[i].style.left) === headX && parseInt(obstacles[i].style.top) === headY) {
                endGame();
                return;
            }
        }

        const newHead = createSnakeSegment(headX, headY, true);
        snake.unshift(newHead);
        gameArea.appendChild(newHead);

        if (headX === food.x && headY === food.y) {
            score += 5;
            scoreElement.innerText = `Puntuación: ${score}`;
            placeFood();

            if (score % 50 === 0 && speed > 50) {
                speed -= 20;
                clearInterval(gameInterval);
                gameInterval = setInterval(updateGame, speed);
            }
        } else {
            const tail = snake.pop();
            gameArea.removeChild(tail);
        }

        direction = newDirection;
    }

    function endGame() {
        clearInterval(gameInterval);
        alert(`Juego terminado! ${playerName}, tu puntuación es: ${score}`);
        addScoreToList();
        menu.style.display = 'block';
    }

    function addScoreToList() {
        const listItem = document.createElement('li');
        listItem.textContent = `${playerName}: ${score}`;
        scoreList.appendChild(listItem);

        let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
        highScores.push({ name: playerName, score: score });
        highScores.sort((a, b) => b.score - a.score);
        highScores = highScores.slice(0, 5);
        localStorage.setItem('highScores', JSON.stringify(highScores));

        updateScoreList();
    }

    function updateScoreList() {
        const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
        scoreList.innerHTML = '';
        highScores.forEach(scoreEntry => {
            const listItem = document.createElement('li');
            listItem.textContent = `${scoreEntry.name}: ${scoreEntry.score}`;
            scoreList.appendChild(listItem);
        });
    }

    startButton.addEventListener('click', initializeGame);
    restartButton.addEventListener('click', initializeGame);

    themeSelector.addEventListener('change', () => {
        document.body.className = themeSelector.value;
    });

    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp':
                if (direction !== 'DOWN') newDirection = 'UP';
                break;
            case 'ArrowDown':
                if (direction !== 'UP') newDirection = 'DOWN';
                break;
            case 'ArrowLeft':
                if (direction !== 'RIGHT') newDirection = 'LEFT';
                break;
            case 'ArrowRight':
                if (direction !== 'LEFT') newDirection = 'RIGHT';
                break;
        }
    });

    updateScoreList();
});
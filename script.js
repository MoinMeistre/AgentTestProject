// Game State
const gameState = {
    currentScreen: 'landing',
    playerName: '',
    roomCode: '',
    isHost: false,
    players: [],
    gameSettings: {
        impostorCount: 1,
        hintWordEnabled: true
    },
    currentRole: null,
    secretWord: '',
    hintWord: '',
    votes: {},
    gamePhase: 'lobby' // lobby, role-reveal, game, voting, results
};

// Word lists for the game
const wordList = [
    { word: 'Strand', hint: 'Sand' },
    { word: 'Pizza', hint: 'Käse' },
    { word: 'Krankenhaus', hint: 'Arzt' },
    { word: 'Schule', hint: 'Lernen' },
    { word: 'Berg', hint: 'Stein' },
    { word: 'Regen', hint: 'Wasser' },
    { word: 'Buch', hint: 'Lesen' },
    { word: 'Hund', hint: 'Tier' },
    { word: 'Auto', hint: 'Fahren' },
    { word: 'Baum', hint: 'Blätter' },
    { word: 'Haus', hint: 'Wohnen' },
    { word: 'Kuchen', hint: 'Süß' },
    { word: 'Flugzeug', hint: 'Fliegen' },
    { word: 'Computer', hint: 'Technik' },
    { word: 'Musik', hint: 'Klang' },
    { word: 'Fußball', hint: 'Sport' },
    { word: 'Garten', hint: 'Blumen' },
    { word: 'Kaffee', hint: 'Getränk' },
    { word: 'Film', hint: 'Kino' },
    { word: 'Telefon', hint: 'Anrufen' }
];

// DOM Elements
const screens = {
    landing: document.getElementById('landing-screen'),
    role: document.getElementById('role-screen'),
    game: document.getElementById('game-screen'),
    voting: document.getElementById('voting-screen'),
    results: document.getElementById('results-screen')
};

// Landing Screen Elements
const playerNameInput = document.getElementById('player-name');
const roomCodeInput = document.getElementById('room-code');
const joinBtn = document.getElementById('join-btn');
const createRoomBtn = document.getElementById('create-room-btn');
const playerListSection = document.querySelector('.player-list-section');
const playerList = document.getElementById('player-list');
const statusText = document.getElementById('status-text');
const gameSettingsSection = document.getElementById('game-settings');
const impostorCountSelect = document.getElementById('impostor-count');
const hintWordToggle = document.getElementById('hint-word-toggle');
const startGameBtn = document.getElementById('start-game-btn');

// Game Screen Elements
const continueToGameBtn = document.getElementById('continue-to-game-btn');
const roleTitle = document.getElementById('role-title');
const roleContent = document.getElementById('role-content');
const wordContent = document.getElementById('word-content');
const hintContent = document.getElementById('hint-content');
const votingList = document.getElementById('voting-list');
const submitVoteBtn = document.getElementById('submit-vote-btn');
const resultTitle = document.getElementById('result-title');
const resultContent = document.getElementById('result-content');
const newRoundBtn = document.getElementById('new-round-btn');

// Utility Functions
function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function getRandomWord() {
    return wordList[Math.floor(Math.random() * wordList.length)];
}

function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.style.display = 'none';
    });
    screens[screenName].style.display = 'block';
    gameState.currentScreen = screenName;
}

function validatePlayerName(name) {
    return name && name.trim().length > 0 && name.trim().length <= 20;
}

function validateRoomCode(code) {
    return code && /^[A-Z0-9]{4}$/.test(code.toUpperCase());
}

// Event Handlers
joinBtn.addEventListener('click', handleJoin);
createRoomBtn.addEventListener('click', handleCreateRoom);
startGameBtn.addEventListener('click', handleStartGame);
continueToGameBtn.addEventListener('click', handleContinueToGame);
submitVoteBtn.addEventListener('click', handleSubmitVote);
newRoundBtn.addEventListener('click', handleNewRound);

// Input validation
playerNameInput.addEventListener('input', () => {
    const isValid = validatePlayerName(playerNameInput.value);
    joinBtn.disabled = !isValid;
    createRoomBtn.disabled = !isValid;
});

roomCodeInput.addEventListener('input', () => {
    const value = roomCodeInput.value.toUpperCase();
    roomCodeInput.value = value;
});

// Game Functions
function handleJoin() {
    const name = playerNameInput.value.trim();
    const roomCode = roomCodeInput.value.trim().toUpperCase();
    
    if (!validatePlayerName(name)) {
        showError('Bitte gib einen gültigen Namen ein.');
        return;
    }
    
    if (roomCode && !validateRoomCode(roomCode)) {
        showError('Bitte gib einen gültigen Raumcode ein (4 Zeichen).');
        return;
    }
    
    gameState.playerName = name;
    
    if (roomCode) {
        // Join existing room
        gameState.roomCode = roomCode;
        gameState.isHost = false;
        simulateJoinRoom(roomCode, name);
    } else {
        showError('Bitte gib einen Raumcode ein oder erstelle einen neuen Raum.');
    }
}

function handleCreateRoom() {
    const name = playerNameInput.value.trim();
    
    if (!validatePlayerName(name)) {
        showError('Bitte gib einen gültigen Namen ein.');
        return;
    }
    
    gameState.playerName = name;
    gameState.roomCode = generateRoomCode();
    gameState.isHost = true;
    
    // Create new room
    gameState.players = [
        { name: name, isHost: true, role: null }
    ];
    
    updateUI();
    showRoomCode();
}

function simulateJoinRoom(roomCode, playerName) {
    // Simulate joining a room with some existing players
    setTimeout(() => {
        gameState.players = [
            { name: 'Spielleiter', isHost: true, role: null },
            { name: 'Spieler2', isHost: false, role: null },
            { name: playerName, isHost: false, role: null }
        ];
        
        if (!gameState.players.find(p => p.isHost)) {
            gameState.players[0].isHost = true;
        }
        
        updateUI();
    }, 500);
}

function showRoomCode() {
    if (gameState.isHost && gameState.roomCode) {
        statusText.textContent = `Dein Raumcode: ${gameState.roomCode}`;
    }
}

function updateUI() {
    // Show player list section when in a room
    playerListSection.style.display = 'block';
    
    // Update player list
    playerList.innerHTML = '';
    gameState.players.forEach(player => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="player-name">${player.name}</span>
            ${player.isHost ? '<span class="host-badge">Spielleiter</span>' : ''}
        `;
        playerList.appendChild(li);
    });
    
    // Show game settings for host
    if (gameState.isHost) {
        gameSettingsSection.style.display = 'block';
        updateStartButton();
    } else {
        gameSettingsSection.style.display = 'none';
        statusText.textContent = 'Warten auf Spielstart...';
    }
}

function updateStartButton() {
    const minPlayers = 3;
    const canStart = gameState.players.length >= minPlayers && 
                     gameState.gameSettings.impostorCount < gameState.players.length;
    
    startGameBtn.disabled = !canStart;
    
    if (gameState.players.length < minPlayers) {
        statusText.textContent = `Warten auf mindestens ${minPlayers} Spieler... (${gameState.players.length}/${minPlayers})`;
    } else if (gameState.gameSettings.impostorCount >= gameState.players.length) {
        statusText.textContent = 'Zu viele Impostors!';
    } else {
        statusText.textContent = `Bereit zum Starten (${gameState.players.length} Spieler)`;
    }
}

// Settings listeners
impostorCountSelect.addEventListener('change', (e) => {
    gameState.gameSettings.impostorCount = parseInt(e.target.value);
    updateStartButton();
});

hintWordToggle.addEventListener('change', (e) => {
    gameState.gameSettings.hintWordEnabled = e.target.checked;
});

function handleStartGame() {
    if (!gameState.isHost) return;
    
    // Assign roles
    assignRoles();
    
    // Select word
    const wordData = getRandomWord();
    gameState.secretWord = wordData.word;
    gameState.hintWord = wordData.hint;
    
    // Start role reveal phase
    gameState.gamePhase = 'role-reveal';
    showRoleReveal();
}

function assignRoles() {
    const players = [...gameState.players];
    const impostorCount = gameState.gameSettings.impostorCount;
    
    // Shuffle players
    for (let i = players.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [players[i], players[j]] = [players[j], players[i]];
    }
    
    // Assign roles
    for (let i = 0; i < players.length; i++) {
        if (i < impostorCount) {
            players[i].role = 'impostor';
        } else {
            players[i].role = 'crew';
        }
    }
    
    gameState.players = players;
    
    // Set current player's role
    const currentPlayer = gameState.players.find(p => p.name === gameState.playerName);
    gameState.currentRole = currentPlayer ? currentPlayer.role : 'crew';
}

function showRoleReveal() {
    showScreen('role');
    
    const roleCard = document.querySelector('.role-card');
    const roleIcon = document.getElementById('role-icon');
    
    if (gameState.currentRole === 'impostor') {
        roleCard.className = 'role-card impostor';
        roleTitle.textContent = 'Du bist Impostor!';
        roleIcon.textContent = '🎭';
        
        if (gameState.gameSettings.hintWordEnabled) {
            roleContent.innerHTML = `
                <p>Hinweiswort:</p>
                <div style="font-size: 24px; font-weight: bold; margin: 16px 0;">
                    ${gameState.hintWord}
                </div>
                <p style="font-size: 14px; opacity: 0.8;">
                    Versuche, die anderen zu täuschen!
                </p>
            `;
        } else {
            roleContent.innerHTML = `
                <p>Du kennst das geheime Wort nicht.</p>
                <p style="font-size: 14px; opacity: 0.8; margin-top: 16px;">
                    Hör den Hinweisen der anderen genau zu und versuche nicht aufzufallen!
                </p>
            `;
        }
    } else {
        roleCard.className = 'role-card crew';
        roleTitle.textContent = 'Du bist Teil der Crew!';
        roleIcon.textContent = '👥';
        
        roleContent.innerHTML = `
            <p>Das geheime Wort:</p>
            <div style="font-size: 24px; font-weight: bold; margin: 16px 0;">
                ${gameState.secretWord}
            </div>
            ${gameState.gameSettings.hintWordEnabled ? `
                <p style="font-size: 14px; opacity: 0.8;">
                    Hinweiswort: ${gameState.hintWord}
                </p>
            ` : ''}
            <p style="font-size: 14px; opacity: 0.8; margin-top: 16px;">
                Finde die Impostors!
            </p>
        `;
    }
}

function handleContinueToGame() {
    gameState.gamePhase = 'game';
    showGameScreen();
}

function showGameScreen() {
    showScreen('game');
    
    const wordDisplay = document.getElementById('word-display');
    
    if (gameState.currentRole === 'impostor') {
        if (gameState.gameSettings.hintWordEnabled) {
            wordContent.textContent = 'Du bist Impostor!';
            hintContent.textContent = `Hinweis: ${gameState.hintWord}`;
            hintContent.style.display = 'block';
        } else {
            wordContent.textContent = 'Du bist Impostor!';
            hintContent.style.display = 'none';
        }
        wordDisplay.style.color = 'var(--color-impostor)';
    } else {
        wordContent.textContent = gameState.secretWord;
        if (gameState.gameSettings.hintWordEnabled) {
            hintContent.textContent = `Hinweis: ${gameState.hintWord}`;
            hintContent.style.display = 'block';
        } else {
            hintContent.style.display = 'none';
        }
        wordDisplay.style.color = 'var(--color-crew)';
    }
    
    // Simulate game phase ending after some time
    setTimeout(() => {
        if (gameState.gamePhase === 'game') {
            showVotingScreen();
        }
    }, 30000); // 30 seconds for demo
}

function showVotingScreen() {
    gameState.gamePhase = 'voting';
    showScreen('voting');
    
    votingList.innerHTML = '';
    gameState.votes = {};
    
    gameState.players.forEach(player => {
        if (player.name !== gameState.playerName) {
            const li = document.createElement('li');
            const btn = document.createElement('button');
            btn.textContent = player.name;
            btn.onclick = () => selectVotingTarget(player.name);
            li.appendChild(btn);
            votingList.appendChild(li);
        }
    });
    
    submitVoteBtn.disabled = true;
}

function selectVotingTarget(targetName) {
    // Remove previous selection
    document.querySelectorAll('.voting-list button').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Add selection to clicked button
    event.target.classList.add('selected');
    gameState.votes[gameState.playerName] = targetName;
    submitVoteBtn.disabled = false;
}

function handleSubmitVote() {
    if (!gameState.votes[gameState.playerName]) {
        showError('Bitte wähle einen Spieler aus.');
        return;
    }
    
    // Simulate other players voting
    const simulatedVotes = {};
    gameState.players.forEach(player => {
        if (player.name !== gameState.playerName) {
            // Random vote for demo
            const targets = gameState.players.filter(p => p.name !== player.name);
            const randomTarget = targets[Math.floor(Math.random() * targets.length)];
            simulatedVotes[player.name] = randomTarget.name;
        }
    });
    
    // Count votes
    const allVotes = { ...gameState.votes, ...simulatedVotes };
    const voteCount = {};
    
    Object.values(allVotes).forEach(target => {
        voteCount[target] = (voteCount[target] || 0) + 1;
    });
    
    // Find player with most votes
    let maxVotes = 0;
    let votedOut = null;
    
    Object.entries(voteCount).forEach(([player, votes]) => {
        if (votes > maxVotes) {
            maxVotes = votes;
            votedOut = player;
        }
    });
    
    // Determine winner and show results
    showResults(votedOut);
}

function showResults(votedOutPlayer) {
    gameState.gamePhase = 'results';
    showScreen('results');
    
    const resultCard = document.querySelector('.result-card');
    const votedOut = gameState.players.find(p => p.name === votedOutPlayer);
    const wasImpostor = votedOut && votedOut.role === 'impostor';
    
    if (wasImpostor) {
        // Check if all impostors were voted out
        const allImpostors = gameState.players.filter(p => p.role === 'impostor');
        const votedOutImpostors = allImpostors.filter(p => p.name === votedOutPlayer);
        
        if (votedOutImpostors.length === allImpostors.length) {
            // All impostors voted out, crew wins
            resultCard.className = 'result-card crew-win';
            resultTitle.textContent = 'Crew gewinnt!';
            resultContent.innerHTML = `
                <p>Alle Impostors wurden gefunden!</p>
                <p style="margin-top: 16px;">Das geheime Wort war: ${gameState.secretWord}</p>
            `;
        } else {
            // Some impostors remaining, they get final chance
            const impostorWon = Math.random() > 0.5; // Random for demo
            if (impostorWon) {
                resultCard.className = 'result-card impostor-win';
                resultTitle.textContent = 'Impostors gewinnen!';
                resultContent.innerHTML = `
                    <p>Die verbleibenden Impostors haben das Wort richtig geraten!</p>
                `;
            } else {
                resultCard.className = 'result-card crew-win';
                resultTitle.textContent = 'Crew gewinnt!';
                resultContent.innerHTML = `
                    <p>Die Impostors konnten das Wort nicht erraten!</p>
                    <p style="margin-top: 16px;">Das geheime Wort war: ${gameState.secretWord}</p>
                `;
            }
        }
    } else {
        // Crew member voted out, impostors win
        resultCard.className = 'result-card impostor-win';
        resultTitle.textContent = 'Impostors gewinnen!';
        resultContent.innerHTML = `
            <p>Ein Crew-Mitglied wurde fälschlicherweise gewählt!</p>
            <p style="margin-top: 16px;">${votedOutPlayer} war kein Impostor.</p>
        `;
    }
}

function handleNewRound() {
    // Reset game state but keep players and room
    gameState.gamePhase = 'lobby';
    gameState.currentRole = null;
    gameState.secretWord = '';
    gameState.hintWord = '';
    gameState.votes = {};
    
    // Reset player roles
    gameState.players.forEach(player => {
        player.role = null;
    });
    
    showScreen('landing');
    updateUI();
}

function showError(message) {
    // Simple error display - in a real app, this would be a proper toast/modal
    const errorDiv = document.createElement('div');
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--color-neutral-red);
        color: white;
        padding: 16px 24px;
        border-radius: var(--border-radius);
        z-index: 1000;
        max-width: 80%;
        text-align: center;
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set initial button states
    joinBtn.disabled = true;
    createRoomBtn.disabled = true;
    startGameBtn.disabled = true;
    
    // Focus on name input
    playerNameInput.focus();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden && gameState.gamePhase === 'game') {
        // User switched away during game - could show warning
        console.log('Game running but page is hidden');
    }
});
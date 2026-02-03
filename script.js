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

// Room Management with localStorage for cross-tab functionality
const roomManager = {
    STORAGE_KEY: 'impostor_rooms',
    
    // Load rooms from localStorage
    loadRooms() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            console.warn('Failed to load rooms from localStorage:', e);
            return {};
        }
    },
    
    // Save rooms to localStorage
    saveRooms(rooms) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(rooms));
        } catch (e) {
            console.warn('Failed to save rooms to localStorage:', e);
        }
    },
    
    createRoom(hostName) {
        const roomCode = generateRoomCode();
        const room = {
            code: roomCode,
            host: hostName,
            players: [
                {
                    name: hostName,
                    id: generatePlayerId(),
                    isHost: true,
                    role: null,
                    joinedAt: new Date().toISOString()
                }
            ],
            gameSettings: {
                impostorCount: 1,
                hintWordEnabled: true
            },
            gamePhase: 'lobby',
            createdAt: new Date().toISOString()
        };
        
        // Load existing rooms and add new room
        const rooms = this.loadRooms();
        rooms[roomCode] = room;
        this.saveRooms(rooms);
        
        console.log(`🏠 Room created: ${roomCode} with host ${hostName}`);
        return room;
    },
    
    getRoom(roomCode) {
        const rooms = this.loadRooms();
        const room = rooms[roomCode.toUpperCase()];
        if (room) {
            console.log(`🔍 Found room: ${roomCode} with ${room.players.length} players`);
        } else {
            console.log(`❌ Room not found: ${roomCode}`);
        }
        return room;
    },
    
    joinRoom(roomCode, playerName) {
        const room = this.getRoom(roomCode);
        if (!room) {
            console.log(`❌ Join failed - room not found: ${roomCode}`);
            return { success: false, error: 'Spiel nicht gefunden' };
        }
        
        // Check if player name already exists in room
        if (room.players.some(p => p.name === playerName)) {
            console.log(`❌ Join failed - name already exists: ${playerName}`);
            return { success: false, error: 'Dieser Name ist bereits vergeben' };
        }
        
        const newPlayer = {
            name: playerName,
            id: generatePlayerId(),
            isHost: false,
            role: null,
            joinedAt: new Date().toISOString()
        };
        
        room.players.push(newPlayer);
        
        // Save updated room
        const rooms = this.loadRooms();
        rooms[roomCode.toUpperCase()] = room;
        this.saveRooms(rooms);
        
        console.log(`✅ Player joined: ${playerName} to room ${roomCode}`);
        console.log(`📊 Room ${roomCode} now has ${room.players.length} players:`, room.players.map(p => p.name));
        
        return { success: true, room, player: newPlayer };
    },
    
    updateGameSettings(roomCode, settings) {
        const rooms = this.loadRooms();
        const room = rooms[roomCode.toUpperCase()];
        if (room) {
            room.gameSettings = { ...room.gameSettings, ...settings };
            this.saveRooms(rooms);
            console.log(`⚙️ Updated settings for room ${roomCode}:`, settings);
            return true;
        }
        console.log(`❌ Failed to update settings - room not found: ${roomCode}`);
        return false;
    },
    
    // Debug function to list all rooms
    listAllRooms() {
        const rooms = this.loadRooms();
        console.log('📋 All rooms:', Object.keys(rooms));
        Object.entries(rooms).forEach(([code, room]) => {
            console.log(`  ${code}: ${room.players.length} players, host: ${room.host}`);
        });
        return rooms;
    },
    
    // Clear all rooms (for testing)
    clearAllRooms() {
        localStorage.removeItem(this.STORAGE_KEY);
        console.log('🗑️ All rooms cleared');
    }
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

function generatePlayerId() {
    return 'player_' + Math.random().toString(36).substr(2, 9);
}

function validateRoomCode(code) {
    return /^[A-Z0-9]{4}$/.test(code);
}

function canStartGame(gameState) {
    const minPlayers = 3;
    const hasEnoughPlayers = gameState.players.length >= minPlayers;
    const isHost = gameState.isHost;
    const validImpostorCount = gameState.gameSettings.impostorCount < gameState.players.length;
    
    return isHost && hasEnoughPlayers && validImpostorCount;
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
        if (joinRoom(roomCode, name)) {
            // Success - player joined the room
        }
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
    
    console.log(`🎮 Creating room for host: ${name}`);
    
    // Create room using room manager
    const room = roomManager.createRoom(name);
    
    // Update game state
    gameState.playerName = name;
    gameState.roomCode = room.code;
    gameState.isHost = true;
    gameState.players = [...room.players];
    gameState.gameSettings = { ...room.gameSettings };
    
    console.log(`✅ Room created successfully: ${room.code}`);
    console.log(`📊 Initial room state:`, {
        code: room.code,
        host: room.host,
        players: room.players.length,
        settings: room.gameSettings
    });
    
    updateUI();
    showRoomCode();
}

function joinRoom(roomCode, playerName) {
    console.log(`🚪 Attempting to join room: ${roomCode} as player: ${playerName}`);
    
    // Validate room code format
    if (!roomCode || roomCode.length !== 4) {
        console.log('❌ Invalid room code format');
        showError('Ungültiger Raumcode');
        return false;
    }
    
    // Debug: List all available rooms before joining
    console.log('📋 Available rooms before join:');
    roomManager.listAllRooms();
    
    // Use room manager to join existing room
    const result = roomManager.joinRoom(roomCode, playerName);
    
    if (!result.success) {
        console.log(`❌ Join failed: ${result.error}`);
        showError(result.error);
        return false;
    }
    
    // Update game state with room data
    gameState.roomCode = roomCode;
    gameState.isHost = false;
    gameState.playerName = playerName;
    gameState.players = [...result.room.players];
    gameState.gameSettings = { ...result.room.gameSettings };
    
    console.log(`✅ Successfully joined room: ${roomCode}`);
    console.log(`📊 Room state after join:`, {
        code: result.room.code,
        host: result.room.host,
        players: result.room.players.length,
        playerList: result.room.players.map(p => p.name),
        settings: result.room.gameSettings
    });
    
    updateUI();
    return true;
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
    const canStart = canStartGame(gameState);
    
    startGameBtn.disabled = !canStart;
    
    const minPlayers = 3;
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
    const newCount = parseInt(e.target.value);
    gameState.gameSettings.impostorCount = newCount;
    
    // Update room manager settings if host
    if (gameState.isHost && gameState.roomCode) {
        roomManager.updateGameSettings(gameState.roomCode, { impostorCount: newCount });
    }
    
    updateStartButton();
});

hintWordToggle.addEventListener('change', (e) => {
    const enabled = e.target.checked;
    gameState.gameSettings.hintWordEnabled = enabled;
    
    // Update room manager settings if host
    if (gameState.isHost && gameState.roomCode) {
        roomManager.updateGameSettings(gameState.roomCode, { hintWordEnabled: enabled });
    }
});

function handleStartGame() {
    if (!canStartGame(gameState)) {
        showError('Nur der Spielleiter kann das Spiel starten.');
        return;
    }
    
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
    
    // Update player roles in game state
    players.forEach(updatedPlayer => {
        const playerIndex = gameState.players.findIndex(p => p.id === updatedPlayer.id);
        if (playerIndex !== -1) {
            gameState.players[playerIndex] = updatedPlayer;
        }
    });
    
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

// Test function for debugging (can be removed in production)
function testRoomManagement() {
    console.log('🧪 Testing Room Management with localStorage...');
    
    // Clear existing rooms for clean test
    roomManager.clearAllRooms();
    
    // Test 1: Create room
    const room1 = roomManager.createRoom('TestHost');
    console.log('✅ Room 1 created:', room1.code, 'with', room1.players.length, 'players');
    
    // Test 2: Join room
    const joinResult = roomManager.joinRoom(room1.code, 'TestPlayer');
    console.log('✅ Join result:', joinResult.success ? 'success' : 'failed', joinResult.success ? 'Room now has ' + joinResult.room.players.length + ' players' : joinResult.error);
    
    // Test 3: Try to join with same name
    const duplicateResult = roomManager.joinRoom(room1.code, 'TestHost');
    console.log('✅ Duplicate name test:', duplicateResult.success ? 'failed' : 'success', duplicateResult.error || 'should have failed');
    
    // Test 4: Try to join non-existent room
    const invalidResult = roomManager.joinRoom('XXXX', 'TestPlayer');
    console.log('✅ Invalid room test:', invalidResult.success ? 'failed' : 'success', invalidResult.error || 'should have failed');
    
    // Test 5: Verify room persistence
    const persistedRoom = roomManager.getRoom(room1.code);
    console.log('✅ Persistence test:', persistedRoom ? 'success' : 'failed', persistedRoom ? 'Room still exists with ' + persistedRoom.players.length + ' players' : 'Room lost');
    
    // Test 6: List all rooms
    console.log('📋 Final room list:');
    roomManager.listAllRooms();
    
    console.log('🧪 Room Management Test Complete');
}

// Specific test for Issue #6
function testIssue6Scenario() {
    console.log('🧪 Testing Issue #6 Scenario...');
    
    // Clear rooms
    roomManager.clearAllRooms();
    
    // Step 1: Host creates room in Tab A
    const room = roomManager.createRoom('Alice');
    console.log('📝 Step 1: Alice created room:', room.code);
    
    // Step 2: Bob tries to join with exact room code
    const joinResult = roomManager.joinRoom(room.code, 'Bob');
    console.log('📝 Step 2: Bob joining with code:', room.code);
    console.log('Result:', joinResult);
    
    if (joinResult.success) {
        console.log('✅ Issue #6 FIXED: Bob successfully joined Alice\'s room');
        console.log('Room now has players:', joinResult.room.players.map(p => p.name));
    } else {
        console.log('❌ Issue #6 NOT FIXED: Bob failed to join room');
        console.log('Error:', joinResult.error);
    }
    
    return joinResult.success;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set initial button states
    joinBtn.disabled = true;
    createRoomBtn.disabled = true;
    startGameBtn.disabled = true;
    
    // Focus on name input
    playerNameInput.focus();
    
    // Run test in console (for debugging)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.testRoomManagement = testRoomManagement;
        window.listRooms = () => roomManager.listAllRooms();
        window.clearRooms = () => roomManager.clearAllRooms();
        console.log('🧪 Debug functions available:');
        console.log('  testRoomManagement() - Test room management');
        console.log('  listRooms() - List all rooms');
        console.log('  clearRooms() - Clear all rooms');
    }
    
    // Listen for storage changes for live updates
    window.addEventListener('storage', (e) => {
        if (e.key === roomManager.STORAGE_KEY) {
            console.log('🔄 Room data changed in another tab');
            // If we're in a room, refresh our data
            if (gameState.roomCode && gameState.gamePhase === 'lobby') {
                const room = roomManager.getRoom(gameState.roomCode);
                if (room) {
                    gameState.players = [...room.players];
                    gameState.gameSettings = { ...room.gameSettings };
                    updateUI();
                    console.log('🔄 Updated room data from storage');
                }
            }
        }
    });
});

// Polling fallback for immediate updates (in case storage event doesn't fire)
let lastStorageHash = '';
function checkForRoomUpdates() {
    const currentHash = localStorage.getItem(roomManager.STORAGE_KEY) || '';
    if (currentHash !== lastStorageHash) {
        lastStorageHash = currentHash;
        if (gameState.roomCode && gameState.gamePhase === 'lobby') {
            const room = roomManager.getRoom(gameState.roomCode);
            if (room) {
                gameState.players = [...room.players];
                gameState.gameSettings = { ...room.gameSettings };
                updateUI();
                console.log('🔄 Room data updated via polling');
            }
        }
    }
}

// Check for updates every 2 seconds when in lobby
setInterval(checkForRoomUpdates, 2000);

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden && gameState.gamePhase === 'game') {
        // User switched away during game - could show warning
        console.log('Game running but page is hidden');
    }
});
document.addEventListener('DOMContentLoaded', function() {

    // ---Page elements---
    const setupPage = document.getElementById('setup-page');
    const countdownPage = document.getElementById('countdown-page');
    const viewCardsPage = document.getElementById('view-cards-page');
    const recallPage = document.getElementById('recall-page');
    
    const settingsButton = document.getElementById('settings-button');
    const numCardsInput = document.getElementById('num-cards');
    const timeLimitInput = document.getElementById('time-limit');
    const groupSizeInput = document.getElementById('group-size');
    const prepTimeInput = document.getElementById('prep-time');
    const prepRecallTimeInput = document.getElementById('prep-recall-time');
    const recallTimeInput = document.getElementById('recall-time');

    const countdownLabel = document.getElementById('countdown-label');
    const countdown = document.getElementById('countdown');
    const skipButton = document.getElementById('skip-button');
    const memoTimer = document.getElementById('memo-timer');
    const recallTimer = document.getElementById('recall-timer');
    
    const startButton = document.getElementById('start-button');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const cardsCount = document.getElementById('cards-count');
    const endMemoButton = document.getElementById('end-memo-button');
    const endRecallButton = document.getElementById('end-button');
    
    const cardsContainer = document.getElementById('cards-container');
    const recallSlotsContainer = document.getElementById('recall-slots-container');
    const recallCardsContainer = document.getElementById('recall-cards-container');
    const memoScore = document.getElementById('memo-score');
    const memoTime = document.getElementById('memo-time');

    // ---Game variables-------------------------------------------------------
    const cardsSymbols = [
        '1♥','2♥','3♥','4♥','5♥','6♥','7♥','8♥','9♥','10♥','J♥','Q♥','K♥',
        '1♦','2♦','3♦','4♦','5♦','6♦','7♦','8♦','9♦','10♦','J♦','Q♦','K♦',
        '1♣','2♣','3♣','4♣','5♣','6♣','7♣','8♣','9♣','10♣','J♣','Q♣','K♣',
        '1♠','2♠','3♠','4♠','5♠','6♠','7♠','8♠','9♠','10♠','J♠','Q♠','K♠'
    ];

   
    let deck = [];
    let shuffledDeck = [];
    let selectedCards = [];
    let recalledCards = [];
    let numCards = 0;
    let timeLimit = 0;
    let prepTime = 20;
    let prepRecallTime = 20;
    let recallTime = 300;
    let groupSize = 3;
    let currentGroupIndex = 0;
    let selectedSlot = 0;
    let countdownInterval;
    let time = 0;

    // --- GAME NAVIGATION LOGIC ---------------------------------------------------
    //Page Transition Helper Function
    function switchToPage(fromPage, toPage) {
        fromPage.classList.add('d-none');
        toPage.classList.remove('d-none');
    }

    // Start the game with the current settings
    function startGame() {
        generateDeck();
        selectedCards = shuffledDeck.slice(0, numCards);
        recalledCards = Array(numCards).fill(null);
        startMemorizationCountdown();
    }

    // Start memorization countdown
    function startMemorizationCountdown() {
        switchToPage(setupPage, countdownPage);
        countdownLabel.textContent = 'Memorization starts in: ';
        skipButton.addEventListener('click', startMemorization);
        startCountdown(prepTime, countdown, startMemorization);
    }

    //Start Memorization Phase
    function startMemorization() {
        clearInterval(countdownInterval);
        switchToPage(countdownPage, viewCardsPage);
        displayCardsGroup();
        startTimer(timeLimit * 60, memoTimer, startRecallCountdown);
    }

    //Start Recall Countdown 
    function startRecallCountdown() {
        clearInterval(countdownInterval);
        switchToPage(viewCardsPage, countdownPage);
        skipButton.removeEventListener('click', startMemorization);
        skipButton.addEventListener('click', startRecall);
        countdownLabel.textContent = 'Recall starts in: ';
        startCountdown(prepRecallTime, countdown, startRecall);
    }

    //Start Recall Phase
    function startRecall() {
        clearInterval(countdownInterval);
        switchToPage(countdownPage, recallPage);
        displayRecallSlots();
        displayRecallCards();
        startCountdown(recallTime, recallTimer, endGame);
    }

    //----- SETUP PAGE -------------------------------------------------------------

    // Level selection event listener
    document.querySelectorAll('#level-selection .list-group-item').forEach(item => {
        item.addEventListener('click', function() { 
            numCards = parseInt(this.dataset.numCards);
            timeLimit = parseInt(this.dataset.timeLimit);
            prepTime = parseInt(prepTimeInput.value);
            prepRecallTime = parseInt(prepRecallTimeInput.value);
            recallTime = parseInt(recallTimeInput.value);
            groupSize = parseInt(groupSizeInput.value);
            startGame();
        });
    });

    // Settings button event listener
    settingsButton.addEventListener('click', function() {
        const customFields = document.getElementById('custom-fields');
        customFields.classList.toggle('hidden');
        customFields.classList.toggle('visible');
    });

     // Get user-defined settings and start the game
    startButton.addEventListener('click', () => {
        numCards = parseInt(numCardsInput.value);
        timeLimit = parseInt(timeLimitInput.value);
        prepTime = parseInt(prepTimeInput.value);
        prepRecallTime = parseInt(prepRecallTimeInput.value);
        recallTime = parseInt(recallTimeInput.value);
        groupSize = parseInt(groupSizeInput.value);
        
        if (isNaN(numCards) || isNaN(timeLimit) || numCards < 1 || timeLimit < 1) {
            alert('Please enter valid numbers for cards and time.');
            return;
        }
        startGame();
    });

    // Generate and shuffle the deck of cards 52
    function generateDeck() {
        deck = Array.from({ length: 52 }, (_, i) => ({
            id: i + 1,
            image: `images/card${i + 1}.svg`,
            symbol: cardsSymbols[i],
        }));
        shuffledDeck = shuffle(deck);
    }

    // Shuffle an array
    function shuffle(array) {
        const shuffleArray = array.slice();
        for (let i = shuffleArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffleArray[i], shuffleArray[j]] = [shuffleArray[j], shuffleArray[i]];
        }
        return shuffleArray;
    }

    //----- COUNTDOWN ---------------------------------------------------------
    // Start countdown timer with a given duration
    function startCountdown(duration, element, callback) {
        let timer = duration;
        element.textContent = convertTime(timer);
        countdownInterval = setInterval(() => {
            timer--;
            element.textContent = convertTime(timer);
            if (timer <= 0) {
                clearInterval(countdownInterval);
                callback();
            }
        }, 1000);
    }

    // Start memorization timer with a given duration (in centiseconds)
    function startTimer(duration, element, callback) {
        let timer = duration;
        element.textContent = convertTime(timer);
        countdownInterval = setInterval(() => {
            time++;
            timer--;
            element.textContent = convertTime(timer);
            if (timer <= 0) {
                clearInterval(countdownInterval);
                callback();
            }
        }, 10);
    }

    // Convert time in seconds to mm:ss format (or ss:cc for centiseconds)
    function convertTime(time) {
        const mins = String(Math.floor(time / 60)).padStart(2, '0');
        const secs = String(time % 60).padStart(2, '0');
        return `${mins}:${secs}`;
    }

    // --- MEMORIZATION --------------------------------------------------------
    // Display a group of cards
    function displayCardsGroup() {
        cardsContainer.innerHTML = '';
        const start = currentGroupIndex * groupSize;
        const end = Math.min(start + groupSize, selectedCards.length);
        selectedCards.slice(start, end).forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.dataset.index = card.id;
            cardElement.innerHTML = `<img src="${card.image}" alt="Card ${card.id}">`;
            cardsContainer.appendChild(cardElement);
        });
        cardsCount.textContent = `${end}/${numCards}`;
    }

    // Navigate to the previous group of cards
    prevButton.addEventListener('click', () => {
        if (currentGroupIndex > 0) {
            currentGroupIndex--;
            displayCardsGroup();
        }
    });

    // Navigate to the next group of cards
    nextButton.addEventListener('click', () => {
        const totalGroups = Math.ceil(selectedCards.length / groupSize);
        if (currentGroupIndex < totalGroups - 1) {
            currentGroupIndex++;
            displayCardsGroup();
        }
    });

    // End memorization phase before the time limit
    endMemoButton.addEventListener('click', startRecallCountdown);

    // --- RECALL --------------------------------------------------------------


    // Display recall slots
    function displayRecallSlots() {
        recallSlotsContainer.innerHTML = '';
        slotElements = [];
        
        for (let i = 0; i < numCards; i++) {
            // Create slot element
            const slotElement = document.createElement('div');
            slotElement.classList.add('slot');
            slotElement.dataset.index = i;
            //Display slot number
            const numberElement = document.createElement('span');
            numberElement.classList.add('slot-number');
            numberElement.textContent = i + 1; 
            slotElement.appendChild(numberElement);

            // Position slots
            slotElement.style.left = `${2 + (i % 26) * 2}vw`;
            slotElement.style.top = `${i < 26 ? '4vh' : '23vh'}`;

            slotElement.addEventListener('click', onSlotClicked);
            recallSlotsContainer.appendChild(slotElement);
            slotElements.push(slotElement);
        }
        slotElements[0].classList.add('selected');
    }

    // Display  all deck cards
    function displayRecallCards() {
        recallCardsContainer.innerHTML = '';
        cardElements = [];
        
        deck.forEach(card => {
            // Create card element
            const cardElement = document.createElement('div');
            cardElement.classList.add('deck-card');
            cardElement.dataset.index = card.id;
            cardElement.innerHTML = `<img src="${card.image}" alt="Card ${card.id}" class="img-fluid">`;

            // Position cards
            cardElement.style.left = `${1 + card.id * 1}vw`;
            cardElement.style.top = '43vh';

            cardElement.addEventListener('click', () => onRecallCardClicked(card));
            recallCardsContainer.appendChild(cardElement);
            cardElements.push(cardElement);
        });
    }

    // Handle slot click events
    function onSlotClicked() {
        slotElements[selectedSlot].classList.remove('selected');
        selectedSlot = parseInt(this.dataset.index);
        this.classList.add('selected');

        // Remove card from slot if it exists and place it back in the deck
        if (recalledCards[selectedSlot]) {
            const cardElement = cardElements[recalledCards[selectedSlot].id - 1];
            cardElement.classList.remove('d-none');
            recalledCards[selectedSlot] = null;
            this.querySelector('img').remove();
        }
    }

    // Handle card click events
    function onRecallCardClicked(card) {
        // Check if all slots are full
        if (!recalledCards.every(el => el !== null)) {
            // Place card in the selected slot
            const slotElement = slotElements[selectedSlot];
            slotElement.insertAdjacentHTML('beforeend', `<img src="${card.image}" alt="Card ${card.id}" class="img-fluid">`);
            slotElement.classList.remove('selected');
            recalledCards[selectedSlot] = card;

            // Hide card a
            const cardElement = cardElements[card.id - 1];
            cardElement.classList.add('d-none');

            // Select the next empty slot
            if (!recalledCards.every(el => el !== null)) {
                do {
                    selectedSlot = (selectedSlot + 1) % numCards;
                } while (recalledCards[selectedSlot] !== null);
                slotElements[selectedSlot].classList.add('selected');
            }
        }   
    }

    endRecallButton.addEventListener('click', endGame);

    // End the game and show the results
    function endGame() {
        clearInterval(countdownInterval);
        slotElements[selectedSlot].classList.remove('selected');
        cardElements.forEach(cardElement => cardElement.classList.add('disabled'));
        
        
        let score = 0;
        slotElements.forEach((slotElement, index) => {
            slotElement.classList.add('disabled');
            // Display the correct card symbols
            const span = slotElement.querySelector('span');
            span.textContent = selectedCards[index].symbol;
            const symbol = span.textContent.slice(-1);
            span.classList.add(['♠', '♣'].includes(symbol) ? 'black' : 'red');
            //color the slots based on correct or incorrect
            if (recalledCards[index] && recalledCards[index].id === selectedCards[index].id) {
                slotElement.classList.add('correct');
                score++;
            } else {
                slotElement.classList.add('incorrect');
            }
        });
        // Display the score and time
        memoScore.textContent = `Score: ${score} / ${numCards}`;
        memoTime.textContent = `Time: ${convertTime(time)} sec`;
        recallTimer.textContent = 'Completed';
        // Change the end button to a continue button
        endRecallButton.removeEventListener('click', endGame);
        endRecallButton.textContent = 'Continue';
        endRecallButton.classList.remove('btn-outline-success');
        endRecallButton.classList.add('btn-primary');
        endRecallButton.addEventListener('click', () => location.href = 'index.html');
    }
});

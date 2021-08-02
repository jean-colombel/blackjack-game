// Create deck
const suits = ["H", "C", "D", "S"]
const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "1", "K", "J", "Q", "A"]
const deck = []

for (rank of ranks) {
  for (suit of suits) {
    deck.push(`${rank}${suit}`)
  }
}

// Sounds
const musicTheme = new Audio("static/sounds/casino.mp3")
musicTheme.volume = 0.1
const hitSound = new Audio("static/sounds/swish.m4a")
hitSound.volume = 0.1
const winSound = new Audio("static/sounds/cash.mp3")
winSound.volume = 0.1
const lossSound = new Audio("static/sounds/aww.mp3")
lossSound.volume = 0.1
const coinSound = new Audio("static/sounds/coin.mp3")
coinSound.volume = 0.1

const audio = document.getElementById("main-audio")
const audioTag = audio.firstChild
audio.addEventListener("click", toggleMusic)

function toggleMusic() {
  if (musicTheme.paused) {
    musicTheme.play()
    audioTag.classList.remove("fa-volume-up")
    audioTag.classList.add("fa-volume-mute")
  } else {
    musicTheme.pause()
    audioTag.classList.remove("fa-volume-mute")
    audioTag.classList.add("fa-volume-up")
  }
}

// State
let blackjackGame = {
  you: {
    scoreSpan: "#your-score",
    div: "#your-box",
    score: 0,
    totalCash: 0,
    totalBet: 0
  },
  dealer: {
    scoreSpan: "#dealer-score",
    div: "#dealer-box",
    score: 0
  },
  cards: deck,
  cardsMap: { 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 1: 10, J: 10, Q: 10, K: 10, A: [1, 11] },
  score: {
    wins: 0,
    losses: 0,
    draws: 0
  },
  isStand: false,
  isTurnOver: false,
  isBetOn: true
}

const YOU = blackjackGame.you
const DEALER = blackjackGame.dealer

// Event Listeners
document.querySelector("#hit-button").addEventListener("click", onHit)
document.querySelector("#deal-button").addEventListener("click", onDeal)
document.querySelector("#stand-button").addEventListener("click", onStand)

// Functions

// HIT
function onHit() {
  if (!blackjackGame.isStand && YOU.totalBet > 0) {
    blackjackGame.isBetOn = false
    let card = randomCard()
    showCard(YOU, card)
    updateScore(YOU, card)
    showScore(YOU)
  }
}

function randomCard() {
  let randomIndex = Math.floor(Math.random() * 52)
  return blackjackGame.cards[randomIndex]
}

function showCard(activePlayer, card) {
  if (activePlayer.score <= 21) {
    // Create card
    let cardImage = document.createElement("img")
    cardImage.src = `./static/images/cards/${card}.png`
    document.querySelector(activePlayer.div).appendChild(cardImage)
    hitSound.play()
  }
}

function updateScore(activePlayer, card) {
  // Rule for As (11 or 1)
  if (card.includes("A")) {
    if (activePlayer.score + blackjackGame.cardsMap[card[0]][1] <= 21) {
      activePlayer.score += blackjackGame.cardsMap[card[0]][1]
    } else {
      activePlayer.score += blackjackGame.cardsMap[card[0]][0]
    }
  } else {
    activePlayer.score += blackjackGame.cardsMap[card[0]]
  }
}

function showScore(activePlayer) {
  // Bust logic
  if (activePlayer.score > 21) {
    document.querySelector(activePlayer.scoreSpan).textContent = "BUST!"
    document.querySelector(activePlayer.scoreSpan).style.color = "red"
  } else {
    document.querySelector(activePlayer.scoreSpan).textContent = activePlayer.score
  }
}

// STAND
async function onStand() {
  if (!blackjackGame.isBetOn) {
    blackjackGame.isStand = true

    if (!blackjackGame.isTurnOver) {
      while (DEALER.score < 16 && blackjackGame.isStand) {
        let card = randomCard()
        showCard(DEALER, card)
        updateScore(DEALER, card)
        showScore(DEALER)
        await sleep(700)
      }

      blackjackGame.isTurnOver = true
      let winner = computeWinner()
      showResult(winner)
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// compute and return winner
function computeWinner() {
  let winner
  if (YOU.score <= 21) {
    // You win
    if (YOU.score > DEALER.score || DEALER.score > 21) {
      YOU.totalCash += YOU.totalBet
      winner = YOU
    } else if (YOU.score < DEALER.score) {
      winner = DEALER
      YOU.totalCash -= YOU.totalBet
    } else if (YOU.score == DEALER.score) {
    }
  } else if (YOU.score > 21 && DEALER.score <= 21) {
    winner = DEALER
    YOU.totalCash -= YOU.totalBet
  } else if (YOU.score > 21 && DEALER.score > 21) {
  }
  return winner
}

function showResult(winner) {
  let message, messageColor, sound
  const result = document.getElementById("result")

  if (winner === YOU) {
    message = "You win!"
    messageColor = "green"
    winSound.play()
  } else if (winner === DEALER) {
    message = "You lost!"
    messageColor = "red"
    lossSound.play()
  } else {
    message = "You drew!"
    messageColor = "white"
  }

  result.innerText = message
  result.style.color = messageColor

  // Update total cash (+ warning)
  document.getElementById("totalCashSpan").innerText = YOU.totalCash
  if (YOU.totalCash < 0) {
    document.querySelector(".warning").innerText = "⚠️ You how the casino money!!"
  }
}

// DEAL
function onDeal() {
  if (blackjackGame.isTurnOver) {
    // Remove previous images
    let yourImages = document.querySelector("#your-box").querySelectorAll("img")
    let dealerImages = document.querySelector("#dealer-box").querySelectorAll("img")
    for (image of yourImages) {
      image.remove()
    }
    for (image of dealerImages) {
      image.remove()
    }
    // Reset scores and controls state
    YOU.score = 0
    DEALER.score = 0
    blackjackGame.isTurnOver = false
    blackjackGame.isStand = false
    blackjackGame.isBetOn = true
    // Reset bet
    YOU.totalBet = 0
    const coins = document.querySelectorAll(".coinImg")
    coins.forEach(coin => {
      coin.classList.remove("active")
    })
    // Reset scores
    document.querySelector(YOU.scoreSpan).innerText = 0
    document.querySelector(YOU.scoreSpan).style.color = "white"
    document.querySelector(DEALER.scoreSpan).innerText = 0
    document.querySelector(DEALER.scoreSpan).style.color = "white"
    // Reset result
    document.querySelector("#result").innerText = "Let's play!"
    document.querySelector("#result").style.color = "white"
    document.getElementById("totalBet").textContent = ""
  }
}

// SET BET
function setBet(target) {
  if (blackjackGame.isBetOn) {
    const coin = target.firstChild
    const value = Number.parseInt(target.dataset.value, 10)
    const span = document.getElementById("totalBet")

    if (!coin.classList.contains("active")) {
      YOU.totalBet += value
    } else {
      YOU.totalBet -= value
    }
    coin.classList.toggle("active")
    span.textContent = YOU.totalBet

    if (!coinSound) {
      coinSound.play()
    } else {
      coinSound.currentTime = 0
      coinSound.play()
    }
  }
}

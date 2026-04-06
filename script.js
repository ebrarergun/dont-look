const totalRounds = 6;

let currentRound = 1;
let yourScore = 0;
let otherScore = 0;
let history = [];

let currentSelfishOtherPayoff = 0;
let currentLookChoice = false;

const roundNumber = document.getElementById("roundNumber");
const yourScoreText = document.getElementById("yourScore");
const otherScoreText = document.getElementById("otherScore");
const screen = document.getElementById("screen");

document.getElementById("startBtn").addEventListener("click", startRound);

function updateStats() {
  roundNumber.textContent = `${currentRound} / ${totalRounds}`;
  yourScoreText.textContent = yourScore;
  otherScoreText.textContent = otherScore;
}

function startRound() {
  currentSelfishOtherPayoff = randomFromArray([0, 1, 2, 3]);
  showLookScreen();
  updateStats();
}

function showLookScreen() {
  screen.innerHTML = `
    <h2>Round ${currentRound}</h2>
    <p>
      Before you choose, you may check the real effect of the selfish option.
    </p>
    <p>
      If you look, you will know exactly how many points the other person gets.
      If you do not look, you can still make your choice.
    </p>

    <div class="button-group">
      <button class="main-btn look" onclick="showChoiceScreen(true)">Yes, I want to look</button>
      <button class="main-btn nolook" onclick="showChoiceScreen(false)">No, I do not want to look</button>
    </div>
  `;
}

function showChoiceScreen(looked) {
  currentLookChoice = looked;

  let selfishText = looked
    ? `Option 1: You get <b>10</b>, other person gets <b>${currentSelfishOtherPayoff}</b>`
    : `Option 1: You get <b>10</b>, other person gets <b>?</b>`;

  let fairText = `Option 2: You get <b>6</b>, other person gets <b>6</b>`;

  screen.innerHTML = `
    <h2>Make Your Choice</h2>
    <p>${looked ? "You chose to look." : "You chose not to look."}</p>
    <div class="button-group">
      <button class="choice-btn selfish" onclick="resolveChoice('selfish')">
        ${selfishText}
      </button>
      <button class="choice-btn fair" onclick="resolveChoice('fair')">
        ${fairText}
      </button>
    </div>
  `;
}

function resolveChoice(choice) {
  let youGet = 0;
  let otherGets = 0;

  if (choice === "selfish") {
    youGet = 10;
    otherGets = currentSelfishOtherPayoff;
  } else {
    youGet = 6;
    otherGets = 6;
  }

  yourScore += youGet;
  otherScore += otherGets;

  history.push({
    round: currentRound,
    looked: currentLookChoice,
    choice: choice,
    you: youGet,
    other: otherGets,
    hiddenImpact: currentSelfishOtherPayoff
  });

  updateStats();
  showResultScreen(choice, youGet, otherGets);
}

function showResultScreen(choice, youGet, otherGets) {
  const choiceText = choice === "selfish" ? "Option 1" : "Option 2";

  screen.innerHTML = `
    <h2>Round ${currentRound} Result</h2>
    <p>${currentLookChoice ? "You looked at the hidden impact." : "You did not look at the hidden impact."}</p>

    <div class="result-box">
      <p><b>You chose:</b> ${choiceText}</p>
      <p><b>You received:</b> ${youGet}</p>
      <p><b>Other person received:</b> ${otherGets}</p>
      <p><b>Real hidden impact of selfish option:</b> ${currentSelfishOtherPayoff}</p>
    </div>

    <p class="small-note">
      This round asks an important question:
      Did not knowing make the selfish option easier to choose?
    </p>

    <div class="button-group">
      <button class="main-btn" onclick="nextStep()">Continue</button>
    </div>
  `;
}

function nextStep() {
  if (currentRound < totalRounds) {
    currentRound++;
    startRound();
  } else {
    showFinalScreen();
  }
}

function showFinalScreen() {
  const lookedCount = history.filter(item => item.looked).length;
  const notLookedCount = history.filter(item => !item.looked).length;
  const selfishCount = history.filter(item => item.choice === "selfish").length;
  const fairCount = history.filter(item => item.choice === "fair").length;
  const selfishWithoutLooking = history.filter(item => !item.looked && item.choice === "selfish").length;
  const selfishWithLooking = history.filter(item => item.looked && item.choice === "selfish").length;

  screen.innerHTML = `
    <h2>Final Analysis</h2>
    <p><b>Your final score:</b> ${yourScore}</p>
    <p><b>Other person's final score:</b> ${otherScore}</p>

    <div class="result-box">
      <p><b>You looked:</b> ${lookedCount} time(s)</p>
      <p><b>You did not look:</b> ${notLookedCount} time(s)</p>
      <p><b>You chose selfish option:</b> ${selfishCount} time(s)</p>
      <p><b>You chose fair option:</b> ${fairCount} time(s)</p>
      <p><b>Selfish choices after not looking:</b> ${selfishWithoutLooking}</p>
      <p><b>Selfish choices after looking:</b> ${selfishWithLooking}</p>
    </div>

    <p class="small-note">
      If selfish choices are higher after not looking, this may suggest strategic ignorance:
      not knowing may reduce moral pressure.
    </p>

    <div class="button-group">
      <button class="main-btn" onclick="showHistory()">Show Round History</button>
      <button class="main-btn" onclick="restartGame()">Play Again</button>
    </div>
  `;
}

function showHistory() {
  let historyHtml = history.map(item => {
    return `
      <div class="history-item">
        <b>Round ${item.round}</b><br>
        ${item.looked ? "Looked" : "Did not look"}<br>
        Choice: ${item.choice}<br>
        You: ${item.you} | Other: ${item.other}<br>
        Hidden selfish impact: ${item.hiddenImpact}
      </div>
    `;
  }).join("");

  screen.innerHTML = `
    <h2>Round History</h2>
    <div class="history-list">${historyHtml}</div>
    <div class="button-group">
      <button class="main-btn" onclick="showFinalScreen()">Back</button>
    </div>
  `;
}

function restartGame() {
  currentRound = 1;
  yourScore = 0;
  otherScore = 0;
  history = [];
  updateStats();
  startRound();
}

function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
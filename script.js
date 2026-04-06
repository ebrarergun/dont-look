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

function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function startRound() {
  currentSelfishOtherPayoff = randomFromArray([0, 1, 2, 3]);
  updateStats();
  showLookScreen();
}

function showLookScreen() {
  screen.innerHTML = `
    <h2>Round ${currentRound}</h2>
    <p>
      Before your choice, you may check the real effect of the selfish option.
    </p>
    <p>
      If you look, you will know exactly how many points the other person gets.
      If you do not look, you can still choose.
    </p>

    <div class="button-group">
      <button class="main-btn look" onclick="showChoiceScreen(true)">Yes, I want to look</button>
      <button class="main-btn nolook" onclick="showChoiceScreen(false)">No, I do not want to look</button>
    </div>
  `;
}

function showChoiceScreen(looked) {
  currentLookChoice = looked;

  const selfishText = looked
    ? `Option 1: You get <b>10</b>, other person gets <b>${currentSelfishOtherPayoff}</b>`
    : `Option 1: You get <b>10</b>, other person gets <b>?</b>`;

  const fairText = `Option 2: You get <b>6</b>, other person gets <b>6</b>`;

  screen.innerHTML = `
    <h2>Make Your Choice</h2>
    <p>${looked ? "You chose to look at the real impact." : "You chose not to look at the real impact."}</p>

    <div class="button-group">
      <button class="choice-btn selfish" onclick="resolveChoice('selfish')">${selfishText}</button>
      <button class="choice-btn fair" onclick="resolveChoice('fair')">${fairText}</button>
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
      <p><b>Hidden selfish impact:</b> ${currentSelfishOtherPayoff}</p>
    </div>

    <p class="small-note">
      Question of this round: Did not knowing make the selfish option easier?
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

function calculateProfile() {
  const lookedCount = history.filter(item => item.looked).length;
  const notLookedCount = totalRounds - lookedCount;

  const fairCount = history.filter(item => item.choice === "fair").length;
  const selfishCount = totalRounds - fairCount;

  const selfishWithoutLooking = history.filter(item => !item.looked && item.choice === "selfish").length;
  const noLookCount = history.filter(item => !item.looked).length;
  const lookedAndFair = history.filter(item => item.looked && item.choice === "fair").length;
  const lookedCountSafe = history.filter(item => item.looked).length;

  const curiosityScore = Math.round((lookedCount / totalRounds) * 100);
  const fairnessScore = Math.round((fairCount / totalRounds) * 100);

  const strategicIgnoranceRisk = noLookCount === 0
    ? 0
    : Math.round((selfishWithoutLooking / noLookCount) * 100);

  const moralPressureSensitivity = lookedCountSafe === 0
    ? 0
    : Math.round((lookedAndFair / lookedCountSafe) * 100);

  let profileText = "";
  let badge = "";

  if (fairnessScore >= 70 && curiosityScore >= 60) {
    profileText = "You are fairness-oriented and also willing to face information directly. You do not seem comfortable using ignorance as an excuse.";
    badge = `<span class="badge badge-green">Fair & Open</span>`;
  } else if (strategicIgnoranceRisk >= 70 && curiosityScore <= 40) {
    profileText = "You often avoid information and choose the selfish option after that. This suggests a strong tendency toward strategic ignorance.";
    badge = `<span class="badge badge-orange">Strategic Ignorance Risk</span>`;
  } else if (curiosityScore >= 70 && fairnessScore < 50) {
    profileText = "You are curious and you want information, but information does not always make you fair. You may value knowledge more than equality.";
    badge = `<span class="badge badge-blue">Curious but Self-Interested</span>`;
  } else {
    profileText = "Your choices are mixed. Sometimes you want information, sometimes you avoid it. Your behavior suggests that both self-interest and moral pressure matter.";
    badge = `<span class="badge badge-pink">Mixed Decision Style</span>`;
  }

  return {
    lookedCount,
    notLookedCount,
    fairCount,
    selfishCount,
    selfishWithoutLooking,
    curiosityScore,
    fairnessScore,
    strategicIgnoranceRisk,
    moralPressureSensitivity,
    profileText,
    badge
  };
}

function showFinalScreen() {
  const profile = calculateProfile();

  screen.innerHTML = `
    <h2>Final Analysis</h2>
    <p><b>Your final score:</b> ${yourScore}</p>
    <p><b>Other person's final score:</b> ${otherScore}</p>

    <div class="profile-box">
      <p><b>You looked:</b> ${profile.lookedCount} time(s)</p>
      <p><b>You did not look:</b> ${profile.notLookedCount} time(s)</p>
      <p><b>You chose fair option:</b> ${profile.fairCount} time(s)</p>
      <p><b>You chose selfish option:</b> ${profile.selfishCount} time(s)</p>
    </div>

    <h3 class="profile-title">Your Decision Profile</h3>

    <div class="meter">
      <div class="meter-label">
        <span>Curiosity</span>
        <span>${profile.curiosityScore}%</span>
      </div>
      <div class="meter-track">
        <div class="meter-fill fill-curiosity" style="width:${profile.curiosityScore}%"></div>
      </div>
    </div>

    <div class="meter">
      <div class="meter-label">
        <span>Fairness</span>
        <span>${profile.fairnessScore}%</span>
      </div>
      <div class="meter-track">
        <div class="meter-fill fill-fairness" style="width:${profile.fairnessScore}%"></div>
      </div>
    </div>

    <div class="meter">
      <div class="meter-label">
        <span>Strategic Ignorance Risk</span>
        <span>${profile.strategicIgnoranceRisk}%</span>
      </div>
      <div class="meter-track">
        <div class="meter-fill fill-ignorance" style="width:${profile.strategicIgnoranceRisk}%"></div>
      </div>
    </div>

    <div class="meter">
      <div class="meter-label">
        <span>Moral Pressure Sensitivity</span>
        <span>${profile.moralPressureSensitivity}%</span>
      </div>
      <div class="meter-track">
        <div class="meter-fill fill-pressure" style="width:${profile.moralPressureSensitivity}%"></div>
      </div>
    </div>

    <div class="badge-row">
      ${profile.badge}
    </div>

    <div class="profile-box">
      <p><b>Interpretation:</b> ${profile.profileText}</p>
    </div>

    <p class="small-note">
      This result does not say who you are as a person forever. It only shows your pattern in this game.
    </p>

    <div class="button-group">
      <button class="main-btn" onclick="showHistory()">Show Round History</button>
      <button class="main-btn" onclick="restartGame()">Play Again</button>
    </div>
  `;
}

function showHistory() {
  let historyHtml = history.map(item => `
    <div class="history-item">
      <b>Round ${item.round}</b><br>
      ${item.looked ? "Looked" : "Did not look"}<br>
      Choice: ${item.choice}<br>
      You: ${item.you} | Other: ${item.other}<br>
      Hidden selfish impact: ${item.hiddenImpact}
    </div>
  `).join("");

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

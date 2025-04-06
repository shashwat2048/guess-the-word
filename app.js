let chances = 10;
let word = "";
let definition = "";
let wordMap = new Map();
let guessed = new Set();
let displayArr = [];
let firstLoading = true;

const submitBtn     = document.getElementById('submitBtn');
const inputField    = document.getElementById('inputField');
const ackText       = document.getElementById('ack-text');
const secretWordEl  = document.getElementById('secret-word');
const chancesText   = document.getElementById('chances-text');
const attemptsEl    = document.querySelector('.attempted-letters');
const newWordBtn    = document.getElementById('newWordBtn');
const definitionText= document.getElementById('definition-text');
const inputArea     = document.getElementById('input-area');
const bgSound = document.getElementById('bg_sound');
const loader = document.getElementById('loader');
const wordLoader = document.getElementById('loader-2');
bgSound.volume = 0.5;
inputArea.addEventListener('click', () => {
    bgSound.play();
});
document.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    submitBtn.click();
  }
});

function randomTwoNum() {
  const a = Math.floor(Math.random() * 5);
  const x = Math.floor(Math.random() * 4);
  const b = x >= a ? x + 1 : x;
  return [a, b];
}

async function getWordMeaning(word) {
  try {
    const res  = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const data = await res.json();
    if (!Array.isArray(data) || !data[0].meanings?.length) return null;
    const def = data[0].meanings[0].definitions[0].definition;
    return def || null;
  } catch {
    return null;
  }
}

async function getValidWord() {
  while (true) {
    const res = await fetch('https://random-word-api.vercel.app/api?length=5');
    const [w] = await res.json();
    const def = await getWordMeaning(w);
    if (def) return { w, def };
  }
}

async function initGame() {
  if(firstLoading) {
    loader.style.display = "flex";
    wordLoader.style.display = "flex";
    firstLoading = false;
  }
  else{
    wordLoader.style.display = "flex";
  }
  const result = await getValidWord();
  
  loader.style.display = "none";
  wordLoader.style.display = "none";

  word = result.w;
  definition = result.def;
  definitionText.textContent = definition;

  wordMap.clear();
  guessed.clear();
  chances = 10;
  displayArr = ['*', '*', '*', '*', '*'];

  for (let i = 0; i < 5; i++) wordMap.set(i, word[i]);
  const [i1, i2] = randomTwoNum();
  displayArr[i1] = word[i1];
  displayArr[i2] = word[i2];
  wordMap.delete(i1);
  wordMap.delete(i2);

  updateUI();

  newWordBtn.style.display = "none";
  inputArea.style.display = "flex";
}

function updateUI() {
  secretWordEl.textContent = displayArr.join(' ');
  chancesText.textContent = `Chances left: ${chances}`;
  attemptsEl.textContent = `Tried: ${[...guessed].join(', ')}`;
}

submitBtn.onclick = () => {
  const input = inputField.value.toLowerCase();
  inputField.value = '';
  if (!/^[a-z]$/.test(input)) {
    ackText.textContent = '⚠️ Enter a valid letter.';
    return;
  }
  if (guessed.has(input)) {
    ackText.textContent = `⚠️ Already guessed "${input}".`;
    return;
  }

  guessed.add(input);

  if ([...wordMap.values()].includes(input)) {
    for (let [idx, ch] of wordMap) {
      if (ch === input) {
        displayArr[idx] = ch;
        wordMap.delete(idx);
      }
    }
    ackText.textContent = `✅ "${input}" is correct!`;
    updateUI();

    if (displayArr.join('') === word) {
      ackText.textContent = `🎉 You guessed the word: "${word}"`;
      endGame();
    }

  } else {
    if(word.includes(input)){
        ackText.textContent = `"${input}" ⚠️ Already in the word.`;
        updateUI();
        return;
    }
    chances--;
    ackText.textContent = `❌ Nope! "${input}" is not in the word.`;
    updateUI();

    if (chances === 0) {
      ackText.textContent = `💥 Game over! Word was: "${word}"`;
      endGame();
    }
  }
};

function endGame() {
  inputArea.style.display = "none";
  newWordBtn.style.display = "inline-block";
}

newWordBtn.onclick = () => {
  ackText.textContent = '';
  initGame();
};

initGame();

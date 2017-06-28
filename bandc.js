let config = {
  classic: {
    ranges: {
      first: [1, 2, 3, 4],
      second: [5, 6, 7, 8],
      third: [9]
    },
    coeffs: {
      first: [2, 2], 
      second: [2, 2], 
      third: [3]
    }
  },
  advanced: {
    ranges: {
      first: [1, 2, 3, 4, 5],
      second: [6, 7, 8, 9, 0]
    },
    coeffs: {
      first: [10, 20, 10],
      second: [10, 20, 10]
    }
  }
};

Array.prototype.sample = function(num) {
  let result = [];
  for (i = 1; i <= num; i++) {
    let a = this[~~(Math.random() * this.length)];
    result.includes(a) ? i-- : result.push(a);
  }
  return result;
};

Object.prototype[Symbol.iterator] = function * () {
    for (const [key, value] of Object.entries(this)) {
        yield [key, value]; 
    }
};

function genNum(set, iter) {
  if (iter === 0) return [];
  let localSet = set;
  let num = localSet.sample(1).toString().split();
  localSet = localSet.filter(el => el !== Number(num));
  num = num.concat(genNum(localSet, (iter - 1))).map(el => Number(el));
  return num;
}

function genSet(range, mult) {
  let result = range;
  for (let [key, value] of mult) {
    let myArr = [];
    for (let i = 0; i <= (value - 2); i++) {
      myArr.push(i);
    }
    result = result.concat(myArr.fill(Number(key)));
  }
  return result.sort();
}

function genMult(ranges, coeffs) {
  let result = {};
  for (let [key, value] of ranges) {
    let subRange = value.sample(coeffs[key].length);
    subRange.forEach ((num, index) => {
      result[num] = coeffs[key][index];
    });
  }
  return result;
}

function whatsNext(param) {
  if (param === 'select') {
    gameType = prompt("Select classic or advanced game mode. For classic press 'c', for advanced press 'a'.");
  } else if (param === 'again') {
    gameType = prompt("Do you want to play again? Press 'y' to continue or any other key to exit.");
  }
  return gameType.toString();
}

function isNonNumerical(guess) {
  let result = false;
  if (guess.join('').match(/\D/)) {
    alert('Please, try again. You cannot use non-numerical characters in your guess');
    result = true;
  }
  return result;
}

function isWrong(guess, numberOfDigits) {
  let result = false;
  if (guess.length !== numberOfDigits) {
    alert(`Please, try again. Your guess must contain exactly ${numberOfDigits} digits!`);
    result = true;
  }
        
  if (guess.length !== new Set(guess).size) {
    alert(`Please, try again. Your guess must contain ${numberOfDigits} unique digits!`);
    result = true;
  }
    
  if (guess.includes(0) && numberOfDigits === 4) {
    alert("Please, try again. You cannot use zero in your guess!");
    result = true;
  }
  return result;
}

function countingBulls(secretNumber, userGuess) {
  let result = [];
  let newUserGuess = backToNormal(userGuess);
  for (let i = 0; i < newUserGuess.length; i++) {
    if (newUserGuess[i] === secretNumber[i]) {
      result.push(newUserGuess[i]);
    }
  }
  return result;
}

function intersect(secretNumber, userGuess) {
  let mapped = secretNumber.map((el) => {
    let result = [];
    if (secretNumber.includes(el) && backToNormal(userGuess).includes(el)) {
      result.push(el);
    }
    return result;
  });
  return [].concat(...mapped);
}

function isEqual(secretNumber, userGuess) {
  let i = secretNumber.length;
  while (i--) {
    if (secretNumber[i] !== userGuess[i]) return false;
  }
  return true;
}

function backToNormal(userGuess) {
  return userGuess.map(el => Number(el));
}

function howGorgeousIsUser(score) {
  if (score.length != 1) {
    alert(`You're gorgeous! It took you ${score.length} guesses!`);
  } else {
    alert("You're gorgeous! It took you just one guess!");
  }
}

function playing(num, type, setLength) {
  let myArray = [...Array(10).keys()];
  if (setLength === 9) {
    myArray.splice(0, 1);
  }
  let generatedMult = genMult(config[type]['ranges'], config[type]['coeffs']);
  let generatedSet = genSet(myArray, generatedMult);
  let secretNumber = genNum(generatedSet, num);
  let score = [];
  let userGuess = [];
  alert(secretNumber); //delete this after testing!
  
  while (!isEqual(secretNumber, userGuess)) {
    userGuess = prompt("Input your guess using keyboard.").split("");
    
    if (isNonNumerical(userGuess)) {
      continue;
    }
    if (isWrong(userGuess, num)) { 
      continue;
    }
    
    score.push(userGuess);
    
    let bullsNCows = intersect(secretNumber, userGuess);
    let bulls = countingBulls(secretNumber, userGuess);
    let cows = bullsNCows.length - bulls.length;
    
    alert(`${userGuess.join('')} has ${bulls.length} bulls and ${cows} cows.`);
    userGuess = backToNormal(userGuess);
  }
  howGorgeousIsUser(score);
  score = [];
}

var gameType = "";

whatsNext('select');

while (gameType) {
  if (gameType === "c") {  
    playing(4, 'classic', 9);
    whatsNext('again');
    if (gameType !== "y") break;
    whatsNext('select');
  } else if (gameType === "a") {
    playing(6, 'advanced', 10);
    whatsNext('again');
    if (gameType !== "y") break;
    whatsNext('select'); 
  } else { 
    alert("Didn’t quite catch that. What was it, again?");
    whatsNext('select');
  }
}

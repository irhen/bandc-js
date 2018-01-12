// the helper-object defining ranges for more appropriate secret number generating
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
  },
};

// the helper-function taking exactly *num* random unique digits from a given array;
// returns an Array;
// pure? uses Math.random() though;
// takes a number (Number) as an argument;
// patching the prototype because dot notation is way more comfortable
Array.prototype.sample = function(num) {
  let result = [];
  for (let i = 1; i <= num; i++) {
    let a = this[~~(Math.random() * this.length)];
    result.includes(a) ? i-- : result.push(a);
  }
  return result;
};

// the helper-function making Objects iterable;
// pure;
// patching the prototype because there's no other choice
Object.prototype[Symbol.iterator] = function * () {
    for (const [key, value] of Object.entries(this)) {
        yield [key, value]; 
    }
};

// the helper-function generating the secret number;
// needs genSet(), Array.sample() to work;
// returns a Number;
// pure;
// takes a generated set (Array) and a number (Number) as arguments;
// number is the amount of digits the secret number will consist of;
// generated set is coming from the genSet
function genNum(arr, amount) {
  if (amount === 0) return [];
  let localSet = arr;
  let num = localSet.sample(1);
  localSet = localSet.filter(el => el !== Number(num));
  num = num.concat(genNum(localSet, (amount - 1)));
  return num;
}

// the helper-function generating a set of digits for genNum to pick from;
// needs genMult() to work;
// returns an Array of digits;
// pure;
// takes range (Array) and multiplicator (Object) as arguments;
// range is an array of unique digits some of which
// will be duplicated later by multiplicator;
// mult is said multiplicator coming from genMult
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

// the helper-function for generating the multiplicator for genSet to know which
// digits will appear in the set for how much times exactly;
// needs Array.sample() to work;
// returns an Object;
// pure;
// structure of said object will be like { 1: 3, 3: 2 } where
// keys would be the digits from the config objects ranges
// and values would be the multiplicator for them;
// takes ranges (Array) and coeffs (Array) as arguments;
// ranges are arrays of digits to pick some of them for later multiplication;
// coeffs are arrays of digits defining 'weight' of respective array in ranges
function genMult(ranges, coeffs) {
  let result = {};
  const func = (key) => {
    return (num, index) => {
      result[num] = coeffs[key][index];
    };
  };
  for (let [key, value] of ranges) {
    let subRange = value.sample(coeffs[key].length);
    subRange.forEach(func(key));
  }
  return result;
}

// the function asking if user wants to play and which game type if yes;
// returns a String;
// has side effects;
// takes a string (String) as an argument;
function whatsNext(param) {
  if (param === 'select') {
    gameType = prompt("Select classic or advanced game mode. For classic press 'c', for advanced press 'a'.");
  } else if (param === 'again') {
    gameType = prompt("Do you want to play again? Press 'y' to continue or any other key to exit.");
  }
  return gameType.toString();
}

// the helper-function checking if user input contains any non-numerical chars;
// returns a Boolean;
// has side effects;
// takes user guess (Array) as an argument;
// uses a RegExp to validate user input;
function isNonNumerical(guess) {
  let result = false;
  if (guess.join('').match(/\D/)) {
    alert('Please, try again. You cannot use non-numerical characters in your guess');
    result = true;
  }
  return result;
}

// the helper-function checking if user guess is valid;
// returns a Boolean;
// has side effects;
// takes user guess (Array) and a number (Number) as arguments;
// checks for length, uniqueness and (optionally) zero;
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

// the helper-function counting bulls;
// needs backToNormal() to work;
// bulls are digits in user guess that are:
// also present in secret number
// have the same index as its counterpart in secret number;
// returns an Array;
// pure;
// said array will contain only bulls;
// takes secret number (Array) and user guess (Array) as arguments;
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

// the helper-function checking if two given arrays have 1+ identical values;
// returns an Array;
// pure;
// takes secret number (Array) and user guess (Array) as arguments;
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

// the helper-function checking two given arrays for containg identical values only;
// returns a Boolean;
// pure;
// takes secret number (Array) and user guess (Array) as arguments;
function isEqual(secretNumber, userGuess) {
  let i = secretNumber.length;
  while (i--) {
    if (secretNumber[i] !== userGuess[i]) return false;
  }
  return true;
}

// the helper-function walking through a given array and coercing every element
// to Number;
// returns an Array;
// pure;
// takes user guess (Array) as an argument;
function backToNormal(userGuess) {
  return userGuess.map(el => Number(el));
}

// the helper-function cheking the number of guesses user made;
// returns nothing;
// has side effects;
// takes score (Array) as an argument;
// checks the length of a given array;
function howGorgeousIsUser(score) {
  if (score.length != 1) {
    alert(`You're gorgeous! It took you ${score.length} guesses!`);
  } else {
    alert("You're gorgeous! It took you just one guess!");
  }
}

// the function implementing gameplay;
// needs genNum(), isNonNumerical(), isWrong(), intersect(), countingBulls(),
// backToNormal(), howGorgeousIsUser() to work;
// returns undefined;
// has side effects;
// takes number (Number), game type (String) and length of the set (Number)
// as arguments;
// number is used to generate secret number and also for checking if
// user input is valid;
// game type defines if user will be playing classic or advanced game (this is
// important to know since it will be used as key to the config object);
// length of the set is used to know if zero will be allowed (it will be 10 if
// zero is allowed or 9 if not);
function playing(num, type, setLength) {
  let myArray = [...Array(10).keys()];
  if (setLength === 9) {
    myArray.splice(0, 1);
  }
  let generatedMult = genMult(config[type].ranges, config[type].coeffs);
  let generatedSet = genSet(myArray, generatedMult);
  let secretNumber = genNum(generatedSet, num);
  let score = [];
  let userGuess = [];
  
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

// used a global variable since wasn't sure how to make it any other way (cos
// it's needed for the while loop) right now, but maybe will ditch it later when
// finally refactoring to events
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

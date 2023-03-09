'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Fahad Khan',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2021-11-18T21:31:17.178Z',
    '2021-12-23T07:42:02.383Z',
    '2022-01-28T09:15:04.904Z',
    '2022-04-01T10:17:24.185Z',
    '2022-05-08T14:11:59.604Z',
    '2022-09-01T17:01:17.194Z',
    '2023-02-19T23:36:17.929Z',
    '2023-02-25T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Harry Potter',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2021-11-01T13:15:33.035Z',
    '2021-11-30T09:48:16.867Z',
    '2021-12-25T06:04:23.907Z',
    '2022-01-25T14:18:46.235Z',
    '2022-02-05T16:33:06.386Z',
    '2022-04-10T14:43:26.374Z',
    '2022-06-25T18:49:59.371Z',
    '2022-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

let currAccount, timer;

const computerUserName = (accs) => {
accs.forEach(acc => {
  const username = acc.owner.toLowerCase().split(' ').map(word => word[0]).join('');
  acc.username = username;
});
}

computerUserName(accounts);

function updateUI(currAccount) {
  displayMovements(currAccount);
  calcBalance(currAccount);
  calcSummary(currAccount);
}

function displayDate() {

  const tick = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, 0);
  const day = `${now.getDate()}`.padStart(2, 0);
  const hours = `${now.getHours()}`.padStart(2, 0);
  const mins = `${now.getMinutes()}`.padStart(2, 0);
  const secs = `${now.getSeconds()}`.padStart(2, 0);
  labelDate.textContent = `${day}/${month}/${year} - ${hours}:${mins}:${secs}`
  }
  tick();
  setInterval(tick, 1000)
} 

function formatMovementsDate(date) {
  const calcDaysPassed = (max, min) => max - min;
  const daysPassedinMillisec = calcDaysPassed(new Date(), date);
  const daysPassed = Math.trunc(daysPassedinMillisec / (24 * 60 * 60 * 1000));

  if (daysPassed === 0) {
    return `Today`;
  } else if (daysPassed < 7) {
    return `${daysPassed} days ago`
  } else if (daysPassed === 7) {
    return `1 week ago`;
  } else {
    const year = new Date(date).getFullYear();
    const month = `${new Date(date).getMonth()}`.padStart(2, 0);
    const day = `${new Date(date).getDate()}`.padStart(2, 0);
    return `${day}-${month}-${year}`
  }
}

const authenticateUser = (e) => {
  e.preventDefault();
  const inputUserName = inputLoginUsername.value;
  const inputPin = +inputLoginPin.value;
  currAccount = accounts.find(acc => acc?.username === inputUserName);
  if (currAccount?.pin !== inputPin) {
    return;
  } else {
    if (timer) {
      clearInterval(timer);
    }
      timer = logoutUser()

    labelWelcome.textContent = `Welcome back, ${currAccount.owner.split(" ")[0]}`;
    updateUI(currAccount);
    displayDate();
    containerApp.classList.remove('hidden');
    inputLoginUsername.value = inputLoginPin.value = "";
  }
}

btnLogin.addEventListener('click', authenticateUser);


function displayMovements(account, sorted=false){
  containerMovements.innerHTML = "";
  const movs = sorted ? account.movements.slice().sort((a, b) => a - b) : account.movements;
  movs.forEach((mov, i) => {
    const movType = mov > 0 ? 'deposit': 'withdrawal';
    const dateInmillisec = new Date(account.movementsDates[i]).getTime();
    const dateStr = formatMovementsDate(dateInmillisec);
    const html = `
    <div class="movements__row">
          <div class="movements__type movements__type--${movType}">${i+1} ${movType}</div>
          <div class="movements__date">${dateStr}</div>
          <div class="movements__value">${Math.abs(mov).toFixed(2)}€</div>
        </div>
    `
    containerMovements.insertAdjacentHTML('afterbegin', html);
  }) ;
}

function calcBalance(acc) {
  const balance = +acc.movements.reduce((acc, curr) => acc + curr, 0);
  labelBalance.textContent = `${balance.toFixed(2)}€`;
}

function calcSummary(currAccount) {
  const balanceIn = +currAccount.movements.filter(mov => mov > 0).reduce((acc, curr) => acc + curr, 0);
  const balanceOut = +currAccount.movements.filter(mov => mov < 0).reduce((acc, curr) => acc + curr, 0);
  const interest = +currAccount.movements.filter(mov => mov > 0).map(mov => mov * currAccount.interestRate / 100).reduce((acc, curr) => acc + curr, 0);

  labelSumIn.textContent = `${balanceIn.toFixed(2)}€`;
  labelSumOut.textContent = `${Math.abs(balanceOut).toFixed(2)}€`;
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
}

const handleTransfer = (e) => {
  e.preventDefault();
  const transferTo = inputTransferTo.value;
  const transferAmount = +inputTransferAmount.value;
  const transferToAccount = accounts.find(acc => acc?.username === transferTo);

  if (!transferToAccount) {
    return;
  } else {
    setTimeout(() => {
      transferToAccount.movements.push(transferAmount);
    currAccount.movements.push(-transferAmount);
    currAccount.movementsDates.push(new Date());
    transferToAccount.movementsDates.push(new Date());
    updateUI(currAccount);
    }, 3000);
    
    if (timer) clearInterval(timer);
      timer = logoutUser();
  }
  inputTransferTo.value = inputTransferAmount.value = "";

} 

btnTransfer.addEventListener('click', handleTransfer);

const handleLoan = (e) => {
  e.preventDefault();
  const loanAmount = +Math.floor(inputLoanAmount.value);
  const anyDeposit = currAccount.movements.some(mov => mov >= 0.15 * loanAmount );
  if (loanAmount > 0 && anyDeposit) {
    setTimeout(() => {
    currAccount.movements.push(loanAmount);
    currAccount.movementsDates.push(new Date())
      updateUI(currAccount);  
    }, 3000);
    inputLoanAmount.value = "";
    
      if (timer) clearInterval(timer);
      timer = logoutUser();
  }
  }

btnLoan.addEventListener('click', handleLoan);

const handleCloseAccount = (e) => {
  e.preventDefault();
  const closeAccountUsername = inputCloseUsername.value;
  const closeAccountPin = +inputClosePin.value;
  const accountIndex = accounts.findIndex(acc => acc?.username === closeAccountUsername);
  const accountToRemove = accounts[accountIndex];
  if (accountToRemove && accountToRemove.pin === closeAccountPin) {
    accounts.splice(accountIndex, 1);
    labelWelcome.innerHTML = 'Log in to get started';
    containerApp.classList.add('hidden');
    if (timer) clearInterval(timer);
      timer = logoutUser();
  } 
  inputCloseUsername.value = inputClosePin.value = "";
}

btnClose.addEventListener('click', handleCloseAccount);

let sorted = false;
btnSort.addEventListener('click', function(e) {
  e.preventDefault();
  sorted = !sorted;
  displayMovements(currAccount, sorted);
});

function logoutUser() {
  let time = 600;
  const timer = () => {
    const mins = `${Math.trunc(time / 60)}`.padStart(2, 0);
    const secs = `${time % 60}`.padStart(2, 0);
    labelTimer.textContent = `${mins}:${secs}`
    if(time === 0) {
      clearInterval(timerFunc);
      containerApp.style.opacity = 0;
      labelWelcome.innerHTML = 'Log in to get started';
    }
    time--;
  }
  timer();
  const timerFunc = setInterval(timer, 1000);
  return timerFunc;
}





















/*

const formatMovementsDate = function(date) {
  const calcDaysPassed = (date1, date2) => Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));
  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'TODAY';
  else if (daysPassed === 1) return 'YESTERDAY';
  else if (daysPassed <= 7) return `${daysPassed} DAYS AGO`;
  else {
  const day = `${date.getDate()}`.padStart(2, 0);
  const month = `${date.getMonth() + 1}`.padStart(2, 0);
  const year = `${date.getFullYear()}`;
  return `${day}/${month}/${year}`;
}
}

const computerUserName = function(accs) {
  accs.forEach(acc => {
    acc.username = acc.owner.toLowerCase().split(' ')
    .map(name => name[0]).join('')});
}
computerUserName(accounts);

const displayMovements = function(acc, sort = false) {
  containerMovements.innerHTML = '';
  const movements = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

  movements.forEach(function(mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementsDate(date);
    const html = `
    <div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__date">${displayDate}</div>
    <div class="movements__value">${mov.toFixed(2)}€</div>
  </div>  
  `
  containerMovements.insertAdjacentHTML('afterbegin', html);
  });
}


const calcBalance = function(movs) {
  const balance = movs.reduce(function(acc, curr) {
    return acc + curr;
  }, 0);
  labelBalance.textContent = `${balance.toFixed(2)}€`;
  currentAccount.balance = balance;
}

const calcDisplaySummary = function(acc) {
const input = acc.movements.filter(mov => mov > 0).reduce((acc, curr) => acc + curr, 0);
labelSumIn.textContent = `${input.toFixed(2)}€`;

const output = acc.movements.filter(mov => mov < 0).reduce((acc, curr) => acc + curr, 0);
labelSumOut.textContent = `${Math.abs(output).toFixed(2)}€`;

const interest = acc.movements.filter(mov => mov > 0).map(mov => mov * acc.interestRate / 100).reduce((acc, curr) => acc + curr, 0);
labelSumInterest.textContent = `${interest.toFixed(2)}€`;
}

const updateUI = function() {
  calcDisplaySummary(currentAccount);
  calcBalance(currentAccount.movements);
  displayMovements(currentAccount);
}

// EVENT LISTENERS
let currentAccount, timer;
const startLogOutTimer = function() {
  let time = 120;
  const tick = function() {
    let min = `${Math.trunc(time / 60)}`.padStart(2, 0);
    let sec = `${time % 60}`.padStart(2, 0);
    
    labelTimer.textContent = `${min}:${sec}`;
    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get started';
    } 
    time--;
  }
  tick();  
  timer = setInterval(tick, 1000);
  return timer;
}

btnLogin.addEventListener('click', function(e) {
  e.preventDefault();
  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    updateUI();
    containerApp.style.opacity = 1;

    const now = new Date();
    const currDate = `${now.getDate()}`.padStart(2, 0);
    const currMonth = `${now.getMonth() + 1}`.padStart(2, 0);
    const currYear = `${now.getFullYear()}`;
    const hour = `${now.getHours()}`.padStart(2, 0);
    const min = `${now.getMinutes()}`.padStart(2, 0); 
    labelDate.textContent = `${currDate}/${currMonth}/${currYear}, ${hour}:${min}`;
    
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
    
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    labelWelcome.textContent = `Welcome Back, ${currentAccount.owner.split(' ')[0]}`;

  }
}); 

btnTransfer.addEventListener('click', function(e) {
  e.preventDefault();

  let transferTo = accounts.find(acc => acc.username === inputTransferTo.value);
  if (transferTo && Number(inputTransferAmount.value) > 0 && currentAccount.balance > Number(inputTransferAmount.value)) {
    transferTo.movements.push(Number(inputTransferAmount.value));
    currentAccount.movements.push(Number(-inputTransferAmount.value));

    currentAccount.movementsDates.push(new Date().toISOString());
    transferTo.movementsDates.push(new Date().toISOString());
    updateUI();

    inputTransferTo.value = inputTransferAmount.value = '';

    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function(e) {
  e.preventDefault();
  const loanAmount = Number(inputLoanAmount.value);
  if (loanAmount > 0 && currentAccount.movements.some(mov => mov > loanAmount )) {
    currentAccount.movements.push(loanAmount);
    currentAccount.movementsDates.push(new Date().toISOString());
    inputLoanAmount.blur();
    updateUI();

    clearInterval(timer);
    timer = startLogOutTimer();
  }
  inputLoanAmount.value = '';
})

btnClose.addEventListener('click', function(e) {
  e.preventDefault();
  const closeUser = inputCloseUsername.value;
  const closePin = Number(inputClosePin.value);
  const closeAccount = accounts.findIndex(acc => acc?.username === inputCloseUsername.value);
  if (closePin === currentAccount?.pin && currentAccount?.username === closeUser) {
accounts.splice(closeAccount, 1);
containerApp.style.opacity = 0;
labelWelcome.textContent = 'Log in to get started';
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function(e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/*
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

///////////////////////////////////////////////////////////////
// Functions

const displayMovements = function (account, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(account.movementsDates[i]);
    const day = `${date.getDate()}`.padStart(2, 0);
    const month = `${date.getMonth()}`.padStart(2, 0);
    const year = date.getFullYear();
    const weekday = date.getDay();
    const displayDate = `${day}/${month}/${year}`;

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${mov.toFixed(2)}€</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${+acc.balance.toFixed(2)}€`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${+Math.abs(out).toFixed(2)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${+interest.toFixed(2)}€`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  let time = 120;
  const tick = function () {
    let min = `${Math.trunc(time / 60)}`.padStart(2, 0);
    let sec = `${time % 60}`.padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    time--;
  };
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;
btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    clearInterval(timer);
    timer = startLogOutTimer();

    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());

    clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

const currDate = new Date();
const day = `${currDate.getDate()}`.padStart(2, 0);
const month = `${currDate.getMonth() + 1}`.padStart(2, 0);
const year = currDate.getFullYear();
const hours = currDate.getHours();
const min = currDate.getMinutes();
labelDate.textContent = `${day}/${month}/${year} ${hours}:${min}`;
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
console.log(Number.parseInt('23b', 10));
console.log(parseInt('23b'));
console.log(parseFloat('2.3b'));

console.log(Number.isNaN(23));
console.log(Number.isNaN('23b'));
console.log(Number.isNaN('23px'));
console.log(Number.isNaN(23 / 0));

console.log(Number.isFinite(23));
console.log(Number.isFinite(23.5));
console.log(Number.isFinite('23b'));

// MATH AND ROUNDING
console.log(Math.sqrt(144));
// square root
console.log(144 ** (1 / 2));
// cube root
console.log(144 ** (1 / 3));

console.log(Math.max(12, 3, 61, 89, 2));
console.log(Math.min(12, 3, 61, 89, 2));

// This will give us a random number b/w a range
const randomInt = (min, max) => {
  return Math.trunc(Math.random() * (max - min) + 1) + min;
};
console.log(randomInt(12, 24));

// ROUNDING
console.log(Math.round(23.3));
console.log(Math.round(23.9));
// ROUNDING UP
console.log(Math.ceil(23.9));
console.log(Math.ceil(23.9));
// ROUNDING DOWN
console.log(Math.floor(23.9));
console.log(Math.floor(23.9));
// REMOVE DECIMALS
console.log(Math.trunc(23.33));
// WITH NEGATIVE DECIMALS
console.log(Math.trunc(-23.33));
console.log(Math.floor(-23.33));

// REMAINDER OPERATOR
const checkNumber = function (number) {
  if (number % 2 == 0) console.log(`${number} is an Even number`);
  else console.log(`${number} is an Odd number`);
};
checkNumber(37);
checkNumber(78);
checkNumber(99);

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 == 0) row.style.backgroundColor = 'orangered';
  });
});

// DATES
/*
const now = new Date();
console.log(now);

console.log(new Date('April 23, 1999 02:20:12'));

console.log(new Date(account1.movementsDates[0]));
console.log(new Date(1999, 3, 23, 2, 20, 12)); // Months are ZERO based

// UNIX TIME
console.log(new Date(0));
console.log(new Date(3 * 24 * 60 * 60 * 1000));
*/
// DATE METHODS
/*
const future = new Date(2025, 11, 20, 16, 20);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate()); // Day of the month
console.log(future.getDay()); // Day of the week
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString());
console.log(future.getTime()); // will give us the days passed since unix, in ms-1

console.log(new Date('2025-12-20T11:20:00.000Z'));
console.log(Date.now()); // current Date in ms-1

future.setFullYear(2030);
console.log(future);

// SET TIMEOUT
// console.log(`The pizza will arrive in 5 seconds`);
// setTimeout(function () {
//   console.log(`The pizza has arrived`);
// }, 5000);
// let time = 5;
// setInterval(() => {
//   if (time <= 5 && time >= 0) {
//     console.log(`The pizza will arrive in ${time}`);
//     time--;
//     if (time === 1) console.log('The pizza has arrived');
//     clearInterval();
//   }
// }, 1000);
*/
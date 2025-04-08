// Select DOM elements
const numberButtons = document.querySelectorAll("button[data-number]");
const operatorButtons = document.querySelectorAll("button[data-operator]");
const calculatorText = document.querySelector("h1");
const historyText = document.querySelector(".history-text");
const backSpace = document.getElementById("backspace");
const resetBtn = document.getElementById("reset");
const resetCurrentInput = document.getElementById("resetCurrentInput");
const executeButton = document.getElementById("execute");
const historyDiv = document.querySelector(".history");
const percentageButton = document.getElementById("percentage");
const trashIcon = document.querySelector(".fa-trash");
const historyIcon = document.getElementById("historyIcon");
const slidingHistory = document.getElementById("slidingHistory");
const closeHistory = document.getElementById("closeHistory");
const slidingHistoryContent = document.querySelector(
  ".sliding-history-content"
);

// Initialize calculator state
let currentInput = "";
let history = "";
let operatorClicked = false;
let lastOperator = "";
let isEditing = false;

// Helper function to safely evaluate expressions
function evaluateExpression(expression) {
  try {
    const result = new Function(`return ${expression}`)();
    if (isNaN(result) || result === Infinity || result === -Infinity) {
      throw new Error("Invalid calculation");
    }
    return result;
  } catch (error) {
    return "Error";
  }
}

// Helper function to update the display
function updateDisplay() {
  calculatorText.innerHTML = currentInput || "0";
  historyText.innerHTML = history.replaceAll("/", "÷");
}

// Helper function to reset the calculator
function resetCalculator() {
  currentInput = "";
  history = "";
  operatorClicked = false;
  lastOperator = "";
  isEditing = false;
  updateDisplay();
}

// Helper function to format the result
function formatResult(result) {
  return Number.isInteger(result) ? result : parseFloat(result).toFixed(2);
}

// Add a new history entry
function addHistoryEntry(expression, result) {
  const historyEntry = document.createElement("div");
  historyEntry.className = "history-text-container";
  historyEntry.innerHTML = `
    <h3 class="history-span">${expression} = ${result}</h3>
    <div>
      <i class="fa-solid fa-pen-to-square" style="margin-right: 10px"></i>
      <i class="fa-solid fa-trash"></i>
    </div>
  `;
  const firstHistoryEntry = historyDiv.querySelector(".history-text-container");
  if (firstHistoryEntry) {
    historyDiv.insertBefore(historyEntry, firstHistoryEntry);
  } else {
    historyDiv.appendChild(historyEntry);
  }
}

// Synchronize sliding history with main history
function syncSlidingHistory() {
  slidingHistoryContent.innerHTML = historyDiv.innerHTML;
}

// Handle number button clicks
numberButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.getAttribute("data-number");

    if (value === "." && currentInput.includes(".")) return; // Prevent multiple decimals
    if (value === "." && currentInput === "") currentInput = "0.";
    else if (isEditing) {
      currentInput = value;
      isEditing = false;
    } else {
      currentInput += value;
    }

    updateDisplay();
  });
});

// Handle operator button clicks
operatorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const operator = button.getAttribute("data-operator");

    if (currentInput !== "") {
      if (history !== "") {
        if (lastOperator === "/" && currentInput === "0") {
          handleDivisionByZero();
          return;
        }

        const result = evaluateExpression(history + currentInput);
        if (result === "Error") {
          calculatorText.innerHTML = "Error";
          setTimeout(resetCalculator, 1000);
          return;
        }

        addHistoryEntry(`${history}${currentInput}`, formatResult(result));
        history = `${result} ${operator} `;
        currentInput = "";
      } else {
        history = `${currentInput} ${operator} `;
        currentInput = "";
      }
    } else if (history !== "") {
      history = history.slice(0, -2) + ` ${operator} `;
    }

    operatorClicked = true;
    lastOperator = operator;
    updateDisplay();
  });
});

// Handle backspace button click
backSpace.addEventListener("click", () => {
  currentInput = currentInput.slice(0, -1);
  updateDisplay();
});

// Handle reset button click
resetBtn.addEventListener("click", resetCalculator);

// Handle reset current input button click
resetCurrentInput.addEventListener("click", () => {
  currentInput = "";
  updateDisplay();
});

// Handle execute (equals) button click
executeButton.addEventListener("click", () => {
  if (currentInput !== "" && history !== "") {
    if (lastOperator === "/" && currentInput === "0") {
      handleDivisionByZero();
      return;
    }

    const result = evaluateExpression(history + currentInput);
    if (result === "Error") {
      calculatorText.innerHTML = "Error";
      setTimeout(resetCalculator, 1000);
      return;
    }

    addHistoryEntry(`${history}${currentInput}`, formatResult(result));
    history = "";
    currentInput = result.toString();
    updateDisplay();
  }
});

// Handle percentage button click
percentageButton.addEventListener("click", () => {
  if (currentInput !== "" && history !== "") {
    const baseValue = parseFloat(history.split(" ")[0]);
    currentInput = ((baseValue * parseFloat(currentInput)) / 100).toString();
    updateDisplay();
  }
});

// Clear all history
trashIcon.addEventListener("click", () => {
  historyDiv.innerHTML = "";
  syncSlidingHistory();
});

// Handle history icon click (show sliding history)
historyIcon.addEventListener("click", () => {
  slidingHistory.style.transform = "translateY(0)";
  slidingHistory.style.display = "block";
  syncSlidingHistory();
});

// Handle close sliding history
closeHistory.addEventListener("click", () => {
  slidingHistory.style.transform = "translateY(100%)";
  setTimeout(() => {
    slidingHistory.style.display = "none";
  }, 300);
});

// Handle history actions (edit and delete) in sliding history
slidingHistoryContent.addEventListener("click", (event) => {
  if (event.target.classList.contains("fa-pen-to-square")) {
    const historyItem = event.target.closest(".history-text-container");
    if (historyItem) editHistory(historyItem);
  }

  if (event.target.classList.contains("fa-trash")) {
    const historyItem = event.target.closest(".history-text-container");
    if (historyItem) historyItem.remove();
    syncSlidingHistory();
  }
});

// Edit history entry
function editHistory(historyItem) {
  const historyText = historyItem.querySelector(".history-span").textContent;
  const equalSignIndex = historyText.lastIndexOf("=");
  const expression = historyText.slice(0, equalSignIndex).trim();
  const result = historyText.slice(equalSignIndex + 1).trim();

  currentInput = result;
  history = expression;
  isEditing = true;
  updateDisplay();
}

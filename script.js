
const displayEl = document.getElementById('result');
const historyEl = document.getElementById('history');
let currentInput = '0';
let shouldResetDisplay = false;

function updateDisplay() {
    displayEl.textContent = currentInput;
}

function clearDisplay() {
    currentInput = '0';
    shouldResetDisplay = false;
    updateDisplay();
    historyEl.textContent = '';
}

function deleteLast() {
    if (shouldResetDisplay) { clearDisplay(); return; }
    if (currentInput.length > 1) currentInput = currentInput.slice(0, -1);
    else currentInput = '0';
    updateDisplay();
}

function appendToDisplay(value) {
    if (value === '%') { handlePercent(); return; }
    if (shouldResetDisplay && /[0-9.]/.test(value)) {
        currentInput = '0';
        shouldResetDisplay = false;
    } else if (shouldResetDisplay && /[+\-*/]/.test(value)) shouldResetDisplay = false;

    const lastChar = currentInput.slice(-1);
    if (['+', '-', '*', '/'].includes(value)) {
        if (['+', '-', '*', '/', '.'].includes(lastChar)) currentInput = currentInput.slice(0, -1) + value;
        else currentInput += value;
        updateDisplay(); return;
    }

    if (value === '.') {
        const parts = currentInput.split(/[+\-*/]/);
        const curNum = parts[parts.length - 1];
        if (!curNum.includes('.')) currentInput += '.';
        updateDisplay(); return;
    }

    if (/^[0-9]$/.test(value)) {
        if (currentInput === '0') currentInput = value;
        else currentInput += value;
        updateDisplay(); return;
    }
}

function handlePercent() {
    const re = /([0-9]*\.?[0-9]+)$/;
    const match = re.exec(currentInput);
    if (!match) return;
    const numStr = match[1];
    const index = match.index;
    const num = parseFloat(numStr);
    if (isNaN(num)) return;
    let percentValue = num / 100;
    if (percentValue % 1 !== 0) percentValue = parseFloat(percentValue.toFixed(10));
    currentInput = currentInput.slice(0, index) + percentValue.toString();
    shouldResetDisplay = false;
    updateDisplay();
}

function calculateResult() {
    try {
        let expression = currentInput.replace(/×/g, '*').replace(/÷/g, '/');
        if (!/^[0-9+\-*/. ]+$/.test(expression)) throw new Error('Invalid');
        let result = eval(expression);
        if (!isFinite(result)) throw new Error('Invalid');
        currentInput = (result % 1 === 0) ? result.toString() : parseFloat(result.toFixed(10)).toString();
        historyEl.textContent = expression + ' =';
        shouldResetDisplay = true;
        updateDisplay();
    } catch {
        currentInput = 'Error';
        shouldResetDisplay = true;
        updateDisplay();
    }
}

// Keyboard support
document.addEventListener('keydown', e => {
    const k = e.key;
    if (k >= '0' && k <= '9') appendToDisplay(k);
    else if (k === '.') appendToDisplay('.');
    else if (['+', '-', '*', '/'].includes(k)) { e.preventDefault(); appendToDisplay(k); }
    else if (k === '%') { e.preventDefault(); handlePercent(); }
    else if (k === 'Enter' || k === '=') { e.preventDefault(); calculateResult(); }
    else if (k === 'Escape' || k.toLowerCase() === 'c') clearDisplay();
    else if (k === 'Backspace') { e.preventDefault(); deleteLast(); }
});

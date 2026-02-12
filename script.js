const output = document.getElementById('output');
const input = document.getElementById('input');
const visibleInput = document.getElementById('visible-input');
const cursor = document.getElementById('cursor');
const suggestionsDiv = document.getElementById('suggestions');
const nedryDiv = document.getElementById('nedry');
const audio = document.getElementById('laughAudio');

let failCount = 0;
const maxFailsBeforeMagic = 3;

const predictions = [
    "access security",
    "access security grid",
    "access main security grid"
];

const otherCommands = {
    "help": () => {
        return "Available commands:\n" +
               "  m / menu          - Show options\n" +
               "  access security\n" +
               "  access security grid\n" +
               "  access main security grid\n" +
               "  access cameras\n" +
               "  access lights\n" +
               "  access emergency power\n" +
               "  help";
    },
    "m": showMenu,
    "menu": showMenu,
    // Menu number shortcuts
    "1": () => handleAccessDenial("Access Security Grid"),
    "2": () => handleAccessDenial("Access Main Program"),
    "3": () => handleAccessDenial("View Cameras"),
    "4": () => handleAccessDenial("Control Lights"),
    "5": () => "Emergency Power: ACTIVE",
    "6": () => handleAccessDenial("System Status"),
    // Full command equivalents
    "access cameras": () => handleAccessDenial("Cameras"),
    "access lights": () => handleAccessDenial("Lights"),
    "access emergency power": () => "Emergency Power: ACTIVE",
    "access security": () => handleAccessDenial("Security"),
    "access security grid": () => handleAccessDenial("Security Grid"),
    "access main security grid": () => handleAccessDenial("Main Security Grid")
};

function showMenu() {
    return '<span class="menu">MENU OPTIONS:</span>\n' +
           '  1. Access Security Grid\n' +
           '  2. Access Main Program\n' +
           '  3. View Cameras\n' +
           '  4. Control Lights\n' +
           '  5. Emergency Power Override\n' +
           '  6. System Status\n' +
           '  7. Help\n' +
           'Type number or full command...';
}

function handleAccessDenial(label = "") {
    const msg = label ? `${label}: ACCESS DENIED` : "access: PERMISSION DENIED";
    addLine(`<span class="denied">${msg}</span>`);
    failCount++;

    if (failCount >= maxFailsBeforeMagic) {
        nedryDiv.style.display = 'block';
        audio.currentTime = 0;
        audio.play().catch(() => {});

        const interval = setInterval(() => {
            addLine('<span class="denied">access: PERMISSION DENIED ....and....YOU DIDN\'T SAY THE MAGIC WORD!</span>');
        }, 1500);

        input.disabled = true;
        cursor.style.display = 'none';
    }
}

function addLine(text) {
    output.innerHTML += text + '\n';
    output.scrollTop = output.scrollHeight;
}

function handleCommand(cmd) {
    cmd = cmd.trim().toLowerCase();

    addLine('> ' + cmd);

    if (otherCommands[cmd]) {
        const result = otherCommands[cmd]();
        if (typeof result === 'string') {
            addLine(result);
        }
        return;
    }

    // Catch-all for any other access command
    if (cmd.startsWith("access ")) {
        handleAccessDenial(cmd.replace("access ", "").trim());
    } else {
        addLine("Command not recognized. Try 'm' for menu or 'help'.");
    }
}

function updateCursorPosition() {
    const text = visibleInput.textContent;
    const charWidth = 10; // tweak if cursor misalignment occurs
    const leftOffset = text.length * charWidth;
    cursor.style.left = leftOffset + 'px';
}

input.addEventListener('input', () => {
    visibleInput.textContent = input.value;
    updateCursorPosition();

    const val = input.value.toLowerCase();
    suggestionsDiv.innerHTML = '';
    suggestionsDiv.style.display = 'none';

    if (val.startsWith('a')) {
        suggestionsDiv.style.display = 'block';
        predictions.forEach(pred => {
            if (pred.startsWith(val)) {
                const div = document.createElement('div');
                div.className = 'suggestion';
                div.textContent = pred;
                div.onclick = () => {
                    input.value = pred;
                    visibleInput.textContent = pred;
                    updateCursorPosition();
                    suggestionsDiv.style.display = 'none';
                    input.focus();
                };
                suggestionsDiv.appendChild(div);
            }
        });
    }
});

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = input.value;
        if (cmd.trim()) {
            handleCommand(cmd);
        }
        input.value = '';
        visibleInput.textContent = '';
        updateCursorPosition();
        suggestionsDiv.style.display = 'none';
    }
});

document.addEventListener('click', () => input.focus());

// Initial setup
updateCursorPosition();
window.addEventListener('resize', updateCursorPosition);
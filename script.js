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
    "access cameras": () => "Cameras: ACCESS DENIED",
    "access lights": () => "Lights: ACCESS DENIED",
    "access emergency power": () => "Emergency Power: ACCESS DENIED"
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

function addLine(text) {
    output.innerHTML += text + '\n';
    output.scrollTop = output.scrollHeight;
}

function handleCommand(cmd) {
    cmd = cmd.trim().toLowerCase();

    addLine('> ' + cmd);

    if (otherCommands[cmd]) {
        addLine(otherCommands[cmd]());
        return;
    }

    if (cmd.startsWith("access ")) {
        addLine('<span class="denied">access: PERMISSION DENIED</span>');
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
    } else {
        addLine("Command not recognized. Try 'm' for menu or 'help'.");
    }
}

function updateCursorPosition() {
    const text = visibleInput.textContent;
    // Approximate width per character (monospace font, adjust if needed)
    const charWidth = 10; // pixels — tune this based on your font-size (18px Courier ≈ 9-11px per char)
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

// Initial position
updateCursorPosition();

// Optional: update cursor on window resize or font change (rare)
window.addEventListener('resize', updateCursorPosition);
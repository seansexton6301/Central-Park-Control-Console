const output = document.getElementById('output');
const input = document.getElementById('input');
const visibleInput = document.getElementById('visible-input');
const cursor = document.getElementById('cursor');
const suggestionsDiv = document.getElementById('suggestions');
const nedryDiv = document.getElementById('nedry');
const audio = document.getElementById('laughAudio');

let failCount = 0;
const maxFailsBeforeMagic = 3;

const predictions = {
    'a': [
        "access security",
        "access security grid",
        "access main security grid"
    ],
    'v': ["view cameras"],
    'c': ["control lights"],
    'e': ["emergency power override"],
    's': ["system status"],
    'h': ["help"]
};

const validCommands = {
    "help": () => {
        return "Available commands (full phrases only):\n" +
               "  m / menu                          - Show menu options\n" +
               "  access security grid              - Security Grid\n" +
               "  access main program               - Main Program\n" +
               "  view cameras                      - View Cameras\n" +
               "  control lights                    - Control Lights\n" +
               "  emergency power override          - Emergency Power Override\n" +
               "  system status                     - System Status\n" +
               "  help                              - This list\n" +
               "\nType the full phrase exactly as shown.";
    },
    "m": showMenu,
    "menu": showMenu,
    // Only full phrases are valid
    "access security grid": () => handleAccessDenial("Access Security Grid"),
    "access main program": () => handleAccessDenial("Access Main Program"),
    "view cameras": () => handleAccessDenial("View Cameras"),
    "control lights": () => handleAccessDenial("Control Lights"),
    "emergency power override": () => "Emergency Power: ACTIVE",
    "system status": () => handleAccessDenial("System Status"),
    // Also allow some common variants
    "access cameras": () => handleAccessDenial("Cameras"),
    "access lights": () => handleAccessDenial("Lights"),
    "access emergency power": () => "Emergency Power: ACTIVE",
    "access security": () => handleAccessDenial("Security"),
    "access security grid": () => handleAccessDenial("Security Grid"),
    "access main security grid": () => handleAccessDenial("Main Security Grid")
};

function showMenu() {
    return '<span class="menu">MENU OPTIONS (type full command):</span>\n' +
           '  Access Security Grid     → access security grid\n' +
           '  Access Main Program      → access main program\n' +
           '  View Cameras             → view cameras\n' +
           '  Control Lights           → control lights\n' +
           '  Emergency Power Override → emergency power override\n' +
           '  System Status            → system status\n' +
           '  Help                     → help\n' +
           '\nNumbers are not accepted. Type the full phrase.';
}

function handleAccessDenial(label = "") {
    const msg = label ? `${label}: ACCESS DENIED` : "access: PERMISSION DENIED";
    addLine(`<span class="denied">${msg}</span>`);
    failCount++;

    if (failCount >= maxFailsBeforeMagic) {
        nedryDiv.style.display = 'block';
        audio.currentTime = 0;
        audio.play().catch(() => {});

        // Scroll to bottom after small delay so GIF is visible
        setTimeout(() => {
            const wrapper = document.querySelector('.content-wrapper');
            wrapper.scrollTop = wrapper.scrollHeight;
        }, 150);

        // Optional: smoother focused scroll to Nedry
        // setTimeout(() => {
        //     nedryDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
        // }, 200);

        const interval = setInterval(() => {
            addLine('<span class="denied">access: PERMISSION DENIED ....and....YOU DIDN\'T SAY THE MAGIC WORD!</span>');
        }, 1500);

        input.disabled = true;
        cursor.style.display = 'none';
    }
}

function addLine(text) {
    output.innerHTML += text + '\n';
    // Always keep scrolled to bottom (good terminal behavior)
    const wrapper = document.querySelector('.content-wrapper');
    wrapper.scrollTop = wrapper.scrollHeight;
}

function handleCommand(cmd) {
    cmd = cmd.trim().toLowerCase();

    addLine('> ' + cmd);

    if (validCommands[cmd]) {
        const result = validCommands[cmd]();
        if (typeof result === 'string') {
            addLine(result);
        }
        return;
    }

    // Catch other access attempts
    if (cmd.startsWith("access ")) {
        handleAccessDenial(cmd.replace("access ", "").trim());
    } else {
        addLine("Command not recognized. Type 'm' for menu or 'help' for commands.");
    }
}

function updateCursorPosition() {
    const text = visibleInput.textContent || '';
    const charWidth = 10; // approximate monospaced char width in pixels
    const leftOffset = text.length * charWidth;
    cursor.style.left = leftOffset + 'px';
}

input.addEventListener('input', () => {
    visibleInput.textContent = input.value;
    updateCursorPosition();

    const val = input.value.trim().toLowerCase();
    suggestionsDiv.innerHTML = '';
    suggestionsDiv.style.display = 'none';

    if (val.length === 0) return;

    const firstChar = val[0];

    if (predictions[firstChar]) {
        suggestionsDiv.style.display = 'block';
        predictions[firstChar].forEach(pred => {
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
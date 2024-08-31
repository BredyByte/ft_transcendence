export default class DualControl {
    constructor(execCommands) {
        this.execCommands = execCommands;
        this.keysPressed = {};
        this.paddle1Interval = null;
        this.paddle2Interval = null;
    }

    init() {
        this.initEventListeners();
    }

    initEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keysPressed[e.key] = true;
            this.handleKeyPresses();
        });
        document.addEventListener('keyup', (e) => {
            this.keysPressed[e.key] = false;
            this.handleKeyPresses();
        });
    }

    handleKeyPresses() {
        if (this.keysPressed[' ']) {
            this.execCommands('player_1_ready');
        }
        if (this.keysPressed['Enter']) {
            this.execCommands('player_2_ready');
        }
        if (this.keysPressed['q']) {
            this.execCommands('quit');
        }
        if (this.keysPressed['t']) {
            this.execCommands('change_theme');
        }

        if (this.keysPressed['w'] && !this.keysPressed['s']) {
            if (!this.paddle1Interval) {
                clearInterval(this.paddle1Interval);
                this.paddle1Interval = setInterval(() => {
                    this.execCommands('player_1_up');
                }, 10);
            }
        } else if (this.keysPressed['s'] && !this.keysPressed['w']) {
            if (!this.paddle1Interval) {
                clearInterval(this.paddle1Interval);
                this.paddle1Interval = setInterval(() => {
                    this.execCommands('player_1_down');
                }, 10);
            }
        } else {
            clearInterval(this.paddle1Interval);
            this.paddle1Interval = null;
        }

        if (this.keysPressed['ArrowUp'] && !this.keysPressed['ArrowDown']) {
            if (!this.paddle2Interval) {
                clearInterval(this.paddle2Interval);
                this.paddle2Interval = setInterval(() => {
                    this.execCommands('player_2_up');
                }, 10);
            }
        } else if (this.keysPressed['ArrowDown'] && !this.keysPressed['ArrowUp']) {
            if (!this.paddle2Interval) {
                clearInterval(this.paddle2Interval);
                this.paddle2Interval = setInterval(() => {
                    this.execCommands('player_2_down');
                }, 10);
            }
        } else {
            clearInterval(this.paddle2Interval);
            this.paddle2Interval = null;
        }
    }
}

class Stopwatch{

    constructor(secondsObserver,
                buttons,
                aWindow

    ) {
        this._window = aWindow;
        this._startButton = buttons.startButton;
        this._stopButton = buttons.stopButton;
        this._resetButton = buttons.resetButton;

        // seconds observers must implement two functions
        // IncrementSeconds(), and ResetSeconds();
        this._secondsObserver = secondsObserver;
        this._SetupButtons();

        this._interval = null;
    }

    _SetupButtons() {

        this._startButton.onclick = () => {
            this.Start();
        };

        this._stopButton.onclick = () => {
            this.Stop();
        };

        this._resetButton.onclick = () => {
            this.Reset();
        };
        this._MakeThoseButtonsEnabled([this._startButton]);
    }

    _IncrementInterval()
    {
        this._secondsObserver.IncrementSeconds();
    }

    // input is an array of buttons
    _MakeThoseButtonsEnabled(buttons)
    {
        this._startButton.disabled = true;
        this._stopButton.disabled = true;
        this._resetButton.disabled = true;
        for(const button of buttons)
        {
            button.disabled = false;
        }
    }

    Start(){
        this._interval = this._window.setInterval(()=>{this._IncrementInterval();}, 1000);
        this._MakeThoseButtonsEnabled([this._stopButton, this._resetButton]);
    }
    Stop(){
        clearInterval(this._interval);
        this._MakeThoseButtonsEnabled([this._startButton, this._resetButton]);
    }
    Reset(){
        clearInterval(this._interval);
        this._secondsObserver.ResetSeconds();
        this._MakeThoseButtonsEnabled([this._startButton, this._resetButton]);
    }
}
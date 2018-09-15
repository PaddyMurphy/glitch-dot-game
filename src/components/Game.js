/*
Dot Game - The goal of this exercise is to create a game.
In the game, dots move from the top to the bottom
of the screen. A player tries to click on the dots,
and receives points when they are successful.

- start button turns to pause
- dots fall at ajustable rate of 10-100 pixels
- new dot every second randomly at top (always whole)
- dots random size of 10-100 pixels
- points 1-10 (largest to smallest)
- clicking dot removes it and scores
*/
import React, {PureComponent} from 'react';
import '../app.css';

// game vars
let canvas, ctx;
let dotId = 1;
let dotCount = 1;
let dotList = [];
let velocity = 10;
let minVelocity = 10;
let maxVelocity = 100;
let minWidth = 5; // radius
let maxWidth = 50;
let scoreScale = [];

function Dot(dotId, width, y, x, color, status, points) {
  this.dotId = dotId;
  this.width = width;
  this.y = y;
  this.x = x;
  this.velocity = velocity; // velocity is constant
  this.color = color;
  this.status = status;
  this.points = points;
}

const Button = props => {
  return (
    <button className="app-btn" onClick={props.onClick}>
      {props.text}
    </button>
  );
};

const Range = props => {
  return (
    <div className="app-slider">
      <input
        type="range"
        className="app-slider-input"
        name="app-slider"
        min={minVelocity}
        max={maxVelocity}
        defaultValue={velocity}
        step="1"
        {...props}
      />
    </div>
  );
};

class Game extends PureComponent {
  constructor(props) {
    super(props);

    this.clickDot = this.clickDot.bind(this);
    this.toggleGame = this.toggleGame.bind(this);
    this.runGame = this.runGame.bind(this);

    this.state = {
      score: 0,
      started: false,
      paused: false,
    };
  }

  componentDidMount() {
    this.initializeCanvas();
    this.runGame();
  }

  componentWillUnmount() {
    canvas.removeEventListener('click', this.clickDot, false);
  }

  getRandomIntInclusive(min, max) {
    // max and minimum is inclusive
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  drawDot() {
    dotList.forEach(dot => {
      if (dot.status === 1) {
        dotCount = dotCount++;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.width, 0, Math.PI * 2);
        ctx.fillStyle = dot.color;
        ctx.fill();
        ctx.closePath();
      }
    });
  }

  normalizeRange(val, min, max) {
    // return inverse value (i.e. larger dot = smaller value)
    // normalize scale 1-10
    const delta = max - min;
    let value = Math.round(((val - min) / delta) * 2);
    value = value > 10 ? 10 : value; // some rounding goes to 11
    // map value to points
    const normalized = scoreScale.find(scale => scale.points === value);

    return normalized.actual;
  }

  addDot() {
    // only add dots when game is running
    if (this.state.paused || !this.state.started) return;

    const dotWidth = this.getRandomIntInclusive(minWidth, maxWidth);
    const dotY = dotWidth; // start off canvas
    const dotX = this.getRandomIntInclusive(1, canvas.width);
    const color = '#1D85F0';
    const status = 1; // 1=show, 0=remove
    const points = this.normalizeRange(dotWidth, 1, 10);
    // add random properties
    dotList[dotId++] = new Dot(
      dotId,
      dotWidth,
      dotY,
      dotX,
      color,
      status,
      points,
    );
  }

  initializeCanvas() {
    canvas = document.getElementById('game');
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    ctx = canvas.getContext('2d');
    // events
    canvas.addEventListener('click', this.clickDot, false);
    // set score scale
    for (let i = 1, len = 11; i < len; i++) {
      scoreScale.push({points: i, actual: len - i});
    }
  }

  sliderChange(e) {
    velocity = e.target.valueAsNumber;
  }

  clickDot(e) {
    const pos = {
      x: e.clientX,
      y: e.clientY,
    };

    // remove empty
    dotList = dotList.filter(dot => {
      return dot;
    });

    dotList.forEach((dot, i) => {
      if (this.isDotClicked(pos, dot)) {
        // TODO: allow only one click if touching
        // assign separate colors to dots
        this.setState({score: this.state.score + dot.points});
        dot.status = 0;
      }
    });
  }

  isDotClicked(pos, dot) {
    return (
      Math.sqrt((pos.x - dot.x) ** 2 + (pos.y - dot.y) ** 2) < dot.width * 1.1
    );
  }

  collisionDetection() {
    for (let i = dotList.length; i >= 0; i--) {
      if (dotList[i]) {
        // prevent right edge cutting off
        if (dotList[i].x > canvas.width - dotList[i].width) {
          dotList[i].x = dotList[i].x - dotList[i].width;
        }
        // prevent left edge cutting off
        if (dotList[i].x <= dotList[i].width) {
          dotList[i].x = dotList[i].width;
        }
        // remove after reaching past bottom
        if (dotList[i].y - dotList[i].width >= canvas.height) {
          dotList.splice(i, 1);
        }
      }
    }
  }

  toggleGame(event) {
    if (!this.state.started) {
      this.setState({started: true});
    } else {
      this.setState({paused: !this.state.paused});
    }
  }

  runGame() {
    const that = this;

    // Draw loop
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      that.drawDot();
      that.collisionDetection();

      // for (var i = 10; i > 5; i--) { alert(i); }
      // set new dot position
      for (let i = dotList.length; i >= 0; i--) {
        if (dotList[i] && !that.state.paused && that.state.started) {
          // normalize velocity for correct timing
          dotList[i].y = Math.round(dotList[i].y) + velocity / 10;
        }
      }
      // loop draw
      window.requestAnimationFrame(draw);
    }
    // add a new dot every second
    window.setInterval(() => {
      this.addDot();
    }, 1000);

    // init
    draw();
  }

  render() {
    const {score, started, paused} = this.state;
    const btnText = !started || paused ? 'START' : 'PAUSE';

    console.log(dotList);

    return (
      <div className="app">
        <div className="app-menu">
          <b className="app-score">{score}</b>
          <Button onClick={this.toggleGame} text={btnText} />
          <Range onChange={this.sliderChange} />
        </div>
        <div className="app-game">
          <canvas id="game" />
        </div>
      </div>
    );
  }
}

export default Game;
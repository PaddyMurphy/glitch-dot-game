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

let canvas, ctx;
let dotId = 1;
let dotCount = 1;
let dotList = [];
let velocity = 10;
let minVelocity = 10;
let maxVelocity = 100;
let minWidth = 10;
let maxWidth = 30;
let started = false;
let paused = false;
let score = 0;
let btnText = !paused ? 'START' : 'PAUSED';

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
    <button className="app-btn" {...props}>
      {btnText}
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

    this.state = {};
  }

  componentDidMount() {
    this.initializeCanvas();
    this.runGame();
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
        dotCount++;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.width, 0, Math.PI * 2);
        ctx.fillStyle = dot.color;
        ctx.fill();
        ctx.closePath();
      }
    });
  }

  normalizeRange(val, min, max) {
    // TODO: return inverse value (i.e. 7 = 3)
    const delta = max - min;
    return Math.round((val - min) / delta);
  }

  addDot() {
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
    //const slider = document.getElementById('app-slider');
    canvas = document.getElementById('game');
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    ctx = canvas.getContext('2d');
    // events
    canvas.addEventListener('click', this.clickDot, false);
  }

  sliderChange(e) {
    velocity = e.target.valueAsNumber;
  }

  clickDot(e) {
    const pos = {
      x: e.clientX,
      y: e.clientY,
    };

    dotList.forEach((dot, i) => {
      if (this.isDotClicked(pos, dot)) {
        // TODO: allow only one click if touching
        score = score + dot.points;
        this.displayScore();
        dot.status = 0;
      }
    });
  }
  // update w/o state to prevent rerendering
  displayScore() {
    const scoreHtml = document.querySelector('.app-score');
    scoreHtml.innerHTML = score.toString();
  }

  displayBtnText() {
    const btn = document.querySelector('.app-btn');
    console.log(btnText);
    btn.value = btnText;
  }

  isDotClicked(pos, dot) {
    return (
      Math.sqrt((pos.x - dot.x) ** 2 + (pos.y - dot.y) ** 2) < dot.width * 1.1
    );
  }

  collisionDetection() {
    for (let i = 0, len = dotList.length; i < len; i++) {
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
    if (!started) {
      started = true;
    } else {
      paused = !paused;
    }
    this.displayBtnText();
  }

  runGame() {
    const that = this;

    // Draw loop
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // loop draw
      that.drawDot();
      that.collisionDetection();
      // set new dot position
      for (let i = 0, len = dotList.length; i < len; i++) {
        if (dotList[i] && !paused && started) {
          // TODO: normalize velocity for correct timing
          dotList[i].y = dotList[i].y = ~~dotList[i].y + velocity / 10;
        }
      }

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
    return (
      <React.Fragment>
        <div className="app-menu">
          <b className="app-score">0</b>
          <Button onClick={this.toggleGame} />
          <Range onChange={this.sliderChange} />
        </div>
        <div className="app-main">
          <div className="app-game">
            <canvas id="game" />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Game;

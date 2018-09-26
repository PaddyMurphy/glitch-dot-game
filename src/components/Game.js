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
import {
  Button,
  Checkbox,
  Dot,
  ExplodingParticle,
  normalizeRange,
  getRandomIntInclusive,
  GameInstructions,
} from './gameHelpers';
import '../app.css';

// game vars
let canvas, ctx, dotInterval;
let dotId = 1;
let dotCount = 1;
let dotList = [];
let velocity = 10; // pixels per sec
let minVelocity = 10;
let maxVelocity = 100;
let minWidth = 5; // radius
let maxWidth = 50;
let scoreScale = []; // mapped values for score and opacity
let particles = [];

const Range = props => {
  return (
    <div className="app-slider">
      <label className="sr-only" htmlFor="app-slider">
        Speed adjustment
      </label>
      <input
        type="range"
        className="app-slider-input"
        name="app-slider"
        id="app-slider"
        min={minVelocity}
        max={maxVelocity}
        defaultValue={velocity}
        step="1"
        onChange={props.onChange}
      />
    </div>
  );
};

class Game extends PureComponent {
  constructor(props) {
    super(props);

    this.clickDot = this.clickDot.bind(this);
    this.toggleGame = this.toggleGame.bind(this);
    this.toggleBrutal = this.toggleBrutal.bind(this);
    this.runGame = this.runGame.bind(this);

    this.state = {
      score: 0,
      started: false,
      paused: false,
      brutal: false,
    };
  }

  componentDidMount() {
    this.initializeCanvas();
    this.runGame();
  }

  componentWillUnmount() {
    canvas.removeEventListener('click', this.clickDot, false);
    clearInterval(dotInterval);
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
    // add a new dot every second
    dotInterval = window.setInterval(() => {
      this.checkFocus();
      this.addDot();
    }, 1000);
  }

  checkFocus() {
    const hasFocus = document.hasFocus() ? true : false;
    // pause if document loses focus
    if (!hasFocus && !this.state.paused) {
      this.setState({paused: true});
    }
  }

  drawDot() {
    const {paused, started} = this.state;

    dotList.forEach(dot => {
      if (dot.status === 1) {
        // get inverse value
        const inverse = scoreScale.find(scale => scale.points === dot.points);
        // set opacity based on score
        let opacity = Math.round(inverse.actual) * 0.1;
        opacity = opacity <= 0.1 ? 0.15 : opacity;

        dotCount = dotCount++;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.width, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(29, 133, 240, ${opacity})`;
        ctx.fill();
        ctx.closePath();
      }
    });

    // set new dot position
    for (let i = dotList.length; i >= 0; i--) {
      if (dotList[i] && !paused && started) {
        // normalize velocity for correct timing for 60fps
        const newVelocity = (velocity / 10) * 0.5;
        dotList[i].y = Math.round(dotList[i].y) + newVelocity;
      }
    }
  }

  addDot() {
    // only add dots when game is running
    if (this.state.paused || !this.state.started) return;

    const dotWidth = getRandomIntInclusive(minWidth, maxWidth);
    const dotY = -dotWidth; // start off canvas
    let dotX = getRandomIntInclusive(1, canvas.width);
    const status = 1;
    const points = normalizeRange(dotWidth, 1, 10, scoreScale);
    // prevent right edge cutting off
    if (dotX > canvas.width - dotWidth) {
      dotX = dotX - dotWidth;
    }
    // prevent left edge cutting off
    if (dotX <= dotWidth) {
      dotX = dotWidth;
    }

    // add random properties
    dotList[dotId++] = new Dot(
      dotId,
      dotWidth,
      dotY,
      dotX,
      status,
      points,
      velocity,
    );
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
      // check status to prevent multiple clicks
      if (this.isDotClicked(pos, dot) && dot.status) {
        // set score and remove
        this.addScore(dot.points);
        dot.status = 0;
        // set up popped animation
        this.setupParticles(dot, pos);
      }
    });
  }

  isDotClicked(pos, dot) {
    return (
      Math.sqrt((pos.x - dot.x) ** 2 + (pos.y - dot.y) ** 2) < dot.width * 1.1
    );
  }

  addScore(points) {
    this.setState(prevState => ({
      score: prevState.score + points,
    }));
  }

  subtractScore(points) {
    this.setState(prevState => ({
      score: prevState.score - points,
    }));
  }

  collisionDetection() {
    for (let i = dotList.length; i >= 0; i--) {
      if (dotList[i]) {
        // remove after reaching past bottom
        if (dotList[i].y - dotList[i].width >= canvas.height) {
          // brutal mode substracts from the score
          if (this.state.brutal && dotList[i].status === 1) {
            this.subtractScore(dotList[i].points);
          }
          dotList.splice(i, 1);
        }
      }
    }
  }

  toggleGame(event) {
    if (!this.state.started) {
      this.setState({started: true});
    } else {
      this.setState(prevState => ({paused: !prevState.paused}));
    }
  }

  toggleBrutal() {
    this.setState(prevState => ({brutal: !prevState.brutal}));
  }

  // popped animation
  setupParticles(dot, pos) {
    let reductionFactor = 17; //prevent too many particles
    let width = dot.width * 2;
    let height = width;
    let count = 0;

    // fill particles inside dot
    for (let localX = 0; localX < width; localX++) {
      for (let localY = 0; localY < height; localY++) {
        if (count % reductionFactor === 0) {
          this.createParticleAtPoint(pos.x, pos.y);
        }
        count++;
      }
    }
  }

  createParticleAtPoint(x, y, colorData) {
    let particle = new ExplodingParticle();
    particle.startX = x;
    particle.startY = y;
    particle.startTime = Date.now();

    particles.push(particle);
  }

  animateParticles() {
    // Draw all of our particles in their new location
    for (let i = 0; i < particles.length; i++) {
      particles[i].draw(ctx);

      // clean up if the last particle is done animating
      if (i === particles.length - 1) {
        let percent =
          (Date.now() - particles[i].startTime) /
          particles[i].animationDuration;

        if (percent > 1) {
          particles = [];
        }
      }
    }
  }

  runGame(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawDot();
    this.collisionDetection();
    this.animateParticles();
    // loop draw
    window.requestAnimationFrame(this.runGame);
  }

  render() {
    const {brutal, score, started, paused} = this.state;
    const btnText = !started || paused ? 'START' : 'PAUSE';

    return (
      <div className="app">
        <div className="app-menu">
          <div className="app-score-wrapper">
            <b className="app-score">{score}</b>
            <Button
              className="app-btn"
              onClick={this.toggleGame}
              text={btnText}
            />
          </div>
          <div className="app-tools">
            <Range onChange={this.sliderChange} />
            <Checkbox
              checked={brutal}
              className="app-brutal"
              id="brutal"
              label={`😬`}
              name="brutal"
              onChange={this.toggleBrutal}
              title="brutal mode substracts points if a dot reaches the end"
              value="true"
            />
          </div>
        </div>

        {!started && <GameInstructions />}

        <div className="app-game">
          {paused && <h2 className="app-message">PAUSED</h2>}
          <canvas id="game" />
        </div>
      </div>
    );
  }
}

export default Game;

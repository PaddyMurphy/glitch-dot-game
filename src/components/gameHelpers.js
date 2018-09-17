import React from 'react';
// Dot factory
export function Dot(dotId, width, y, x, status, points, velocity) {
  this.dotId = dotId;
  this.width = width;
  this.y = y;
  this.x = x;
  this.velocity = velocity; // velocity is constant
  this.status = status; // 1=show, 0=remove
  this.points = points;
}

// exploding particle factory
export function ExplodingParticle() {
  this.animationDuration = 1000;
  this.radius = 5 + Math.random() * 5;
  this.life = 30 + Math.random() * 10;
  this.remainingLife = this.life;
  this.speed = {
    x: -5 + Math.random() * 10,
    y: -5 + Math.random() * 10,
  };

  this.draw = ctx => {
    let p = this;

    if (this.remainingLife > 0 && this.radius > 0) {
      // draw at the current location
      ctx.beginPath();
      ctx.arc(p.startX, p.startY, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();

      // update postion & life
      p.remainingLife--;
      p.radius -= 0.25;
      p.startX += p.speed.x;
      p.startY += p.speed.y;
    }
  };
}

export function normalizeRange(val, min, max, scoreScale) {
  // return inverse value (i.e. larger dot = smaller value)
  // normalize scale 1-10
  const delta = max - min;
  let value = Math.round(((val - min) / delta) * 2);
  value = value > 10 ? 10 : value; // some rounding goes to 11
  // map value to points
  const normalized = scoreScale.find(scale => scale.points === value);

  return normalized.actual;
}

export function getRandomIntInclusive(min, max) {
  // max and minimum is inclusive
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const GameInstructions = props => {
  return (
    <div className="app-instructions">
      Get points by popping randomly sized dots as they drift down. Smaller dots
      are worth more points. Use the slider to adjust speed.
    </div>
  );
};

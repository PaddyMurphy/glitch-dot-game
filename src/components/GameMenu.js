import React from 'react';
import {Button, Checkbox, Range} from './gameHelpers';

const GameMenu = props => {
  return (
    <div className="app-menu">
      <div className="app-score-wrapper">
        <b className="app-score">{props.score}</b>
        <Button
          className="app-btn"
          onClick={props.toggleGame}
          text={props.btnText}
        />
      </div>
      <div className="app-tools">
        <Range
          className="app-slider-input"
          id="app-slider"
          label="Speed adjustment"
          min={props.minVelocity}
          max={props.maxVelocity}
          onChange={props.sliderChange}
          velocity={props.velocity}
        />
        <Checkbox
          checked={props.brutal}
          className="app-brutal"
          id="brutal"
          label={`😬`}
          name="brutal"
          onChange={props.toggleBrutal}
          title="brutal mode substracts points if a dot reaches the end"
          value="true"
        />
      </div>
    </div>
  );
};

export default GameMenu;

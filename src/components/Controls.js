/* Dot Game controls */
import React, {PureComponent} from 'react';

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

class Controls extends PureComponent {
  constructor(props) {
    super(props);

    this.toggleGame = this.toggleGame.bind(this);

    this.state = {
      score: 0,
      started: false,
      paused: false,
    };
  }

  componentDidMount() {}

  componentWillUnmount() {}

  sliderChange(e) {
    velocity = e.target.valueAsNumber;
  }

  toggleGame(event) {
    if (!this.state.started) {
      this.setState({started: true});
    } else {
      this.setState({paused: !this.state.paused});
    }
  }

  render() {
    const {score, started, paused} = this.state;
    const btnText = !started || paused ? 'START' : 'PAUSE';

    return (
      <div className="app-menu">
        <b className="app-score">{score}</b>
        <Button onClick={this.toggleGame} text={btnText} />
        <Range onChange={this.sliderChange} />
      </div>
    );
  }
}

export default Controls;

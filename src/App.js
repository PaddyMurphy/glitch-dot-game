import React, {Component} from 'react';
import Game from './components/Game';
import './app.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      started: false,
      paused: false,
    };
  }

  componentDidMount() {}

  render() {
    return (
      <div className="app">
        <Game />
      </div>
    );
  }
}

export default App;

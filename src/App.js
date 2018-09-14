import React, {Component} from 'react';
import Game from './components/Game';
import './app.css';

class App extends Component {
  render() {
    return (
      <div className="app">
        <Game />
      </div>
    );
  }
}

export default App;

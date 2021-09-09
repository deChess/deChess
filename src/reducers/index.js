const defaultState = {
  running: false,
  isTimeOver: false,
  increment: 0, // milliseconds
  currentClock: '',
  player1Time: 60000,
  player2Time: 60000,
};

const clockReducer = (state = defaultState, action) => {
  const clockState = Object.assign({}, state);
  if (action.type === 'SWITCH_CLOCK') {
    clockState[clockState.currentClock] += state.increment;
    clockState.currentClock = state.currentClock === 'player1Time' ? 'player2Time' : 'player1Time';
    clockState.running = true;
    return clockState;
  } else if (action.type === 'STOP_CLOCK') {
    if (clockState.running) {
      clockState.currentClock = state.currentClock === 'player1Time' ? 'player2Time' : 'player1Time';
    }
    clockState.running = false;
    return clockState;
  } else if (action.type === 'TIME_OVER') {
    clockState.running = false;
    clockState.isTimeOver = true;
    return clockState;
  } else if (action.type === 'SET_TIME') {
    clockState.isTimeOver = false;
    clockState.running = false;
    clockState.player1Time = action.time;
    clockState.player2Time = action.time;
    return clockState;
  } else if (action.type === 'CLOCK_TICK') {
    if (clockState.isTimeOver === false) {
      const playerTime = clockState[clockState.currentClock];
      clockState[clockState.currentClock] = playerTime - 10;
    }
    return clockState;
  }
  return state;
};

export default clockReducer;

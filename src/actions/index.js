let timeInterval = null;

const clockTick = () => ({
  type: 'CLOCK_TICK',
});

export const startClock = () => (dispatch) => {
  clearInterval(timeInterval);
  timeInterval = setInterval(() => dispatch(clockTick()), 10);
  dispatch({
    type: 'SWITCH_CLOCK',
  });
  dispatch(clockTick());
};

export const stopClock = () => {
  clearInterval(timeInterval);
  return {
    type: 'STOP_CLOCK',
  };
};

export const timeOver = () => {
  clearInterval(timeInterval);
  return {
    type: 'TIME_OVER',
  };
};

export const setTime = (time) => {
  clearInterval(timeInterval);
  return {
    type: 'SET_TIME',
    time,
  };
};


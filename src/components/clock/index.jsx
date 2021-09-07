import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { timeOver } from '../../actions';

const StyledClock = styled.div`
  position: relative;
  display: inline-block;
  width: 5em;
  margin: .5em;
  font-size: 36px;
  text-align: center;
  box-sizing: border-box;
  border: 1px solid black;
`;

export const parseTime = (msecs) => {
  const tenth = parseInt((msecs / 100) % 10, 10);
  let secs = parseInt((msecs / 1000) % 60, 10);
  let mins = parseInt((msecs / 60000) % 60, 10);
  let hours = parseInt((msecs / 3600000), 10);

  hours = hours < 10 ? `0${hours}` : hours;
  mins = mins < 10 ? `0${mins}` : mins;
  secs = secs < 10 ? `0${secs}` : secs;

  return `${hours}:${mins}:${secs}.${tenth}`;
};

class Clock extends Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.time >= 0;
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillUpdate(nextProps) {
    if (nextProps.time <= 0) {
      // eslint-disable-next-line react/destructuring-assignment
      this.props.timeOverAction();
    }
  }

  render() {
    // eslint-disable-next-line react/destructuring-assignment
    const time = parseTime(this.props.time);
    return <StyledClock>{time}</StyledClock>;
  }
}

Clock.defaultProps = {
  time: 60000,
};

Clock.propTypes = {
  time: PropTypes.number,
  timeOverAction: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  timeOverAction: () => dispatch(timeOver()),
});

export default connect(null, mapDispatchToProps)(Clock);

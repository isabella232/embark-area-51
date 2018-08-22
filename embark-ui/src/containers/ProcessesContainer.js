import React, {Component} from 'react';
import {connect} from 'react-redux';
import {fetchProcesses} from '../actions';
import {Tabs, Tab} from 'tabler-react';
import PropTypes from 'prop-types';

class ProcessesContainer extends Component {
  componentDidMount() {
    this.props.fetchProcesses();
  }

  render() {
    const {processes} = this.props;
    if (!processes.data) {
      return (
        <h1>
          <i>Loading processes...</i>
        </h1>
      );
    }

    if (processes.error) {
      return (
        <h1>
          <i>Error API...</i>
        </h1>
      );
    }

    const processNames = Object.keys(processes.data);
    return (
      <Tabs initialTab={processNames[0]}>
        {processNames.map(processName => {
          return (<Tab key={processName} title={processName}>State: {processes.data[processName].state}</Tab>);
        })}
      </Tabs>
    );
  }
}

ProcessesContainer.propTypes = {
  processes: PropTypes.object,
  fetchProcesses: PropTypes.func
};

function mapStateToProps(state) {
  return {processes: state.processes};
}

export default connect(
  mapStateToProps,
  {
    fetchProcesses
  }
)(ProcessesContainer);

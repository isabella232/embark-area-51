import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';

import {contractProfile as contractProfileAction} from '../actions';
import ContractProfile from '../components/ContractProfile';
import DataWrapper from "../components/DataWrapper";
import {getContractProfile} from "../reducers/selectors";

class ContractProfileContainer extends Component {
  componentDidMount() {
    this.props.fetchContractProfile(this.props.match.params.contractName);
  }

  render() {
    return (
      <DataWrapper shouldRender={this.props.contractProfile !== undefined } {...this.props} render={({contractProfile}) => (
        <ContractProfile contractProfile={contractProfile} />
      )} />
    );
  }
}

function mapStateToProps(state, props) {
  return {
    contractProfile: getContractProfile(state, props.match.params.contractName),
    error: state.errorMessage,
    loading: state.loading
  };
}

ContractProfileContainer.propTypes = {
  match: PropTypes.object,
  contractProfile: PropTypes.object,
  fetchContractProfile: PropTypes.func,
  error: PropTypes.string
};

export default withRouter(connect(
  mapStateToProps,
  {
    fetchContractProfile: contractProfileAction.request
  }
)(ContractProfileContainer));

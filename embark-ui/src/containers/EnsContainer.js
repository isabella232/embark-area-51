import PropTypes from "prop-types";
import React, {Component} from 'react';
import connect from "react-redux/es/connect/connect";
import {Alert, Row, Col} from 'reactstrap';
import {ensRecord, ensRecords} from "../actions";
import EnsRegister from "../components/EnsRegister";
import EnsLookup from "../components/EnsLookup";
import EnsResolve from "../components/EnsResolve";
import {getEnsRecords, isEnsEnabled, getEnsErrors} from "../reducers/selectors";

class EnsContainer extends Component {

  showEns() {
    return (
      <Row className="mt-3 justify-content-md-center">
        <Col xs="12" sm="9" lg="6">
          <EnsLookup lookup={this.props.lookup} ensRecords={this.props.ensRecords}/>
          <EnsResolve resolve={this.props.resolve} ensRecords={this.props.ensRecords}/>
          <EnsRegister register={this.props.register} ensRecords={this.props.ensRecords} ensErrors={this.props.ensErrors}/>
        </Col>
      </Row>
    );
  }

  showWarning() {
    return <Alert color="warning">Please enable Ens in Embark first</Alert>;
  }

  render() {
    return (
      <React.Fragment>
        {this.props.isEnsEnabled ? this.showEns() : this.showWarning()}
      </React.Fragment>
    );
  }
}

EnsContainer.propTypes = {
  ensRecords: PropTypes.array,
  resolve: PropTypes.func,
  lookup: PropTypes.func,
  register: PropTypes.func,
  isEnsEnabled: PropTypes.bool,
  ensErrors: PropTypes.string
};

function mapStateToProps(state) {
  return {
    ensRecords: getEnsRecords(state),
    ensErrors: getEnsErrors(state),
    isEnsEnabled: isEnsEnabled(state)
  };
}

export default connect(
  mapStateToProps,
  {
    resolve: ensRecord.resolve,
    lookup: ensRecord.lookup,
    register: ensRecords.post
  }
)(EnsContainer);


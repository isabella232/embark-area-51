import React, {Component} from 'react';
import {Badge} from 'tabler-react';
import PropTypes from 'prop-types';

class FiddleResultsSummary extends Component{

  render(){
    const {warnings, errors, isFetching, hasResult} = this.props;
    let renderings = [];
    if(isFetching){
      renderings.push(
        <React.Fragment key="compiling"><div className="loader"></div><span className="loader-text">Compiling...</span></React.Fragment>
      );
    }
    if(hasResult && !errors.length){
       renderings.push(<Badge key="success" className="badge-link" color="success">Compiled</Badge>);
    }
    if(errors.length) renderings.push(
      <React.Fragment key="errors">
        <a className="badge-link" href="#errors"><Badge color="danger">{errors.length} error{errors.length > 1 ? "s" : ""}</Badge></a>
      </React.Fragment>
    );
    if(warnings.length) renderings.push(
      <React.Fragment key="warnings">
        <a className="badge-link" href="#warnings"><Badge color="warning">{warnings.length} warning{warnings.length > 1 ? "s" : ""}</Badge></a>
      </React.Fragment>
    );
    
    return (
      <div className={"compilation-summary " + ((hasResult || isFetching) ? "visible" : "")}>
        {renderings}
        {!(hasResult || isFetching) ? "&nbsp;" : ""}
      </div>
    );
  }
}

FiddleResultsSummary.propTypes = {
  errors: PropTypes.array,
  warnings: PropTypes.array,
  isFetching: PropTypes.bool,
  hasResult: PropTypes.bool
};

export default FiddleResultsSummary;

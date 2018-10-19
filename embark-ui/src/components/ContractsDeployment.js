import PropTypes from "prop-types";
import React from 'react';
import FontAwesomeIcon from 'react-fontawesome';
import {
  Row,
  Col,
  FormGroup,
  Input,
  Label,
  UncontrolledTooltip,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardBody
} from 'reactstrap';
import classNames from 'classnames';
import {DEPLOYMENT_PIPELINES} from '../constants';
import Description from './Description';

const orderClassName = (address) => {
  return classNames('mr-4', {
    badge: true,
    'badge-success': address,
    'badge-secondary': !address
  });
};

// TODO add an ABI parser
const findConstructor = (abiDefinition) => abiDefinition.find(method => method.type === 'constructor');

const NoWeb3 = () => (
  <Row>
    <Col>
      <h3>You are not connected to web3 yet</h3>
    </Col>
  </Row>
);

const LayoutContract = ({contract, children, cardTitle}) => (
  <Card>
    <CardHeader>
      <CardTitle>
        <span className={orderClassName(contract.address)}>{contract.index + 1}</span>
        {cardTitle}
      </CardTitle>
    </CardHeader>
    <CardBody>
      {children}
    </CardBody>
  </Card>
);

const DeploymentResult = ({deployment}) => {
  if (deployment.running) {
    return <p>Deployment is in progress <FontAwesomeIcon className="ml-1" name="spinner" spin/></p>;
  }

  if (deployment.error) {
    return <p className="text-danger">Deployment failed: {deployment.error}</p>;
  }

  return (
    <React.Fragment>
      <p className="text-success">Deployment succeed:</p>
      <dl className="row">
        <Description label="Transaction" value={deployment.transactionHash}/>
        <Description label="Gas used" value={deployment.gasUsed}/>
        <Description label="Address" value={deployment.contractAddress}/>
      </dl>
    </React.Fragment>
  );
};

const GasEstimateResult = ({gasEstimate}) => {
  if (gasEstimate.running) {
    return <p>Gas Estimation is in progresss <FontAwesomeIcon className="ml-1" name="spinner" spin/></p>;
  }

  if (gasEstimate.error) {
    return <p className="text-danger">Gas Estimation failed: {gasEstimate.error}</p>;
  }

  return <p className="text-success">Gas Estimation succeed: {gasEstimate.gas}</p>;
};

class Web3Contract extends React.Component {
  constructor(props) {
    super(props);
    this.state = {inputs: {}};
  }

  handleOnChange(event, name) {
    let newInputs = this.state.inputs;
    newInputs[name] = event.target.value;
    this.setState({inputs: newInputs});
  }

  inputsAsArray() {
    return findConstructor(this.props.contract.abiDefinition).inputs
      .map(input => this.state.inputs[input.name])
      .filter(value => value);
  }

  actionDisabled() {
    return this.inputsAsArray().length !== findConstructor(this.props.contract.abiDefinition).inputs.length;
  }

  render() {
    const abiConstructor = findConstructor(this.props.contract.abiDefinition);
    const isInterface = !abiConstructor;
    const argumentsRequired = abiConstructor && abiConstructor.inputs.length > 0;
    return (
      <LayoutContract contract={this.props.contract} cardTitle={
        <React.Fragment>
          {isInterface && `${this.props.contract.className} is an interface`}
          {!isInterface && this.props.contract.className}
        </React.Fragment>
      }>
        <Row>
          <Col md={6}>
            {argumentsRequired &&
            <React.Fragment>
              <h5>Arguments:</h5>
              {abiConstructor.inputs.map(input => (
                <FormGroup key={input.name}>
                  <Label htmlFor={input.name}>{input.name}</Label>
                  <Input id={input.name} placeholder={input.name} onChange={e => this.handleOnChange(e, input.name)}/>
                </FormGroup>
              ))}
            </React.Fragment>
            }

            {!this.props.web3 && <NoWeb3/>}

            {this.props.web3 && !isInterface &&
            <React.Fragment>
              <Button className="mr-2"
                      color="primary"
                      disabled={this.actionDisabled()}
                      onClick={() => this.props.web3EstimateGas(this.props.contract, this.inputsAsArray())}>
                Estimate
              </Button>
              <Button color="primary" disabled={this.actionDisabled()}
                      onClick={() => this.props.web3Deploy(this.props.contract, this.inputsAsArray())}>Deploy</Button>
            </React.Fragment>
            }
          </Col>
          <Col md={5}>
            {this.props.gasEstimate && <GasEstimateResult gasEstimate={this.props.gasEstimate}/>}
            <hr/>
            {this.props.deployment && <DeploymentResult deployment={this.props.deployment}/>}
          </Col>
        </Row>
      </LayoutContract>
    );
  }
}

const EmbarkContract = ({contract}) => (
  <LayoutContract contract={contract} cardTitle={
    <React.Fragment>
      {contract.address && `${contract.className} deployed at ${contract.address}`}
      {!contract.address && `${contract.className} not deployed`}
    </React.Fragment>
  }>
    {contract.address && <p><strong>Arguments:</strong> {JSON.stringify(contract.args)}</p>}
    {contract.transactionHash &&
    <React.Fragment>
      <p><strong>Transaction Hash:</strong> {contract.transactionHash}</p>
      <p><strong>{contract.gas}</strong> gas at <strong>{contract.gasPrice}</strong> Wei, estimated
        cost: <strong>{contract.gas * contract.gasPrice}</strong> Wei</p>
    </React.Fragment>
    }
    {contract.address && !contract.transactionHash &&
    <p><strong>Contract already deployed</strong></p>
    }
  </LayoutContract>
);

const ContractsHeader = ({deploymentPipeline, updateDeploymentPipeline}) => (
  <Row className="mt-3">
    <div className="ml-auto mr-5">
      <FormGroup row>
        <span className="mr-2">Deploy using</span>
        <FormGroup check inline>
          <Label className="form-check-label" check>
            <Input className="form-check-input"
                   type="radio"
                   onChange={() => updateDeploymentPipeline(DEPLOYMENT_PIPELINES.embark)}
                   checked={deploymentPipeline === DEPLOYMENT_PIPELINES.embark}/>
            Embark
            <FontAwesomeIcon className="ml-1" name="question" id="embark-tooltip"/>
            <UncontrolledTooltip placement="bottom" target="embark-tooltip">
              Embark will deploy the contracts automatically for you each time there is a change in one of them.
            </UncontrolledTooltip>
          </Label>
        </FormGroup>
        <FormGroup check inline>
          <Label className="form-check-label" check>
            <Input className="form-check-input"
                   type="radio"
                   onChange={() => updateDeploymentPipeline(DEPLOYMENT_PIPELINES.injectedWeb3)}
                   checked={deploymentPipeline === DEPLOYMENT_PIPELINES.injectedWeb3}/>
            Injected Web3
            <FontAwesomeIcon className="ml-1" name="question" id="web3-tooltip"/>
            <UncontrolledTooltip placement="bottom" target="web3-tooltip">
              You will have full control on your deployment
            </UncontrolledTooltip>
          </Label>
        </FormGroup>
      </FormGroup>
    </div>
  </Row>
);

const Contract = ({web3, contract, deploymentPipeline, web3Deploy, web3EstimateGas, web3Deployments, web3GasEstimates}) => {
  const deployment = web3Deployments[contract.className];
  const gasEstimate = web3GasEstimates[contract.className];
  switch (deploymentPipeline) {
    case DEPLOYMENT_PIPELINES.embark:
      return <EmbarkContract contract={contract}/>;
    case DEPLOYMENT_PIPELINES.injectedWeb3:
      return <Web3Contract web3={web3}
                           deployment={deployment}
                           gasEstimate={gasEstimate}
                           contract={contract}
                           web3Deploy={web3Deploy}
                           web3EstimateGas={web3EstimateGas}/>;
    default:
      return <React.Fragment></React.Fragment>;
  }
};

const Contracts = (props) => (
  <React.Fragment>
    <ContractsHeader deploymentPipeline={props.deploymentPipeline}
                     updateDeploymentPipeline={props.updateDeploymentPipeline}/>
    {props.contracts.sort((a, b) => a.index - b.index).map(contract => <Contract key={contract.index}
                                                                                 contract={contract} {...props} />)}
  </React.Fragment>
);

Contracts.propTypes = {
  contracts: PropTypes.array,
  deploymentPipeline: PropTypes.string,
  updateDeploymentPipeline: PropTypes.func,
  web3Deployments: PropTypes.object,
  web3GasEstimates: PropTypes.object,
  web3: PropTypes.object,
  web3Deploy: PropTypes.func,
  web3EstimateGas: PropTypes.func
};

export default Contracts;


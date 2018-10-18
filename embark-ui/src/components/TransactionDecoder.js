import React from 'react';
import {withRouter} from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  Button,
  Alert
} from 'reactstrap';
import ReactJson from 'react-json-view';

class TransactionDecoder extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      transactionHash: this.props.transactionHash || ''
    };
  }

  handleTransactionHashChange(event) {
    const transactionHash = event.target.value;
    this.setState({transactionHash});
  }

  fetchTransaction(e) {
    e.preventDefault();
    if (this.state.transactionHash !== '') {
      this.props.history.push({
        search: `hash=${this.state.transactionHash}`
      });
    }
  }

  render() {
    return (
      <Card>
        <CardHeader>
          <strong>Transaction Decoder</strong>
        </CardHeader>
        <CardBody>
          <Form onSubmit={e => this.fetchTransaction(e)}>
            <FormGroup>
              <InputGroup>
                <Input type="text" id="transactionHash" placeholder="Enter transaction hash" value={this.state.transactionHash} onChange={e => this.handleTransactionHashChange(e)}/>
                <InputGroupAddon addonType="append">
                  <Button color="primary" type="submit">Decode</Button>
                </InputGroupAddon>
              </InputGroup>
            </FormGroup>
          </Form>
          {this.props.transactionHash && !this.props.transaction && <Alert color="danger">Couldn't find transaction for hash {this.props.transactionHash}</Alert>}

          <div className="mt-3">
            {this.props.transaction && <ReactJson src={this.props.transaction} theme="monokai" sortKeys={true} collapsed={1} />}
          </div>
        </CardBody>
      </Card>
    );
  }
}

export default withRouter(TransactionDecoder);

import React from 'react';
import {NavLink, Route, Switch, withRouter} from 'react-router-dom';
import {
  Page,
  Grid,
  List
} from "tabler-react";

import ContractContainer from '../containers/ContractContainer';
import ContractProfileContainer from '../containers/ContractProfileContainer';

const ContractLayout = (props) => (
  <Grid.Row>
    <Grid.Col md={3}>
      <Page.Title className="my-5">Contract</Page.Title>
      <div>
        <List.Group transparent={true}>
          <List.GroupItem
            className="d-flex align-items-center"
            to={`/embark/contracts/${props.match.params.contractName}/deployment`}
            icon="users"
            RootComponent={withRouter(NavLink)}
          >
            Deployment / Utils
          </List.GroupItem>
          <List.GroupItem
            className="d-flex align-items-center"
            to={`/embark/contracts/${props.match.params.contractName}/functions`}
            icon="book-open"
            RootComponent={withRouter(NavLink)}
          >
            Functions
          </List.GroupItem>
          <List.GroupItem
            className="d-flex align-items-center"
            to={`/embark/contracts/${props.match.params.contractName}/source`}
            icon="activity"
            RootComponent={withRouter(NavLink)}
          >
            Source Code
          </List.GroupItem>
          <List.GroupItem
            className="d-flex align-items-center"
            to={`/embark/contracts/${props.match.params.contractName}/profiler`}
            icon="server"
            RootComponent={withRouter(NavLink)}
          >
            Profile
          </List.GroupItem>
        </List.Group>
      </div>
    </Grid.Col>
    <Grid.Col md={9}>
      <Switch>
        <Route exact path="/embark/contracts/:contractName/profiler" component={ContractProfileContainer} />
        <ContractContainer />
      </Switch>
    </Grid.Col>
  </Grid.Row>
);

export default withRouter(ContractLayout);

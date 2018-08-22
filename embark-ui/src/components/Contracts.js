import PropTypes from "prop-types";
import React from 'react';
import {
  Page,
  Grid,
  Card,
  Table
} from "tabler-react";
import {Link} from 'react-router-dom';

const Contracts = ({contracts}) => (
  <Page.Content title="Contracts">
    <Grid.Row>
      <Grid.Col>
        <Card>
          <Table
            responsive
            className="card-table table-vcenter text-nowrap"
            headerItems={[
              {content: "Name"},
              {content: "Address"},
              {content: "State"}
            ]}
            bodyItems={
              contracts.map((contract) => {
                return ([
                  {content: <Link to={`contracts/${contract.className}`}>{contract.className}</Link>},
                  {content: contract.address},
                  {content: contract.deploy.toString()}
                ]);
              })
            }
          />
        </Card>
      </Grid.Col>
    </Grid.Row>
  </Page.Content>
);

Contracts.propTypes = {
  contracts: PropTypes.arrayOf(PropTypes.object)
};

export default Contracts;


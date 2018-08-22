import React from 'react';
import {
  Page,
  Grid,
  Card,
  Table
} from "tabler-react";
import PropTypes from 'prop-types';

const Transactions = ({transactions}) => (
  <Page.Content title="Transactions">
    <Grid.Row>
      <Grid.Col>
        <Card>
          <Table
            responsive
            className="card-table table-vcenter text-nowrap"
            headerItems={[
              {content: "Block Number"},
              {content: "From"},
              {content: "To"},
              {content: "Type"},
              {content: "Hash"}]}
            bodyItems={
              transactions.map((transaction) => {
                return ([
                  {content: transaction.blockNumber},
                  {content: transaction.from},
                  {content: transaction.to},
                  {content: transaction.to ? "Contract Call" : "Contract Creation"},
                  {content: transaction.hash}
                ]);
              })
            }
          />
        </Card>
      </Grid.Col>
    </Grid.Row>
  </Page.Content>
);

Transactions.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.object)
};

export default Transactions;

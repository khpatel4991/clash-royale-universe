import * as React from 'react';
import { useQuery } from 'react-apollo-hooks';
import { gql } from 'apollo-boost';
import { CachedTypeAhead } from '../../CachedTypeAhead';
import { Alert } from 'reactstrap';

import './styles.css';

const ME = gql`
  {
    me {
      id
      email
    }
  }
`;

export const PlayerView = () => {
  const { data, error, loading } = useQuery(ME);
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <Alert color="danger">Error! {error.message}</Alert>;
  }

  if (data.me === null) {
    data.me = { email: 'john@doe.com' };
  }
  if (data.me.playerTag) {
    return <p>Lets get your profile from tag: {data.me.playerTag}</p>;
  }
  return (
    <div className="player-view-container">
      <h2>Let's add your Clash Royale Player Tag</h2>
      <CachedTypeAhead />
    </div>
  );
};
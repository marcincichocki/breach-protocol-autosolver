import { useContext } from 'react';
import { StateContext } from '../state';

export const Analyze = () => {
  const { analyzedEntry } = useContext(StateContext);

  console.log(analyzedEntry);

  return <></>;
};

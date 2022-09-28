import { JSONValue } from '@/common';
import { MdContentCopy } from '@react-icons/all-files/md/MdContentCopy';
import { useContext } from 'react';
import styled from 'styled-components';
import { nativeDialog } from '../common';
import { TreeContext } from './JSONTree';

async function copy(json: JSONValue) {
  try {
    const data = JSON.stringify(json);

    api.copy(data);
  } catch (e) {
    nativeDialog.alert({
      message: 'Coping has failed, data is not in a valid json format.',
    });
  }
}

export const JSONTreeCopy = styled(({ className }: { className?: string }) => {
  const { root } = useContext(TreeContext);

  return (
    <button className={className} onClick={() => copy(root)}>
      <MdContentCopy />
    </button>
  );
})`
  border: none;
  background: none;
  margin: 0;
  padding: 0;
  cursor: pointer;
  font-size: 24px;
  color: var(--accent);
`;

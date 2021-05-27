import { ChangeEvent, useState } from 'react';
import styled from 'styled-components';
import { FlatButton } from './Buttons';
import { useField } from './Form';

const Path = styled.output`
  font-size: 1.2rem;
  font-weight: 500;
`;

export const File = () => {
  const { setValue, value, name } = useField<string>();
  const [displayName, setDisplayName] = useState<string>(
    value.slice(value.lastIndexOf('/') + 1)
  );

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files[0];

    if (!file) return;

    setDisplayName(file.name);
    setValue(file.path);
  }

  return (
    <>
      <Path>{displayName}</Path>
      <FlatButton as="label" htmlFor={name} color="accent">
        Change sound path
      </FlatButton>
      <input type="file" id={name} onChange={onChange} hidden />
    </>
  );
};

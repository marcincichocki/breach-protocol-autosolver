import { ChangeEvent, useState } from 'react';
import { FlatButton } from './Buttons';
import { useField } from './Form';

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
      <span>{displayName}</span>
      <FlatButton as="label" htmlFor={name} color="accent">
        Change sound path
      </FlatButton>
      <input type="file" id={name} onChange={onChange} hidden />
    </>
  );
};

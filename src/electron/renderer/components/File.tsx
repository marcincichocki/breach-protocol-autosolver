import { basename } from 'path';
import { ChangeEvent, useState } from 'react';
import { MdClose } from 'react-icons/md';
import styled from 'styled-components';
import { useField } from './Form';

const FileOutput = styled.output`
  flex-grow: 1;
  font-size: 1.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--primary-dark);
  border-right: none;
  box-sizing: border-box;
  height: 100%;
`;

const FilePath = styled(FileOutput)`
  color: var(--accent);
`;

const FilePathEmpty = styled(FileOutput)`
  color: var(--primary);
  text-transform: uppercase;
`;

const FileWrapper = styled.div`
  width: 510px;
  height: 50px;
  background: var(--background);
  display: flex;
  box-sizing: border-box;
  justify-content: space-between;
  align-items: center;
`;

const FileLabel = styled.label`
  background: var(--accent);
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Rajdhani;
  font-size: 24px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0 2rem;
  height: 100%;
  cursor: pointer;
`;

const ClearButton = styled.button`
  height: 50px;
  width: 50px;
  border: 2px solid var(--primary);
  color: var(--primary);
  background: #942f2f;
  cursor: pointer;
`;

interface FileProps {
  accept?: string;
}

export const File = ({ accept }: FileProps) => {
  const { setValue, value, name } = useField<string>();
  const [displayName, setDisplayName] = useState<string>(basename(value));

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files[0];

    if (!file) return;

    setDisplayName(file.name);
    setValue(file.path);
  }

  function onClear() {
    setDisplayName(null);
    setValue('');
  }

  return (
    <FileWrapper>
      {value ? (
        <>
          <ClearButton onClick={onClear}>
            <MdClose size="24px" />
          </ClearButton>
          <FilePath>{displayName}</FilePath>
        </>
      ) : (
        <FilePathEmpty>No file selected</FilePathEmpty>
      )}
      <FileLabel htmlFor={name}>Change</FileLabel>
      <input type="file" accept={accept} id={name} onChange={onChange} hidden />
    </FileWrapper>
  );
};

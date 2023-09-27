import type { BreachProtocolTypesFragmentResult } from '@/core';
import { Warning } from './Warning';

interface TypesFragmentStatusProps {
  types: BreachProtocolTypesFragmentResult;
}

export const TypesFragmentStatus = ({ types }: TypesFragmentStatusProps) => {
  if (!types || types.isValid) return null;

  return (
    <Warning
      title={<Warning.Title>Warning: unknown types</Warning.Title>}
      body={
        <Warning.Body>
          Select correct{' '}
          <Warning.Link setting="gameLang">game language</Warning.Link>,{' '}
          <Warning.Link setting="patch">patch</Warning.Link>, change{' '}
          <Warning.Link setting="thresholdTypesAuto">threshold</Warning.Link> or{' '}
          <Warning.Link setting="skipTypesFragment">
            disable this feature
          </Warning.Link>
          .
        </Warning.Body>
      }
    />
  );
};

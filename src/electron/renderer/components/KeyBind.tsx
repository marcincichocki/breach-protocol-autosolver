import { MdClose } from '@react-icons/all-files/md/MdClose';
import {
  Fragment,
  KeyboardEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { OnBeforeValueChange, useField } from './Form';

export interface Transformer<I, O> {
  toUniversal(input: I): O;
  fromUniversal(output: O): I;
}

const KeyBindWrapper = styled.div`
  width: 510px;
  height: 50px;
  border: 1px solid var(--primary-dark);
  background: var(--background);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 7px;
  color: var(--accent);
  font-weight: 500;
  font-size: 24px;
  cursor: pointer;
  box-sizing: border-box;

  &:hover:not(:focus-within) {
    background: var(--primary-darker);
    border-color: var(--accent);
  }

  &:focus-within {
    border-color: var(--accent);
    background: #367c7f;
  }
`;

const VisuallyHiddenInput = styled.input`
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
  white-space: nowrap;
  outline: 0;
  appearance: none;
  top: 0;
  left: 0;
`;

const KeyCode = styled.kbd`
  border: 1px solid var(--accent);
  padding: 0 8px;
  font-family: 'Rajdhani';
  min-width: 32px;
  box-sizing: border-box;
`;

const ClearButton = styled.button`
  height: 50px;
  width: 50px;
  border: 2px solid var(--primary);
  color: var(--primary);
  background: #942f2f;
  cursor: pointer;
`;

export interface KeyBindProps<I = any, O = any> {
  transformer: Transformer<I, O>;
  depth: number;
  allowRemove?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onBeforeValueChange?: OnBeforeValueChange<Electron.Accelerator>;
}

export const KeyBind = ({
  transformer,
  depth,
  allowRemove,
  onFocus,
  onBlur,
  onBeforeValueChange,
}: KeyBindProps) => {
  const ref = useRef<HTMLInputElement>();
  const { value, setValue } = useField();
  const initial = transformer.toUniversal(value);
  const [selected, setSelected] = useState<string[]>(initial);
  const [active, setActive] = useState<string[]>([]);
  const [focused, setFocused] = useState<boolean>(false);

  useEffect(() => {
    if (!active.length || active.length === depth) {
      ref.current.blur();
    }
  }, [active]);

  const onInputFocus = useCallback(() => {
    if (onFocus) onFocus();

    setFocused(true);
    setSelected([]);
  }, []);

  const onInputBlur = useCallback(() => {
    if (onBlur) onBlur();

    setFocused(false);
    setActive([]);

    // If there is no key selected, return to previous value and don't emit anything.
    if (!selected.length) {
      return setSelected(initial);
    }

    const newValue = transformer.fromUniversal(selected);

    if (newValue !== value) {
      const next = (restart?: boolean) =>
        restart ? setSelected(initial) : setValue(newValue);

      if (onBeforeValueChange) {
        onBeforeValueChange(newValue, next);
      } else {
        next();
      }
    }
  }, [selected]);

  const onInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      event.preventDefault();
      event.stopPropagation();

      // In rare cases OS can intercept shortcuts like
      // Alt+Tab or LeftShift+Del which cause weird behaviour
      // in keyDown and keyUp events. This check makes sure to only
      // save new value when input is focused.
      if (!focused) return;

      const { code } = event;

      if (active.some((k) => k === code)) return;

      setActive((active) => [...active, code]);

      if (selected.some((k) => k === code)) return;

      setSelected((selected) => [...selected, code]);
    },
    [active, selected, focused]
  );

  const onInputKeyUp = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      setActive((active) => active.filter((k) => k !== event.code));
    },
    [active]
  );

  function clear(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    setSelected([]);
    setValue('');
  }

  return (
    <KeyBindWrapper onClick={() => ref.current.focus()}>
      {allowRemove && value && (
        <ClearButton onClick={clear}>
          <MdClose size="24px" />
        </ClearButton>
      )}

      {focused && !selected.length ? (
        <span style={{ textTransform: 'uppercase' }}>Press key to bind</span>
      ) : !value && !focused ? (
        <span style={{ textTransform: 'uppercase', color: 'var(--primary)' }}>
          Unbound
        </span>
      ) : (
        selected.map((key, i) => (
          <Fragment key={i}>
            {!!i && ' + '}
            <KeyCode>{key}</KeyCode>
          </Fragment>
        ))
      )}
      <VisuallyHiddenInput
        ref={ref}
        onFocus={onInputFocus}
        onBlur={onInputBlur}
        onKeyDown={onInputKeyDown}
        onKeyUp={onInputKeyUp}
      />
    </KeyBindWrapper>
  );
};

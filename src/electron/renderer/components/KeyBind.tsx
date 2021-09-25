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
import { ClearButton } from './Buttons';
import { Row } from './Flex';
import { OnBeforeValueChange, useField } from './Form';

export interface Transformer<I, O> {
  toUniversal(input: I): O;
  fromUniversal(output: O): I;
}

const KeyBindContainer = styled.div`
  flex: 1;
  height: 50px;
  border: 1px solid var(--primary-dark);
  background: var(--background);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 24px;
  cursor: pointer;
  box-sizing: border-box;
  color: var(--primary);

  &:hover:not(:focus-within) {
    background: var(--primary-darker);
    border-color: var(--accent);
    color: var(--accent);
  }

  &:focus-within {
    background: #367c7f;
    border-color: var(--accent);
    color: var(--accent);
  }
`;

const KeyBindText = styled.span`
  text-transform: uppercase;
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
  color: var(--accent);
  padding: 0 8px;
  font-family: 'Rajdhani';
  min-width: 32px;
  box-sizing: border-box;
`;

const KeyCodeSeparator = styled.span`
  color: var(--accent);
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

    setValue('');
  }

  return (
    <Row style={{ width: '510px' }}>
      {allowRemove && value && !focused && (
        <ClearButton onClick={clear}>
          <MdClose size="24px" />
        </ClearButton>
      )}
      <KeyBindContainer onClick={() => ref.current.focus()}>
        {focused && !selected.length ? (
          <KeyBindText>Press key to bind</KeyBindText>
        ) : !value && !focused ? (
          <KeyBindText>Unbound</KeyBindText>
        ) : (
          selected.map((key, i) => (
            <Fragment key={i}>
              {!!i && <KeyCodeSeparator>+</KeyCodeSeparator>}
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
      </KeyBindContainer>
    </Row>
  );
};

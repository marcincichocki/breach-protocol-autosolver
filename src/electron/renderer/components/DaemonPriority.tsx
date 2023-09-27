import {
  DaemonId,
  DAEMON_CAMERA_SHUTDOWN,
  DAEMON_DATAMINE_COPY_MALWARE,
  DAEMON_DATAMINE_CRAFTING_SPECS,
  DAEMON_DATAMINE_V1,
  DAEMON_DATAMINE_V2,
  DAEMON_DATAMINE_V3,
  DAEMON_FRIENDLY_TURRETS,
  DAEMON_GAIN_ACCESS,
  DAEMON_ICEPICK,
  DAEMON_MASS_VULNERABILITY,
  DAEMON_NEUTRALIZE_MALWARE,
  DAEMON_OPTICS_JAMMER,
  DAEMON_TURRET_SHUTDOWN,
  DAEMON_WEAPONS_JAMMER,
  eng,
  DAEMON_BASIC_DATAMINE,
  DAEMON_ADVANCED_DATAMINE,
  DAEMON_EXPERT_DATAMINE,
} from '@/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import styled from 'styled-components';
import { FlatButton } from './Buttons';
import { Dialog } from './Dialog';
import { Col, Row, Spacer } from './Flex';
import { useField, useForm } from './Form';
import { AppSettings } from '@/electron/common';
import { DAEMONS, LEGACY_DAEMONS } from '@/core/daemon-set';

const Description = styled.p`
  color: var(--primary);
  font-weight: 600;
  font-size: 1.2rem;
  margin: 0 auto;
  text-transform: uppercase;
`;

const Daemon = styled(Row).attrs({
  role: 'button',
})<{ selected: boolean; disabled: boolean }>`
  color: ${(p) =>
    p.disabled ? 'gray' : p.selected ? 'var(--background)' : 'var(--accent)'};
  background: ${(p) =>
    p.disabled
      ? 'darkgray'
      : p.selected
      ? 'var(--accent)'
      : 'var(--background)'};
  border: 1px solid
    ${(p) =>
      p.disabled
        ? 'darkgray'
        : p.selected
        ? 'var(--accent)'
        : 'var(--primary)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 500;
  text-transform: uppercase;
  flex: 0 0 40px;
  user-select: none;
  padding: 0 1rem;
  cursor: pointer;
`;

function moveInArray<T>(data: T[], from: number, to: number) {
  const target = data[from];
  const copy = data.slice();

  copy.splice(from, 1);
  copy.splice(to, 0, target);

  return copy;
}

const commonDaemons: ReadonlySet<DaemonId> = new Set([
  DAEMON_DATAMINE_V1,
  DAEMON_DATAMINE_V2,
  DAEMON_DATAMINE_V3,
  DAEMON_ICEPICK,
  DAEMON_BASIC_DATAMINE,
  DAEMON_ADVANCED_DATAMINE,
  DAEMON_EXPERT_DATAMINE,
]);

const perkDaemons: ReadonlySet<DaemonId> = new Set([
  DAEMON_MASS_VULNERABILITY,
  DAEMON_CAMERA_SHUTDOWN,
  DAEMON_FRIENDLY_TURRETS,
  DAEMON_TURRET_SHUTDOWN,
]);

const legendaryDaemons: ReadonlySet<DaemonId> = new Set([
  DAEMON_OPTICS_JAMMER,
  DAEMON_WEAPONS_JAMMER,
]);

const specialDaemons: ReadonlySet<DaemonId> = new Set([
  DAEMON_DATAMINE_COPY_MALWARE,
  DAEMON_NEUTRALIZE_MALWARE,
  DAEMON_GAIN_ACCESS,
  DAEMON_DATAMINE_CRAFTING_SPECS,
]);

function getDaemonType(id: DaemonId): DaemonType {
  if (commonDaemons.has(id)) {
    return 'common';
  }

  if (perkDaemons.has(id)) {
    return 'perk';
  }

  if (legendaryDaemons.has(id)) {
    return 'legendary';
  }

  if (specialDaemons.has(id)) {
    return 'special';
  }

  throw new Error('Unknown daemon type.');
}

type DaemonType = 'common' | 'perk' | 'legendary' | 'special';

interface Daemon {
  id: DaemonId;
  type: DaemonType;
}

interface DaemonPriorityProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DaemonPriority = ({ isOpen, onClose }: DaemonPriorityProps) => {
  const { values } = useForm<AppSettings>();
  const [selected, setSelected] = useState<string>(null);
  const { value, setValue } = useField<DaemonId[]>();
  const didMount = useRef(false);
  const [dirty, setDirty] = useState(false);
  const daemonSet = useMemo(
    () => (values.patch === '1.x' ? LEGACY_DAEMONS : DAEMONS),
    [values.patch]
  );
  const defaultDaemons = useMemo(() => {
    return value.map((id) => {
      const type = getDaemonType(id);

      return { id, type };
    });
  }, [value]);
  const [daemons, setDaemons] = useState<Daemon[]>(defaultDaemons);

  useEffect(() => {
    if (didMount.current) {
      setDirty(true);
    } else {
      didMount.current = true;
    }
  }, [daemons]);

  function resetToDefault() {
    flushSync(() => {
      setDaemons(defaultDaemons);
    });

    setSelected(null);
    setDirty(false);
  }

  function save() {
    setValue(daemons.map(({ id }) => id));
    close(true);
  }

  function close(skipReset?: boolean) {
    if (dirty && !skipReset) {
      resetToDefault();
    } else {
      setSelected(null);
      setDirty(false);
    }

    onClose();
  }

  const moveUp = useCallback(() => {
    setDaemons((daemons) => {
      const index = daemons.findIndex(({ id }) => id === selected);

      if (index > 0) {
        return moveInArray(daemons, index, index - 1);
      }

      return daemons;
    });
  }, [selected, daemons]);

  const moveDown = useCallback(() => {
    setDaemons((daemons) => {
      const index = daemons.findIndex(({ id }) => id === selected);

      if (index < daemons.length - 1) {
        return moveInArray(daemons, index, index + 1);
      }

      return daemons;
    });
  }, [selected, daemons]);

  return (
    <Dialog isOpen={isOpen}>
      <Col scroll gap>
        <Row>
          <Description>
            Order daemons from highest priority to lowest priority(higher is
            better)
          </Description>
        </Row>
        <Row scroll gap>
          <Col gap>
            <FlatButton
              color="accent"
              disabled={selected === null}
              onClick={moveUp}
            >
              Up
            </FlatButton>
            <FlatButton
              color="accent"
              disabled={selected === null}
              onClick={moveDown}
            >
              Down
            </FlatButton>
            <Spacer />
            <FlatButton
              color="accent"
              type="button"
              onClick={resetToDefault}
              disabled={!dirty}
            >
              reset
            </FlatButton>
            <FlatButton
              color="accent"
              type="button"
              onClick={save}
              disabled={!dirty}
            >
              save
            </FlatButton>
            <FlatButton color="primary" type="button" onClick={() => close()}>
              close
            </FlatButton>
          </Col>
          <Col gap scroll grow style={{ width: '400px', paddingRight: '1rem' }}>
            {daemons.map(({ id, type }) => (
              <Daemon
                key={id}
                disabled={!daemonSet.has(id)}
                selected={selected === id}
                onClick={() =>
                  setSelected((selected) => (selected === id ? null : id))
                }
              >
                <>
                  {type}
                  <Spacer />
                  {eng[id]}
                </>
              </Daemon>
            ))}
          </Col>
        </Row>
      </Col>
    </Dialog>
  );
};

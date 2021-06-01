import { AppStats } from '@/client-electron/common';
import { formatDuration, secondsToHours, secondsToMinutes } from 'date-fns';
import { memo, useContext } from 'react';
import styled from 'styled-components';
import { Row } from '../components';
import { StateContext } from '../state';

const formatDistanceLocale: Record<string, string> = {
  xSeconds: '{{count}}s',
  xMinutes: '{{count}}m',
  xHours: '{{count}}h',
};

const shortLocale: Locale = {
  formatDistance(token: string, count: string) {
    return formatDistanceLocale[token].replace('{{count}}', count);
  },
};

function getShortDurationFormat({ hours }: Duration) {
  const start = hours ? 0 : 1;
  const end = hours ? -1 : undefined;

  return ['hours', 'minutes', 'seconds'].slice(start, end);
}

function formatDurationShort(duration: Duration, locale: Locale) {
  const format = getShortDurationFormat(duration);

  return formatDuration(duration, { zero: true, format, locale });
}

const StatTitle = styled.h1`
  margin: 0;
  font-size: 7rem;
  font-weight: 400;
  color: var(--primary);
  line-height: 0.8;
`;

const StatSubtitle = styled.h3`
  margin: 0;
  font-weight: 500;
  font-size: 20px;
  color: var(--accent);
  text-transform: uppercase;
`;

function getAmountOfTimeSaved(timeSpent: number) {
  const minutesLeftAsSeconds = timeSpent % 3600;
  const hours = secondsToHours(timeSpent);
  const minutes = secondsToMinutes(minutesLeftAsSeconds);
  const seconds = minutesLeftAsSeconds % 60;

  return formatDurationShort({ hours, minutes, seconds }, shortLocale);
}

interface StatProps {
  title: string | number;
  subtitle: string;
}

const StatWrapper = styled.div`
  flex-grow: 1;
`;

const Actions = styled.aside`
  width: 33%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
`;

const ActionsHeader = styled.h2`
  margin: 0;
  color: var(--primary);
  font-weight: 500;
  font-size: 2rem;
  line-height: 1;
`;

const Stat = memo(({ title, subtitle }: StatProps) => (
  <StatWrapper>
    <StatTitle>{title}</StatTitle>
    <StatSubtitle>{subtitle}</StatSubtitle>
  </StatWrapper>
));

const Stats = styled.section`
  flex-grow: 1;
  grid-gap: 1rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  padding: 1rem;
`;

function getSolvedDaemonsPercentage({
  daemonsSolvedCount,
  daemonsCount,
}: AppStats) {
  const daemonsSolved = daemonsCount
    ? (daemonsSolvedCount / daemonsCount) * 100
    : 0;

  return `${daemonsSolved.toFixed(2)}%`;
}

export const Dashboard = memo(() => {
  const { stats } = useContext(StateContext);
  const daemonsSolvedPercentage = getSolvedDaemonsPercentage(stats);
  const timeSaved = getAmountOfTimeSaved(stats.approxDuration);

  return (
    <Row style={{ gap: '1rem', flexGrow: 1, padding: '2rem' }}>
      <Stats>
        <Stat
          title={stats.countSuccessSession}
          subtitle="Solved during this session"
        />
        <Stat title={stats.countSuccess} subtitle="Solved overall" />
        <Stat title={daemonsSolvedPercentage} subtitle="Daemons acquired" />
        <Stat title={timeSaved} subtitle="Time saved(approx)" />
      </Stats>
      <Actions></Actions>
    </Row>
  );
});

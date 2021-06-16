import styled from 'styled-components';

const ArrowPathOutline = () => (
  <path
    d="M0 13.5L26 0v3.5L23 4v11h-2V5L2 14.744V15H0v-1.5zM0 16.5L26 30v-3.5l-3-.5V15h-2v10L2 15.256V15H0v1.5z"
    fill="currentColor"
  />
);

const ArrowPath = () => (
  <path
    d="M0 16.5L26 30v-3.5l-3-.5V15H0v1.5zM0 13.5L26 0v3.5L23 4v11H0v-1.5z"
    fill="currentColor"
  />
);

const SvgLeft = styled.svg.attrs({ width: 26, height: 30 })``;
const SvgRight = styled(SvgLeft).attrs({
  transform: 'scale(-1 1)',
})``;

export const ArrowLeftOutline = () => (
  <SvgLeft className="arrow-outline">
    <ArrowPathOutline />
  </SvgLeft>
);

export const ArrowRightOutline = () => (
  <SvgRight className="arrow-outline">
    <ArrowPathOutline />
  </SvgRight>
);

export const ArrowLeft = () => (
  <SvgLeft className="arrow">
    <ArrowPath />
  </SvgLeft>
);

export const ArrowRight = () => (
  <SvgRight className="arrow">
    <ArrowPath />
  </SvgRight>
);

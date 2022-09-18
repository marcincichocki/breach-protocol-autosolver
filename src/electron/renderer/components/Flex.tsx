import styled from 'styled-components';

interface FlexProps {
  gap?: boolean;
  grow?: boolean;
  scroll?: boolean;
}

interface FlexAttrs {
  axis: 'horizontal' | 'vertical';
}

function applyFlexProps(p: FlexProps & FlexAttrs) {
  let css = '';

  if (p.gap) css += 'gap: 1rem;';
  if (p.grow) css += 'flex-grow: 1;';
  if (p.scroll) css += 'overflow-y: auto;';
  if (p.scroll === false) css += 'overflow: hidden';

  return css;
}

export const Row = styled.div.attrs({ axis: 'horizontal' })`
  display: flex;
  ${applyFlexProps};
`;

export const Col = styled(Row).attrs({ axis: 'vertical' })`
  flex-direction: column;
`;

export const Spacer = styled.span`
  flex-grow: 1;
`;

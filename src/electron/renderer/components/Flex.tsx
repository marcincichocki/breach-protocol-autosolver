import styled from 'styled-components';

interface FlexProps {
  gap?: boolean;
  grow?: boolean;
  justifyContent?: string;
  alignItems?: string;
  scroll?: boolean;
}

interface FlexAttrs {
  axis: 'horizontal' | 'vertical';
}

function applyFlexProps(p: FlexProps & FlexAttrs) {
  let css = '';

  if (p.gap) css += 'gap: 1rem;';
  if (p.grow) css += 'flex-grow: 1;';
  if (p.justifyContent) css += `justify-content: ${p.justifyContent};`;
  if (p.alignItems) css += `align-items: ${p.justifyContent};`;
  if (p.scroll) css += 'overflow-y: auto;';

  return css;
}

export const Row = styled.div.attrs({ axis: 'horizontal' })`
  display: flex;
  ${applyFlexProps};
`;

export const Col = styled(Row)`
  flex-direction: column;
`;

export const Spacer = styled.span`
  flex-grow: 1;
`;

/** @jest-environment jsdom */
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { TitleBar } from './TitleBar';

let container: HTMLDivElement = null;

describe('Component: TitleBar', () => {
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);

    document.body.removeChild(container);
    container = null;
    (global as any).api = null;
  });

  it('should render buttons', () => {
    act(() => {
      render(<TitleBar />, container);
    });

    const buttons = container.querySelectorAll('button');

    expect(buttons.length).toBe(4);
  });

  it('should send correct events', () => {
    act(() => {
      render(<TitleBar />, container);
    });

    const send = jest.fn();
    (global as any).api = { send };

    const buttons = container.querySelectorAll('button');
    const events = [
      'main:show-help-menu',
      'main:minimize',
      'main:maximize',
      'main:close',
    ];

    buttons.forEach((b, i) => {
      const event = events[i];

      expect(b.childNodes.length).toBe(1);
      expect(b.firstChild.nodeName).toBe('svg');

      b.click();

      expect(send).toHaveBeenCalledTimes(i + 1);

      if (event === 'main:show-help-menu') {
        expect(send).toHaveBeenCalledWith(
          event,
          expect.objectContaining({
            x: expect.any(Number),
            y: expect.any(Number),
          })
        );
      } else {
        expect(send).toHaveBeenCalledWith(event);
      }
    });
  });
});

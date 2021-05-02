import RajdhaniLight from '../assets/fonts/Rajdhani/Rajdhani-Light.ttf';
import RajdhaniRegular from '../assets/fonts/Rajdhani/Rajdhani-Regular.ttf';
import RajdhaniMedium from '../assets/fonts/Rajdhani/Rajdhani-Medium.ttf';
import RajdhaniSemiBold from '../assets/fonts/Rajdhani/Rajdhani-SemiBold.ttf';
import RajdhaniBold from '../assets/fonts/Rajdhani/Rajdhani-Bold.ttf';

const rajdhaniFontFamily = [
  { url: RajdhaniLight, weight: 300 },
  { url: RajdhaniRegular, weight: 400 },
  { url: RajdhaniMedium, weight: 500 },
  { url: RajdhaniSemiBold, weight: 600 },
  { url: RajdhaniBold, weight: 700 },
];

export const fonts = rajdhaniFontFamily.map(
  ({ url, weight }) => `
    @font-face {
      font-family: Rajdhani;
      src: url(${url});
      font-weight: ${weight};
      font-style: normal;
    }
  `
);

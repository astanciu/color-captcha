let C5 = require('canvas-5-polyfill');
import { COLORS } from './colors';
import { ICONS } from './icons';

const { createCanvas, loadImage, Image } = require('canvas');

const BLOCK_COUNT = 5;
const BLOCK_WIDTH = 50;
const ICON_SIZE = 30;
const ICON_COLOR = '#ffffff';
const WIDTH = BLOCK_COUNT * BLOCK_WIDTH;
const HEIGHT = 50;
const BACKGROUND_COLOR = '#AAA';

export const makeCaptcha = async () => {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  const canvasTarget = createCanvas(BLOCK_WIDTH, HEIGHT);
  const ctxTarget = canvasTarget.getContext('2d');
  const colors = getColorArray(BLOCK_COUNT);
  const icons = getIconArray(BLOCK_COUNT);

  // Background
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctxTarget.fillStyle = BACKGROUND_COLOR;
  ctxTarget.fillRect(0, 0, WIDTH, HEIGHT);

  // Generate the strip
  for (let i = 0; i < BLOCK_COUNT; i++) {
    // fill background color
    ctx.fillStyle = colors[i];
    ctx.fillRect(i * BLOCK_WIDTH, 0, BLOCK_WIDTH, HEIGHT);

    // add icon
    ctx.strokeStyle = ICON_COLOR;
    const img = icons[i];
    // ctx.drawImage(img,  i*BLOCK_WIDTH + 10, 10); // with no rotation
    rotateAndPaintImage(ctx, img, random(1,180), i*BLOCK_WIDTH + 25, 25, 15, 15)
  }

  // Generate the target
  let targetColor;
  let targetColorIndex;
  let targetIcon;
  let targetIconIndex;
  do {
    // avoid setting the default position to already picked
    [targetColor, targetColorIndex] = getRandomElement(colors);
  } while (targetColor === colors[2]);

  do {
    // avoid setting the default position to already picked
    [targetIcon, targetIconIndex] = getRandomElement(icons);
  } while (targetIcon === icons[2]);

  ctxTarget.fillStyle = targetColor;
  ctxTarget.fillRect(0, 0, WIDTH, HEIGHT);

  // const img = new Image()
  // const svg = `<svg width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 512 512"><path fill="currentColor" d="M440.5 88.5l-52 52L415 167c9.4 9.4 9.4 24.6 0 33.9l-17.4 17.4c11.8 26.1 18.4 55.1 18.4 85.6 0 114.9-93.1 208-208 208S0 418.9 0 304 93.1 96 208 96c30.5 0 59.5 6.6 85.6 18.4L311 97c9.4-9.4 24.6-9.4 33.9 0l26.5 26.5 52-52 17.1 17zM500 60h-24c-6.6 0-12 5.4-12 12s5.4 12 12 12h24c6.6 0 12-5.4 12-12s-5.4-12-12-12zM440 0c-6.6 0-12 5.4-12 12v24c0 6.6 5.4 12 12 12s12-5.4 12-12V12c0-6.6-5.4-12-12-12zm33.9 55l17-17c4.7-4.7 4.7-12.3 0-17-4.7-4.7-12.3-4.7-17 0l-17 17c-4.7 4.7-4.7 12.3 0 17 4.8 4.7 12.4 4.7 17 0zm-67.8 0c4.7 4.7 12.3 4.7 17 0 4.7-4.7 4.7-12.3 0-17l-17-17c-4.7-4.7-12.3-4.7-17 0-4.7 4.7-4.7 12.3 0 17l17 17zm67.8 34c-4.7-4.7-12.3-4.7-17 0-4.7 4.7-4.7 12.3 0 17l17 17c4.7 4.7 12.3 4.7 17 0 4.7-4.7 4.7-12.3 0-17l-17-17zM112 272c0-35.3 28.7-64 64-64 8.8 0 16-7.2 16-16s-7.2-16-16-16c-52.9 0-96 43.1-96 96 0 8.8 7.2 16 16 16s16-7.2 16-16z"/></svg>`
  // img.src = Buffer.from(svg, 'utf8')

  ctxTarget.strokeStyle = 'black';
  ctxTarget.drawImage(
    targetIcon,
    (BLOCK_WIDTH - ICON_SIZE) / 2,
    (BLOCK_WIDTH - ICON_SIZE) / 2
  );

  const [stripImage, targetImage] = await Promise.all([
    renderCanvas(canvas),
    renderCanvas(canvasTarget)
  ]);
  const captcha = {
    stripImage,
    targetImage,
    targetColorIndex,
    targetIconIndex
  };

  return captcha;
};

function random(min, max) {
  return Math.random() * (max - min) + min;
}

const renderCanvas = canvas => {
  return new Promise((res, rej) => {
    canvas.toDataURL('image/png', (err, imageData) => {
      if (err) {
        return rej(err);
      }

      res(imageData);
    });
  });
};

function rotateAndPaintImage(
  context,
  image,
  angle,
  positionX,
  positionY,
  axisX,
  axisY
) {
  const angleInRad = (Math.PI / 180) * angle;
  context.translate(positionX, positionY);
  context.rotate(angleInRad);
  context.drawImage(image, -axisX, -axisY);
  context.rotate(-angleInRad);
  context.translate(-positionX, -positionY);
}

const getIconArray = size => {
  const randomIcons = [];
  const iconArray = [...ICONS];
  for (let i = 0; i < size; i++) {
    const [svg, index] = getRandomElement(iconArray);
    iconArray.splice(index, 1); // remove so we don't get it again later;

    const img = new Image();
    img.src = Buffer.from(svg, 'utf8');

    randomIcons.push(img);
  }

  return randomIcons;
};

const getColorArray = size => {
  const randomColors = [];
  const colorArray = [...COLORS]; //copy it
  for (let i = 0; i < size; i++) {
    const [col, index] = getRandomElement(colorArray);
    colorArray.splice(index, 1);
    randomColors.push(col);
  }

  return randomColors;
};

const getRandomElement = array => {
  const index = Math.floor(Math.random() * array.length);
  const value = array[index];

  return [value, index];
};

import { COLORS } from './colors';
const { createCanvas, loadImage } = require('canvas');

const BLOCK_COUNT = 5;
const BLOCK_WIDTH = 50;
const WIDTH = BLOCK_COUNT * BLOCK_WIDTH;
const HEIGHT = 50;
const BACKGROUND_COLOR = '#AAA';

export const makeCaptcha = () => {
  return new Promise((res, rej) => {
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');
    const colors = getColorArray(BLOCK_COUNT);

    // Background
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    for (let i = 0; i < BLOCK_COUNT; i++) {
      ctx.fillStyle = colors[i];
      ctx.fillRect(i * BLOCK_WIDTH, 0, BLOCK_WIDTH, HEIGHT);
    }

    canvas.toDataURL('image/png', (err, imageData) => {
      if (err) {
        return rej(err);
      }
      let targetColor;
      let targetIndex
      do { // avoid setting the default position to already picked
       [targetColor, targetIndex] = getRandomElement(colors);
      } while (targetColor === colors[2])
      res({
        image: imageData,
        targetColor,
        targetIndex
      });
    });
  });
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

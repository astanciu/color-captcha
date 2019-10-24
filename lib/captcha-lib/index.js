import { makeCaptcha } from './makeCaptcha';
import { store } from './store';

export const get = async (req, res) => {
  try {
    const captcha = await makeCaptcha();
    captcha.id = Math.random()
      .toString(36)
      .substring(2, 15);
    
    // TODO: Expire captchas in the store
    captcha.createdAt = Math.round(new Date().getTime() / 1000);
    captcha.useColor = Math.random() >= 0.5;

    store.set(captcha.id, captcha);

    res.json({
      stripImage: captcha.stripImage,
      targetImage: captcha.targetImage,
      use: captcha.useColor ? 'color' : 'icon',
      id: captcha.id
    });
  } catch (err) {
    console.log(err)
    res.status(400).json({ error: err.message });
  }
};

export const post = (req, res) => {
  const { id, index } = req.body;

  if (!id || typeof index === 'undefined') {
    return res
      .status(400)
      .send({ error: 'Missing id or index parameters in body' });
  }

  if (!store.has(id)) {
    return res.status(200).json({
      error: 'Captcha Failed - id not found' // remove description in prod
    });
  }

  const captcha = store.get(id);
  store.delete(id);
  let match;
  if (captcha.useColor){
    match = captcha.targetColorIndex === index
  }else {
    match = captcha.targetIconIndex === index
  }

  if (match) {
    return res.status(200).send({ success: true });
  } else {
    return res.status(200).send({ error: 'Captcha Failed - wrong match' }); // remove description
  }
};

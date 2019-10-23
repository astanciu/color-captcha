import { makeCaptcha } from './makeCaptcha';
import { store } from './store';

// // for testing
// store.set('test123', {
//   id: 'test123',
//   targetIndex: 99
// });

export const get = async (req, res) => {
  try {
    const captcha = await makeCaptcha();
    captcha.id = Math.random()
      .toString(36)
      .substring(2, 15);
    captcha.createdAt = Math.round(new Date().getTime() / 1000);

    store.set(captcha.id, captcha);

    res.json({
      image: captcha.image,
      targetColor: captcha.targetColor,
      id: captcha.id
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const post = (req, res) => {
  const { id, index } = req.body;
  console.log(req.body);
  if (!id || (typeof index === 'undefined')) {
    return res.status(400).send({error: 'Missing id or index parameters in body'});
  }

  if (!store.has(id)) {
    return res.status(200).json({
      error: 'Captcha Failed - id not found' // remove description in prod
    });
  }

  const captcha = store.get(id);
  store.delete(id);
  console.log(`checking `, captcha);
  if (captcha.targetIndex === index) {
    return res.status(200).send({ success: true });
  } else {
    return res.status(200).send({ error: 'Captcha Failed - wrong color' }); // remove description
  }
};

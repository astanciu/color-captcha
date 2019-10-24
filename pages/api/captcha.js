import { get, post } from '../../lib/captcha-lib'

export default (req, res) => {
  if (req.method === 'GET') {
    return get(req, res)
  } else if  (req.method === 'POST') {
    return post(req, res)
  } else (
    res.status(200).send('Invalid Method')
  )
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const body = req.body;

  const userText =
    body?.request?.intent?.slots?.text?.value ||
    body?.request?.intent?.name ||
    'Hola';

  const response = {
    version: "1.0",
    response: {
      outputSpeech: {
        type: "PlainText",
        text: "Dijiste: " + userText
      },
      shouldEndSession: false
    }
  };

  res.status(200).json(response);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const body = req.body;

  const userText =
    body?.request?.intent?.slots?.text?.value ||
    body?.request?.intent?.name ||
    'Hola';

  const VF_API_KEY = "TU_API_KEY_DE_VOICEFLOW";

  const vfRes = await fetch(
    "https://general-runtime.voiceflow.com/state/user123/interact",
    {
      method: "POST",
      headers: {
        "Authorization": VF_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        request: {
          type: "text",
          payload: userText
        }
      })
    }
  );

  const vfData = await vfRes.json();

  const reply =
    vfData.find(r => r.type === "text")?.payload?.message ||
    "No entendí";

  res.status(200).json({
    version: "1.0",
    response: {
      outputSpeech: {
        type: "PlainText",
        text: reply
      },
      shouldEndSession: false
    }
  });
}

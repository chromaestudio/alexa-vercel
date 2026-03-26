export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const body = req.body;

    // 🧠 Mejor detección del texto del usuario
    let userText = 'Hola';

    if (body.request.type === "IntentRequest") {
      userText =
        body.request.intent.slots?.text?.value ||
        body.request.intent.name ||
        'Hola';
    } else if (body.request.type === "LaunchRequest") {
      userText = "hola";
    }

    // 🧠 ID único del usuario (memoria real)
    const userId = body?.session?.user?.userId || "default";

    // 🚪 Salida inteligente
    const exitWords = ['salir', 'adiós', 'terminar', 'cancelar', 'nos vemos', 'hasta luego'];

    if (exitWords.includes(userText.toLowerCase())) {
      return res.status(200).json({
        version: "1.0",
        response: {
          outputSpeech: {
            type: "SSML",
            ssml: `<speak><prosody rate="95%">Hasta luego. Fue un gusto ayudarte.</prosody></speak>`
          },
          shouldEndSession: true
        }
      });
    }

    // 🔑 API KEY (deja la tuya)
    const VF_API_KEY = "TU_API_KEY_DE_VOICEFLOW";

    // 🔗 Llamada a Voiceflow (con memoria)
    const vfRes = await fetch(
      `https://general-runtime.voiceflow.com/state/${userId}/interact`,
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

    let reply =
      vfData.find(r => r.type === "text")?.payload?.message ||
      "No estoy seguro de cómo responder a eso.";

    // 🧠 Limpieza para voz (menos texto “robot”)
    reply = reply
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // 🔊 Limitar longitud para Alexa
    if (reply.length > 220) {
      reply = reply.substring(0, 220) + "...";
    }

    // 🎙️ Voz más natural con pausas
    const ssmlReply = `
      <speak>
        <prosody rate="95%">
          ${reply}
        </prosody>
        <break time="300ms"/>
      </speak>
    `;

    return res.status(200).json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "SSML",
          ssml: ssmlReply
        },
        shouldEndSession: false
      }
    });

  } catch (error) {
    return res.status(200).json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "SSML",
          ssml: `<speak>Hubo un problema. Intenta nuevamente.</speak>`
        },
        shouldEndSession: false
      }
    });
  }
}

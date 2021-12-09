const { exec } = require("child_process");

const express = require('express');
const bodyParser = require('body-parser')
const app = express();
app.use(bodyParser.json())

app.post('/vegeta', (req, res) => {
  const { url, body, headers, method, duration, rate } = req.body;

  const durationArgument = `-duration=${duration}s`
  const rateArgument = `-rate=${rate}`

  for (const key in headers) {
    const headerValue = headers[key];
    headers[key] = [headerValue];
  }

  const jsonAttack = `'{method: "${method.toUpperCase()}", url: "${url}", body: ${JSON.stringify(body)} | @base64, header: ${JSON.stringify(headers)}}'`

  const command = `jq -ncM ${jsonAttack} | vegeta attack -format=json ${durationArgument} ${rateArgument} | vegeta report -type=json`

  exec(command, (error, stdout, stderr) => {
    if (error) {
        return res.status(500).send(error.message.replace(/(\r\n|\n|\r)/gm, "<br>"));
    }
    if (stderr) {
        return res.status(400).send(stderr.replace(/(\r\n|\n|\r)/gm, "<br>"));
    }

    return res.send(stdout);

  });
});


app.listen(3000, () => console.log('server running on port 3000'));
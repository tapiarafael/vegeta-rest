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

    stdout = JSON.parse(stdout);

    let latenciesInSeconds = {}
    let resultInSeconds = stdout.duration;
    let waitInSeconds = stdout.wait;

    for (const key in stdout.latencies) {
      const value = stdout.latencies[key];
      let time = value/1000000000;  
      latenciesInSeconds[key] = time < 1 ? time = (value/1000000).toFixed(4) + "ms" : time.toFixed(4) + "s";
    }

    let time = resultInSeconds/1000000000;  
    resultInSeconds = time < 1 ? time = (resultInSeconds/1000000).toFixed(4) + "ms" : time.toFixed(4) + "s";
    
    time = waitInSeconds/1000000000;  
    waitInSeconds = time < 1 ? time = (waitInSeconds/1000000).toFixed(4) + "ms" : time.toFixed(4) + "s";

    const resultsInSeconds = {
      ...stdout,
      latencies: latenciesInSeconds,
      duration: resultInSeconds,
      wait: waitInSeconds
    }

    return res.json(resultsInSeconds);

  });
});


app.listen(3000, () => console.log('server running on port 3000'));
const { Configuration, OpenAIApi } = require("openai");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const operandClient = require("@operandinc/sdk").operandClient;
const indexIDHeaderKey = require("@operandinc/sdk").indexIDHeaderKey;
const ObjectService = require("@operandinc/sdk").ObjectService;

// Open AI Configuration
const configuration = new Configuration({
  organization:"org-1p7GvlWXr8d3WA4Lmizx01Xs",
  apiKey:"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",
});
const openai = new OpenAIApi(configuration);

// Express Configuration
const app = express();
const port = 3080;

app.use(bodyParser.json());
app.use(cors());
app.use(require("morgan")("dev"));

// Routing

// Primary Open AI Route
app.post("/", async (req, res) => {
  const { message } = req.body;

  const runIndex = async () => {
    const operand = operandClient(
      ObjectService,
      "sorv42hfj2u3fwqxsl43tqf69i4a3y2cubw8",
      "https://api.operand.ai",
      {
        [indexIDHeaderKey]: "tr8tgvnmn3br",
      }
    );

    try {
      const results = await operand.searchWithin({
        query: `${message}`,
        limit: 5,
      });

      if (results) {
        return results.matches.map((m) => `- ${m.content}`).join("\n");
      } else {
        return "";
      }
    } catch (error) {
      console.log(error);
    }
  };

  let operandSearch = await runIndex(message);

  const basePromptPrefix = `This is a conversation between the EBGPT and a stranger.\nRelevant information that EBGPT knows:\n${operandSearch}`;

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `${basePromptPrefix}\n\nStranger:${message}\n\nEB:`,
    max_tokens: 256,
    temperature: 0,
  });
  res.json({
    message: response.data.choices[0].text,
  });
});

// Get Models Route

// Start the server
app.listen(port, () => {
  console.log(`server running`);
});

module.exports = app;

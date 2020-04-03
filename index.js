const axios = require("axios");

const BLUE = 3447003;
const RED = 15158332;
const GREEN = 3066993;

const addFeild = (inline = false) => name => value => ({ inline, name, value });

module.exports.subscribeDiscord = function(event, context) {
  const build = eventToBuild(event.data);
  const status = ["WORKING", "SUCCESS", "FAILURE", "INTERNAL_ERROR", "TIMEOUT"];

  if (!status.includes(build.status)) return;

  const buildStatus = build.status;
  const substitutions = build.substitutions;
  const branch = substitutions.BRANCH_NAME;
  const repo = substitutions.REPO_NAME;
  const commit = substitutions.COMMIT_SHA;
  const commitUrl = `https://github.com/radiuszon/${repo}/commit/${commit}`;
  const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

  const inlineField = addFeild(true);

  fetchGitMessage(commit).then(result => {
    axios.post(DISCORD_WEBHOOK_URL, {
      embeds: [
        {
          color: getColor(buildStatus),
          fields: [
            inlineField("Repo")(repo),
            inlineField("Branch")(branch),
            inlineField("Status")(buildStatus),
            addFeild()("Commit")(getMessage(result))
          ]
        }
      ]
    });
  });
};

const eventToBuild = data => {
  return JSON.parse(Buffer.from(data, "base64").toString());
};

const getColor = statusIndex =>
  ({ SUCCESS: GREEN, WORKING: BLUE }[statusIndex] || RED);

const getMessage = result => {
  try {
    return result.data.data.repository.object.message;
  } catch (error) {
    return error;
  }
};

const fetchGitMessage = commitSha =>
  axios.post(
    "https://api.github.com/graphql",
    {
      query: `{
      repository(owner:"radiuszon",name:"nimble-web") {
        object(oid: "${commitSha}") {
          ... on Commit {
            message
          }
        }
      }
    }`
    },
    {
      headers: {
        Authorization: `bearer ${process.env.GITHUB_API_TOKEN}`
      }
    }
  );

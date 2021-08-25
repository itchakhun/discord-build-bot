import axios from "axios";
import { CloudFunction, CloudFunctionEvent, StatusString } from "./interfaces";

enum Colors {
  GREY = 9545382,
  BLUE = 39393,
  RED = 16333359,
  GREEN = 53606,
  YELLOW = 16302848,
}

type ColorString = keyof typeof Colors;

enum Images {
  WORKING = "https://img.icons8.com/color/2x/info.png",
  FAILURE = "https://img.icons8.com/flat_round/2x/stop.png",
  WARNING = "https://img.icons8.com/flat_round/2x/pause.png",
  SUCCESS = "https://img.icons8.com/flat_round/2x/checkmark.png",
}

const addFeild = (inline = false) => (name: string) => (value: string) => ({
  inline,
  name,
  value,
});

export const subscribeDiscord: CloudFunction = (event): void => {
  const build = eventToBuild(event.data);
  const status = [
    "WORKING",
    "SUCCESS",
    "FAILURE",
    "INTERNAL_ERROR",
    "TIMEOUT",
    "CANCELLED",
  ];

  if (!status.includes(build.status)) return;

  const buildStatus = build.status;
  const substitutions = build.substitutions;
  const logUrl = build.logUrl;
  const branch = substitutions.BRANCH_NAME;
  const repo = substitutions.REPO_NAME;
  const commit = substitutions.COMMIT_SHA;
  const owner = process.env.OWNER_NAME;
  const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

  const inlineField = addFeild(true);

  fetchGitMessage({ commit, repo, owner }).then(result => {
    const thumbnail = getThumbnail(buildStatus);
    const color = getColor(buildStatus);
    const title = `${repo}(${branch}) is ${capitalized(buildStatus)}`;
    axios
      .post(DISCORD_WEBHOOK_URL, {
        embeds: [
          {
            title,
            color,
            thumbnail,
            fields: [
              inlineField("Repo")(repo),
              inlineField("Branch")(branch),
              inlineField("Status")(buildStatus),
              addFeild()("See log")(logUrl),
              addFeild()("Commit")(getMessage(result)),
            ],
          },
        ],
      })
      .catch(e => {
        console.error(e.response.message);
      });
  });
};

const eventToBuild = (data: string): CloudFunctionEvent => {
  return JSON.parse(Buffer.from(data, "base64").toString());
};

const getColor = (status: StatusString): ColorString => {
  const colorSet = {
    SUCCESS: Colors.GREEN,
    WORKING: Colors.BLUE,
    CANCELLED: Colors.GREY,
  };
  return colorSet[status] || Colors.YELLOW;
};

const getThumbnail = (status: StatusString) => {
  return {
    url: Images[status] || Images.WARNING,
    width: 64,
    height: 64,
  };
};

const getMessage = result => {
  try {
    return result.data.data.repository.object.message;
  } catch (error) {
    return error;
  }
};

const fetchGitMessage = ({ commit, repo, owner }) =>
  axios.post(
    "https://api.github.com/graphql",
    {
      query: `{
      repository(owner:"${owner}",name:"${repo}") {
        object(oid: "${commit}") {
          ... on Commit {
            message
          }
        }
      }
    }`,
    },
    {
      headers: {
        Authorization: `bearer ${process.env.GITHUB_API_TOKEN}`,
      },
    }
  );

const capitalized = (textString: string) => {
  return `${textString[0].toUpperCase()}${textString.toLowerCase().slice(1)}`;
};

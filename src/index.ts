import axios from 'axios';
import * as discord from './discord';
import { fetchGitMessage, getMessage } from './github';
import { CloudFunction, CloudFunctionEvent } from './interfaces';

const addFeild =
  (inline = false) =>
  (name: string) =>
  (value: string) => ({
    inline,
    name,
    value,
  });

const eventToBuild = (data: string): CloudFunctionEvent => {
  return JSON.parse(Buffer.from(data, 'base64').toString());
};

export const subscribeDiscord: CloudFunction = (event): void => {
  const build = eventToBuild(event.data);
  const status = [
    'WORKING',
    'SUCCESS',
    'FAILURE',
    'INTERNAL_ERROR',
    'TIMEOUT',
    'CANCELLED',
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
    const thumbnail = discord.getThumbnail(buildStatus);
    const color = discord.getColor(buildStatus);
    const title = discord.getTitle({ repo, branch, status: buildStatus });
    axios
      .post(DISCORD_WEBHOOK_URL, {
        embeds: [
          {
            title,
            color,
            thumbnail,
            fields: [
              inlineField('Repo')(repo),
              inlineField('Branch')(branch),
              inlineField('Status')(buildStatus),
              addFeild()('See log')(logUrl),
              addFeild()('Commit')(getMessage(result)),
            ],
          },
        ],
      })
      .catch(e => {
        console.error(e.response.message);
      });
  });
};

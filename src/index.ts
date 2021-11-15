import axios from 'axios';
import * as discord from './discord';
import { fetchGitMessage, getRepository } from './github';
import { CloudFunction, CloudFunctionEvent } from './interfaces';

interface AddFieldReturn {
  inline: boolean;
  name: string;
  value: string;
}

const addField =
  (inline = false) =>
  (nameOrValue: string, value?: string) => ({
    inline,
    name: value ? nameOrValue : '',
    value: value || nameOrValue,
  });

const eventToBuild = (data: string): CloudFunctionEvent => {
  return JSON.parse(Buffer.from(data, 'base64').toString());
};

const sendDiscordMessage = async (embeds: { fields: AddFieldReturn[] }[]) => {
  try {
    await axios.post(process.env.DISCORD_WEBHOOK_URL, {
      embeds,
    });
  } catch (error) {
    console.error(error);
  }
};

export const subscribeDiscord: CloudFunction = async event => {
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

  const inlineField = addField(true);
  const blockField = addField();

  const log = discord.getUrl('See log', logUrl);

  try {
    const result = await fetchGitMessage({ commit, repo, owner });
    const { author: githubAuthor, message } = getRepository(result);

    const fields = [
      blockField(message),
      inlineField('Repo', repo),
      inlineField('Branch', branch),
      inlineField('Status', buildStatus),
      inlineField('Log', log),
    ];

    const color = discord.getColor(buildStatus);
    const title = discord.getTitle({ repo, branch, status: buildStatus });
    const thumbnail = discord.getThumbnail(buildStatus);
    const author = {
      name: githubAuthor.name,
      icon_url: githubAuthor.avatarUrl,
    };
    const embeds = [
      {
        title,
        color,
        thumbnail,
        author,
        fields,
      },
    ];

    await sendDiscordMessage(embeds);
  } catch (error) {
    console.error(error);
  }
};

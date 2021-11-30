import axios, { AxiosResponse } from 'axios';
import * as moment from 'moment-timezone';
import * as discord from './discord';
import { fetchGitMessage, getRepository, isError } from './github';
import {
  CloudFunction,
  CloudFunctionEvent,
  CommitResponse,
} from './interfaces';

moment.locale('th');

interface AddFieldReturn {
  inline?: boolean;
  name: string;
  value: string;
}

const addField =
  (inline = false) =>
  (nameOrValue: string, value?: string) => ({
    inline,
    name: value ? nameOrValue : undefined,
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

  const { substitutions, finishTime, startTime } = build;
  const buildId = build.id.split('-')[0];
  const buildStatus = build.status;
  const logUrl = build.logUrl;
  const branch = substitutions.BRANCH_NAME;
  const tag = substitutions.TAG_NAME;
  const repo = substitutions.REPO_NAME;
  const commit = substitutions.COMMIT_SHA;
  const owner = process.env.OWNER_NAME;

  const inlineField = addField(true);

  const log = discord.getUrl('See log', logUrl);

  try {
    const result = await fetchGitMessage({ commit, repo, owner });
    if (isError(result)) throw new Error(result.data.errors[0].message);
    const {
      author: githubAuthor,
      message: description,
      committedDate,
    } = getRepository(result as AxiosResponse<CommitResponse>);

    const BKK_TIMEZONE = 'Asia/Bangkok';
    const mDate = moment(committedDate);
    const committedAt = mDate.tz(BKK_TIMEZONE).calendar();
    const buildTime = finishTime ? moment(startTime).fromNow(true) : '-';
    const inlineBranch = inlineField('Branch', branch);
    const inlineTag = inlineField('Tag', tag);
    const target = branch || tag;

    const fields = [
      inlineField('Committed at', committedAt),
      inlineField('Build time', buildTime),
      inlineField('Build ID', buildId),
      inlineField('Repo', repo),
      branch ? inlineBranch : inlineTag,
      inlineField('Status', buildStatus),
      inlineField('Log', log),
    ];

    const color = discord.getColor(buildStatus);
    const title = discord.getTitle({ repo, target, status: buildStatus });
    const thumbnail = discord.getThumbnail(buildStatus);
    const author = {
      name: githubAuthor.name,
      icon_url: githubAuthor.avatarUrl,
    };
    const embeds = [
      {
        title,
        description,
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

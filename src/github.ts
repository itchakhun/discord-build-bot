import axios, { AxiosPromise, AxiosResponse } from 'axios';
import { CommitResponse } from './interfaces';

export const getMessage = (result: AxiosResponse<CommitResponse>): string => {
  try {
    return result.data.data.repository.object.message;
  } catch (error) {
    return error;
  }
};

export const fetchGitMessage = ({
  commit,
  repo,
  owner,
}: {
  [k: string]: string;
}): AxiosPromise<CommitResponse> => {
  return axios.post(
    'https://api.github.com/graphql',
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
};

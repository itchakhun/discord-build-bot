import axios, { AxiosPromise, AxiosResponse } from 'axios';
import { CommitResponse } from './interfaces';

type Repo = CommitResponse['data']['repository']['object'];

export const getRepository = (result: AxiosResponse<CommitResponse>): Repo => {
  try {
    return result.data.data.repository.object;
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
            author {
              avatarUrl
              name
            }
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

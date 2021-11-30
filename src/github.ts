import axios, { AxiosPromise, AxiosResponse } from 'axios';
import { CommitResponse, ErrorResponse } from './interfaces';

type Repo = CommitResponse['data']['repository']['object'];

export const isError = (
  payload: AxiosResponse<CommitResponse | ErrorResponse>
): payload is AxiosResponse<ErrorResponse> => {
  return 'errors' in payload.data;
};

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
}): AxiosPromise<CommitResponse | ErrorResponse> => {
  const query = `{
      repository(owner:"${owner}",name:"${repo}") {
        object(oid: "${commit}") {
          ... on Commit {
            message
            committedDate
            author {
              avatarUrl
              name
            }
          }
        }
      }
    }`;
  console.log({ query });
  return axios.post(
    'https://api.github.com/graphql',
    {
      query,
    },
    {
      headers: {
        Authorization: `bearer ${process.env.GITHUB_API_TOKEN}`,
      },
    }
  );
};

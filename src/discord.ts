import { StatusString } from './interfaces';

enum Colors {
  GREY = 9545382,
  BLUE = 39393,
  RED = 16333359,
  GREEN = 53606,
  YELLOW = 16302848,
}

type ColorString = keyof typeof Colors;

export const getColor = (status: StatusString): ColorString => {
  const colorSet = {
    SUCCESS: Colors.GREEN,
    WORKING: Colors.BLUE,
    CANCELLED: Colors.GREY,
  };
  return colorSet[status] || Colors.YELLOW;
};

enum Images {
  WORKING = 'https://img.icons8.com/color/2x/info.png',
  FAILURE = 'https://img.icons8.com/flat_round/2x/stop.png',
  WARNING = 'https://img.icons8.com/flat_round/2x/pause.png',
  SUCCESS = 'https://img.icons8.com/flat_round/2x/checkmark.png',
}

export const getThumbnail = (
  status: StatusString
): { url: string; width: number; height: number } => {
  return {
    url: Images[status] || Images.WARNING,
    width: 64,
    height: 64,
  };
};

const capitalized = (textString: string) => {
  return `${textString[0].toUpperCase()}${textString.toLowerCase().slice(1)}`;
};

export const getTitle = ({
  repo,
  branch,
  status,
}: {
  repo: string;
  branch: string;
  status: string;
}): string => `${repo}(${branch}) is ${capitalized(status)}`;

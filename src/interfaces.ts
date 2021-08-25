enum CloudFunctionStatus {
  STATUS_UNKNOWN = "STATUS_UNKNOWN",
  QUEUED = "QUEUED",
  WORKING = "WORKING",
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  TIMEOUT = "TIMEOUT",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

export type StatusString = keyof typeof CloudFunctionStatus;

export interface CloudFunctionEvent {
  id: string;
  projectId: string;
  status: CloudFunctionStatus;
  statusDetail: string;
  // "source": {
  //   object (Source)
  // },
  // "steps": [
  //   {
  //     object (BuildStep)
  //   }
  // ],
  // "results": {
  //   object (Results)
  // },
  createTime: string;
  startTime: string;
  finishTime: string;
  timeout: string;
  images: [string];
  queueTtl: string;
  // "artifacts": {
  //   object (Artifacts)
  // },
  logsBucket: string;
  // "sourceProvenance": {
  //   object (SourceProvenance)
  // },
  buildTriggerId: string;
  // options: {
  //   object(BuildOptions);
  // };
  logUrl: string;
  substitutions: {
    [e: string]: string;
  };
  tags: [string];
  // "secrets": [
  //   {
  //     object (Secret)
  //   }
  // ],
  // timing: {
  //   string: {
  //     object(TimeSpan);
  //   };
  // };
}

interface Event {
  data: string;
}

export interface CloudFunction {
  (event: Event): void;
}

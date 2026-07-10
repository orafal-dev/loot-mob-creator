export type WikiParseResponse = {
  parse?: {
    title: string;
    pageid: number;
    text: {
      "*": string;
    };
  };
  error?: {
    code: string;
    info: string;
  };
};

export type WikiQueryResponse = {
  query?: {
    pages: Record<
      string,
      {
        title?: string;
        missing?: string;
        revisions?: Array<{
          "*": string;
        }>;
      }
    >;
  };
  error?: {
    code: string;
    info: string;
  };
};

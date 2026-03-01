import { benchmarkSuite } from "jest-bench";
import pin from "../../api/pin.js";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { jest } from "@jest/globals";
import FetchMock from "../fetchMock.js";

const data_repo = {
  repository: {
    username: "anuraghazra",
    name: "convoychat",
    stargazers: {
      totalCount: 38000,
    },
    description: "Help us take over the world! React + TS + GraphQL Chat App",
    primaryLanguage: {
      color: "#2b7489",
      id: "MDg6TGFuZ3VhZ2UyODc=",
      name: "TypeScript",
    },
    forkCount: 100,
    isTemplate: false,
  },
};

const data_user = {
  data: {
    user: { repository: data_repo.repository },
    organization: null,
  },
};

const mock = new FetchMock();
mock.onPost("https://api.github.com/graphql").reply(200, data_user);

benchmarkSuite("test /api/pin", {
  ["simple request"]: async () => {
    const req = {
      query: {
        username: "anuraghazra",
        repo: "convoychat",
      },
    } as unknown as VercelRequest;
    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    } as unknown as VercelResponse;

    await pin(req, res);
  },
});

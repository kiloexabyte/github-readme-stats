/**
 * @file Contains a simple cloud function that can be used to check if the PATs are still
 * functional.
 *
 * @description This function is currently rate limited to 1 request per 5 minutes.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { ApiResponse } from "../../src/common/utils.js";
import retryer from "../../src/common/retryer.js";
import { logger, request } from "../../src/common/utils.js";

export const RATE_LIMIT_SECONDS = 60 * 5; // 1 request per 5 minutes

/**
 * Simple uptime check fetcher for the PATs.
 */
const uptimeFetcher = (variables: any, token: string): Promise<ApiResponse> => {
  return request(
    {
      query: `
        query {
          rateLimit {
              remaining
          }
        }
        `,
      variables,
    },
    {
      Authorization: `bearer ${token}`,
    },
  );
};

type ShieldsResponse = {
  schemaVersion: number;
  label: string;
  message: "up" | "down";
  color: "brightgreen" | "red";
  isError: boolean;
};

/**
 * Creates Json response that can be used for shields.io dynamic card generation.
 *
 * @see https://shields.io/endpoint.
 */
const shieldsUptimeBadge = (up: boolean): ShieldsResponse => {
  const schemaVersion = 1;
  const isError = true;
  const label = "Public Instance";
  const message = up ? "up" : "down";
  const color = up ? "brightgreen" : "red";
  return {
    schemaVersion,
    label,
    message,
    color,
    isError,
  };
};

/**
 * Cloud function that returns whether the PATs are still functional.
 */
export default async (req: VercelRequest, res: VercelResponse) => {
  let { type } = req.query;
  type = type ? (type as string).toLowerCase() : "boolean";

  res.setHeader("Content-Type", "application/json");

  try {
    let PATsValid = true;
    try {
      await retryer(uptimeFetcher, {});
    } catch (err) {
      // Resolve eslint no-unused-vars
      err;

      PATsValid = false;
    }

    if (PATsValid) {
      res.setHeader(
        "Cache-Control",
        `max-age=0, s-maxage=${RATE_LIMIT_SECONDS}`,
      );
    } else {
      res.setHeader("Cache-Control", "no-store");
    }

    switch (type) {
      case "shields":
        res.send(shieldsUptimeBadge(PATsValid));
        break;
      case "json":
        res.send({ up: PATsValid });
        break;
      default:
        res.send(PATsValid);
        break;
    }
  } catch (err: any) {
    // Return fail boolean if something went wrong.
    logger.error(err);
    res.setHeader("Cache-Control", "no-store");
    res.send("Something went wrong: " + err.message);
  }
};

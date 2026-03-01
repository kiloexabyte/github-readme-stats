import type { AxiosRequestConfig } from "axios";
import axios from "axios";
import toEmoji from "emoji-name-map";
import wrap from "word-wrap";
import { themes } from "../../themes/index.js";

const TRY_AGAIN_LATER = "Please try again later";

const SECONDARY_ERROR_MESSAGES: Record<string, string> = {
  MAX_RETRY:
    "You can deploy own instance or wait until public will be no longer limited",
  NO_TOKENS:
    "Please add an env variable called PAT_1 with your GitHub API token in vercel",
  USER_NOT_FOUND: "Make sure the provided username is not an organization",
  GRAPHQL_ERROR: TRY_AGAIN_LATER,
  GITHUB_REST_API_ERROR: TRY_AGAIN_LATER,
  WAKATIME_USER_NOT_FOUND: "Make sure you have a public WakaTime profile",
};

/**
 * Custom error class to handle custom GRS errors.
 */
class CustomError extends Error {
  type: string;
  secondaryMessage: string;

  constructor(message: string, type: string) {
    super(message);
    this.type = type;
    this.secondaryMessage = SECONDARY_ERROR_MESSAGES[type] || type;
  }

  static MAX_RETRY = "MAX_RETRY";
  static NO_TOKENS = "NO_TOKENS";
  static USER_NOT_FOUND = "USER_NOT_FOUND";
  static GRAPHQL_ERROR = "GRAPHQL_ERROR";
  static GITHUB_REST_API_ERROR = "GITHUB_REST_API_ERROR";
  static WAKATIME_ERROR = "WAKATIME_ERROR";
}

/**
 * Auto layout utility, allows us to layout things vertically or horizontally with
 * proper gaping.
 */
const flexLayout = ({
  items,
  gap,
  direction,
  sizes = [],
}: {
  items: string[];
  gap: number;
  direction?: "column" | "row";
  sizes?: number[];
}): string[] => {
  let lastSize = 0;
  // filter() for filtering out empty strings
  return items.filter(Boolean).map((item, i) => {
    const size = sizes[i] || 0;
    let transform = `translate(${lastSize}, 0)`;
    if (direction === "column") {
      transform = `translate(0, ${lastSize})`;
    }
    lastSize += size + gap;
    return `<g transform="${transform}">${item}</g>`;
  });
};

/**
 * Creates a node to display the primary programming language of the repository/gist.
 */
const createLanguageNode = (langName: string, langColor: string): string => {
  return `
    <g data-testid="primary-lang">
      <circle data-testid="lang-color" cx="0" cy="-5" r="6" fill="${langColor}" />
      <text data-testid="lang-name" class="gray" x="15">${langName}</text>
    </g>
    `;
};

/**
 * Creates an icon with label to display repository/gist stats like forks, stars, etc.
 */
const iconWithLabel = (
  icon: string,
  label: number | string,
  testid: string,
  iconSize: number,
): string => {
  if (typeof label === "number" && label <= 0) {
    return "";
  }
  const iconSvg = `
      <svg
        class="icon"
        y="-12"
        viewBox="0 0 16 16"
        version="1.1"
        width="${iconSize}"
        height="${iconSize}"
      >
        ${icon}
      </svg>
    `;
  const text = `<text data-testid="${testid}" class="gray">${label}</text>`;
  return flexLayout({ items: [iconSvg, text], gap: 20 }).join("");
};

/**
 * Retrieves num with suffix k(thousands) precise to 1 decimal if greater than 999.
 */
const kFormatter = (num: number): string | number => {
  return Math.abs(num) > 999
    ? Math.sign(num) * parseFloat((Math.abs(num) / 1000).toFixed(1)) + "k"
    : Math.sign(num) * Math.abs(num);
};

/**
 * Checks if a string is a valid hex color.
 */
const isValidHexColor = (hexColor: string): boolean => {
  return new RegExp(
    /^([A-Fa-f0-9]{8}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{4})$/,
  ).test(hexColor);
};

/**
 * Returns boolean if value is either "true" or "false" else the value as it is.
 */
const parseBoolean = (value: string | boolean): boolean | undefined => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value.toLowerCase() === "true") {
      return true;
    } else if (value.toLowerCase() === "false") {
      return false;
    }
  }
  return undefined;
};

/**
 * Parse string to array of strings.
 */
const parseArray = (str: string): string[] => {
  if (!str) {
    return [];
  }
  return str.split(",");
};

/**
 * Clamp the given number between the given range.
 */
const clampValue = (number: number, min: number, max: number): number => {
  if (Number.isNaN(parseInt(number as any, 10))) {
    return min;
  }
  return Math.max(min, Math.min(number, max));
};

/**
 * Check if the given string is a valid gradient.
 */
const isValidGradient = (colors: string[]): boolean => {
  return (
    colors.length > 2 &&
    colors.slice(1).every((color) => isValidHexColor(color))
  );
};

/**
 * Retrieves a gradient if color has more than one valid hex codes else a single color.
 */
const fallbackColor = (
  color: string,
  fallbackColor: string | string[],
): string | string[] => {
  let gradient = null;

  let colors = color ? color.split(",") : [];
  if (colors.length > 1 && isValidGradient(colors)) {
    gradient = colors;
  }

  return (
    (gradient ? gradient : isValidHexColor(color) && `#${color}`) ||
    fallbackColor
  );
};

/**
 * Object containing card colors.
 */
export type CardColors = {
  titleColor: string;
  iconColor: string;
  textColor: string;
  bgColor: string | string[];
  borderColor: string;
  ringColor: string;
};

/**
 * Send GraphQL request to GitHub API.
 */
const request = (
  data: AxiosRequestConfig["data"],
  headers: AxiosRequestConfig["headers"],
): Promise<any> => {
  return axios({
    url: "https://api.github.com/graphql",
    method: "post",
    headers,
    data,
  });
};

/**
 * Returns theme based colors with proper overrides and defaults.
 */
const getCardColors = ({
  title_color,
  text_color,
  icon_color,
  bg_color,
  border_color,
  ring_color,
  theme,
  fallbackTheme = "default",
}: {
  title_color?: string;
  text_color?: string;
  icon_color?: string;
  bg_color?: string;
  border_color?: string;
  ring_color?: string;
  theme?: string;
  fallbackTheme?: string;
}): CardColors => {
  const defaultTheme = themes[fallbackTheme];
  const selectedTheme = themes[theme] || defaultTheme;
  const defaultBorderColor =
    selectedTheme.border_color || defaultTheme.border_color;

  // get the color provided by the user else the theme color
  // finally if both colors are invalid fallback to default theme
  const titleColor = fallbackColor(
    title_color || selectedTheme.title_color,
    "#" + defaultTheme.title_color,
  );

  // get the color provided by the user else the theme color
  // finally if both colors are invalid we use the titleColor
  const ringColor = fallbackColor(
    ring_color || selectedTheme.ring_color,
    titleColor,
  );
  const iconColor = fallbackColor(
    icon_color || selectedTheme.icon_color,
    "#" + defaultTheme.icon_color,
  );
  const textColor = fallbackColor(
    text_color || selectedTheme.text_color,
    "#" + defaultTheme.text_color,
  );
  const bgColor = fallbackColor(
    bg_color || selectedTheme.bg_color,
    "#" + defaultTheme.bg_color,
  );

  const borderColor = fallbackColor(
    border_color || defaultBorderColor,
    "#" + defaultBorderColor,
  );

  if (
    typeof titleColor !== "string" ||
    typeof textColor !== "string" ||
    typeof ringColor !== "string" ||
    typeof iconColor !== "string" ||
    typeof borderColor !== "string"
  ) {
    throw new Error(
      "Unexpected behavior, all colors except background should be string.",
    );
  }

  return { titleColor, iconColor, textColor, bgColor, borderColor, ringColor };
};

// Script parameters.
const ERROR_CARD_LENGTH = 576.5;

/**
 * Encode string as HTML.
 *
 * @see https://stackoverflow.com/a/48073476/10629172
 */
const encodeHTML = (str: string): string => {
  return str
    .replace(/[\u00A0-\u9999<>&](?!#)/gim, (i) => {
      return "&#" + i.charCodeAt(0) + ";";
    })
    .replace(/\u0008/gim, "");
};

const UPSTREAM_API_ERRORS = [
  TRY_AGAIN_LATER,
  SECONDARY_ERROR_MESSAGES.MAX_RETRY,
];

/**
 * Renders error message on the card.
 */
const renderError = (
  message: string,
  secondaryMessage = "",
  options: Record<string, any> = {},
): string => {
  const {
    title_color,
    text_color,
    bg_color,
    border_color,
    theme = "default",
  } = options;

  // returns theme based colors with proper overrides and defaults
  const { titleColor, textColor, bgColor, borderColor } = getCardColors({
    title_color,
    text_color,
    icon_color: "",
    bg_color,
    border_color,
    ring_color: "",
    theme,
  });

  return `
    <svg width="${ERROR_CARD_LENGTH}"  height="120" viewBox="0 0 ${ERROR_CARD_LENGTH} 120" fill="${bgColor}" xmlns="http://www.w3.org/2000/svg">
    <style>
    .text { font: 600 16px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${titleColor} }
    .small { font: 600 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${textColor} }
    .gray { fill: #858585 }
    </style>
    <rect x="0.5" y="0.5" width="${
      ERROR_CARD_LENGTH - 1
    }" height="99%" rx="4.5" fill="${bgColor}" stroke="${borderColor}"/>
    <text x="25" y="45" class="text">Something went wrong!${
      UPSTREAM_API_ERRORS.includes(secondaryMessage)
        ? ""
        : " file an issue at https://tiny.one/readme-stats"
    }</text>
    <text data-testid="message" x="25" y="55" class="text small">
      <tspan x="25" dy="18">${encodeHTML(message)}</tspan>
      <tspan x="25" dy="18" class="gray">${secondaryMessage}</tspan>
    </text>
    </svg>
  `;
};

/**
 * Split text over multiple lines based on the card width.
 */
const wrapTextMultiline = (
  text: string,
  width = 59,
  maxLines = 3,
): string[] => {
  const fullWidthComma = "\uFF0C";
  const encoded = encodeHTML(text);
  const isChinese = encoded.includes(fullWidthComma);

  let wrapped: string[] = [];

  if (isChinese) {
    wrapped = encoded.split(fullWidthComma); // Chinese full punctuation
  } else {
    wrapped = wrap(encoded, {
      width,
    }).split("\n"); // Split wrapped lines to get an array of lines
  }

  const lines = wrapped.map((line) => line.trim()).slice(0, maxLines); // Only consider maxLines lines

  // Add "..." to the last line if the text exceeds maxLines
  if (wrapped.length > maxLines) {
    lines[maxLines - 1] += "...";
  }

  // Remove empty lines if text fits in less than maxLines lines
  const multiLineText = lines.filter(Boolean);
  return multiLineText;
};

const noop = () => {};
// return console instance based on the environment
const logger =
  process.env.NODE_ENV === "test" ? { log: noop, error: noop } : console;

const ONE_MINUTE = 60;
const FIVE_MINUTES = 300;
const TEN_MINUTES = 600;
const FIFTEEN_MINUTES = 900;
const THIRTY_MINUTES = 1800;
const TWO_HOURS = 7200;
const FOUR_HOURS = 14400;
const SIX_HOURS = 21600;
const EIGHT_HOURS = 28800;
const TWELVE_HOURS = 43200;
const ONE_DAY = 86400;
const TWO_DAY = ONE_DAY * 2;
const SIX_DAY = ONE_DAY * 6;
const TEN_DAY = ONE_DAY * 10;

const CONSTANTS = {
  ONE_MINUTE,
  FIVE_MINUTES,
  TEN_MINUTES,
  FIFTEEN_MINUTES,
  THIRTY_MINUTES,
  TWO_HOURS,
  FOUR_HOURS,
  SIX_HOURS,
  EIGHT_HOURS,
  TWELVE_HOURS,
  ONE_DAY,
  TWO_DAY,
  SIX_DAY,
  TEN_DAY,
  CARD_CACHE_SECONDS: ONE_DAY,
  TOP_LANGS_CACHE_SECONDS: SIX_DAY,
  PIN_CARD_CACHE_SECONDS: TEN_DAY,
  ERROR_CACHE_SECONDS: TEN_MINUTES,
};

/**
 * Missing query parameter class.
 */
class MissingParamError extends Error {
  missedParams: string[];
  secondaryMessage: string | undefined;

  constructor(missedParams: string[], secondaryMessage?: string) {
    const msg = `Missing params ${missedParams
      .map((p) => `"${p}"`)
      .join(", ")} make sure you pass the parameters in URL`;
    super(msg);
    this.missedParams = missedParams;
    this.secondaryMessage = secondaryMessage;
  }
}

/**
 * Retrieve text length.
 *
 * @see https://stackoverflow.com/a/48172630/10629172
 */
const measureText = (str: string, fontSize = 10): number => {
  // prettier-ignore
  const widths = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0.2796875, 0.2765625,
    0.3546875, 0.5546875, 0.5546875, 0.8890625, 0.665625, 0.190625,
    0.3328125, 0.3328125, 0.3890625, 0.5828125, 0.2765625, 0.3328125,
    0.2765625, 0.3015625, 0.5546875, 0.5546875, 0.5546875, 0.5546875,
    0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875,
    0.2765625, 0.2765625, 0.584375, 0.5828125, 0.584375, 0.5546875,
    1.0140625, 0.665625, 0.665625, 0.721875, 0.721875, 0.665625,
    0.609375, 0.7765625, 0.721875, 0.2765625, 0.5, 0.665625,
    0.5546875, 0.8328125, 0.721875, 0.7765625, 0.665625, 0.7765625,
    0.721875, 0.665625, 0.609375, 0.721875, 0.665625, 0.94375,
    0.665625, 0.665625, 0.609375, 0.2765625, 0.3546875, 0.2765625,
    0.4765625, 0.5546875, 0.3328125, 0.5546875, 0.5546875, 0.5,
    0.5546875, 0.5546875, 0.2765625, 0.5546875, 0.5546875, 0.221875,
    0.240625, 0.5, 0.221875, 0.8328125, 0.5546875, 0.5546875,
    0.5546875, 0.5546875, 0.3328125, 0.5, 0.2765625, 0.5546875,
    0.5, 0.721875, 0.5, 0.5, 0.5, 0.3546875, 0.259375, 0.353125, 0.5890625,
  ];

  const avg = 0.5279276315789471;
  return (
    str
      .split("")
      .map((c) =>
        c.charCodeAt(0) < widths.length ? widths[c.charCodeAt(0)] : avg,
      )
      .reduce((cur, acc) => acc + cur) * fontSize
  );
};

/**
 * Lowercase and trim string.
 */
const lowercaseTrim = (name: string): string => name.toLowerCase().trim();

/**
 * Split array of languages in two columns.
 */
const chunkArray = <T>(arr: T[], perChunk: number): T[][] => {
  return arr.reduce((resultArray: T[][], item, index) => {
    const chunkIndex = Math.floor(index / perChunk);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, []);
};

/**
 * Parse emoji from string.
 */
const parseEmojis = (str: string): string => {
  if (!str) {
    throw new Error("[parseEmoji]: str argument not provided");
  }
  return str.replace(/:\w+:/gm, (emoji) => {
    return toEmoji.get(emoji) || "";
  });
};

/**
 * Get diff in minutes between two dates.
 */
const dateDiff = (d1: Date, d2: Date): number => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  const diff = date1.getTime() - date2.getTime();
  return Math.round(diff / (1000 * 60));
};

export {
  ERROR_CARD_LENGTH,
  renderError,
  createLanguageNode,
  iconWithLabel,
  encodeHTML,
  kFormatter,
  isValidHexColor,
  parseBoolean,
  parseArray,
  clampValue,
  isValidGradient,
  fallbackColor,
  request,
  flexLayout,
  getCardColors,
  wrapTextMultiline,
  logger,
  CONSTANTS,
  CustomError,
  MissingParamError,
  measureText,
  lowercaseTrim,
  chunkArray,
  parseEmojis,
  dateDiff,
};

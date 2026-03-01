import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost",
  pretendToBeVisual: true,
});

Object.defineProperty(globalThis, "window", {
  value: dom.window,
  writable: true,
});
Object.defineProperty(globalThis, "document", {
  value: dom.window.document,
  writable: true,
});
Object.defineProperty(globalThis, "navigator", {
  value: dom.window.navigator,
  writable: true,
});

import "@testing-library/jest-dom";

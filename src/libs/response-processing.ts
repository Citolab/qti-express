import { InputResponseFormat, QtiAssessmentItem, ResponseInteraction } from "@citolab/qti-components";
import * as fs from "fs";
import * as jsdom from "jsdom";
import { environment } from "../environments/environment";
import { processQtiXML } from "./lib";

const { JSDOM } = jsdom;

const qtiLibrary = fs.readFileSync(`./node_modules/@citolab/qti-components/dist/index.js`, { encoding: "utf-8" });

const itemResponses = new Map<string, ResponseInteraction[]>([]);

export const storeResponse = (itemId, response): void => {
  const itemdata = itemResponses.get(response.item) || [];
  const iteminteraction = itemdata.find((val) => val.responseIdentifier === response.value.responseIdentifier);
  if (iteminteraction) {
    // als deze interactie al bestaat, vervang de responses
    iteminteraction.response = response.value;
  } else {
    // anders zet deze nieuwe interactie erbij
    itemResponses.set(response.item, [...itemdata, response]);
  }
};

export const getResponse = (itemId): ResponseInteraction[] | null => {
  const response = itemResponses.get(itemId);
  return response ? response : [];
};

export const getScore = (packageId, itemHref, itemId): number | null => {
  const itemXML = processQtiXML(packageId, itemHref, true);
  const response = itemResponses.get(itemId);

  const { window } = new JSDOM(``, { runScripts: "dangerously" });
  const document = window.document;

  const scriptEl = document.createElement("script");
  scriptEl.textContent = qtiLibrary;
  document.body.appendChild(scriptEl);

  const div = document.createElement("div");
  div.innerHTML = itemXML;
  document.body.appendChild(div);

  const assessmentItem = document.body.querySelector("qti-assessment-item") as QtiAssessmentItem;

  assessmentItem.responses = response // responses.find((response) => response.item === item.identifier);
  assessmentItem.processResponse();

  return assessmentItem.getOutcome("SCORE").value as any;
};

export const reset = (): void => {
  itemResponses.clear();
};

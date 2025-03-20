import { QtiAssessmentItem, ResponseInteraction, VariableValue } from "@citolab/qti-components";
import * as fs from "fs";
import * as jsdom from "jsdom";
import { environment } from "../environments/environment";
import { processQtiItem } from "./lib";

const { JSDOM } = jsdom;

const qtiLibrary = fs.readFileSync(`./node_modules/@citolab/qti-components/dist/index.global.js`, { encoding: "utf-8" });

const itemVariables = new Map<string, VariableValue<string | string[] | null>[]>([]);

export const storeResponse = (itemId, response: VariableValue<string | string[] | null>[]): void => {
  itemVariables.set(itemId, response);
};

export const getResponse = (itemId): VariableValue<string | string[] | null> => {
  const response = itemVariables.get(itemId);
  return response && response.length > 0 ? response[0] : null;
};

export const getScore = (packageId, itemHref, itemId): VariableValue<string | string[]>[] => {
  const itemXML = processQtiItem(packageId, itemHref, false);
  const variables = itemVariables.get(itemId);

  const { window } = new JSDOM(``, { runScripts: "dangerously" });
  const document = window.document;

  const scriptEl = document.createElement("script");
  scriptEl.type = "text/javascript";
  scriptEl.textContent = qtiLibrary;
  document.body.appendChild(scriptEl);

  const div = document.createElement("div");
  div.innerHTML = itemXML;
  document.body.appendChild(div);

  const assessmentItem = document.body.querySelector("qti-assessment-item") as QtiAssessmentItem;

  assessmentItem.variables = variables // responses.find((response) => response.item === item.identifier);
  assessmentItem.processResponse();

  // return assessmentItem.getOutcome("SCORE").value as any;
  return assessmentItem.variables;
};

export const reset = (): void => {
  itemVariables.clear();
};

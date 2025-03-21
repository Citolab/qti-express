import express from "express";
import * as path from "path";
import cors from "cors";
import * as fs from "fs";
import {
  listPackageItems,
  listPackages,
  loadTestFromManifest,
  processQtiItem,
} from "./libs/lib";
import {
  storeResponse,
  getResponse,
  reset,
  getScore,
} from "./libs/response-processing";
import { environment } from "./environments/environment";

const app = express();
const port = environment.port;
const apiPrefix = `/api`;

app.use(cors()); // Allow CORS to enable external connections
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Route to get available packages in JSON format
app.get(`${apiPrefix}/packages.json`, (req, res) => {
  try {
    const packages = listPackages();
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve packages" });
  }
});

// Route to serve static files for a given package
app.get(`${apiPrefix}/static/:packageId/*`, (req, res) => {
  try {
    // Load the manifest data and retrieve the correct item location
    const manifestData = loadTestFromManifest(req.params.packageId);

    // Construct the correct file path based on the dynamic item location
    const itemLocation = manifestData.itemLocation;
    const filePath = path.join(itemLocation, req.params[0]);

    // Read the file from the determined location
    fs.readFile(filePath, (err, data) => {
      if (err) {
        return res.status(500).send(`Error loading ${req.params[0]}: ${err}`);
      }
      res.end(data);
    });
  } catch (error) {
    res.status(500).send(`Error processing request: ${error.message}`);
  }
});

// Route to fetch and process QTI XML for a specific item
app.get(`${apiPrefix}/:packageId/items/:itemHref`, (req, res) => {
  const { packageId, itemHref } = req.params;

  if (itemHref.endsWith(".xml")) {
    try {
      const scorebackend = req.query?.scorebackend === "true"; // Convert to boolean
      const xmlDoc = processQtiItem(packageId, itemHref, scorebackend);
      res.set("Content-Type", "text/xml");
      res.send(xmlDoc);
    } catch (error) {
      res.status(500).send({ error: "Failed to process QTI XML" });
    }
  } else {
    res
      .status(400)
      .send({ error: "Invalid file format. Only XML files are allowed." });
  }
});

// Route to get items of a specific package in JSON format
app.get(`${apiPrefix}/:packageId/items.json`, (req, res) => {
  try {
    const items = listPackageItems(req.params.packageId);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve items" });
  }
});

// Route to store response for a given item
app.post(`${apiPrefix}/response/:packageId/:itemHref`, (req, res) => {
  try {
    storeResponse(req.query.identifier, req.body);
    res.send("Response saved successfully");
  } catch (error) {
    res.status(500).json({ error: "Failed to store response" });
  }
});

// Route to retrieve response for a given item
app.get(`${apiPrefix}/response/:packageId/:itemHref`, (req, res) => {
  try {
    const response = getResponse(req.query.identifier);
    if (response) {
      res.json(response);
    } else {
      res.status(404).json({ item: req.query.identifier, interactions: [] });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve response" });
  }
});

// Route to reset all responses
app.get(`${apiPrefix}/response/reset`, (req, res) => {
  try {
    const responses = reset();
    res.json(responses);
  } catch (error) {
    res.status(500).json({ error: "Failed to reset responses" });
  }
});

// Route to get the score for a specific item
app.get(`${apiPrefix}/score/:packageId/:itemHref`, (req, res) => {
  try {
    const score = getScore(
      req.params.packageId,
      req.params.itemHref,
      req.query.identifier
    );
    res.json(score);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve score" });
  }
});

// Serve static files from the assets/public directory
app.use(express.static(path.join(__dirname, "assets/public")));

// Start server and listen on specified port
app.listen(port, () => {
  console.log(`QTI API is running on http://localhost:${port}`);
});

export default app;

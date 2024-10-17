/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import express from 'express';
import * as path from 'path';
import cors from 'cors';
import * as fs from 'fs';

import { getPackages, getXSD, itemsJson, processQtiXML, saveEditXML, validateItemXML } from './libs/lib';
import { storeResponse, getResponse, reset, getScore } from './libs/response-processing';
import { environment } from './environments/environment';

const app = express();
const port = environment.port;
const apiPrefix = `/api`;
const packagesLocation = '/packages/';

app.use(cors()); // use cors to let other sites make a connection for data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get(`${apiPrefix}/packages.json`, (req, res) => {
  const packages = getPackages();
  res.json(packages);
});

app.get(`${apiPrefix}/:packageId/static/*`, (req, res) => {
  // console.log(__dirname + packagesLocation + req.params.packageId + '/items/' + req.params[0]);

  // const param1 = req.query.packageId // params[0]
  // @ts-ignore
  const param1 = req.params[0]
  fs.readFile(__dirname + packagesLocation + req.params.packageId + '/items/' + param1, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      return res.end('Error loading ' + req.params + ' with Error: ' + err);
    }
    // res.writeHead(200, {"Content-Type": mime});
    res.end(data);
  });
  // }
});

app.get(`${apiPrefix}/:packageId/items/:itemHref`, (req, res) => {
  if (req.params.itemHref.endsWith('.xml')) {
    const xmlDoc = processQtiXML(
      req.params.packageId,
      req.params.itemHref ? req.params.itemHref : 0,
      req.query.noresponsexml
    );
    res.set('Content-Type', 'text/xml');
    res.send(xmlDoc);
  }
});

app.get(`${apiPrefix}/:packageId/items/:itemHref/validate`, (req, res) => {
  const validationErrors = validateItemXML(req.params.packageId, req.params.itemHref ? req.params.itemHref : 0);
  res.json(validationErrors);
});
// app.get(`${api}/:packageId/assessmenttest.xml`, (req, res) => {
//   const assessmenttest = getAssessmentTest(req.params.packageId);
//   res.set('Content-Type', 'text/xml');
//   res.send(assessmenttest);
// });
app.get(`${apiPrefix}/:packageId/items.json`, (req, res) => {
  const items = itemsJson(req.params.packageId);
  res.json(items);
});
app.post(`${apiPrefix}/saveeditxml/:packageId/:itemHref`, (req, res) => {
  const success = saveEditXML(req.params.packageId, req.params.itemHref, req.body.edittedxml);
  success ? res.send('saved') : res.status(400).send({ message: 'Not found' });
});
app.get(`${apiPrefix}/qti.xsd`, (req, res) => {
  const xsd = getXSD();
  res.set('Content-Type', 'text/xml');
  res.send(xsd);
});
app.post(`${apiPrefix}/response/:packageId/:itemHref`, (req, res) => {
  storeResponse(req.query.identifier, req.body);
  res.send('saved');
});
app.get(`${apiPrefix}/response/:packageId/:itemHref`, (req, res) => {
  const itemResponse = getResponse(req.query.identifier);
  if (itemResponse) {
    res.json(itemResponse);
  } else {
    res.status(404).send({
      item: req.query.identifier,
      interactions: [],
    });
  }
});
app.get(`${apiPrefix}/response/reset`, (req, res) => {
  const responses = reset();
  res.json(responses);
});
app.get(`${apiPrefix}/score/:packageId/:itemHref`, (req, res) => {
  const score = getScore(req.params.packageId, req.params.itemHref ? req.params.itemHref : 0, req.query.identifier);
  res.json(score);
});

// import { exportPDF } from './libs/export-pdf';
// app.get(`${api}/:packageId/pdf`, exportPDF);

// import { uploadPackage } from './libs/upload-package';
// import * as multer from 'multer';
// const upload = multer({ dest: './tmp' });
// app.post('/upload', upload.single('package'), uploadPackage);

// pk: this should come at the end, rewrites all urls to file in public
// PUBLIC IS NOT A PUBLIC STATIC FOLDER ANYMORE
app.use(express.static(path.join(__dirname, 'assets/public')));
// app.get(`${api}/:packageId/*', (req, res) => {
//   console.log(req.params);
//   fs.readFile(__dirname + packagesLocation + req.params.packageId + '/' + req.params[0], (err, data) => {
//     if (err) {
//       res.writeHead(500, { 'Content-Type': 'text/plain' });
//       return res.end('Error loading ' + req.params + ' with Error: ' + err);
//     }
//     // res.writeHead(200, {"Content-Type": mime});
//     res.end(data);
//   });
// });

app.listen(port, () => console.log(`QTI Api listening on port localhost:${port} `));

export default app;

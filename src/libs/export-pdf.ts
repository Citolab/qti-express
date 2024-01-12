
// import * as puppeteer from 'puppeteer';

// import { environment } from '../environments/environment';

// export const exportPDF = (req, res) => {
//     (async () => {
//       const browser = await puppeteer.launch({ headless: true });
//       const page = await browser.newPage();
//       await page.goto(environment.app + '/overview/' + req.params.packageId, {
//         waitUntil: 'networkidle0',
//       });
//       const buffer = await page.pdf({
//         format: 'A4',
//         printBackground: false,
//       });
//       res.type('application/pdf');
//       res.send(buffer);
//       browser.close();
//     })();
//   }
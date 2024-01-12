// import * as libxslt from 'libxslt';
import * as path from 'path';
import * as fs from 'fs';
// import { qtiConvert } from '@citolab/qti-convert';

const packages = path.resolve(__dirname, '../packages/') + '/';
const itemsfolder = 'items/';

// function getAssessmentTextXML(content, packageId) {
//   const qtiNamespaces = [
//     'http://www.imsglobal.org/xsd/imsqti_v2p1',
//     'http://www.imsglobal.org/xsd/imsqti_v2p2',
//     'http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1',
//   ];
//   const testNamespaces = ['imsqti_test_xmlv2p1', 'imsqti_test_xmlv2p2', 'imsqti_test_xmlv3p0'];

//   content = getImsmanifestXML(packageId);

//   if (content) {
//     try {
//       const $ = cheerio.xml(content)
//       const xmlDoc = libxmljs.parseXml(content);
//       const allNamespaces = xmlDoc.root().namespaces();
//       const myQTINamespace = allNamespaces.find((ns) => ns.prefix() === null).href();
//       const myTestNamespace = testNamespaces[qtiNamespaces.findIndex((ns) => ns === myQTINamespace)];
//       const testNode: libxmljs.Attribute = xmlDoc.get(
//         "//n:resources/n:resource[@type='" + myTestNamespace + "']/@href",
//         {
//           n: xmlDoc.root().namespace().href(),
//         }
//       );
//       const assessmenttest = fs.readFileSync(packages + packageId + '/' + testNode.value(), 'utf8');

//       return {
//         content: assessmenttest,
//         location: testNode.value().split('/')[0],
//       };
//     } catch (err) {
//       console.log(err);
//     }
//   }
// }

// function getImsmanifestXML(packageId) {
//   const manifestLocation = packages + packageId + '/imsmanifest.xml';
//   let content = null;
//   try {
//     if (fs.existsSync(manifestLocation)) {
//       try {
//         content = fs.readFileSync(manifestLocation, 'utf8');
//       } catch (err) {
//         console.error(err);
//       }
//     }
//   } catch (err) {
//     console.error(err);
//   }
//   return content;
// }

export const processQtiXML = (packageId, itemHref, noresponsexml) => {
  let xmlString = getItem(packageId, itemHref);
  // xmlString = xslCustomTypes.apply(xmlString);

  // if (noresponsexml === 'true') {
  //   xmlString = xslStripResponse.apply(xmlString);
  // }
  // xmlString = qtiConvert(xmlString).qti2To3().xml();

  return xmlString;
};

/* ------------------------------------------------------------------------------------------ */

function getItem(qtipackage, itemIndex) {
  // const imsmanifest = getImsmanifestXML(qtipackage);

  const assessmenttestlocation = 'items';
  // if (imsmanifest !== null) {
  // FIXME: pk should get the location of the href of the item <qti-assessment-item-ref href="G6HG5e.xml" category="ItemFunctionalType_Regular" identifier="ITM-G6HG5e">
  //   assessmenttestlocation = getAssessmentTextXML(imsmanifest.content, qtipackage).location;
  // }

  const files = getItemFiles(packages + '/' + qtipackage + '/' + assessmenttestlocation);
  let fileName = '';
  if (files.indexOf(itemIndex) > -1) {
    fileName = itemIndex;
  } else {
    throw new Error('Not a valid index for an item, use xml/itemname.xml');
  }
  return fs.readFileSync(packages + '/' + qtipackage + '/' + assessmenttestlocation + '/' + fileName, 'utf8');
}

function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path + '/' + file).isDirectory();
  });
}

// Reads files from filelocation and returns an array with files
function getItemFiles(fileLocation) {
  const files = [];
  fs.readdirSync(fileLocation).forEach((file) => {
    files.push(file);
  });
  return files;
}

export const validateItemXML = (packageId, itemHref) => {
  // let xmlString = processQtiXML(packageId, itemHref, false);
  // // // Redefine schemalocation for xsd checking
  // const QTIComponentsSchema = 'xsi:schemaLocation="lab:QTI.Namespace ../../../xsd/QTIComponents.xsd"';

  // const regex1 = /xsi:schemaLocation="([^"]*)"/gm;

  // if (xmlString.match(regex1)) {
  //   xmlString.replace(regex1, QTIComponentsSchema);
  // } else {
  //   xmlString = xmlString.replace('<qti-assessment-item', '<qti-assessment-item ' + QTIComponentsSchema);
  // }

  // // Redefine namespace for xsd checking
  // const QTIComponentsNamespace = 'xmlns="lab:QTI.Namespace"';

  // const regex2 = /xmlns="([^"]*)"/gm;

  // if (xmlString.match(regex2)) {
  //   xmlString = xmlString.replace(regex2, QTIComponentsNamespace);
  // }

  // // validate
  // const xmlDoc = libxmljs.parseXml(xmlString);
  // // xmlDoc.validate(xsdQTIComponents);
  // const validationErrors = xmlDoc.validationErrors.map((err) => {
  //   return { message: err.message };
  // });

  // return validationErrors;
};

export function itemsJson(packageId) {
  // IN THE STORY WE CHECK FIRST IF WE DO NOT HAVE AN ASSESSMENT XML
  // let files;
  // try {
    // const imsmanifest = getImsmanifestXML(packageId);
    // const assessmenttest = getAssessmentTextXML(imsmanifest.content, packageId);
    // const xmlDoc = libxmljs.parseXml(assessmenttest.content);
    // const testNodes = xmlDoc.find(
    //   '//n:qti-assessment-test/n:qti-test-part/n:qti-assessment-section/n:qti-assessment-item-ref',
    //   {
    //     n: xmlDoc.root().namespace().href(),
    //   }
    // );
    // files = testNodes.map((t) => ({
    //   href: (t as libxmljs.Element).attr('href').value(),
    //   identifier: (t as libxmljs.Element).attr('identifier').value(),
    // }));
  // } catch (e) {
   const files = getItemFiles(packages + '/' + packageId + '/items')
      .filter((file) => file.endsWith('xml'))
      .map((file, index) => ({ href: encodeURI(file), identifier: `file${index}${encodeURI(file)}` }));
  // }
  return { items: files };
}

// export function getAssessmentTest(packageId): string {
//   const imsmanifest = getImsmanifestXML(packageId);
//   const assessmenttest = getAssessmentTextXML(imsmanifest, packageId).content;
//   return assessmenttest;
// }

export function saveEditXML(packageId, itemHref, XML): boolean {
  if (fs.existsSync(packages + '/' + packageId + '/' + itemsfolder + itemHref)) {
    fs.writeFileSync(packages + '/' + packageId + '/' + itemsfolder + itemHref, XML);
    return true;
  } else {
    return false;
  }
}

export const getPackages = (): { packages: string[] } => {
  const directories = getDirectories(packages);
  return { packages: directories };
};

export const getXSD = (): string => {
  const xmlString = fs.readFileSync(path.resolve(__dirname, './assets/xsd/qticomponents.xsd'), 'utf8');
  return xmlString;
};

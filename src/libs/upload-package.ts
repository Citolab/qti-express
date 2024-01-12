// import * as unzipper from 'unzipper';
import * as fs from 'fs';
import * as jsdom from 'jsdom';
const { JSDOM } = jsdom;

// import { getImsmanifestXML } from './lib';

// export const uploadPackage = ({filename}, res) => {
//   console.log(filename);

//   const packageId = 'public/' + filename.originalname.split('.').slice(0, -1).join('.');

//   // fs.createReadStream(filename.path).pipe(
//   //   unzipper.Extract({ path: packageId + '/' })
//   // );

//   if (!filename.endsWith('.zip')) {
//     return;
//   }

//   const manifestXml = getImsmanifestXML(packageId);

//   if (manifestXml) {
//     const manifestDom = new JSDOM(manifestXml).window.document;

//     const qtiVersion = parseInt(
//       manifestDom.querySelector('schemaversion').textContent || '0'
//     );

//     const itemResources = manifestDom.querySelectorAll(`resource[type*='item']`);

//     itemResources.forEach((manifestItem) => {
//     //   itemInfos.push({
//     //     id: `${foldername}_${manifestItem.getAttribute('identifier')}`,
//     //     itemRefId: manifestItem.getAttribute('identifier'),
//     //     location: `${foldername}/${manifestItem.getAttribute('href')}`,
//     //     thumbnail: '',
//     //     title: '',
//     //     identifier: '',
//     //     draft: true
//     //   });
//     });

//     // const itemCount = itemInfos.length;

//     // const items = await getItemsFromItemInfo(
//     //   itemInfos,
//     //   created,
//     //   createdBy,
//     //   createdByUsername,
//     //   foldername,
//     //   file.name,
//     //   bucketname
//     // );    
// }






//   const result = {
//     filename,
//     message: 'filename has been extracted',
//   };
//   fs.unlink(filename.path, function (e) {
//     if (e) throw e;
//     console.log('successfully deleted ' + filename.path);
//   });
//   res.end(JSON.stringify(result));
// };



  
//   export const convertToIndexedItem = (item: Item) => {
//     const categories: string[] = [];
//     if (item.metaData.subject) {
//       categories.push(item.metaData.subject);
//       if (item.metaData.domain) {
//         categories.push(item.metaData.domain);
//       }
//     }
//     const jsdom = new JSDOM(item.xml);
//     // jsdom.serialize() === `<!DOCTYPE html><html><head></head><body>hello</body></html>";
//     // jsdom.window.document.documentElement.outerHTML ===item.xml;
//     const itemBody =
//       jsdom.window.document.documentElement.querySelector('qti-item-body') ||
//       jsdom.window.document.documentElement.querySelector('itemBody');
//     const text = itemBody.textContent
//       .replaceAll('\n', ' ')
//       .replaceAll('\t', ' ')
//       .replace(/\s\s+/g, ' ')
//       .trim()
//       .substring(0, 7500);
//     let domain = `${item.metaData.subject}`;
//     if (item.metaData.domain) {
//       domain = `${domain} > ${item.metaData.domain}`;
//     }
  
//     return {
//       ...item,
//       objectID: item.id,
//       categories,
//       xml: text,
//       hierarchicalCategories: {
//         subject: item.metaData.subject,
//         domain,
//       },
//     } as ItemForIndex;
//   };
    
//   export const getItemsFromItemInfo = async (
//     itemInfos: ItemInfo[],
//     created: number,
//     createdBy: string,
//     createdByUsername: string,
//     packageId: string,
//     packageUrl: string,
//     bucketname: string
//   ) => {
//     const storage = admin.storage();
//     const items: Item[] = [];
//     // process items
//     for (const itemInfo of itemInfos) {
//       const paths = itemInfo.location.split('/');
//       paths.pop();
//       const item = storage.bucket(bucketname).file(itemInfo.location);
//       let itemXml = await storageFileToXml(item);

//       const transformed = await transformqti2xto30(itemXml);
//       itemXml = transformed.principalResult;
//       const itemDom = new JSDOM(itemXml).window.document;
//       const title = itemDom.querySelector('qti-assessment-item').getAttribute('title') || '';
//       const identifier = itemDom.querySelector('qti-assessment-item').getAttribute('identifier') || '';
  
//       items.push({
//         ...itemInfo,
//         created,
//         identifier,
//         title,
//         draft: true,
//         metaData: {
//           description: '',
//           isced: null,
//           subject: '',
//           tags: [],
//         },
//         thumbnail: '',
//         createdBy,
//         createdByUsername,
//         packageId,
//         packageZip: packageUrl,
//         isDeleted: false,
//         xml: itemXml,
//       });
//     }
//     return items;
//   };
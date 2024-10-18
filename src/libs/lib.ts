import * as path from "path";
import * as fs from "fs";
import * as cheerio from "cheerio";

const packagesDir = path.resolve(__dirname, "../packages") + "/";

/**
 * Reads the IMS manifest XML for a given package.
 * @param packageId - The ID of the package.
 * @returns The IMS manifest XML as a string, or null if not found.
 */
function readManifest(packageId: string): string | null {
  const manifestPath = path.join(packagesDir, packageId, "imsmanifest.xml");
  try {
    if (fs.existsSync(manifestPath)) {
      return fs.readFileSync(manifestPath, "utf8");
    }
  } catch (error) {
    console.error(`Error reading manifest for package ${packageId}:`, error);
  }
  return null;
}

/**
 * Extracts and loads the assessment test XML from the manifest.
 * @param manifestContent - The IMS manifest XML content.
 * @param packageId - The ID of the package.
 * @returns An object containing the assessment test XML content, its location, and filename.
 */
function loadAssessmentTest(manifestContent: string, packageId: string) {
  const $ = cheerio.load(manifestContent, { xmlMode: true });
  const testHref = $('resource[type="imsqti_test_xmlv3p0"]').attr("href");

  if (!testHref) {
    throw new Error(
      `Assessment test not found in the manifest for package ${packageId}.`
    );
  }

  const testPath = path.join(packagesDir, packageId, testHref);
  if (!fs.existsSync(testPath)) {
    throw new Error(`Assessment test file not found at ${testPath}.`);
  }

  const testContent = fs.readFileSync(testPath, "utf8");
  return {
    content: testContent,
    location: path.dirname(testHref),
    filename: path.basename(testHref),
  };
}

/**
 * Retrieves the XML content of a specific item from the package.
 * @param packageId - The ID of the package.
 * @param itemHref - The href of the item XML.
 * @returns The item XML content as a string.
 */
function getItemContent(packageId: string, itemHref: string): string {
  const manifestContent = readManifest(packageId);
  if (!manifestContent) {
    throw new Error(`Manifest not found for package ${packageId}.`);
  }

  const { location } = loadAssessmentTest(manifestContent, packageId);
  const itemFiles = getItemFilePaths(packageId, location);
  const itemPath = itemFiles.find((file) => file.endsWith(itemHref));

  if (!itemPath) {
    throw new Error(`Item ${itemHref} not found in package ${packageId}.`);
  }

  return fs.readFileSync(itemPath, "utf8");
}

/**
 * Parses the assessment test XML and retrieves the item hrefs and identifiers.
 * @param assessmentTestPath - The path to the assessment test XML.
 * @returns An array of objects containing item href and identifier.
 */
function parseAssessmentItems(
  assessmentTestPath: string
): { href: string; identifier: string }[] {
  const testContent = fs.readFileSync(assessmentTestPath, "utf8");
  const $ = cheerio.load(testContent, { xmlMode: true });

  return $("qti-assessment-item-ref")
    .map((_, element) => {
      const href = $(element).attr("href");
      const identifier = $(element).attr("identifier");
      if (!href || !identifier) {
        throw new Error(
          "Item href or identifier missing in the assessment test XML."
        );
      }
      return { href, identifier };
    })
    .get();
}

/**
 * Retrieves the full file paths of items from the assessment test XML.
 * @param packageId - The ID of the package.
 * @param assessmentLocation - The location of the assessment test XML.
 * @returns An array of full item file paths.
 */
function getItemFilePaths(
  packageId: string,
  assessmentLocation: string
): string[] {
  const manifestContent = readManifest(packageId);
  if (!manifestContent) {
    throw new Error(`Manifest not found for package ${packageId}.`);
  }

  const { filename } = loadAssessmentTest(manifestContent, packageId);
  const assessmentTestPath = path.join(
    packagesDir,
    packageId,
    assessmentLocation,
    filename
  );
  const items = parseAssessmentItems(assessmentTestPath);

  return items.map((item) =>
    path.join(packagesDir, packageId, assessmentLocation, item.href)
  );
}

/**
 * Processes the QTI XML content, with optional stripping of response data.
 * @param packageId - The ID of the package.
 * @param itemHref - The href of the item.
 * @param removeResponses - Whether to strip responses from the XML.
 * @returns The processed QTI XML string.
 */
export function processQtiItem(
  packageId: string,
  itemHref: string,
  scoreBackend: boolean
): string {
  let xmlContent = getItemContent(packageId, itemHref);

  if (scoreBackend) {
    // Remove correct value and response processing tags
    const $xml = cheerio.load(xmlContent, { xmlMode: true });
    $xml("qti-correct-response").remove();
    $xml("qti-response-processing").remove();
    xmlContent = $xml.xml();

    // Add scoring="externalMachine" to SCORE outcome if exists
    $xml('qti-outcome-declaration[identifier="SCORE"]').attr(
      "external-scored",
      "externalMachine"
    );
    xmlContent = $xml.xml();
  }
  // Apply transformations or response stripping if needed (stubs for further implementation)
  // xmlContent = applyCustomTransform(xmlContent);
  // if (removeResponses) {
  //   xmlContent = stripResponses(xmlContent);
  // }
  // xmlContent = convertQti2to3(xmlContent).xml();

  return xmlContent;
}

/**
 * Returns the item information (href and identifier) for all items in the package.
 * @param packageId - The ID of the package.
 * @returns An object containing the items.
 */
export function listPackageItems(packageId: string): {
  items: { href: string; identifier: string }[];
} {
  try {
    const manifestContent = readManifest(packageId);
    if (!manifestContent) {
      throw new Error(`Manifest not found for package ${packageId}.`);
    }

    const { content } = loadAssessmentTest(manifestContent, packageId);
    const $ = cheerio.load(content, { xmlMode: true });

    const items = $("qti-assessment-item-ref")
      .map((_, el) => ({
        href: $(el).attr("href")!,
        identifier: $(el).attr("identifier")!,
      }))
      .get();

    return { items };
  } catch (error) {
    console.error(`Error retrieving items for package ${packageId}:`, error);
    return { items: [] };
  }
}

/**
 * Lists all available packages by reading the directories in the packages folder.
 * @returns An object containing the list of package directories.
 */
export function listPackages(): { packages: string[] } {
  const directories = fs
    .readdirSync(packagesDir)
    .filter((file) => fs.statSync(path.join(packagesDir, file)).isDirectory());
  return { packages: directories };
}

export type ManifestData = {
  itemLocation: string;
  testIdentifier: string;
  assessmentXML?: string;
  assessmentLocation: string;
  items: {
    identifier: string;
    href: string;
  }[];
};

/**
 * Loads and parses the manifest data, including the assessment test and items, using local file operations.
 * @param packageId - The ID of the package containing the IMS manifest.
 * @returns A Promise that resolves to a ManifestData object.
 */
export const loadTestFromManifest = (packageId: string): ManifestData => {
  // Step 1: Read and parse the IMS manifest from the local file system
  const manifestContent = readManifest(packageId);
  if (!manifestContent) {
    throw new Error("IMS manifest not found.");
  }

  // Step 2: Extract the assessment test details from the manifest
  const {
    content: assessmentXML,
    location: assessmentLocation,
    filename: testIdentifier,
  } = loadAssessmentTest(manifestContent, packageId);

  // Step 3: Parse the assessment test XML and retrieve the items
  const assessmentTestPath = path.join(
    packagesDir,
    packageId,
    assessmentLocation,
    testIdentifier
  );
  const items = parseAssessmentItems(assessmentTestPath);

  // Step 4: Determine the item location based on the assessment test's first item
  const itemLocation = path.join(
    packagesDir,
    packageId,
    assessmentLocation,
    path.dirname(items[0].href)
  );

  // Step 5: Return the parsed data as a ManifestData object
  return {
    itemLocation,
    testIdentifier,
    assessmentXML,
    assessmentLocation,
    items,
  };
};

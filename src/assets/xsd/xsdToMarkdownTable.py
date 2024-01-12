import urllib.request
from xml.etree import ElementTree as ET

response = open('./QtiComponents.xml').read()

tree = ET.fromstring(response)
elemList = []

for elem in tree.iter():
    elemList.append(elem)

# now I remove duplicities - by convertion to set and back to list
# elemList = list(dict.fromkeys(elemList))

tags = list({(elem.tag + str(elem.attrib).replace("{","|").replace("}","|")) for elem in tree.iter()})

# Just printing out the result
# print(tags)
for tagname in tags:
  print (tagname);
  #print(sorted({n.get("name") for n in tree.findall(".//"+elem+"[@name]")}))



# print(for n in tree.findall(".//" + elem + "[@name]")}))

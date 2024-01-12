MathML converter




# QTI Scoring service


## Development server

## Nice to know
- Using cors module to simplify requesting from development servers https://daveceddia.com/access-control-allow-origin-cors-errors-in-react-express/
- XML Parsing in Node relies on obscure library "https://github.com/alexdee2007/node-libxslt", it's a fork of this project because the original does not support node > 10, https://github.com/albanm/node-libxslt/issues/68#issuecomment-415140043

To get XML and XSL processing working on the server side I had to import one library from github since the original will not work with node > 9
The stripresponse didn't work in the beginning due to the namespace , so I added the same namespace in the XSL

Removed from QTI files
Deze namespace zorgde dat we niet de XML konden strippen op
<xsl:template match="qti-response-declaration|qti-outcome-declaration|qti-response-processing"/>
```xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"```
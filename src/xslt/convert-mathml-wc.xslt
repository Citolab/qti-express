<?xml version="1.0" encoding="UTF-8"?>
<!-- 
    
    qti2xTo30.xsl - Transforms QTI 2.x content to QTI 3.0.
    
    Created By:     Wyatt VanderStucken
                    Educational Testing Service
                    wvanderstucken@ets.org
    
    Created Date:   2020-08-17-04:00
    
    NOTES:
    This XSL transformation requires a XSL 3.0 capable processor and has been developed/tested using the Saxon-HE
    Java implementation version 9.9.1.7.
    
    This XSL transformation is incomplete.  It only supports assessmentItem documents at this point, and does
    not purport to support these completely.  It is intended as a starting point for those who are venturing
    down this path.  The following features are implemented and simple items work reasonably well...

        * Namespace transformation.
        * schema-location reference updates.
        * Optional adds Schematron reference.  See param "addSchematronPi".
        * responseProcessing/@template updates.
        * element and attribute name "kabobization".
        * QTI 2.2's MathML 3 namespace-uri is transformed appropriately.
        * QTI 2.2's SSML 1.1 namespace-uri is transformed appropriately.
        * Content of feedbackBlock, modalFeedback, rubricBlock and templateBlock is reordered and encapsulated
          in qti-content-body.

-->
<xsl:stylesheet xmlns:xi="http://www.w3.org/2001/XInclude" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:math="http://www.w3.org/2005/xpath-functions/math" xmlns:apip="http://www.imsglobal.org/xsd/apip/apipv1p0/imsapip_qtiv1p0"
    xmlns:mml="http://www.w3.org/1998/Math/MathML" xmlns:mml3="http://www.w3.org/2010/Math/MathML" xmlns:imx="http://ets.org/imex"
    xmlns:ssml="http://www.w3.org/2001/10/synthesis" xmlns:ssml11="http://www.w3.org/2010/10/synthesis"
    exclude-result-prefixes="apip imx math mml mml3 ssml ssml11 xi xs" version="3.0">

    <xsl:param name="addSchematronPi" as="xs:boolean" select="true()" />

    <xsl:variable name="qti3NamespaceUri" select="'http://www.imsglobal.org/xsd/imsqtiasi_v3p0'" />
    <xsl:variable name="qti3RptemplatesUri" select="'https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/'" />
    <xsl:variable name="mmlNamespaceUri" select="'http://www.w3.org/1998/Math/MathML'" />
    <xsl:variable name="ssmlNamespaceUri" select="'http://www.w3.org/2001/10/synthesis'" />

    <xsl:template match="@*|node()">
        <xsl:copy>
            <xsl:apply-templates select="@*|node()" />
        </xsl:copy>
    </xsl:template>
    
    <!-- MathML to webcomponents -->
    <!-- MathML: math -> math-ml for https://github.com/pshihn/math-ml -->
    <xsl:template match="mml:math | mml3:math">
        <xsl:element name="math-ml" namespace="{$mmlNamespaceUri}">
            <xsl:copy-of select="@*" />
            <xsl:apply-templates />
        </xsl:element>
    </xsl:template>
    <!-- MathML:mrow -> math-row for https://github.com/pshihn/math-ml -->
    <xsl:template match="mml:math//*[starts-with(local-name(), 'm')] | mml3:math//*[starts-with(local-name(), 'm')]">
        <xsl:element name="math-{substring(local-name(), 2)}" namespace="{$mmlNamespaceUri}">
            <xsl:copy-of select="@*" />
            <xsl:apply-templates select="node()" />
        </xsl:element>
    </xsl:template>
    <!-- MathML:annotation, strip out leftover annotations -->
    <xsl:template match="mml:annotation"></xsl:template>

    <!-- Stripping out everything responseprocessing... -->
    <!-- <xsl:template match="*:correctResponse | *:outcomeDeclaration | *:responseProcessing | *:responseDeclaration" /> -->
</xsl:stylesheet>
<%
/*
 *	------ Zimbra - Mantis Zimblet Java Proxy ------
 *	----- Author: Irontec -- Date: 27/12/2010 -----
 *
 *	This JSP works as proxy for JSON petitions bettween Zmantis zimlet and Mantis SOAP api.
 *	It includes task done in server side, such as attachment handle.
 */
%>
<%@ page language="java" contentType="text/html; charset=UTF-8" import="java.net.*,java.io.*,java.util.*,java.text.*" %>
<%@ page language="java" contentType="text/html; charset=UTF-8" import="org.apache.commons.httpclient.*,org.apache.commons.httpclient.methods.*, org.apache.commons.httpclient.util.*" %>
<%@ page language="java" contentType="text/html; charset=UTF-8" import="org.apache.commons.fileupload.*,org.apache.commons.fileupload.disk.*, org.apache.commons.io.*" %>
<%@ page language="java" contentType="text/html; charset=UTF-8" import="com.zimbra.common.util.*" %>
<%@ page language="java" contentType="text/html; charset=UTF-8" import="biz.source_code.base64Coder.*" %>

<%
    response.setContentType("text/xml;charset=UTF-8");

    String endPoint = request.getHeader("Mantis-Url");
    String method = (String) request.getMethod();
    String encoding =  request.getCharacterEncoding();

    String soapAction = (String) request.getHeader("soapaction");
    int contentLength = request.getContentLength();

    StringBuilder stringBuilder = new StringBuilder();
    BufferedReader bufferedReader = null;
    try {
      	InputStream inputStream = request.getInputStream();
      	if (inputStream != null) {
       		bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
	       	char[] charBuffer = new char[128];
       		int bytesRead = -1;
	       	while ((bytesRead = bufferedReader.read(charBuffer)) > 0) {
        		stringBuilder.append(charBuffer, 0, bytesRead);
       		}
      	} else {
       		stringBuilder.append("");
      	}
    } catch (IOException ex) {
      	throw ex;
    } finally {
      if (bufferedReader != null) {
      	try {
        	bufferedReader.close();
       	} catch (IOException ex) {
        	throw ex;
       	}
      }
    }
    byte ba[] = stringBuilder.toString().getBytes();

    /** Special Hack for Attachment substitution    **/
    if (soapAction.endsWith("mc_issue_attachment_add")){
        String envelope_data = new String(ba,encoding);

	String contentBegin = "<content>";
	String contentEnd = "</content>";

        try{
            int beg = envelope_data.indexOf(contentBegin);
            int end = envelope_data.indexOf(contentEnd);
            String attUrl = envelope_data.substring(beg + contentBegin.length(), end);
            String prefix = envelope_data.substring(0, beg + contentBegin.length() -1);
            String sufix  = envelope_data.substring(end);

	    // Add content type to file content. This is required in order to make nusoap decode this field
	    prefix += " xsi:type=\"xsd:base64Binary\">";

            // Download the file to the local temporary path
            String dirPath = System.getProperty("java.io.tmpdir", "/tmp");
            String filePath = dirPath + "/zmantis_att_" + System.currentTimeMillis();
            File readFile = new File (filePath);
            FileOutputStream readFileStream = new FileOutputStream(readFile.getPath());

            // Get Post Cookies
            javax.servlet.http.Cookie reqCookie[] = request.getCookies();
            org.apache.commons.httpclient.Cookie[] clientCookie = new org.apache.commons.httpclient.Cookie[reqCookie.length];
            String hostName = request.getServerName () + ":" + request.getServerPort();

            for (int i=0; i<reqCookie.length; i++) {
                javax.servlet.http.Cookie cookie = reqCookie[i];
                clientCookie[i] = new org.apache.commons.httpclient.Cookie (hostName,cookie.getName(), cookie.getValue(),"/",null,false);
            }

            // Get Connection State
            HttpState state = new HttpState();
            state.addCookies (clientCookie);

             // Create a HTTP client with the actual state 
            HttpClient srcClient = new HttpClient();
            Enumeration headerNamesImg = request.getHeaderNames();
            while(headerNamesImg.hasMoreElements()) {
               String headerNameImg = (String)headerNamesImg.nextElement();
               srcClient.getParams().setParameter(headerNameImg, request.getHeader(headerNameImg));
            }
            srcClient.setState (state);

            // Convert the URL
            int paramsbeg = attUrl.indexOf("id=")-1;
            String filename = attUrl.substring(0, paramsbeg);
            String getparam = attUrl.substring(paramsbeg, attUrl.length());
            getparam = getparam.replaceAll("&amp;","&");
            attUrl = URIUtil.encodePath(filename, "ISO-8859-1") + getparam;

            // Download the Attachment
            GetMethod get = new GetMethod (attUrl);
            get.setFollowRedirects (true);
            srcClient.getHttpConnectionManager().getParams().setConnectionTimeout (10000);
            srcClient.executeMethod(get);

            // Copy the attachment to a local temporaly file
            ByteUtil.copy(get.getResponseBodyAsStream(), false, readFileStream, false);
            readFileStream.close();

            // Read the temporary file and output its Base64-values
            BufferedInputStream base64In = new BufferedInputStream(new FileInputStream(readFile.getPath()));

            int lineLength = 12288;
            byte[] buf = new byte[lineLength/4*3];
    
	    int len;
            while((len = base64In.read(buf)) > 0)  
              prefix += new String(Base64Coder.encode(buf, 0, len));
            base64In.close();
            readFile.delete();

            // Update prameter envelope_data with the binary data of the file
            envelope_data = prefix + sufix;
            // Set new bytes
            ba = envelope_data.getBytes();
        } catch (Exception e) {
                out.println("A problem occurried while handling attachment file:"+e.getMessage());
        }
    }

    // Create a HTTP client to foward SOAP petition
    HttpClient client = new HttpClient();
    Enumeration headerNames = request.getHeaderNames();
    while(headerNames.hasMoreElements()) {
        String headerName = (String)headerNames.nextElement();
        client.getParams().setParameter(headerName, request.getHeader(headerName));
    }

    BufferedReader br = null;

    // Set the input data for POST method
    PostMethod pmethod = new PostMethod(endPoint);

    try{
        pmethod.setRequestEntity(new org.apache.commons.httpclient.methods.ByteArrayRequestEntity(ba,request.getContentType()));

        int returnCode = client.executeMethod(pmethod);

        if(returnCode == HttpStatus.SC_NOT_IMPLEMENTED) {
            out.println("The Post method is not implemented by this URI");
            // still consume the response body
            pmethod.getResponseBodyAsString();
        } else {
            br = new BufferedReader(new InputStreamReader(pmethod.getResponseBodyAsStream(), encoding));
            String readLine;
            // Write the respone body
            while(((readLine = br.readLine()) != null)) 
                out.println(readLine);
        }
    } catch (Exception e) {
            out.println("Error enviando peticion a mantis.");
            out.println(e);
    } finally {
            pmethod.releaseConnection();
    }
%>

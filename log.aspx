<%@ Page Language="C#" AutoEventWireup="true" %>
<%@ Import Namespace="System.IO" %>
<%
    using (var reader = new StreamReader(Request.InputStream))
    {
        string postedData = reader.ReadToEnd();
        File.WriteAllText("C:\\temp\\d3d.log", postedData);
    }
%>
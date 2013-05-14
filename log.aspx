<%@ Page Language="C#" AutoEventWireup="true" %>
<%@ Import Namespace="System.IO" %>
<%
    var postedData = this.Request.Form["string"];

    var fileName = "C:\\temp\\d3d.log";
    if (this.Request.Form["append"] != null)
    {
        File.AppendAllText(fileName, postedData);
    }
    else
    {
        File.WriteAllText(fileName, postedData);
    }
%>
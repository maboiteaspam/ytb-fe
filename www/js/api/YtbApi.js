"use strict";
define([],function(){
  return function(ajaxHelper){

    var that = this;

    that.helper = ajaxHelper;


    that.fetchInformation = function(url){
      return that.helper.getJSON("/information", {url:url});
    };
    that.fetchCurrents = function(){
      return that.helper.getJSON("/list");
    };
    that.downloadFile = function(url,options){
      options = options?options:{};
      options.url = url;
      return that.helper.getJSON("/download", options);
    };
    that.stopDownload = function(url){
      return that.helper.getJSON("/stop", {url:url});
    };
    that.trashDownload = function(url){
      return that.helper.getJSON("/trash", {url:url});
    };
  }
});
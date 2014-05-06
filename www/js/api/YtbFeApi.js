"use strict";
define([],function(){
  return function(ajaxHelper){

    var that = this;

    that.helper = ajaxHelper;

    that.fetchThemes = function(){
      return that.helper.getJSON("/list_themes");
    };
    that.fetchConfig = function(){
      return that.helper.getJSON("/config");
    };
  }
});
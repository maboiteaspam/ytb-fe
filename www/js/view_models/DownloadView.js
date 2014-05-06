"use strict";
define([
],function(
  ){
  return function (el) {
    var that = this;

    that.url_to_fetch = ko.observable("");
    that.audio_only = ko.observable(false);
    that.force_restart = ko.observable(false);
    that.loaded = ko.observable(false);
    that.formats = ko.observableArray([]);
    that.format = ko.observable("Auto");
    that.errors = ko.observableArray([]);


    that.bind = function(){
      ko.applyBindings(this,$(el).get(0));
    };
    that.unbind = function(){
      ko.cleanNode($(el).get(0));
    };
    that.off = function(ev,target,fn){
      return $(el).off(ev,target,fn);
    };
    that.on = function(ev,target,fn){
      return $(el).on(ev,target,fn);
    };
    that.one = function(ev,target,fn){
      return $(el).one(ev,target,fn);
    };
  }
});
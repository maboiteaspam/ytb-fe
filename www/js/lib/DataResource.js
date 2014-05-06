"use strict";
define([],function(){
  return function () {
    var that = this;

    var handler = null;

    that.loaded = ko.observable(false);
    that.response = ko.observable(null);
    that.errors = ko.observable(null);

    that.data_filters = [];
    that.error_filters = [];

    that.set_handler = function(hdl){
      handler = hdl;
    };

    /**
     *
     * @returns $.Deferred
     */
    that.update = function(){
      that.loaded(false);
      var p = null;
      if( ! handler ){
        p = $.Deferred();
        p.reject(false);
      }else{
        p = handler.apply(null,arguments);
      }
      return p.fail(function(err){
        for(var n in that.error_filters ){
          that.error_filters[n](err);
        }
        that.errors(err);
        that.response(null);
      }).done(function(data){
        for(var n in that.data_filters ){
          that.data_filters[n](data);
        }
        that.errors(null);
        that.response(data);
      }).always(function(){
        that.loaded(true);
      });
    };

  }
});
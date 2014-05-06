"use strict";
define([
  "lib/LocalStorage",
  "lib/DataResource"
],function(
  LocalStorage,
  DataResource
    ){
  return function (el) {
    var that = this;

    var localStorage = new LocalStorage();

    that.name = ko.observable("");
    that.url = ko.observable("");
    that.content_prev = ko.observable("");
    that.content = ko.observable("");

    that.items_resource = new DataResource();
    that.items = ko.computed(function(){
      var items = [];
      var response = that.items_resource.response();
      if( response !== null ){
        for( var n in response ){
          var item = response[n];
          var e = {
            selected:null,
            name:item.name,
            url:item.url
          };
          e.selected=ko.computed(function(){
            return this.name==that.name();
          },e);
          items.push(e);
        }
      }
      return items;
    }).extend({ rateLimit: 500 });

    that.css_resource = new DataResource();
    that.css_resource.response.subscribe(function(css){
      that.content_prev( that.content() );
      that.content(css);
      setTimeout(function(){
        that.content_prev("");
      },250);
    });
    that.loaded = ko.computed(function(){
      var r = that.items_resource.loaded()
        && that.css_resource.loaded();
      return r;
    });

    that.name.subscribe(function(v){
      var items = that.items();
      for( var n in items ){
        if( items[n].name === v ){
          that.url( items[n].url );
        }
      }
    });
    that.url.subscribe(function(url){
      that.css_resource.update(url);
    });
    that.name.subscribe(function(name){
      var t = localStorage.getValue("preferred_theme");
      $("html").removeClass("theme-"+t).addClass("theme-"+name);
      localStorage.setValue("preferred_theme",name);
    });
    var hh = that.items.subscribe(function(data){
      var preferred_theme = localStorage.getValue("preferred_theme");
      if( preferred_theme ){
        that.name( preferred_theme );
      }else{
        var k;
        for( var n in data ){k = data[n];}
        if( k ) that.name( k.name );
      }
      hh.dispose();
    });

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
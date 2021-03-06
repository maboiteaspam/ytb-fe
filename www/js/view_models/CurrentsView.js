"use strict";
define([
],function(
    ){
  return function (el) {
    var that = this;

    that.loaded = ko.observable(false);
    that.items = ko.observableArray([]);

    that.syncItems = function(items){
      this.items.splice(0,this.items().length-items.length);
      for(var n in items ){
        var item = this.items()[n];
        if( ! item ){
          item = {
            audio_only: ko.observable(),
            extractor: ko.observable(),
            thumbnail: ko.observable(),
            filename: ko.observable(),
            files: ko.observableArray(),
            file_size: ko.observable(),
            description: ko.observable(),
            fulltitle: ko.observable(),
            display_id: ko.observable(),
            format: ko.observable(),
            eta: ko.observable(),
            status: ko.observable(),
            achieved: ko.observable(),
            speed: ko.observable(),
            errors: ko.observableArray(),
            inactivity_time: ko.observable(),
            has_information: ko.observable(false),
            webpage_url: ko.observable(),
            url: ko.observable(),
            user_dld_url: ko.observable()
          };
          item.filenameDisplay = ko.computed(function(){
            return this.filename() ? this.filename() : this.user_dld_url();
          },item);
          item.titleDisplay = ko.computed(function(){
            return this.fulltitle() ? this.fulltitle() : this.user_dld_url();
          },item);
          item.has_errors = ko.computed(function(){
            return this.errors().length>0;
          },item);
          item.inactive_level = ko.computed(function(){
            var level = "";
            if( this.inactivity_time() > 30 ){
              level = "eventually_inactive";
            }
            if( this.inactivity_time() > 60 ){
              level = "probably_inactive";
            }
            if( this.inactivity_time() > 90 ){
              level = "seriously_inactive";
            }
            return level;
          },item);
          item.is_inactive = ko.computed(function(){
            return this.status()=='downloading' && this.inactivity_time()>15;
          },item);
          item.is_downloading = ko.computed(function(){
            return this.status()=='downloading';
          },item);
          item.is_to_download = ko.computed(function(){
            return this.status()=='stopped' && !this.has_errors();
          },item);
          item.is_to_restart = ko.computed(function(){
            return this.status()=='stopped' && this.has_errors()
          },item);
          this.items.push(item);
        }
        item = this.items()[n];
        item.audio_only(items[n].audio_only);
        item.extractor(items[n].extractor);
        item.thumbnail(items[n].thumbnail);
        item.display_id(items[n].display_id);
        item.filename(items[n].filename);
        item.files(items[n].files);
        item.file_size(items[n].file_size);
        item.description(items[n].description);
        item.format(items[n].format);
        item.fulltitle(items[n].fulltitle);
        item.eta(items[n].eta);
        item.errors(items[n].errors);
        item.speed(items[n].speed);
        item.status(items[n].status);
        item.achieved(items[n].achieved);
        item.inactivity_time(items[n].inactivity_time);
        item.webpage_url(items[n].webpage_url);
        item.url(items[n].url);
        item.user_dld_url(items[n].user_dld_url);
        item.has_information(items[n].has_information);
      }
    }

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
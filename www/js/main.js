"use strict";
(function(){
  require([
    "lib/AjaxHelper",
    "api/YtbApi",
    "api/YtbFeApi",
    "view_models/AppViewModel",
    "view_models/ThemeView",
    "view_models/DownloadView",
    "view_models/CurrentsView"
  ],function(
      AjaxHelper,
      YtbApi,
      YtbFeApi,
      AppViewModel,
      ThemeView,
      DownloadView,
      CurrentsView
    ){

    // api declaration
    var api_location = window.api_location || "";
    var beApi = new YtbApi(new AjaxHelper(api_location));
    var feApi = new YtbFeApi( new AjaxHelper("") );

    // application setup
    var AppModel = new AppViewModel("body");
    AppModel.user_config.set_handler(function(){
      return feApi.fetchConfig()
    });
    var s = AppModel.loaded.subscribe(function(loaded){
      if( loaded )
        AppModel.one("transitionend",".app-loader",function(){
          setTimeout(function(){
            s.dispose();
            AppModel.ready(true);
          },1000);
        });
    });

  // theming system
    var themes = new ThemeView(".themeSelector");
    themes.css_resource.set_handler(function(url){
      return feApi.helper.getCSS(url).done(function(){
        setTimeout(function(){
          $(".themeSelector ul").scrollTo(
            $(".themeSelector .active").get(0), 200, {easing:'easeOutExpo'} );
        },650);
      });
    });
    themes.on("click", "ul li", function(){
      var i = $(this).index();
      var t = themes.items()[i];
      if( t ) themes.name(t.name);
      return false;
    });
    themes.items_resource.set_handler(function(){
      return feApi.fetchThemes();
    });
    AppModel.init_seq.startup_modules.push(themes);
    AppModel.themes = themes;

    // fetch item information
    var downloadView = new DownloadView(".downloadView");
    ko.computed(function(){
      var url = downloadView.url_to_fetch();
      downloadView.loaded(false);
      if( url.match(/^http:\/\//) ){

        downloadView.errors([]);
        beApi.fetchInformation(url)
          .done(function(response){
            downloadView.errors(response.errors);
            response.formats.unshift('Auto')
            downloadView.formats(response.formats);
            downloadView.fulltitle(response.fulltitle);
            downloadView.description(response.description);
          })
          .fail(function(){
            downloadView.formats([]);
            downloadView.errors(['error occured']);
          })
          .always(function(){
            downloadView.audio_only(false);
            downloadView.force_restart( false );

            downloadView.loaded(true);
          })
      }else {
        if( url == "" ) downloadView.errors([])
        else downloadView.errors(['wrong url'])
      }
    }).extend({ rateLimit: 500 });

    downloadView.on("click",".btn-clear",function(ev){
      downloadView.url_to_fetch("");
    })
    downloadView.on("click",".optionsView .btn",function(ev){
      var url = downloadView.url_to_fetch();
      currentsView.loaded(false);
      downloadView.url_to_fetch("");
      var options = {};
      var format = downloadView.format();
      if( format != "Auto" ) options.format = format;
      options.audio_only = downloadView.audio_only();
      options.force_restart = downloadView.force_restart();
      beApi.startFile(url, options)
        .done(function(response){
          currentsView.syncItems(response.items);
        })
        .fail(function(){
        })
        .always(function(){
          currentsView.loaded(true);
        });
      ev.preventDefault();
      return false;
    })
    AppModel.downloadView = downloadView;

    // display current items
    var currentsView = new CurrentsView(".currentsView");
    var refeshCurrentsView = function(){
      return beApi.fetchCurrents()
        .done(function(response){
          currentsView.syncItems(response.items);
        })
        .fail(function(){
          currentsView.syncItems([]);
        })
        .always(function(){
          currentsView.loaded(true);
        });
    };
    var t_out;
    var recallRefresh = function(when){
      clearTimeout(t_out);
      refeshCurrentsView()
        .always(function(){
          setTimeout(function(){
            recallRefresh(when);
          },when);
        });
    };
    ko.computed(function(){
      recallRefresh(750);
    }).extend({ rateLimit: 500 });

    currentsView.on("click",".item-row",function(ev){
      $(this).toggleClass("show-more-infos")
      if($(this).hasClass("show-more-infos")){
        var h = 0;
        h += $(this).outerHeight(true);
        $(this).css("min-height", h+"px" )
        h += $(this).find(".more-infos").outerHeight(true);
        $(this).css("min-height", h+"px" )
      }else{
        var h = 0;
        h += $(this).find(".more-infos").outerHeight(true);
        $(this).css("min-height", $(this).outerHeight(true)-h );
      }
      ev.preventDefault();
      return false;
    });
    currentsView.on("click",".btn-start",function(ev){
      var i = $(this).parentsUntil(".item-row").parent().index();
      var items = currentsView.items();
      if( items[i] ){
        var url = items[i].user_dld_url();
        currentsView.loaded(false);
        beApi.startFile(url)
          .done(function(response){
            currentsView.syncItems(response.items);
          })
          .fail(function(){
          })
          .always(function(){
            currentsView.loaded(true);
          });
      }
      ev.preventDefault();
      return false;
    });
    currentsView.on("click",".btn-restart",function(ev){
      var i = $(this).parentsUntil(".item-row").parent().index();
      var items = currentsView.items();
      if( items[i] ){
        var url = items[i].user_dld_url();
        currentsView.loaded(false);
        beApi.startFile(url)
          .done(function(response){
            currentsView.syncItems(response.items);
          })
          .fail(function(){
          })
          .always(function(){
            currentsView.loaded(true);
          });
      }
      ev.preventDefault();
      return false;
    });
    currentsView.on("click",".btn-stop",function(ev){
      var i = $(this).parentsUntil(".item-row").parent().index();
      var items = currentsView.items();
      if( items[i] ){
        var url = items[i].user_dld_url();
        currentsView.loaded(false);
        beApi.stopDownload(url)
          .done(function(response){
            currentsView.syncItems(response.items);
          })
          .fail(function(){
          })
          .always(function(){
            currentsView.loaded(true);
          });
      }
      ev.preventDefault();
      return false;
    });
    currentsView.on("click",".btn-trash",function(ev){
      var i = $(this).parentsUntil(".item-row").parent().index();
      var items = currentsView.items();
      if( items[i] ){
        var url = items[i].user_dld_url();
        currentsView.loaded(false);
        beApi.trashDownload(url)
          .done(function(response){
            currentsView.syncItems(response.items);
          })
          .fail(function(){
          })
          .always(function(){
            currentsView.loaded(true);
          });
      }
      ev.preventDefault();
      return false;
    });
    currentsView.on("click",".btn-edit",function(ev){
      var i = $(this).parentsUntil(".item-row").parent().index();
      var items = currentsView.items();
      if( items[i] ){
        downloadView.url_to_fetch( items[i].user_dld_url() );
        downloadView.audio_only( items[i].audio_only() );
        $("html, body").delay(0).animate({ scrollTop: 0 }, 1000, "easeOutExpo");
      }
      ev.preventDefault();
      return false;
    });
    currentsView.on("click",".btn-download",function(ev){
      var i = $(this).parentsUntil(".item-row").parent().index();
      var items = currentsView.items();
      if( items[i] ){
        var url = items[i].user_dld_url();
        var files = items[i].files();
        for(var n in files ){
          beApi.fileDownload(url,{
            filename:files[n].filename
          })
        }
      }
      ev.preventDefault();
      return false;
    });
    AppModel.currentsView = currentsView;

    AppModel.bind();

    AppModel.themes.items_resource.update();
    AppModel.user_config.update();













    AppModel.on("click",".dropdown", function(){
      if( !$(this).hasClass("disabled")){
        if( !$(this).hasClass("open")) $(".dropdown").removeClass("open");
        $(this).toggleClass("open");
      }
      return false;
    });
    AppModel.on("click",".dropup", function(){
      if( !$(this).hasClass("disabled")){
        if( !$(this).hasClass("open")) $(".dropup").removeClass("open");
        $(this).toggleClass("open");
      }
      return false;
    });
    function disable_form(form){
      form.find('input').attr("disabled","disabled");
      form.find('textarea').attr("disabled","disabled");
    }
    function enable_form(form,reset){
      form.find('input').attr("disabled",null);
      form.find('textarea').attr("disabled",null);
      if(reset!==false){
        form.get(0).reset();
      }
    }


  });
})();

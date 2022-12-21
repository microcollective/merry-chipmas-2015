function ThinPlayer(settings) {
  // Expanded functions

  function queryFor(query, callback) {
    [].forEach.call(document.querySelectorAll(query), callback);
  }

  // Mime lookup
  //   Borrows heavily from: https://github.com/rsdoiel/mimetype-js

  function getMime(filename) {
    var ext = filename.split(".").pop();
    var mimeTypes = {
      adp: "audio/adpcm",
      au: "audio/basic",
      snd: "audio/basic",
      mid: "audio/midi",
      midi: "audio/midi",
      kar: "audio/midi",
      rmi: "audio/midi",
      mp4a: "audio/mp4",
      m4a: "audio/mp4a-latm",
      m4p: "audio/mp4a-latm",
      mpga: "audio/mpeg",
      mp2: "audio/mpeg",
      mp2a: "audio/mpeg",
      mp3: "audio/mpeg",
      m2a: "audio/mpeg",
      m3a: "audio/mpeg",
      oga: "audio/ogg",
      ogg: "audio/ogg",
      spx: "audio/ogg",
      eol: "audio/vnd.digital-winds",
      dts: "audio/vnd.dts",
      dtshd: "audio/vnd.dts.hd",
      lvp: "audio/vnd.lucent.voice",
      pya: "audio/vnd.ms-playready.media.pya",
      ecelp4800: "audio/vnd.nuera.ecelp4800",
      ecelp7470: "audio/vnd.nuera.ecelp7470",
      ecelp9600: "audio/vnd.nuera.ecelp9600",
      aac: "audio/x-aac",
      aif: "audio/x-aiff",
      aiff: "audio/x-aiff",
      aifc: "audio/x-aiff",
      m3u: "audio/x-mpegurl",
      wax: "audio/x-ms-wax",
      wma: "audio/x-ms-wma",
      ram: "audio/x-aiff",
      ra: "audio/x-pn-realaudio",
      rmp: "audio/x-pn-realaudio-plugin",
      wav: "audio/x-wav",
    };

    if (ext in mimeTypes) return mimeTypes[ext];
    else return false;
  }

  // Object literal check

  function isObject(a) {
    return !!a && a.constructor === Object;
  }

  // Constructor stuff

  var windowTitle = document.title,
    intervals = [],
    dragging = false,
    self = this,
    useid3 = false,
    quietMode = false;

  if (typeof id3 != "undefined") {
    useid3 = true;
    console.log(
      "Detected what seems to be the id3 library - gonna try to use it."
    );
  }

  self.settings = settings;
  self.el = new Audio();

  self.el.preload = true;

  if (!self.settings.preload) self.el.preload = false;

  self.duration = 0;
  self.time = 0;
  self.timeNow = 0;
  self.metaLoaded = false;

  if (Array.isArray(self.settings.src)) self.playlist = true;
  else self.playlist = false;

  if (typeof self.settings.startAt == "undefined") {
    self.settings.startAt = 0;
  }

  self.playlistIndex = self.settings.startAt;

  /* Do we need to build the player? */
  if ("element" in self.settings) {
    /* Build */
    self.settings.bindings = {};
    self.settings.bindings.controls = {};
    self.settings.bindings.player = {};

    var controls = document.createElement("div"),
      play = document.createElement("div"),
      pause = document.createElement("div"),
      stop = document.createElement("div"),
      container = document.createElement("div"),
      playbar = document.createElement("div"),
      seekbar = document.createElement("div"),
      loadbar = document.createElement("div"),
      time = document.createElement("div");

    controls.id = "tp-controls";

    play.id = "tp-controls-play";
    self.settings.bindings.controls.play = "#" + play.id;
    play.textContent = "Play";

    pause.id = "tp-controls-pause";
    self.settings.bindings.controls.pause = "#" + pause.id;
    pause.textContent = "Pause";

    stop.id = "tp-controls-stop";
    self.settings.bindings.controls.stop = "#" + stop.id;
    stop.textContent = "Stop";

    container.id = "tp-container";
    self.settings.bindings.player.container = "#" + container.id;
    playbar.id = "tp-playbar";
    self.settings.bindings.player.playBar = "#" + playbar.id;
    seekbar.id = "tp-seekbar";
    self.settings.bindings.player.seekBar = "#" + seekbar.id;
    loadbar.id = "tp-loadbar";
    self.settings.bindings.player.loadBar = "#" + loadbar.id;
    time.id = "tp-time";
    self.settings.bindings.player.time = "#" + time.id;
    time.textContent = "00:00";

    container.appendChild(loadbar);
    container.appendChild(playbar);
    container.appendChild(time);
    container.appendChild(seekbar);

    controls.appendChild(play);
    controls.appendChild(pause);
    controls.appendChild(stop);

    var element = document.querySelector(self.settings.element);
    element.appendChild(container);
    element.appendChild(controls);
  } else if (!("bindings" in self.settings)) {
    quietMode = true;
    console.log(
      'No element or binding set, running in "quiet" mode (if there is such a thing).'
    );
  }

  /* Returns true on playing, false otherwise */
  self.isPlaying = function () {
    return !self.el.paused;
  };

  /* Returns or sets source */
  self.src = function (srcX, set) {
    if (typeof srcX != "undefined") {
      if (set) {
        if (Array.isArray(srcX)) self.playlist = true;
        else self.playlist = false;
        self.settings.src = srcX;
      }

      self.playlistIndex = self.settings.startAt || 0;

      if (self.playlist) {
        // Are there multiple types set?
        if (isObject(self.settings.src[self.playlistIndex])) {
          // self only works under ECMAScript 5, but jeez, if self isn't working, update your browser maybe?
          Object.keys(self.settings.src[self.playlistIndex]).forEach(function (
            key
          ) {
            var mime = getMime(self.settings.src[self.playlistIndex][key]);
            if (mime) {
              var canPlay = self.el.canPlayType(mime);
              if (!canPlay) {
                // We can't play self type
                //   Do nothing here because it's easier with canPlayType to just check for false
              } else {
                self.el.src = self.settings.src[self.playlistIndex][key];
              }
            }
          });
        } else {
          //self.settings.src[self.playlistIndex];
        }
      } else {
        // Are there multiple types set?
        if (isObject(self.settings.src)) {
          // self only works under ECMAScript 5, but jeez, if self isn't working, update your browser maybe?
          Object.keys(self.settings.src).forEach(function (key) {
            var mime = getMime(self.settings.src[key]);
            if (mime) {
              var canPlay = self.el.canPlayType(mime);
              if (!canPlay) {
                // We can't play self type
                //   Do nothing here because it's easier with canPlayType to just check for false
              } else {
                self.el.src = self.settings.src[key];
              }
            }
          });
        } else {
          self.el.src = self.settings.src;
        }
      }

      self.stop();
      if (!self.playlist) self.el.src = srcX;
      else self.el.src = self.settings.src[self.playlistIndex];
      self.el.load();

      if (useid3) {
        try {
          id3(self.el.src, function (err, tags) {
            self.id3 = tags;
          });
        } catch (err) {}
      }

      return self.el.src;
    } else {
      return self.settings.src;
    }
  };

  self.play = function () {
    if (!self.isPlaying()) {
      try {
        self.el.play();
      } catch (e) {}
    }
    handleInterval(true, "bar", 40, timeBar);

    if (!quietMode) {
      queryFor(self.settings.bindings.controls.play, function (el) {
        el.style.display = "none";
      });

      queryFor(self.settings.bindings.controls.pause, function (el) {
        el.style.display = "";
      });
    }

    if (self.settings.callbacks.play) {
      self.settings.callbacks.play();
    }
  };

  self.pause = function () {
    if (self.isPlaying()) self.el.pause();

    if (!quietMode) {
      queryFor(self.settings.bindings.controls.play, function (el) {
        el.style.display = "";
      });

      queryFor(self.settings.bindings.controls.pause, function (el) {
        el.style.display = "none";
      });
    }
  };

  self.playPause = function () {
    if (self.isPlaying()) self.pause();
    else self.play();
  };

  self.stop = function () {
    self.el.pause();
    try {
      self.el.currentTime = 0;
    } catch (e) {}
    /* 		setTimeout(function() { */
    /* 			handleInterval(false, 'bar'); */
    /* 		}, 50); */

    if (!quietMode) {
      queryFor(self.settings.bindings.controls.play, function (el) {
        el.style.display = "";
      });

      queryFor(self.settings.bindings.controls.pause, function (el) {
        el.style.display = "none";
      });
    }
  };

  /* Attach event listeners now we're delcared our required functions */
  if ("element" in self.settings) {
    play.addEventListener("click", self.play, false);
    pause.addEventListener("click", self.pause, false);
    stop.addEventListener("click", self.stop, false);
  }

  self.toggle = function () {
    if (!self.isPlaying()) self.play();
    else self.pause();
  };

  self.skipTo = function (playlistIdx) {
    if (!self.playlist) {
      console.error("ThinPlayer: Cannot skip to index. No playlist loaded.");
      return false;
    } else if (playlistIdx >= self.settings.src.length || playlistIdx < 0) {
      console.error("ThinPlayer: Cannot skip to index. Out of range.");
      return false;
    }
    self.el.currentTime = 0;
    self.el.pause();
    self.playlistIndex = playlistIdx;
    self.el.src = self.settings.src[self.playlistIndex];
    if (useid3) {
      try {
        id3(self.el.src, function (err, tags) {
          self.id3 = tags;
        });
      } catch (err) {
        console.error(err);
      }
    }
    self.el.play();
    if (self.settings.callbacks.skipTo) {
      self.settings.callbacks.skipTo();
    }
  };

  self.next = function () {
    if (!self.playlist && self.settings.repeat) {
      self.play();
      return;
    } else if (!self.playlist && !self.settings.repeat) return;

    self.el.currentTime = 0;
    self.el.pause();
    timeBar();
    if (self.playlistIndex < self.settings.src.length - 1) self.playlistIndex++;
    else if (self.settings.repeat) self.playlistIndex = 0;
    else return;

    self.el.src = self.settings.src[self.playlistIndex];
    if (useid3) {
      try {
        id3(self.el.src, function (err, tags) {
          self.id3 = tags;
        });
      } catch (err) {
        console.error(err);
      }
    }
    self.el.play();
    if (self.settings.callbacks.next) {
      self.settings.callbacks.next();
    }
  };

  function makeTime() {
    var timeX = Math.floor(self.el.currentTime);
    var minutes = Math.floor(timeX / 60);
    var seconds = timeX - minutes * 60;
    if (seconds < 10) seconds = "0" + seconds;
    if (minutes < 10) minutes = "0" + minutes;

    if (!quietMode) {
      queryFor(self.settings.bindings.player.time, function (time) {
        time.textContent = minutes + ":" + seconds;
      });
    }

    /* Callback */
    if (typeof self.settings.ontimeupdate === "function")
      self.settings.ontimeupdate({ currentTime: self.el.currentTime });
  }

  function handleInterval(set, name, interval, fnc) {
    if (set) {
      if (name in intervals) return false;
      intervals[name] = setInterval(fnc, interval);
    } else {
      clearInterval(intervals[name]);
      delete intervals[name];
    }
  }

  function timeBar() {
    var duration = self.el.duration;
    var time = duration * 1000;
    var timeNow = self.el.currentTime * 1000;
    self.currentTime = self.el.currentTime;

    if (!quietMode) {
      queryFor(self.settings.bindings.player.playBar, function (bar) {
        bar.style.width = (timeNow / time) * 100 + "%";
      });
    }
    /* Callback */
    if (
      typeof self.settings.onfasttimeupdate === "function" &&
      (self.isPlaying() || dragging)
    )
      self.settings.onfasttimeupdate({ currentTime: self.el.currentTime });
  }

  function loader() {
    if (!quietMode) {
      queryFor(self.settings.bindings.player.loadBar, function (loadBar) {
        loadBar.style.width = 0 + "%";
        var progress;
        try {
          progress = Math.round(
            (self.el.buffered.end(0) / self.el.duration) * 100
          );
          if (typeof self.settings.progress === "function")
            self.settings.progress({
              percent: progress,
              buffered: self.el.buffered.end(0),
            });
        } catch (err) {
          //Do nothing!
        }
        if (progress == 100) {
          loadBar.style.width = 100 + "%";
          setTimeout(function () {
            loadBar.style.opacity = 0;
          }, 1500);
        } else {
          loadBar.style.opacity = 1;
          loadBar.style.width = progress + "%";
        }
      });
    }
  }

  function metaLoaded() {
    self.duration = self.el.duration;
    /* Callback */
    if (typeof self.settings.onloadedmetadata === "function")
      self.settings.onloadedmetadata({ duration: self.duration });
  }

  self.el.addEventListener("loadedmetadata", metaLoaded, false);
  self.el.addEventListener("timeupdate", makeTime, false);
  self.el.addEventListener("ended", self.next, false);
  self.el.addEventListener("progress", loader, false);

  if (settings.drag) {
    queryFor(self.settings.bindings.player.seekBar, function (seek) {
      /* Bind touch events */
      seek.addEventListener("touchstart", touchHandler, true);
      seek.addEventListener("touchmove", touchHandler, true);
      seek.addEventListener("touchend", touchHandler, true);
      seek.addEventListener("touchcancel", touchHandler, true);

      /* Bind mouse events */
      seek.addEventListener("mousedown", mouseDown, false);
      seek.addEventListener("mousedown", divMove, true);

      window.addEventListener("mouseup", mouseUp, false);
    });

    /* Try to stop text select */
    queryFor(self.settings.bindings.player.container, function (cont) {
      cont.onselectstart = function (e) {
        e.preventDefault();
      };
    });
  }

  function mouseUp() {
    dragging = false;
    window.removeEventListener("mousemove", divMove, true);
  }

  function mouseDown(e) {
    evt = e || window.event;
    var button = evt.which || evt.button;
    if (button != 1) return;

    dragging = true;
    window.addEventListener("mousemove", divMove, true);
  }

  function divMove(e) {
    queryFor(self.settings.bindings.player.playBar, function (div) {
      queryFor(self.settings.bindings.player.seekBar, function (seek) {
        var offset = parseInt(seek.offsetLeft, 10);
        var maxwidth = seek.offsetWidth;

        if (e.clientX + offset <= maxwidth + offset * 2) {
          var perc = (e.clientX - offset) / (maxwidth / 100);
          div.style.width = perc + "%";
          self.el.currentTime = (perc * self.duration) / 100;
          makeTime();
        }
        e.preventDefault();
      });
    });
  }

  /* I did not write self method, try here: http://pastebin.com/z1B5jz7W */
  function touchHandler(event) {
    var touch = event.changedTouches[0];

    var simulatedEvent = document.createEvent("MouseEvent");

    simulatedEvent.initMouseEvent(
      {
        touchstart: "mousedown",
        touchmove: "mousemove",
        touchend: "mouseup",
      }[event.type],
      true,
      true,
      window,
      1,
      touch.screenX,
      touch.screenY,
      touch.clientX,
      touch.clientY,
      false,
      false,
      false,
      false,
      0,
      null
    );

    touch.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
  }

  if (self.playlist) {
    self.src(self.settings.src[self.playlistIndex], false);
  } else {
    self.src(self.settings.src, false);
  }

  if (self.settings.autoplay) self.play();
}

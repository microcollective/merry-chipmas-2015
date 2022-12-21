(function () {
  function D() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    function b() {
      width = window.innerWidth;
      height = window.innerHeight;
      l.setSize(width, height);
      e.aspect = window.innerWidth / window.innerHeight;
      e.updateProjectionMatrix();
    }
    window.addEventListener("resize", b);
    l = new THREE.WebGLRenderer({
      antialias: !0,
      alpha: !0,
    });
    l.setPixelRatio(window.devicePixelRatio);
    c.fog = new THREE.FogExp2(16777215, 0.045);
    e = new THREE.PerspectiveCamera(45, width / height, 0.1, 1e4);
    e.position.z = 10;
    e.position.y = 5;
    e.lookAt(d.position);
    c.add(e);
    b();
    l.setSize(width, height);
    document.body.appendChild(l.domElement);
    var a = new THREE.AmbientLight(16777215);
    c.add(a);
    a = [];
    a[0] = new THREE.DirectionalLight(16777215, 0.5);
    a[1] = new THREE.DirectionalLight(16777215, 0.5);
    a[2] = new THREE.DirectionalLight(16777215, 0.5);
    a[0].position.set(0, 200, 0);
    a[1].position.set(100, 200, 100);
    a[2].position.set(-100, -200, 100);
    c.add(a[0]);
    c.add(a[1]);
    c.add(a[2]);
    r = new THREE.GridHelper(100, 2.5);
    r.setColors(0, 0);
    r.material.linewidth = 1;
    c.add(r);
    for (
      var w = (window.devicePixelRatio / 1.5) * 40,
        a = new THREE.Geometry(),
        w = new THREE.ShaderMaterial({
          uniforms: {
            color: {
              type: "c",
              value: new THREE.Color(16777215),
            },
            height: {
              type: "f",
              value: 100,
            },
            elapsedTime: {
              type: "f",
              value: 0,
            },
            radiusX: {
              type: "f",
              value: 2.5,
            },
            radiusZ: {
              type: "f",
              value: 2.5,
            },
            size: {
              type: "f",
              value: w,
            },
            scale: {
              type: "f",
              value: 4,
            },
            opacity: {
              type: "f",
              value: 0.4,
            },
            texture: {
              type: "t",
              value: x,
            },
            speedH: {
              type: "f",
              value: 1,
            },
            speedV: {
              type: "f",
              value: 1,
            },
          },
          vertexShader: document.getElementById("vs").textContent,
          fragmentShader: document.getElementById("fs").textContent,
          blending: THREE.AdditiveBlending,
          transparent: !0,
          depthTest: !1,
        }),
        A = 0;
      1e4 > A;
      A++
    ) {
      var g = new THREE.Vector3(
        100 * (Math.random() - 0.5),
        100 * Math.random(),
        100 * (Math.random() - 0.5)
      );
      a.vertices.push(g);
    }
    t = new THREE.Points(a, w);
    t.position.y = -50;
    c.add(t);
    y = new THREE.Clock();
    B();
  }

  function E() {
    new THREE.ObjectLoader().load(
      "./assets/models/tree.min.json",
      function (b) {
        c = b;
        d = c.children[0];
        m = new THREE.Object3D();
        m.position.set(0, 0, 0);
        m.add(d);
        c.add(m);
        for (b = 0; 10 > b; b++) {
          u[b] = [];
          for (var a = 0; 20 > a; a++) {
            var e = Math.floor(81 * Math.random() + -40),
              h = Math.floor(81 * Math.random() + -40),
              g = d.clone();
            g.remove(g.children[2]);
            g.remove(g.children[0]);
            var f = new THREE.Object3D();
            f.position.set(0, 0, 0);
            f.add(g);
            g = 0.86 + 0.2 * Math.random();
            f.scale.set(g, g, g);
            u[b].push(f);
            u[b][a].position.set(e, 0, h);
            c.add(u[b][a]);
          }
        }
        v = d.children[0];
        z = d.children[1];
        n = d.children[2];
        d.material.shading = THREE.FlatShading;
        d.material.needsupdate = !0;
        v.material.shading = THREE.FlatShading;
        v.material.side = THREE.DoubleSide;
        v.material.needsupdate = !0;
        z.material.shading = THREE.FlatShading;
        z.material.needsupdate = !0;
        n.material.shading = THREE.FlatShading;
        n.material.needsupdate = !0;
        new THREE.TextureLoader().load(
          "./assets/snowflake.png",
          function (a) {
            x = a;
            x.minFilter = THREE.NearestFilter;
            D();
          },
          void 0,
          function (a) {
            console.error(a);
          }
        );
      },
      void 0,
      function (b) {
        console.error(b);
      }
    );
  }
  var contextCreated = false;

  function B() {
    requestAnimationFrame(B);
    b = { rms: 0 };
    if (tP.isPlaying()) {
      if (!contextCreated) {
        createContext();
        contextCreated = true;
      } else {
        b = C.get(["rms"]);

        if (!b.rms) {
          b = { rms: 0 };
        }
      }
    }

    y.getDelta();
    var a = y.getElapsedTime();
    n.rotation.y -= 0.015;
    e.position.x = d.position.x + 10 * Math.cos(0.06 * a);
    e.position.z = d.position.z + 10 * Math.sin(0.06 * a);
    e.lookAt(d.position);
    t.material.uniforms.elapsedTime.value = 1.8 * a;
    b = 1 + Math.abs(b.rms / 5);
    m.scale.set(b, b, b);
    l.render(c, e);
  }

  function createContext() {
    context = new (window.AudioContext || window.webkitAudioContext)();
    source = context.createMediaElementSource(f.el);
    source.connect(context.destination);
    C = new Meyda(context, source, 512);
  }

  function F(b) {
    function a() {
      var a = document.querySelector(".tracklist li.active");
      a && a.classList.remove("active");
      document
        .querySelectorAll(".tracklist li")
        [f.playlistIndex].classList.add("active");
    }
    var e = document.getElementsByClassName("tracklist")[0],
      c = [];
    b.forEach(function (a, b) {
      var d = document.createElement("li");
      d.innerHTML = "<b>" + a.title + "</b> by <b>" + a.author + "</b>";
      d.addEventListener("click", function () {
        this.classList.contains("active") ? f.playPause() : f.skipTo(b);
      });
      e.appendChild(d);
      c.push("./assets/audio/" + (b + 1) + ".mp3");
    });
    f = new ThinPlayer({
      src: c,
      autoplay: 0,
      repeat: !0,
      callbacks: {
        next: a,
        play: a,
        skipTo: a,
      },
    });

    window.tP = f;
    E();
  }
  var c,
    e,
    l,
    d,
    v,
    z,
    r,
    n,
    C,
    m,
    t,
    y,
    x,
    f,
    u = [];
  (function () {
    request = new XMLHttpRequest();
    request.open("GET", "./assets/json/tracklist.min.json", !0);
    request.onload = function () {
      200 <= request.status && 400 > request.status
        ? ((data = JSON.parse(request.responseText)), F(data))
        : console.error(request);
    };
    request.onerror = function () {
      console.error(request);
    };
    request.send();
  })();
})();

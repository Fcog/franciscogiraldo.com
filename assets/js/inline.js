if (window.netlifyIdentity) {
  window.netlifyIdentity.on("init", user => {
    if (!user) {
      window.netlifyIdentity.on("login", () => {
        document.location.href = "/admin/";
      });
    }
  });
}

window.onload = function() {
  Particles.init({
    selector: '.background',
    maxParticles: 80,
    connectParticles: true,
    color: '#ffffff',
    responsive: [
      {
        breakpoint: 420,
        options: {
          maxParticles: 0
        }
      }
    ]
  });

  document.addEventListener(
    "scroll",
    function() {
      var scrollTop = document.documentElement["scrollTop"] || document.body["scrollTop"];

      var scrollBottom = ( document.documentElement["scrollHeight"] || document.body["scrollHeight"] )
        - document.documentElement.clientHeight;

      var scrollPercent = scrollTop / scrollBottom * 100 + "%";

      var progressbar = document.getElementById("progress");

      progressbar && progressbar.style.setProperty( "--scroll", scrollPercent );
    },
    { passive: true }
  );
};

/* ═══════════════════════════════════════════════════════════════════
   LE SITE WEB DE VIGIE — ce que le script ajoute, et rien de plus.

   SANS LUI, TOUT SE LIT : les compteurs montrent leur valeur, la
   comparaison s'arrête au milieu, l'entonnoir est rempli. Le script ne
   fait qu'animer : les compteurs montent, la glissière suit le doigt,
   l'entonnoir se remplit étage par étage quand on arrive dessus.

   Qui a demandé moins de mouvement à son appareil n'a pas d'animation.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var calme = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- la glissière avant / avec Vigie ------------------------------ */
  document.querySelectorAll(".comparaison").forEach(function (boite) {
    var glisse = boite.querySelector("input[type=range]");
    if (!glisse) { return; }
    function poser() { boite.style.setProperty("--pos", glisse.value + "%"); }
    glisse.addEventListener("input", poser);
    poser();
  });

  if (calme || !("IntersectionObserver" in window)) { return; }

  /* --- les compteurs qui montent ------------------------------------ */
  function compter(el) {
    var cible = parseInt(el.getAttribute("data-compte"), 10);
    if (isNaN(cible)) { return; }
    var debut = null, duree = 1600;
    function pas(t) {
      if (debut === null) { debut = t; }
      var p = Math.min(1, (t - debut) / duree);
      var v = Math.round(cible * (1 - Math.pow(1 - p, 3)));
      // Le nombre s'écrit dans la langue de la page : 12 480 en français,
      // 12,480 en anglais.
      el.textContent = v.toLocaleString(document.documentElement.lang === "en" ? "en-US" : "fr-FR");
      if (p < 1) { requestAnimationFrame(pas); }
    }
    el.textContent = "0";
    requestAnimationFrame(pas);
  }

  /* --- l'entonnoir qui se remplit ----------------------------------- */
  function remplir(bloc) {
    var pas = bloc.querySelectorAll(".pas-liste li");
    var etages = bloc.querySelectorAll(".etage");
    var i = 0;
    (function suivant() {
      if (pas[i]) { pas[i].classList.add("allume"); }
      if (etages[i]) {
        etages[i].classList.add("allume");
        var b = etages[i].querySelector("[data-compte]");
        if (b) { compter(b); }
      }
      i += 1;
      if (i < Math.max(pas.length, etages.length)) { setTimeout(suivant, 650); }
    })();
  }

  var vus = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (e) {
      if (!e.isIntersecting) { return; }
      vus.unobserve(e.target);
      if (e.target.classList.contains("entonnoir-deux")) { remplir(e.target); }
      else { compter(e.target); }
    });
  }, {threshold: 0.35});

  document.querySelectorAll(".entonnoir-deux").forEach(function (bloc) {
    bloc.classList.add("anime");
    vus.observe(bloc);
  });
  document.querySelectorAll("[data-compte]").forEach(function (el) {
    if (!el.closest(".entonnoir-deux")) { vus.observe(el); }
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   LE SITE WEB DE VIGIE — ce que le script ajoute, et rien de plus.

   SANS LUI, TOUT SE LIT : les compteurs montrent leur valeur,
   l'entonnoir est rempli, les textes sont là. Le script ne fait
   qu'animer : les compteurs montent, l'entonnoir se remplit étage par
   étage, les textes apparaissent quand on arrive dessus.

   Qui a demandé moins de mouvement à son appareil n'a pas d'animation.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var calme = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  /* --- les textes qui apparaissent (20/10/2026) ----------------------
     Le script marque lui-même ce qui apparaîtra : sans lui, rien n'est
     caché. Un titre, son texte et ses boutons arrivent l'un après
     l'autre. */
  document.documentElement.classList.add("js-revele");
  var revele = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (e) {
      if (!e.isIntersecting) { return; }
      revele.unobserve(e.target);
      e.target.classList.add("vu");
    });
  }, {threshold: 0.15});
  document.querySelectorAll("main :is(h1, h2, .chapeau, .tete-section > p, .texte > p, .boutons, .deux-radar svg, .onglets-ecrans, .ecran, .tarif, .carte-appel, .matinee)")
    .forEach(function (el) {
      var rang = 0, avant = el.previousElementSibling;
      while (avant && rang < 3) { rang += 1; avant = avant.previousElementSibling; }
      el.style.setProperty("--rang", rang);
      el.classList.add("a-reveler");
      revele.observe(el);
    });

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

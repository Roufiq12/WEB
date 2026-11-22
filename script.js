/* ============================================================
   KONFIGURASI
   Isi FORMSPREE_ENDPOINT dengan URL formulir Anda (https://formspree.io/f/xxxxxxx)
   agar pesan terkirim langsung. Jika dikosongkan, formulir membuka aplikasi
   email (mailto) dengan pesan yang sudah terisi.
   ============================================================ */
const FORMSPREE_ENDPOINT = "";
const EMAIL_TO = "roufiqdesu@gmail.com";

(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  root.classList.add("js");
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Tema ---------- */
  $("#themeToggle").addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  /* ---------- Navbar & menu mobile ---------- */
  const nav = $("#nav"), burger = $("#burger");
  const setMenu = open => {
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
  };
  burger.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
  $$("#menu a").forEach(a => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

  /* ---------- Bunga abstrak (SVG garis) ---------- */
  const bloom = $("#bloom");
  const NS = "http://www.w3.org/2000/svg";
  for (let i = 0; i < 14; i++) {
    const e = document.createElementNS(NS, "ellipse");
    e.setAttribute("rx", 190); e.setAttribute("ry", 62);
    e.setAttribute("transform", `rotate(${i * (180 / 14)})`);
    bloom.appendChild(e);
  }
  [40, 12].forEach(r => { const c = document.createElementNS(NS, "circle"); c.setAttribute("r", r); bloom.appendChild(c); });

  /* ---------- Scroll: navbar, section aktif, parallax ---------- */
  const heroImg = $("#heroImg"), visual = $("#heroVisual");
  let ticking = false;
  function onScroll() {
    const y = scrollY;
    nav.classList.toggle("scrolled", y > 30);
    if (!reduce && y < innerHeight * 1.2) {
      heroImg.style.transform = `translateY(${-y * 0.06}px)`;
      visual.style.translate = `0 ${y * 0.04}px`;
    }
    ticking = false;
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  const links = $$("#menu a");
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach(s => spy.observe(s));

  /* ---------- Reveal (Intersection Observer) ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  function watch(scope) {
    $$(".rv:not(.in)", scope).forEach((el, i) => {
      el.style.setProperty("--d", (i % 4) * 0.08 + "s"); // stagger ringan
      io.observe(el);
    });
  }
  watch(document);

  /* ---------- Interaksi mouse: cursor, magnetic, tilt 3D ---------- */
  if (fine && !reduce) {
    root.classList.add("js-cursor");
    const cur = $(".cursor");
    addEventListener("mousemove", e => { cur.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; }, { passive: true });
    document.addEventListener("mouseover", e => cur.classList.toggle("big", !!e.target.closest("a,button,.card,input,textarea")));
    $$(".mag").forEach(b => {
      b.addEventListener("mousemove", e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px,${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      b.addEventListener("mouseleave", () => { b.style.transform = ""; });
    });
    const cube = $(".cube");
    addEventListener("mousemove", e => {
      const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      cube.style.setProperty("--ry", 35 + x * 120 + "deg");
      cube.style.setProperty("--rx", -25 - y * 120 + "deg");
      bloom.style.marginLeft = `calc(-75% + ${x * 18}px)`;
      bloom.style.marginTop = `calc(-75% + ${y * 18}px)`;
    }, { passive: true });
  }

  /* ---------- Selected Works ---------- */
  const PROJECTS = window.PROJECTS || [], CATS = window.CATEGORIES || [];
  const grid = $("#grid"), filters = $("#filters");
  let active = "Semua";
  const lb = $("#lightbox");

  function renderFilters() {
    const items = ["Semua", ...CATS];
    filters.innerHTML = "";
    items.forEach(c => {
      const n = c === "Semua" ? PROJECTS.length : PROJECTS.filter(p => p.category === c).length;
      const b = document.createElement("button");
      b.type = "button"; b.setAttribute("aria-pressed", c === active);
      b.innerHTML = `${c}<sup>${n}</sup>`;
      b.addEventListener("click", () => { active = c; renderFilters(); renderGrid(); });
      filters.appendChild(b);
    });
  }
  function renderGrid() {
    const list = active === "Semua" ? PROJECTS : PROJECTS.filter(p => p.category === active);
    grid.innerHTML = "";
    if (!list.length) {
      grid.innerHTML = `<div class="empty rv"><p>Ruang untuk karya-karya berikutnya.</p><span class="small">NEW WORKS COMING SOON.</span></div>`;
    } else {
      list.forEach(p => {
        const c = document.createElement("button");
        c.type = "button"; c.className = "card rv";
        c.innerHTML = `<span class="thumb"><img loading="lazy" alt=""></span><span class="mono"></span><h3></h3>`;
        const img = $("img", c);
        img.src = p.image; img.alt = `${p.title} — ${p.category}`;
        img.onerror = () => { img.removeAttribute("src"); img.alt = "Gambar belum tersedia"; };
        $(".mono", c).textContent = `${p.category} / ${p.year || ""}`;
        $("h3", c).textContent = p.title;
        c.addEventListener("click", () => {
          $("#lbImg").src = p.image; $("#lbImg").alt = img.alt;
          $("#lbMeta").textContent = `${p.category} / ${p.year || ""}`;
          $("#lbTitle").textContent = p.title; $("#lbDesc").textContent = p.description || "";
          lb.showModal();
        });
        grid.appendChild(c);
      });
    }
    watch(grid);
  }
  $("#lbClose").addEventListener("click", () => lb.close());
  lb.addEventListener("click", e => { if (e.target === lb) lb.close(); });
  renderFilters(); renderGrid();

  /* ---------- Formulir kontak ---------- */
  const form = $("#form"), status = $("#status"), btn = $("#submitBtn");
  const rules = {
    name: v => v.trim().length >= 2 || "Isi nama minimal 2 karakter.",
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "Masukkan format email yang benar, contoh: nama@email.com.",
    subject: v => v.trim().length >= 3 || "Isi subjek minimal 3 karakter.",
    message: v => v.trim().length >= 10 || "Isi pesan minimal 10 karakter."
  };
  function check(name) {
    const f = form.elements[name], r = rules[name](f.value);
    const ok = r === true;
    $("#e-" + name).textContent = ok ? "" : r;
    f.closest(".field").classList.toggle("invalid", !ok);
    f.setAttribute("aria-invalid", !ok);
    return ok;
  }
  Object.keys(rules).forEach(n => form.elements[n].addEventListener("blur", () => check(n)));
  form.addEventListener("submit", async e => {
    e.preventDefault(); status.textContent = "";
    const valid = Object.keys(rules).map(check).every(Boolean);
    if (!valid) { status.textContent = "Periksa kolom yang ditandai, lalu kirim lagi."; $(".invalid input, .invalid textarea", form).focus(); return; }
    const data = Object.fromEntries(new FormData(form));

    if (!FORMSPREE_ENDPOINT) { // fallback mailto
      const body = `${data.message}\n\n— ${data.name} (${data.email})`;
      location.href = `mailto:${EMAIL_TO}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(body)}`;
      status.textContent = "Aplikasi email dibuka dengan pesan Anda. Tekan kirim di aplikasi email untuk menyelesaikan.";
      return;
    }
    const label = $("span", btn).textContent;
    btn.disabled = true; $("span", btn).textContent = "Mengirim"; btn.insertAdjacentHTML("afterbegin", '<i class="spin"></i>');
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error(res.status);
      form.reset(); status.textContent = "Pesan terkirim. Terima kasih, saya akan membalas lewat email.";
    } catch (err) {
      status.textContent = `Pesan gagal terkirim. Coba lagi atau kirim langsung ke ${EMAIL_TO}.`;
    } finally {
      btn.disabled = false; $("span", btn).textContent = label; $(".spin", btn)?.remove();
    }
  });
})();

/**
 * PEMAPA (Pesona Marmer Alam Parung) - Interactive Application Logic
 * Spesialis Marmer, Granit & Sintered Stone
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initClientFilter();
  initProjectModal();
  initEstimator();
  initCopyAddress();
});

// 1. Navbar Scroll, Active Indicator (Garis Coklat) & Mobile Menu
function initNavbar() {
  const header = document.querySelector('.site-header') || document.querySelector('.navbar');
  const mobileMenuBtn = document.querySelector('.mobile-toggle-button') || document.querySelector('.mobile-menu-btn');
  const navList = document.querySelector('.main-navigation') || document.querySelector('.nav-links');
  const navLinks = document.querySelectorAll('.nav-item-link');

  // Sticky header background on scroll
  window.addEventListener('scroll', () => {
    if (header) {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  }, { passive: true });

  // Sync dynamic header height for pixel-perfect mobile drawer positioning
  function syncHeaderHeight() {
    if (header) {
      document.documentElement.style.setProperty('--site-header-height', `${header.offsetHeight}px`);
    }
  }
  syncHeaderHeight();
  window.addEventListener('resize', syncHeaderHeight, { passive: true });

  // Mobile Menu State Controller
  function setMobileMenu(isOpen) {
    if (!navList || !mobileMenuBtn) return;
    syncHeaderHeight();
    if (isOpen) {
      navList.classList.add('mobile-open');
      mobileMenuBtn.classList.add('is-active');
      mobileMenuBtn.setAttribute('aria-expanded', 'true');
      mobileMenuBtn.setAttribute('aria-label', 'Tutup Menu Navigasi');
      if (header) header.classList.add('mobile-menu-active');
      document.body.style.overflow = 'hidden';
    } else {
      navList.classList.remove('mobile-open');
      mobileMenuBtn.classList.remove('is-active');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
      mobileMenuBtn.setAttribute('aria-label', 'Buka Menu Navigasi');
      if (header) header.classList.remove('mobile-menu-active');
      document.body.style.overflow = '';
    }
  }

  // Mobile Menu Toggle Button Click
  if (mobileMenuBtn && navList) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !navList.classList.contains('mobile-open');
      setMobileMenu(isOpen);
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (navList.classList.contains('mobile-open') && !navList.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        setMobileMenu(false);
      }
    });

    // Close mobile menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navList.classList.contains('mobile-open')) {
        setMobileMenu(false);
      }
    });

    // Close mobile menu when clicking brand logo
    const brandWrapper = document.querySelector('.brand-wrapper');
    if (brandWrapper) {
      brandWrapper.addEventListener('click', () => {
        if (navList.classList.contains('mobile-open')) {
          setMobileMenu(false);
        }
      });
    }
  }

  // Active Line Synchronization (ScrollSpy + Click)
  const sectionIds = ['beranda', 'proyek-fb', 'layanan', 'kristalisasi', 'workshop', 'estimasi', 'kontak'];
  const sections = sectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean);

  function setActiveLink(targetId) {
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${targetId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  let isClickScrolling = false;
  let scrollTimeout = null;

  // Click on nav link: immediately move brown underline and smoothly scroll
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const targetId = href.substring(1);
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        e.preventDefault();
        isClickScrolling = true;
        clearTimeout(scrollTimeout);

        // Move brown underline indicator immediately
        setActiveLink(targetId);

        // Check if mobile menu is currently open
        const wasMobileOpen = navList && navList.classList.contains('mobile-open');

        // Close mobile dropdown if open
        if (wasMobileOpen) {
          setMobileMenu(false);
        }

        // Perform scroll — delay slightly if mobile menu was open
        // so the browser can re-layout after removing overflow:hidden
        const doScroll = () => {
          const headerHeight = header ? header.offsetHeight : 70;
          const targetTop = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;

          window.scrollTo({
            top: targetTop,
            behavior: 'smooth'
          });

          // Resume ScrollSpy after smooth scroll finishes
          scrollTimeout = setTimeout(() => {
            isClickScrolling = false;
          }, 750);
        };

        if (wasMobileOpen) {
          // Wait for mobile menu close animation & body re-layout
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              doScroll();
            });
          });
        } else {
          doScroll();
        }
      }
    });
  });

  // Dynamic ScrollSpy on window scroll
  function updateScrollSpy() {
    if (isClickScrolling) return;

    const scrollY = window.scrollY;
    const headerHeight = header ? header.offsetHeight : 70;
    const scrollPosition = scrollY + headerHeight + 80;

    // Check if scrolled near the bottom of the page (activate Kontak)
    const docHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    if ((windowHeight + scrollY) >= (docHeight - 60)) {
      setActiveLink('kontak');
      return;
    }

    // Find current section in view
    let currentId = 'beranda';
    for (const section of sections) {
      if (section.offsetTop <= scrollPosition) {
        currentId = section.id;
      }
    }

    setActiveLink(currentId);
  }

  window.addEventListener('scroll', updateScrollSpy, { passive: true });
  // Initial check on load
  updateScrollSpy();
}

// 2. Client & F&B Collaboration Filter
function initClientFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn, .client-tab-btn');
  const cards = document.querySelectorAll('.project-stone-card, .fb-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.35s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// Data detail pengerjaan proyek F&B & Commercial (Foto Asli Lapangan & Cabang Spesifik)
const projectDetails = {
  marugame: {
    title: "Marugame Udon (Multi-Cabang)",
    tag: "F&B Commercial Stone Project",
    description: "Fabrikasi dan instalasi top table granit hitam intens untuk area workstation, kitchen pass, counter penyajian, dan meja kasir di berbagai gerai Marugame Udon berskala nasional. Material granit memiliki densitas tinggi yang tahan uap panas kuah mendidih, minyak kaldu gurih, dan aktivitas operasional padat.",
    branches: [
      {
        id: "deltamas",
        name: "Marugame Udon - AEON Mall Deltamas",
        shortName: "AEON Mall Deltamas",
        spot: "Top Table Counter Kitchen Bar & Workstation Granit Hitam Pekat (Foto Asli Lapangan)",
        material: "High-Density Deep Black Granite, Water & Heat Sealed",
        images: [
          "assets/images/branches/marugame/deltamas_1.jpg",
          "assets/images/marugame_real.jpg"
        ],
        status: "Proyek Selesai (Foto Asli)",
        waNote: "Marugame Udon cabang AEON Mall Deltamas (Top Table Granit Hitam Bar Workstation)"
      },
      {
        id: "bandung_tsb",
        name: "Marugame Udon - Trans Studio Bandung",
        shortName: "Trans Studio Bandung",
        spot: "Main Service Counter, Area Penyajian Udon & Meja Kasir Utama",
        material: "Black Granite High-Gloss dengan Double Bevel Edge Profile",
        images: [
          "assets/images/branches/marugame/bandung_tsb_1.jpg"
        ],
        status: "Proyek Selesai (Foto Asli)",
        waNote: "Marugame Udon cabang Trans Studio Bandung (Meja Kasir & Service Counter Granit)"
      },
      {
        id: "bekasi",
        name: "Marugame Udon - Kota Bintang Bekasi",
        shortName: "Kota Bintang Bekasi",
        spot: "Kitchen Pass Workstation & Counter Top Table dengan Bukaan Presisi Peralatan",
        material: "Granit Hitam Solid Bridge-Saw Cut Presisi Nat Rapat",
        images: [
          "assets/images/branches/marugame/bekasi_1.jpg"
        ],
        status: "Proyek Selesai (Foto Asli)",
        waNote: "Marugame Udon cabang Kota Bintang Bekasi (Kitchen Pass & Counter Top Table)"
      },
      {
        id: "riau_kaliurang",
        name: "Marugame Udon - Riau Bandung & Kaliurang Jogja",
        shortName: "Riau Bandung & Kaliurang",
        spot: "Meja Dining Pengunjung, Pantry Bersih & Kitchen Pass Tahan Noda Kaldu",
        material: "Black Granite Polished & Kristalisasi Coating Anti-Noda Minyak",
        images: [
          "assets/images/marugame.jpg"
        ],
        status: "Proyek Selesai",
        waNote: "Marugame Udon cabang Riau Bandung / Kaliurang (Dining Table & Top Table Granit)"
      }
    ]
  },
  pizzahut: {
    title: "Pizza Hut Indonesia",
    tag: "F&B Takeaway, Cashier & Salad Bar",
    description: "Instalasi marmer putih mewah berurat halus (White Carrara) dan batu alam hitam poles presisi lengkung untuk area kasir, konter takeaway serah terima pesanan, serta meja bundar salad bar mandiri.",
    branches: [
      {
        id: "daan_mogot",
        name: "Pizza Hut - Mal Matahari Daan Mogot, Jakarta Barat",
        shortName: "Mal Matahari Daan Mogot",
        spot: "Counter Kasir Pembayaran Utama & Meja Takeaway Pesanan Pengunjung",
        material: "White Carrara Marble High-Gloss, Double Bevel Edge Profile",
        images: [
          "assets/images/branches/pizzahut/daan_mogot_1.jpg",
          "assets/images/pizzahut_real.jpg"
        ],
        status: "Proyek Selesai (Foto Asli)",
        waNote: "Pizza Hut Mal Matahari Daan Mogot (Meja Kasir & Takeaway White Carrara Marble)"
      },
      {
        id: "bintaro_saladbar",
        name: "Pizza Hut - Mal Bintaro Xchange (Salad Bar)",
        shortName: "Bintaro Xchange (Salad Bar)",
        spot: "Meja Bundar Island Salad Bar & Counter Display Makanan Segar",
        material: "Batu Alam Hitam Polish Presisi Lingkaran dengan Rangka Solid Kokoh",
        images: [
          "assets/images/branches/pizzahut/bintaro_saladbar_1.jpg"
        ],
        status: "Proyek Selesai (Foto Asli)",
        waNote: "Pizza Hut Mal Bintaro Xchange (Meja Bulat Salad Bar Batu Alam)"
      },
      {
        id: "bintaro_poles",
        name: "Treatment Poles & Kristalisasi Meja Restoran",
        shortName: "Poles & Proteksi Saus",
        spot: "Diamond Grinding Rotary & Reaksi Kimia Kristalisasi Anti-Noda Saus Tomat & Minyak",
        material: "Italian Fluorosilicate Crystallization & Oleophobic Nano-Sealer",
        images: [
          "assets/images/branches/pizzahut/bintaro_poles_1.jpg"
        ],
        status: "Dokumentasi Workshop & Lapangan",
        waNote: "Layanan Poles & Proteksi Marmer Meja Restoran Tahan Noda Minyak/Saus"
      }
    ]
  },
  kfc: {
    title: "KFC Indonesia (Kentucky Fried Chicken)",
    tag: "Commercial Fast Food High-Traffic Counter",
    description: "Fabrikasi counter pemesanan kasir dan bar coffee menggunakan material terrazzo granit bintik kokoh dan higienis. Memiliki daya tahan sangat tinggi terhadap benturan baki makanan stainless dan mudah dibersihkan secara steril setiap hari.",
    branches: [
      {
        id: "kfc_done",
        name: "KFC - LA Terrace, Lenteng Agung (Hasil Jadi)",
        shortName: "LA Terrace (Hasil Jadi)",
        spot: "Counter Front Desk Kasir, Meja Pelayanan Order & Coffee Bar Terrazzo Granit",
        material: "Polished Terrazzo Granite Abu Solid, Tahan Benturan Baki Makanan",
        images: [
          "assets/images/branches/kfc/la_terrace_done.jpg"
        ],
        status: "Proyek Selesai (Foto Asli)",
        waNote: "KFC LA Terrace Lenteng Agung (Counter Front Desk & Coffee Bar Terrazzo)"
      },
      {
        id: "kfc_process",
        name: "KFC - LA Terrace, Lenteng Agung (Tahap Instalasi)",
        shortName: "LA Terrace (Instalasi)",
        spot: "Pemasangan Step Counter Bertingkat 80%, Penataan Rangka & Nat Siku Presisi",
        material: "Terrazzo Granit Fabrikasi Workshop, Sambungan Nat Rapat Presisi",
        images: [
          "assets/images/branches/kfc/la_terrace_process.jpg",
          "assets/images/real_kfc_counter.jpg"
        ],
        status: "Tahap Konstruksi 80% (Foto Asli)",
        waNote: "Pengerjaan Struktur Counter Step Bertingkat Terrazzo Restoran"
      },
      {
        id: "kfc_parung",
        name: "Workshop Waru Induk Parung (Fabrikasi Bahan Terrazzo)",
        shortName: "Workshop Parung (Bahan)",
        spot: "Pemotongan & Quality Control Lempengan Granit Terrazzo Sebelum Kirim ke Lokasi",
        material: "Slab Terrazzo Tebal Pilihan, Bridge Saw Cutting Mandiri",
        images: [
          "assets/images/branches/kfc/parung_terrazzo.jpg"
        ],
        status: "Fabrikasi Workshop Mandiri",
        waNote: "Fabrikasi Bahan Terrazzo Granit di Workshop Parung Bogor"
      },
      {
        id: "kfc_buncit",
        name: "KFC - Warung Buncit, Jakarta Selatan",
        shortName: "Warung Buncit Jaksel",
        spot: "Counter Meja Kasir Front-Desk & Top Table Meja Dining Granit",
        material: "Granit Solid Tahan Beban & Anti Zat Kimia Pembersih",
        images: [
          "assets/images/kfc.jpg"
        ],
        status: "Proyek Selesai",
        waNote: "KFC Warung Buncit Jakarta Selatan (Counter Kasir & Meja Granit)"
      }
    ]
  },
  timezone: {
    title: "Timezone Entertainment Center",
    tag: "Mall Hospitality & Reception Curved Counter",
    description: "Pengerjaan rancang bangun meja resepsionis customer service dan counter tiket kasir dengan teknik melengkung (curved counter desk) dilapisi marmer alam solid bertekstur elegan di pusat hiburan keluarga Timezone.",
    branches: [
      {
        id: "tz_bandung",
        name: "Timezone - Summarecon Mall Bandung",
        shortName: "Summarecon Mall Bandung",
        spot: "Rangka Konstruksi & Top Table Main Counter Desk Tiket / Kasir Lengkung (Curved Desk)",
        material: "Natural White Solid Marble dengan Sambungan Lengkung Halus",
        images: [
          "assets/images/branches/timezone/summarecon_bandung_1.jpg",
          "assets/images/timezone_real.jpg"
        ],
        status: "Proyek Selesai (Foto Asli)",
        waNote: "Timezone Summarecon Mall Bandung (Counter Meja Kasir Tiket Lengkung)"
      },
      {
        id: "tz_pacific",
        name: "Timezone - Pacific Place Mall, SCBD Jakarta",
        shortName: "Pacific Place SCBD",
        spot: "Meja Resepsionis Customer Service & Area Pelayanan Pengunjung",
        material: "Marmer Alam Polished Import dengan Nat Halus Tak Kasat Mata",
        images: [
          "assets/images/timezone.jpg"
        ],
        status: "Proyek Selesai",
        waNote: "Timezone Pacific Place SCBD (Customer Service Desk Marmer)"
      }
    ]
  },
  residential: {
    title: "Residensial Mewah & Sintered Stone Quadra",
    tag: "High-End Residential Architectural Stonework",
    description: "Pengerjaan eksklusif untuk interior vila dan hunian mewah. Meliputi kitchen island lempengan besar Sintered Stone Quadra (tahan gores dan panas panci mendidih), dinding marmer bookmatch kupu-kupu simetris, potongan custom undermount sink, serta backsplash Calacatta Gold.",
    branches: [
      {
        id: "res_kitchen",
        name: "Kitchen Island Quadra Sintered Stone (Semanan)",
        shortName: "Kitchen Island Quadra",
        spot: "Top Table Kitchen Island & Meja Bar Lempengan Besar Sintered Stone Quadra",
        material: "Quadra Sintered Stone Slab (Anti-Gores Pisau, Tahan Suhu Panci Panas)",
        images: [
          "assets/images/real_bookmatch_kitchen.jpg"
        ],
        status: "Hunian Mewah Selesai",
        waNote: "Kitchen Island Sintered Stone Quadra untuk Rumah Tinggal"
      },
      {
        id: "res_bookmatch",
        name: "Dinding Marmer Bookmatch (Jembatan Dua Raya)",
        shortName: "Bookmatch Kompor Tanam",
        spot: "Instalasi Dinding Urat Simetris Kupu-kupu Persis di Belakang Kompor Tanam",
        material: "Sepasang Slab Marmer Alam Bookmatched Urat Sejajar Presisi",
        images: [
          "assets/images/toptable.jpg"
        ],
        status: "Instalasi Dinding Presisi",
        waNote: "Instalasi Marmer Dinding Bookmatch Simetris untuk Area Dapur"
      },
      {
        id: "res_sink",
        name: "Custom Top Table Undermount Sink (Parung Workshop)",
        shortName: "Potongan Presisi Sink",
        spot: "Potongan Lubang Sink Tanam & Lubang Keran Air dengan Chamfering Halus",
        material: "Marmer Import Solid Bridge-Saw Cut Anti Rembes",
        images: [
          "assets/images/real_sink_toptable.jpg"
        ],
        status: "Fabrikasi Workshop Mandiri",
        waNote: "Custom Top Table Potongan Undermount Sink & Lubang Keran"
      },
      {
        id: "res_calacatta",
        name: "Backsplash Calacatta Gold (PIK & Sentul)",
        shortName: "Backsplash Calacatta",
        spot: "Dinding Dapur Urat Emas Halus dengan Finishing Kilap Kaca Basah",
        material: "Calacatta Gold Marble dengan Sealing Proteksi Minyak Masak",
        images: [
          "assets/images/real_calacatta_backsplash.jpg"
        ],
        status: "Interior Dapur Mewah Selesai",
        waNote: "Dinding Dapur Backsplash Marmer Calacatta Gold Urat Emas"
      }
    ]
  }
};

// 3. Project Detail Modal with Interactive Location Switching
function initProjectModal() {
  const modal = document.getElementById('projectModal');
  const closeBtn = document.querySelector('.editorial-modal-close');
  const triggerBtns = document.querySelectorAll('.view-project-btn, .btn-detail-link');

  if (!modal) return;

  // Modal DOM elements
  const modalTag = document.getElementById('modalTag');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalBranchTabs = document.getElementById('modalBranchTabs');
  const modalImage = document.getElementById('modalImage');
  const modalBadgeText = document.getElementById('modalBadgeText');
  const modalThumbnails = document.getElementById('modalThumbnails');
  const activeBranchName = document.getElementById('activeBranchName');
  const activeBranchSpecTag = document.getElementById('activeBranchSpecTag');
  const activeBranchSpot = document.getElementById('activeBranchSpot');
  const activeBranchSpec = document.getElementById('activeBranchSpec');
  const modalAllBranchesList = document.getElementById('modalAllBranchesList');
  const modalWaBtn = document.getElementById('modalWaBtn');

  function renderBranch(branch, project) {
    if (!branch) return;

    // Smooth image transition
    modalImage.style.opacity = '0.4';
    setTimeout(() => {
      modalImage.src = branch.images[0];
      modalImage.style.opacity = '1';
    }, 150);

    modalBadgeText.textContent = `📍 ${branch.name}`;
    activeBranchName.textContent = branch.name;
    activeBranchSpecTag.textContent = branch.status || 'Proyek Selesai';
    activeBranchSpot.textContent = branch.spot;
    activeBranchSpec.textContent = branch.material;

    // Render Thumbnails
    modalThumbnails.innerHTML = '';
    if (branch.images.length > 1) {
      modalThumbnails.style.display = 'flex';
      branch.images.forEach((imgSrc, idx) => {
        const thumb = document.createElement('div');
        thumb.className = `modal-thumb-item ${idx === 0 ? 'active' : ''}`;
        thumb.innerHTML = `<img src="${imgSrc}" alt="Foto ${branch.name} ${idx + 1}">`;
        thumb.addEventListener('click', () => {
          document.querySelectorAll('.modal-thumb-item').forEach(t => t.classList.remove('active'));
          thumb.classList.add('active');
          modalImage.style.opacity = '0.4';
          setTimeout(() => {
            modalImage.src = imgSrc;
            modalImage.style.opacity = '1';
          }, 120);
        });
        modalThumbnails.appendChild(thumb);
      });
    } else {
      modalThumbnails.style.display = 'none';
    }

    // Dynamic WhatsApp CTA tailored to this branch
    const waText = `Halo Tim PEMAPA, saya melihat portofolio pengerjaan di ${branch.name} (${branch.spot}). Boleh konsultasi untuk estimasi dan pengerjaan serupa di proyek kami?`;
    modalWaBtn.href = `https://wa.me/6282199265033?text=${encodeURIComponent(waText)}`;
  }

  function openProject(projectId) {
    const data = projectDetails[projectId];
    if (!data) return;

    modalTag.textContent = data.tag;
    modalTitle.textContent = data.title;
    modalDesc.textContent = data.description;

    // Populate Branch Selection Tabs
    modalBranchTabs.innerHTML = '';
    data.branches.forEach((b, idx) => {
      const chipBtn = document.createElement('button');
      chipBtn.className = `branch-chip-btn ${idx === 0 ? 'active' : ''}`;
      chipBtn.innerHTML = `<span class="chip-pin">📍</span> <span>${b.shortName || b.name}</span>`;
      
      chipBtn.addEventListener('click', () => {
        document.querySelectorAll('.branch-chip-btn').forEach(c => c.classList.remove('active'));
        chipBtn.classList.add('active');
        renderBranch(b, data);
      });

      modalBranchTabs.appendChild(chipBtn);
    });

    // Populate All Branches Overview
    modalAllBranchesList.innerHTML = '';
    data.branches.forEach(b => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>• ${b.name}:</strong> ${b.spot}`;
      modalAllBranchesList.appendChild(li);
    });

    // Default render first branch
    renderBranch(data.branches[0], data);

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // 1. Enable clicking on entire project-stone-card
  const projectCards = document.querySelectorAll('.project-stone-card');
  projectCards.forEach(card => {
    card.addEventListener('click', (e) => {
      const btn = card.querySelector('.view-project-btn');
      const projectId = card.dataset.project || (btn ? btn.dataset.project : card.dataset.category);
      if (projectId) {
        openProject(projectId);
      }
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const btn = card.querySelector('.view-project-btn');
        const projectId = card.dataset.project || (btn ? btn.dataset.project : card.dataset.category);
        if (projectId) {
          openProject(projectId);
        }
      }
    });
  });

  // 2. Direct button triggers
  triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent duplicate bubbling
      e.preventDefault();
      const projectId = btn.dataset.project;
      if (projectId) openProject(projectId);
    });
  });

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
  });
}

// 4. Quick Quote & Material Estimator
function initEstimator() {
  const serviceSelect = document.getElementById('calcService');
  const materialSelect = document.getElementById('calcMaterial');
  const sizeInput = document.getElementById('calcSize');
  const outService = document.getElementById('outService');
  const outMaterial = document.getElementById('outMaterial');
  const outSize = document.getElementById('outSize');
  const outTotal = document.getElementById('outTotal');
  const calcWaBtn = document.getElementById('calcWaBtn');

  if (!serviceSelect || !sizeInput) return;

  function updateCalculation() {
    const service = serviceSelect.options[serviceSelect.selectedIndex].text;
    const material = materialSelect.options[materialSelect.selectedIndex].text;
    const size = parseFloat(sizeInput.value) || 1;

    let baseRate = 850000;
    const serviceVal = serviceSelect.value;
    const matVal = materialSelect.value;

    if (serviceVal === 'toptable') {
      baseRate = matVal === 'quadra' ? 1750000 : (matVal === 'granit' ? 1250000 : 1500000);
      outSize.textContent = `${size} Meter Lari (m¹)`;
    } else if (serviceVal === 'pasang') {
      baseRate = matVal === 'quadra' ? 450000 : 350000;
      outSize.textContent = `${size} m²`;
    } else if (serviceVal === 'poles') {
      baseRate = 95000;
      outSize.textContent = `${size} m²`;
    } else if (serviceVal === 'backsplash') {
      baseRate = matVal === 'quadra' ? 1400000 : 1100000;
      outSize.textContent = `${size} m²`;
    }

    const estimatedCost = baseRate * size;
    const formattedCost = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(estimatedCost);

    outService.textContent = service.split('(')[0].trim();
    outMaterial.textContent = material.split('(')[0].trim();
    outTotal.textContent = formattedCost;

    const message = `Halo PEMAPA (Pesona Marmer Alam Parung), saya ingin konsultasi perkiraan biaya:\n- Layanan: ${service}\n- Material: ${material}\n- Estimasi Volume: ${sizeInput.value}\n- Perkiraan Indikatif: ${formattedCost}\n\nMohon informasi ketersediaan slab dan jadwal survei ke lokasi saya. Terima kasih!`;
    calcWaBtn.href = `https://wa.me/6282199265033?text=${encodeURIComponent(message)}`;
  }

  serviceSelect.addEventListener('change', updateCalculation);
  materialSelect.addEventListener('change', updateCalculation);
  sizeInput.addEventListener('input', updateCalculation);

  updateCalculation();
}

// 5. Copy Address Button
function initCopyAddress() {
  const copyBtn = document.getElementById('copyAddressBtn');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', () => {
    const addressText = "JL GAMANG RT05/RW04 waru induk, gamang, parung kabupaten bogor, Bogor, Indonesia 16330";
    navigator.clipboard.writeText(addressText).then(() => {
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = `
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
        </svg> Alamat Berhasil Tersalin!
      `;
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
      }, 2500);
    });
  });
}

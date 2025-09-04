'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const researchCards = [
  {
    href: "/excavations-explorations",
    imgSrc: "/images/excavation-and-explorations.png",
    title: "Excavations and Explorations"
  },
  {
    href: "/scientific-debris-clearance",
    imgSrc: "/images/scientific-debris-clearance.png",
    title: "Scientific Debris Clearance"
  },
  {
    href: "/conservation-and-preservation",
    imgSrc: "/images/conservation-preservation.png",
    title: "Conservation and Preservation"
  }
];

const activityCards = [
  {
    href: "/exhibitions",
    imgSrc: "/images/training-and-seminars.png",
    title: "Exhibitions"
  },
  {
    href: "/training-and-seminars",
    imgSrc: "/images/training-and-seminar.jpg",
    title: "Training & Seminars"
  }
];


export default function HomePage() {
  useEffect(() => {
    const bootstrapCss = document.createElement('link');
    bootstrapCss.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css';
    bootstrapCss.rel = 'stylesheet';
    bootstrapCss.id = 'bootstrap-css';
    document.head.appendChild(bootstrapCss);

    const bootstrapJs = document.createElement('script');
    bootstrapJs.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js';
    bootstrapJs.id = 'bootstrap-js';
    bootstrapJs.async = true;
    document.body.appendChild(bootstrapJs);

    return () => {
      document.getElementById('bootstrap-css')?.remove();
      document.getElementById('bootstrap-js')?.remove();
    };
  }, []);
  return (
    <div className="layout-wrapper landing">
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-landing navbar-light fixed-top" id="navbar">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center" href="/">
            <Image src="/images/logo.png" alt="Logo" width={50} height={50} />
            <div className="ms-2 d-none d-sm-block">
              <div style={{ fontSize: '0.9rem' }}>Directorate of Archaeology, Archives and Museums</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 300 }}>Government of Madhya Pradesh</div>
            </div>
          </Link>
          <button className="navbar-toggler py-0 fs-20 text-body" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <i className="mdi mdi-menu"></i>
          </button>
          <div >
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
              
              <li className="nav-item ms-lg-2">
                <Link href="/WMS/login" className="btn btn-danger">
                  WMS Login
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="vh-100 d-flex align-items-end justify-content-center position-relative text-center" style={{ backgroundImage: `url('/images/hero-banner.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
           <div className="bg-overlay"></div>
           <h1 className="text-white mb-5 z-1" style={{ fontSize: '2.5rem' }}>
              Gujari Mahal Archaeological Museum, Gwalior
            </h1>
        </section>

        {/* Welcome Section */}
        <section className="section" id="welcome">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-12 text-center">
                <h5 className="text-uppercase text-dark">Welcome to the</h5>
                <h1 className="mb-3" style={{ maxWidth: '800px', margin: 'auto' }}>Directorate of Archaeology, Archives and Museums M.P.</h1>
                <div className="content-paper-bg">
                  <p>
                    Madhya Pradesh has a diverse and rich cultural heritage from prehistoric times to the 20th century CE. It includes forts and palaces, temples and mathas, mosques and tombs, prehistoric shelters and habitational mounds, ponds and step-wells, cenotaphs and memorial pillars, sculptures and architectural fragments, and more.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Attractions Section */}
        <section className="section" style={{ backgroundImage: `url('/images/beige-bg.jpg')`}}>
            <div className="container">
                <div className="text-center mb-5">
                    <h1>Attractions</h1>
                    <p>Discover Madhya Pradesh's rich heritage through its ancient monuments, interactive museums, and vast archival treasures.</p>
                </div>
                <div className="row">
                    <div className="col-md-4">
                        <div className="card-content">
                             <Image src="/images/attractions-museums.jfif" alt="Museums" width={600} height={400} className="img-fluid rounded-4"/>
                             <div className="card-overlay-text">
                                 <h2 className="text-white">Museums</h2>
                                 <Link href="/museums" className="btn bg-golden rounded-pill mt-2">READ MORE</Link>
                             </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                         <div className="card-content">
                             <Image src="/images/attractions-monuments.jfif" alt="Monuments" width={600} height={400} className="img-fluid rounded-4"/>
                             <div className="card-overlay-text">
                                 <h2 className="text-white">Monuments</h2>
                                 <Link href="/monuments" className="btn bg-golden rounded-pill mt-2">READ MORE</Link>
                             </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                         <div className="card-content">
                             <Image src="/images/attractions-archives.jfif" alt="Archives" width={600} height={400} className="img-fluid rounded-4"/>
                             <div className="card-overlay-text">
                                 <h2 className="text-white">Archives</h2>
                                 <Link href="/archive" className="btn bg-golden rounded-pill mt-2">READ MORE</Link>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Research Section */}
        <section className="section">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-lg-3">
                         <h1>Research</h1>
                         <p>Dive into the latest research and findings from the field of archaeology and heritage conservation.</p>
                         <Link href="/research" className="btn bg-golden rounded-pill mt-4">READ MORE</Link>
                    </div>
                    <div className="col-lg-9">
                        <div className="row">
                            {researchCards.map(card => (
                                <div key={card.title} className="col-md-4">
                                    <Link href={card.href}>
                                        <div className="card-slide">
                                            <Image src={card.imgSrc} alt={card.title} width={400} height={500} className="img-fluid rounded-4"/>
                                            <div className="card-overlay-text d-flex justify-content-between">
                                                <h3 className="text-white">{card.title}</h3>
                                                <i className="ri-arrow-right-s-line fs-2 text-white"></i>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>

         {/* Activities Section */}
        <section className="section" style={{ backgroundImage: `url('/images/beige-bg.jpg')`}}>
             <div className="container">
                <div className="row align-items-center">
                     <div className="col-lg-9">
                        <div className="row">
                             {activityCards.map(card => (
                                <div key={card.title} className="col-md-6">
                                    <Link href={card.href}>
                                        <div className="card-slide">
                                            <Image src={card.imgSrc} alt={card.title} width={400} height={500} className="img-fluid rounded-4"/>
                                            <div className="card-overlay-text d-flex justify-content-between">
                                                <h3 className="text-white">{card.title}</h3>
                                                <i className="ri-arrow-right-s-line fs-2 text-white"></i>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col-lg-3">
                         <h1>Activities</h1>
                         <p>Join us for immersive experiences and hands-on activities that bring history to life!</p>
                         <Link href="/activities" className="btn bg-golden rounded-pill mt-4">READ MORE</Link>
                    </div>
                </div>
            </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="text-white bg-dark pt-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-5 border-end d-flex align-items-center mb-4 mb-lg-0">
                <Image src="/images/logo.png" alt="Footer Logo" width={75} height={75} />
                <div className="ms-3">
                  <h5 className="text-white">Directorate of Archaeology, Archives and Museums</h5>
                  <div className="small">Government of Madhya Pradesh</div>
                </div>
            </div>
            <div className="col-lg-3 border-end py-4 py-lg-0 text-center">
                 <h6 className="text-uppercase" style={{color: '#e2b13c'}}>Follow us on</h6>
                 <div className="mt-3">
                    <Link href="https://www.facebook.com/MPDirectorateArchaeology" target="_blank" className="social-icon"><i className="ri-facebook-fill fs-3"></i></Link>
                    <Link href="https://www.youtube.com/@DirectorateArchaeologyMP" target="_blank" className="social-icon"><i className="ri-youtube-fill fs-3"></i></Link>
                    <Link href="https://x.com/dir_arch_mp" target="_blank" className="social-icon"><i className="ri-twitter-x-fill fs-3"></i></Link>
                 </div>
            </div>
             <div className="col-lg-4 ps-lg-4 py-4 py-lg-0">
                <h6 className="text-uppercase" style={{color: '#e2b13c'}}>Important Links</h6>
                 <ul className="list-unstyled footer-list mt-3">
                    <li><Link href="/website-policies">Website Policies</Link></li>
                    <li><Link href="/terms-conditions">Terms & Conditions</Link></li>
                    <li><Link href="/sitemap">Sitemap</Link></li>
                </ul>
            </div>
          </div>
        </div>
        <div className="mt-5 text-center py-3" style={{backgroundColor: '#1E1D28'}}>
            <p className="copy-rights mb-0">© 2025 Directorate of Archaeology, Archives and Museums Madhya Pradesh</p>
        </div>
      </footer>
    </div>
  );
}
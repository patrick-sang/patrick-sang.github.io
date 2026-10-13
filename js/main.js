(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 45) {
            $('.navbar').addClass('sticky-top shadow-sm');
        } else {
            $('.navbar').removeClass('sticky-top shadow-sm');
        }
    });
    
    // Dropdown on mouse hover
    const $dropdown = $(".dropdown");
    const $dropdownToggle = $(".dropdown-toggle");
    const $dropdownMenu = $(".dropdown-menu");
    const showClass = "show";
    
    $(window).on("load resize", function() {
        if (this.matchMedia("(min-width: 992px)").matches) {
            $dropdown.hover(
            function() {
                const $this = $(this);
                $this.addClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "true");
                $this.find($dropdownMenu).addClass(showClass);
            },
            function() {
                const $this = $(this);
                $this.removeClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "false");
                $this.find($dropdownMenu).removeClass(showClass);
            }
            );
        } else {
            $dropdown.off("mouseenter mouseleave");
        }
    });


    // Facts counter
    $('[data-toggle="counter-up"]').counterUp({
        delay: 10,
        time: 2000
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        dots: true,
        loop: true,
        center: true,
        responsive: {
            0:{
                items:1
            },
            576:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            }
        }
    });


    // Vendor carousel
    $('.vendor-carousel').owlCarousel({
        loop: true,
        margin: 45,
        dots: false,
        loop: true,
        autoplay: true,
        smartSpeed: 1000,
        responsive: {
            0:{
                items:2
            },
            576:{
                items:4
            },
            768:{
                items:6
            },
            992:{
                items:8
            }
        }
    });
    
})(jQuery);
const logosWrappers = document.querySelectorAll(".logo-group");

const sleep = (number) => new Promise((res) => setTimeout(res, number));

logosWrappers.forEach(async (logoWrapper, i) => {
  const logos = Array.from(logoWrapper.children);
  await sleep(1400 * i);
  setInterval(() => {
    let temp = logos[0];
    logos[0] = logos[1];
    logos[1] = logos[2];
    logos[2] = temp;
    logos[0].classList.add("hide", "to-top");
    logos[1].classList.remove("hide", "to-top", "to-bottom");
    logos[2].classList.add("hide", "to-bottom");
  }, 5600);
});

yearEl.textContent = new Date().getFullYear();
document.querySelectorAll('.faq-item h3, .faq-item .faq-toggle').forEach((faqItem) => {
  faqItem.addEventListener('click', () => {
    faqItem.parentNode.classList.toggle('faq-active');
  });
});
<script>
/* ===== EDIT YOUR CONTENT HERE ===== */
const JOURNEY=[
  {when:"2020",title:"Where it started",text:"Add the moment you first got into maps, GIS or surveying."},
  {when:"Year",title:"First professional GIS role",text:"Add the organisation, what you built and what you learned."},
  {when:"Year",title:"Going independent",text:"Add when you started taking client work and the first clients you served."},
  {when:"Year",title:"Scaling the stack",text:"Moving from desktop GIS to PostGIS, web mapping, Airflow pipelines and GeoAI."},
  {when:"Now",title:"Figuring out what geospatial can do",text:"Routing, spatial regression, remote sensing and dashboards for businesses across Kenya."}
];
const LABS=[
  {t:"H3 hex-grid demand explorer",d:"DuckDB spatial + H3 aggregation rendered with Deck.gl.",tags:["DuckDB","H3","Deck.gl"],s:"Prototype",u:""},
  {t:"Multi-depot route optimiser",d:"Jsprit and GraphHopper with motorcycle profiles on OSM data.",tags:["Jsprit","GraphHopper","OSM"],s:"Prototype",u:""},
  {t:"NDVI change monitor",d:"Sentinel-2 vegetation trends over farm blocks using Google Earth Engine.",tags:["Sentinel-2","GEE"],s:"In progress",u:""},
  {t:"LISA hotspot notebook",d:"Spatial autocorrelation and local clusters with PySAL.",tags:["PySAL","Python"],s:"Idea",u:""}
];
const POSTS=[
  {t:"Why I moved my spatial queries to DuckDB",d:"2026-01-10",c:"Data engineering",x:"Add your summary here.",u:"#"},
  {t:"A practical guide to hotspot analysis",d:"2025-11-02",c:"Spatial analysis",x:"Add your summary here.",u:"#"},
  {t:"Routing deliveries by motorbike in Nairobi",d:"2025-09-18",c:"Routing",x:"Add your summary here.",u:"#"}
];
const PROJECTS=[
  {t:"Farm block monitoring portal",c:"web",l:"Web-GIS",u:"fineproject.html"},
  {t:"Retail catchment hotspot study",c:"da",l:"Data Analysis",u:"fineproject.html"},
  {t:"Site suitability scoring model",c:"ml",l:"Machine Learning",u:"fineproject.html"},
  {t:"Routing outputs REST service",c:"api",l:"API Integration",u:"fineproject.html"},
  {t:"Asset management web map",c:"web",l:"Web-GIS",u:"fineproject.html"},
  {t:"Spatial regression of sales",c:"da",l:"Data Analysis",u:"fineproject.html"}
];
/* ===== END EDIT ===== */

const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

$("#tl").innerHTML=JOURNEY.map(j=>`<li><time>${esc(j.when)}</time><h3>${esc(j.title)}</h3><p>${esc(j.text)}</p></li>`).join("");
$("#labgrid").innerHTML=LABS.map(l=>`<article class="card lab"><span class="status">${esc(l.s)}</span><h3>${esc(l.t)}</h3><p>${esc(l.d)}</p><div>${l.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div>${l.u?`<a class="more" href="${esc(l.u)}">Open lab →</a>`:""}</article>`).join("");
$("#prjgrid").innerHTML=PROJECTS.map(p=>`<a class="card" data-c="${p.c}" href="${p.u}" style="text-decoration:none"><span class="tag">${esc(p.l)}</span><h3 style="margin-top:10px">${esc(p.t)}</h3></a>`).join("");

const cats=["All",...new Set(POSTS.map(p=>p.c))];
$("#blogtabs").innerHTML=cats.map((c,i)=>`<button aria-pressed="${i==0}" data-f="${esc(c)}">${esc(c)}</button>`).join("");
$("#bloggrid").innerHTML=POSTS.map(p=>`<article class="card post" data-c="${esc(p.c)}"><time datetime="${p.d}">${new Date(p.d).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</time><h3><a href="${esc(p.u)}">${esc(p.t)}</a></h3><p>${esc(p.x)}</p><span class="tag" style="width:max-content">${esc(p.c)}</span></article>`).join("");

/* filters */
function filter(tabs,grid,all){
  const t=$(tabs),g=$(grid);
  t.addEventListener("click",e=>{
    const b=e.target.closest("button");if(!b)return;
    t.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",x===b));
    const f=b.dataset.f;
    g.children.length&&[...g.children].forEach(c=>c.hidden=!(f===all||c.dataset.c===f||c.dataset.c==="all"&&f==="all"));
  });
}
filter("#svctabs","#svcgrid","all");filter("#prjtabs","#prjgrid","all");filter("#blogtabs","#bloggrid","All");

/* nav, theme */
$("#burger").onclick=e=>{const o=$("#links").classList.toggle("open");e.currentTarget.setAttribute("aria-expanded",o)};
$("#links").addEventListener("click",()=>$("#links").classList.remove("open"));
$("#theme").onclick=()=>{const r=document.documentElement,d=r.dataset.theme?r.dataset.theme==="dark":matchMedia("(prefers-color-scheme:dark)").matches;r.dataset.theme=d?"light":"dark"};

/* counters */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;io.unobserve(e.target);const n=+e.target.dataset.n;let i=0;const st=Math.max(1,Math.round(n/50));const t=setInterval(()=>{i=Math.min(n,i+st);e.target.textContent=i;if(i>=n)clearInterval(t)},30)}));
document.querySelectorAll("[data-n]").forEach(el=>io.observe(el));

/* forms (open the visitor's mail app; swap for Formspree or similar later) */
$("#cform").onsubmit=e=>{e.preventDefault();const b=`Name: ${$("#n").value}\nEmail: ${$("#e").value}\nService: ${$("#s").value}\n\n${$("#m").value}`;location.href=`mailto:sangpatrick211@gmail.com?subject=${encodeURIComponent("Discovery call: "+$("#s").value)}&body=${encodeURIComponent(b)}`};
$("#sub").onsubmit=e=>{e.preventDefault();location.href=`mailto:sangpatrick211@gmail.com?subject=Subscribe&body=${encodeURIComponent("Please add me: "+$("#se").value)}`};
</script>
</body>
</html>

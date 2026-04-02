"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AppImage from "@/components/ui/AppImage";
import Icon from "@/components/ui/AppIcon";
import { createClient } from "@/lib/supabase/client";
import PWAInstallPrompt from "./components/PWAInstallPrompt";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type SliderLayout = 1 | 2 | 3 | 4;

interface SliderConfig {
  layout: SliderLayout;
  images: string[][];
}

interface DriveImage {
  id: string;
  name: string;
  thumbUrl: string;
  fullUrl: string;
}

interface GalleryTopic {
  id: string;
  label: string;
  icon: string;
  sectionName: string;
  folderId: string | null;
  images: DriveImage[];
  loaded: boolean;
}

interface VideoItem {
  id: string;
  title: string;
  youtubeUrl: string;
  thumbnailUrl: string;
}

interface GallerySource {
  section_name: string;
  drive_folder_link: string;
  max_images: number;
  auto_slide_seconds: number;
}

// ─────────────────────────────────────────────
// CLIENT-SIDE IMAGE CACHE (5 min TTL)
// ─────────────────────────────────────────────
const imageCache = new Map<string, { images: DriveImage[]; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchDriveImages(folderId: string): Promise<DriveImage[]> {
  if (!folderId) return [];
  const cached = imageCache.get(folderId);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.images;
  try {
    const res = await fetch(`/api/drive/images?folderId=${encodeURIComponent(folderId)}`);
    if (!res.ok) return [];
    const data = await res.json();
    const images: DriveImage[] = data.images ?? [];
    imageCache.set(folderId, { images, ts: Date.now() });
    return images;
  } catch {
    return [];
  }
}

function extractFolderId(link: string): string | null {
  if (!link) return null;
  const folderMatch = link.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch) return folderMatch[1];
  const idMatch = link.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];
  if (/^[a-zA-Z0-9_-]{10,}$/.test(link.trim())) return link.trim();
  return null;
}

// ─────────────────────────────────────────────
// MOCK DATA (fallback only)
// ─────────────────────────────────────────────
const SLIDER_CONFIG: SliderConfig = {
  layout: 2,
  images: [
    [
      "https://images.pexels.com/photos/256395/pexels-photo-256395.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1580460/pexels-photo-1580460.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
    [
      "https://images.pexels.com/photos/8471788/pexels-photo-8471788.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/4145354/pexels-photo-4145354.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
    [
      "https://images.pexels.com/photos/2781814/pexels-photo-2781814.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1164572/pexels-photo-1164572.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
    [
      "https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/1720186/pexels-photo-1720186.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/8471831/pexels-photo-8471831.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
  ],
};

const GALLERY_TOPIC_DEFS: { id: string; label: string; icon: string; sectionName: string; fallbackImages: { src: string; alt: string }[] }[] = [
  {
    id: "correspondent", label: "Our Correspondent", icon: "UserCircleIcon", sectionName: "correspondent",
    fallbackImages: [
      { src: "https://img.rocket.new/generatedImages/rocket_gen_img_106976c27-1772940119169.png", alt: "School correspondent at official function" },
      { src: "https://img.rocket.new/generatedImages/rocket_gen_img_1e72ba81a-1772940120851.png", alt: "Correspondent addressing school assembly" },
    ],
  },
  {
    id: "principal", label: "Our Principal", icon: "AcademicCapIcon", sectionName: "principal",
    fallbackImages: [
      { src: "https://img.rocket.new/generatedImages/rocket_gen_img_1b779469c-1772940118216.png", alt: "Principal in school office" },
      { src: "https://img.rocket.new/generatedImages/rocket_gen_img_1d6fc5dd2-1772940118221.png", alt: "Principal addressing students at assembly" },
    ],
  },
  {
    id: "campus", label: "Our Campus", icon: "BuildingLibraryIcon", sectionName: "campus",
    fallbackImages: [
      { src: "https://img.rocket.new/generatedImages/rocket_gen_img_1b5ada478-1772940120556.png", alt: "School building front entrance" },
      { src: "https://img.rocket.new/generatedImages/rocket_gen_img_118c6f406-1772940119942.png", alt: "School auditorium interior" },
    ],
  },
  {
    id: "teachers", label: "Our Teachers", icon: "UsersIcon", sectionName: "teachers",
    fallbackImages: [
      { src: "https://img.rocket.new/generatedImages/rocket_gen_img_180d9fbff-1772782290473.png", alt: "Teacher explaining lesson on whiteboard" },
      { src: "https://images.unsplash.com/photo-1578593139862-d9b9d9693d57", alt: "Teacher with students in classroom" },
    ],
  },
  {
    id: "admins", label: "Our Admin Staff", icon: "BriefcaseIcon", sectionName: "admins",
    fallbackImages: [
      { src: "https://img.rocket.new/generatedImages/rocket_gen_img_10f1c1b72-1769177910265.png", alt: "Administrative staff at school office" },
      { src: "https://images.unsplash.com/photo-1565882694798-4c9d004e65b7", alt: "Office team working together" },
    ],
  },
  {
    id: "supporting_staff", label: "Supporting Staff", icon: "HeartIcon", sectionName: "supporting_staff",
    fallbackImages: [
      { src: "https://img.rocket.new/generatedImages/rocket_gen_img_1b532f096-1772940118092.png", alt: "Support staff maintaining school premises" },
      { src: "https://img.rocket.new/generatedImages/rocket_gen_img_1a27560dd-1772940119203.png", alt: "School maintenance team" },
    ],
  },
  {
    id: "sports_events", label: "Sports Events", icon: "TrophyIcon", sectionName: "sports_events",
    fallbackImages: [
      { src: "https://img.rocket.new/generatedImages/rocket_gen_img_11018b29c-1764705621473.png", alt: "Students competing in annual sports day running event" },
      { src: "https://img.rocket.new/generatedImages/rocket_gen_img_1db55c2c3-1772940119863.png", alt: "Basketball match between school teams" },
    ],
  },
  {
    id: "cultural_events", label: "Cultural Events", icon: "MusicalNoteIcon", sectionName: "cultural_events",
    fallbackImages: [
      { src: "https://img.rocket.new/generatedImages/rocket_gen_img_18a620310-1772280817214.png", alt: "Students performing classical dance on stage" },
      { src: "https://img.rocket.new/generatedImages/rocket_gen_img_13e91b5e7-1772940121661.png", alt: "School cultural programme with colorful costumes" },
    ],
  },
  {
    id: "tours", label: "Tours", icon: "MapPinIcon", sectionName: "tours",
    fallbackImages: [
      { src: "https://img.rocket.new/generatedImages/rocket_gen_img_113cf0e4e-1772940117676.png", alt: "Students on educational tour at heritage site" },
      { src: "https://img.rocket.new/generatedImages/rocket_gen_img_10f071b95-1772940119506.png", alt: "School trip group photo at museum" },
    ],
  },
  {
    id: "toppers", label: "Toppers", icon: "StarIcon", sectionName: "toppers",
    fallbackImages: [
      { src: "https://img.rocket.new/generatedImages/rocket_gen_img_1897565b2-1772940120541.png", alt: "Board exam toppers receiving awards from principal" },
      { src: "https://img.rocket.new/generatedImages/rocket_gen_img_131c2281d-1772940122593.png", alt: "Class toppers on prize distribution day" },
    ],
  },
  {
    id: "hall_of_fame", label: "Hall of Fame", icon: "FireIcon", sectionName: "hall_of_fame",
    fallbackImages: [
      { src: "https://images.unsplash.com/photo-1658586739406-14dc82dc8c64", alt: "Distinguished alumni honoured at school function" },
      { src: "https://img.rocket.new/generatedImages/rocket_gen_img_18b2ce6a0-1767649060451.png", alt: "School hall of fame display wall" },
    ],
  },
];

// Helper: extract YouTube ID from any YouTube URL format
function extractYouTubeId(url: string): string {
  if (!url) return "";
  // Handles: youtu.be/ID, ?v=ID, &v=ID, /embed/ID, /v/ID, /shorts/ID
  return (
    url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/v\/|\/shorts\/)([A-Za-z0-9_-]{11})/)?.[1] ?? ""
  );
}

// Helper: map DB row to VideoItem
function mapVideoRow(row: { id: string; title: string; youtube_url: string }): VideoItem {
  const ytId = extractYouTubeId(row.youtube_url);
  return {
    id: row.id,
    title: row.title,
    youtubeUrl: row.youtube_url,
    thumbnailUrl: ytId
      ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
      : "/assets/images/no_image.png",
  };
}

// ─────────────────────────────────────────────
// HERO SLIDER COMPONENT
// ─────────────────────────────────────────────
const HeroSlider: React.FC<{ config: SliderConfig }> = ({ config }) => {
  const [layout, setLayout] = useState<SliderLayout>(config.layout);
  const [images, setImages] = useState<string[][]>([]);
  const [loaded, setLoaded] = useState(false);
  const [indices, setIndices] = useState<number[]>(Array(config.layout).fill(0));
  const [autoSlideSeconds, setAutoSlideSeconds] = useState(3);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const imagesRef = useRef<string[][]>([]);

  // Keep ref in sync with state so interval always has latest images
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    const loadHeroImages = async () => {
      const supabase = createClient();

      // First try gallery_sources for Drive link
      const { data: sourceData } = await supabase
        .from("gallery_sources")
        .select("drive_folder_link, auto_slide_seconds")
        .eq("section_name", "hero_slider")
        .single();

      if (sourceData?.drive_folder_link) {
        const folderId = extractFolderId(sourceData.drive_folder_link);
        if (folderId) {
          const driveImages = await fetchDriveImages(folderId);
          if (driveImages.length > 0) {
            const slideSeconds = sourceData.auto_slide_seconds ?? 3;
            setAutoSlideSeconds(slideSeconds);
            // Distribute images across layout slots
            const dbLayout = Math.min(config.layout, 4) as SliderLayout;
            const perSlot = Math.ceil(driveImages.length / dbLayout);
            const slotImages: string[][] = Array(dbLayout).fill(null).map((_, i) =>
              driveImages.slice(i * perSlot, (i + 1) * perSlot).map((img) => img.thumbUrl)
            );
            setLayout(dbLayout);
            setImages(slotImages);
            setIndices(Array(dbLayout).fill(0));
            setLoaded(true);
            return;
          }
        }
      }

      // Fall back to hero_images DB table
      const { data, error } = await supabase
        .from("hero_images")
        .select("src, slot, sort_order")
        .order("slot", { ascending: true })
        .order("sort_order", { ascending: true });

      if (error || !data || data.length === 0) {
        setLayout(config.layout);
        setImages(config.images);
        setIndices(Array(config.layout).fill(0));
        setLoaded(true);
        return;
      }

      const maxSlot = Math.max(...data.map((r: { slot: number }) => r.slot));
      const dbLayout = Math.min(Math.max(maxSlot + 1, 1), 4) as SliderLayout;
      const grouped: string[][] = Array(dbLayout).fill(null).map(() => []);
      data.forEach((row: { src: string; slot: number }) => {
        if (row.slot < dbLayout) grouped[row.slot].push(row.src);
      });
      const finalImages = grouped.map((slotImgs, i) =>
        slotImgs.length > 0 ? slotImgs : (config.images[i] ?? [])
      );
      setLayout(dbLayout);
      setImages(finalImages);
      setIndices(Array(dbLayout).fill(0));
      setLoaded(true);
    };
    loadHeroImages();
  }, [config.layout, config.images]);

  // Real-time: re-fetch if hero_slider source changes
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("hero_slider_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "gallery_sources", filter: "section_name=eq.hero_slider" },
        async (payload) => {
          const newLink = (payload.new as GallerySource)?.drive_folder_link;
          const newSlideSeconds = (payload.new as GallerySource)?.auto_slide_seconds ?? 3;
          if (newLink) {
            const folderId = extractFolderId(newLink);
            if (folderId) {
              imageCache.delete(folderId);
              const driveImages = await fetchDriveImages(folderId);
              if (driveImages.length > 0) {
                setAutoSlideSeconds(newSlideSeconds);
                const dbLayout = Math.min(config.layout, 4) as SliderLayout;
                const perSlot = Math.ceil(driveImages.length / dbLayout);
                const slotImages: string[][] = Array(dbLayout).fill(null).map((_, i) =>
                  driveImages.slice(i * perSlot, (i + 1) * perSlot).map((img) => img.thumbUrl)
                );
                setLayout(dbLayout);
                setImages(slotImages);
                setIndices(Array(dbLayout).fill(0));
              }
            }
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [config.layout]);

  const tick = useCallback(() => {
    setIndices((prev) =>
      prev.map((idx, slot) => {
        const pool = imagesRef.current[slot] ?? [];
        return pool.length > 1 ? (idx + 1) % pool.length : 0;
      })
    );
  }, []);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (loaded && images.some((slot) => slot.length > 1)) {
      timerRef.current = setInterval(tick, autoSlideSeconds * 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [tick, autoSlideSeconds, loaded, images]);

  const getGridClass = () => {
    switch (layout) {
      case 1: return "grid-cols-1";
      case 2: return "grid-cols-2";
      case 3: return "grid-cols-3";
      case 4: return "grid-cols-2 grid-rows-2";
      default: return "grid-cols-1";
    }
  };

  const slotCount = Math.min(layout, Math.max(images.length, 1));

  if (!loaded) {
    return (
      <section id="home" className="relative w-full h-screen overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 animate-pulse" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
          <div className="h-8 w-64 bg-white/20 rounded-full mb-4 animate-pulse" />
          <div className="h-16 w-96 bg-white/20 rounded-2xl mb-4 animate-pulse" />
          <div className="h-6 w-48 bg-white/20 rounded-full animate-pulse" />
        </div>
      </section>
    );
  }

  return (
    <section id="home" className="relative w-full h-screen overflow-hidden">
      <div className={`grid ${getGridClass()} w-full h-full`}>
        {Array.from({ length: slotCount }).map((_, slot) => {
          const pool = images[slot] ?? [];
          const currentIdx = indices[slot] ?? 0;
          return (
            <div key={slot} className="relative overflow-hidden">
              {pool.map((src, imgIdx) => (
                <div
                  key={src}
                  className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                  style={{ opacity: imgIdx === currentIdx ? 1 : 0, zIndex: imgIdx === currentIdx ? 1 : 0 }}
                >
                  <AppImage
                    src={src}
                    alt={`School campus view ${slot + 1}`}
                    fill
                    className="object-cover"
                    priority={slot === 0 && imgIdx === 0}
                    unoptimized
                  />
                </div>
              ))}
              <div className="absolute inset-0 hero-overlay" style={{ zIndex: 2 }} />
            </div>
          );
        })}
      </div>

      {/* Overlay Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10 pointer-events-none">
        <div className="accent-badge px-4 py-1.5 rounded-full mb-6 animate-fadeInUp">
          Estd. 2003 · State Board · English Medium
        </div>
        <h1 className="font-heading font-800 text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-3 animate-fadeInUp delay-100 drop-shadow-2xl">
          Sri Saraswathi Vidhya Mandir
        </h1>
        <p className="font-heading font-600 text-accent text-lg sm:text-xl md:text-2xl mb-4 animate-fadeInUp delay-200 tracking-wide">
          Matriculation School
        </p>
        <p className="font-body text-white/85 text-base sm:text-lg mb-8 animate-fadeInUp delay-300 tracking-[0.12em] uppercase">
          Research · Self Confidence · Humility
        </p>
        <div className="flex flex-col sm:flex-row gap-4 animate-fadeInUp delay-400 pointer-events-auto">
          <button
            onClick={() => { const el = document.getElementById("about"); if (el) el.scrollIntoView({ behavior: "smooth" }); }}
            className="px-8 py-3.5 bg-accent text-dark rounded-full font-heading font-700 text-sm hover:bg-accent-dark transition-all duration-300 shadow-lg hover:-translate-y-1">
            Discover Our School
          </button>
          <button
            onClick={() => { const el = document.getElementById("contact"); if (el) el.scrollIntoView({ behavior: "smooth" }); }}
            className="px-8 py-3.5 border-2 border-white/60 text-white rounded-full font-heading font-700 text-sm hover:bg-white hover:text-primary transition-all duration-300 hover:-translate-y-1">
            Contact Us
          </button>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
          <span className="text-white/50 text-[10px] tracking-[0.4em] uppercase font-heading">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </div>

      {/* Slide Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {(images[0] ?? []).map((_, i) => (
          <button
            key={i}
            onClick={() => setIndices((prev) => prev.map((_, s) => i % (images[s]?.length || 1)))}
            className={`slider-dot ${indices[0] === i ? "active" : ""}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────
// ABOUT SECTION
// ─────────────────────────────────────────────
const AboutSection: React.FC = () => {
  const stats = [
    { value: "1997", label: "Year Founded" },
    { value: "KG–XII", label: "Classes Offered" },
    { value: "20:1", label: "Student–Teacher Ratio" },
    { value: "100%", label: "English Medium" },
  ];

  return (
    <section id="about" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-4 reveal">
          <div className="h-px w-10 bg-primary" />
          <span className="accent-badge px-3 py-1 rounded-full">About Us</span>
        </div>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <h2 className="font-heading font-800 text-3xl sm:text-4xl md:text-5xl text-foreground leading-tight mb-6 reveal">
              Building Character,<br />
              <span className="text-primary">Shaping Futures</span>
            </h2>
            <p className="font-body text-muted text-lg leading-relaxed mb-6 reveal">
              Founded in 1997, Sri Saraswathi Vidhya Mandir Matriculation School has been a beacon of quality education in Ayanambakkam, Chennai. Our school follows the Tamil Nadu State Board curriculum with English as the medium of instruction.
            </p>
            <p className="font-body text-muted text-base leading-relaxed mb-8 reveal">
              Our main aim is to help and train children according to their own abilities and potentialities — developing their talent, character, and personalities through individual attention. We believe every child is unique and deserves the opportunity to flourish.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 reveal">
              {["Research", "Self Confidence", "Humility"].map((val) => (
                <div key={val} className="flex items-center gap-2 p-3 bg-surface rounded-xl border border-red-100">
                  <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                  <span className="font-heading font-600 text-sm text-primary">{val}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-primary-lg reveal">
              <AppImage
                src="https://images.unsplash.com/photo-1611581719398-08fe2eb020c7"
                alt="Students engaged in classroom learning at Sri Saraswathi Vidhya Mandir"
                width={600}
                height={420}
                className="w-full object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="font-heading font-700 text-white text-lg">"Excellence in Education"</p>
                <p className="font-body text-white/80 text-sm">Ayanambakkam, Chennai – 600095</p>
              </div>
            </div>
            <div className="absolute -bottom-8 -right-4 lg:-right-8 bg-white rounded-2xl shadow-card-hover p-4 grid grid-cols-2 gap-3 w-56 reveal border border-red-100">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-heading font-800 text-primary text-lg leading-none">{stat.value}</div>
                  <div className="font-body text-muted text-[10px] mt-0.5 leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────
// ACADEMICS SECTION
// ─────────────────────────────────────────────
const AcademicsSection: React.FC = () => {
  const cards = [
    { icon: "BookOpenIcon", title: "Matriculation Education", desc: "Tamil Nadu State Board curriculum from KG to Class XII, delivered in English medium with rigorous academic standards and board exam preparation.", color: "from-red-50 to-red-100", iconBg: "bg-primary", features: ["State Board Syllabus", "English Medium", "KG to XII"] },
    { icon: "LightBulbIcon", title: "Smart Learning", desc: "Technology-integrated classrooms with digital learning tools, interactive sessions, and modern teaching methodologies that make concepts come alive.", color: "from-yellow-50 to-amber-100", iconBg: "bg-accent", features: ["Digital Classrooms", "Interactive Learning", "STEM Focus"] },
    { icon: "SparklesIcon", title: "Holistic Development", desc: "Co-curricular activities including dance, music, arts, sports, and recreational programs to enhance agility, confidence, and cooperative skills.", color: "from-orange-50 to-red-50", iconBg: "bg-primary-dark", features: ["Arts & Culture", "Sports Programs", "Life Skills"] },
  ];

  return (
    <section id="academics" className="py-20 lg:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4 reveal">
            <div className="h-px w-10 bg-primary" />
            <span className="accent-badge px-3 py-1 rounded-full">Academics</span>
            <div className="h-px w-10 bg-primary" />
          </div>
          <h2 className="font-heading font-800 text-3xl sm:text-4xl md:text-5xl text-foreground mb-4 reveal">
            A Complete <span className="text-primary">Learning Journey</span>
          </h2>
          <p className="font-body text-muted text-lg max-w-2xl mx-auto reveal">
            From foundational kindergarten to board examinations, we nurture every student&apos;s potential through structured academics and vibrant co-curriculars.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card, i) => (
            <div key={card.title} className={`relative bg-gradient-to-br ${card.color} rounded-3xl p-8 border border-red-100 card-hover reveal`} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={`w-14 h-14 ${card.iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-primary-sm`}>
                <Icon name={card.icon as Parameters<typeof Icon>[0]["name"]} size={26} className="text-white" variant="outline" />
              </div>
              <h3 className="font-heading font-700 text-xl text-foreground mb-3">{card.title}</h3>
              <p className="font-body text-muted text-sm leading-relaxed mb-6">{card.desc}</p>
              <div className="flex flex-wrap gap-2">
                {card.features.map((f) => (
                  <span key={f} className="text-[11px] font-heading font-600 px-3 py-1 bg-white/70 text-primary rounded-full border border-red-100">{f}</span>
                ))}
              </div>
              <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/30 -z-0" />
            </div>
          ))}
        </div>
        <div className="mt-12 bg-primary rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 reveal">
          <div>
            <h3 className="font-heading font-700 text-white text-xl md:text-2xl mb-2">Admissions Open for 2025–26</h3>
            <p className="font-body text-white/75 text-sm">Limited seats available · Apply early · All classes KG to XII</p>
          </div>
          <button
            onClick={() => { const el = document.getElementById("contact"); if (el) el.scrollIntoView({ behavior: "smooth" }); }}
            className="flex-shrink-0 px-8 py-3.5 bg-accent text-dark rounded-full font-heading font-700 text-sm hover:bg-accent-dark transition-all duration-300 shadow-lg hover:-translate-y-1">
            Enquire Now
          </button>
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────
// GALLERY SECTION (Drive-powered)
// ─────────────────────────────────────────────
const GallerySection: React.FC = () => {
  const [topics, setTopics] = useState<GalleryTopic[]>(
    GALLERY_TOPIC_DEFS.map((def) => ({
      id: def.id,
      label: def.label,
      icon: def.icon,
      sectionName: def.sectionName,
      folderId: null,
      images: [],
      loaded: false,
    }))
  );
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [autoIndex, setAutoIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState<{ src: string; alt: string; images: { src: string; alt: string }[]; index: number } | null>(null);
  const [topicLoading, setTopicLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load all gallery_sources on mount
  useEffect(() => {
    const loadSources = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("gallery_sources")
        .select("section_name, drive_folder_link, auto_slide_seconds")
        .neq("section_name", "hero_slider");

      if (error || !data) return;

      const sourceMap: Record<string, string> = {};
      data.forEach((row: GallerySource) => {
        if (row.drive_folder_link) sourceMap[row.section_name] = row.drive_folder_link;
      });

      setTopics((prev) =>
        prev.map((t) => ({
          ...t,
          folderId: sourceMap[t.sectionName] ? extractFolderId(sourceMap[t.sectionName]) : null,
        }))
      );

      // Load images for all topics (pick up to 2 per topic for "All" view)
      const updatedTopics = await Promise.all(
        GALLERY_TOPIC_DEFS.map(async (def) => {
          const link = sourceMap[def.sectionName];
          const folderId = link ? extractFolderId(link) : null;
          if (folderId) {
            const driveImages = await fetchDriveImages(folderId);
            return {
              id: def.id,
              label: def.label,
              icon: def.icon,
              sectionName: def.sectionName,
              folderId,
              images: driveImages,
              loaded: true,
            };
          }
          // Fallback to static images
          return {
            id: def.id,
            label: def.label,
            icon: def.icon,
            sectionName: def.sectionName,
            folderId: null,
            images: def.fallbackImages.map((img, idx) => ({
              id: `fallback-${def.id}-${idx}`,
              name: img.alt,
              thumbUrl: img.src,
              fullUrl: img.src,
            })),
            loaded: true,
          };
        })
      );
      setTopics(updatedTopics);
    };
    loadSources();
  }, []);

  // Real-time: re-fetch when any gallery source changes
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("gallery_sources_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "gallery_sources" },
        async (payload) => {
          const updated = payload.new as GallerySource | null;
          const deleted = payload.old as GallerySource | null;
          const sectionName = updated?.section_name ?? deleted?.section_name;

          // If hero_slider changed, skip here (handled by hero_slider_realtime channel)
          if (sectionName === "hero_slider") return;

          if (sectionName) {
            // UPDATE or INSERT: re-fetch images for the specific section
            const folderId = updated?.drive_folder_link ? extractFolderId(updated.drive_folder_link) : null;
            if (folderId) {
              imageCache.delete(folderId);
              const driveImages = await fetchDriveImages(folderId);
              setTopics((prev) =>
                prev.map((t) =>
                  t.sectionName === sectionName
                    ? { ...t, folderId, images: driveImages, loaded: true }
                    : t
                )
              );
            } else {
              // DELETE or link cleared: clear images for this section
              setTopics((prev) =>
                prev.map((t) =>
                  t.sectionName === sectionName
                    ? { ...t, folderId: null, images: [], loaded: true }
                    : t
                )
              );
            }
          } else {
            // Fallback: re-fetch all gallery sources
            const { data } = await supabase
              .from("gallery_sources")
              .select("section_name, drive_folder_link, auto_slide_seconds")
              .neq("section_name", "hero_slider");
            if (data) {
              const sourceMap: Record<string, string> = {};
              data.forEach((row: GallerySource) => {
                if (row.drive_folder_link) sourceMap[row.section_name] = row.drive_folder_link;
              });
              const updatedTopics = await Promise.all(
                (await Promise.resolve(null),
                Object.entries(sourceMap).map(async ([sName, link]) => {
                  const fId = extractFolderId(link);
                  if (fId) {
                    imageCache.delete(fId);
                    const imgs = await fetchDriveImages(fId);
                    return { sName, fId, imgs };
                  }
                  return { sName, fId: null, imgs: [] };
                }))
              );
              setTopics((prev) =>
                prev.map((t) => {
                  const found = updatedTopics.find((u) => u.sName === t.sectionName);
                  return found ? { ...t, folderId: found.fId, images: found.imgs, loaded: true } : t;
                })
              );
            }
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Auto-slide for "All" banner
  const allImages = topics.flatMap((t) => t.images.slice(0, 2).map((img) => ({ src: img.thumbUrl, alt: img.name, topicLabel: t.label })));

  useEffect(() => {
    if (allImages.length === 0) return;
    timerRef.current = setInterval(() => {
      setAutoIndex((i) => (i + 1) % allImages.length);
    }, 3000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [allImages.length]);

  // Load topic images when selected
  const handleTopicSelect = useCallback(async (topicId: string | null) => {
    setActiveTopic(topicId);
    if (!topicId) return;
    const topic = topics.find((t) => t.id === topicId);
    if (!topic || topic.loaded) return;
    setTopicLoading(true);
    if (topic.folderId) {
      const driveImages = await fetchDriveImages(topic.folderId);
      setTopics((prev) => prev.map((t) => t.id === topicId ? { ...t, images: driveImages, loaded: true } : t));
    }
    setTopicLoading(false);
  }, [topics]);

  const activeTopicData = activeTopic ? topics.find((t) => t.id === activeTopic) : null;
  const displayImages = activeTopicData ? activeTopicData.images : [];

  const openFullscreen = (img: DriveImage, idx: number, imageList: DriveImage[]) => {
    setFullscreen({
      src: img.fullUrl,
      alt: img.name,
      images: imageList.map((i) => ({ src: i.fullUrl, alt: i.name })),
      index: idx,
    });
  };

  const navFullscreen = (dir: 1 | -1) => {
    if (!fullscreen) return;
    const newIdx = (fullscreen.index + dir + fullscreen.images.length) % fullscreen.images.length;
    const img = fullscreen.images[newIdx];
    setFullscreen({ ...fullscreen, src: img.src, alt: img.alt, index: newIdx });
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!fullscreen) return;
      if (e.key === "ArrowRight") navFullscreen(1);
      if (e.key === "ArrowLeft") navFullscreen(-1);
      if (e.key === "Escape") setFullscreen(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  return (
    <section id="gallery" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4 reveal">
            <div className="h-px w-10 bg-primary" />
            <span className="accent-badge px-3 py-1 rounded-full">Gallery</span>
            <div className="h-px w-10 bg-primary" />
          </div>
          <h2 className="font-heading font-800 text-3xl sm:text-4xl md:text-5xl text-foreground mb-4 reveal">
            Life at <span className="text-primary">SSVM</span>
          </h2>
          <p className="font-body text-muted text-lg max-w-xl mx-auto reveal">
            Moments of learning, celebration, and achievement captured through our lens.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="bg-surface rounded-2xl border border-red-100 overflow-hidden sticky top-24">
              <div className="px-4 py-3 bg-primary">
                <p className="font-heading font-700 text-white text-sm tracking-wide">Topics</p>
              </div>
              <div className="p-2">
                <button
                  onClick={() => handleTopicSelect(null)}
                  className={`topic-item w-full text-left px-3 py-2.5 rounded-lg text-sm font-heading font-600 transition-all ${!activeTopic ? "active" : "text-foreground"}`}>
                  <span className="flex items-center gap-2">
                    <Icon name="PhotoIcon" size={15} />All Photos
                  </span>
                </button>
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicSelect(topic.id)}
                    className={`topic-item w-full text-left px-3 py-2.5 rounded-lg text-sm font-heading font-600 transition-all mt-0.5 ${activeTopic === topic.id ? "active" : "text-foreground"}`}>
                    <span className="flex items-center gap-2">
                      <Icon name={topic.icon as Parameters<typeof Icon>[0]["name"]} size={14} />
                      {topic.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Gallery Grid */}
          <div className="flex-1">
            {/* All Photos: auto-rotating banner */}
            {!activeTopic && allImages.length > 0 && (
              <div className="relative rounded-2xl overflow-hidden h-48 sm:h-64 mb-6">
                <AppImage
                  src={allImages[autoIndex]?.src ?? ""}
                  alt={allImages[autoIndex]?.alt ?? "School gallery"}
                  fill
                  className="object-cover transition-opacity duration-700"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="font-heading font-600 text-white text-sm">{allImages[autoIndex]?.topicLabel}</span>
                </div>
              </div>
            )}

            {/* All Photos grid */}
            {!activeTopic && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {topics.flatMap((topic) =>
                  topic.images.slice(0, 3).map((img, i) => (
                    <button
                      key={`${topic.id}-${img.id}-${i}`}
                      onClick={() => openFullscreen(img, i, topic.images)}
                      className="gallery-image-card relative aspect-square rounded-xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label={`View ${img.name}`}>
                      <AppImage
                        src={img.thumbUrl}
                        alt={img.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end justify-start p-2">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-heading font-600 text-white bg-black/50">
                          {topic.label}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Topic-specific view */}
            {activeTopic && (
              <>
                {topicLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span className="ml-3 text-sm text-muted font-body">Loading images...</span>
                  </div>
                ) : displayImages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-muted bg-surface rounded-2xl border border-red-100">
                    <Icon name="PhotoIcon" size={40} className="mb-3 opacity-30" />
                    <p className="font-body text-sm">No images available for this topic</p>
                    <p className="font-body text-xs text-muted mt-1">Add a Google Drive folder link in the admin panel</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {displayImages.map((img, i) => (
                      <button
                        key={`${img.id}-${i}`}
                        onClick={() => openFullscreen(img, i, displayImages)}
                        className="gallery-image-card relative aspect-square rounded-xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label={`View ${img.name}`}>
                        <AppImage
                          src={img.thumbUrl}
                          alt={img.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                          <Icon name="MagnifyingGlassPlusIcon" size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Viewer */}
      {fullscreen && (
        <div
          className="fullscreen-viewer fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setFullscreen(null)}>
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${extractYouTubeId(fullscreen.youtubeUrl)}?autoplay=1`}
                title={fullscreen.alt}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="flex items-center justify-between mt-4">
              <h3 className="font-heading font-600 text-white text-base">{fullscreen.alt}</h3>
              <button
                onClick={() => setFullscreen(null)}
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Close video">
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// ─────────────────────────────────────────────
// VIDEO SECTION
// ─────────────────────────────────────────────
const VideoSection: React.FC<{ videos: VideoItem[]; loading?: boolean }> = ({ videos, loading = false }) => {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  // Debug: log what videos array looks like at render
  useEffect(() => {
    if (!loading) {
      console.log("[VideoSection] rendering", videos.length, "videos:", videos);
    }
  }, [videos, loading]);

  // Auto-select first video when videos load
  useEffect(() => {
    if (!loading && videos.length > 0 && activeVideo === null) {
      // Don't auto-open modal, just ensure grid shows
    }
  }, [videos, loading, activeVideo]);

  return (
    <section id="videos" className="py-20 lg:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4 reveal">
            <div className="h-px w-10 bg-primary" />
            <span className="accent-badge px-3 py-1 rounded-full">Videos</span>
            <div className="h-px w-10 bg-primary" />
          </div>
          <h2 className="font-heading font-800 text-3xl sm:text-4xl md:text-5xl text-foreground mb-4 reveal">
            School in <span className="text-primary">Motion</span>
          </h2>
          <p className="font-body text-muted text-lg max-w-xl mx-auto reveal">
            Watch highlights from our events, celebrations, and everyday school life.
          </p>
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-red-100 shadow-card animate-pulse">
                <div className="aspect-video bg-gray-200" />
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <Icon name="VideoCameraIcon" size={28} className="text-primary" />
            </div>
            <p className="font-heading font-600 text-foreground text-lg mb-1">No videos yet</p>
            <p className="font-body text-muted text-sm">Videos will appear here once added from the admin panel.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, i) => (
                <button
                  key={video.id}
                  onClick={() => setActiveVideo(video)}
                  className="video-card text-left bg-white rounded-2xl overflow-hidden border border-red-100 shadow-card focus:outline-none focus:ring-2 focus:ring-primary reveal"
                  style={{ animationDelay: `${i * 0.08}s` }}
                  aria-label={`Play ${video.title}`}>
                  <div className="relative aspect-video overflow-hidden">
                    <AppImage
                      src={video.thumbnailUrl || "/assets/images/no_image.png"}
                      alt={`Thumbnail for ${video.title}`}
                      fill
                      className="object-cover"
                      loading="lazy"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="play-btn-ring w-14 h-14 bg-primary rounded-full flex items-center justify-center relative z-10">
                        <Icon name="PlayIcon" size={22} className="text-white ml-1" variant="solid" />
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-heading font-700 px-2 py-0.5 rounded">YouTube</div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-heading font-600 text-sm text-foreground leading-snug">{video.title}</h4>
                    <p className="text-xs text-muted mt-1 flex items-center gap-1">
                      <Icon name="PlayCircleIcon" size={13} className="text-primary" />Click to watch
                    </p>
                  </div>
                </button>
              ))}
          </div>
        )}
      </div>
      {activeVideo && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setActiveVideo(null)}>
          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${extractYouTubeId(activeVideo.youtubeUrl)}?autoplay=1`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="flex items-center justify-between mt-4">
              <h3 className="font-heading font-600 text-white text-base">{activeVideo.title}</h3>
              <button
                onClick={() => setActiveVideo(null)}
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Close video">
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// ─────────────────────────────────────────────
// CONTACT SECTION
// ─────────────────────────────────────────────
const ContactSection: React.FC = () => {
  return (
    <section id="contact" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4 reveal">
            <div className="h-px w-10 bg-primary" />
            <span className="accent-badge px-3 py-1 rounded-full">Contact</span>
            <div className="h-px w-10 bg-primary" />
          </div>
          <h2 className="font-heading font-800 text-3xl sm:text-4xl md:text-5xl text-foreground mb-4 reveal">
            Find <span className="text-primary">Us</span>
          </h2>
          <p className="font-body text-muted text-lg max-w-xl mx-auto reveal">
            We&apos;re located in Ayanambakkam, Chennai. Come visit us or reach out below.
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-5">
            <div className="flex gap-4 p-6 bg-surface rounded-2xl border border-red-100 card-hover reveal">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon name="MapPinIcon" size={22} className="text-white" />
              </div>
              <div>
                <h4 className="font-heading font-700 text-foreground text-base mb-1">Address</h4>
                <p className="font-body text-muted text-sm leading-relaxed">
                  Sri Saraswathi Vidhya Mandir Matriculation School<br />
                  No.14 Rajankuppam Main Road<br />
                  Ayanambakkam, Chennai – 600095
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-6 bg-surface rounded-2xl border border-red-100 card-hover reveal">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon name="PhoneIcon" size={22} className="text-white" />
              </div>
              <div>
                <h4 className="font-heading font-700 text-foreground text-base mb-1">Phone</h4>
                <a href="tel:+04426800784" className="font-body text-primary text-base font-600 hover:text-primary-dark transition-colors">+044 26800784</a>
              </div>
            </div>
            <div className="flex gap-4 p-6 bg-surface rounded-2xl border border-red-100 card-hover reveal">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon name="EnvelopeIcon" size={22} className="text-dark" />
              </div>
              <div>
                <h4 className="font-heading font-700 text-foreground text-base mb-1">Email</h4>
                <a href="mailto:ssvm2003@gmail.com" className="font-body text-primary text-base font-600 hover:text-primary-dark transition-colors">ssvm2003@gmail.com</a>
              </div>
            </div>
            <div className="flex gap-4 p-6 bg-surface rounded-2xl border border-red-100 card-hover reveal">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon name="ClockIcon" size={22} className="text-white" />
              </div>
              <div>
                <h4 className="font-heading font-700 text-foreground text-base mb-1">School Hours</h4>
                <p className="font-body text-muted text-sm">Monday – Saturday: 8:30 AM – 4:30 PM<br />Sunday: Closed</p>
              </div>
            </div>
          </div>
          <div className="reveal">
            <div className="rounded-2xl overflow-hidden border border-red-100 shadow-card-hover h-[250px] md:h-[400px]">
              <iframe
                src="https://maps.google.com/maps?q=13.0658167,80.1444693&z=17&output=embed"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Sri Saraswathi Vidhya Mandir location on Google Maps"
              />
            </div>
            <div className="mt-4 p-4 bg-primary rounded-xl flex items-center justify-between">
              <p className="font-heading font-600 text-white text-sm">Ayanambakkam, Chennai – 600095</p>
              <a href="https://maps.google.com/?q=13.0658167,80.1444693" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-accent text-xs font-heading font-700 hover:text-accent-light transition-colors">
                <Icon name="ArrowTopRightOnSquareIcon" size={14} />Get Directions
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────
// SCROLL REVEAL HOOK
// ─────────────────────────────────────────────
const useScrollReveal = () => {
  useEffect(() => {
    const observe = () => {
      const elements = document.querySelectorAll(".reveal:not(.visible)");
      elements.forEach((el) => observer.observe(el));
    };
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("visible"); }); },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    observe();
    // Re-observe when new elements are added to the DOM (e.g. async video cards)
    const mutationObserver = new MutationObserver(observe);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
};

// ─────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────
export default function HomePage() {
  useScrollReveal();
  const [liveVideos, setLiveVideos] = useState<VideoItem[]>([]);
  const [videosLoaded, setVideosLoaded] = useState(false);
  const [videosLoading, setVideosLoading] = useState(true);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("school_videos")
          .select("id, title, youtube_url")
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true });
        console.log("[VideoFetch] data:", data, "error:", error);
        if (error) {
          console.error("[VideoFetch] Supabase error:", error.message, error.code, error.details);
        }
        if (data && data.length > 0) {
          setLiveVideos(data.map(mapVideoRow));
          setVideosLoaded(true);
          setVideosLoading(false);
        }
      } catch (err) {
        console.error("[VideoFetch] Exception:", err);
      } finally {
        setVideosLoaded(true);
        setVideosLoading(false);
      }
    };
    loadVideos();
  }, []);

  // Real-time: update video list when admin adds/removes videos
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("school_videos_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "school_videos" },
        async () => {
          const { data, error } = await supabase
            .from("school_videos")
            .select("id, title, youtube_url")
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: true });
          console.log("[VideoRealtime] data:", data, "error:", error);
          if (error) {
            console.error("[VideoRealtime] error:", error.message);
          }
          if (data !== null) {
            setLiveVideos(data.map(mapVideoRow));
            setVideosLoaded(true);
            setVideosLoading(false);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Show DB videos only — no hardcoded fallback
  const videosToShow = liveVideos;

  return (
    <>
      <PWAInstallPrompt />
      <main className="min-h-screen bg-white">
        <Header />
        <HeroSlider config={SLIDER_CONFIG} />
        <div className="section-divider" />
        <AboutSection />
        <div className="section-divider" />
        <AcademicsSection />
        <div className="section-divider" />
        <GallerySection />
        <div className="section-divider" />
        <VideoSection videos={videosToShow} loading={videosLoading} />
        <div className="section-divider" />
        <ContactSection />
        <Footer />
      </main>
    </>
  );
}
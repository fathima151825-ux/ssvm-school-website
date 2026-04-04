"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import AppLogo from "@/components/ui/AppLogo";
import AppImage from "@/components/ui/AppImage";
import Icon from "@/components/ui/AppIcon";
import { createClient } from "@/lib/supabase/client";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

type AdminTab = "hero" | "gallery" | "links" | "videos" | "students" | "phones" | "announce" | "history";
type SliderLayout = 1 | 2 | 3 | 4;

interface HeroImage {id: string;src: string;slot: number;order: number;}
interface GalleryTopic {id: string;label: string;images: {id: string;src: string;alt: string;}[];}
interface VideoEntry {id: string;title: string;youtubeUrl: string;}
interface StudentRow {student_name: string;class: string;section: string;parent_phone: string;valid: boolean;error?: string;}
interface AnnouncementHistory {id: string;date: string;title: string;targetType: string;numberCount: number;status: "success" | "pending" | "failed";deliveryMethod?: string;}
interface GallerySource {
  id: string;
  section_name: string;
  drive_folder_link: string;
  max_images: number;
  auto_slide_seconds: number;
  updated_at: string;
}

const GALLERY_TOPICS_INIT: GalleryTopic[] = [
{ id: "campus", label: "Our Campus", images: [{ id: "g1", src: "https://img.rocket.new/generatedImages/rocket_gen_img_10b5015f8-1772299177523.png", alt: "School building entrance" }] },
{ id: "sports", label: "Sports Events", images: [{ id: "g2", src: "https://img.rocket.new/generatedImages/rocket_gen_img_147b4c96c-1772940120501.png", alt: "Students competing in sports day" }] },
{ id: "cultural", label: "Cultural Events", images: [{ id: "g3", src: "https://img.rocket.new/generatedImages/rocket_gen_img_18a620310-1772280817214.png", alt: "Students performing classical dance" }] }];


const CLASS_LIST = ["Nursery", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const SECTION_LIST = ["A", "B", "C", "D", "E"];

const SECTION_ORDER = [
"hero_slider",
"correspondent",
"principal",
"campus",
"teachers",
"admins",
"supporting_staff",
"sports_events",
"cultural_events",
"tours",
"toppers",
"hall_of_fame"];


const SECTION_DISPLAY_NAMES: Record<string, string> = {
  hero_slider: "Hero Slider",
  correspondent: "Our Correspondent",
  principal: "Our Principal",
  campus: "Our Campus",
  teachers: "Our Teachers",
  admins: "Our Admin Staff",
  supporting_staff: "Supporting Staff",
  sports_events: "Sports Events",
  cultural_events: "Cultural Events",
  tours: "Tours",
  toppers: "Toppers",
  hall_of_fame: "Hall of Fame"
};

// ─── TOAST ───────────────────────────────────────────────────────────────────────────────
const Toast: React.FC<{message: string;visible: boolean;}> = ({ message, visible }) =>
<div
  className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-xl shadow-lg font-heading font-600 text-sm transition-all duration-300 ${
  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`
  }>
  
    <Icon name="CheckCircleIcon" size={16} className="text-white" />
    {message}
  </div>;


// ─── LOGIN ─────────────────────────────────────────────────────────────────────────────
const LoginScreen: React.FC<{onLogin: () => void;}> = ({ onLogin }) => {
  const [email, setEmail] = useState("admin@ssvm.edu.in");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 900));
    if (password.length < 4) {
      setError("Invalid credentials. Please try again.");
      setLoading(false);
      return;
    }
    setLoading(false);
    onLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary to-primary-dark flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-accent blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-scaleIn">
          <div className="bg-primary p-6 text-center">
            <AppLogo size={56} className="mx-auto mb-3" />
            <h1 className="font-heading font-800 text-white text-xl">Admin Panel</h1>
            <p className="font-body text-white/70 text-sm">Sri Saraswathi Vidhya Mandir</p>
          </div>
          <div className="p-8">
            <h2 className="font-heading font-700 text-foreground text-lg mb-1">Welcome back</h2>
            <p className="font-body text-muted text-sm mb-6">Sign in to manage your school media</p>
            {error &&
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-sm">
                <Icon name="ExclamationCircleIcon" size={16} />
                {error}
              </div>
            }
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-heading font-600 text-xs text-muted uppercase tracking-wide mb-1.5">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-red-100 rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface" placeholder="admin@ssvm.edu.in" required />
              </div>
              <div>
                <label className="block font-heading font-600 text-xs text-muted uppercase tracking-wide mb-1.5">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-red-100 rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface" placeholder="Enter password (min 4 chars for demo)" required />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 bg-primary text-white rounded-xl font-heading font-700 text-sm hover:bg-primary-dark transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</> : <><Icon name="LockOpenIcon" size={16} />Sign In</>}
              </button>
            </form>
            <p className="mt-4 text-center text-xs text-muted">Secured by Supabase Authentication</p>
          </div>
        </div>
        <div className="text-center mt-6">
          <Link href="/homepage" className="text-white/70 text-sm hover:text-white transition-colors flex items-center justify-center gap-1">
            <Icon name="ArrowLeftIcon" size={14} />Back to Website
          </Link>
        </div>
      </div>
    </div>);

};

// ─── HERO SLIDER ─────────────────────────────────────────────────────────────────────────────
const HeroSliderManager: React.FC = () => {
  const [layout, setLayout] = useState<SliderLayout>(2);
  const [images, setImages] = useState<HeroImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingImages, setLoadingImages] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 2500);
  };

  useEffect(() => {
    const loadImages = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.
      from("hero_images").
      select("*").
      order("slot", { ascending: true }).
      order("sort_order", { ascending: true });
      if (error) {
        console.error("Failed to load hero images:", error.message);
      } else if (data) {
        setImages(
          data.map((row: {id: string;src: string;slot: number;sort_order: number;}) => ({
            id: row.id,
            src: row.src,
            slot: row.slot,
            order: row.sort_order
          }))
        );
      }
      setLoadingImages(false);
    };
    loadImages();
  }, []);

  const handleUpload = (slot: number) => {
    const slotImages = images.filter((i) => i.slot === slot);
    if (slotImages.length >= 25) {alert("Maximum 25 images per slot");return;}
    fileInputRefs.current[slot]?.click();
  };

  const handleFileChange = async (slot: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const slotImages = images.filter((i) => i.slot === slot);
    const remaining = 25 - slotImages.length;
    const filesToUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    const supabase = createClient();
    for (const file of filesToUpload) {
      const ext = file.name.split(".").pop();
      const fileName = `hero/slot${slot}_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { data: storageData, error: storageError } = await supabase.storage.
      from("images").
      upload(fileName, file, { upsert: false });
      if (storageError) {console.error("Upload error:", storageError.message);continue;}
      const { data: urlData } = supabase.storage.from("images").getPublicUrl(storageData.path);
      const publicUrl = urlData.publicUrl;
      const sortOrder = images.filter((i) => i.slot === slot).length;
      const { data: dbRow, error: dbError } = await supabase.
      from("hero_images").
      insert({ src: publicUrl, slot, sort_order: sortOrder }).
      select().
      single();
      if (dbError) {
        console.error("DB insert error:", dbError.message);
        setImages((prev) => [...prev, { id: `h${Date.now()}_${Math.random()}`, src: publicUrl, slot, order: sortOrder }]);
      } else {
        setImages((prev) => [...prev, { id: dbRow.id, src: dbRow.src, slot: dbRow.slot, order: dbRow.sort_order }]);
      }
    }
    setUploading(false);
    e.target.value = "";
  };

  const deleteImage = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("hero_images").delete().eq("id", id);
    if (error) console.error("Delete error:", error.message);
    setImages((prev) => prev.filter((i) => i.id !== id));
  };

  const handleDragEnd = async (result: DropResult, slot: number) => {
    if (!result.destination || result.source.index === result.destination.index) return;
    const slotImages = images.filter((i) => i.slot === slot);
    const reordered = Array.from(slotImages);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    const updatedReordered = reordered.map((img, idx) => ({ ...img, order: idx }));
    setImages((prev) => [
    ...prev.filter((i) => i.slot !== slot),
    ...updatedReordered]
    );
    const supabase = createClient();
    const updates = updatedReordered.map((img) =>
    supabase.from("hero_images").update({ sort_order: img.order }).eq("id", img.id)
    );
    const results = await Promise.all(updates);
    const hasError = results.some((r) => r.error);
    if (hasError) {
      console.error("Failed to save hero image order");
    } else {
      showToast("Order saved");
    }
  };

  return (
    <>
      <Toast message={toast.message} visible={toast.visible} />
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-red-100 p-6">
          <h3 className="font-heading font-700 text-foreground text-base mb-4 flex items-center gap-2">
            <Icon name="ViewColumnsIcon" size={18} className="text-primary" />Layout Mode
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([1, 2, 3, 4] as SliderLayout[]).map((n) =>
            <button key={n} onClick={() => setLayout(n)} className={`p-4 rounded-xl border-2 transition-all duration-200 ${layout === n ? "border-primary bg-primary text-white" : "border-red-100 bg-surface text-foreground hover:border-primary/50"}`}>
                <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `repeat(${n === 4 ? 2 : n}, 1fr)` }}>
                  {Array.from({ length: n }).map((_, i) => <div key={i} className={`h-4 rounded ${layout === n ? "bg-white/50" : "bg-primary/20"}`} />)}
                </div>
                <span className="font-heading font-700 text-sm">{n} Part{n > 1 ? "s" : ""}</span>
              </button>
            )}
          </div>
          <p className="text-xs text-muted mt-3 font-body">Current layout: <strong className="text-primary">{layout}-Part</strong> · Images rotate every 3 seconds</p>
        </div>
        {loadingImages ?
        <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="ml-3 text-sm text-muted font-body">Loading images...</span>
          </div> :

        Array.from({ length: layout }).map((_, slot) => {
          const slotImages = images.
          filter((i) => i.slot === slot).
          sort((a, b) => a.order - b.order);
          return (
            <div key={slot} className="bg-white rounded-2xl border border-red-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-700 text-foreground text-base">
                    Slot {slot + 1}
                    <span className="ml-2 text-xs text-muted font-body">({slotImages.length}/25 images)</span>
                  </h3>
                  <button onClick={() => handleUpload(slot)} disabled={uploading} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg font-heading font-600 text-sm hover:bg-primary-dark transition-colors disabled:opacity-60">
                    <Icon name="CloudArrowUpIcon" size={15} />{uploading ? "Uploading..." : "Upload Image"}
                  </button>
                  <input
                  ref={(el) => {fileInputRefs.current[slot] = el;}}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileChange(slot, e)} />
                
                </div>
                {slotImages.length === 0 ?
              <div className="upload-zone rounded-xl p-8 text-center">
                    <Icon name="PhotoIcon" size={32} className="text-muted mx-auto mb-2 opacity-40" />
                    <p className="font-body text-sm text-muted">No images yet. Click Upload to add images.</p>
                  </div> :

              <>
                    <p className="text-xs text-muted font-body mb-3 flex items-center gap-1">
                      <Icon name="Bars3Icon" size={13} className="text-muted" />
                      Drag images to reorder
                    </p>
                    <DragDropContext onDragEnd={(result) => handleDragEnd(result, slot)}>
                      <Droppable droppableId={`hero-slot-${slot}`} direction="horizontal">
                        {(provided) =>
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3">
                      
                            {slotImages.map((img, index) =>
                      <Draggable key={img.id} draggableId={img.id} index={index}>
                                {(dragProvided, dragSnapshot) =>
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          className={`relative group aspect-square rounded-xl overflow-hidden border transition-shadow ${
                          dragSnapshot.isDragging ?
                          "border-primary shadow-lg ring-2 ring-primary/40 z-50" :
                          "border-red-100"}`
                          }>
                          
                                    <AppImage src={img.src} alt={`Hero slot ${slot + 1} image`} fill className="object-cover" unoptimized />
                                    <div
                            {...dragProvided.dragHandleProps}
                            className="absolute top-1 left-1 w-6 h-6 bg-black/60 rounded-md flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            aria-label="Drag to reorder">
                            
                                      <Icon name="Bars3Icon" size={12} className="text-white" />
                                    </div>
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                      <button
                              onClick={() => deleteImage(img.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 bg-red-500 rounded-full flex items-center justify-center"
                              aria-label="Delete image">
                              
                                        <Icon name="TrashIcon" size={13} className="text-white" />
                                      </button>
                                    </div>
                                  </div>
                        }
                              </Draggable>
                      )}
                            {provided.placeholder}
                          </div>
                    }
                      </Droppable>
                    </DragDropContext>
                  </>
              }
              </div>);

        })
        }
      </div>
    </>);

};

// ─── GALLERY ────────────────────────────────────────────────────────────────────────────────────────
const GalleryManager: React.FC = () => {
  const [topics, setTopics] = useState<GalleryTopic[]>(GALLERY_TOPICS_INIT);
  const [activeTopic, setActiveTopic] = useState<string>(GALLERY_TOPICS_INIT[0]?.id ?? "");
  const [newTopicName, setNewTopicName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const galleryFileRef = useRef<HTMLInputElement>(null);
  const currentTopic = topics.find((t) => t.id === activeTopic);

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 2500);
  };

  useEffect(() => {
    const loadGalleryImages = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.
      from("gallery_images").
      select("*").
      order("sort_order", { ascending: true });
      if (error) {
        console.error("Failed to load gallery images:", error.message);
        return;
      }
      if (data && data.length > 0) {
        setTopics((prev) =>
        prev.map((topic) => ({
          ...topic,
          images: data.
          filter((row: {topic_id: string;}) => row.topic_id === topic.id).
          map((row: {id: string;src: string;alt: string;}) => ({ id: row.id, src: row.src, alt: row.alt }))
        }))
        );
      }
    };
    loadGalleryImages();
  }, []);

  const addTopic = () => {
    if (!newTopicName.trim()) return;
    const id = newTopicName.toLowerCase().replace(/\s+/g, "-");
    setTopics((prev) => [...prev, { id, label: newTopicName, images: [] }]);
    setNewTopicName("");
    setActiveTopic(id);
  };

  const uploadImage = (topicId: string) => {
    const topic = topics.find((t) => t.id === topicId);
    if (!topic || topic.images.length >= 25) {alert("Maximum 25 images per topic");return;}
    galleryFileRef.current?.click();
  };

  const handleGalleryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !currentTopic) return;
    const remaining = 25 - currentTopic.images.length;
    const filesToUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    const supabase = createClient();
    for (const file of filesToUpload) {
      const ext = file.name.split(".").pop();
      const fileName = `gallery/${currentTopic.id}_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { data: storageData, error: storageError } = await supabase.storage.
      from("images").
      upload(fileName, file, { upsert: false });
      if (storageError) {console.error("Gallery upload error:", storageError.message);continue;}
      const { data: urlData } = supabase.storage.from("images").getPublicUrl(storageData.path);
      const publicUrl = urlData.publicUrl;
      const altText = `${currentTopic.label} image`;
      const sortOrder = currentTopic.images.length;
      const { data: dbRow, error: dbError } = await supabase.
      from("gallery_images").
      insert({ topic_id: currentTopic.id, src: publicUrl, alt: altText, sort_order: sortOrder }).
      select().
      single();
      if (dbError) {
        console.error("Gallery DB insert error:", dbError.message);
        const newImg = { id: `gi${Date.now()}_${Math.random()}`, src: publicUrl, alt: altText };
        setTopics((prev) => prev.map((t) => t.id === currentTopic.id ? { ...t, images: [...t.images, newImg] } : t));
      } else {
        const newImg = { id: dbRow.id, src: dbRow.src, alt: dbRow.alt };
        setTopics((prev) => prev.map((t) => t.id === currentTopic.id ? { ...t, images: [...t.images, newImg] } : t));
      }
    }
    setUploading(false);
    e.target.value = "";
  };

  const deleteImage = async (topicId: string, imgId: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("gallery_images").delete().eq("id", imgId);
    if (error) console.error("Gallery delete error:", error.message);
    setTopics((prev) => prev.map((t) => t.id === topicId ? { ...t, images: t.images.filter((i) => i.id !== imgId) } : t));
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || result.source.index === result.destination.index || !currentTopic) return;
    const reordered = Array.from(currentTopic.images);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setTopics((prev) =>
    prev.map((t) => t.id === currentTopic.id ? { ...t, images: reordered } : t)
    );
    const supabase = createClient();
    const updates = reordered.map((img, idx) =>
    supabase.from("gallery_images").update({ sort_order: idx }).eq("id", img.id)
    );
    const results = await Promise.all(updates);
    const hasError = results.some((r) => r.error);
    if (hasError) {
      console.error("Failed to save gallery image order");
    } else {
      showToast("Order saved");
    }
  };

  return (
    <>
      <Toast message={toast.message} visible={toast.visible} />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-red-100 overflow-hidden">
            <div className="bg-primary px-4 py-3"><p className="font-heading font-700 text-white text-sm">Gallery Topics</p></div>
            <div className="p-2">
              {topics.map((t) =>
              <button key={t.id} onClick={() => setActiveTopic(t.id)} className={`topic-item w-full text-left px-3 py-2.5 rounded-lg text-sm font-heading font-600 transition-all mt-0.5 ${activeTopic === t.id ? "active" : "text-foreground"}`}>
                  {t.label}<span className="ml-1 text-[10px] text-muted">({t.images.length})</span>
                </button>
              )}
            </div>
            <div className="p-3 border-t border-red-100">
              <input type="text" value={newTopicName} onChange={(e) => setNewTopicName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTopic()} placeholder="New topic name..." className="w-full px-3 py-2 border border-red-100 rounded-lg text-xs font-body focus:outline-none focus:ring-1 focus:ring-primary bg-surface" />
              <button onClick={addTopic} className="mt-2 w-full py-2 bg-primary text-white rounded-lg font-heading font-600 text-sm hover:bg-primary-dark transition-colors">+ Add Topic</button>
            </div>
          </div>
        </div>
        <div className="flex-1">
          {currentTopic ?
          <div className="bg-white rounded-2xl border border-red-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-heading font-700 text-foreground text-base">{currentTopic.label}</h3>
                  <p className="text-xs text-muted font-body">{currentTopic.images.length}/25 images</p>
                </div>
                <button onClick={() => uploadImage(currentTopic.id)} disabled={uploading} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg font-heading font-600 text-sm hover:bg-primary-dark transition-colors disabled:opacity-60">
                  <Icon name="CloudArrowUpIcon" size={15} />{uploading ? "Uploading..." : "Upload"}
                </button>
                <input
                ref={galleryFileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleGalleryFileChange} />
              
              </div>
              {currentTopic.images.length === 0 ?
            <div className="upload-zone rounded-xl p-10 text-center">
                  <Icon name="PhotoIcon" size={36} className="text-muted mx-auto mb-3 opacity-30" />
                  <p className="font-body text-sm text-muted">No images in this topic yet</p>
                </div> :

            <>
                  <p className="text-xs text-muted font-body mb-3 flex items-center gap-1">
                    <Icon name="Bars3Icon" size={13} className="text-muted" />
                    Drag images to reorder
                  </p>
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId={`gallery-${currentTopic.id}`} direction="horizontal">
                      {(provided) =>
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    
                          {currentTopic.images.map((img, index) =>
                    <Draggable key={img.id} draggableId={img.id} index={index}>
                              {(dragProvided, dragSnapshot) =>
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        className={`relative group aspect-square rounded-xl overflow-hidden border transition-shadow ${
                        dragSnapshot.isDragging ?
                        "border-primary shadow-lg ring-2 ring-primary/40 z-50" :
                        "border-red-100"}`
                        }>
                        
                                  <AppImage src={img.src} alt={img.alt} fill className="object-cover" unoptimized />
                                  <div
                          {...dragProvided.dragHandleProps}
                          className="absolute top-1 left-1 w-6 h-6 bg-black/60 rounded-md flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          aria-label="Drag to reorder">
                          
                                    <Icon name="Bars3Icon" size={12} className="text-white" />
                                  </div>
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                    <button
                            onClick={() => deleteImage(currentTopic.id, img.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 bg-red-500 rounded-full flex items-center justify-center"
                            aria-label="Delete image">
                            
                                      <Icon name="TrashIcon" size={14} className="text-white" />
                                    </button>
                                  </div>
                                </div>
                      }
                            </Draggable>
                    )}
                          {provided.placeholder}
                        </div>
                  }
                    </Droppable>
                  </DragDropContext>
                </>
            }
            </div> :

          <div className="bg-white rounded-2xl border border-red-100 p-10 text-center text-muted">Select a topic to manage images</div>
          }
        </div>
      </div>
    </>);

};

// ─── GALLERY LINKS MANAGER ────────────────────────────────────────────────────
const GalleryLinksManager: React.FC = () => {
  const [sources, setSources] = useState<GallerySource[]>([]);
  const [links, setLinks] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState({ visible: false, message: "", isError: false });
  const [loading, setLoading] = useState(true);

  const showToast = (message: string, isError = false) => {
    setToast({ visible: true, message, isError });
    setTimeout(() => setToast({ visible: false, message: "", isError: false }), 2500);
  };

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.
      from("gallery_sources").
      select("*").
      order("section_name", { ascending: true });
      if (error) {
        console.error("Failed to load gallery sources:", error.message);
        const defaults: GallerySource[] = SECTION_ORDER.map((s) => ({
          id: s,
          section_name: s,
          drive_folder_link: "",
          max_images: 25,
          auto_slide_seconds: 3,
          updated_at: new Date().toISOString()
        }));
        setSources(defaults);
        const linkMap: Record<string, string> = {};
        defaults.forEach((d) => {linkMap[d.section_name] = d.drive_folder_link;});
        setLinks(linkMap);
      } else if (data) {
        const existing = new Set(data.map((d: GallerySource) => d.section_name));
        const allSources: GallerySource[] = [...data];
        SECTION_ORDER.forEach((s) => {
          if (!existing.has(s)) {
            allSources.push({ id: s, section_name: s, drive_folder_link: "", max_images: 25, auto_slide_seconds: 3, updated_at: new Date().toISOString() });
          }
        });
        setSources(allSources);
        const linkMap: Record<string, string> = {};
        allSources.forEach((d) => {linkMap[d.section_name] = d.drive_folder_link;});
        setLinks(linkMap);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async (sectionName: string) => {
    setSaving((prev) => ({ ...prev, [sectionName]: true }));
    const supabase = createClient();
    const { error } = await supabase.
    from("gallery_sources").
    upsert(
      { section_name: sectionName, drive_folder_link: links[sectionName] ?? "", updated_at: new Date().toISOString() },
      { onConflict: "section_name" }
    );
    if (error) {
      console.error("Save error:", error.message);
      showToast("Failed to save. Please try again.", true);
    } else {
      setSources((prev) =>
      prev.map((s) =>
      s.section_name === sectionName ?
      { ...s, drive_folder_link: links[sectionName] ?? "", updated_at: new Date().toISOString() } :
      s
      )
      );
      showToast("Link saved!");
    }
    setSaving((prev) => ({ ...prev, [sectionName]: false }));
  };

  const orderedSources = SECTION_ORDER.map((key) => sources.find((s) => s.section_name === key)).filter(Boolean) as GallerySource[];

  return (
    <>
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg font-heading font-600 text-sm transition-all duration-300 ${
        toast.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"} ${
        toast.isError ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>
        
        <Icon name={toast.isError ? "ExclamationCircleIcon" : "CheckCircleIcon"} size={16} className="text-white" />
        {toast.message}
      </div>

      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <Icon name="InformationCircleIcon" size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-heading font-700 text-amber-800 text-sm mb-1">How to use Google Drive Gallery</p>
            <p className="font-body text-amber-700 text-xs leading-relaxed">
              1. Upload photos to a Google Drive folder. &nbsp;
              2. Right-click the folder → Share → &quot;Anyone with the link → Viewer&quot;. &nbsp;
              3. Copy the folder link and paste it below. &nbsp;
              4. Click Save — the website updates instantly.
            </p>
          </div>
        </div>

        {loading ?
        <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="ml-3 text-sm text-muted font-body">Loading gallery sources...</span>
          </div> :

        <div className="grid gap-4">
            {orderedSources.map((source) =>
          <div key={source.section_name} className="bg-white rounded-2xl border border-red-100 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-shrink-0 w-40">
                    <p className="font-heading font-700 text-foreground text-sm">
                      {SECTION_DISPLAY_NAMES[source.section_name] ?? source.section_name}
                    </p>
                    {source.updated_at && source.drive_folder_link &&
                <p className="text-[10px] text-muted font-body mt-0.5">
                        Updated: {new Date(source.updated_at).toLocaleDateString()}
                      </p>
                }
                    {!source.drive_folder_link &&
                <span className="text-[10px] text-amber-600 font-heading font-600">No link set</span>
                }
                    {source.drive_folder_link &&
                <span className="text-[10px] text-green-600 font-heading font-600 flex items-center gap-1">
                        <Icon name="CheckCircleIcon" size={10} />Link active
                      </span>
                }
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                  type="url"
                  value={links[source.section_name] ?? ""}
                  onChange={(e) => setLinks((prev) => ({ ...prev, [source.section_name]: e.target.value }))}
                  placeholder="Paste Google Drive folder link..."
                  className="flex-1 px-4 py-2.5 border border-red-100 rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface" />
                
                    <button
                  onClick={() => handleSave(source.section_name)}
                  disabled={saving[source.section_name]}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-xl font-heading font-600 text-sm hover:bg-primary-dark transition-colors disabled:opacity-60 flex-shrink-0">
                  
                      {saving[source.section_name] ?
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :

                  <Icon name="CloudArrowUpIcon" size={15} />
                  }
                      Save
                    </button>
                  </div>
                </div>
              </div>
          )}
          </div>
        }
      </div>
    </>);

};

// ─── VIDEO MANAGER ────────────────────────────────────────────────────────────────────────────
const VideoManager: React.FC = () => {
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ visible: false, message: "", isError: false });

  const showToast = (message: string, isError = false) => {
    setToast({ visible: true, message, isError });
    setTimeout(() => setToast({ visible: false, message: "", isError: false }), 2500);
  };

  const getYouTubeId = (u: string) => u.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/)?.[1] ?? "";

  useEffect(() => {
    const loadVideos = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.
      from("school_videos").
      select("*").
      order("sort_order", { ascending: true }).
      order("created_at", { ascending: true });
      if (error) {
        console.error("Failed to load videos:", error.message);
      } else if (data) {
        setVideos(
          data.map((row: {id: string;title: string;youtube_url: string;}) => ({
            id: row.id,
            title: row.title,
            youtubeUrl: row.youtube_url
          }))
        );
      }
      setLoading(false);
    };
    loadVideos();
  }, []);

  const addVideo = async () => {
    if (!title.trim() || !url.trim()) return;
    if (!getYouTubeId(url)) {alert("Please enter a valid YouTube URL");return;}
    setAdding(true);
    const supabase = createClient();
    const sortOrder = videos.length;
    const { data, error } = await supabase.
    from("school_videos").
    insert({ title: title.trim(), youtube_url: url.trim(), sort_order: sortOrder }).
    select().
    single();
    if (error) {
      console.error("Add video error:", error.message);
      showToast("Failed to save video: " + error.message, true);
    } else if (data) {
      setVideos((prev) => [...prev, { id: data.id, title: data.title, youtubeUrl: data.youtube_url }]);
      showToast("Video added!");
    }
    setTitle("");setUrl("");setAdding(false);
  };

  const deleteVideo = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("school_videos").delete().eq("id", id);
    if (error) {
      console.error("Delete video error:", error.message);
      showToast("Failed to delete video.", true);
      return;
    }
    setVideos((prev) => prev.filter((v) => v.id !== id));
    showToast("Video removed.");
  };

  return (
    <div className="space-y-6">
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg font-heading font-600 text-sm transition-all duration-300 ${
        toast.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"} ${
        toast.isError ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>
        
        <Icon name={toast.isError ? "ExclamationCircleIcon" : "CheckCircleIcon"} size={16} className="text-white" />
        {toast.message}
      </div>
      <div className="bg-white rounded-2xl border border-red-100 p-6">
        <h3 className="font-heading font-700 text-foreground text-base mb-4 flex items-center gap-2">
          <Icon name="PlusCircleIcon" size={18} className="text-primary" />Add New Video
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-heading font-600 text-xs text-muted uppercase tracking-wide mb-1.5">Video Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Annual Day 2025 Highlights" className="w-full px-4 py-2.5 border border-red-100 rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface" />
          </div>
          <div>
            <label className="block font-heading font-600 text-xs text-muted uppercase tracking-wide mb-1.5">YouTube URL</label>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full px-4 py-2.5 border border-red-100 rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface" />
          </div>
        </div>
        <button onClick={addVideo} disabled={adding} className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-heading font-600 text-sm hover:bg-primary-dark transition-colors disabled:opacity-60">
          <Icon name="PlusIcon" size={15} />{adding ? "Saving..." : "Add Video"}
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-red-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100">
          <h3 className="font-heading font-700 text-foreground text-base">Videos <span className="text-muted font-body text-sm ml-1">({videos.length})</span></h3>
        </div>
        {loading ?
        <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="ml-3 text-sm text-muted font-body">Loading videos...</span>
          </div> :
        videos.length === 0 ?
        <div className="p-10 text-center text-muted font-body text-sm">No videos added yet. Add your first video above.</div> :

        <div className="divide-y divide-red-50">
            {videos.map((video) => {
            const ytId = getYouTubeId(video.youtubeUrl);
            return (
              <div key={video.id} className="flex items-center gap-4 p-4 hover:bg-surface transition-colors">
                  <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-red-100">
                    <AppImage src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={`Thumbnail for ${video.title}`} width={80} height={56} className="w-full h-full object-cover" unoptimized />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-600 text-sm text-foreground truncate">{video.title}</p>
                    <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-body truncate block">{video.youtubeUrl}</a>
                  </div>
                  <button onClick={() => deleteVideo(video.id)} className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center text-red-500 transition-colors flex-shrink-0" aria-label={`Delete ${video.title}`}>
                    <Icon name="TrashIcon" size={15} />
                  </button>
                </div>);

          })}
          </div>
        }
      </div>
    </div>);

};

// ─── STUDENT BULK UPLOAD ────────────────────────────────────────────────────────────────────────────
const StudentBulkUpload: React.FC = () => {
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [importError, setImportError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const validatePhone = (phone: string) => /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ""));
  const validateClass = (cls: string) => CLASS_LIST.includes(cls);

  const parseCSV = (text: string): StudentRow[] => {
    const lines = text.trim().split("\n").slice(1);
    return lines.map((line) => {
      const [student_name, cls, section, parent_phone] = line.split(",").map((s) => s.trim());
      const errors: string[] = [];
      if (!student_name) errors.push("Missing name");
      if (!validateClass(cls)) errors.push("Invalid class");
      if (!validatePhone(parent_phone)) errors.push("Invalid phone");
      return { student_name: student_name ?? "", class: cls ?? "", section: section ?? "", parent_phone: parent_phone ?? "", valid: errors.length === 0, error: errors.join(", ") };
    });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {setRows(parseCSV(ev.target?.result as string));setImported(false);setImportError("");};
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const validRows = rows.filter((r) => r.valid);
    if (validRows.length === 0) return;
    setImporting(true);setImportError("");
    try {
      const supabase = createClient();
      const { error } = await supabase.from("students_basic").insert(
        validRows.map((r) => ({ student_name: r.student_name, class: r.class, section: r.section, parent_phone: r.parent_phone.replace(/\D/g, "").slice(-10) }))
      );
      if (error) throw new Error(error.message);
      setImported(true);
    } catch (err: unknown) {
      setImportError((err as Error).message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const validCount = rows.filter((r) => r.valid).length;
  const errorCount = rows.filter((r) => !r.valid).length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-red-100 p-6">
        <h3 className="font-heading font-700 text-foreground text-base mb-4 flex items-center gap-2">
          <Icon name="TableCellsIcon" size={18} className="text-primary" />Student Bulk Upload
        </h3>
        <div className="mb-4 p-4 bg-surface rounded-xl border border-red-100">
          <p className="font-heading font-600 text-sm text-foreground mb-2">CSV Template Format:</p>
          <code className="text-xs font-mono text-muted bg-white px-3 py-2 rounded-lg border border-red-100 block">
            student_name,class,section,parent_phone<br />Arjun Rajan,5,A,9876543210<br />Priya Venkat,5,A,9876543211
          </code>
        </div>
        <div className="upload-zone rounded-xl p-8 text-center cursor-pointer" onClick={() => fileRef.current?.click()}>
          <Icon name="DocumentArrowUpIcon" size={36} className="text-primary mx-auto mb-3 opacity-60" />
          <p className="font-heading font-600 text-sm text-foreground">Click to upload CSV</p>
          <p className="text-xs text-muted mt-1">Supports .csv files</p>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
        </div>
        {rows.length > 0 &&
        <div className="mt-4 flex flex-wrap items-center gap-4">
            <span className="text-sm font-heading font-600 text-foreground">{rows.length} rows parsed</span>
            <span className="text-xs px-2.5 py-1 bg-green-50 text-green-700 rounded-full font-heading font-600">✓ {validCount} valid</span>
            {errorCount > 0 && <span className="text-xs px-2.5 py-1 bg-red-50 text-red-600 rounded-full font-heading font-600">✗ {errorCount} errors</span>}
            <button onClick={handleImport} disabled={importing || validCount === 0} className="ml-auto px-5 py-2 bg-primary text-white rounded-lg font-heading font-600 text-sm hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center gap-1.5">
              {importing ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Importing...</> : <><Icon name="CloudArrowUpIcon" size={14} />Import {validCount} Students</>}
            </button>
          </div>
        }
        {imported && <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm font-heading font-600"><Icon name="CheckCircleIcon" size={16} />{validCount} students imported to Supabase!</div>}
        {importError && <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-sm font-heading font-600"><Icon name="ExclamationCircleIcon" size={16} />{importError}</div>}
      </div>
      {rows.length > 0 &&
      <div className="bg-white rounded-2xl border border-red-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-red-100"><h4 className="font-heading font-700 text-foreground text-sm">Preview (first 20 rows)</h4></div>
          <div className="overflow-x-auto">
            <table className="w-full data-table text-sm">
              <thead><tr><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Class</th><th className="px-4 py-3 text-left">Section</th><th className="px-4 py-3 text-left">Phone</th><th className="px-4 py-3 text-left">Status</th></tr></thead>
              <tbody>
                {rows.slice(0, 20).map((row, i) =>
              <tr key={i} className="border-b border-red-50">
                    <td className="px-4 py-2.5 font-body text-sm">{row.student_name}</td>
                    <td className="px-4 py-2.5 font-body text-sm">{row.class}</td>
                    <td className="px-4 py-2.5 font-body text-sm">{row.section}</td>
                    <td className="px-4 py-2.5 font-body text-sm">{row.parent_phone}</td>
                    <td className="px-4 py-2.5">{row.valid ? <span className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-heading font-600">Valid</span> : <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full font-heading font-600" title={row.error}>Error</span>}</td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>);

};

// ─── BULK PHONE UPLOAD ────────────────────────────────────────────────────────────────────────────
const BulkPhoneUpload: React.FC = () => {
  const [pasteText, setPasteText] = useState("");
  const [normalizedNumbers, setNormalizedNumbers] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const normalizePhone = (raw: string): string => {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("91") && digits.length === 12) return digits;
    if (digits.length === 10) return `91${digits}`;
    return digits;
  };

  const processText = (text: string) => {
    const lines = text.split(/[\n,;]+/).map((l) => l.trim()).filter(Boolean);
    const nums = lines.map(normalizePhone).filter((n) => n.length === 10 && /^[6-9]/.test(n));
    setNormalizedNumbers([...new Set(nums)]);
    setSaved(false);setSaveError("");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => processText(ev.target?.result as string);
    reader.readAsText(file);
  };

  const handleSave = async () => {
    setSaving(true);setSaveError("");
    try {
      const supabase = createClient();
      const { error } = await supabase.from("bulk_contacts").upsert(normalizedNumbers.map((n) => ({ phone_number: n })), { onConflict: "phone_number" });
      if (error) throw new Error(error.message);
      setSaved(true);
    } catch (err: unknown) {
      setSaveError((err as Error).message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-red-100 p-6">
        <h3 className="font-heading font-700 text-foreground text-base mb-4 flex items-center gap-2">
          <Icon name="PhoneIcon" size={18} className="text-primary" />Bulk Phone Number Upload
        </h3>
        <div className="mb-4">
          <label className="block font-heading font-600 text-xs text-muted uppercase tracking-wide mb-1.5">Paste Numbers (one per line, or comma-separated)</label>
          <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)} rows={8} placeholder={`9876543210\n+91 9876543211\n98765 43212\n9876543213, 9876543214`} className="w-full px-4 py-3 border border-red-100 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface resize-none" />
          <button onClick={() => processText(pasteText)} className="mt-2 px-5 py-2 bg-primary text-white rounded-lg font-heading font-600 text-sm hover:bg-primary-dark transition-colors">Process Numbers</button>
        </div>
        <div className="relative">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-red-100" />
          <span className="relative bg-white px-3 text-xs text-muted font-heading mx-auto block w-fit">OR</span>
        </div>
        <div className="upload-zone rounded-xl p-6 text-center cursor-pointer mt-4" onClick={() => fileRef.current?.click()}>
          <Icon name="DocumentArrowUpIcon" size={28} className="text-primary mx-auto mb-2 opacity-60" />
          <p className="font-body text-sm text-muted">Upload CSV with phone_number column</p>
          <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} className="hidden" />
        </div>
      </div>
      {normalizedNumbers.length > 0 &&
      <div className="bg-white rounded-2xl border border-red-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-heading font-700 text-foreground text-base">{normalizedNumbers.length} valid numbers</h4>
              <p className="text-xs text-muted font-body">Duplicates removed, normalized to 10-digit format</p>
            </div>
            <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-primary text-white rounded-lg font-heading font-600 text-sm hover:bg-primary-dark transition-colors flex items-center gap-1.5 disabled:opacity-60">
              {saving ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : <><Icon name="CloudArrowUpIcon" size={14} />Save to Database</>}
            </button>
          </div>
          {saved && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm"><Icon name="CheckCircleIcon" size={15} />{normalizedNumbers.length} numbers saved to Supabase!</div>}
          {saveError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-sm"><Icon name="ExclamationCircleIcon" size={15} />{saveError}</div>}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {normalizedNumbers.slice(0, 60).map((num, i) => <span key={i} className="text-xs font-mono bg-surface border border-red-100 rounded-lg px-2 py-1.5 text-center text-foreground">{num}</span>)}
            {normalizedNumbers.length > 60 && <span className="text-xs text-muted font-body col-span-full text-center py-1">+{normalizedNumbers.length - 60} more</span>}
          </div>
        </div>
      }
    </div>);

};

// ─── ANNOUNCEMENTS MANAGER (MSG91) ────────────────────────────────────────────────────────────────────────────
const AnnouncementsManager: React.FC<{onSent: (entry: AnnouncementHistory) => void;}> = ({ onSent }) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState<"all" | "classes" | "custom">("all");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [customNumbers, setCustomNumbers] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"sms" | "voice">("sms");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{success: boolean;message: string;count: number;} | null>(null);
  const [fetchingNumbers, setFetchingNumbers] = useState(false);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [testPhone, setTestPhone] = useState("");
  const [testSending, setTestSending] = useState<"sms" | "voice" | null>(null);
  const [testResult, setTestResult] = useState<{success: boolean;message: string;method: "sms" | "voice";} | null>(null);
  // Push notification state
  const [sendPush, setSendPush] = useState(true);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [pushResult, setPushResult] = useState<{sent: number;failed: number;} | null>(null);

  const toggleClass = (cls: string) => setSelectedClasses((prev) => prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]);
  const toggleSection = (sec: string) => setSelectedSections((prev) => prev.includes(sec) ? prev.filter((s) => s !== sec) : [...prev, sec]);

  useEffect(() => {
    const fetchCount = async () => {
      setFetchingNumbers(true);
      try {
        const customList = customNumbers.split(/[\n,;]+/).map((l) => l.trim()).filter(Boolean);
        const res = await fetch("/api/msg91/fetch-numbers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetType, selectedClasses, selectedSections, customNumbers: customList })
        });
        const data = await res.json();
        setPreviewCount(data.count ?? 0);
      } catch {setPreviewCount(null);} finally
      {setFetchingNumbers(false);}
    };
    const t = setTimeout(fetchCount, 600);
    return () => clearTimeout(t);
  }, [targetType, selectedClasses, selectedSections, customNumbers]);

  // Fetch push subscriber count on mount
  useEffect(() => {
    const fetchSubscriberCount = async () => {
      try {
        const res = await fetch("/api/push/subscription");
        if (res.ok) {
          const data = await res.json();
          setSubscriberCount(data.count ?? 0);
        }
      } catch {setSubscriberCount(0);}
    };
    fetchSubscriberCount();
  }, []);

  const handleSend = async () => {
    if (!title.trim()) {alert("Please enter announcement title");return;}
    if (!message.trim()) {alert("Please enter announcement message");return;}
    setSending(true);setSendResult(null);setPushResult(null);
    try {
      const customList = customNumbers.split(/[\n,;]+/).map((l) => l.trim()).filter(Boolean);
      const fetchRes = await fetch("/api/msg91/fetch-numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, selectedClasses, selectedSections, customNumbers: customList })
      });
      const fetchData = await fetchRes.json();
      if (!fetchData.numbers || fetchData.numbers.length === 0) {
        setSendResult({ success: false, message: "No valid phone numbers found for the selected target.", count: 0 });
        setSending(false);return;
      }
      const recipients: string[] = fetchData.numbers;
      const apiEndpoint = deliveryMethod === "sms" ? "/api/msg91/sms" : "/api/msg91/voice";
      const apiPayload = deliveryMethod === "sms" ? { title, message, recipients } : { message: `${title}. ${message}`, recipients };
      const sendRes = await fetch(apiEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(apiPayload) });
      const sendData = await sendRes.json();
      const isSuccess = sendData.success === true;
      const statusLabel = isSuccess ? "success" : "failed";
      const targetLabel = targetType === "all" ? "All Parents" : targetType === "classes" ? `Classes: ${selectedClasses.join(", ")}${selectedSections.length > 0 ? ` | Sections: ${selectedSections.join(", ")}` : ""}` : "Custom Numbers";
      const supabase = createClient();
      const { data: savedAnn, error: saveErr } = await supabase.from("announcements").insert({
        title, message, target_type: targetType, target_classes: selectedClasses, target_sections: selectedSections,
        custom_numbers: customList, delivery_method: deliveryMethod, number_count: recipients.length,
        delivery_status: statusLabel, msg91_response: sendData
      }).select().single();
      if (!saveErr && savedAnn) {
        onSent({ id: savedAnn.id, date: new Date(savedAnn.sent_at).toISOString().split("T")[0], title: savedAnn.title, targetType: targetLabel, numberCount: savedAnn.number_count, status: savedAnn.delivery_status as AnnouncementHistory["status"], deliveryMethod: savedAnn.delivery_method });
      }
      setSendResult({
        success: isSuccess,
        message: isSuccess ? `${deliveryMethod === "sms" ? "SMS" : "Voice call"} sent to ${recipients.length} parents successfully!` : sendData.error || `Delivery failed. ${sendData.failCount || 0} numbers could not be reached.`,
        count: recipients.length
      });

      // Send push notification if enabled
      if (sendPush && subscriberCount && subscriberCount > 0) {
        try {
          const pushRes = await fetch("/api/push/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, message, url: "/homepage" })
          });
          if (pushRes.ok) {
            const pushData = await pushRes.json();
            setPushResult({ sent: pushData.sent ?? 0, failed: pushData.failed ?? 0 });
            // Refresh subscriber count after sending (expired subs may have been cleaned)
            const countRes = await fetch("/api/push/subscription");
            if (countRes.ok) {
              const countData = await countRes.json();
              setSubscriberCount(countData.count ?? 0);
            }
          }
        } catch (pushErr) {
          console.error("Push notification failed:", pushErr);
        }
      }

      if (isSuccess) {setTitle("");setMessage("");setSelectedClasses([]);setSelectedSections([]);setCustomNumbers("");}
    } catch (err: unknown) {
      setSendResult({ success: false, message: (err as Error).message || "An unexpected error occurred.", count: 0 });
    } finally {setSending(false);}
  };

  const normalizePhone = (raw: string): string => {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("91") && digits.length === 12) return digits;
    if (digits.length === 10) return `91${digits}`;
    return digits;
  };

  const handleTestSend = async (method: "sms" | "voice") => {
    const normalized = normalizePhone(testPhone);
    if (normalized.length < 10) {setTestResult({ success: false, message: "Enter a valid 10-digit phone number.", method });return;}
    setTestSending(method);setTestResult(null);
    try {
      const apiEndpoint = method === "sms" ? "/api/msg91/sms" : "/api/msg91/voice";
      const apiPayload = method === "sms" ?
      { title, message, recipients: [normalized] } :
      { message: `${title}. ${message}`, recipients: [normalized] };
      const res = await fetch(apiEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(apiPayload) });
      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, message: `Test ${method === "sms" ? "SMS" : "Voice Call"} sent to +${normalized} ✓`, method });
      } else {
        setTestResult({ success: false, message: data.error || `Test ${method === "sms" ? "SMS" : "Voice Call"} failed. Check MSG91 credentials.`, method });
      }
    } catch (err: unknown) {
      setTestResult({ success: false, message: (err as Error).message || "Unexpected error during test send.", method });
    } finally {setTestSending(null);}
  };

  const isTestDisabled = !title.trim() || !message.trim() || !testPhone.trim();

  return (
    <div className="space-y-6">
      {/* Push Notification Status Card */}
      <div className="bg-white rounded-2xl border border-red-100 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-700 text-foreground text-base flex items-center gap-2">
            <Icon name="BellIcon" size={18} className="text-primary" />Push Notifications
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs font-body text-muted">{sendPush ? "Enabled" : "Disabled"}</span>
            <button
              onClick={() => setSendPush((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${sendPush ? "bg-primary" : "bg-gray-200"}`}
              aria-label="Toggle push notifications">
              
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${sendPush ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-surface rounded-xl px-4 py-2.5 border border-red-100">
            <Icon name="DevicePhoneMobileIcon" size={16} className="text-primary" />
            <span className="font-heading font-700 text-foreground text-sm">
              {subscriberCount === null ? "..." : subscriberCount}
            </span>
            <span className="text-xs text-muted font-body">subscribers</span>
          </div>
          <p className="text-xs text-muted font-body flex-1">
            {sendPush ?
            subscriberCount && subscriberCount > 0 ?
            `Push notification will be sent to ${subscriberCount} device${subscriberCount !== 1 ? "s" : ""} when you send this announcement.` :
            "No push subscribers yet. Parents need to allow notifications after installing the app." : "Push notifications are disabled for this announcement."}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-red-100 p-6">
        <h3 className="font-heading font-700 text-foreground text-base mb-4 flex items-center gap-2">
          <Icon name="MegaphoneIcon" size={18} className="text-primary" />New Announcement
        </h3>
        <div className="mb-4">
          <label className="block font-heading font-600 text-xs text-muted uppercase tracking-wide mb-1.5">Announcement Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Holiday announcement – tomorrow" className="w-full px-4 py-3 border border-red-100 rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface" />
        </div>
        <div>
          <label className="block font-heading font-600 text-xs text-muted uppercase tracking-wide mb-1.5">Message Body</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Type the full message to be sent to parents..." className="w-full px-4 py-3 border border-red-100 rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface resize-none" />
          <p className="text-xs text-muted mt-1 font-body">{message.length} characters</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-red-100 p-6">
        <h3 className="font-heading font-700 text-foreground text-base mb-4 flex items-center gap-2">
          <Icon name="UsersIcon" size={18} className="text-primary" />Target Audience
        </h3>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[{ key: "all", label: "All Parents", icon: "GlobeAltIcon" }, { key: "classes", label: "By Class", icon: "AcademicCapIcon" }, { key: "custom", label: "Custom Numbers", icon: "PhoneIcon" }].map((opt) =>
          <button key={opt.key} onClick={() => setTargetType(opt.key as typeof targetType)} className={`p-3 rounded-xl border-2 text-center transition-all ${targetType === opt.key ? "border-primary bg-primary text-white" : "border-red-100 bg-surface text-foreground hover:border-primary/50"}`}>
              <Icon name={opt.icon as Parameters<typeof Icon>[0]["name"]} size={18} className="mx-auto mb-1" />
              <span className="font-heading font-600 text-xs">{opt.label}</span>
            </button>
          )}
        </div>
        {targetType === "classes" &&
        <div className="space-y-4">
            <div>
              <p className="font-heading font-600 text-xs text-muted uppercase tracking-wide mb-3">Select Classes</p>
              <div className="flex flex-wrap gap-2">
                {CLASS_LIST.map((cls) =>
              <button key={cls} onClick={() => toggleClass(cls)} className={`px-3 py-1.5 rounded-lg font-heading font-600 text-xs transition-all ${selectedClasses.includes(cls) ? "bg-primary text-white" : "bg-surface border border-red-100 text-foreground hover:border-primary"}`}>
                    {["Nursery", "LKG", "UKG"].includes(cls) ? cls : `Class ${cls}`}
                  </button>
              )}
              </div>
              {selectedClasses.length > 0 && <p className="mt-2 text-xs text-primary font-heading font-600">Selected: {selectedClasses.map((c) => ["Nursery", "LKG", "UKG"].includes(c) ? c : `Class ${c}`).join(", ")}</p>}
            </div>
            <div>
              <p className="font-heading font-600 text-xs text-muted uppercase tracking-wide mb-3">Filter by Section (optional)</p>
              <div className="flex flex-wrap gap-2">
                {SECTION_LIST.map((sec) =>
              <button key={sec} onClick={() => toggleSection(sec)} className={`px-3 py-1.5 rounded-lg font-heading font-600 text-xs transition-all ${selectedSections.includes(sec) ? "bg-accent text-white" : "bg-surface border border-red-100 text-foreground hover:border-accent"}`}>
                    Section {sec}
                  </button>
              )}
              </div>
              {selectedSections.length > 0 && <p className="mt-2 text-xs text-accent font-heading font-600">Sections: {selectedSections.join(", ")}</p>}
            </div>
          </div>
        }
        {targetType === "custom" &&
        <div>
            <label className="block font-heading font-600 text-xs text-muted uppercase tracking-wide mb-1.5">Paste Phone Numbers</label>
            <textarea value={customNumbers} onChange={(e) => setCustomNumbers(e.target.value)} rows={5} placeholder={"9876543210\n+91 9876543211\n98765 43212"} className="w-full px-4 py-3 border border-red-100 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-surface resize-none" />
          </div>
        }
        <div className="mt-4 p-3 bg-surface rounded-xl border border-red-100 flex items-center gap-2">
          <Icon name="InformationCircleIcon" size={15} className="text-primary" />
          <span className="text-xs font-heading font-600 text-foreground">
            {fetchingNumbers ? "Counting recipients..." : previewCount !== null ? <>Estimated recipients: <strong className="text-primary">{previewCount}</strong> parents</> : "Select a target to see recipient count"}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-red-100 p-6">
        <h3 className="font-heading font-700 text-foreground text-base mb-4 flex items-center gap-2">
          <Icon name="PaperAirplaneIcon" size={18} className="text-primary" />Delivery Method
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[{ key: "sms", label: "Send SMS", icon: "ChatBubbleLeftRightIcon", desc: "Text message via MSG91 SMS API" }, { key: "voice", label: "Send Voice Call", icon: "PhoneArrowUpRightIcon", desc: "Automated voice call via MSG91 Voice API" }].map((method) =>
          <button key={method.key} onClick={() => setDeliveryMethod(method.key as typeof deliveryMethod)} className={`p-4 rounded-xl border-2 text-center transition-all ${deliveryMethod === method.key ? "border-primary bg-primary/5" : "border-red-100 bg-surface hover:border-primary/40"}`}>
              <Icon name={method.icon as Parameters<typeof Icon>[0]["name"]} size={20} className={deliveryMethod === method.key ? "text-primary mb-2" : "text-muted mb-2"} />
              <p className={`font-heading font-700 text-sm ${deliveryMethod === method.key ? "text-primary" : "text-foreground"}`}>{method.label}</p>
              <p className="text-xs text-muted font-body">{method.desc}</p>
              <span className="mt-1 inline-block text-[10px] bg-amber-50 text-amber-600 rounded-full font-heading font-600">MSG91</span>
            </button>
          )}
        </div>
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
          <Icon name="InformationCircleIcon" size={15} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700 font-body">MSG91 credentials are loaded from environment variables <code className="font-mono bg-amber-100 px-1 rounded">MSG91_API_KEY</code> and <code className="font-mono bg-amber-100 px-1 rounded">MSG91_SENDER_ID</code>. Configure these in your .env file before sending.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-amber-200 p-6">
        <h3 className="font-heading font-700 text-foreground text-base mb-1 flex items-center gap-2">
          <Icon name="BeakerIcon" size={18} className="text-amber-600" />Test Before Sending
        </h3>
        <p className="text-xs text-muted font-body mb-4">Send a test message to your own number before bulk delivery. This does not save to announcement history.</p>
        <div className="mb-4">
          <label className="block font-heading font-600 text-xs text-muted uppercase tracking-wide mb-1.5">Test Phone Number</label>
          <input
            type="tel"
            value={testPhone}
            onChange={(e) => {setTestPhone(e.target.value);setTestResult(null);}}
            placeholder="e.g. 9876543210 or +91 9876543210"
            className="w-full px-4 py-3 border border-amber-200 rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-amber-50" />
          
          {testPhone.trim() &&
          <p className="text-xs text-muted font-body mt-1">Will be sent to: <span className="font-heading font-600 text-foreground">+{normalizePhone(testPhone)}</span></p>
          }
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleTestSend("sms")}
            disabled={isTestDisabled || testSending !== null}
            className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-heading font-700 text-sm hover:bg-amber-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            
            {testSending === "sms" ?
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</> :

            <><Icon name="ChatBubbleLeftRightIcon" size={15} />Test SMS</>
            }
          </button>
          <button
            onClick={() => handleTestSend("voice")}
            disabled={isTestDisabled || testSending !== null}
            className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-heading font-700 text-sm hover:bg-amber-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            
            {testSending === "voice" ?
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Calling...</> :

            <><Icon name="PhoneArrowUpRightIcon" size={15} />Test Voice Call</>
            }
          </button>
        </div>
        {isTestDisabled &&
        <p className="text-xs text-muted font-body mt-2 flex items-center gap-1">
            <Icon name="InformationCircleIcon" size={13} className="text-amber-500" />
            Fill in announcement title, message, and test phone number to enable test buttons.
          </p>
        }
        {testResult &&
        <div className={`mt-3 flex items-start gap-2 p-3 rounded-xl border text-sm ${
        testResult.success ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"}`
        }>
            <Icon name={testResult.success ? "CheckCircleIcon" : "ExclamationCircleIcon"} size={16} className="flex-shrink-0 mt-0.5" />
            <span className="font-body text-xs">{testResult.message}</span>
            <button onClick={() => setTestResult(null)} className="ml-auto text-xs underline font-heading font-600 flex-shrink-0">✕</button>
          </div>
        }
      </div>

      <div className="bg-white rounded-2xl border border-red-100 p-6">
        {sendResult ?
        <div className="space-y-3">
            <div className={`flex items-start gap-3 p-4 rounded-xl border ${sendResult.success ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"}`}>
              <Icon name={sendResult.success ? "CheckCircleIcon" : "ExclamationCircleIcon"} size={22} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-heading font-700 text-sm">{sendResult.success ? "Announcement Sent!" : "Delivery Failed"}</p>
                <p className="font-body text-xs mt-0.5">{sendResult.message}</p>
              </div>
              <button onClick={() => {setSendResult(null);setPushResult(null);}} className="ml-auto text-xs underline font-heading font-600 flex-shrink-0">Dismiss</button>
            </div>
            {pushResult &&
          <div className="flex items-center gap-3 p-3 rounded-xl border bg-blue-50 border-blue-200 text-blue-700">
                <Icon name="BellIcon" size={16} className="flex-shrink-0" />
                <p className="font-body text-xs">
                  Push notification: <strong>{pushResult.sent}</strong> delivered
                  {pushResult.failed > 0 && <>, <strong>{pushResult.failed}</strong> failed</>}
                </p>
              </div>
          }
          </div> :

        <button onClick={handleSend} disabled={sending} className="w-full py-4 bg-primary text-white rounded-xl font-heading font-700 text-base hover:bg-primary-dark transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-3 shadow-primary-md hover:-translate-y-0.5">
            {sending ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</> : <><Icon name="PaperAirplaneIcon" size={18} />{deliveryMethod === "sms" ? "Send SMS" : "Send Voice Call"}{sendPush && subscriberCount && subscriberCount > 0 ? ` + Push (${subscriberCount})` : ""}</>}
          </button>
        }
      </div>
    </div>);

};

// ─── ANNOUNCEMENT HISTORY ─────────────────────────────────────────────────────────────────────────────────
const AnnouncementHistoryPanel: React.FC<{history: AnnouncementHistory[];}> = ({ history }) => {
  const statusColor = (s: AnnouncementHistory["status"]) => s === "success" ? "bg-green-50 text-green-700" : s === "pending" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600";
  const statusLabel = (s: AnnouncementHistory["status"]) => s === "success" ? "Sent" : s === "pending" ? "Pending" : "Failed";
  const methodIcon = (m?: string): Parameters<typeof Icon>[0]["name"] => m === "voice" ? "PhoneArrowUpRightIcon" : "ChatBubbleLeftRightIcon";

  return (
    <div className="bg-white rounded-2xl border border-red-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-red-100 flex items-center justify-between">
        <h3 className="font-heading font-700 text-foreground text-base flex items-center gap-2"><Icon name="ClockIcon" size={18} className="text-primary" />Announcement History</h3>
        <span className="text-xs text-muted font-body">{history.length} records</span>
      </div>
      {history.length === 0 ?
      <div className="p-10 text-center text-muted font-body text-sm">No announcements sent yet</div> :

      <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full data-table text-sm">
              <thead><tr><th className="px-5 py-3 text-left">Date</th><th className="px-5 py-3 text-left">Title</th><th className="px-5 py-3 text-left">Target</th><th className="px-5 py-3 text-left">Method</th><th className="px-5 py-3 text-left">Recipients</th><th className="px-5 py-3 text-left">Status</th></tr></thead>
              <tbody>
                {history.map((item) =>
              <tr key={item.id} className="border-b border-red-50">
                    <td className="px-5 py-3 font-body text-sm text-muted whitespace-nowrap">{item.date}</td>
                    <td className="px-5 py-3 font-heading font-600 text-sm text-foreground">{item.title}</td>
                    <td className="px-5 py-3 font-body text-sm text-muted">{item.targetType}</td>
                    <td className="px-5 py-3"><span className="flex items-center gap-1 text-xs text-muted font-heading font-600"><Icon name={methodIcon(item.deliveryMethod)} size={13} />{item.deliveryMethod === "voice" ? "Voice" : "SMS"}</span></td>
                    <td className="px-5 py-3 font-heading font-600 text-sm text-primary">{item.numberCount.toLocaleString()}</td>
                    <td className="px-5 py-3"><span className={`text-xs px-2.5 py-1 rounded-full font-heading font-600 ${statusColor(item.status)}`}>{statusLabel(item.status)}</span></td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
          <div className="md:hidden divide-y divide-red-50">
            {history.map((item) =>
          <div key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="font-heading font-700 text-sm text-foreground flex-1">{item.title}</p>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-heading font-600 flex-shrink-0 ${statusColor(item.status)}`}>{statusLabel(item.status)}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted font-body">
                  <span className="flex items-center gap-1"><Icon name="CalendarIcon" size={11} />{item.date}</span>
                  <span className="flex items-center gap-1"><Icon name="UsersIcon" size={11} />{item.numberCount.toLocaleString()} parents</span>
                  <span className="flex items-center gap-1"><Icon name={methodIcon(item.deliveryMethod)} size={11} />{item.deliveryMethod === "voice" ? "Voice" : "SMS"}</span>
                </div>
              </div>
          )}
          </div>
        </>
      }
    </div>);

};

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────────────────────────────
const DashboardStats: React.FC = () => {
  const stats = [
  { label: "Total Students", value: "—", icon: "AcademicCapIcon", color: "bg-primary" },
  { label: "Hero Images", value: "—", icon: "PhotoIcon", color: "bg-accent" },
  { label: "Gallery Images", value: "—", icon: "CameraIcon", color: "bg-primary-dark" },
  { label: "Announcements Sent", value: "—", icon: "MegaphoneIcon", color: "bg-primary" }];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) =>
      <div key={stat.label} className="bg-white rounded-2xl border border-red-100 p-5 flex items-center gap-4">
          <div className={`w-11 h-11 ${stat.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon name={stat.icon as Parameters<typeof Icon>[0]["name"]} size={20} className="text-white" />
          </div>
          <div>
            <p className="font-heading font-800 text-xl text-foreground leading-none">{stat.value}</p>
            <p className="font-body text-xs text-muted mt-0.5">{stat.label}</p>
          </div>
        </div>
      )}
    </div>);

};

// ─── ADMIN PANEL MAIN ──────────────────────────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("hero");
  const [history, setHistory] = useState<AnnouncementHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const tabs: {key: AdminTab;label: string;icon: string;mobileLabel: string;}[] = [
  { key: "hero", label: "Hero Slider", icon: "PhotoIcon", mobileLabel: "Hero" },
  { key: "gallery", label: "Gallery Manager", icon: "CameraIcon", mobileLabel: "Gallery" },
  { key: "links", label: "Gallery Links", icon: "LinkIcon", mobileLabel: "Links" },
  { key: "videos", label: "Video Manager", icon: "PlayCircleIcon", mobileLabel: "Videos" },
  { key: "students", label: "Student Upload", icon: "TableCellsIcon", mobileLabel: "Students" },
  { key: "phones", label: "Phone Upload", icon: "PhoneIcon", mobileLabel: "Phones" },
  { key: "announce", label: "Announcements", icon: "MegaphoneIcon", mobileLabel: "Announce" },
  { key: "history", label: "History", icon: "ClockIcon", mobileLabel: "History" }];


  useEffect(() => {
    if (!loggedIn) return;
    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("announcements").select("*").order("sent_at", { ascending: false }).limit(50);
        if (!error && data) {
          setHistory(data.map((row: Record<string, unknown>) => ({
            id: row.id as string,
            date: new Date(row.sent_at as string).toISOString().split("T")[0],
            title: row.title as string,
            targetType: row.target_type === "all" ? "All Parents" : row.target_type === "classes" ? `Classes: ${(row.target_classes as string[] || []).join(", ")}${(row.target_sections as string[] || []).length > 0 ? ` | Sections: ${(row.target_sections as string[]).join(", ")}` : ""}` : "Custom Numbers",
            numberCount: row.number_count as number,
            status: row.delivery_status as AnnouncementHistory["status"],
            deliveryMethod: row.delivery_method as string
          })));
        }
      } catch (err) {console.error("Failed to load announcement history", err);} finally
      {setHistoryLoading(false);}
    };
    loadHistory();
  }, [loggedIn]);

  const handleSentAnnouncement = useCallback((entry: AnnouncementHistory) => {
    setHistory((prev) => [entry, ...prev]);
  }, []);

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;

  return (
    <div className="min-h-screen bg-surface">
      <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-red-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-surface text-primary" aria-label="Toggle navigation">
              <Icon name={mobileNavOpen ? "XMarkIcon" : "Bars3Icon"} size={20} />
            </button>
            <AppLogo size={36} />
            <div className="hidden sm:block">
              <p className="font-heading font-700 text-primary text-sm leading-tight">SSVM Admin</p>
              <p className="font-body text-muted text-xs">Media Management Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/homepage" target="_blank" className="hidden sm:flex items-center gap-1.5 text-xs font-heading font-600 text-muted hover:text-primary transition-colors">
              <Icon name="ArrowTopRightOnSquareIcon" size={13} />View Site
            </Link>
            <button onClick={() => setLoggedIn(false)} className="flex items-center gap-1.5 px-4 py-2 bg-surface border border-red-100 rounded-lg font-heading font-600 text-sm text-foreground hover:bg-red-50 hover:text-primary transition-colors">
              <Icon name="ArrowRightOnRectangleIcon" size={15} /><span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="pt-16 flex min-h-screen">
        <aside className="hidden lg:flex flex-col w-60 fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-red-100 overflow-y-auto">
          <nav className="p-3 flex-1" aria-label="Admin navigation">
            {tabs.map((tab) =>
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-heading font-600 text-sm mb-1 transition-all ${activeTab === tab.key ? "bg-primary text-white shadow-primary-sm" : "text-foreground hover:bg-surface hover:text-primary"}`}>
                <Icon name={tab.icon as Parameters<typeof Icon>[0]["name"]} size={17} />{tab.label}
              </button>
            )}
          </nav>
          <div className="p-4 border-t border-red-100">
            <p className="text-xs text-muted font-body leading-relaxed">MSG91 + Supabase powered<br />Sri Saraswathi Vidhya Mandir</p>
          </div>
        </aside>

        <div className="lg:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMobileNavOpen(false)} />

        <div className={`mobile-menu fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 z-50 bg-white border-r border-red-100 lg:hidden overflow-y-auto ${mobileNavOpen ? "open" : ""}`}>
          <nav className="p-3" aria-label="Mobile admin navigation">
            {tabs.map((tab) =>
            <button key={tab.key} onClick={() => {setActiveTab(tab.key);setMobileNavOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-heading font-600 text-sm mb-1 transition-all ${activeTab === tab.key ? "bg-primary text-white" : "text-foreground hover:bg-surface hover:text-primary"}`}>
                <Icon name={tab.icon as Parameters<typeof Icon>[0]["name"]} size={17} />{tab.label}
              </button>
            )}
          </nav>
        </div>

        <main className="flex-1 lg:ml-60 p-4 sm:p-6 lg:p-8 min-w-0">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Icon name={tabs.find((t) => t.key === activeTab)?.icon as Parameters<typeof Icon>[0]["name"] ?? "HomeIcon"} size={18} className="text-primary" />
              <h1 className="font-heading font-800 text-xl text-foreground">{tabs.find((t) => t.key === activeTab)?.label}</h1>
            </div>
            <p className="text-sm text-muted font-body">
              {activeTab === "hero" && "Manage hero slider images and layout configuration"}
              {activeTab === "gallery" && "Organise gallery topics and upload photos"}
              {activeTab === "links" && "Manage Google Drive folder links for each gallery section"}
              {activeTab === "videos" && "Add and manage YouTube video links"}
              {activeTab === "students" && "Bulk upload student and parent data via CSV"}
              {activeTab === "phones" && "Upload or paste custom phone number lists"}
              {activeTab === "announce" && "Create and send SMS or voice call announcements via MSG91"}
              {activeTab === "history" && "View all past announcements and delivery status"}
            </p>
          </div>

          {activeTab === "hero" && <DashboardStats />}
          {activeTab === "hero" && <HeroSliderManager />}
          {activeTab === "gallery" && <GalleryManager />}
          {activeTab === "links" && <GalleryLinksManager />}
          {activeTab === "videos" && <VideoManager />}
          {activeTab === "students" && <StudentBulkUpload />}
          {activeTab === "phones" && <BulkPhoneUpload />}
          {activeTab === "announce" && <AnnouncementsManager onSent={handleSentAnnouncement} />}
          {activeTab === "history" && (
          historyLoading ?
          <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-white rounded-full animate-spin" />
              </div> :

          <AnnouncementHistoryPanel history={history} />)

          }

          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-red-100 z-40">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab) =>
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-4 py-2.5 min-w-[64px] transition-colors ${activeTab === tab.key ? "text-primary" : "text-muted"}`}>
                  <Icon name={tab.icon as Parameters<typeof Icon>[0]["name"]} size={18} />
                  <span className="text-[10px] font-heading font-600">{tab.mobileLabel}</span>
                  {activeTab === tab.key && <span className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-t-full" />}
                </button>
              )}
            </div>
          </div>
          <div className="lg:hidden h-16" />
        </main>
      </div>
    </div>);

}
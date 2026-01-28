import React, { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { MarketingCard } from "@/types/marketing";
import API from "@/api/api";

type Props = {
  onClose: () => void;
  onSaved: (card: MarketingCard) => void;
  card?: MarketingCard | null;
};

const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await API.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  const url = res.data?.data?.url || res.data?.url;
  if (!url) throw new Error("Upload failed");
  return url;
};

const MarketingCardModal: React.FC<Props> = ({ onClose, onSaved, card }) => {
  const [cover, setCover] = useState<File | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [gallery, setGallery] = useState<(File | null)[]>([null, null, null, null]);
  const [name, setName] = useState(card?.name || "");
  const [title, setTitle] = useState(card?.title || "");
  const [description, setDescription] = useState(card?.description || "");
  const [originalPrice, setOriginalPrice] = useState<string>(card?.originalPrice?.toString() || "");
  const [price, setPrice] = useState<string>(card?.price?.toString() || "");
  const [badges, setBadges] = useState(card?.badges || {
    trusted: false,
    verified: false,
    recommended: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (card) {
      setName(card.name);
      setTitle(card.title);
      setDescription(card.description);
      setOriginalPrice(card.originalPrice?.toString() || "");
      setPrice(card.price.toString());
      setBadges(card.badges);
    }
  }, [card]);

  const handleGalleryChange = (index: number, file: File | null) => {
    setGallery((prev) => prev.map((item, i) => (i === index ? file : item)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !title || !description || !price) {
      toast.error("Please complete all required fields.");
      return;
    }
    setLoading(true);
    try {
      let coverUrl = card?.coverImage || "";
      let logoUrl = card?.logo || "";
      let galleryUrls = card?.gallery || [];

      if (cover) coverUrl = await uploadFile(cover);
      if (logo) logoUrl = await uploadFile(logo);

      const newGalleryUrls = await Promise.all(
        gallery.map((file) => file ? uploadFile(file) : Promise.resolve(null))
      );
      const mergedGallery = Array.from(
        { length: Math.max(galleryUrls.length, newGalleryUrls.length) },
        (_, idx) => newGalleryUrls[idx] || galleryUrls[idx]
      ).filter(Boolean);

      if (cover || logo || gallery.some(f => f)) {
        toast.success("Images uploaded successfully");
      }

      const payload = {
        name,
        title,
        description,
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        price: Number(price),
        coverImage: coverUrl,
        logo: logoUrl,
        gallery: mergedGallery,
        badges,
      };

      const { data } = card
        ? await API.put<MarketingCard>(`/marketing/cards/${card._id}`, payload)
        : await API.post<MarketingCard>("/marketing/cards", payload);

      onSaved(data);
      toast.success(`Marketing card ${card ? 'updated' : 'saved'}`);
      onClose();
    } catch (err) {
      console.error(err);
      const message =
        (err as any)?.response?.data?.message ||
        (err as Error)?.message ||
        `We couldn't ${card ? 'update' : 'save'} the card. Please try again.`;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const renderUploadInput = (
    label: string,
    onChange: (file: File | null) => void,
    required?: boolean,
    previewUrl?: string
  ) => (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {previewUrl && (
        <div className="mt-2">
          <img src={previewUrl} alt="Current" className="w-20 h-20 object-cover rounded border" />
          <p className="text-xs text-gray-500 mt-1">Current image</p>
        </div>
      )}
      <div className="mt-2 flex items-center gap-3">
        <input
          type="file"
          accept="image/*"
          required={required && !previewUrl}
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
        />
        <Upload className="w-4 h-4 text-gray-400" />
      </div>
    </label>
  );

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] mt-20 overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{card ? 'Edit' : 'Add'} Marketing Card</h3>
            <p className="text-sm text-gray-500">Upload assets and details for the marketing spotlight</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderUploadInput("Cover Image", setCover, true, card?.coverImage)}
            {renderUploadInput("Logo", setLogo, true, card?.logo)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Title</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Original Price (Rs.) - Optional</span>
              <input
                type="number"
                min="0"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Discounted Price (Rs.)</span>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {gallery.map((file, idx) => (
              <label key={idx} className="block">
                <span className="text-sm font-medium text-gray-700">Gallery Image {idx + 1} (Optional)</span>
                {card?.gallery?.[idx] && (
                  <div className="mt-2">
                    <img src={card.gallery[idx]} alt={`Current ${idx + 1}`} className="w-20 h-20 object-cover rounded border" />
                    <p className="text-xs text-gray-500 mt-1">Current image</p>
                  </div>
                )}
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleGalleryChange(idx, e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {file && <span className="text-xs text-gray-500 truncate max-w-[6rem]">{file.name}</span>}
                </div>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(["trusted", "verified", "recommended"] as const).map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={badges[key]}
                  onChange={(e) => setBadges({ ...badges, [key]: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Saving..." : card ? "Update Card" : "Save Card"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarketingCardModal;


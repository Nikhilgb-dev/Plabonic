import React, { useState } from "react";
import { X, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { MarketingCard } from "@/types/marketing";
import API from "@/api/api";

type Props = {
  onClose: () => void;
  onSaved: (card: MarketingCard) => void;
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

const MarketingCardModal: React.FC<Props> = ({ onClose, onSaved }) => {
  const [cover, setCover] = useState<File | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [gallery, setGallery] = useState<(File | null)[]>([null, null, null, null]);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [badges, setBadges] = useState({
    trusted: false,
    verified: false,
    recommended: false,
  });
  const [loading, setLoading] = useState(false);

  const handleGalleryChange = (index: number, file: File | null) => {
    setGallery((prev) => prev.map((item, i) => (i === index ? file : item)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cover || !logo) {
      toast.error("Cover and logo are required.");
      return;
    }
    if (gallery.some((img) => !img)) {
      toast.error("Please add all 4 gallery images.");
      return;
    }
    if (!name || !title || !description || !price) {
      toast.error("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      const [coverUrl, logoUrl, ...galleryUrls] = await Promise.all([
        uploadFile(cover),
        uploadFile(logo),
        ...gallery.map((file) => uploadFile(file as File)),
      ]);

      const { data } = await API.post<MarketingCard>("/marketing/cards", {
        name,
        title,
        description,
        price: Number(price),
        coverImage: coverUrl,
        logo: logoUrl,
        gallery: galleryUrls,
        badges,
      });

      onSaved(data);
      toast.success("Marketing card saved");
      onClose();
    } catch (err) {
      console.error(err);
      const message =
        (err as any)?.response?.data?.message ||
        (err as Error)?.message ||
        "Failed to save card. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const renderUploadInput = (
    label: string,
    onChange: (file: File | null) => void,
    required?: boolean
  ) => (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="mt-2 flex items-center gap-3">
        <input
          type="file"
          accept="image/*"
          required={required}
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
        />
        <Upload className="w-4 h-4 text-gray-400" />
      </div>
    </label>
  );

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Add Marketing Card</h3>
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
            {renderUploadInput("Cover Image", setCover, true)}
            {renderUploadInput("Logo", setLogo, true)}
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

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Price (Rs.)</span>
            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {gallery.map((file, idx) => (
              <label key={idx} className="block">
                <span className="text-sm font-medium text-gray-700">Gallery Image {idx + 1}</span>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    required
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
              {loading ? "Saving..." : "Save Card"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarketingCardModal;

import React, { useState, useEffect } from "react";
import API from "../api/api";
import { toast } from "react-hot-toast";

interface EditCommunityModalProps {
  communityId: string;
  onClose: () => void;
  onCommunityUpdated: () => void;
}

const EditCommunityModal: React.FC<EditCommunityModalProps> = ({ communityId, onClose, onCommunityUpdated }) => {
  const [form, setForm] = useState({ name: "", description: "", rules: "", tags: "", privacy: "public" });

  useEffect(() => {
    API.get(`/communities/${communityId}`).then((res) => {
      setForm(res.data);
    });
  }, [communityId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.put(`/communities/${communityId}`, form);
      toast.success("Community updated successfully!");
      onCommunityUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "We couldn't update the community. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Community</h2>
        <form onSubmit={handleSubmit}>
            <input
                className="w-full border p-2 mb-2"
                placeholder="Community name"
                name="name"
                value={form.name}
                onChange={handleChange}
            />
            <textarea
                className="w-full border p-2 mb-2"
                placeholder="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
            />
            <textarea
                className="w-full border p-2 mb-2"
                placeholder="Rules"
                name="rules"
                value={form.rules}
                onChange={handleChange}
            />
            <input
                className="w-full border p-2 mb-2"
                placeholder="Tags (comma separated)"
                name="tags"
                value={form.tags}
                onChange={handleChange}
            />
            <select
                className="w-full border p-2 mb-2"
                name="privacy"
                value={form.privacy}
                onChange={handleChange}
            >
                <option value="public">Public</option>
                <option value="private">Private</option>
            </select>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Update Community
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCommunityModal;

import { toast } from "react-hot-toast";
import React, { useEffect, useState } from "react";
import API from "../api/api";
import { Link } from "react-router-dom";


const Communities = () => {
    const [communities, setCommunities] = useState<any[]>([]);
    const [form, setForm] = useState({ name: "", description: "", rules: "", tags: "", privacy: "public" });
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

    // Fetch all communities
    const fetchCommunities = async () => {
        const { data } = await API.get("/communities");
        setCommunities(data);
    };

    useEffect(() => {
        fetchCommunities();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setCoverImageFile(e.target.files[0]);
        }
    };

    // Create community
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("description", form.description);
        formData.append("rules", form.rules);
        formData.append("tags", form.tags);
        formData.append("privacy", form.privacy);
        if (coverImageFile) {
            formData.append("coverImage", coverImageFile);
        }

        try {
            await API.post("/communities", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setForm({ name: "", description: "", rules: "", tags: "", privacy: "public" });
            setCoverImageFile(null);
            fetchCommunities();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "We couldn't create the community. Please try again.");
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl mb-4">Communities</h2>

            {/* Create Form */}
            <form onSubmit={handleCreate} className="mb-6">
                <input
                    className="w-full border p-2 mb-2"
                    placeholder="Community name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <textarea
                    className="w-full border p-2 mb-2"
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <textarea
                    className="w-full border p-2 mb-2"
                    placeholder="Rules"
                    value={form.rules}
                    onChange={(e) => setForm({ ...form, rules: e.target.value })}
                />
                <input
                    className="w-full border p-2 mb-2"
                    placeholder="Tags (comma separated)"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
                <div className="mb-4">
                    <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700">
                        Cover Image
                    </label>
                    <input
                        type="file"
                        name="coverImage"
                        id="coverImage"
                        onChange={handleFileChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <select
                    className="w-full border p-2 mb-2"
                    value={form.privacy}
                    onChange={(e) => setForm({ ...form, privacy: e.target.value })}
                >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                </select>
                <button className="bg-blue-600 text-white w-full p-2">Create Community</button>
            </form>

            {/* List Communities */}
            {communities.map((c) => (
                <div key={c._id} className="border p-4 mb-2 rounded">
                    <img src={c.coverImage || "https://via.placeholder.com/150"} alt={c.name} className="w-full h-32 object-cover rounded-md mb-4" />
                    <h3 className="font-bold">{c.name}</h3>
                    <p>{c.description}</p>
                    <Link to={`/communities/${c._id}`} className="text-blue-600 underline">
                        View Details
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default Communities;


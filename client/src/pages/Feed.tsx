import { toast } from "react-hot-toast";
import React, { useEffect, useState } from "react";
import API from "../api/api";

const Feed = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [newPost, setNewPost] = useState("");

    // Fetch posts
    const fetchPosts = async () => {
        const { data } = await API.get("/posts");
        setPosts(data);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    // Create post
    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await API.post("/posts", { text: newPost, visibility: "public" });
            setNewPost("");
            fetchPosts();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "We couldn't create the post. Please try again.");
        }
    };

    // Like
    const handleLike = async (id: string) => {
        await API.post(`/posts/${id}/like`);
        fetchPosts();
    };

    // Comment
    const handleComment = async (id: string, text: string) => {
        await API.post(`/posts/${id}/comment`, { text });
        fetchPosts();
    };

    // Share
    const handleShare = async (id: string) => {
        await API.post(`/posts/${id}/share`, { text: "Check this out!" });
        fetchPosts();
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl mb-4">Feed</h2>

            {/* Create Post */}
            <form onSubmit={handleCreatePost} className="mb-6">
                <textarea
                    className="w-full p-2 border mb-2"
                    placeholder="What's on your mind?"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                />
                <button className="bg-blue-600 text-white p-2 w-full">Post</button>
            </form>

            {/* Posts */}
            {posts.map((post) => (
                <div key={post._id} className="border p-4 mb-4 rounded">
                    <h3 className="font-bold">{post.author?.name}</h3>
                    <p>{post.text}</p>

                    <div className="flex gap-3 mt-2">
                        <button onClick={() => handleLike(post._id)} className="text-blue-500">
                            👍 {post.likes?.length || 0}
                        </button>
                        <button onClick={() => handleShare(post._id)} className="text-green-500">
                            🔄 {post.shares?.length || 0}
                        </button>
                    </div>

                    {/* Comments */}
                    <div className="mt-3">
                        {post.comments?.map((c: any, idx: number) => (
                            <p key={idx} className="text-sm">
                                <b>{c.user?.name}: </b> {c.text}
                            </p>
                        ))}
                        <input
                            className="w-full border p-1 mt-2"
                            placeholder="Add a comment..."
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleComment(post._id, (e.target as HTMLInputElement).value);
                                    (e.target as HTMLInputElement).value = "";
                                }
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Feed;


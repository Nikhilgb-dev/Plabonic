import React, { useEffect, useState } from "react";
import API from "../api/api";
import Avatar from "../components/Avatar";

const Profile = () => {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        API.get("/users/me").then((res) => setUser(res.data));
    }, []);

    if (!user) return <p>Loading...</p>;

    return (
        <div className="p-6 max-w-lg mx-auto">
            <Avatar src={user.profilePhoto} alt="Profile" className="w-24 h-24 rounded-full mb-4" />
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p>{user.headline}</p>
            <p>{user.description}</p>

            <h3 className="mt-4 font-semibold">Skills</h3>
            <ul>{user.skills?.map((s: string, idx: number) => <li key={idx}>• {s}</li>)}</ul>
        </div>
    );
};

export default Profile;


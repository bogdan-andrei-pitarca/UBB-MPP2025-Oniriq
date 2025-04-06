"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "./add.css";

export default function AddDream() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [lucid, setLucid] = useState(false);
    const [nightmare, setNightmare] = useState(false);
    const [date, setDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split("T")[0]; // Format YYYY-MM-DD
    });
    const router = useRouter();

    const handleTagClick = (tag: string) => {
        setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
    };

    const handleSave = async () => {
        const updatedTags = [...tags];
        if (lucid && !updatedTags.includes("Lucid")) updatedTags.push("Lucid");
        if (nightmare && !updatedTags.includes("Nightmare")) updatedTags.push("Nightmare");

        const newDream = {
            title,
            content,
            tags: updatedTags,
            date, // Keep the date in YYYY-MM-DD format
        };

        try {
            const response = await fetch("/api/dreams", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newDream),
            });

            if (!response.ok) {
                throw new Error("Failed to save dream");
            }

            const createdDream = await response.json();
            console.log("Dream saved successfully:", createdDream);

            // Redirect to the journal page after saving
            router.push("/journal");
        } catch (error) {
            console.error("Error saving dream:", error);
        }
    };

    return (
        <div className="add-dream-container">
            <div className="add-dream-box">
                <div className="left-section">
                    <h1>Enter your dream!</h1>
                    <input
                        type="text"
                        className="dream-input"
                        placeholder="Add title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        data-testid="add-title-input"
                    />
                    <textarea
                        className="dream-textarea"
                        placeholder="Write dream..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        data-testid="add-content-textarea"
                    />
                    <label htmlFor="date-picker" className="date-label">Select Date:</label>
                    <input
                        type="date"
                        id="date-picker"
                        className="date-picker"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        data-testid="add-date-picker"
                    />
                </div>
                <Image src="/separator.svg" alt="Separator" width={10} height={300} className="separator-line" />
                <div className="right-section">
                    <div className="tags-container">
                        <h2>Add tags:</h2>
                        <div className="tags-list">
                            {[
                                { label: "Location", icon: "/location.png" },
                                { label: "People", icon: "/people.png" },
                                { label: "Activities", icon: "/activities.png" },
                                { label: "Creatures & Animals", icon: "/creatures-animals.png" },
                            ].map((tag) => (
                                <div
                                    key={tag.label}
                                    className={`tag ${tags.includes(tag.label) ? "selected" : ""}`}
                                    onClick={() => handleTagClick(tag.label)}
                                    data-testid={`add-tag-${tag.label}`}
                                >
                                    <Image src={tag.icon} alt={tag.label} width={24} height={24} />
                                    <span>{tag.label}</span>
                                </div>
                            ))}
                        </div>
                        <div className="checkboxes">
                            <label>
                                Lucid <input type="checkbox" checked={lucid} onChange={() => setLucid(!lucid)} data-testid="add-lucid-checkbox" />
                            </label>
                            <label>
                                Nightmare <input type="checkbox" checked={nightmare} onChange={() => setNightmare(!nightmare)} data-testid="add-nightmare-checkbox" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="buttons">
                <button className="cancel" onClick={() => router.push("/journal")} data-testid="add-cancel-button">
                    Cancel
                </button>
                <button className="save" onClick={handleSave} data-testid="add-save-button">
                    Save dream!
                </button>
            </div>
        </div>
    );
}

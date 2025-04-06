"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import "./edit.css";

export default function EditDream() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dreamId = searchParams?.get("id");

    const [isClient, setIsClient] = useState(false); // Track if the component is running on the client
    const [loading, setLoading] = useState(true); // Track loading state
    const [title, setTitle] = useState(""); // Default to an empty string
    const [content, setContent] = useState(""); // Default to an empty string
    const [tags, setTags] = useState<string[]>([]); // Default to an empty array
    const [availableTags, setAvailableTags] = useState<string[]>([
        "Location",
        "People",
        "Creatures & Animals",
        "Activities",
        "Lucid",
        "Nightmare",
    ]);
    const [isLucid, setIsLucid] = useState(false);
    const [isNightmare, setIsNightmare] = useState(false);

    // Ensure the component only renders on the client
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        const fetchDream = async () => {
            try {
                const response = await fetch(`/api/dreams?id=${dreamId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch dream");
                }
                const dreams = await response.json(); // Backend returns an array of dreams
                console.log("Fetched Dreams:", dreams);
    
                // Find the dream with the matching ID
                const dream = dreams.find((d: { id: string | null; }) => d.id === dreamId);
                if (!dream) {
                    throw new Error("Dream not found");
                }
    
                console.log("Fetched Dream:", dream);
                setTitle(dream.title || ""); // Fallback to an empty string
                setContent(dream.content || ""); // Fallback to an empty string
                setTags(dream.tags || []); // Fallback to an empty array
                setIsLucid(dream.tags?.includes("Lucid") || false);
                setIsNightmare(dream.tags?.includes("Nightmare") || false);
            } catch (error) {
                console.error("Error fetching dream:", error);
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };
    
        if (dreamId) {
            fetchDream();
        }
    }, [dreamId]);

    const handleSave = async () => {
        const updatedTags = [...tags];
        if (isLucid && !updatedTags.includes("Lucid")) updatedTags.push("Lucid");
        if (isNightmare && !updatedTags.includes("Nightmare")) updatedTags.push("Nightmare");
    
        const updatedFields = {
            ...(title && { title }),
            ...(content && { content }),
            ...(updatedTags.length > 0 && { tags: updatedTags }),
        };
    
        try {
            const response = await fetch(`/api/dreams?id=${dreamId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedFields),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.error || "Failed to update dream"); // Show pop-up error message
                return;
            }
    
            const updatedDreamFromServer = await response.json();
            console.log("Dream updated successfully:", updatedDreamFromServer);
    
            // Redirect to the journal page after saving
            router.push("/journal");
        } catch (error) {
            console.error("Error updating dream:", error);
            alert("An unexpected error occurred while saving the dream."); // Show generic error message
        }
    };

    const handleCancel = () => {
        router.push("/journal");
    };

    const handleAddTag = (tag: string) => {
        if (!tags.includes(tag)) {
            setTags((prevTags) => [...prevTags, tag]);
        }
    };

    const getTagIcon = (tag: string) => {
        switch (tag) {
            case "Location":
                return "/location.png";
            case "People":
                return "/people.png";
            case "Creatures & Animals":
                return "/creatures-animals.png";
            case "Activities":
                return "/activities.png";
            case "Lucid":
                return "/lucid.png";
            case "Nightmare":
                return "/nightmare.png";
            default:
                return "/default-tag.png";
        }
    };

    if (!isClient || loading) {
        return <div>Loading...</div>; // Show a loading indicator
    }

    return (
        <div className="edit-dream-container">
            <div className="edit-dream-box">
                <div className="left-side">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Edit title..."
                        className="dream-input"
                        data-testid="edit-title-input"
                    />
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Edit content..."
                        className="dream-textarea"
                        data-testid="edit-content-textarea"
                    />
                    <div className="checkbox-section">
                        <label>
                            <input
                                type="checkbox"
                                checked={isLucid}
                                onChange={(e) => setIsLucid(e.target.checked)}
                                data-testid="lucid-checkbox"
                            />
                            Lucid Dream
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={isNightmare}
                                onChange={(e) => setIsNightmare(e.target.checked)}
                                data-testid="nightmare-checkbox"
                            />
                            Nightmare
                        </label>
                    </div>
                </div>
                <div className="right-side">
                    <div className="tag-section">
                        <h3>Tags</h3>
                        <div className="tags-list">
                            {tags.map((tag, index) => (
                                <div key={index} className="tag" data-testid={`tag-${tag}`}>
                                    <Image
                                        src={getTagIcon(tag)}
                                        alt={tag}
                                        width={24}
                                        height={24}
                                        className="tag-icon"
                                    />
                                    <span>{tag}</span>
                                    <button
                                        className="tag-button"
                                        onClick={() =>
                                            setTags((prevTags) =>
                                                prevTags.filter((_, i) => i !== index)
                                            )
                                        }
                                        data-testid={`remove-tag-button-${tag}`}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                        <h4>Add Tags</h4>
                        <div className="tags-list">
                            {availableTags
                                .filter((tag) => !tags.includes(tag))
                                .map((tag, index) => (
                                    <div key={index} className="add-tag" data-testid={`available-tag-${tag}`}>
                                        <span>{tag}</span>
                                        <button
                                            className="add-tag-button"
                                            onClick={() => handleAddTag(tag)}
                                            data-testid={`add-tag-button-${tag}`}
                                        >
                                            <Image
                                                src="/pluscircle.svg"
                                                alt="Add"
                                                width={16}
                                                height={16}
                                                className="plus-icon"
                                            />
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="buttons">
                <div className="buttons-row">
                    <button className="cancel" onClick={handleCancel} data-testid="cancel-button">
                        Cancel
                    </button>
                    <button className="save" onClick={handleSave} data-testid="save-button">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

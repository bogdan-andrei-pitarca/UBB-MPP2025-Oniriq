"use client";
import { useDreamContext } from "../context/DreamContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import "./journal.css";

export default function Journal() {
    const { dreams, setDreams } = useDreamContext();
    const router = useRouter();

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filterTag, setFilterTag] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [filterLucid, setFilterLucid] = useState(false);
    const [filterNightmare, setFilterNightmare] = useState(false);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "dateAsc" | "dateDesc" | "">("");
    const [currentPage, setCurrentPage] = useState(1);
    const dreamsPerPage = 10;

    useEffect(() => {
        const fetchDreams = async () => {
            try {
                const params = new URLSearchParams();
    
                // Add filters to query parameters
                if (filterTag) params.append("tag", filterTag);
                if (filterDate) params.append("date", filterDate);
                if (filterLucid) params.append("lucid", filterLucid.toString());
                if (filterNightmare) params.append("nightmare", filterNightmare.toString());
                if (sortOrder) params.append("sort", sortOrder);
    
                const response = await fetch(`/api/dreams?${params.toString()}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch dreams");
                }
                const data = await response.json();
                setDreams(data);
            } catch (error) {
                console.error("Error fetching dreams:", error);
            }
        };
    
        fetchDreams();
    }, [filterTag, filterDate, filterLucid, filterNightmare, sortOrder, setDreams]);

    const handleDeleteDream = async (id: string) => {
        try {
            const response = await fetch(`/api/dreams?id=${id}`, {
                method: "DELETE",
            });
    
            if (!response.ok) {
                throw new Error("Failed to delete dream");
            }
    
            // Refetch dreams after deletion
            const updatedDreams = await fetch("/api/dreams").then((res) => res.json());
            setDreams(updatedDreams);
        } catch (error) {
            console.error("Error deleting dream:", error);
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

    // Helper function to calculate word count
    const calculateWordCount = (content: string) => {
        return content.split(/\s+/).filter((word) => word.length > 0).length;
    };

    // Add word count to each dream
    const dreamsWithWordCount = dreams.map((dream) => ({
        ...dream,
        wordCount: calculateWordCount(dream.content),
    }));

    // Sort dreams by word count
    const sortedDreams = [...dreamsWithWordCount].sort((a, b) => b.wordCount - a.wordCount);

    // Split dreams into top, middle, and bottom 33%
    const top33 = sortedDreams.slice(0, Math.ceil(sortedDreams.length / 3));
    const middle33 = sortedDreams.slice(
        Math.ceil(sortedDreams.length / 3),
        Math.ceil((2 * sortedDreams.length) / 3)
    );
    const bottom33 = sortedDreams.slice(Math.ceil((2 * sortedDreams.length) / 3));

    // Determine the category of a dream
    const getCategory = (dream: { id: string }) => {
        if (top33.some((d) => d.id === dream.id)) return "top";
        if (middle33.some((d) => d.id === dream.id)) return "middle";
        return "bottom";
    };

    const dateSortedDreams = [...dreamsWithWordCount].sort((a, b) => {
        if (sortOrder === "dateAsc") {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        else if (sortOrder === "dateDesc") {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        return 0; // No sorting if sortOrder is not dateAsc or dateDesc
    });

    const indexOfLastDream = currentPage * dreamsPerPage;
    const indexOfFirstDream = indexOfLastDream - dreamsPerPage;
    const currentDreams = dreamsWithWordCount.slice(indexOfFirstDream, indexOfLastDream);

    const handleNextPage = () => {
        if (currentPage < Math.ceil(dreams.length / dreamsPerPage)) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
        }
    };


    const generateRandomDream = () => {
        const randomTitles = ["Dream of the Ocean", "Flying Adventure", "Nightmare in the Woods", "Lucid Exploration"];
        const randomContents = [
            "This is a vivid dream about exploring the ocean.",
            "I was flying over mountains and valleys.",
            "A scary encounter in the woods.",
            "I realized I was dreaming and controlled the dream."
        ];
        const randomTags = ["Location", "People", "Creatures & Animals", "Activities", "Lucid", "Nightmare"];
        const randomDate = () => {
            const start = new Date(2023, 0, 1); // Start date: Jan 1, 2023
            const end = new Date(); // End date: today
            const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
            return new Date(randomTime).toISOString().split("T")[0]; // Format: YYYY-MM-DD
        };

        return {
            id: Math.random().toString(36).substr(2, 9), // Generate a random ID
            title: randomTitles[Math.floor(Math.random() * randomTitles.length)],
            content: randomContents[Math.floor(Math.random() * randomContents.length)],
            tags: Array.from({ length: Math.ceil(Math.random() * 3) }, () =>
                randomTags[Math.floor(Math.random() * randomTags.length)]
            ),
            date: randomDate(),
        };
    };

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         const newDream = generateRandomDream();
    //         setDreams((prevDreams) => [...prevDreams, newDream]); // Add the new dream to the list
    //     }, 10000); // Run every 30 seconds

    //     return () => clearInterval(interval); // Cleanup on component unmount
    // }, [setDreams]);

    return (
        <div className="journal-container">
            <h1 className="journal-title">Journal</h1>
            <div className="filter-container">
                <Image
                    src="/filterpng.png"
                    alt="Filter"
                    width={24}
                    height={24}
                    className="filter-icon"
                    onClick={() => setIsFilterModalOpen(true)}
                />
                <h2 className="filter-text">Filter by...</h2>
            </div>
            {isFilterModalOpen && (
                <div className="filter-modal">
                    <div className="modal-content">
                        <h2>Filter Dreams</h2>
                        <div className="filter-options">
                            <label>
                                Tag:
                                <select
                                    value={filterTag}
                                    onChange={(e) => setFilterTag(e.target.value)}
                                >
                                    <option value="">All</option>
                                    <option value="Location">Location</option>
                                    <option value="People">People</option>
                                    <option value="Creatures & Animals">
                                        Creatures & Animals
                                    </option>
                                    <option value="Activities">Activities</option>
                                    <option value="Lucid">Lucid</option>
                                    <option value="Nightmare">Nightmare</option>
                                </select>
                            </label>
                            <label>
                                Date:
                                <input
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                />
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={filterLucid}
                                    onChange={(e) => setFilterLucid(e.target.checked)}
                                />
                                Lucid
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={filterNightmare}
                                    onChange={(e) => setFilterNightmare(e.target.checked)}
                                />
                                Nightmare
                            </label>
                            <label>
                                Sort Alphabetically:
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value as "asc" | "desc" | "dateAsc" | "dateDesc" | "")}
                                >
                                    <option value="">None</option>
                                    <option value="asc">A-Z</option>
                                    <option value="desc">Z-A</option>
                                    <option value="dateAsc">Date Ascending</option>
                                    <option value="dateDesc">Date Descending</option>
                                </select>
                            </label>
                        </div>
                        <div className="modal-buttons">
                            <button onClick={() => setIsFilterModalOpen(false)}>Close</button>
                            <button onClick={() => setIsFilterModalOpen(false)}>Apply</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="main-content">
                <ul className="dream-list">
                    {currentDreams.map((dream) => {
                        const category = getCategory(dream); // Get the category of the dream
                        return (
                            <li
                                key={dream.id}
                                className={`dream-item ${category}`} // Add category as a class
                                data-testid={`dream-item-${dream.id}`}
                            >
                                <div className="dream-header">
                                    <span className="dream-date" data-testid={`dream-date-${dream.id}`}>
                                        {dream.date}
                                    </span>
                                </div>
                                <h2 data-testid={`dream-title-${dream.id}`}>{dream.title}</h2>
                                <p data-testid={`dream-content-${dream.id}`}>{dream.content}</p>
                                <p className="word-count" data-testid={`dream-word-count-${dream.id}`}>
                                    Word Count: {dream.wordCount}
                                </p>
                                <div className="dream-tags">
                                    {dream.tags.map((tag, index) => (
                                        <div key={index} className="tag" data-testid={`dream-tag-${dream.id}-${tag}`}>
                                            <Image
                                                src={getTagIcon(tag)}
                                                alt={tag}
                                                width={24}
                                                height={24}
                                                className="tag-icon"
                                            />
                                            <span>{tag}</span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    className="dream-action edit"
                                    onClick={() => router.push(`/edit?id=${dream.id}`)}
                                    data-testid={`edit-button-${dream.id}`}
                                >
                                    Edit
                                </button>
                                <button
                                    className="dream-action delete"
                                    onClick={() => handleDeleteDream(dream.id)}
                                    data-testid={`delete-button-${dream.id}`}
                                >
                                    Delete
                                </button>
                            </li>
                        );
                    })}
                </ul>
                <Image
                    src="/semimoon.svg"
                    alt="Moon"
                    width={300}
                    height={500}
                    className="moon-icon"
                />
            </div>
            <div className="pagination">
                <button
                    className="pagination-arrow"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    data-testid="previous-page-button"
                >
                    &larr; Previous
                </button>
                <span className="pagination-info">
                    Page {currentPage} of {Math.ceil(dreams.length / dreamsPerPage)}
                </span>
                <button
                    className="pagination-arrow"
                    onClick={handleNextPage}
                    disabled={currentPage === Math.ceil(dreams.length / dreamsPerPage)}
                    data-testid="next-page-button"
                >
                    Next &rarr;
                </button>
            </div>
            <button
                className="add-dream-button"
                onClick={() => router.push("/add")}
                data-testid="add-dream-button"
            >
                Add Dream
            </button>
        </div>
    );
}

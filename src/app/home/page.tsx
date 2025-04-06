"use client";
import "./home.css";
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();

    const handleClick = () => {
        // Navigate to another page, e.g., '/journal'
        router.push('/journal');
    };

    return (
        <div className="home-container">
            <h1 className="welcome-text">Welcome!</h1>

            <div className="moon-container">
                <div className="moon">
                    <span className="moon-text">Oniriq</span>
                </div>
            </div>

            <button className="start-button" onClick={handleClick}>Start dreaming...</button>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { generateImage } from "./generation";

export default function Home() {
  const router = useRouter();
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there's a story in localStorage
    const savedStory = localStorage.getItem('generatedStory');
    if (savedStory) {
      setStory(savedStory);
      localStorage.removeItem('generatedStory'); // Clear the story from storage
    } else {
      // If no story, redirect to create page
      router.push('/create');
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return <div className="max-w-4xl mx-auto p-8">Loading...</div>;
  }

  if (!story) {
    return null; // This prevents flash of content before redirect
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <button 
        onClick={() => router.push('/create')}
        className="mb-8 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Create New Story
      </button>
      <BookComponent storyString={story} />
    </div>
  );
}

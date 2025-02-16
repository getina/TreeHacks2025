"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateBilingualStory, generateImage } from "../generation";

export default function CreateStory() {
  const router = useRouter();
  const [storyLoading, setStoryLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [storyParams, setStoryParams] = useState({
    targetLanguage: 'Chinese',
    vocabLevel: 'Intermediate',
    numPages: '5',
    ageGroup: '18-24',
    theme: 'Sci-fi',
    vocabPerPage: '2'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStoryLoading(true);
    setImageLoading(true);
    
    try {
      const story = await generateBilingualStory(storyParams);
      // Store the story in localStorage or you could use a state management solution
      localStorage.setItem('generatedStory', story);
      // Redirect to the main page to display the story
      router.push('/');
    } catch (error) {
      console.error('Error generating story:', error);
      setStoryLoading(false);
      setImageLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStoryParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <form onSubmit={handleSubmit} className="w-full max-w-lg mb-8 space-y-4">
        <div className="flex flex-col space-y-2">
          <p className="font-medium text-lg mb-4">I want to create a {storyParams.theme} story</p>
          <label className="font-medium">Theme:
            <select
              name="theme"
              value={storyParams.theme}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="Adventure">Adventure</option>
              <option value="Sci-fi">Sci-fi</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Mystery">Mystery</option>
              <option value="Romance">Romance</option>
              <option value="Historical">Historical</option>
              <option value="Comedy">Comedy</option>
              <option value="Drama">Drama</option>
            </select>
          </label>
          
          {/* ... rest of the form fields ... */}
          
          <button 
            type="submit" 
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            disabled={storyLoading || imageLoading}
          >
            {storyLoading || imageLoading ? 'Generating...' : 'Generate Story'}
          </button>
        </div>
      </form>
    </div>
  );
}
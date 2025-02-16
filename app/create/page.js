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
    ageGroup: '4-6',
    theme: 'Sci-fi',
    vocabPerPage: '2'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStoryLoading(true);
    setImageLoading(true);
    
    try {
      const url = await generateImage();
      const story = await generateBilingualStory(storyParams);
      
      // Store the generated content
      localStorage.setItem('generatedStory', story);
      localStorage.setItem('initialImage', url);
      
      // Redirect to the story view
      router.push('/story');
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
    <div className="min-h-screen flex items-center justify-center">
       <div className="max-w-4xl p-8">
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
          
          <p className="font-medium text-lg mb-4">in {storyParams.targetLanguage}</p>
          <label className="font-medium">Target Language:
            <select
              name="targetLanguage"
              value={storyParams.targetLanguage}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="Chinese">Chinese</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Russian">Russian</option>
            </select>
          </label>
          
          <p className="font-medium text-lg mb-4">that is at the {storyParams.vocabLevel} level.</p>
          <label className="font-medium">Vocabulary Level:
            <select
              name="vocabLevel"
              value={storyParams.vocabLevel}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </label>
          
          <p className="font-medium text-lg mb-4">that is for ages {storyParams.ageGroup}</p>
          <label className="font-medium">Age Group:
            <select
              name="ageGroup"
              value={storyParams.ageGroup}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="4-6">4-6</option>
              <option value="7-9">7-9</option>
              <option value="10+">10+</option>
            </select>
          </label>

          <label className="font-medium">Vocabulary Words Per Page:
            <select
              name="vocabPerPage"
              value={storyParams.vocabPerPage}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </label>
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          disabled={storyLoading || imageLoading}
        >
          {storyLoading || imageLoading ? 'Generating...' : 'Generate Story'}
        </button>
      </form>
    </div>
    </div>
  );
} 
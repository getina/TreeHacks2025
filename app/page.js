"use client";

import {
  generateBilingualStory,
  generateImage,
  makeOpenAIRequest,
} from "./generation";
import { useEffect, useState } from "react";

import Image from "next/image";

export default function Home() {
  const [imageUrl, setImageUrl] = useState(null);
<<<<<<< Updated upstream
  const [storyLoading, setStoryLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [story, setStory] = useState("");

  const exampleArgs = {
    targetLanguage: "Chinese",
    vocabLevel: "Intermediate",
    numPages: "10",
    ageGroup: "18-24",
    theme: "Sci-fi",
    vocabPerPage: "2",
  };

  useEffect(() => {
    const fetchImage = async () => {
      const url = await generateImage();
      setImageUrl(url);
      setImageLoading(false); // Set loading to false once the image is fetched
    };

    fetchImage();
    const fetchStory = async () => {
      const story = await generateBilingualStory(exampleArgs);
      console.log("story", story);
      setStory(story);
      setStoryLoading(false); // Set loading to false once the image is fetched
    };
    fetchStory();
  }, []);
=======
  const [storyLoading, setStoryLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [story, setStory] = useState('');
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
    
    // Generate new story and image
    const url = await generateImage();
    setImageUrl(url);
    setImageLoading(false);
    
    const story = await generateBilingualStory(storyParams);
    setStory(story);
    setStoryLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStoryParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Replace the useEffect with a form component
  const StoryForm = () => (
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
  );
>>>>>>> Stashed changes

  const parseStory = (storyString) => {
    // Split the story into pages using the page marker and triple dash
    const pageBlocks = storyString.split("---").filter((block) => block.trim());
    const pages = [];

    for (const block of pageBlocks) {
      // Extract page number
      const pageMatch = block.match(/\*\*Page (\d+)\*\*/);
      if (!pageMatch) continue;

      const pageNumber = pageMatch[1];

      // Extract story text
      const storyTextMatch = block.match(
        /\*\*Story Text\*\*: (.*?)(?=\*\*Vocabulary List\*\*)/s
      );
      const storyText = storyTextMatch ? storyTextMatch[1].trim() : "";

      // Extract vocabulary list
      const vocabListMatch = block.match(
        /\*\*Vocabulary List\*\*:(.*?)(?=\*\*Picture Description\*\*)/s
      );
      const vocabListText = vocabListMatch ? vocabListMatch[1].trim() : "";

      // Parse vocabulary items
      const vocabularyList = vocabListText
        .split("\n")
        .filter((line) => line.trim())
        .map((item) => {
          // Remove the number and dot at the start if present
          const cleanItem = item.replace(/^\d+\.\s*/, "");

          // Extract word, pinyin, and translation
          const match = cleanItem.match(/([^(]+)\s*\(([^)]+)\)\s*-\s*(.+)/);
          if (!match) return null;

          const [, word, pinyin, translation] = match;
          return {
            word: word.trim(),
            pinyin: pinyin.trim(),
            translation: translation.trim(),
          };
        })
        .filter((item) => item !== null); // Remove any failed parses

      // Extract picture description
      const pictureDescriptionMatch = block.match(
        /\*\*Picture Description\*\*: (.*?)(?=---|$)/s
      );
      const pictureDescription = pictureDescriptionMatch
        ? pictureDescriptionMatch[1].trim()
        : "";

      pages.push({
        pageNumber,
        storyText,
        vocabularyList,
        pictureDescription,
      });
    }

    return pages;
  };

  // Page component to display the parsed content
  const PageComponent = ({ pageData }) => {
    const [pageImage, setPageImage] = useState(null);
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
      const fetchPageImage = async () => {
        setImageLoading(true);
        const url = await generateImage(pageData.pictureDescription);
        setPageImage(url);
        setImageLoading(false);
      };

      fetchPageImage();
    }, [pageData.pictureDescription]);

    return (
      <div className="page mb-12 border-b pb-8">
        <h2 className="text-2xl font-bold mb-4">Page {pageData.pageNumber}</h2>
        <div className="flex gap-8">
          {/* Left side - Image */}
          <div className="w-1/2 flex-shrink-0">
            {imageLoading ? (
              <div className="w-full aspect-square bg-gray-200 animate-pulse flex items-center justify-center rounded-lg">
                Loading image...
              </div>
            ) : (
              pageImage && (
                <Image
                  src={pageImage}
                  alt={`Illustration for page ${pageData.pageNumber}`}
                  width={500}
                  height={500}
                  className="rounded-lg w-full h-auto"
                />
              )
            )}
          </div>

          {/* Right side - Content */}
          <div className="w-1/2">
            <div className="prose">
              <p className="mb-4">{pageData.storyText}</p>

              <div className="vocabulary mb-4">
                <h3 className="font-bold">Vocabulary List:</h3>
                <ul>
                  {pageData.vocabularyList.map((entry, index) => (
                    <li key={index}>
                      <strong>{entry.word}</strong> [{entry.pinyin}] -{" "}
                      {entry.translation}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="picture-description">
                <h3 className="font-bold">Picture Description:</h3>
                <p className="mb-4">{pageData.pictureDescription}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Component that handles rendering all pages
  const BookComponent = ({ storyString }) => {
    const pages = parseStory(storyString); // Parse the story string

    console.log("pages from Book", pages);
    return (
      <div className="book">
        {pages.map((pageData) => (
          <PageComponent key={pageData.pageNumber} pageData={pageData} />
        ))}
      </div>
    );
  };

  return (
<<<<<<< Updated upstream
    <div className="max-w-4xl mx-auto p-8">
      {!storyLoading && <BookComponent storyString={story} />}
      {storyLoading && <p>Loading story...</p>}
=======
    <div className="flex flex-col items-center w-full min-h-screen p-8">
      <StoryForm />
      
      {/* Show loading states or content */}
      {(storyLoading || imageLoading) && (
        <p className="text-center">Generating your story...</p>
      )}
      
      {(!storyLoading && !imageLoading && story) && (
        <div className="flex justify-between items-start w-full">
          <div className="flex-shrink-0">
            <Image src={imageUrl} alt="Generated" width={500} height={500} />
          </div>
          <BookComponent storyString={story} />
        </div>
      )}
>>>>>>> Stashed changes
    </div>
  );
}

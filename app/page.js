"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { generateImage, makeOpenAIRequest, generateBilingualStory } from "./generation";


export default function Home() {
  const [imageUrl, setImageUrl] = useState(null);
  const [storyLoading, setStoryLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [story, setStory] = useState('')

  const exampleArgs = {
    targetLanguage: 'Chinese',
    vocabLevel: 'Intermediate',
    numPages: '10',
    ageGroup: '18-24',
    theme: 'Sci-fi',
    vocabPerPage: '2'
  }

  useEffect(() => {
    const fetchImage = async () => {
      const url = await generateImage();
      setImageUrl(url);
      setImageLoading(false); // Set loading to false once the image is fetched
    };
    
    fetchImage();
    const fetchStory = async () => {
      const story = await generateBilingualStory(exampleArgs)
      console.log('story', story)
      setStory(story)
      setStoryLoading(false); // Set loading to false once the image is fetched
    }
    fetchStory()
    
  }, []);

  const parseStory = (storyString) => {
    // Split the story into pages using the page marker and triple dash
    const pageBlocks = storyString.split('---').filter(block => block.trim());
    const pages = [];
  
    for (const block of pageBlocks) {
      // Extract page number
      const pageMatch = block.match(/\*\*Page (\d+)\*\*/);
      if (!pageMatch) continue;
      
      const pageNumber = pageMatch[1];
  
      // Extract story text
      const storyTextMatch = block.match(/\*\*Story Text\*\*: (.*?)(?=\*\*Vocabulary List\*\*)/s);
      const storyText = storyTextMatch ? storyTextMatch[1].trim() : '';
  
      // Extract vocabulary list
      const vocabListMatch = block.match(/\*\*Vocabulary List\*\*:(.*?)(?=\*\*Picture Description\*\*)/s);
      const vocabListText = vocabListMatch ? vocabListMatch[1].trim() : '';
      
      // Parse vocabulary items
      const vocabularyList = vocabListText.split('\n')
        .filter(line => line.trim())
        .map(item => {
          // Remove the number and dot at the start if present
          const cleanItem = item.replace(/^\d+\.\s*/, '');
          
          // Extract word, pinyin, and translation
          const match = cleanItem.match(/([^(]+)\s*\(([^)]+)\)\s*-\s*(.+)/);
          if (!match) return null;
  
          const [, word, pinyin, translation] = match;
          return {
            word: word.trim(),
            pinyin: pinyin.trim(),
            translation: translation.trim()
          };
        })
        .filter(item => item !== null); // Remove any failed parses
  
      // Extract picture description
      const pictureDescriptionMatch = block.match(/\*\*Picture Description\*\*: (.*?)(?=---|$)/s);
      const pictureDescription = pictureDescriptionMatch ? pictureDescriptionMatch[1].trim() : '';
  
      pages.push({
        pageNumber,
        storyText,
        vocabularyList,
        pictureDescription
      });
    }
  
    return pages;
  };
  

  // Page component to display the parsed content
    const PageComponent = ({ pageData }) => {
      console.log('pages from page', pageData)
      return (
      <div className="page">
        <h2>Page {pageData.pageNumber}</h2>
        <p>{pageData.storyText}</p>
        <div className="vocabulary">
          <h3>Vocabulary List:</h3>
          <ul>
            {pageData.vocabularyList.map((entry, index) => (
              <li key={index}>
                <strong>{entry.word}</strong> [{entry.pinyin}] - {entry.translation}
              </li>
            ))}
          </ul>
        </div>
        <div className="picture-description">
          <h3>Picture Description:</h3>
          <p>{pageData.pictureDescription}</p>
        </div>
      </div>
    )}

  // Component that handles rendering all pages
  const BookComponent = ({ storyString }) => {
    const pages = parseStory(storyString); // Parse the story string

    console.log('pages from Book', pages)
    return (
      <div className="book">
        {pages.map((pageData) => (
          <PageComponent key={pageData.pageNumber} pageData={pageData} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex justify-between items-start w-full min-h-screen p-8">
      {/* Conditionally render the image and text when loading is false */}
      {(!storyLoading && !imageLoading) && (
        <>
          <div className="flex-shrink-0">
            <Image src={imageUrl} alt="Generated" width={500} height={500} />
          </div>
          {/* <p>{story}</p> */}
          <BookComponent storyString={story} />

        </>
      )}
      {imageLoading && <p>Loading image...</p>} {/* Optionally show loading text */}
    </div>
  );
}

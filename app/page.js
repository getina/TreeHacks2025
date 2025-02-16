"use client";

import {
  generateBilingualStory,
  generateImage,
  makeOpenAIRequest,
} from "./generation";
import { useEffect, useState } from "react";

import Image from "next/image";

export default function Home() {
  const [storyLoading, setStoryLoading] = useState(true);
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
    const fetchStory = async () => {
      const story = await generateBilingualStory(exampleArgs);
      console.log("story", story);
      setStory(story);
      setStoryLoading(false);
    };
    fetchStory();
  }, []);

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

  const generateImagesInBatch = async (pages, onProgress) => {
    const images = {};
    let completed = 0;

    for (const page of pages) {
      try {
        const imageUrl = await generateImage(page.pictureDescription);
        if (imageUrl) {
          images[page.pageNumber] = imageUrl;
          completed++;
          onProgress(completed, pages.length);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(
          `Error generating image for page ${page.pageNumber}:`,
          error
        );
      }
    }

    return images;
  };

  // Page component to display the parsed content
  const PageComponent = ({ pageData, cachedImage }) => {
    return (
      <div className="page mb-12 border-b pb-8">
        <h2 className="text-2xl font-bold mb-4">Page {pageData.pageNumber}</h2>
        <div className="flex gap-8">
          <div className="w-1/2 flex-shrink-0">
            <div className="relative aspect-square">
              {!cachedImage ? (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
                  No image available
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <Image
                    src={cachedImage}
                    alt={`Illustration for page ${pageData.pageNumber}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="rounded-lg object-cover"
                    priority
                    unoptimized
                  />
                </div>
              )}
            </div>
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
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [pageImages, setPageImages] = useState({});
    const [isGeneratingImages, setIsGeneratingImages] = useState(true);
    const pages = parseStory(storyString);

    useEffect(() => {
      let mounted = true;

      const loadImages = async () => {
        setIsGeneratingImages(true);
        try {
          // Generate images one by one, updating state as each completes
          for (const page of pages) {
            if (!mounted) break;

            // Only generate if we don't already have this image
            if (!pageImages[page.pageNumber]) {
              try {
                const imageUrl = await generateImage(page.pictureDescription);
                if (imageUrl && mounted) {
                  setPageImages((prev) => ({
                    ...prev,
                    [page.pageNumber]: imageUrl,
                  }));
                }
                // Remove the artificial delay - the API already has rate limiting
                // await new Promise(resolve => setTimeout(resolve, 1000));
              } catch (error) {
                console.error(
                  `Error generating image for page ${page.pageNumber}:`,
                  error
                );
              }
            }
          }
        } finally {
          if (mounted) {
            setIsGeneratingImages(false);
          }
        }
      };

      loadImages();

      return () => {
        mounted = false;
      };
    }, [pages, pageImages]);

    const handleNextPage = () => {
      if (currentPageIndex < pages.length - 1) {
        setCurrentPageIndex(currentPageIndex + 1);
      }
    };

    const handlePreviousPage = () => {
      if (currentPageIndex > 0) {
        setCurrentPageIndex(currentPageIndex - 1);
      }
    };

    return (
      <div className="book">
        <PageComponent
          pageData={pages[currentPageIndex]}
          cachedImage={pageImages[pages[currentPageIndex].pageNumber]}
        />

        <div className="flex justify-between mt-8">
          <button
            onClick={handlePreviousPage}
            disabled={currentPageIndex === 0}
            className={`px-4 py-2 rounded-lg ${
              currentPageIndex === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            Previous Page
          </button>

          <span className="self-center">
            Page {currentPageIndex + 1} of {pages.length}
            {isGeneratingImages && " (Generating images...)"}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPageIndex === pages.length - 1}
            className={`px-4 py-2 rounded-lg ${
              currentPageIndex === pages.length - 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            Next Page
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      {!storyLoading && <BookComponent storyString={story} />}
      {storyLoading && <p>Loading story...</p>}
    </div>
  );
}

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
    const [imageLoading, setImageLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (!pageData?.pictureDescription || !mounted) {
        return;
      }

      const fetchPageImage = async () => {
        setImageLoading(true);
        try {
          const url = await generateImage(pageData.pictureDescription);
          if (url) {
            setPageImage(url);
          }
        } catch (error) {
          console.error("Error fetching image:", error);
        } finally {
          setImageLoading(false);
        }
      };

      fetchPageImage();
    }, [pageData?.pictureDescription, mounted]);

    return (
      <div className="page mb-12 border-b pb-8">
        <h2 className="text-2xl font-bold mb-4">Page {pageData.pageNumber}</h2>
        <div className="flex gap-8">
          <div className="w-1/2 flex-shrink-0">
            <div className="relative aspect-square">
              {mounted && (
                <>
                  {imageLoading && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center rounded-lg">
                      Loading image...
                    </div>
                  )}
                  {!imageLoading && !pageImage && (
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
                      No image available
                    </div>
                  )}
                  {pageImage && (
                    <div className="relative w-full h-full">
                      <Image
                        src={pageImage}
                        alt={`Illustration for page ${pageData.pageNumber}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="rounded-lg object-cover"
                        priority
                        unoptimized
                      />
                    </div>
                  )}
                </>
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
    <div className="max-w-4xl mx-auto p-8">
      {!storyLoading && <BookComponent storyString={story} />}
      {storyLoading && <p>Loading story...</p>}
    </div>
  );
}

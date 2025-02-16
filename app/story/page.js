"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { generateImage } from "../generation";

export default function StoryPage() {
  const router = useRouter();
  const [story, setStory] = useState('');
  const [initialImage, setInitialImage] = useState('');

  useEffect(() => {
    const savedStory = localStorage.getItem('generatedStory');
    const savedImage = localStorage.getItem('initialImage');
    
    if (savedStory) {
      setStory(savedStory);
      setInitialImage(savedImage);
      localStorage.removeItem('generatedStory');
      localStorage.removeItem('initialImage');
    } else {
      router.push('/create');
    }
  }, [router]);

  const parseStory = (storyString) => {
    const pageBlocks = storyString.split("---").filter((block) => block.trim());
    const pages = [];

    for (const block of pageBlocks) {
      const pageMatch = block.match(/\*\*Page (\d+)\*\*/);
      if (!pageMatch) continue;

      const pageNumber = pageMatch[1];

      const storyTextMatch = block.match(
        /\*\*Story Text\*\*: (.*?)(?=\*\*Vocabulary List\*\*)/s
      );
      const storyText = storyTextMatch ? storyTextMatch[1].trim() : "";

      const vocabListMatch = block.match(
        /\*\*Vocabulary List\*\*:(.*?)(?=\*\*Picture Description\*\*)/s
      );
      const vocabListText = vocabListMatch ? vocabListMatch[1].trim() : "";

      const vocabularyList = vocabListText
        .split("\n")
        .filter((line) => line.trim())
        .map((item) => {
          const cleanItem = item.replace(/^\d+\.\s*/, "");
          const match = cleanItem.match(/([^(]+)\s*\(([^)]+)\)\s*-\s*(.+)/);
          if (!match) return null;
          const [, word, pinyin, translation] = match;
          return {
            word: word.trim(),
            pinyin: pinyin.trim(),
            translation: translation.trim(),
          };
        })
        .filter((item) => item !== null);

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

  const BookComponent = ({ storyString }) => {
    const pages = parseStory(storyString);
    return (
      <div className="book">
        {pages.map((pageData) => (
          <PageComponent key={pageData.pageNumber} pageData={pageData} />
        ))}
      </div>
    );
  };

  if (!story) {
    return null;
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